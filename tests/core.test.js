import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  calculateRisk,
  riskScore,
  shouldInvestigate,
  RISK_LEVELS,
  classifyTask,
  selectSkills,
  shouldStop,
  createLedger,
  compactLedger,
  decisionSummary,
  decisionKey,
  skillCost,
  inferTaskType,
  normalizeTaskType,
  isPresentationIntent,
  SKILL_DEFS,
  SKILL_ORDER,
  PRIMITIVES
} from '../core/index.js';

import { routeTask } from '../core/router.js';
import { createSession, applyObservation, finalizeDecision, transitionStage, verifySession } from '../core/engine.js';
import { inspectRepository, findRelevantFiles, findTests, findCallers, getDiff } from '../core/repository.js';
import { analyzeTask } from '../core/evidence.js';
import {
  assertChangeSurface,
  detectAlreadySolved,
  detectWrongLayer,
  detectUnsafeOperations,
  detectInvariantViolation,
  detectInsufficientEvidence,
  evaluateHardStops,
  SurgeryViolationError
} from '../core/guard.js';
import {
  STAGES,
  STAGE_REQUIREMENTS,
  validateStageRequirements,
  validateTransition,
  enforceDecisionGate,
  DecisionGateError,
  StageRequirementError,
  TransitionError
} from '../core/gates.js';
import { createMemoryStore } from '../memory/store.js';
import { detectOracles, runOracle, verifyWorkspace, verifyDecision } from '../core/oracles.js';
import {
  detectHosts,
  doctor,
  installHost,
  installSkills,
  injectOrUpdateSection,
  GRAYBEARD_MARKER_START,
  GRAYBEARD_MARKER_END,
  HOSTS
} from '../core/installer.js';

// ============================================================================
// 1. CLASSIFIER & SEMANTIC INTENT DISAMBIGUATION TESTS
// ============================================================================

test('classifier: handles empty, null, and whitespace inputs', () => {
  assert.equal(inferTaskType(''), 'unknown');
  assert.equal(inferTaskType(null), 'unknown');
  assert.equal(inferTaskType(undefined), 'unknown');
  assert.equal(inferTaskType('   \n\t  '), 'unknown');
  assert.equal(normalizeTaskType('unknown', ''), 'unknown');
  assert.equal(normalizeTaskType('custom', ''), 'unknown');
  assert.equal(normalizeTaskType('feature', ''), 'feature');
});

test('classifier: accurately classifies all domain patterns', () => {
  assert.equal(inferTaskType('fix authorization bypass in tenant check'), 'security');
  assert.equal(inferTaskType('database migration to backfill user foreign keys'), 'migration');
  assert.equal(inferTaskType('resolve race condition with mutex in webhook'), 'concurrency');
  assert.equal(inferTaskType('optimize memory leak and cpu spike latency'), 'performance');
  assert.equal(inferTaskType('redesign system service boundary architecture'), 'architecture');
  assert.equal(inferTaskType('remove legacy workaround from ancient codebase'), 'legacy');
  assert.equal(inferTaskType('refactor and simplify module structure'), 'refactor');
  assert.equal(inferTaskType('fix regression crash on null pointer'), 'bug');
  assert.equal(inferTaskType('implement new stripe payment gateway support'), 'feature');
  assert.equal(inferTaskType('update readme markdown documentation and comments'), 'docs');
  assert.equal(inferTaskType('update button hover style and css theme colors'), 'styling');
});

test('classifier: semantic presentation intent disambiguation prevents false security escalation', () => {
  const cosmetic = 'change the CSS color of the security badge icon to yellow';
  assert.equal(isPresentationIntent(cosmetic), true);
  assert.equal(inferTaskType(cosmetic), 'styling');

  const plan = classifyTask({ text: cosmetic });
  assert.equal(plan.taskType, 'styling');
  assert.equal(plan.risk, 'LOW');
  assert.equal(plan.isFastPath, true);
  assert.ok(!plan.skills.includes('challenge'));
  assert.ok(!plan.skills.includes('surgery'));
});

test('classifier: critical vulnerability keywords override presentation keywords', () => {
  const vuln = 'fix security bypass vulnerability in badge authorization token';
  assert.equal(isPresentationIntent(vuln), false);
  assert.equal(inferTaskType(vuln), 'security');

  const plan = classifyTask({ text: vuln });
  assert.equal(plan.risk, 'HIGH');
  assert.equal(plan.isFastPath, false);
  assert.ok(plan.skills.includes('challenge'));
  assert.ok(plan.skills.includes('surgery'));
});

// ============================================================================
// 2. RISK SCORING & CALIBRATED FLOOR MODEL
// ============================================================================

