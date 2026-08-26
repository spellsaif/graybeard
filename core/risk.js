export const RISK_LEVELS = Object.freeze({ LOW: 1, MEDIUM: 2, HIGH: 3 });

function validate(values) {
  if (values.some(v => !Number.isFinite(v) || v < 0 || v > 1)) {
    throw new RangeError('risk factors must be between 0 and 1');
  }
}

export function riskScore({ uncertainty, impact, irreversibility, blastRadius }) {
  const values = [uncertainty, impact, irreversibility, blastRadius];
  validate(values);

  const composite =
    uncertainty * 0.25 +
    impact * 0.30 +
    irreversibility * 0.20 +
    blastRadius * 0.25;

  const dominant = Math.max(...values);

  return Math.min(1, Math.max(composite, dominant * 0.85));
}

export function calculateRisk(factors) {
  const score = riskScore(factors);
  return score >= 0.7 ? 'HIGH' : score >= 0.35 ? 'MEDIUM' : 'LOW';
}

export function shouldInvestigate({ confidence, risk }) {
  if (!(confidence >= 0 && confidence <= 1)) {
    throw new RangeError('confidence must be between 0 and 1');
  }
  return risk === 'HIGH' || confidence < 0.7;
}
