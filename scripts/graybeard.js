#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { SKILL_DEFS, PRIMITIVES, createLedger, decisionSummary } from '../core/index.js';
import { routeTask } from '../core/router.js';
import { inspectRepository, getDiff } from '../core/repository.js';
import { analyzeTask } from '../core/evidence.js';
import { assertChangeSurface, evaluateHardStops } from '../core/guard.js';
import { createMemoryStore } from '../memory/store.js';
import { detectHosts, installHost, installSkills, doctor, HOSTS } from '../core/installer.js';
import { detectOracles, verifyWorkspace, verifyDecision } from '../core/oracles.js';

const args = process.argv.slice(2);
const command = args[0] ?? 'help';
const root = process.cwd();
const memoryPath = path.join(root, '.graybeard', 'decisions.json');

function flag(name, fallback = undefined) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] ?? true : fallback;
}
function num(name, fallback) {
  const value = Number(flag(name, fallback));
  return Number.isFinite(value) ? value : fallback;
}
function jsonFlag(name) {
  const value = flag(name);
  return value ? JSON.parse(value) : null;
}

if (command === 'skills') {
  console.log(Object.entries(SKILL_DEFS).map(([name, v]) => `${name}\t${v.phase}\t${v.cost}\t${v.purpose}`).join('\n'));
} else if (command === 'primitives') {
  for (const [prim, skills] of Object.entries(PRIMITIVES)) {
    console.log(`${prim}: ${skills.join(', ')}`);
  }
} else if (command === 'protocol') {
  console.log('Graybeard 1.0 — 5-Stage Evidence-Enforced Control Loop');
  console.log('1. CLASSIFY ──► 2. EVIDENCE ──► 3. DECIDE (Stop / Modify) ──► 4. SURGERY ──► 5. PROVE');
} else if (command === 'inspect') {
  console.log(JSON.stringify(inspectRepository(root), null, 2));
} else if (command === 'evidence') {
  const positionalText = args[1] && !args[1].startsWith('--') ? args[1] : '';
  const taskText = flag('text', positionalText);
  const result = analyzeTask({ text: taskText, root });
  console.log(JSON.stringify(result, null, 2));
} else if (command === 'route') {
  const positionalText = args[1] && !args[1].startsWith('--') ? args[1] : '';
  const taskText = flag('text', positionalText);
  const plan = routeTask({
    text: taskText, taskType: flag('type', 'unknown'), repeat: Boolean(flag('repeat', false)),
    uncertainty: num('uncertainty', 0.5), impact: num('impact', 0.5), irreversibility: num('irreversibility', 0.5),
    blastRadius: num('blast-radius', 0.5), confidence: num('confidence', 0.5), ledger: jsonFlag('ledger') ?? {},
  });
  console.log(JSON.stringify(plan, null, 2));
} else if (command === 'guard' || command === 'diff') {
  const plannedFiles = jsonFlag('planned') || (flag('files') ? flag('files').split(',') : []);
  const check = assertChangeSurface({ planned: plannedFiles, root });
  console.log(JSON.stringify(check, null, 2));
} else if (command === 'prove') {
  const plannedFiles = jsonFlag('planned') || (flag('files') ? flag('files').split(',') : []);
  const decision = flag('decision', '');
  const invariant = flag('invariant', '');
  const proof = verifyDecision({ root, decision, invariant, plannedFiles });
  console.log(JSON.stringify(proof, null, 2));
} else if (command === 'ledger') {
  const ledger = createLedger(jsonFlag('json') ?? {});
  console.log(decisionSummary(ledger));
} else if (command === 'remember') {
  const input = jsonFlag('json') ?? {};
  if (!input.area || !input.invariant || !input.decision) throw new Error('remember requires area, invariant and decision');
  const store = createMemoryStore(memoryPath);
  console.log(JSON.stringify(store.remember(input), null, 2));
} else if (command === 'memory') {
  const store = createMemoryStore(memoryPath);
  console.log(JSON.stringify(store.find({ query: flag('query', '') }), null, 2));
} else if (command === 'oracles') {
  console.log(JSON.stringify(detectOracles(root), null, 2));
} else if (command === 'verify') {
  console.log(JSON.stringify(verifyWorkspace(root), null, 2));
} else if (command === 'init') {
  const requested = flag('agent', flag('all') ? 'all' : null);
  const detected = detectHosts(root);
  let hosts;
  if (requested === 'all') {
    hosts = Object.keys(HOSTS).filter((h) => h !== 'generic');
  } else if (requested) {
    hosts = [requested];
  } else {
    hosts = detected.length ? detected : ['generic'];
  }
  const writes = [];
  for (const host of hosts) writes.push(...installHost(root, host));
  if (hosts.includes('generic') || requested === 'all') writes.push(...installSkills(root, '.agents/skills'));
  console.log(JSON.stringify({ version: '1.0.0', hosts, detected, writes: [...new Set(writes)] }, null, 2));
} else if (command === 'doctor') {
  const doc = doctor(root);
  const oracles = detectOracles(root);
  console.log(JSON.stringify({ ...doc, oracles: oracles.map(o => `${o.type}: ${o.command}`) }, null, 2));
} else if (command === 'hosts') {
  console.log(Object.entries(HOSTS).map(([id, h]) => `${id.padEnd(12)} ${h.label}`).join('\n'));
} else {
  console.log(`
Graybeard v1.0.0 — Evidence-Enforced Principal Engineering Control Loop

Usage:
  npx graybeard <command> [options]

Commands:
  init                  Initialize Graybeard rules and skills in the current repo
    --agent <name>      Target a specific agent (e.g. opencode, cursor, claude, windsurf, copilot)
    --all               Configure all supported host environments and standard skills

  inspect               Generate complete repository snapshot (symbols, tests, schemas, invariants)
  evidence [task-text]  Analyze task using prompt + repository evidence + change surface
  guard                 Policing check comparing git diff against planned changeSurface
    --files <list>      Comma-separated allowed files
  prove                 Run 5-dimension proof (behavior, regression, invariant, boundary, economy)
    --decision <str>    Decision text to verify
    --invariant <str>   Durable invariant to verify

  doctor                Verify repository integration, host configuration, and deterministic oracles
  oracles               List detected compiler, linter, and test suite verification commands
  verify                Run all detected deterministic compiler and test verification oracles
  hosts                 List all supported AI agent hosts and their target files
  skills                List all on-demand Graybeard skills with their phases and purposes
  primitives            List the 4 core primitives (TRUTH, JUDGMENT, SURGERY, PROOF)

  route [task-text]     Classify a task and generate an adaptive execution plan
    --text <text>       Task prompt text (or pass as positional argument)
    --type <type>       Explicit task type override (e.g. bug, security, concurrency, feature)

  remember --json '...' Record a durable engineering decision/invariant in repository memory
  memory --query <str>  Search durable decisions stored in .graybeard/decisions.json

Examples:
  npx graybeard inspect
  npx graybeard evidence "prevent duplicate order charge"
  npx graybeard guard --files "src/orders/idempotency.ts"
  npx graybeard prove --decision "Add db uniqueness constraint"
  npx graybeard verify
`);
}
