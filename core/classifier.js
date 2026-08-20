const TYPES = new Set(['feature','bug','refactor','architecture','security','performance','migration','concurrency','legacy','cleanup','review','unknown']);

const PATTERNS = [
  ['security', /auth|authorization|permission|secret|token|credential|tenant|access control|security/i],
  ['migration', /migration|schema|database|backfill|alter table/i],
  ['concurrency', /race|deadlock|concurr|parallel|duplicate|idempotenc|lock/i],
  ['performance', /slow|latency|throughput|memory|cpu|performance|optimi[sz]/i],
  ['architecture', /architect|redesign|system|service boundary|module boundary|distributed/i],
  ['refactor', /refactor|restructure|simplify|extract|rename|cleanup/i],
  ['bug', /bug|broken|fails?|failure|error|regression|fix|incorrect|unexpected/i],
  ['legacy', /legacy|deprecated|old code|workaround|hack|historical/i],
  ['feature', /add|implement|support|create|build|introduce/i],
];

export function inferTaskType(text = '') {
  for (const [type, pattern] of PATTERNS) if (pattern.test(text)) return type;
  return 'unknown';
}

export function normalizeTaskType(type, text = '') {
  return TYPES.has(type) ? type : inferTaskType(text);
}
