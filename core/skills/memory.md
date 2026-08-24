---
name: graybeard-memory
description: Retrieve and store durable engineering decisions and invariants across sessions.
triggers:
  - repeat
  - repository
---
# Graybeard Skill: Memory

Purpose: preserve architectural decisions and invariants across agent interactions.

Actions:
- query `.graybeard/decisions.json` for prior invariant rulings in this domain;
- avoid re-debating settled architectural decisions;
- record new invariants and decisions when explicit consensus is reached.

Output state:
RECALLED_DECISIONS, STORED_DECISION.
