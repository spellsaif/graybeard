# Sextant Skill: Orient

Purpose: establish where the agent is in the repository before making a consequential change.

Actions:
- identify the smallest relevant entry points, modules, tests, configuration and dependency boundaries;
- inspect references/call sites before editing a definition;
- prefer cheap repository evidence over speculative explanation;
- record only facts that materially affect the current decision.

Output state:
FACTS, RELEVANT_PATHS, UNKNOWN.

Do not perform a repository-wide tour unless the task actually crosses boundaries.
