#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2] || 'benchmarks/results.json';
if (!fs.existsSync(file)) {
  console.error(`Missing benchmark results: ${file}`);
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const rows = Array.isArray(data) ? data : data.results;
if (!Array.isArray(rows)) throw new Error('Expected an array or {results: []}.');
const byArm = new Map();
for (const row of rows) {
  const arm = row.arm;
  if (!byArm.has(arm)) byArm.set(arm, []);
  byArm.get(arm).push(row);
}
for (const [arm, items] of byArm) {
  const success = items.filter(x => x.success).length;
  const cost = items.reduce((s, x) => s + (Number(x.cost) || 0), 0);
  const tokens = items.reduce((s, x) => s + (Number(x.tokens) || 0), 0);
  const wasted = items.reduce((s, x) => s + (Number(x.wastedWork) || 0), 0);
  console.log(JSON.stringify({ arm, tasks: items.length, successRate: success / items.length, totalCost: cost, totalTokens: tokens, wastedWork: wasted, successPerCost: cost ? success / cost : null }, null, 2));
}
