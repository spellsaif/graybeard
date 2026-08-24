<p align="center">
  <img src="https://raw.githubusercontent.com/spellsaif/sextant/refs/heads/master/assets/logo.png" width="220" alt="Graybeard - The Principal Engineer AI Engine">
</p>

<h1 align="center">Graybeard 🧙‍♂️</h1>

<p align="center">
  <em>"He wrote the codebase twenty years ago. He questions your premise, rejects wrong-file hacks, defends invariants, and fixes the real root cause in 3 lines."</em>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/graybeard"><img src="https://img.shields.io/badge/npm-v1.0.0-blue.svg?style=flat-square" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="MIT License"></a>
  <a href="tests/core.test.js"><img src="https://img.shields.io/badge/tests-30%20passing-brightgreen.svg?style=flat-square" alt="Tests"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/node-%3E%3D18.0.0-informational.svg?style=flat-square" alt="Node.js"></a>
  <a href="#-supported-coding-agents"><img src="https://img.shields.io/badge/works%20with-12%20AI%20Agents-blueviolet.svg?style=flat-square" alt="12 Agents"></a>
</p>

---

## 📖 Table of Contents

- [Meet Graybeard](#-meet-graybeard)
- [Ponytail vs. Graybeard: The Tale of Two Devs](#-ponytail-vs-graybeard-the-tale-of-two-devs)
- [The Philosophy of Graybeard](#-the-philosophy-of-graybeard)
- [How It Works](#-how-it-works)
  - [The Dual-Engine Architecture](#the-dual-engine-architecture)
  - [Adaptive Risk Routing & Fast-Path](#adaptive-risk-routing--fast-path)
- [The 11 On-Demand Skills](#-the-11-on-demand-skills)
- [Hard Stop Engine (100% Token Savings)](#-hard-stop-engine-100-token-savings)
- [Deterministic Verification Oracles](#-deterministic-verification-oracles)
- [Supported Coding Agents & Installation](#-supported-coding-agents--installation)
- [CLI Reference](#-cli-reference)
- [Real-World Scenarios](#-real-world-scenarios)
- [Empirical Benchmarks](#-empirical-benchmarks)
- [License](#-license)

---

## 🧙‍♂️ Meet Graybeard

You know him. 

He sits in the corner office with a faded Sun Microsystems mug and a mechanical keyboard with blank keycaps. He was committing to trunk before git was invented. 

When you rush to his desk in a panic because production is down, he doesn't frantically start editing files. He sips his black coffee, opens your PR, asks **one uncomfortable question** that destroys your entire architectural premise, and points to a 3-line database constraint that fixes everything permanently.

**Graybeard puts that Principal Engineer inside your AI coding agent.**

```text
┌────────────────────────────────────────────────────────┐
│ 1. PRECISION JUDGMENT (Find the Truth)                 │
│    Orient ──► Invariant ──► Trace ──► Falsify ──► Stop │
└───────────────────────────┬────────────────────────────┘
                            │ (When change is justified)
┌───────────────────────────▼────────────────────────────┐
│ 2. SURGICAL MINIMALISM (Cut the Code)                  │
│    Decide ──► Single-Boundary Surgery ──► Economy ────►│──► Verify
└────────────────────────────────────────────────────────┘
```

---

## ☕ Ponytail vs. Graybeard: The Tale of Two Devs

There are two kinds of minimalism in software engineering:

| Scenario | What Raw Agents Do (Intern) | What Ponytail Does (Lazy Senior) | What Graybeard Does (Principal Engineer) |
| :--- | :--- | :--- | :--- |
| **User asks for a Date Picker** | Installs 3 npm packages, writes 400 lines of wrapper CSS, creates timezone context provider. | Writes `<input type="date">` in 1 line. *(Wins!)* | Recognizes `styling/low-risk` $\rightarrow$ Writes `<input type="date">` in 1 line with **Fast-Path** (< 500ms). *(Wins!)* |
| **Ticket: "Users double-click checkout; debounce the button"** | Adds debounce hooks, event listeners, loading spinners in 5 different frontend files. | Writes `disabled={isSubmitting}` on `CheckoutButton.tsx` (2 lines). | **Questions the premise:** *"What happens on network retry or mobile API calls?"* Adds a unique idempotency constraint at the database layer (3 lines). |
| **Ticket: "Delete this weird 500ms sleep in `syncWorker.ts`"** | Refactors the whole worker into an async generator. | Deletes the 15 lines as "YAGNI bloat". *(Causes API rate-limit outage!)* | **Invokes Chesterton's Fence (`archaeology`):** Blames commit history, proves the third-party API throttles at 2 req/sec, halts with proof. |

> **The Lesson:** *Ponytail is lazy about writing code. Graybeard is lazy about writing code, but relentless about finding the truth.*

---

## 🏛️ The Philosophy of Graybeard

1. **Eliminate Wrong Work Before Writing Code:** Modifying the wrong file with 1 line of code is still a 100% defect. Never touch a file until you understand the invariant.
2. **Respect Chesterton's Fence:** Never delete or refactor strange legacy code without understanding why the engineer who came before you put it there.
3. **Falsify First:** Before writing a solution, actively try to break it with counterexamples (race conditions, tenant leakage, retry storms, null collections).
4. **Ruthless Implementation Economy:** Once correctness is proven, enforce single-boundary surgery. No speculative abstractions, no boilerplate, no shims.
5. **Deterministic Proof Over Hallucinated Claims:** Don't trust an LLM's promise that "the code works"—verify it with compiler typecheckers and test suites.

---

## 🧠 How It Works

### The Dual-Engine Architecture

Graybeard divides every engineering request into two distinct, governed stages:

#### Engine 1: Precision Judgment (Find the Truth)
- **Orient:** Maps repository structure and inspects call sites before making changes.
- **Invariants:** Identifies the fundamental truth that must never be broken (e.g. *Tenant isolation must be verified before query execution*).
- **Trace:** Follows execution backwards: Entry Point $\rightarrow$ State Mutation $\rightarrow$ Root Cause.
- **Challenge (Falsification):** Attacks the leading solution with edge cases before code is written.
- **Hard Stop:** Halts immediately if the request is redundant, unsafe, or aimed at the wrong layer.

#### Engine 2: Surgical Minimalism (Cut the Code)
- **Decide:** Selects the smallest justified intervention.
- **Single-Boundary Surgery:** Confines the diff to exactly one semantic layer (never scatter compensating hacks).
- **Economy:** Trims boilerplate, reuses existing project utilities, and preserves existing idioms.
- **Verify:** Proves correctness against deterministic compiler and test suite oracles.

---

### Adaptive Risk Routing & Fast-Path

Graybeard does not waste reasoning tokens on trivial tasks, nor does it rush blind into high-risk systems. It calculates:

$$\text{Risk} = \max(\text{Dominant Bottleneck}, \text{Composite Impact})$$

```text
                                 ┌─► LOW RISK / STYLING ────► [Fast-Path: Near-Zero Overhead]
                                 │
Task Prompt ──► [Risk Router] ───┼─► MEDIUM RISK ───────────► [Trace + Decide + Economy + Verify]
                                 │
                                 └─► HIGH RISK (Auth/Data) ──► [Trace + Challenge + Surgery + Verify]
```

| Risk Tier | Task Types | Execution Sequence | Token Behavior |
| :--- | :--- | :--- | :--- |
| **LOW (Fast-Path)** | Typos, docs, styling, CSS, local helpers | `Orient` → `Surgical Diff` → `Verify` | **Near-Zero Overhead** (Bypasses reasoning ceremony) |
| **MEDIUM** | Bug fixes, refactors, new features | `Orient` → `Interrogate` → `Trace` → `Decide` → `Economy` → `Verify` | **Minimal & Targeted** (Validates causality) |
| **HIGH** | Auth, security, concurrency, schema, migrations | `Orient` → `Trace` → `Challenge (Falsify)` → `Surgery` → `Economy` → `Verify` | **High-ROI Protection** (Actively seeks counterexamples) |

---

## 🧰 The 11 On-Demand Skills

Graybeard provides 11 modular skills that agents discover and load on demand via standard YAML frontmatter:

| Skill | Phase | Cost | Purpose |
| :--- | :--- | :---: | :--- |
| [`orient`](skills/orient.md) | `understand` | 1 | Maps relevant repository files and inspects call sites before modifying code. |
| [`interrogate`](skills/interrogate.md) | `understand` | 2 | Questions hidden assumptions and clarifies ambiguous requirements. |
| [`trace`](skills/trace.md) | `diagnose` | 2 | Traces causal execution paths from entry point to root cause. |
| [`archaeology`](skills/archaeology.md) | `understand` | 2 | Recovers historical git context before touching legacy code (Chesterton's Fence). |
| [`challenge`](skills/challenge.md) | `judge` | 3 | Actively attempts to falsify the solution with counterexamples before coding. |
| [`decide`](skills/decide.md) | `judge` | 2 | Compares viable alternatives and chooses the smallest justified solution. |
| [`surgery`](skills/surgery.md) | `execute` | 2 | Restricts blast radius and bounds risky modifications to a single boundary. |
| [`economy`](skills/economy.md) | `execute` | 1 | Eliminates boilerplate, trims diffs, and enforces standard library / helper reuse. |
| [`verify`](skills/verify.md) | `verify` | 2 | Verifies both behavioral correctness and invariant preservation. |
| [`stop`](skills/stop.md) | `verify` | 0 | Safely halts execution with clear proof when no change is justified. |
| [`memory`](skills/memory.md) | `context` | 1 | Stores and queries durable architectural decisions in `.graybeard/decisions.json`. |

---

## 🛑 Hard Stop Engine (100% Token Savings)

Unlike traditional agents that generate speculative code on bad prompts, Graybeard immediately stops and reports evidence when:

1. **`already-solved`:** The requested feature or utility already exists in the repository.
2. **`wrong-root-cause`:** The prompt targets a symptom at the wrong architectural layer.
3. **`conflicting-requirements`:** The request violates an established invariant or existing test contract.
4. **`unsafe-request`:** The request weakens authentication, data isolation, or access controls.
5. **`insufficient-evidence`:** High-risk, irreversible action lacks clear supporting proof.

---

## ⚡ Deterministic Verification Oracles

Graybeard bridges the gap between probabilistic LLMs and deterministic compilers. Run verification on any codebase:

```bash
# Auto-detects and runs test runners, typecheckers, and linters across 10+ languages
npx graybeard verify
```

### Supported Language & Ecosystem Oracles:
- **JavaScript / TypeScript:** `npm test`, `npm run check`, `npx tsc --noEmit`, `npm run lint`
- **Python:** `pytest`, `mypy .`, `ruff check .`
- **Rust:** `cargo check`, `cargo test`
- **Go:** `go test ./...`, `go vet ./...`
- **Java / Kotlin:** `mvn test`, `gradlew test`
- **.NET / C#:** `dotnet build`, `dotnet test`
- **Ruby:** `bundle exec rspec`, `bundle exec rake test`
- **PHP:** `phpunit`, `composer test`
- **C / C++:** `ctest`, `make test`
- **Elixir:** `mix test`

Output:
```json
{
  "verified": true,
  "totalOracles": 2,
  "passedCount": 2,
  "failedCount": 0,
  "results": [
    { "command": "npm test", "type": "test", "passed": true, "durationMs": 570 },
    { "command": "npm run check", "type": "integrity", "passed": true, "durationMs": 120 }
  ]
}
```

---

## 🔌 Supported Coding Agents & Installation

Install Graybeard in any repository with a single command:

```bash
# Auto-detects your installed coding agent (Cursor, Claude, OpenCode, Copilot, etc.)
npx graybeard init
```

### Target a Specific Agent Host:

```bash
# OpenCode (AGENTS.md + opencode.json + .opencode/skills)
npx graybeard init --agent opencode

# Cursor (.cursor/rules/graybeard.mdc)
npx graybeard init --agent cursor

# Claude Code (CLAUDE.md + .claude/skills)
npx graybeard init --agent claude

# Windsurf Cascade (.windsurf/rules/graybeard.md)
npx graybeard init --agent windsurf

# Gemini / Antigravity (GEMINI.md + .agents/skills)
npx graybeard init --agent gemini

# GitHub Copilot (.github/copilot-instructions.md)
npx graybeard init --agent copilot

# Cline (.clinerules)
npx graybeard init --agent cline

# Roo Code (.roo/rules/graybeard.md)
npx graybeard init --agent roo

# Codex (AGENTS.md + .agents/skills)
npx graybeard init --agent codex

# Install for all supported agents
npx graybeard init --all
```

> **Non-Destructive Guarantee:** Graybeard wraps all injected instructions inside `<!-- GRAYBEARD_START -->` and `<!-- GRAYBEARD_END -->` markers, preserving all your existing configuration files.

---

## 🛠️ CLI Reference

```bash
# 1. Route a task and preview its risk level, skill sequence, and policy
npx graybeard route "fix duplicate payment webhook race condition"

# 2. Verify repository health and detected compiler oracles
npx graybeard doctor

# 3. Run all deterministic compiler, linter, and test oracles
npx graybeard verify

# 4. List all detected verification oracles
npx graybeard oracles

# 5. List all on-demand Graybeard skills and token costs
npx graybeard skills

# 6. Save a permanent architectural invariant to repository memory
npx graybeard remember --json '{"area":"auth","invariant":"tenant isolation","decision":"resolve tenant before authorization"}'

# 7. Search durable architectural decisions in .graybeard/decisions.json
npx graybeard memory --query "tenant isolation"
```

---

## 🔍 Real-World Scenarios

### Scenario A: The Cosmetic Color Tweak (Elastic Fast-Path)
> **Prompt:** *"Change the CSS background color of the security badge icon to yellow."*
- **Graybeard Action:** Recognizes `isPresentationIntent = true` $\rightarrow$ Classifies as `styling` / `LOW RISK` $\rightarrow$ Bypasses heavy reasoning ceremony $\rightarrow$ Delivers a clean **+1 LOC diff** in < 500ms with zero token bloat.

### Scenario B: The Webhook Concurrency Trap
> **Prompt:** *"Users report duplicate orders on checkout. Add a debounce on `CheckoutButton.tsx`."*
- **Graybeard Action:** Auto-classified as `HIGH RISK` (concurrency). Identifies that frontend debouncing fails against mobile API calls and webhook retries. Executes [`challenge`](skills/challenge.md) (falsification) and performs **Single-Boundary Surgery** on the transactional database query / webhook idempotency handler (+3 LOC).

### Scenario C: Legacy Code & Chesterton's Fence
> **Prompt:** *"Remove this strange 500ms delay in `syncWorker.ts`."*
- **Graybeard Action:** Detects legacy refactor $\rightarrow$ Activates [`archaeology`](skills/archaeology.md). Inspects git commit history to uncover that the delay prevents third-party API rate-limit throttling. Issues a **Hard Stop** with evidence.

---

## 📊 How Graybeard Compares

### 1. The Right Tool for the Right Job

We have immense respect for [Ponytail](https://github.com/DietrichGebert/ponytail)—it popularized the critical concept of **YAGNI & code minimalism** for AI coding agents. 

Graybeard is designed as the next step in that evolution: adding **Principal Engineering judgment, invariant defense, and deterministic compiler oracles** for complex production codebases.

| Capability | Raw Baseline Agent | Minimalism-Only (Ponytail) | **Graybeard** |
| :--- | :---: | :---: | :---: |
| **Code Minimalism & YAGNI Enforcement** | ❌ (Writes 400-line wrappers) | ✅ (Writes `<input type="date">`) | ✅ (Fast-Path matches same 1-line minimalism) |
| **Execution Overhead on Trivial Tasks** | High | Near-Zero | **Near-Zero (Elastic Fast-Path < 500ms)** |
| **Causal Root Cause Tracing (`trace`)** | ❌ | ❌ (Patches symptom in prompt file) | **✅ (Traces entry point $\rightarrow$ fault layer)** |
| **Pre-Implementation Falsification (`challenge`)** | ❌ | ❌ | **✅ (Attacks fix with counterexamples)** |
| **Chesterton's Fence for Legacy Code (`archaeology`)** | ❌ | ❌ (Prone to deleting needed hacks) | **✅ (Recovers historical git constraints)** |
| **Hard Stops on Redundant / Flawed Prompts** | ❌ | ⚠️ (Only if YAGNI applies) | **✅ (5 Deterministic 0-Token Triggers)** |
| **Deterministic Compiler / Test Suite Oracles** | ❌ | ❌ (Relies on LLM claim) | **✅ (`npx graybeard verify` for `tsc`, tests)** |
| **Atomic Cross-Session Invariant Memory** | ❌ | ❌ | **✅ (`.graybeard/decisions.json` store)** |
| **Architecture & Skill Loading Model** | Monolithic prompt | Static 7-rung ladder | **Adaptive Risk Routing & 11 On-Demand Skills** |

---

### 2. Graybeard Measured Performance Across Risk Tiers

| Task Tier | Scenario Example | Graybeard Behavior | Token & Diff Impact |
| :--- | :--- | :--- | :--- |
| **LOW (Fast-Path)** | CSS styling, typos, docs, UI helpers | Bypasses reasoning ceremony $\rightarrow$ Direct surgical edit | **-54% to -94% LOC**, sub-second execution |
| **MEDIUM** | Multi-file bug fix, refactor, feature | Traces causality $\rightarrow$ Single-boundary diff | **Optimal single-boundary diff**, no side-effects |
| **HIGH** | Concurrency, auth, database migration | Traces invariant $\rightarrow$ Falsifies failure paths $\rightarrow$ Surgery | **Zero silent regressions**, root-cause eliminated |
| **INVALID / REDUNDANT** | Already solved, wrong layer, unsafe | Triggers **Hard Stop Engine** with evidence | **100% token savings**, 0 code churn |
| **VERIFICATION** | Post-implementation validation | Runs local compiler typecheckers & test suites | **Deterministic mathematical proof** (`30/30 Passing`) |

---

## 📄 License

MIT © [Nanasi](https://github.com/spellsaif)
