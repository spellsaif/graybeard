import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { calculateRisk, shouldInvestigate, decisionSummary, classifyTask, selectSkills, shouldStop, compactLedger, decisionKey, skillCost, inferTaskType } from '../core/index.js';
import { routeTask } from '../core/router.js';
import { createSession, applyObservation, finalizeDecision } from '../core/engine.js';
import { createMemoryStore } from '../memory/store.js';

test('low risk remains low', () => assert.equal(calculateRisk({uncertainty:.1, impact:.2, irreversibility:.1, blastRadius:.2}), 'LOW'));
test('high risk triggers investigation', () => assert.equal(calculateRisk({uncertainty:.9, impact:.9, irreversibility:.9, blastRadius:.9}), 'HIGH'));
test('low confidence triggers investigation', () => assert.equal(shouldInvestigate({confidence:.5, risk:'LOW'}), true));
test('summary is compact', () => assert.match(decisionSummary({risk:'LOW',confidence:.9,facts:['a'],invariants:['b'],decision:'reuse',validation:['test']}), /DECISION: reuse/));
test('high-risk security routing activates challenge and surgery', () => assert.deepEqual(selectSkills({risk:'HIGH', confidence:.6, taskType:'security'}), ['orient','interrogate','trace','challenge','decide','surgery','economy','verify','stop']));
test('legacy work activates archaeology', () => assert.ok(selectSkills({risk:'LOW', confidence:.9, taskType:'legacy'}).includes('archaeology')));
test('task text can be classified without explicit type', () => assert.equal(inferTaskType('fix duplicate payment race'), 'concurrency'));
test('task classifier routes by risk and confidence', () => {
  const plan = classifyTask({ uncertainty:.8, impact:.8, irreversibility:.8, blastRadius:.8, confidence:.5, taskType:'security' });
  assert.equal(plan.risk, 'HIGH');
  assert.ok(plan.skills.includes('challenge'));
  assert.ok(plan.skillCost > 0);
});
test('stop detects evidence-backed hard stops', () => assert.deepEqual(shouldStop({rootCauseMismatch:true}), {stop:true,reasons:['wrong-root-cause']}));
test('compact ledger bounds state size', () => {
  const out = compactLedger({risk:'HIGH',confidence:.991,facts:Array(20).fill('x'),unknown:Array(20).fill('u'),invariants:['i'],decision:'reuse',validation:['test']},{maxItems:3});
  assert.equal(out.facts.length, 3);
  assert.equal(out.confidence, .99);
});
test('decision key is stable', () => assert.equal(decisionKey({area:'Auth',invariant:'User must be authenticated',decision:'reuse middleware'}), 'auth|user must be authenticated|reuse middleware'));
test('router returns stop before skills', () => {
  const plan = routeTask({risk:'HIGH', confidence:.2, ledger:{unsafe:true}});
  assert.equal(plan.stop.stop, true);
  assert.deepEqual(plan.sequence, ['stop']);
});
test('router provides execution policy', () => {
  const plan = routeTask({taskType:'security', uncertainty:.9, impact:.9, irreversibility:.8, blastRadius:.7, confidence:.6});
  assert.equal(plan.policy.requireFalsification, true);
  assert.equal(plan.policy.minimizeAfterDecision, true);
});
test('session preserves compact engineering state', () => {
  const session = createSession({taskType:'bug', uncertainty:.7, impact:.7, irreversibility:.4, blastRadius:.6, confidence:.6});
  applyObservation(session, {facts:['three callers found'], invariants:['one record per event'], causePath:['HTTP→service→DB']});
  finalizeDecision(session, 'enforce idempotency at persistence boundary', ['http test','worker test']);
  assert.equal(session.ledger.facts.length, 1);
  assert.match(session.compact.decision, /idempotency/);
});
test('memory store upserts durable decisions', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(),'sextant-'));
  const store = createMemoryStore(path.join(dir,'decisions.json'));
  store.remember({area:'auth', invariant:'tenant isolation', decision:'resolve tenant before authorization'});
  store.remember({area:'auth', invariant:'tenant isolation', decision:'resolve tenant before authorization', confidence:.95});
  assert.equal(store.find({query:'tenant isolation'}).length, 1);
});

import { detectHosts, doctor } from '../core/installer.js';

test('installer exposes host detection and doctor state', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'sextant-installer-'));
  fs.mkdirSync(path.join(temp, '.opencode'));
  fs.writeFileSync(path.join(temp, 'AGENTS.md'), '# test');
  assert.ok(detectHosts(temp).includes('opencode'));
  const state = doctor(temp);
  assert.equal(state.status, 'ready');
  assert.equal(state.agentsFile, true);
});
