# Sextant Skill: Trace

Purpose: follow causality instead of following the filename or ticket wording.

Trace the smallest useful path:
entry point -> calls -> state/data mutation -> side effect -> persistence/external boundary -> observed symptom.

For cross-module problems, identify every materially different path that can produce the behavior.

Output state:
CAUSE_PATH, ROOT_CAUSE, COVERAGE_GAPS.
