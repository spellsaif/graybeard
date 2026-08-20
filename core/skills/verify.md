# Sextant Skill: Verify

Purpose: verify both the implementation and the decision that led to it.

Verify:
- the requested behavior;
- the stated invariant(s);
- all materially different execution paths;
- relevant tests, types, lint/build checks and migrations;
- absence of collateral contract/security/data-integrity regressions.

If verification disproves the decision, return to Trace/Challenge/Decide instead of patching blindly.

Output state:
VALIDATION, REGRESSIONS, DECISION_CONFIRMED.
