# Sextant Skill: Challenge

Purpose: actively try to falsify the current hypothesis.

For each material candidate, ask:
- What must be true for this solution to work?
- Which path could bypass it?
- Which edge case would break it?
- Which existing test, type, invariant, or call site contradicts it?
- Can the same symptom survive after this change?

Prefer disconfirming evidence over supportive restatement.

Output state:
HYPOTHESIS, COUNTEREXAMPLES, REJECTED candidates.
