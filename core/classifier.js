export const TYPES = new Set([
  'feature', 'bug', 'refactor', 'architecture', 'security',
  'performance', 'migration', 'concurrency', 'legacy', 'cleanup',
  'review', 'styling', 'docs', 'unknown'
]);

const PRESENTATION_PATTERN = /\b(css|style|styles|styling|color|background|theme|dark mode|font|padding|margin|icon|badge|svg|typo|spelling|comment|docs|documentation|readme|markdown|label|copy|text|button text|formatting|layout|header title)\b/i;
const VULNERABILITY_PATTERN = /\b(bypass|vulnerab|leak|injection|escalat|rce|csrf|xss|exploit|impersonat|isolation|broken auth|flaw|cve|unauthorized|privilege)\b/i;

const DOMAIN_PATTERNS = [
  ['security', /\b(auth|authorization|permission|secret|credential|tenant|access control|session|jwt|oauth|signature)\b/i],
  ['migration', /\b(migration|schema|database|backfill|alter table|foreign key|ddl)\b/i],
  ['concurrency', /\b(race condition|deadlock|concurr|mutex|semaphore|parallel write|duplicate order|idempotenc|lock contention)\b/i],
  ['performance', /\b(latency|throughput|memory leak|cpu spike|high load|optimi[sz]|cache hit|slow query)\b/i],
  ['architecture', /\b(architect|redesign|system boundary|service boundary|module boundary|distributed)\b/i],
  ['legacy', /\b(legacy|deprecated|old code|historical constraint|workaround|hack)\b/i],
  ['refactor', /\b(refactor|restructure|simplify|extract function|rename module|cleanup)\b/i],
  ['bug', /\b(bug|broken|fails?|failure|error|crash|regression|exception|unexpected|incorrect)\b/i],
  ['feature', /\b(add|implement|support|create|build|introduce|new feature)\b/i],
];

export function isPresentationIntent(text = '') {
  return PRESENTATION_PATTERN.test(text) && !VULNERABILITY_PATTERN.test(text);
}

export function inferTaskType(text = '') {
  const str = String(text || '').trim();
  if (!str) return 'unknown';

  // If the intent is purely presentation/cosmetic (and no critical vulnerability keywords),
  // route to styling/docs to prevent keyword hijacking
  if (isPresentationIntent(str)) {
    if (/\b(docs|readme|comment|documentation|typo|spelling)\b/i.test(str)) return 'docs';
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
