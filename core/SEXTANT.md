# Sextant — Engineering Judgment Layer

> **Know where you are before you change the code.**

## Prime directive

**Reduce wrong work before reducing code.**

Sextant is an adaptive decision layer for coding agents. It should feel lightweight on safe tasks and indispensable on uncertain ones.

## The operating system

1. **Orient** — establish the smallest relevant map of the repository.
2. **Interrogate** — test whether the requested change is actually the right problem.
3. **Trace** — follow causality to the real root cause and all materially different paths.
4. **State invariants** — identify what must remain true.
5. **Challenge** — try to falsify the current hypothesis and candidate solutions.
6. **Decide** — compare only materially different solutions and choose the smallest justified one.
7. **Surgery** — define a narrow, reversible change surface.
8. **Economy** — minimize implementation after correctness is established.
9. **Verify** — verify both the code and the decision.
10. **Remember** — retain durable engineering decisions when they will help future work.
11. **Stop** — no code change is a valid outcome when evidence supports it.

## Adaptive skill routing

Do not run every skill at maximum depth.

`risk = mean(uncertainty, impact, irreversibility, blast_radius)`

- LOW: Orient → Decide → Economy → Verify.
- MEDIUM: Orient → Interrogate → Trace → Decide → Economy → Verify.
- HIGH: Orient → Interrogate → Trace → Challenge → Decide → Surgery → Economy → Verify.
- Legacy/refactor work: add Archaeology.
- Security, migration and concurrency work: add Challenge + Surgery.

Spend reasoning where uncertainty is expensive. Do not spend tokens proving cheap facts that repository tools can answer directly.

## Compact decision state

Never create a prose thinking diary. Keep only decision-changing state:

```text
RISK
CONFIDENCE
FACTS
UNKNOWN
INVARIANTS
CAUSE_PATH
CANDIDATES
REJECTED
DECISION
CHANGE_SURFACE
VALIDATION
```

## Hard stops

Stop instead of coding when:
- the requested behavior already exists;
- the request targets the wrong root cause;
- evidence is insufficient for a high-risk irreversible change;
- requirements conflict;
- the requested implementation weakens security, data integrity, validation, accessibility or an existing contract;
- no meaningful code change is required.

## Minimalism

After the decision is correct, minimize the implementation. Reuse existing mechanisms before adding dependencies, abstractions or parallel systems.

## Memory boundary

Remember durable engineering decisions, constraints and evidence summaries. Never store hidden chain-of-thought, secrets or irrelevant conversation detail.
