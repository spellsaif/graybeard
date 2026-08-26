import { createLedger, compactLedger, shouldStop } from './index.js';
import { routeTask } from './router.js';
import { validateTransition, enforceDecisionGate } from './gates.js';
import { evaluateHardStops } from './guard.js';
import { verifyDecision } from './oracles.js';

export function createSession(input = {}) {
  const ledger = createLedger(input.ledger);
  if (input.risk) ledger.risk = input.risk;
  if (input.confidence !== undefined) ledger.confidence = input.confidence;
  if (input.taskType) ledger.taskType = input.taskType;
  
  const plan = routeTask({ ...input, ledger });
  const stop = shouldStop(ledger);
  const session = {
    plan,
    ledger,
    stage: 'CLASSIFY',
    stop,
    compact: compactLedger(ledger)
  };
  return session;
}

export function transitionStage(session, targetStage) {
  const currentStage = session.ledger.stage || session.stage || 'CLASSIFY';
  validateTransition(currentStage, targetStage, session.ledger);
  session.ledger.stage = targetStage;
  session.stage = targetStage;
  session.compact = compactLedger(session.ledger);
  return session;
}

export function applyObservation(session, observation = {}) {
  const { ledger } = session;
  const listKeys = [
    'facts', 'unknown', 'assumptions', 'invariants',
    'causePath', 'candidates', 'rejected', 'changeSurface',
    'validation', 'falsificationAttempts'
  ];

  for (const key of listKeys) {
    if (Array.isArray(observation[key])) {
      if (!Array.isArray(ledger[key])) ledger[key] = [];
      ledger[key].push(...observation[key]);
    }
  }

  for (const [k, v] of Object.entries(observation)) {
    if (!listKeys.includes(k)) {
      ledger[k] = v;
    }
  }

  session.stop = evaluateHardStops({ ledger });
  session.compact = compactLedger(ledger);
  return session;
}

export function finalizeDecision(session, decision, validation = []) {
  session.ledger.decision = decision;
  if (Array.isArray(validation) && validation.length > 0) {
    session.ledger.validation.push(...validation);
  }
  session.compact = compactLedger(session.ledger);
  session.stop = evaluateHardStops({ ledger: session.ledger });
  
  // High-risk gate check
  if (session.plan && session.plan.risk === 'HIGH') {
    enforceDecisionGate(session.ledger);
  }

  return session;
}

export function verifySession(session, {
  root = process.cwd(),
  expectedBehavior = '',
  plannedFiles = null,
  actualDiff = null
} = {}) {
  const planned = plannedFiles || session.ledger.changeSurface;
  const proof = verifyDecision({
    root,
    decision: session.ledger.decision,
    invariant: session.ledger.invariants?.[0] || '',
    expectedBehavior,
    plannedFiles: planned,
    actualDiff
  });

  session.proof = proof;
  if (proof.verified) {
    session.ledger.allPassed = true;
    session.ledger.invariantsVerified = session.ledger.invariants || ['verified'];
  }
  session.compact = compactLedger(session.ledger);
  return { session, proof };
}
