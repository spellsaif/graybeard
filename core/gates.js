export class DecisionGateError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'DecisionGateError';
    this.details = details;
  }
}

export class StageRequirementError extends Error {
  constructor(stage, missing = [], details = {}) {
    super(`Stage '${stage}' requirements not satisfied: missing [${missing.join(', ')}]`);
    this.name = 'StageRequirementError';
    this.stage = stage;
    this.missing = missing;
    this.details = details;
  }
}

export class TransitionError extends Error {
  constructor(from, to, reason) {
    super(`Invalid transition from '${from}' to '${to}': ${reason}`);
    this.name = 'TransitionError';
    this.from = from;
    this.to = to;
  }
}

export const STAGES = Object.freeze({
  CLASSIFY: 'CLASSIFY',
  EVIDENCE: 'EVIDENCE',
  TRACE: 'TRACE',
  CHALLENGE: 'CHALLENGE',
  DECIDE: 'DECIDE',
  SURGERY: 'SURGERY',
  PROVE: 'PROVE'
});

export const STAGE_REQUIREMENTS = Object.freeze({
  CLASSIFY: {
    name: 'CLASSIFY',
    validate: (ledger) => {
      const missing = [];
      if (!ledger.taskType) missing.push('taskType');
      if (!ledger.risk) missing.push('risk');
      return missing;
    }
  },
  EVIDENCE: {
    name: 'EVIDENCE',
    validate: (ledger) => {
      const missing = [];
      if (!Array.isArray(ledger.facts) || ledger.facts.length === 0) missing.push('facts');
      return missing;
    }
  },
  TRACE: {
    name: 'TRACE',
    validate: (ledger) => {
      const missing = [];
      const hasFault = ledger.faultLocation !== undefined && ledger.faultLocation !== null && String(ledger.faultLocation).trim().length > 0;
      if (!hasFault) missing.push('faultLocation');
      if (!Array.isArray(ledger.causePath) || ledger.causePath.length === 0) missing.push('causePath');
      return missing;
    }
  },
  CHALLENGE: {
    name: 'CHALLENGE',
    validate: (ledger) => {
      const missing = [];
      if (!Array.isArray(ledger.falsificationAttempts) || ledger.falsificationAttempts.length === 0) {
        missing.push('falsificationAttempts');
      } else {
        const invalidAttempts = ledger.falsificationAttempts.some(a => !a.hypothesis || !a.attack || !a.result);
        if (invalidAttempts) missing.push('valid falsificationAttempts entries (hypothesis, attack, result)');
      }
      const hasDecision = (ledger.survivingDecision || ledger.decision || '').trim().length > 0;
      if (!hasDecision) missing.push('survivingDecision');
      return missing;
    }
  },
  DECIDE: {
    name: 'DECIDE',
    validate: (ledger) => {
      const missing = [];
      if (!Array.isArray(ledger.invariants) || ledger.invariants.length === 0) missing.push('invariants');
      if (!Array.isArray(ledger.candidates) || ledger.candidates.length === 0) missing.push('candidates');
      if (!Array.isArray(ledger.rejected) || ledger.rejected.length === 0) missing.push('rejected');
      const hasDecision = ledger.decision !== undefined && ledger.decision !== null && String(ledger.decision).trim().length > 0 && ledger.decision !== 'NONE';
      if (!hasDecision) missing.push('decision');
      return missing;
    }
  },
  SURGERY: {
    name: 'SURGERY',
    validate: (ledger) => {
      const missing = [];
      if (!Array.isArray(ledger.changeSurface) || ledger.changeSurface.length === 0) missing.push('changeSurface');
      return missing;
    }
  },
  PROVE: {
    name: 'PROVE',
    validate: (ledger) => {
      const missing = [];
      const tests = ledger.testsRan || ledger.validation;
      if (!Array.isArray(tests) || tests.length === 0) missing.push('testsRan/validation');
      if (ledger.allPassed !== true && ledger.verified !== true) missing.push('allPassed/verified');
      const invs = ledger.invariantsVerified || ledger.validation;
      if (!Array.isArray(invs) || invs.length === 0) missing.push('invariantsVerified');
      return missing;
    }
  }
});

export function validateStageRequirements(stage, ledger = {}) {
  const normStage = String(stage || '').toUpperCase();
  const req = STAGE_REQUIREMENTS[normStage];
  if (!req) return { valid: true, missing: [] };

  const missing = req.validate(ledger);
  if (missing.length > 0) {
    throw new StageRequirementError(normStage, missing);
  }
  return { valid: true, missing: [] };
}

export function validateTransition(fromStage, toStage, ledger = {}) {
  const from = String(fromStage || '').toUpperCase();
  const to = String(toStage || '').toUpperCase();

  // Validate that source stage requirements are satisfied before transitioning
  if (from && STAGE_REQUIREMENTS[from]) {
    const missing = STAGE_REQUIREMENTS[from].validate(ledger);
    if (missing.length > 0) {
      throw new TransitionError(from, to, `prerequisites for '${from}' not satisfied: missing [${missing.join(', ')}]`);
    }
  }

  return { allowed: true, from, to };
}

export function enforceDecisionGate(ledger = {}, { risk = 'LOW' } = {}) {
  const effectiveRisk = ledger.risk || risk;

  if (effectiveRisk === 'HIGH') {
    if (!Array.isArray(ledger.falsificationAttempts) || ledger.falsificationAttempts.length === 0) {
      throw new DecisionGateError('HIGH risk decision requires executable falsificationAttempts');
    }
    if (!Array.isArray(ledger.invariants) || ledger.invariants.length === 0) {
      throw new DecisionGateError('HIGH risk decision requires established invariants');
    }
    if (!Array.isArray(ledger.changeSurface) || ledger.changeSurface.length === 0) {
      throw new DecisionGateError('HIGH risk decision requires declared changeSurface boundary');
    }
  }

  return { passed: true };
}
