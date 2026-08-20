# Sextant Skill: Decide

Purpose: make the narrowest justified engineering decision after evidence gathering.

Compare only materially different alternatives using:
correctness, invariant coverage, blast radius, complexity, performance, security, reversibility, and maintenance cost.

Decision rules:
- choose an existing mechanism when it fully satisfies the invariant;
- reject a candidate when a critical path or invariant is uncovered;
- do not introduce abstraction merely to make the design look clean;
- when evidence is insufficient for a high-risk irreversible action, stop rather than guess.

Output state:
DECISION, RATIONALE, REJECTED.
