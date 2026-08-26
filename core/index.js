import { calculateRisk, riskScore, shouldInvestigate, RISK_LEVELS } from './risk.js';
import { inferTaskType, normalizeTaskType, isPresentationIntent, TYPES } from './classifier.js';
import { SKILL_DEFS, SKILL_ORDER, skillCost, PRIMITIVES } from './skills.js';
import { inspectRepository, findRelevantFiles, findTests, findCallers, gitHistory, getDiff } from './repository.js';
import { analyzeTask } from './evidence.js';
import {
  assertChangeSurface,
  detectAlreadySolved,
  detectWrongLayer,
  detectUnsafeOperations,
  detectInvariantViolation,
  detectInsufficientEvidence,
  evaluateHardStops,
  SurgeryViolationError
} from './guard.js';
import {
  STAGES,
  STAGE_REQUIREMENTS,
  validateStageRequirements,
  validateTransition,
  enforceDecisionGate,
  DecisionGateError,
  StageRequirementError,
  TransitionError
} from './gates.js';
import { detectOracles, runOracle, verifyWorkspace, verifyDecision } from './oracles.js';

export {
  calculateRisk,
  riskScore,
  shouldInvestigate,
  RISK_LEVELS,
  inferTaskType,
  normalizeTaskType,
  isPresentationIntent,
  TYPES,
  SKILL_DEFS,
  SKILL_ORDER,
  skillCost,
  PRIMITIVES,
  inspectRepository,
  findRelevantFiles,
  findTests,
  findCallers,
  gitHistory,
  getDiff,
  analyzeTask,
  assertChangeSurface,
  detectAlreadySolved,
  detectWrongLayer,
  detectUnsafeOperations,
  detectInvariantViolation,
  detectInsufficientEvidence,
  evaluateHardStops,
  SurgeryViolationError,
  STAGES,
  STAGE_REQUIREMENTS,
  validateStageRequirements,
  validateTransition,
  enforceDecisionGate,
  DecisionGateError,
  StageRequirementError,
  TransitionError,
  detectOracles,
  runOracle,
  verifyWorkspace,
  verifyDecision
};

const clamp = (v) => Math.max(0, Math.min(1, v));
const clip = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();

export function selectSkills({ risk = 'LOW', confidence = 1, taskType = 'unknown', repeat = false, blastRadius = 0.5 } = {}) {
  const selected = new Set(['orient', 'decide', 'economy', 'verify', 'stop']);
  const isSpecialized = ['legacy', 'refactor', 'cleanup', 'security', 'migration', 'concurrency', 'architecture'].includes(taskType);
  const isTrivial = !isSpecialized && (['styling', 'docs'].includes(taskType) || (risk === 'LOW' && confidence >= 0.85));

  if (!isTrivial) {
    const uncertain = confidence < 0.7;
    if (uncertain || risk !== 'LOW' || taskType === 'unknown') selected.add('interrogate');
    if (risk !== 'LOW' || ['bug', 'performance', 'security', 'concurrency'].includes(taskType)) selected.add('trace');
    if (risk === 'HIGH' || ['security', 'migration', 'concurrency', 'architecture'].includes(taskType)) selected.add('challenge');
    if (risk === 'HIGH' || ['security', 'migration', 'concurrency', 'architecture'].includes(taskType)) selected.add('surgery');
    if (['legacy', 'refactor', 'cleanup'].includes(taskType)) selected.add('archaeology');
  }

  if (repeat || taskType === 'review') selected.add('memory');
  return SKILL_ORDER.filter(skill => selected.has(skill));
}

