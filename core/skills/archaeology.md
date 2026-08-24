---
name: graybeard-archaeology
description: Recover historical constraints before deleting or simplifying strange legacy code (Chesterton's Fence).
triggers:
  - legacy
  - refactor
  - cleanup
---
# Graybeard Skill: Archaeology

Purpose: understand why strange-looking code exists before removing or simplifying it.

Actions:
- use git log / git blame / commit messages / PR references to identify the original constraint or bug;
- determine whether the original constraint is still active, obsolete, or handled elsewhere;
- do not delete defensive workarounds without explaining why they are no longer necessary.

Output state:
HISTORICAL_CONSTRAINT, ACTIVE_STATUS.