test('risk: throws RangeError on out-of-bounds or non-numeric factors', () => {
  assert.throws(() => riskScore({ uncertainty: -0.1, impact: 0.5, irreversibility: 0.5, blastRadius: 0.5 }), RangeError);
  assert.throws(() => riskScore({ uncertainty: 1.1, impact: 0.5, irreversibility: 0.5, blastRadius: 0.5 }), RangeError);
  assert.throws(() => riskScore({ uncertainty: NaN, impact: 0.5, irreversibility: 0.5, blastRadius: 0.5 }), RangeError);
  assert.throws(() => shouldInvestigate({ confidence: -0.1, risk: 'LOW' }), RangeError);
  assert.throws(() => shouldInvestigate({ confidence: 1.5, risk: 'LOW' }), RangeError);
});

test('risk: calibrated floor model prevents dominant bottleneck dilution', () => {
  assert.equal(calculateRisk({ uncertainty: 0, impact: 0, irreversibility: 0, blastRadius: 0 }), 'LOW');
  assert.equal(calculateRisk({ uncertainty: 1, impact: 1, irreversibility: 1, blastRadius: 1 }), 'HIGH');
  
  // Single dominant bottleneck factor: 0.90 uncertainty produces HIGH risk
  const score90 = riskScore({ uncertainty: 0.90, impact: 0.10, irreversibility: 0.10, blastRadius: 0.10 });
  assert.ok(score90 >= 0.76, `Score ${score90} should be >= 0.76`);
  assert.equal(calculateRisk({ uncertainty: 0.90, impact: 0.10, irreversibility: 0.10, blastRadius: 0.10 }), 'HIGH');

  const dominantBlastRadius = calculateRisk({ uncertainty: 0.1, impact: 0.1, irreversibility: 0.1, blastRadius: 1.0 });
  assert.equal(dominantBlastRadius, 'HIGH');
});

test('risk: investigation triggers based on confidence thresholds', () => {
  assert.equal(shouldInvestigate({ confidence: 0.69, risk: 'LOW' }), true);
  assert.equal(shouldInvestigate({ confidence: 0.70, risk: 'LOW' }), false);
  assert.equal(shouldInvestigate({ confidence: 0.95, risk: 'HIGH' }), true);
});

// ============================================================================
// 3. SKILL SELECTION & FOUR PRIMITIVES
// ============================================================================

test('skills: low-risk styling/docs uses minimal surgical skill set', () => {
  const skills = selectSkills({ risk: 'LOW', confidence: 0.95, taskType: 'styling' });
  assert.deepEqual(skills, ['orient', 'decide', 'economy', 'verify', 'stop']);
  assert.equal(skillCost(skills), 6);
});

test('skills: high-risk security/concurrency activates challenge and surgery', () => {
  const skills = selectSkills({ risk: 'HIGH', confidence: 0.6, taskType: 'security' });
  assert.deepEqual(skills, ['orient', 'interrogate', 'trace', 'challenge', 'decide', 'surgery', 'economy', 'verify', 'stop']);
  assert.equal(skillCost(skills), 15);
});

test('skills: legacy task always activates archaeology regardless of confidence', () => {
  const skills = selectSkills({ risk: 'LOW', confidence: 0.99, taskType: 'legacy' });
  assert.ok(skills.includes('archaeology'));
});

test('skills: repeat tasks activate memory skill', () => {
  const skills = selectSkills({ risk: 'LOW', confidence: 0.9, taskType: 'feature', repeat: true });
  assert.ok(skills.includes('memory'));
});

test('skills: four primitives map all 11 skills correctly', () => {
  assert.deepEqual(PRIMITIVES.TRUTH, ['orient', 'interrogate', 'trace', 'archaeology']);
  assert.deepEqual(PRIMITIVES.JUDGMENT, ['challenge', 'decide', 'stop']);
  assert.deepEqual(PRIMITIVES.SURGERY, ['surgery', 'economy']);
  assert.deepEqual(PRIMITIVES.PROOF, ['verify', 'memory']);

  for (const [name, def] of Object.entries(SKILL_DEFS)) {
    assert.ok(def.primitive, `Skill ${name} missing primitive`);
    assert.ok(Number.isFinite(def.cost), `Skill ${name} invalid cost`);
    assert.ok(def.purpose, `Skill ${name} missing purpose`);
    assert.ok(Array.isArray(def.triggers), `Skill ${name} missing triggers array`);
  }
  assert.equal(SKILL_ORDER.length, 11);
});

// ============================================================================
// 4. REASONING LEDGER & COMPACT STATE
// ============================================================================