export function classifyTask({
  text = '',
  uncertainty = 0.5,
  impact = 0.5,
  irreversibility = 0.5,
  blastRadius = 0.5,
  confidence = 0.5,
  taskType = 'unknown',
  repeat = false,
  repositorySnapshot = null,
  root = process.cwd()
} = {}) {
  const normalizedType = normalizeTaskType(taskType, text);
  let score = riskScore({ uncertainty, impact, irreversibility, blastRadius });

  if (['styling', 'docs'].includes(normalizedType)) {
    score = Math.min(score, 0.2);
  } else {
    if (['security', 'migration', 'concurrency'].includes(normalizedType)) score = Math.max(score, 0.7);
    if (normalizedType === 'architecture') score = Math.max(score, 0.6);
  }

  const risk = score >= 0.7 ? 'HIGH' : score >= 0.35 ? 'MEDIUM' : 'LOW';
  const isFastPath = (risk === 'LOW' || (confidence >= 0.85 && blastRadius <= 0.3)) &&
    !['security', 'migration', 'concurrency', 'architecture', 'legacy'].includes(normalizedType);
  const skills = selectSkills({ risk, confidence, taskType: normalizedType, repeat, blastRadius });

  return {
    taskType: normalizedType,
    risk,
    score,
    isFastPath,
    investigate: !isFastPath && shouldInvestigate({ confidence, risk }),
    skills,
    skillCost: skillCost(skills)
  };
}

export function createLedger(overrides = {}) {
  return {
    stage: 'CLASSIFY',
    risk: 'LOW',
    confidence: 1,
    taskType: 'unknown',
    facts: [],
    unknown: [],
    assumptions: [],
    invariants: [],
    causePath: [],
    candidates: [],
    rejected: [],
    decision: '',
    changeSurface: [],
    falsificationAttempts: [],
    validation: [],
    stopReason: null,
    ...overrides,
  };
}

export function compactLedger(ledger, { maxItems = 5 } = {}) {
  const take = key => (ledger[key] ?? []).slice(-maxItems).map(v => typeof v === 'object' ? JSON.stringify(v) : clip(v));
  return {
    stage: ledger.stage ?? 'CLASSIFY',
    risk: ledger.risk,
    confidence: Number(clamp(ledger.confidence ?? 0).toFixed(2)),
    taskType: ledger.taskType ?? 'unknown',
    facts: take('facts'),
    unknown: take('unknown'),
    assumptions: take('assumptions'),
    invariants: take('invariants'),
    causePath: take('causePath'),
    candidates: take('candidates'),
    rejected: take('rejected'),
    decision: clip(ledger.decision || 'NONE'),
    changeSurface: take('changeSurface'),
    falsificationAttempts: (ledger.falsificationAttempts ?? []).slice(-maxItems),
    validation: take('validation'),
    stopReason: clip(ledger.stopReason || ''),
  };
}

export function decisionSummary(ledger) {
  const compact = compactLedger(ledger, { maxItems: 3 });
  return [
    `STAGE: ${compact.stage}`,
    `RISK: ${compact.risk}`,
    `CONFIDENCE: ${compact.confidence}`,
    `TYPE: ${compact.taskType}`,
    `FACTS: ${compact.facts.length}`,
    `UNKNOWN: ${compact.unknown.length}`,
    `INVARIANTS: ${compact.invariants.length}`,
    `REJECTED: ${compact.rejected.length}`,
    `DECISION: ${compact.decision}`,
    `VALIDATION: ${compact.validation.length}`,
  ].join('\n');
}

export function shouldStop(ledger = {}) {
  const reasons = [];
  if (ledger.alreadySolved) reasons.push('already-solved');
  if (ledger.rootCauseMismatch) reasons.push('wrong-root-cause');
  if (ledger.requirementsConflict) reasons.push('conflicting-requirements');
  if (ledger.unsafe) reasons.push('unsafe-request');
  if (ledger.invariantViolation) reasons.push('invariant-risk');
  if (ledger.insufficientEvidence || (ledger.risk === 'HIGH' && (ledger.confidence ?? 0) < 0.55)) {
    reasons.push('insufficient-evidence');
  }
  return { stop: reasons.length > 0, reasons };
}

export function decisionKey({ area, invariant, decision }) {
  return [area, invariant, decision].map(v => clip(v).toLowerCase()).join('|');
}
