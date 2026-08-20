#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { SKILL_DEFS, createLedger, decisionSummary } from '../core/index.js';
import { routeTask } from '../core/router.js';
import { createMemoryStore } from '../memory/store.js';
import { detectHosts, installHost, installSkills, doctor, HOSTS } from '../core/installer.js';

const args = process.argv.slice(2);
const command = args[0] ?? 'help';
const root = process.cwd();
const memoryPath = path.join(root, '.sextant', 'decisions.json');

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
} else if (command === 'protocol') {
  console.log('Sextant 1.0 — adaptive engineering judgment');
  console.log('Observe → Evidence → Uncertainty → Trace → Challenge → Decide → Minimize → Verify');
} else if (command === 'route') {
  const plan = routeTask({
    text: flag('text', ''), taskType: flag('type', 'unknown'), repeat: Boolean(flag('repeat', false)),
    uncertainty: num('uncertainty', 0.5), impact: num('impact', 0.5), irreversibility: num('irreversibility', 0.5),
    blastRadius: num('blast-radius', 0.5), confidence: num('confidence', 0.5), ledger: jsonFlag('ledger') ?? {},
  });
  console.log(JSON.stringify(plan, null, 2));
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
} else if (command === 'init') {
  const requested = flag('agent', null);
  const detected = detectHosts(root);
  const hosts = requested ? [requested] : (detected.length ? detected : ['generic']);
  const writes = [];
  for (const host of hosts) writes.push(...installHost(root, host));
  if (!requested && hosts.includes('generic')) writes.push(...installSkills(root));
  console.log(JSON.stringify({ version: '1.0.0', hosts, detected, writes }, null, 2));
} else if (command === 'doctor') {
  console.log(JSON.stringify(doctor(root), null, 2));
} else if (command === 'hosts') {
  console.log(Object.entries(HOSTS).map(([id, h]) => `${id}\t${h.label}`).join('\n'));
} else {
  console.log(`Sextant 1.0\n\nCommands:\n  protocol\n  skills\n  route --text "..." --type bug --uncertainty 0.8 --impact 0.8 --irreversibility 0.7 --blast-radius 0.6 --confidence 0.5\n  ledger\n  remember --json '{"area":"auth","invariant":"tenant isolation","decision":"resolve tenant before authorization"}'\n  memory --query auth\n  init`);
}