test('ledger: creates default ledger and bounds oversized state', () => {
  const ledger = createLedger();
  assert.equal(ledger.risk, 'LOW');
  assert.equal(ledger.confidence, 1);
  assert.equal(ledger.stage, 'CLASSIFY');
  assert.deepEqual(ledger.facts, []);

  const oversized = createLedger({
    facts: Array(50).fill('fact-entry'),
    unknown: Array(50).fill('unknown-entry'),
    invariants: Array(50).fill('invariant-entry'),
    decision: '   apply atomic constraint   ',
    confidence: 0.8876
  });

  const compact = compactLedger(oversized, { maxItems: 3 });
  assert.equal(compact.facts.length, 3);
  assert.equal(compact.unknown.length, 3);
  assert.equal(compact.invariants.length, 3);
  assert.equal(compact.confidence, 0.89);
  assert.equal(compact.decision, 'apply atomic constraint');

  const summary = decisionSummary(oversized);
  assert.match(summary, /DECISION: apply atomic constraint/);
  assert.match(summary, /FACTS: 3/);
});

test('ledger: decisionKey handles special characters, whitespace, and case sensitivity', () => {
  const key1 = decisionKey({ area: 'Auth & Perms', invariant: 'Tenant isolation must hold', decision: 'Validate before execution' });
  const key2 = decisionKey({ area: 'auth & perms', invariant: '  Tenant   isolation must hold  ', decision: 'VALIDATE before execution' });
  assert.equal(key1, key2);
  assert.equal(key1, 'auth & perms|tenant isolation must hold|validate before execution');
});

// ============================================================================
// 5. HARD STOP ENGINE (ALL TRIGGERS & COMBINATIONS)
// ============================================================================

test('stop: detects all 6 deterministic hard stop conditions', () => {
  assert.deepEqual(shouldStop({ alreadySolved: true }), { stop: true, reasons: ['already-solved'] });
  assert.deepEqual(shouldStop({ rootCauseMismatch: true }), { stop: true, reasons: ['wrong-root-cause'] });
  assert.deepEqual(shouldStop({ requirementsConflict: true }), { stop: true, reasons: ['conflicting-requirements'] });
  assert.deepEqual(shouldStop({ unsafe: true }), { stop: true, reasons: ['unsafe-request'] });
  assert.deepEqual(shouldStop({ invariantViolation: true }), { stop: true, reasons: ['invariant-risk'] });
  assert.deepEqual(shouldStop({ risk: 'HIGH', confidence: 0.4 }), { stop: true, reasons: ['insufficient-evidence'] });

  // Combined reasons
  const multi = shouldStop({ alreadySolved: true, unsafe: true });
  assert.equal(multi.stop, true);
  assert.deepEqual(multi.reasons, ['already-solved', 'unsafe-request']);

  // Clean ledger does not stop
  assert.deepEqual(shouldStop({ risk: 'LOW', confidence: 0.95 }), { stop: false, reasons: [] });
});

// ============================================================================
// 6. SESSION & ENGINE LIFECYCLE
// ============================================================================

test('engine: session manages observation lifecycle and decision finalization', () => {
  const session = createSession({
    text: 'prevent duplicate webhook charge',
    taskType: 'concurrency',
    confidence: 0.6
  });
  assert.equal(session.plan.risk, 'HIGH');
  assert.equal(session.plan.policy.requireFalsification, true);

  applyObservation(session, {
    facts: ['found 2 callers'],
    invariants: ['1 charge per idempotency key'],
    causePath: ['webhook -> queue -> charge'],
    changeSurface: ['src/payments/idempotency.ts'],
    falsificationAttempts: [{ hypothesis: 'concurrent replay', attack: 'parallel post', result: 'SURVIVED' }],
    unknown: ['retry interval']
  });

  assert.equal(session.ledger.facts.length, 1);
  assert.equal(session.ledger.invariants.length, 1);

  finalizeDecision(session, 'Add unique index on charge idempotency key', ['db constraint test', 'webhook replay test']);
  assert.equal(session.ledger.decision, 'Add unique index on charge idempotency key');
  assert.equal(session.ledger.validation.length, 2);
  assert.equal(session.stop.stop, false);
});

// ============================================================================
// 7. MEMORY STORE (ATOMICITY, RANKED SEARCH, ERROR HANDLING)
// ============================================================================

test('memory: throws Error when required fields are missing', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gb-mem-'));
  const store = createMemoryStore(path.join(dir, 'decisions.json'));
  assert.throws(() => store.remember({ area: 'auth' }), /requires area, invariant, and decision/);
  assert.throws(() => store.remember({ area: 'auth', invariant: 'iso' }), /requires area, invariant, and decision/);
});

