# Sextant vs Ponytail benchmark

The benchmark is designed to test the claim that Sextant reduces **wasted engineering work**, not merely prompt length.

## Arms

A. Baseline agent — no skill.
B. Ponytail — official current ruleset.
C. Sextant — v1.0 protocol.
D. Optional combined arm — Sextant + Ponytail.

Keep model, temperature, tools, repository commit, task wording, and execution limits identical.

## Primary metrics

1. Task success rate.
2. Total input + output tokens.
3. Total model/tool cost.
4. Wall-clock time.
5. Failed implementation attempts.
6. Reverted or abandoned changes.
7. Files changed.
8. Unnecessary LOC changed, scored by blinded review.
9. Regression count.
10. Human interventions.

## Sextant-specific metrics

- Wrong-path investigations avoided.
- Incorrect hypotheses rejected before implementation.
- No-change decisions that were judged correct.
- Clarifications requested when requirements were genuinely contradictory.

## Primary score

`successful tasks / total cost`

Secondary score:

`successful tasks / (tokens + weighted wasted-work events)`

Do not claim superiority from a single run. Use repeated runs and publish per-task results, failures and limitations.

## Task classes

- trivial change
- existing-utility reuse
- bug with obvious root cause
- bug with misleading symptom
- cross-module refactor
- database migration
- concurrency bug
- security-sensitive change
- ambiguous requirement
- architecture change

The hypothesis is that Ponytail should remain excellent on minimal implementation tasks, while Sextant should reduce wrong-path work on high-uncertainty/high-impact tasks.
