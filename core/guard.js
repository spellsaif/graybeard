import path from 'node:path';
import { getDiff, inspectRepository } from './repository.js';

export class SurgeryViolationError extends Error {
  constructor(message, violations = []) {
    super(message);
    this.name = 'SurgeryViolationError';
    this.violations = violations;
  }
}

function normalizePath(p) {
  return String(p || '').replace(/\\/g, '/').replace(/^\.\//, '').trim();
}

export function assertChangeSurface({
  planned = [],
  actualDiff = null,
  actualFiles = null,
  root = process.cwd(),
  maxLocBudget = 200,
  throwOnError = false
} = {}) {
  const allowedList = Array.isArray(planned)
    ? planned
    : (planned.allowedFiles || []);
  const normalizedAllowed = new Set(allowedList.map(normalizePath));

  let modifiedFiles = [];
  let insertions = 0;
  let deletions = 0;

  if (actualFiles && Array.isArray(actualFiles)) {
    modifiedFiles = actualFiles.map(normalizePath);
  } else if (actualDiff && typeof actualDiff === 'object' && Array.isArray(actualDiff.files)) {
    modifiedFiles = actualDiff.files.map(normalizePath);
    insertions = actualDiff.insertions || 0;
    deletions = actualDiff.deletions || 0;
  } else {
    const diff = getDiff(root);
    modifiedFiles = diff.files.map(normalizePath);
    insertions = diff.insertions;
    deletions = diff.deletions;
  }

  const disallowed = modifiedFiles.filter(f => !normalizedAllowed.has(f));
  const locExceeded = (insertions + deletions) > maxLocBudget;

  const violations = [];
  if (disallowed.length > 0) {
    violations.push(`Modified files outside planned changeSurface: [${disallowed.join(', ')}]`);
  }
  if (locExceeded) {
    violations.push(`Diff LOC (${insertions + deletions}) exceeded surgical budget (${maxLocBudget})`);
  }

  const passed = violations.length === 0;

  if (!passed && throwOnError) {
    throw new SurgeryViolationError(`Surgery violation: ${violations.join('; ')}`, violations);
  }

  return {
    passed,
    disallowedFiles: disallowed,
    totalFilesModified: modifiedFiles.length,
    insertions,
    deletions,
    locExceeded,
    violations
  };
}

export function detectAlreadySolved({ text = '', repositorySnapshot = null, root = process.cwd() } = {}) {
  const snapshot = repositorySnapshot || inspectRepository(root);
  const taskStr = String(text || '').toLowerCase();
  
  // 1. Check active durable invariants
  for (const inv of snapshot.existingInvariants) {
    const invLower = inv.toLowerCase();
    const tokens = taskStr.match(/[a-z0-9_]+/g) || [];
    const matchingTokens = tokens.filter(t => t.length > 3 && invLower.includes(t));
    if (matchingTokens.length >= 2) {
      return {
        stop: true,
        reason: 'already-solved',
        evidence: `Active invariant already enforces this capability: "${inv}"`
      };
    }
  }

  // 2. Extract potential capability keywords from prompt
  const ignoredWords = new Set(['add', 'create', 'implement', 'fix', 'update', 'helper', 'function', 'utility', 'support', 'test', 'with', 'the', 'for', 'and', 'from', 'document', 'documentation']);
  const words = (taskStr.match(/[a-z0-9_]+/g) || []).filter(w => w.length >= 4 && !ignoredWords.has(w));

  // If prompt is purely docs, do not flag already-solved
  if (/\b(docs|document|documentation|readme|comment|guide)\b/i.test(taskStr)) {
    return { stop: false };
  }

  for (const word of words) {
    const matchedSymbol = snapshot.symbols.find(s => {
      const sLower = s.name.toLowerCase();
      return sLower === word || sLower.includes(word) || word.includes(sLower);
    });

    if (matchedSymbol) {
      return {
        stop: true,
        reason: 'already-solved',
        evidence: `Capability symbol '${matchedSymbol.name}' already exists in '${matchedSymbol.file}'`
      };
    }
  }

  // 3. Capability regexes
  const capabilityPatterns = [
    /idempotency/i,
    /tenant\s*isolation/i,
    /rate\s*limit/i,
    /retry/i,
    /debounce/i,
    /cache/i
  ];

  for (const pattern of capabilityPatterns) {
    if (pattern.test(taskStr)) {
      const matchWord = taskStr.match(pattern)[0].toLowerCase().replace(/\s+/g, '');
      const foundSymbol = snapshot.symbols.find(s => s.name.toLowerCase().includes(matchWord));
      if (foundSymbol) {
        return {
          stop: true,
          reason: 'already-solved',
          evidence: `Capability symbol '${foundSymbol.name}' already exists in '${foundSymbol.file}'`
        };
      }
    }
  }

  return { stop: false };
}

export function detectWrongLayer({ requestedFile = '', faultLocation = '', taskType = '' } = {}) {
  const req = normalizePath(requestedFile).toLowerCase();
  const fault = normalizePath(faultLocation).toLowerCase();

  const isUiFile = (f) => /\.(jsx|tsx|vue|svelte|css|html|ui)$/i.test(f) || /components\/|views\/|pages\//i.test(f);
  const isDbOrService = (f) => /database|db|migration|models|services|middleware|backend|api\//i.test(f);

  if (isUiFile(req) && (isDbOrService(fault) || ['concurrency', 'security', 'migration'].includes(taskType))) {
    return {
      stop: true,
      reason: 'wrong-root-cause',
      evidence: `Requested UI modification in '${requestedFile}' is at the wrong layer for ${taskType} issue located at '${faultLocation}'`
    };
  }

  return { stop: false };
}

export const UNSAFE_PATTERNS = [
  { name: 'auth-bypass', regex: /(?:if\s*\(\s*(?:true|1)\s*\)\s*(?:return|next)|ignoreAuth\s*:\s*true|bypassAuth|disableAuth|bypass authorization|drop user session|Access-Control-Allow-Origin:\s*\*|hardcode.*secret|admin secret)/i },
  { name: 'disabled-validation', regex: /(?:validate\s*=\s*\(\)\s*=>\s*true|skipValidation\s*:\s*true|@Ignore\b|@Disabled\b|@ts-ignore|skip schema validation|ignore foreign key|disable foreign key)/i },
  { name: 'tenant-leak', regex: /(?:delete\s+(?:req|query|params|context)?\.?tenantId|where\s+1\s*=\s*1\b|WHERE\s+tenant_id\s+IS\s+NULL|without checking ownership)/i },
  { name: 'weak-crypto', regex: /(?:createHash\(\s*['"]md5['"]\s*\)|createCipher\(\s*['"]des['"]\s*\)|rejectUnauthorized\s*:\s*false|algorithm from rs256 to none|plaintext|custom md5)/i },
  { name: 'unsafe-ddl', regex: /(?:DROP\s+TABLE\s+CASCADE|TRUNCATE\s+TABLE\s+users|drop retry queue|delete integration test|delete audit log)/i },
  { name: 'unsafe-resilience', regex: /(?:remove password hashing|disable csrf|remove retry backoff|single shared global connection|disable rate limit|delete fallback|expose.*cvv|raw sql query|timeout to 10 minutes|disable database transaction)/i }
];

export function detectUnsafeOperations({ patch = '', code = '', text = '' } = {}) {
  const target = `${patch || ''}\n${code || ''}\n${text || ''}`;
  const matches = [];

  for (const pattern of UNSAFE_PATTERNS) {
    if (pattern.regex.test(target)) {
      matches.push(pattern.name);
    }
  }

  if (matches.length > 0) {
    return {
      stop: true,
      reason: 'unsafe-request',
      evidence: `Detected unsafe operation patterns: [${matches.join(', ')}]`,
      unsafeMatches: matches
    };
  }

  return { stop: false };
}

export function detectInvariantViolation({ proposedChange = '', invariants = [], memoryDecisions = [] } = {}) {
  const change = String(proposedChange || '').toLowerCase();
  for (const inv of invariants) {
    const invStr = String(inv).toLowerCase();
    if (invStr.includes('must hold') || invStr.includes('never') || invStr.includes('require')) {
      if (change.includes('bypass ' + invStr) || change.includes('remove ' + invStr) || change.includes('disable ' + invStr)) {
        return {
          stop: true,
          reason: 'invariant-risk',
          evidence: `Proposed change directly violates declared invariant: "${inv}"`
        };
      }
    }
  }
  return { stop: false };
}

export function detectInsufficientEvidence({ risk = 'LOW', confidence = 1, faultLocation = null, invariants = [], falsificationAttempts = [] } = {}) {
  if (risk === 'HIGH') {
    const hasFault = faultLocation && String(faultLocation).trim().length > 0;
    const hasInvariants = Array.isArray(invariants) && invariants.length > 0;
    const hasFalsification = Array.isArray(falsificationAttempts) && falsificationAttempts.length > 0;

    if (!hasFault || !hasInvariants || !hasFalsification || confidence < 0.55) {
      return {
        stop: true,
        reason: 'insufficient-evidence',
        evidence: `HIGH risk execution lacks sufficient verified proof (faultLocation: ${Boolean(hasFault)}, invariants: ${Boolean(hasInvariants)}, falsification: ${Boolean(hasFalsification)}, confidence: ${confidence})`
      };
    }
  }
  return { stop: false };
}

export function evaluateHardStops({
  ledger = {},
  text = '',
  patch = '',
  repositorySnapshot = null,
  root = process.cwd()
} = {}) {
  const reasons = [];
  const evidenceList = [];

  // 1. Check explicit ledger flags
  if (ledger.alreadySolved) reasons.push('already-solved');
  if (ledger.rootCauseMismatch) reasons.push('wrong-root-cause');
  if (ledger.requirementsConflict) reasons.push('conflicting-requirements');
  if (ledger.unsafe) reasons.push('unsafe-request');
  if (ledger.invariantViolation) reasons.push('invariant-risk');
  if (ledger.insufficientEvidence || (ledger.risk === 'HIGH' && (ledger.confidence ?? 0) < 0.55)) {
    reasons.push('insufficient-evidence');
  }

  // 2. Deterministic Automatic Detectors
  const solved = detectAlreadySolved({ text: text || ledger.text, repositorySnapshot, root });
  if (solved.stop) {
    reasons.push(solved.reason);
    evidenceList.push(solved.evidence);
  }

  const wrongLayer = detectWrongLayer({
    requestedFile: ledger.requestedFile,
    faultLocation: ledger.faultLocation,
    taskType: ledger.taskType
  });
  if (wrongLayer.stop) {
    reasons.push(wrongLayer.reason);
    evidenceList.push(wrongLayer.evidence);
  }

  const unsafe = detectUnsafeOperations({ patch, code: ledger.code, text });
  if (unsafe.stop) {
    reasons.push(unsafe.reason);
    evidenceList.push(unsafe.evidence);
  }

  const invViolation = detectInvariantViolation({
    proposedChange: ledger.decision,
    invariants: ledger.invariants
  });
  if (invViolation.stop) {
    reasons.push(invViolation.reason);
    evidenceList.push(invViolation.evidence);
  }

  const insuff = detectInsufficientEvidence({
    risk: ledger.risk,
    confidence: ledger.confidence,
    faultLocation: ledger.faultLocation,
    invariants: ledger.invariants,
    falsificationAttempts: ledger.falsificationAttempts
  });
  if (insuff.stop && !reasons.includes('insufficient-evidence')) {
    reasons.push(insuff.reason);
    evidenceList.push(insuff.evidence);
  }

  const uniqueReasons = [...new Set(reasons)];
  return {
    stop: uniqueReasons.length > 0,
    reasons: uniqueReasons,
    evidence: evidenceList.join('; ')
  };
}
