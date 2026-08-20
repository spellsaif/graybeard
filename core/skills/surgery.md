# Sextant Skill: Surgery

Purpose: turn a decision into a narrow, reversible change surface.

Before editing, identify:
- files and symbols to touch;
- interfaces/contracts affected;
- migrations or external effects;
- compatibility constraints;
- rollback or recovery path for risky changes.

Prefer changing one semantic boundary instead of scattering compensating changes across callers.

Output state:
CHANGE_SURFACE, RISKS, ROLLBACK.
