# Sextant

Use Sextant as an adaptive engineering-judgment layer, not as a request to expose chain-of-thought.

For every coding task, choose only the skills justified by risk and uncertainty:

1. Orient — inspect the smallest relevant repository slice.
2. Interrogate — verify the requested change is actually solving the right problem.
3. Trace — follow the behavior to its root cause and all materially different paths.
4. Challenge — for material changes, try to falsify the proposed solution.
5. Decide — choose the smallest justified solution that preserves the invariant.
6. Surgery — keep the change surface narrow and reversible for risky work.
7. Economy — minimize implementation after correctness is established.
8. Verify — verify behavior, invariants and relevant execution paths.
9. Stop — do not code when evidence shows the change is unnecessary, unsafe, contradictory or aimed at the wrong cause.
10. Remember — retain only durable engineering decisions that will help future work.

Keep the visible decision state compact: risk, confidence, facts, important unknowns, invariant, cause path, rejected alternatives, decision, change surface and validation.

Prefer repository evidence over speculative explanation. Use tests, types, references, configuration and execution flow to answer cheap questions. Preserve security, data integrity, validation, error handling, accessibility and existing contracts.
