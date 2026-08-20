# Sextant Skill: Interrogate

Purpose: test whether the requested change is actually the right problem to solve.

Ask only decision-changing questions:
- What observed behavior is wrong?
- What evidence shows the proposed change addresses it?
- Which assumptions are unverified?
- Is the requested change already present, partially present, or aimed at the wrong layer?
- What requirement or invariant is actually being protected?

Hard stop when evidence shows the request is unnecessary, contradictory, unsafe, or aimed at the wrong cause.

Output state:
PROBLEM, ASSUMPTIONS, UNKNOWN, STOP_REASON when applicable.
