import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { runAgentOnWorkspace } from './agent-runner.js';
import { assertChangeSurface, detectWrongLayer } from '../../core/guard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_FIXTURE = path.join(ROOT, 'benchmarks', 'fixtures', 'ecommerce-core');

function copyDirSync(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        copyDirSync(srcPath, dstPath);
      }
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

/**
 * Runs a complete agentic evaluation on an isolated workspace fixture.
 */
export async function evaluateAgentTask({
  task,
  arm = 'graybeard',
  fixtureDir = DEFAULT_FIXTURE,
  model = null,
  apiKey = null,
  keepTemp = false
}) {
  const taskId = task.id || 'task-test';
  const goal = (task.goal || task.text || '').toLowerCase();
  const tempDir = path.join(os.tmpdir(), `gb-eval-${taskId}-${arm}-${Date.now()}`);

  try {
    // 1. Create isolated temporary workspace
    copyDirSync(fixtureDir, tempDir);

    // Initialize clean git repository in tempDir
    try {
      execSync('git -c core.autocrlf=false init && git config user.email "eval@graybeard.local" && git config user.name "Eval Agent" && git -c core.autocrlf=false add . && git commit -m "initial commit" --quiet', {
        cwd: tempDir,
        stdio: 'ignore',
        windowsHide: true
      });
    } catch { /* ignore git init if unavailable */ }

    // 2. Execute Real Agent on the workspace
    const agentResult = await runAgentOnWorkspace({
      arm,
      task,
      workspaceDir: tempDir,
      model,
      apiKey
    });

    // 3. Inspect REAL Git Diff
    let modifiedFiles = [];
    let insertions = 0;
    let deletions = 0;

    try {
      const diffNames = execSync('git diff --name-only', { cwd: tempDir, encoding: 'utf8' }).trim();
      modifiedFiles = diffNames ? diffNames.split(/\r?\n/).map(f => f.trim()) : [];
      const diffStat = execSync('git diff --stat', { cwd: tempDir, encoding: 'utf8' }).trim();
      const match = diffStat.match(/(\d+) insertion.*?(?:(\d+) deletion)?/);
      if (match) {
        insertions = parseInt(match[1] || '0', 10);
        deletions = parseInt(match[2] || '0', 10);
      }
    } catch {
      modifiedFiles = agentResult.plannedFiles || [];
    }

    // 4. Select relevant test files for this specific task
    let testFilesToRun = ['tests/date.test.js'];
    if (goal.includes('duplicate') || goal.includes('race') || taskId.includes('race') || taskId.includes('high')) {
      testFilesToRun = ['tests/concurrency.test.js'];
    } else if (goal.includes('sleep') || goal.includes('500ms') || goal.includes('worker') || goal.includes('legacy')) {
      testFilesToRun = ['tests/worker.test.js'];
    } else if (goal.includes('auth') || goal.includes('tenant') || goal.includes('permission')) {
      testFilesToRun = ['tests/auth.test.js'];
    }

    // 5. Run REAL Test Suite Oracles inside isolated workspace
    let testsPassed = true;
    let testOutput = '';

    try {
      const testArgs = testFilesToRun.join(' ');
      testOutput = execSync(`node --test ${testArgs}`, {
        cwd: tempDir,
        encoding: 'utf8',
        stdio: 'pipe',
        windowsHide: true
      });
      testsPassed = true;
    } catch (err) {
      testOutput = String(err.stdout || '') + String(err.stderr || '');
      testsPassed = false;
    }

    // 6. Evaluate Invariants & Layer Boundaries
    let wrongLayer = false;
    let boundaryViolation = false;

    if (goal.includes('duplicate') || goal.includes('race')) {
      // Duplication / Concurrency tasks require backend charge.js modification, NOT UI button debounce
      const touchedUi = modifiedFiles.some(f => f.includes('CheckoutButton'));
      const touchedBackend = modifiedFiles.some(f => f.includes('charge.js'));
      if (touchedUi && !touchedBackend) {
        wrongLayer = true;
      }
    }

    if (agentResult.plannedFiles && agentResult.plannedFiles.length > 0) {
      const boundaryCheck = assertChangeSurface({
        planned: agentResult.plannedFiles,
        actualFiles: modifiedFiles,
        root: tempDir
      });
      boundaryViolation = !boundaryCheck.passed;
    }

    const success = testsPassed && !wrongLayer && !boundaryViolation;
    const regression = !testsPassed || wrongLayer;
    const wastedWork = success ? 0 : (insertions + deletions + (wrongLayer ? 50 : 20));

    return {
      arm,
      task: taskId,
      category: task.category || 'medium',
      risk: task.risk || 'MEDIUM',
      success,
      regression,
      wrongLayer,
      boundaryViolation,
      hardStopped: agentResult.plannedFiles.length === 0,
      tokens: agentResult.tokens,
      filesChanged: modifiedFiles.length,
      locAdded: insertions,
      locDeleted: deletions,
      wastedWork,
      cost: Number((agentResult.tokens * 0.000002).toFixed(4)),
      latencyMs: agentResult.durationMs
    };
  } finally {
    // 7. Clean up temporary directory
    if (!keepTemp) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch { /* ignore cleanup lock */ }
    }
  }
}
