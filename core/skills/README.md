# Graybeard Skills

Graybeard ships with 11 modular on-demand skills. Each skill defines its triggers, phase, and purpose in standard YAML frontmatter for dynamic discovery by agents (Claude Code, Cursor, OpenCode, Windsurf, Gemini/Antigravity, etc.).

## Skills Overview

- `orient`: Map the smallest relevant repository surface and inspect call sites.
- `interrogate`: Question premises and clarify hidden assumptions.
- `trace`: Follow execution backwards from symptom to root cause.
- `archaeology`: Recover historical git constraints before touching legacy code (Chesterton's Fence).
- `challenge`: Actively attempt to falsify solutions before writing code.
- `decide`: Choose the smallest justified intervention.
- `surgery`: Restrict blast radius to a single semantic boundary.
- `economy`: Trim boilerplate and maximize helper reuse.
- `verify`: Test behavioral correctness and invariant preservation.
- `stop`: Evidence-backed early halt saving 100% of tokens.
- `memory`: Query and persist durable repository invariants.
