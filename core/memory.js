import { decisionKey } from './index.js';

export function normalizeDecision(input) {
  const value = { ...input };
  value.key = value.key ?? decisionKey(value);
  value.confidence = Math.max(0, Math.min(1, Number(value.confidence ?? 0.5)));
  value.tags = Array.isArray(value.tags) ? [...new Set(value.tags.map(String))] : [];
  value.updatedAt = value.updatedAt ?? new Date().toISOString();
  return value;
}
