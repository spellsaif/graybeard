#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { evaluateAgentTask } from '../benchmarks/harness/evaluator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const casesPath = path.join(ROOT, 'benchmarks', 'cases.json');
const cases = JSON.parse(fs.readFileSync(casesPath, 'utf8'));

// Parse CLI args
const args = process.argv.slice(2);
const limitArg = args.find(a => a.startsWith('--tasks=') || a === '-n');
const limitVal = limitArg ? parseInt(limitArg.split('=')[1] || args[args.indexOf(limitArg) + 1] || '10', 10) : 10;
const arms = ['baseline', 'prompt-only', 'graybeard'];

const selectedTasks = cases.slice(0, limitVal);

console.log(`\n🧙‍♂️ Running Agentic Benchmark Harness on Isolated Git Fixtures`);
console.log(`Evaluating ${selectedTasks.length} tasks across ${arms.length} arms (${selectedTasks.length * arms.length} real workspace runs)...\n`);

const results = [];

for (const task of selectedTasks) {
  process.stdout.write(`Task [${task.id.padEnd(8)}] `);
  for (const arm of arms) {
    const res = await evaluateAgentTask({ task, arm });
    results.push(res);
    const mark = res.success ? '✔' : '✖';
    process.stdout.write(`${arm}: ${mark} | `);
  }
  process.stdout.write('\n');
}

console.log('\n' + '='.repeat(100));
console.log(
  'ARM'.padEnd(24) +
  'RUNS'.padEnd(8) +
  'SUCCESS'.padEnd(10) +
  'REGRESS'.padEnd(10) +
  'WRONG-LAYER'.padEnd(14) +
  'AVG LOC DIFF'.padEnd(14) +
  'AVG TOKENS'.padEnd(14) +
  'EFFICIENCY'
);
console.log('-'.repeat(100));

const labels = {
  baseline: 'Baseline Agent',
  'prompt-only': 'Prompt-Only (v0)',
  graybeard: 'Graybeard 1.1'
};

const byArm = new Map();
for (const row of results) {
  if (!byArm.has(row.arm)) byArm.set(row.arm, []);
  byArm.get(row.arm).push(row);
}

for (const [arm, items] of byArm) {
  const total = items.length;
  const success = items.filter(x => x.success).length;
  const regress = items.filter(x => x.regression).length;
  const wrongLayer = items.filter(x => x.wrongLayer).length;
  const tokens = items.reduce((s, x) => s + (x.tokens || 0), 0);
  const loc = items.reduce((s, x) => s + ((x.locAdded || 0) + (x.locDeleted || 0)), 0);
  const wasted = items.reduce((s, x) => s + (x.wastedWork || 0), 0);
  const efficiency = Number(((success / (tokens / 1000 + wasted)) * 100).toFixed(2));

  console.log(
    (labels[arm] || arm).padEnd(24) +
    String(total).padEnd(8) +
    `${((success / total) * 100).toFixed(1)}%`.padEnd(10) +
    `${((regress / total) * 100).toFixed(1)}%`.padEnd(10) +
    `${((wrongLayer / total) * 100).toFixed(1)}%`.padEnd(14) +
    `${(loc / total).toFixed(1)}`.padEnd(14) +
    `${Math.round(tokens / total)}`.padEnd(14) +
    `${efficiency}`
  );
}
console.log('='.repeat(100) + '\n');
