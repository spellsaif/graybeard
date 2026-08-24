---
name: graybeard-surgery
description: Bound risky change surface and minimize blast radius for high-risk modifications.
triggers:
  - high
  - migration
  - security
  - concurrency
  - architecture
---
# Graybeard Skill: Surgery

Purpose: prevent ripple effects and unintended side effects during high-risk edits.

Actions:
- restrict the change surface to a single semantic boundary;
- define the exact file, symbol, or schema entry to modify;
- avoid speculative refactoring in adjacent code while performing a targeted fix;
- ensure rollback is trivial (clean, isolated diff).

Output state:
CHANGE_SURFACE, BLAST_RADIUS.