test('memory: atomic persistence, relevance-ranked search, remove, and count', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gb-mem-'));
  const memFile = path.join(dir, 'decisions.json');
  const store = createMemoryStore(memFile);

  store.remember({ area: 'auth', invariant: 'tenant isolation', decision: 'resolve tenant before authorization' });
  store.remember({ area: 'billing', invariant: 'single charge per token', decision: 'use database unique constraint' });
  store.remember({ area: 'auth', invariant: 'session timeout', decision: 'expire tokens after 15 minutes' });

  assert.equal(store.count(), 3);
  assert.equal(store.all().length, 3);

  const authResults = store.find({ query: 'tenant isolation' });
  assert.equal(authResults.length, 1);
  assert.equal(authResults[0].area, 'auth');
  assert.equal(authResults[0].invariant, 'tenant isolation');

  const broadResults = store.find({ query: 'auth session' });
  assert.ok(broadResults.length >= 1);
  assert.equal(broadResults[0].invariant, 'session timeout');

  const key = decisionKey({ area: 'billing', invariant: 'single charge per token', decision: 'use database unique constraint' });
  const removed = store.remove(key);
  assert.equal(removed, true);
  assert.equal(store.count(), 2);
  assert.equal(store.remove('non-existent-key'), false);
});

test('memory: recovers gracefully from corrupted or malformed JSON file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gb-corrupt-'));
  const memFile = path.join(dir, 'decisions.json');
  fs.writeFileSync(memFile, '{ this is corrupted json }}}');

  const store = createMemoryStore(memFile);
  assert.equal(store.count(), 0);
  assert.deepEqual(store.all(), []);

  store.remember({ area: 'cache', invariant: 'lru eviction', decision: 'bound cache size to 1000' });
  assert.equal(store.count(), 1);
});

// ============================================================================
// 8. DETERMINISTIC COMPILER & TEST ORACLES
// ============================================================================

test('oracles: detect available project verification tools in workspace', () => {
  const root = path.resolve('.');
  const oracles = detectOracles(root);
  assert.ok(oracles.length >= 2);
  assert.ok(oracles.some(o => o.command === 'npm test'));
  assert.ok(oracles.some(o => o.command === 'npm run check'));
});

test('oracles: accurately detects oracles across Python, Rust, Go, Java, C#, Ruby, PHP, CMake, and Elixir', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'gb-multi-oracles-'));
  
  // Python setup
  fs.writeFileSync(path.join(temp, 'pyproject.toml'), '[tool.pytest]\n');
  fs.writeFileSync(path.join(temp, 'mypy.ini'), '[mypy]\n');
  let detected = detectOracles(temp);
  assert.ok(detected.some(o => o.runner === 'pytest'));
  assert.ok(detected.some(o => o.runner === 'mypy'));

  // Rust setup
  fs.writeFileSync(path.join(temp, 'Cargo.toml'), '[package]\nname = "test"\n');
  detected = detectOracles(temp);
  assert.ok(detected.some(o => o.command === 'cargo test'));
  assert.ok(detected.some(o => o.command === 'cargo check'));

  // Go setup
  fs.writeFileSync(path.join(temp, 'go.mod'), 'module test\n');
  detected = detectOracles(temp);
  assert.ok(detected.some(o => o.command.startsWith('go test')));

  // Java Maven & Gradle
  fs.writeFileSync(path.join(temp, 'pom.xml'), '<project></project>');
  detected = detectOracles(temp);
  assert.ok(detected.some(o => o.runner === 'maven'));

  // C# / .NET
  fs.writeFileSync(path.join(temp, 'App.csproj'), '<Project></Project>');
  detected = detectOracles(temp);
  assert.ok(detected.some(o => o.runner === 'dotnet'));

  // Ruby
  fs.writeFileSync(path.join(temp, 'Gemfile'), 'source "https://rubygems.org"');
  detected = detectOracles(temp);
  assert.ok(detected.some(o => o.runner === 'rake'));

  // PHP
  fs.writeFileSync(path.join(temp, 'composer.json'), '{}');
  fs.writeFileSync(path.join(temp, 'phpunit.xml'), '<phpunit></phpunit>');
  detected = detectOracles(temp);
  assert.ok(detected.some(o => o.runner === 'phpunit'));

  // C/C++ CMake
  fs.writeFileSync(path.join(temp, 'CMakeLists.txt'), 'cmake_minimum_required(VERSION 3.10)');
  detected = detectOracles(temp);
  assert.ok(detected.some(o => o.runner === 'ctest'));

  // Elixir
  fs.writeFileSync(path.join(temp, 'mix.exs'), 'defmodule Test.MixProject do\nend');
  detected = detectOracles(temp);
  assert.ok(detected.some(o => o.runner === 'mix'));
});

