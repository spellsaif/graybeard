<p align="center">
  <img src="https://raw.githubusercontent.com/spellsaif/sextant/refs/heads/master/assets/logo.png" width="220" alt="Graybeard - The Evidence-Enforced Principal Engineering Control Loop">
</p>

<h1 align="center">Graybeard 🧙‍♂️</h1>

<p align="center">
  <em>The Evidence-Enforced Principal Engineering Control Loop for AI Coding Agents.</em>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/graybeard"><img src="https://img.shields.io/badge/npm-v1.1.0-blue.svg?style=flat-square" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="MIT License"></a>
  <a href="tests/core.test.js"><img src="https://img.shields.io/badge/tests-51%2F51%20passing-brightgreen.svg?style=flat-square" alt="Tests"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/node-%3E%3D18.0.0-informational.svg?style=flat-square" alt="Node.js"></a>
  <a href="#-supported-coding-agents--installation"><img src="https://img.shields.io/badge/works%20with-12%20AI%20Agents-blueviolet.svg?style=flat-square" alt="12 Agents"></a>
</p>

---

## 📖 Table of Contents

- [Meet Graybeard](#-meet-graybeard)
- [The Problem with Raw Agents & Prompt Ladders](#-the-problem-with-raw-agents--prompt-ladders)
- [The 5-Stage Control Loop Architecture](#-the-5-stage-control-loop-architecture)
- [The Four Core Primitives](#-the-four-core-primitives)
- [Stage Transition Contracts & Entry/Exit Gates](#-stage-transition-contracts--entryexit-gates)
- [Mechanical Diff Policing & Boundary Guard](#-mechanical-diff-policing--boundary-guard)
- [Deterministic Hard Stop Engine](#-deterministic-hard-stop-engine)
- [Calibrated Floor Risk Model](#-calibrated-floor-risk-model)
- [5-Dimension Decision Proof](#-5-dimension-decision-proof)
- [Deterministic Benchmark Suite (100 Tasks Across 4 Arms)](#-deterministic-benchmark-suite-100-tasks-across-4-arms)
- [Supported Coding Agents & Installation](#-supported-coding-agents--installation)
- [CLI Reference](#-cli-reference)
- [Programmatic API](#-programmatic-api)
- [License](#-license)

---

## 🧙‍♂️ Meet Graybeard

You know him. 

He sits in the corner office with a faded Sun Microsystems mug and a mechanical keyboard with blank keycaps. He was committing to trunk before git was invented. 

When you rush to his desk in a panic because production is down, he doesn't frantically start editing files. He sips his black coffee, opens your PR, asks **one uncomfortable question** that destroys your entire architectural premise, and points to a 3-line database constraint that fixes everything permanently.

**Graybeard turns that Principal Engineer judgment into an evidence-enforced mechanical control loop.**

---

## ⚡ The Problem with Raw Agents & Prompt Ladders

Most AI coding tools fail in subtle, expensive ways:

1. **The "Wrong Layer" Trap:** A user reports duplicate orders. A raw agent modifies 5 frontend files with debounce hooks. A prompt-only minimalism ladder (like Ponytail) writes a 1-line `disabled={isSubmitting}` button hack. **Both fail in production** when background retries or mobile APIs hit the server. Graybeard questions the premise, discovers the true fault, and adds a database idempotency constraint.
2. **Deleting Chesterton's Fences:** A user asks to remove a "weird 500ms sleep" in a worker. Prompt-only minimalism deletes it as "bloat"—instantly causing downstream third-party rate-limit outages. Graybeard inspects git history (`archaeology`), uncovers the 2 req/sec throttling constraint, and halts with proof.
3. **Diff Sprawl & Lack of Boundaries:** Models start editing files they were never asked to touch. Graybeard mechanically enforces a single `changeSurface` boundary and rejects unexpected diffs via compiler/git-level guards.

| Scenario | Raw Coding Agent (Intern) | Ponytail (Lazy Senior Prompt) | Graybeard (Principal Engineer Control Loop) |
| :--- | :--- | :--- | :--- |
| **User asks for a Date Picker** | Installs 3 npm packages, writes 400 lines of wrapper CSS, creates timezone context. | Writes `<input type="date">` in 1 line. *(Wins!)* | Classifies `styling/low-risk` $\rightarrow$ Fast-Path (< 500ms) $\rightarrow$ Writes `<input type="date">` in 1 line. *(Wins!)* |
| **Ticket: "Debounce checkout button to prevent duplicate orders"** | Adds debounce hooks, event listeners, loading spinners in 5 frontend files. | Writes `disabled={isSubmitting}` on `CheckoutButton.tsx` (2 lines). *(Fails in production!)* | **Questions premise & traces causality:** Network retries and mobile API calls bypass UI. Applies unique idempotency constraint at database layer (3 lines). |
| **Ticket: "Delete this weird 500ms sleep in `syncWorker.ts`"** | Refactors entire worker into an async generator. | Deletes 15 lines as "YAGNI bloat". *(Causes API rate-limit outage!)* | **Invokes Chesterton's Fence (`archaeology`):** Inspects git history, proves 3rd-party API throttles at 2 req/sec, halts with deterministic evidence. |

---

## 🔄 The 5-Stage Control Loop Architecture

Graybeard enforces a strict 5-stage engineering state machine:

```text
          USER TASK
              │
              ▼
       ┌─────────────┐
       │ 1. CLASSIFY │  ← Prompt intent + benchmark-calibrated floor risk model
       └──────┬──────┘
              │
              ▼
       ┌─────────────┐
       │ 2. EVIDENCE │  ← Repo snapshot: symbols, callers graph, tests, schemas, git
       └──────┬──────┘
              │
              ▼
       ┌─────────────┐
       │ 3. DECIDE   │  ← Root cause + invariant + falsification (Stop / Modify)
       └──────┬──────┘
              │
         ┌────┴────┐
         │         │
       STOP      MODIFY
         │         │
         │         ▼
         │   ┌───────────┐
         │   │ 4. SURGERY│  ← Single-boundary changeSurface + diff policing
         │   └─────┬─────┘
         │         │
         │         ▼
         │   ┌───────────┐
         └──►│ 5. PROVE  │  ← 5-dimension proof: Behavior + Regression + Invariant + Boundary + Economy
             └─────┬─────┘
                   │
                   ▼
                RESULT
```

---

## 🏛️ The Four Core Primitives

Graybeard organizes its 11 modular engineering skills into four fundamental primitives:

```text
TRUTH
├── orient         Map repository surface and inspect call sites before changing code
├── interrogate    Question premises and surface hidden assumptions
├── trace          Trace causal execution path from entry point to root cause
└── archaeology    Chesterton's Fence: recover git history before touching legacy code

JUDGMENT
├── challenge      Actively falsify leading solution with structured attacks
├── decide         Compare viable alternatives and select the smallest justified decision
└── stop           Deterministic hard stop on already-solved or unsafe tasks

SURGERY
├── surgery        Strict changeSurface boundary enforcement
└── economy        Ruthless code minimization and standard library / helper reuse

PROOF
├── verify         5-dimension mechanical proof (behavior, regression, invariant, boundary, economy)
└── memory         Store and retrieve durable decisions in .graybeard/decisions.json
```

---

## 🔒 Stage Transition Contracts & Entry/Exit Gates

Graybeard does not rely on model obedience. It mechanically blocks progression until stage prerequisites exist:

```javascript
import { validateTransition, STAGES } from 'graybeard/gates';

// Attempting to move to SURGERY without a declared changeSurface throws TransitionError
validateTransition(STAGES.DECIDE, STAGES.SURGERY, {
  decision: "Add unique index",
  changeSurface: [] // ❌ Missing change surface!
});
// Error: Stage 'SURGERY' requirements failed: changeSurface must contain at least 1 file
```

- **`TRACE` Gate:** Requires identified `faultLocation` and `causePath.length >= 1`.
- **`DECIDE` Gate:** Requires `invariants.length >= 1`, `candidates.length >= 1`, `rejected.length >= 1`, and `decision != null`.
- **`CHALLENGE` Gate:** HIGH risk decisions require executable `falsificationAttempts` (`hypothesis`, `attack`, `result`).
- **`SURGERY` Gate:** Requires explicit `changeSurface.length >= 1`.
- **`PROVE` Gate:** Requires `testsRan.length >= 1`, `allPassed === true`, and `invariantsVerified.length >= 1`.

---

## 🛡️ Mechanical Diff Policing & Boundary Guard

Graybeard compares actual git diffs against the planned `changeSurface` and surgical LOC budgets:

```javascript
import { assertChangeSurface } from 'graybeard/guard';

const check = assertChangeSurface({
  planned: ['src/payments/idempotency.ts'],
  root: process.cwd(),
  maxLocBudget: 50
});

if (!check.passed) {
  // Throws SurgeryViolationError on out-of-boundary file edits or bloat
  throw new Error(`Surgery Violation: ${check.violations.join('; ')}`);
}
```

---

## 🛑 Deterministic Hard Stop Engine

Halts immediately and saves 100% of implementation tokens when:

1. **`already-solved`:** Repository symbol, test, or active invariant already enforces requested capability.
2. **`wrong-root-cause`:** Request targets UI layer for backend concurrency, data integrity, or security issues.
3. **`conflicting-requirements`:** Request violates active invariants or schema integrity.
4. **`unsafe-request`:** Detected auth bypass, disabling validation, removing tenant isolation, weak crypto (`md5`/`des`), or unsafe DDL.
5. **`insufficient-evidence`:** High-risk actions lacking verified fault locations and falsification proof.

---

## 📐 Calibrated Floor Risk Model

$$\text{Composite} = 0.25 \times \text{Uncertainty} + 0.30 \times \text{Impact} + 0.20 \times \text{Irreversibility} + 0.25 \times \text{BlastRadius}$$

$$\text{RiskScore} = \min(1, \max(\text{Composite}, \text{DominantBottleneck} \times 0.85))$$

- **Dominant Bottleneck Protection:** A $0.90$ factor yields $0.90 \times 0.85 = 0.765 \rightarrow \mathbf{HIGH\ RISK}$, preventing dangerous linear averaging dilution.
- **LOW RISK (Fast-Path):** Typos, docs, local helpers, styling $\rightarrow$ `< 500ms` direct edit.
- **MEDIUM RISK:** Bug fixes, refactors, performance $\rightarrow$ `Orient` $\rightarrow$ `Trace` $\rightarrow$ `Decide` $\rightarrow$ `Economy` $\rightarrow$ `Prove`.
- **HIGH RISK:** Security, concurrency, migrations $\rightarrow$ Full 5-stage loop with mandatory falsification attacks.

---

## 🔬 5-Dimension Decision Proof

```javascript
import { verifyDecision } from 'graybeard/oracles';

const proof = verifyDecision({
  decision: "Add unique index on charge idempotency key",
  invariant: "1 charge per idempotency key",
  plannedFiles: ["src/db/migrations/004_idempotency.sql"]
});

console.log(proof.breakdown);
// {
//   behavior: "PASS",    // Feature operates correctly
//   regression: "PASS",  // 100% test suite oracles pass
//   invariant: "PASS",   // Active invariant strictly holds
//   boundary: "PASS",    // Diff strictly matches changeSurface
//   economy: "PASS"      // No dead code or unused dependencies
// }
```

---

## 📊 Deterministic Benchmark Suite (100 Tasks Across 4 Arms)

Evaluated across 100 realistic software engineering tasks (20 Low, 20 Medium, 20 High, 20 Adversarial, 20 Stop) using Graybeard's deterministic evaluation harness:

```text
===============================================================================================
ARM             TASKS   SUCCESS   REGRESS   WRONG-PATH  AVG TOKENS    WASTED WORK   EFFICIENCY
-----------------------------------------------------------------------------------------------
baseline        100     35.0%     65.0%     55.0%       7,260         6,350         0.49
ponytail        100     38.0%     64.0%     60.0%       2,660         4,820         0.75
graybeard-v0    100     78.0%     22.0%      6.0%       3,570         1,620         3.95
graybeard (1.1) 100     94.0%      3.0%      3.0%       3,339           240        16.38
===============================================================================================
```

$$\text{Engineering Efficiency} = \frac{\text{Successful Tasks}}{\text{Total Tokens / 1000} + \text{Wasted Work}} \times 100$$

- **33x Efficiency Gain over Baseline & 4.1x over v0:** Eliminates wasted generation and hallucinated solutions.
- **Wrong-Path Reduction:** Interrogates premises and enforces layer boundaries before file modifications.
- **5-Dimension Mechanical Proof:** Halts invalid or out-of-boundary code before merge.

---

## 🔌 Supported Coding Agents & Installation

```bash
# Auto-detect installed coding agent and configure rules + skills
npx graybeard init

# Or target a specific host explicitly
npx graybeard init --agent claude      # Claude Code (CLAUDE.md + .claude/skills/)
npx graybeard init --agent cursor      # Cursor (.cursor/rules/graybeard.mdc)
npx graybeard init --agent windsurf    # Windsurf (.windsurf/rules/graybeard.md)
npx graybeard init --agent opencode    # OpenCode (AGENTS.md + opencode.json + .opencode/skills/)
npx graybeard init --agent gemini      # Gemini / Antigravity (GEMINI.md + .agents/skills/)
npx graybeard init --agent copilot     # GitHub Copilot (.github/copilot-instructions.md)
npx graybeard init --agent cline       # Cline (.clinerules)
npx graybeard init --agent roo         # Roo Code (.roo/rules/graybeard.md)
npx graybeard init --agent aider       # Aider (CONVENTIONS.md)
npx graybeard init --agent continue    # Continue.dev (.continue/rules/graybeard.md)
npx graybeard init --agent codex       # Codex / ChatGPT (AGENTS.md)
```

---

## 🛠️ CLI Reference

```bash
# 1. Inspect complete repository snapshot (symbols, tests, schemas, invariants)
npx graybeard inspect

# 2. Analyze task with prompt evidence + repository evidence + change surface
npx graybeard evidence "prevent duplicate charge webhook race condition"

# 3. Mechanically police git diff against planned changeSurface
npx graybeard guard --files "src/orders/idempotency.ts"

# 4. Run 5-dimension mechanical decision proof
npx graybeard prove --decision "Add database unique constraint"

# 5. Run deterministic compiler and test oracles
npx graybeard verify

# 6. Run workspace readiness doctor
npx graybeard doctor

# 7. Execute 100-task benchmark suite
npm run benchmark:run
npm run benchmark:score
```

---

## 💻 Programmatic API

```javascript
import {
  analyzeTask,
  inspectRepository,
  assertChangeSurface,
  evaluateHardStops,
  verifyDecision,
  createSession
} from 'graybeard';

// 1. Evidence-First Task Analysis
const analysis = analyzeTask({
  text: "Fix race condition in user registration balance",
  root: process.cwd()
});
console.log(analysis.risk); // 'HIGH'
console.log(analysis.factors); // { uncertainty, impact, irreversibility, blastRadius }

// 2. 5-Stage Session Lifecycle
const session = createSession({ text: "Add unique index", root: process.cwd() });
session.observe({ faultLocation: 'src/db/schema.sql', causePath: ['auth', 'db'] });
session.transitionStage('DECIDE');
```

---

## 📄 License

MIT © [Nanasi](https://github.com/spellsaif)
