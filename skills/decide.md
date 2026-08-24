---
name: graybeard-decide
description: Compare viable alternatives and choose the smallest justified decision.
triggers:
  - always
---
# Graybeard Skill: Decide

Purpose: pick the simplest intervention that completely satisfies the invariants.

Actions:
- prefer no code change (configuration, existing helper, standard library);
- prefer localized changes over distributed changes;
- prefer explicit assertions/invariants over defensive propagation;
- explicitly reject over-engineered candidates with brief reasons.

Output state:
DECISION, REJECTED_CANDIDATES.
