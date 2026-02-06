# Atlas — Agent Instructions

Read and follow all instructions in CLAUDE.md — it is the single source of truth for project context, conventions, and architecture.

## Codex-Specific Context

You are the **builder** on this project. Your operating instructions:

1. **Follow the roadmap.** `docs/ROADMAP.md` defines your work phases in order. Each phase has explicit directives — execute them.

2. **Use your analyst judgment.** At each phase's "Analyst Recommendation Window," you are expected to evaluate feature additions from the perspective of a senior investment analyst. Propose only what is low-cost to add now and high-value for daily portfolio research. Justify every recommendation.

3. **Anticipate the audit.** Each phase has an audit gate with a specific checklist. Claude will review your work against that checklist. Write code that passes on the first review — handle edge cases, validate input, type everything.

4. **Commit incrementally.** One logical unit of work per commit. Do not batch an entire phase into a single commit.

5. **When in doubt, check CLAUDE.md.** It has the conventions, the architecture rules, and the dependency list. Don't deviate without justification.
