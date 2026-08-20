export const SKILL_DEFS = Object.freeze({
  orient: { phase: 'understand', cost: 1, triggers: ['always'], purpose: 'Map the relevant repository surface before changing code.' },
  interrogate: { phase: 'understand', cost: 2, triggers: ['uncertain', 'ambiguous', 'medium', 'high'], purpose: 'Question the premise, request, and hidden assumptions.' },
  trace: { phase: 'diagnose', cost: 2, triggers: ['bug', 'medium', 'high', 'performance', 'security'], purpose: 'Trace symptoms to causal paths and root causes.' },
  challenge: { phase: 'judge', cost: 3, triggers: ['high', 'security', 'migration', 'concurrency', 'architecture'], purpose: 'Try to falsify the leading solution before implementation.' },
  decide: { phase: 'judge', cost: 2, triggers: ['always'], purpose: 'Compare viable alternatives and choose the smallest justified decision.' },
  surgery: { phase: 'execute', cost: 2, triggers: ['high', 'migration', 'security', 'concurrency', 'architecture'], purpose: 'Bound risky change surface and rollback exposure.' },
  economy: { phase: 'execute', cost: 1, triggers: ['always'], purpose: 'Minimize implementation after correctness is established.' },
  verify: { phase: 'verify', cost: 2, triggers: ['always'], purpose: 'Verify both implementation behavior and the original decision.' },
  stop: { phase: 'verify', cost: 0, triggers: ['always'], purpose: 'Permit a justified no-change or pause decision.' },
  archaeology: { phase: 'understand', cost: 2, triggers: ['legacy', 'refactor', 'cleanup'], purpose: 'Recover historical constraints before deleting or simplifying strange code.' },
  memory: { phase: 'context', cost: 1, triggers: ['repeat', 'repository'], purpose: 'Retrieve and store durable engineering decisions.' },
});

export const SKILL_ORDER = Object.freeze(Object.keys(SKILL_DEFS));

export function skillCost(skills) {
  return skills.reduce((sum, skill) => sum + (SKILL_DEFS[skill]?.cost ?? 0), 0);
}
