# Sextant v1.0.0

Sextant is an adaptive engineering judgment layer for AI coding agents.

It does not force a giant workflow onto every task. It classifies the work, estimates risk and uncertainty, activates only the skills justified by the situation, and then minimizes and verifies the change.

## Install

From a checkout:

```bash
npm install
node scripts/sextant.js init
node scripts/sextant.js doctor
```

When published to npm:

```bash
npx sextant init
npx sextant doctor
```

Use `--agent` to install a specific adapter:

```bash
npx sextant init --agent claude
npx sextant init --agent codex
npx sextant init --agent cursor
npx sextant init --agent opencode
npx sextant init --agent gemini
npx sextant init --agent cline
npx sextant init --agent roo
npx sextant init --agent copilot
```

Use `npx sextant hosts` to list adapters.

## How it works

```text
Task
  ↓
Classify
  ↓
Risk + uncertainty
  ↓
Select only justified skills
  ↓
Orient / Interrogate / Trace / Challenge
  ↓
Decide
  ↓
Surgery / Economy
  ↓
Verify
  ↓
Stop or ship
```

The core skills are small and composable. The router decides when they are relevant, so Sextant does not spend deep-reasoning tokens on trivial changes.

## Agent examples

### Claude Code

```bash
npx sextant init --agent claude
claude
```

Then ask normally:

```text
Fix the duplicate order creation bug. First determine whether the bug is actually in the API path and only change code once the real invariant is understood.
```

### Codex

```bash
npx sextant init --agent codex
codex
```

Sextant installs the project-level `AGENTS.md` guidance used by the agent.

### Cursor

```bash
npx sextant init --agent cursor
```

Sextant writes a project rule under `.cursor/rules/` and keeps the same judgment policy.

### OpenCode

```bash
npx sextant init --agent opencode
opencode
```

Sextant installs `AGENTS.md` plus on-demand skills under `.opencode/skills/`. OpenCode discovers skills from project skill directories and loads their bodies only when the agent invokes them. See the official OpenCode skills documentation for the current discovery and permission model.

### Gemini-style host

```bash
npx sextant init --agent gemini
```

This installs a `GEMINI.md` guidance file.

### Cline / Roo Code / Copilot

```bash
npx sextant init --agent cline
npx sextant init --agent roo
npx sextant init --agent copilot
```

The adapter uses each host's project instruction location when practical; otherwise the generic judgment policy remains available through `AGENTS.md`.

## Useful commands

```bash
npx sextant skills
npx sextant route --text "fix duplicate payment creation" --type bug --uncertainty 0.8 --impact 0.9 --irreversibility 0.7 --blast-radius 0.8 --confidence 0.4
npx sextant doctor
```

## Why Sextant exists

Ponytail optimizes implementation minimalism. Sextant targets the decision before implementation:

> What is actually true, what is uncertain, what would falsify this plan, and is a change justified at all?

Sextant can be used alone or alongside a minimalist implementation skill such as Ponytail.

## Benchmark

The repository contains a benchmark scaffold for comparing baseline, Ponytail, Sextant, and Sextant+Ponytail under identical task/model/repository conditions.
