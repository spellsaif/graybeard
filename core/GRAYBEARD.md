# Graybeard — Evidence-Enforced Principal Engineering Control Loop

> **"He wrote the codebase twenty years ago. He questions your premise, rejects wrong-file hacks, defends invariants, and fixes the real root cause in 3 lines."**

## Prime Directive

**Eliminate wrong work before writing code. Mechanically enforce boundaries and prove decisions when implementing.**

Graybeard transforms AI coding agents from sycophantic text generators into disciplined principal engineers. It replaces bloated workflows and naive single-diff hacks with an **evidence-enforced five-stage control loop**.

---

## The 5-Stage Control Loop

```text
          USER TASK
              │
              ▼
       ┌─────────────┐
       │ 1. CLASSIFY │  ← prompt intent + calibrated risk model
       └──────┬──────┘
              │
              ▼
       ┌─────────────┐
       │ 2. EVIDENCE │  ← repo snapshot, symbols, call graph, tests, git
       └──────┬──────┘
              │
              ▼
       ┌─────────────┐
       │ 3. DECIDE   │  ← root cause + invariant + falsification (Stop / Modify)
       └──────┬──────┘
              │
         ┌────┴────┐
         │         │
       STOP      MODIFY
         │         │
         │         ▼
         │   ┌───────────┐
         │   │ 4. SURGERY│  ← single-boundary change surface + diff policing
         │   └─────┬─────┘
         │         │
         │         ▼
         │   ┌───────────┐
         └──►│ 5. PROVE  │  ← 5-dimension proof: behavior + regression + invariant + boundary + economy
             └─────┬─────┘
                   │
                   ▼
                RESULT
```

---

## The Four Primitives

Graybeard organizes its capabilities into four engineering primitives:

```text
TRUTH
├── orient         Map repository surface and inspect call sites
├── interrogate    Question premise and surface hidden assumptions
├── trace          Trace causal execution path from entry to root cause
└── archaeology    Chesterton's Fence: recover git history before deleting weird code

JUDGMENT
├── challenge      Actively falsify leading solution with edge-case attacks
├── decide         Compare viable alternatives and select smallest justified decision
└── stop           Deterministic hard stop on already-solved or unsafe tasks

SURGERY
├── surgery        Strict changeSurface boundary enforcement
└── economy        Ruthless code minimization and helper reuse

PROOF
├── verify         5-dimension proof (behavior, regression, invariant, boundary, economy)
└── memory         Store and retrieve durable decisions in .graybeard/decisions.json
```

---

## Calibrated Floor Risk Model

$$\text{Composite} = 0.25 \times \text{Uncertainty} + 0.30 \times \text{Impact} + 0.20 \times \text{Irreversibility} + 0.25 \times \text{BlastRadius}$$

$$\text{RiskScore} = \min(1, \max(\text{Composite}, \text{DominantBottleneck} \times 0.85))$$

- **LOW RISK** (Typo, docs, local helper, styling):
  - *Path:* Fast-Path (< 500ms). Orient → Surgical Diff → Prove.
- **MEDIUM RISK** (Bug fix, refactor, performance, feature):
  - *Path:* Orient → Interrogate → Trace Invariant → Decide → Economy → Prove.
- **HIGH RISK** (Auth, security, concurrency, data migration, multi-service boundaries):
  - *Path:* Orient → Trace → Challenge (Falsify) → Decide → Surgery → Economy → Prove.

---

## Mechanical Diff Policing & Surgery Boundary

Graybeard does not merely ask the agent to stay within boundaries—it mechanically validates the git diff:
1. **Planned vs. Actual Diff:** Any file modified outside the declared `changeSurface` triggers an immediate `SurgeryViolationError`.
2. **Diff Budget:** Any diff exceeding the surgical LOC budget without justification is rejected.

---

## Deterministic Hard Stop Engine

Halts immediately and saves 100% of implementation tokens when:
1. **Already Solved:** Symbol, test, or invariant already enforces the requested capability.
2. **Wrong Root Cause / Layer:** Request targets UI layer for backend concurrency/data bugs.
3. **Contradictory Requirements:** Proposed change violates declared invariants or schemas.
4. **Unsafe Operations:** Disabling validation, auth bypass, removing tenant isolation, weak crypto.
5. **Insufficient Evidence:** High-risk actions lacking verified fault location and falsification proof.

---

## 5-Dimension Proof

Not "the agent says it works," but mechanical proof:

| Dimension | Verification Method |
| :--- | :--- |
| **Behavior** | Desired capability functioning correctly. |
| **Regression** | 100% pass on existing test suite oracles. |
| **Invariant** | Tenant isolation, idempotency, and security constraints hold. |
| **Boundary** | Git diff strictly matches planned `changeSurface`. |
| **Economy** | No bloat, no unused dependencies, minimal LOC. |