test('oracles: runOracle executes command and captures duration, output, and exit status', () => {
  const root = path.resolve('.');
  const passOracle = { type: 'integrity', command: 'node scripts/check.js' };
  const passRes = runOracle(passOracle, { cwd: root });
  assert.equal(passRes.passed, true);
  assert.equal(passRes.exitCode, 0);
  assert.ok(passRes.durationMs >= 0);
  assert.match(passRes.output, /Graybeard integrity check: OK/);

  const failOracle = { type: 'test', command: 'node -e "process.exit(2)"' };
  const failRes = runOracle(failOracle, { cwd: root });
  assert.equal(failRes.passed, false);
  assert.equal(failRes.exitCode, 2);
});

test('oracles: verifyWorkspace executes detected oracles deterministically', () => {
  const root = path.resolve('.');
  const result = verifyWorkspace(root, { types: ['integrity'] });
  assert.equal(result.verified, true);
  assert.equal(result.passedCount, 1);
  assert.equal(result.failedCount, 0);
});

// ============================================================================
// 9. MULTI-HOST INSTALLER & MARKER INJECTION INTEGRITY
// ============================================================================

test('installer: detectHosts accurately identifies all major agent hosts', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'gb-hosts-'));
  fs.mkdirSync(path.join(temp, '.windsurf'));
  fs.writeFileSync(path.join(temp, 'CONVENTIONS.md'), '');
  fs.writeFileSync(path.join(temp, '.clinerules'), '# cline');
  fs.mkdirSync(path.join(temp, '.continue'));
  fs.mkdirSync(path.join(temp, '.claude'));
  fs.writeFileSync(path.join(temp, 'GEMINI.md'), '');

  const detected = detectHosts(temp);
  assert.ok(detected.includes('windsurf'));
  assert.ok(detected.includes('cline'));
  assert.ok(detected.includes('continue'));
  assert.ok(detected.includes('claude'));
  assert.ok(detected.includes('gemini'));
  assert.ok(detected.includes('aider'));
});

test('installer: injectOrUpdateSection safely merges and updates in-place without duplication', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'gb-inject-'));
  const target = path.join(temp, 'CLAUDE.md');
  fs.writeFileSync(target, '# Project Instructions\nKeep this text intact.\n');

  injectOrUpdateSection(target, 'Rule version 1');
  let content = fs.readFileSync(target, 'utf8');
  assert.match(content, /# Project Instructions/);
  assert.match(content, /Rule version 1/);
  assert.match(content, /<!-- GRAYBEARD_START -->/);
  assert.match(content, /<!-- GRAYBEARD_END -->/);

  injectOrUpdateSection(target, 'Rule version 2');
  content = fs.readFileSync(target, 'utf8');
  assert.match(content, /# Project Instructions/);
  assert.match(content, /Rule version 2/);
  assert.ok(!content.includes('Rule version 1'));
  assert.equal((content.match(/<!-- GRAYBEARD_START -->/g) || []).length, 1);
  assert.equal((content.match(/<!-- GRAYBEARD_END -->/g) || []).length, 1);
});

test('installer: installHost writes correct rule files across all supported hosts', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'gb-install-all-'));
  
  const cursorWrites = installHost(temp, 'cursor');
  assert.ok(cursorWrites.some(w => w.endsWith('graybeard.mdc')));

  const windsurfWrites = installHost(temp, 'windsurf');
  assert.ok(windsurfWrites.some(w => w.endsWith('graybeard.md')));

  const opencodeWrites = installHost(temp, 'opencode');
  assert.ok(opencodeWrites.some(w => w.endsWith('AGENTS.md')));
  assert.ok(opencodeWrites.some(w => w.includes('.opencode')));

  const claudeWrites = installHost(temp, 'claude');
  assert.ok(claudeWrites.some(w => w.endsWith('CLAUDE.md')));
  assert.ok(claudeWrites.some(w => w.includes('.claude')));

  const copilotWrites = installHost(temp, 'copilot');
  assert.ok(copilotWrites.some(w => w.includes('copilot-instructions.md')));
});

test('installer: installSkills copies all 11 skills with valid YAML frontmatter', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'gb-skills-'));
  const writes = installSkills(temp, '.agents/skills');
  assert.ok(writes.length >= 22);

  const skillDir = path.resolve('skills');
  const files = fs.readdirSync(skillDir).filter(f => f.endsWith('.md') && f !== 'README.md');
  assert.equal(files.length, 11);

  for (const file of files) {
    const content = fs.readFileSync(path.join(skillDir, file), 'utf8');
    assert.match(content, /^---\nname: graybeard-[a-z]+\ndescription: .+\ntriggers:/);
  }
});

