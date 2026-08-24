---
name: graybeard-stop
description: Permit an evidence-backed early halt or no-change decision when appropriate.
triggers:
  - always
---
# Graybeard Skill: Stop

Purpose: save 100% of execution tokens by halting when code modification is inappropriate or dangerous.

Actions:
- halt immediately if the problem is already solved in the codebase;
- halt immediately if the user request targets a symptom at the wrong architectural layer;
- halt immediately if the request contradicts explicit invariants, test contracts, or security rules;
- output clear, reproducible evidence explaining why no code was changed.

Output state:
STOP_REASON, EVIDENCE.
