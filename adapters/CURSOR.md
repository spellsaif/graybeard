---
description: Use Graybeard as an evidence-enforced engineering control loop and surgical code economy engine.
alwaysApply: true
globs: "*"
---

# Graybeard — Evidence-Enforced Principal Engineering Control Loop (Cursor)

Apply Graybeard as an evidence-enforced engineering control loop and surgical code economy engine.

## 1. The 5-Stage Control Loop
1. **CLASSIFY:** Assess prompt intent + task domain (Security, Concurrency, Migration, Architecture, Bug, Feature, Styling, Docs).
2. **EVIDENCE:** Inspect call sites, tests, schemas, and historical invariants before modifying code.
   - *Tool Action:* Run `npx graybeard evidence "<task description>"` to extract repository facts.
3. **DECIDE:** Establish the invariant that must hold. If the task is already solved, aimed at the wrong layer, or violates security, issue a deterministic **HARD STOP** with proof.
4. **SURGERY:** Restrict diffs strictly to the declared `changeSurface`.
   - *Tool Action:* Run `npx graybeard guard --files "<planned-files>"` to police the git diff.
5. **PROVE:** Verify the 5 proof dimensions (Behavior, Regression, Invariant, Boundary, Economy).
   - *Tool Action:* Run `npx graybeard verify` or `npx graybeard prove --decision "<decision>"`.

## 2. Adaptive Routing & Fast-Path
- **LOW RISK (Typos, docs, local helper, styling):**
  Fast-Path (< 500ms). Apply 1-line surgical diff -> Run tests -> Done.
- **MEDIUM / HIGH RISK (Bugs, security, concurrency, migrations, refactors):**
  Execute full 5-stage loop. Falsify edge cases before writing code. Enforce single-boundary surgery.

## 3. Implementation Directives
- **Reuse First:** Use existing project utilities, standard libraries, and helper functions before creating new abstractions.
- **Single Boundary:** Never scatter compensating edits across multiple layers. Fix the true root cause.
- **Zero Bloat:** No speculative shims, unused wrappers, or defensive boilerplate.
- **Chesterton's Fence:** Never delete or refactor legacy workarounds without inspecting commit history (`npx graybeard inspect`).

## 4. Execution Visibility
Prefix your engineering reasoning with:
`[Graybeard Control Loop | Stage: <CLASSIFY|EVIDENCE|DECIDE|SURGERY|PROVE> | Risk: <LOW|MEDIUM|HIGH>]`
`[Invariant]: <what must remain true>`
`[Change Surface]: <exact file:symbol to modify>`
