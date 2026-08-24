---
name: graybeard-verify
description: Verify both behavioral correctness and invariant preservation.
triggers:
  - always
---
# Graybeard Skill: Verify

Purpose: ensure the fix solved the problem without breaking existing contracts.

Actions:
- verify the primary bug or feature goal with deterministic checks or tests;
- verify that core invariants were preserved;
- verify that no accidental files, debug statements, or dependencies were added.

Output state:
VERIFICATION_RESULTS, INVARIANT_STATUS.
