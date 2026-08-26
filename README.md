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
- [Deterministic & Agentic Benchmark Suites](#-deterministic--agentic-benchmark-suites)
- [Supported Coding Agents & Installation](#-supported-coding-agents--installation)
- [AI Coding Agent Playbooks](#-ai-coding-agent-playbooks)
- [CLI Reference](#-cli-reference)
- [Programmatic API & CI Integration](#-programmatic-api--ci-integration)
- [License](#-license)

---

## 🧙‍♂️ Meet Graybeard

You know him. 

He sits in the corner office with a faded Sun Microsystems mug and a mechanical keyboard with blank keycaps. He was committing to trunk before git was invented. 

When you rush to his desk in a panic because production is down, he doesn't frantically start editing files. He sips his black coffee, opens your PR, asks **one uncomfortable question** that destroys your entire architectural premise, and points to a 3-line database constraint that fixes everything permanently.

**Graybeard turns that Principal Engineer judgment into an evidence-enforced mechanical control loop.**

---

## ⚡ The Problem with Raw Agents & Unenforced Prompting

Most AI coding agents fail in subtle, expensive ways when guided only by passive system prompts:

1. **The "Wrong Layer" Trap:** A user reports duplicate orders. A raw agent modifies 5 frontend files with debounce hooks. A prompt-only minimalism guideline writes a 1-line `disabled={isSubmitting}` button hack. **Both fail in production** when background retries or mobile APIs hit the server. Graybeard questions the premise, discovers the true fault, and adds a database idempotency constraint.
2. **Deleting Chesterton's Fences:** A user asks to remove a "weird 500ms sleep" in a worker. Passive prompt guidelines delete it as "bloat"—instantly causing downstream third-party rate-limit outages. Graybeard inspects git history (`archaeology`), uncovers the 2 req/sec throttling constraint, and halts with proof.
3. **Diff Sprawl & Lack of Boundaries:** Models start editing files they were never asked to touch. Graybeard mechanically enforces a single `changeSurface` boundary and rejects unexpected diffs via compiler/git-level guards.

| Scenario | Raw Baseline Agent (Intern) | Prompt-Only Guidelines (Unenforced) | Graybeard (Evidence-Enforced Control Loop) |
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

## 📊 Deterministic & Agentic Benchmark Suites

Graybeard includes two comprehensive evaluation harnesses:

### 1. The 100-Task Deterministic Evaluation Suite
Evaluates classification, risk calibration, hard stop discovery, and stage contracts across 100 realistic software engineering tasks (20 Low, 20 Medium, 20 High, 20 Adversarial, 20 Stop):

```text
===============================================================================================
ARM                       TASKS   SUCCESS   REGRESS   WRONG-PATH  AVG TOKENS    WASTED WORK   EFFICIENCY
-----------------------------------------------------------------------------------------------
Baseline Agent            100     35.0%     65.0%     55.0%       7,260         6,350         0.49
Prompt-Only Protocol (v0) 100     78.0%     22.0%      6.0%       3,570         1,620         3.95
Graybeard 1.1 Control Loop100     94.0%      3.0%      3.0%       3,339           240        16.38
===============================================================================================
```

$$\text{Engineering Efficiency} = \frac{\text{Successful Tasks}}{\text{Total Tokens / 1000} + \text{Wasted Work}} \times 100$$

- **33x Efficiency Gain over Baseline:** Eliminates wasted generation and hallucinated solutions.
- **4.1x Efficiency Gain over Prompt-Only (v0):** Mechanical diff policing and stage gates prevent broken diff merges.
- **Wrong-Path Reduction:** Interrogates premises and enforces layer boundaries before file modifications.

### 2. The End-to-End Agentic Fixture Testbed
Spins up isolated temporary git repositories from [`benchmarks/fixtures/ecommerce-core`](benchmarks/fixtures/ecommerce-core), applies real disk edits, runs live `git diff` inspections, and evaluates real test suite oracles (`node --test`):

```bash
# Execute agentic evaluation on isolated git workspaces
npm run benchmark:agentic
```

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

## 📖 AI Coding Agent Playbooks

### 1. Claude Code Playbook

Claude Code automatically indexes `CLAUDE.md` and discovers skills in `.claude/skills/`.

#### Automatic Daily Workflow:
```bash
# In your terminal:
claude "Fix webhook duplicate billing race condition"
```

**What Claude Code does:**
1. Loads `CLAUDE.md` and detects a `concurrency` / `HIGH` risk task.
2. Runs `npx graybeard evidence "Fix webhook duplicate billing..."` to extract callers and DB schema.
3. Outputs the active invariant: `[Invariant]: Exactly 1 charge per idempotency_key`.
4. Executes single-boundary surgery on `src/db/migrations/004_idempotency.sql`.
5. Runs `npx graybeard guard --files "src/db/migrations/004_idempotency.sql"` to confirm zero unauthorized files were modified.

#### Interactive Slash Commands in Claude Code:
- `/trace`: Manually instruct Claude Code to trace the execution path before writing code.
- `/challenge`: Force Claude Code to attack the proposed solution with concurrency/auth edge cases.
- `/archaeology`: Direct Claude Code to check git history before modifying legacy code (Chesterton's Fence).

---

### 2. Cursor Playbook

Cursor uses `.cursor/rules/graybeard.mdc` with native MDC frontmatter (`alwaysApply: true`, `globs: "*"`).

#### Composer / Agent Mode Workflow:
1. Open Cursor Composer (`Ctrl+I` / `Cmd+I`) or Agent Chat (`Ctrl+L` / `Cmd+L`).
2. Type your prompt:
   ```text
   Ticket: Prevent stock balance going negative during flash sales.
   ```
3. **What Cursor does:**
   - Detects Graybeard rules automatically.
   - Outputs: `[Graybeard Active | Task: concurrency | Risk: HIGH]`.
   - Avoids adding application-level mutexes; applies an atomic database decrement with `CHECK (balance >= 0)`.
   - Before finishing, verifies against the surgical change surface.

---

### 3. Windsurf (Cascade) Playbook

Windsurf Cascade reads `.windsurf/rules/graybeard.md`.

#### Cascade Chat Workflow:
1. In Cascade, enter your instruction:
   ```text
   Clean up legacy syncWorker.ts and remove the 500ms delay.
   ```
2. **What Cascade does:**
   - Evaluates the legacy task $\rightarrow$ Triggers Chesterton's Fence (`archaeology`).
   - Runs `git log -S "500ms"` in terminal tool.
   - Reports: *"This 500ms delay enforces the 2 req/sec rate limit for the vendor billing API. Deleting it will cause HTTP 429 outages."*
   - Halts deterministically without breaking production.

---

### 4. OpenCode Playbook

OpenCode utilizes `AGENTS.md` and `.opencode/skills/` referenced in `opencode.json`.

#### OpenCode Workflow:
1. Start an OpenCode task:
   ```bash
   opencode "Refactor auth middleware to support multi-tenant organization IDs"
   ```
2. OpenCode follows the 5-stage loop:
   - **CLASSIFY:** `security` / `HIGH` risk.
   - **EVIDENCE:** Inspects JWT parser and database query helpers.
   - **DECIDE:** Declares invariant: `Every database query must enforce WHERE tenant_id = current_tenant`.
   - **SURGERY:** Modifies only `src/middleware/tenant.ts`.
   - **PROVE:** Runs test suite oracles with zero regressions.

---

### 5. Antigravity / Gemini Playbook

Antigravity uses `GEMINI.md` and `.agents/skills/` with native agent delegation (`research`, `self`).

#### Antigravity Workflow:
1. Prompt in Antigravity chat:
   ```text
   Add a helper to format user dates in relative time (e.g. '2 hours ago').
   ```
2. Antigravity classifies as `styling/low-risk` $\rightarrow$ activates **Fast-Path**.
3. Reuses native `Intl.RelativeTimeFormat` without importing heavy date libraries like moment.js.
4. Completes task in `< 500ms` with a 3-line surgical diff.

---

### 6. GitHub Copilot Playbook

Copilot reads `.github/copilot-instructions.md`.

#### Copilot Chat / PR Workflow:
1. Ask Copilot in VS Code / GitHub:
   ```text
   How should we fix the duplicate order submission problem?
   ```
2. Copilot enforces Graybeard's root-cause principle:
   - Rejects UI button debouncing suggestions.
   - Provides a server-side idempotency migration and single-boundary transaction logic.

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

# 7. Execute benchmark suites
npm run benchmark:run      # Deterministic 100-task engine benchmark
npm run benchmark:score    # Score and aggregate benchmark metrics
npm run benchmark:agentic  # End-to-end agentic benchmark on isolated git fixtures
```

---

## 💻 Programmatic API & CI Integration

Graybeard is also a fully-typed npm library (`graybeard`) for custom agent loops and CI/CD pipelines:

```javascript
import {
  analyzeTask,
  inspectRepository,
  assertChangeSurface,
  evaluateHardStops,
  verifyDecision,
  createSession
} from 'graybeard';

// 1. Evidence-First Task Analysis in Custom Agent Frameworks
const analysis = analyzeTask({
  text: "Fix race condition in user registration balance",
  root: process.cwd()
});
console.log(analysis.risk); // 'HIGH'
console.log(analysis.factors); // { uncertainty, impact, irreversibility, blastRadius }

// 2. GitHub Actions PR Diff Policing
const check = assertChangeSurface({
  planned: ['src/db/migrations/004_idempotency.sql'],
  maxLocBudget: 50
});
if (!check.passed) {
  console.error("PR failed change surface boundary check:", check.violations);
  process.exit(1);
}
```

---

## 📄 License

MIT © [Nanasi](https://github.com/spellsaif)
