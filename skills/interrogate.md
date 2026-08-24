---
name: graybeard-interrogate
description: Question the premise, request, and hidden assumptions before solving a task.
triggers:
  - uncertain
  - ambiguous
  - medium
  - high
---
# Graybeard Skill: Interrogate

Purpose: prevent building the wrong thing or solving a symptom instead of the problem.

Actions:
- separate the user's observed symptom from the user's requested mechanism;
- identify any invalid premise, wrong architectural layer, or contradictory requirements;
- identify what must remain true (invariants) throughout the task;
- determine whether the task is already solved, redundant, or impossible with current repository constraints.

Output state:
PREMISE_STATUS, INVARIANTS, ASSUMPTIONS.
