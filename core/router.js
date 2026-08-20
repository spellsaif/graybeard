import { classifyTask, shouldStop } from './index.js';

export function routeTask(input = {}) {
  const plan = classifyTask(input);
  const stop = shouldStop(input.ledger ?? {});
  return {
    ...plan,
    stop,
    sequence: stop.stop ? ['stop'] : plan.skills,
    policy: {
      allowDeepReasoning: plan.risk !== 'LOW' || plan.investigate,
      requireFalsification: plan.skills.includes('challenge'),
      requireChangeSurface: plan.skills.includes('surgery'),
      persistDecision: plan.skills.includes('memory'),
      minimizeAfterDecision: true,
    },
  };
}