test('installer: doctor reports correct readiness across repository configurations', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'gb-doc-'));
  
  const emptyDoc = doctor(temp);
  assert.equal(emptyDoc.status, 'not-configured');
  assert.equal(emptyDoc.agentsFile, false);

  fs.writeFileSync(path.join(temp, 'AGENTS.md'), '# test');
  const readyDoc = doctor(temp);
  assert.equal(readyDoc.status, 'ready');
  assert.equal(readyDoc.agentsFile, true);
});

// ============================================================================
// 10. ROUTER INTEGRATION & EXECUTION POLICY
// ============================================================================

test('router: stops immediately and returns stop sequence on stop condition', () => {
  const plan = routeTask({ risk: 'HIGH', confidence: 0.2, ledger: { unsafe: true } });
  assert.equal(plan.stop.stop, true);
  assert.deepEqual(plan.sequence, ['stop']);
});

test('router: generates correct fastPath policy for low-risk feature', () => {
  const plan = routeTask({ taskType: 'styling', confidence: 0.95, blastRadius: 0.1 });
  assert.equal(plan.policy.fastPath, true);
  assert.equal(plan.policy.allowDeepReasoning, false);
  assert.equal(plan.policy.requireFalsification, false);
  assert.equal(plan.policy.requireChangeSurface, false);
});

// ============================================================================
// 11. REPOSITORY SNAPSHOT & FACT DISCOVERY
// ============================================================================

test('repository: inspectRepository extracts languages, packageManagers, tests, and symbols', () => {
  const root = path.resolve('.');
  const snapshot = inspectRepository(root);
  assert.ok(snapshot.languages.includes('javascript'));
  assert.ok(snapshot.packageManagers.includes('npm'));
  assert.ok(snapshot.tests.length >= 1);
  assert.ok(snapshot.symbols.some(s => s.name === 'classifyTask'));
  assert.ok(snapshot.symbols.some(s => s.name === 'inspectRepository'));
});

test('repository: findRelevantFiles ranks matching files by task terms', () => {
  const root = path.resolve('.');
  const relevant = findRelevantFiles(root, 'verify decision with compiler oracles');
  assert.ok(relevant.length >= 1);
  assert.ok(relevant.some(f => f.includes('oracles.js')));
});

test('repository: findCallers locates symbol invocations across files', () => {
  const root = path.resolve('.');
  const callers = findCallers(root, 'calculateRisk');
  assert.ok(callers.length >= 1);
  assert.ok(callers.some(c => c.file.includes('evidence.js') || c.file.includes('core.test.js')));
});

// ============================================================================
// 12. EVIDENCE-FIRST TASK ANALYSIS
// ============================================================================

test('evidence: analyzeTask synthesizes prompt and repo clues into risk score', () => {
  const root = path.resolve('.');
  const analysis = analyzeTask({
    text: 'fix concurrency race condition in webhook charge idempotency key',
    root
  });
  assert.equal(analysis.taskType, 'concurrency');
  assert.equal(analysis.risk, 'HIGH');
  assert.ok(analysis.facts.length >= 1);
  assert.equal(analysis.isFastPath, false);
});

test('evidence: presentation task produces low risk and fastPath even with complex repo', () => {
  const root = path.resolve('.');
  const analysis = analyzeTask({
    text: 'change the button CSS color to slate blue',
    root
  });
  assert.equal(analysis.taskType, 'styling');
  assert.equal(analysis.risk, 'LOW');
  assert.equal(analysis.isFastPath, true);
});

// ============================================================================
// 13. STAGE CONTRACTS & TRANSITION VALIDATION
// ============================================================================

test('gates: validates stage entry and exit conditions strictly', () => {
  // TRACE requires faultLocation and causePath
  assert.throws(() => validateStageRequirements('TRACE', {}), StageRequirementError);
  assert.doesNotThrow(() => validateStageRequirements('TRACE', { faultLocation: 'core/risk.js:12', causePath: ['entry -> fault'] }));

  // DECIDE requires invariants, candidates, rejected, decision
  assert.throws(() => validateStageRequirements('DECIDE', { invariants: ['inv1'] }), StageRequirementError);
  assert.doesNotThrow(() => validateStageRequirements('DECIDE', {
    invariants: ['inv1'], candidates: ['cand1'], rejected: ['rej1'], decision: 'apply fix'
  }));

  // SURGERY requires changeSurface
  assert.throws(() => validateStageRequirements('SURGERY', {}), StageRequirementError);
  assert.doesNotThrow(() => validateStageRequirements('SURGERY', { changeSurface: ['core/guard.js'] }));

  // CHALLENGE requires falsificationAttempts
  assert.throws(() => validateStageRequirements('CHALLENGE', {}), StageRequirementError);
  assert.doesNotThrow(() => validateStageRequirements('CHALLENGE', {
    falsificationAttempts: [{ hypothesis: 'h1', attack: 'a1', result: 'SURVIVED' }],
    survivingDecision: 'decision-1'
  }));
});

