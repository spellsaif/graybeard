---
name: graybeard-challenge
description: Try to falsify the leading solution and identify edge case failure paths before implementation.
triggers:
  - high
  - security
  - migration
  - concurrency
  - architecture
---
# Graybeard Skill: Challenge

Purpose: attack the proposed decision before writing code to prevent regressions.

Actions:
- actively seek counterexamples to the proposed fix;
- test edge cases mentally or with quick scratch checks (nulls, empty collections, races, tenant leakage, retries, rollbacks);
- if the solution introduces new invariants or hidden coupling, reject it in favor of a simpler one.

Output state:
FALSIFICATION_ATTEMPTS, SURVIVING_DECISION.
