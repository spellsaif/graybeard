# Graybeard Engineering Benchmark

The Graybeard benchmark evaluates AI coding agent performance across real-world software engineering scenarios, measuring **wasted engineering work**, **decision correctness**, and **token efficiency**.

## Benchmark Arms

- **Arm A: Baseline Agent** — Raw model out-of-the-box (no system skill).
- **Arm B: Minimalism-Only** — Strict code minimization only (Ponytail ruleset).
- **Arm C: Graybeard** — Complete Principal Precision Judgment & Surgical Minimalism Engine.

All arms are evaluated using identical models, temperature settings, tool interfaces, and git repository fixture commits.

## Evaluation Dimensions

1. **Task Success Rate:** Verified by deterministic test suites and invariant validation.
2. **Total Tokens & Cost:** Combined prompt input, dynamic skill loading, and output token burn.
3. **Wrong-Path Avoidance:** Rejection of false premises before editing files.
4. **Diff Economy:** Minimal LOC added/modified to achieve complete correctness.
5. **Regression Rate:** Zero-breakage on existing test contracts and silent edge cases.
6. **Hard Stop Accuracy:** Percentage of redundant or unsafe tasks halted immediately without wasted generation.

## Primary Scoring Function

$$\text{Engineering Efficiency} = \frac{\text{Successful Tasks}}{\text{Total Tokens} + \text{Weighted Wasted Work}}$$
