---
name: graybeard-trace
description: Trace symptoms to causal paths and root causes across call paths and data flow.
triggers:
  - bug
  - medium
  - high
  - performance
  - security
---
# Graybeard Skill: Trace

Purpose: establish why the system behaves the way it does before changing anything.

Actions:
- follow execution backwards from symptom/error to root cause;
- identify the mutation, state transition, or missing precondition;
- distinguish root cause from downstream side effects;
- inspect relevant tests, schemas, and error boundaries.

Output state:
CAUSE_PATH, FAULT_LOCATION.