test('gates: validateTransition rejects progressing if current stage prerequisites are missing', () => {
  assert.throws(() => validateTransition('TRACE', 'DECIDE', {}), TransitionError);
  assert.doesNotThrow(() => validateTransition('TRACE', 'DECIDE', { faultLocation: 'loc', causePath: ['p1'] }));
});

test('gates: enforceDecisionGate mandates falsification and invariants on HIGH risk decisions', () => {
  assert.throws(() => enforceDecisionGate({ risk: 'HIGH' }), DecisionGateError);
  assert.doesNotThrow(() => enforceDecisionGate({
    risk: 'HIGH',
    falsificationAttempts: [{ hypothesis: 'h', attack: 'a', result: 'SURVIVED' }],
    invariants: ['inv'],
    changeSurface: ['file.ts']
  }));
});

// ============================================================================
// 14. DIFF POLICING & SURGERY BOUNDARY GUARD
// ============================================================================

test('guard: assertChangeSurface passes when actual diff matches planned changeSurface', () => {
  const check = assertChangeSurface({
    planned: ['core/index.js', 'core/guard.js'],
    actualFiles: ['core/index.js']
  });
  assert.equal(check.passed, true);
  assert.equal(check.disallowedFiles.length, 0);
});

test('guard: assertChangeSurface rejects unexpected file edits outside boundary', () => {
  const check = assertChangeSurface({
    planned: ['src/payments/idempotency.ts'],
    actualFiles: ['src/payments/idempotency.ts', 'package.json', 'README.md']
  });
  assert.equal(check.passed, false);
  assert.deepEqual(check.disallowedFiles, ['package.json', 'README.md']);
  assert.throws(() => assertChangeSurface({
    planned: ['src/payments/idempotency.ts'],
    actualFiles: ['package.json'],
    throwOnError: true
  }), SurgeryViolationError);
});

// ============================================================================
// 15. DETERMINISTIC HARD STOP DETECTORS (AUTOMATIC DETECTION)
// ============================================================================

test('guard: detectAlreadySolved finds existing capability in repository', () => {
  const root = path.resolve('.');
  const solved = detectAlreadySolved({ text: 'add task classification helper', root });
  assert.equal(solved.stop, true);
  assert.equal(solved.reason, 'already-solved');
});

test('guard: detectWrongLayer flags UI modifications on backend concurrency/security bugs', () => {
  const check = detectWrongLayer({
    requestedFile: 'src/components/CheckoutButton.tsx',
    faultLocation: 'src/db/migrations/orders.sql',
    taskType: 'concurrency'
  });
  assert.equal(check.stop, true);
  assert.equal(check.reason, 'wrong-root-cause');
});

test('guard: detectUnsafeOperations catches auth bypass and disabled validation', () => {
  assert.equal(detectUnsafeOperations({ code: 'function auth() { if (true) return; }' }).stop, true);
  assert.equal(detectUnsafeOperations({ patch: '+ validate = () => true;' }).stop, true);
  assert.equal(detectUnsafeOperations({ text: 'delete query.tenantId to fix lookup' }).stop, true);
  assert.equal(detectUnsafeOperations({ code: 'const h = crypto.createHash("md5");' }).stop, true);
  assert.equal(detectUnsafeOperations({ code: 'const clean = true;' }).stop, false);
});

test('guard: detectInvariantViolation flags direct contradiction of active invariants', () => {
  const violation = detectInvariantViolation({
    proposedChange: 'bypass tenant isolation must hold',
    invariants: ['tenant isolation must hold']
  });
  assert.equal(violation.stop, true);
  assert.equal(violation.reason, 'invariant-risk');
});

test('guard: evaluateHardStops aggregates all automatic detectors', () => {
  const result = evaluateHardStops({
    ledger: { risk: 'HIGH', confidence: 0.2 },
    text: 'delete query.tenantId to fix 404'
  });
  assert.equal(result.stop, true);
  assert.ok(result.reasons.includes('unsafe-request'));
  assert.ok(result.reasons.includes('insufficient-evidence'));
});

// ============================================================================
// 16. 5-DIMENSION MECHANICAL DECISION PROOF
// ============================================================================

test('oracles: verifyDecision evaluates 5 proof dimensions', () => {
  const root = path.resolve('.');
  const proof = verifyDecision({
    root,
    decision: 'Validate tenant before query',
    invariant: 'tenant isolation',
    plannedFiles: ['core/index.js'],
    actualDiff: { files: ['core/index.js'], insertions: 5, deletions: 1 }
  });

  assert.equal(proof.verified, true);
  assert.equal(proof.breakdown.behavior, 'PASS');
  assert.equal(proof.breakdown.regression, 'PASS');
  assert.equal(proof.breakdown.invariant, 'PASS');
  assert.equal(proof.breakdown.boundary, 'PASS');
  assert.equal(proof.breakdown.economy, 'PASS');
});

