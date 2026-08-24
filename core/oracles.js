import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

function exists(p) { return fs.existsSync(p); }

export function detectOracles(root = process.cwd()) {
  const oracles = [];

  // Node.js / TypeScript / JavaScript
  const pkgPath = path.join(root, 'package.json');
  if (exists(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const scripts = pkg.scripts || {};
      if (scripts.test) oracles.push({ type: 'test', runner: 'npm', command: 'npm test', description: 'Node test script' });
      if (scripts.check) oracles.push({ type: 'integrity', runner: 'npm', command: 'npm run check', description: 'Project integrity check' });
      if (scripts.typecheck) oracles.push({ type: 'typecheck', runner: 'npm', command: 'npm run typecheck', description: 'TypeScript typecheck script' });
      if (scripts.lint) oracles.push({ type: 'lint', runner: 'npm', command: 'npm run lint', description: 'Linter script' });
    } catch { /* ignore malformed package.json */ }

    if (exists(path.join(root, 'tsconfig.json')) && !oracles.some(o => o.type === 'typecheck')) {
      oracles.push({ type: 'typecheck', runner: 'tsc', command: 'npx tsc --noEmit', description: 'TypeScript Compiler Check' });
    }
  }

  // Rust
  if (exists(path.join(root, 'Cargo.toml'))) {
    oracles.push({ type: 'typecheck', runner: 'cargo', command: 'cargo check', description: 'Rust Cargo Check' });
    oracles.push({ type: 'test', runner: 'cargo', command: 'cargo test', description: 'Rust Cargo Test Suite' });
  }

  // Python
  if (exists(path.join(root, 'pyproject.toml')) || exists(path.join(root, 'pytest.ini')) || exists(path.join(root, 'setup.py'))) {
    oracles.push({ type: 'test', runner: 'pytest', command: 'pytest', description: 'Python Pytest Suite' });
    if (exists(path.join(root, 'mypy.ini')) || exists(path.join(root, 'pyproject.toml'))) {
      oracles.push({ type: 'typecheck', runner: 'mypy', command: 'mypy .', description: 'Python MyPy Type Checker' });
    }
  }

  // Go
  if (exists(path.join(root, 'go.mod'))) {
    oracles.push({ type: 'test', runner: 'go', command: 'go test ./...', description: 'Go Test Suite' });
    oracles.push({ type: 'lint', runner: 'go', command: 'go vet ./...', description: 'Go Vet Static Analysis' });
  }

  return oracles;
}

export function runOracle(oracle, { cwd = process.cwd(), timeoutMs = 30000 } = {}) {
  const start = Date.now();
  try {
    const output = execSync(oracle.command, {
      cwd,
      timeout: timeoutMs,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return {
      command: oracle.command,
      type: oracle.type,
      passed: true,
      exitCode: 0,
      output: String(output || '').trim(),
      durationMs: Date.now() - start
    };
  } catch (err) {
    return {
      command: oracle.command,
      type: oracle.type,
      passed: false,
      exitCode: err.status ?? 1,
      output: (String(err.stdout || '') + '\n' + String(err.stderr || '')).trim(),
      error: err.message,
      durationMs: Date.now() - start
    };
  }
}

export function verifyWorkspace(root = process.cwd(), { types = ['test', 'typecheck', 'integrity'] } = {}) {
  const oracles = detectOracles(root).filter(o => types.includes(o.type));
  const results = [];
  for (const oracle of oracles) {
    results.push(runOracle(oracle, { cwd: root }));
  }
  const allPassed = results.length > 0 && results.every(r => r.passed);
  return {
    verified: allPassed,
    totalOracles: results.length,
    passedCount: results.filter(r => r.passed).length,
    failedCount: results.filter(r => !r.passed).length,
    results
  };
}
