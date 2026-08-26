# Graybeard Engineering Benchmark Suite

The Graybeard benchmark evaluates AI coding agent performance across **100 realistic software engineering tasks**, measuring **wasted engineering work**, **decision correctness**, **wrong-path avoidance**, **regression rate**, and **token efficiency**.

## Benchmark Methodology & Arms

1. **Arm A: Baseline Agent** — Raw model out-of-the-box (no system skill or judgment protocol; blindly executes all requests).
2. **Arm B: Prompt-Only Protocol (v0)** — Textual principal engineer reasoning protocol without mechanical gates.
3. **Arm C: Graybeard 1.1 (5-Stage Control Loop)** — Evidence-enforced engineering control loop with mechanical gates, diff policing, and 5-dimension proof.

## Task Distribution (100 Engineering Tasks)

- **20 LOW-Risk Tasks** (CSS, styling, typo fixes, docs, local helper functions).
- **20 MEDIUM-Risk Tasks** (Bug fixes, refactoring, memoization, query optimization, local validations).
- **20 HIGH-Risk Tasks** (Concurrency race conditions, distributed locking, multi-tenant isolation, auth validation, migrations).
- **20 Adversarial Tasks** (Misleading tickets pointing at wrong layers, prompt injection traps, Chesterton's Fences, unsafe refactor requests).
- **20 Already-Solved / Wrong-Premise Tasks** (Requests for existing capabilities, requests violating hard invariants, or unsafe security bypasses requiring deterministic **HARD STOP**).

## Evaluation Metrics

| Metric | Description |
| :--- | :--- |
| **Task Success Rate** | Percentage of tasks completely solved without defects. |
| **Regression Rate** | Percentage of tasks that broke existing test contracts or silent invariants. |
| **Wrong-Path Rate** | Edits made to the wrong architectural layer (e.g. debouncing UI instead of DB idempotency). |
| **Wasted Work Score** | Wasted engineering actions, discarded diffs, and invalid code generation. |
| **Hard-Stop Precision & Recall** | Accuracy of halting redundant, unsafe, or contradictory requests immediately. |
| **Engineering Efficiency** | $\text{Efficiency} = \frac{\text{Successful Tasks}}{\text{Total Tokens / 1000} + \text{Wasted Work}} \times 100$ |

## Measured Benchmark Results

```text
===============================================================================================
ARM                       TASKS   SUCCESS   REGRESS   WRONG-PATH  AVG TOKENS    WASTED WORK   EFFICIENCY
-----------------------------------------------------------------------------------------------
Baseline Agent            100     35.0%     65.0%     55.0%       7,260         6,350         0.49
Prompt-Only Protocol (v0) 100     78.0%     22.0%      6.0%       3,570         1,620         3.95
Graybeard 1.1 Control Loop100     94.0%      3.0%      3.0%       3,339           240        16.38
===============================================================================================
```

## Key Findings

1. **Diff Policing & Boundary Enforcement:** Graybeard achieves strict surgical change control by mechanically rejecting diffs that exceed the declared `changeSurface`.
2. **Deterministic Hard Stops:** Graybeard detects already-solved, wrong-root-cause, and unsafe requests before files are edited, saving 100% of wasted implementation tokens.
3. **Wrong-Path Elimination:** By interrogating the premise and tracing root causes at the evidence layer, Graybeard achieves an order-of-magnitude reduction in wrong-path edits compared to unconstrained agents.
4. **Engineering Efficiency:** Graybeard delivers **16.38 efficiency**, a **33x improvement over baseline** (0.49) and **4.1x over prompt-only v0** (3.95).

## Running the Benchmark

```bash
# Execute 100-task deterministic evaluation across all 3 arms
npm run benchmark:run

# Score and summarize benchmark results
npm run benchmark:score

# Run agentic evaluation on isolated git workspaces
npm run benchmark:agentic
```
