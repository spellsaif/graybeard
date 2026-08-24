---
name: graybeard-economy
description: Minimize implementation diff size and eliminate boilerplate after correctness is established.
triggers:
  - always
---
# Graybeard Skill: Economy

Purpose: write the smallest correct diff possible once the right decision is made.

Actions:
- reuse existing helpers, utilities, and standard libraries before adding new functions;
- delete obsolete scaffolding or temporary debug code;
- never add speculative wrappers, future-proofing shims, or unused parameters;
- maintain strict aesthetic and idiomatic coherence with the existing codebase.

Output state:
DIFF_SIZE, REUSED_SYMBOLS.
