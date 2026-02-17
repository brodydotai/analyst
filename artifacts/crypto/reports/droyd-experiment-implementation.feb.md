# Droyd Experiment Implementation Report

## Objective

Operationalize Droyd-driven experiments so every future crypto token research run can test narrative, catalyst, and risk intelligence uplift in a repeatable format.

## Files Added and Updated

- Added: `.agents/templates/droyd-crypto-experiments.md`
- Updated: `.cursor/skills/investment-research-trigger/SKILL.md`
- Updated: `.agents/protocol.md`
- Updated: `.agents/README.md`

## What Is Now Enabled

1. Crypto runs are treated as supported via an experiment overlay.
2. Agent routing can use the API map in `.agents/templates/api-routing-index.yaml`.
3. Crypto runs now require:
   - at least 2 Droyd experiment modes,
   - documented query settings,
   - corroboration of high-impact claims,
   - a standardized experiment summary in operator notes.
4. If Droyd is unavailable, the run continues using fallback research with explicit "experiment skipped" status.

## Experiment Design Summary

- Mode A: Narrative Lift
- Mode B: Catalyst Timeliness
- Mode C: Risk Early Warning

Each run receives a 10-point rubric score across:
- narrative lift,
- timeliness,
- risk utility,
- signal quality,
- token efficiency.

## Adoption Decision Logic

- 8-10: adopt Droyd as standard crypto research layer.
- 5-7: keep conditional overlay and tune queries.
- 0-4: pause integration and reassess provider utility.

## Next Use Trigger

When user requests crypto token research (for example, "do investment research on HYPE"), the trigger skill should invoke the Droyd experiment overlay by default.