// ============================================================================
// 17. COMPLETE 5-STAGE ENGINE LIFECYCLE
// ============================================================================

test('engine: executes full 5-stage lifecycle from CLASSIFY to PROVE', () => {
  const session = createSession({
    text: 'prevent duplicate webhook charge with idempotency key',
    taskType: 'concurrency',
    confidence: 0.8
  });
  assert.equal(session.stage, 'CLASSIFY');

  // Transition to EVIDENCE
  applyObservation(session, { facts: ['found webhook handler and db schema'] });
  transitionStage(session, 'EVIDENCE');
  assert.equal(session.stage, 'EVIDENCE');

  // Transition to TRACE
  applyObservation(session, {
    faultLocation: 'core/payments.js:45',
    causePath: ['webhook -> worker -> charge']
  });
  transitionStage(session, 'TRACE');
  assert.equal(session.stage, 'TRACE');

  // Transition to DECIDE
  applyObservation(session, {
    invariants: ['1 charge per idempotency key'],
    candidates: ['db unique index', 'in-memory lock'],
    rejected: ['in-memory lock: fails distributed scale'],
    changeSurface: ['core/index.js'],
    falsificationAttempts: [
      { hypothesis: 'replay attack', attack: 'concurrent webhook retry', result: 'SURVIVED' }
    ]
  });
  finalizeDecision(session, 'Add unique index on charge idempotency key');
  transitionStage(session, 'DECIDE');
  assert.equal(session.stage, 'DECIDE');

  // Transition to SURGERY
  transitionStage(session, 'SURGERY');
  assert.equal(session.stage, 'SURGERY');

  // PROVE stage
  const { proof } = verifySession(session, {
    root: path.resolve('.'),
    plannedFiles: ['core/index.js'],
    actualDiff: { files: ['core/index.js'], insertions: 3, deletions: 0 }
  });
  assert.equal(proof.verified, true);
  transitionStage(session, 'PROVE');
  assert.equal(session.stage, 'PROVE');
});

// ============================================================================
// 18. ERROR CLASSES & SURGERY BUDGET TESTS
// ============================================================================

test('gates: error classes instantiate with correct attributes', () => {
  const gateErr = new DecisionGateError('Gate blocked', { detail: 1 });
  assert.equal(gateErr.name, 'DecisionGateError');
  assert.equal(gateErr.message, 'Gate blocked');
  assert.equal(gateErr.details.detail, 1);

  const stageErr = new StageRequirementError('TRACE', ['faultLocation']);
  assert.equal(stageErr.name, 'StageRequirementError');
  assert.equal(stageErr.stage, 'TRACE');
  assert.deepEqual(stageErr.missing, ['faultLocation']);

  const transErr = new TransitionError('CLASSIFY', 'SURGERY', 'skip not allowed');
  assert.equal(transErr.name, 'TransitionError');
  assert.equal(transErr.from, 'CLASSIFY');
  assert.equal(transErr.to, 'SURGERY');
});

test('guard: assertChangeSurface detects locBudget exceeded', () => {
  const check = assertChangeSurface({
    planned: ['core/index.js'],
    actualDiff: { files: ['core/index.js'], insertions: 300, deletions: 50 },
    maxLocBudget: 200
  });
  assert.equal(check.passed, false);
  assert.equal(check.locExceeded, true);
  assert.ok(check.violations.some(v => v.includes('surgical budget')));
});

test('oracles: verifyDecision correctly flags boundary failure on disallowed files', () => {
  const root = path.resolve('.');
  const proof = verifyDecision({
    root,
    decision: 'Validate tenant',
    invariant: 'tenant isolation',
    plannedFiles: ['src/payments/idempotency.ts'],
    actualDiff: { files: ['unauthorized_file.js'], insertions: 1, deletions: 0 }
  });

  assert.equal(proof.verified, false);
  assert.equal(proof.breakdown.boundary, 'FAIL');
});

test('benchmark: cases and results contain 100 valid task entries', () => {
  const casesFile = path.resolve('benchmarks/cases.json');
  const resultsFile = path.resolve('benchmarks/results.json');

  assert.ok(fs.existsSync(casesFile));
  assert.ok(fs.existsSync(resultsFile));

  const cases = JSON.parse(fs.readFileSync(casesFile, 'utf8'));
  const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));

  assert.equal(cases.length, 100);
  assert.equal(results.length, 300); // 100 * 3 arms
});

