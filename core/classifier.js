export const TYPES = new Set([
  'feature', 'bug', 'refactor', 'architecture', 'security',
  'performance', 'migration', 'concurrency', 'legacy', 'cleanup',
  'review', 'styling', 'docs', 'unknown'
]);

const PRESENTATION_PATTERN = /\b(css|style|styles|styling|color|background|theme|dark mode|font|padding|margin|icon|badge|svg|typo|spelling|comment|docs|documentation|readme|markdown|changelog|guidelines?|contributing|label|copy|text|button text|formatting|layout|header title)\b/i;
const VULNERABILITY_PATTERN = /\b(bypass|vulnerab\w*|leak\w*|injection|escalat\w*|rce|csrf|xss|exploit\w*|impersonat\w*|isolation|broken auth|flaw|cve|unauthorized|privilege\w*|signing key\w*|secret)\b/i;

const DOMAIN_PATTERNS = [
  ['security', /\b(auth\w*|permission\w*|secret\w*|credential\w*|tenant\w*|access control|session\w*|jwt|oauth|signature\w*|signing key\w*|private key\w*|key rotation|csrf|xss|sql injection|privilege\w*|pci-dss|unauthorized|cors|allow-origin)\b/i],
  ['migration', /\b(migrat\w*|schema\w*|database|backfill\w*|alter table|foreign key\w*|ddl|partitioning|table split|two-phase)\b/i],
  ['concurrency', /\b(race condition\w*|deadlock\w*|concurr\w*|mutex\w*|semaphore\w*|parallel write\w*|duplicate order\w*|duplicate write\w*|duplicate charge\w*|idempotenc\w*|idempotent\w*|lock contention|distributed lock\w*|optimistic lock\w*|compare-and-swap|kafka consumer|out-of-order)\b/i],
  ['performance', /\b(latency|throughput|memory leak\w*|cpu spike\w*|high load|optimi[sz]\w*|cache hit\w*|slow query\w*|lru|stream\w*|memoiz\w*|starvation|timeout)\b/i],
  ['architecture', /\b(architect\w*|redesign\w*|system boundary|service boundary|module boundary|domain boundary|domain service\w*|microservice\w*|distributed|stateless)\b/i],
  ['legacy', /\b(legacy|deprecated|old code|historical constraint|workaround|hack|chesterton|syncworker|ancient|retry loop|compatibility shim)\b/i],
  ['refactor', /\b(refactor\w*|restructure\w*|simplify\w*|extract function\w*|rename module\w*|cleanup|consolidate\w*|modularize\w*|standardize)\b/i],
  ['bug', /\b(bug|broken|fails?|failure\w*|error\w*|crash\w*|regression\w*|exception\w*|unexpected|incorrect|drift|off-by-one|null pointer|traversal|sanitize)\b/i],
  ['feature', /\b(add\w*|implement\w*|support\w*|create\w*|build\w*|introduce\w*|new feature\w*|slugify|clamp|chunk)\b/i],
];

export function isPresentationIntent(text = '') {
  return PRESENTATION_PATTERN.test(text) && !VULNERABILITY_PATTERN.test(text);
}

export function inferTaskType(text = '') {
  const str = String(text || '').trim();
  if (!str) return 'unknown';

  if (isPresentationIntent(str)) {
    if (/\b(docs|readme|comment|documentation|typo|spelling|changelog|contributing|guidelines?)\b/i.test(str)) return 'docs';
    return 'styling';
  }

  for (const [type, pattern] of DOMAIN_PATTERNS) {
    if (pattern.test(str)) return type;
  }

  return 'unknown';
}

export function normalizeTaskType(type, text = '') {
  if (type && type !== 'unknown' && TYPES.has(type)) return type;
  const inferred = inferTaskType(text);
  return inferred !== 'unknown' ? inferred : (TYPES.has(type) ? type : 'unknown');
}
