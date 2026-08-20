import { createLedger, compactLedger, shouldStop } from './index.js';
import { routeTask } from './router.js';

export function createSession(input = {}) {
  const ledger = createLedger(input.ledger);
  const plan = routeTask({ ...input, ledger });
  return { plan, ledger };
}

export function applyObservation(session, observation = {}) {
  const { ledger } = session;
  for (const key of ['facts','unknown','assumptions','invariants','causePath','candidates','rejected','changeSurface','validation']) {
    if (Array.isArray(observation[key])) ledger[key].push(...observation[key]);
  }
  Object.assign(ledger, Object.fromEntries(Object.entries(observation).filter(([k]) => !Array.isArray(session.ledger[k]))));
  session.stop = shouldStop(ledger);
  session.compact = compactLedger(ledger);
  return session;
}

export function finalizeDecision(session, decision, validation = []) {
  session.ledger.decision = decision;
  session.ledger.validation.push(...validation);
  session.compact = compactLedger(session.ledger);
  session.stop = shouldStop(session.ledger);
  return session;
}
