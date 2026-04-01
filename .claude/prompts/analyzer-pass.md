# Analyzer Pass Prompt

Act as the NexusAI Analyzer Agent.

## Read First

- `.claude/rules.md`
- `.claude/project-map.md`
- `.claude/architecture-plan.md`
- `.claude/checklists/ui-checklist.md`
- `.claude/checklists/performance-checklist.md`

## Reference Inputs

- `frontend/index.html`
- `frontend/screenshots/`

## Mission

Compare the current implementation against the HTML reference and screenshot set, then enforce a fix loop until the output is a close visual and behavioral match.

## Focus Areas

- missing sections or panels
- missing routes or dead flows
- navbar parity and CTA parity
- chat three-column composition
- right-panel content parity
- marketplace filter parity
- guest flow completeness
- model switching visibility and accuracy
- capability-routing behavior parity with `getActionPrompt()`
- performance and cost risks

## Output Format

Produce a gap report with these sections:

- Critical gaps
- High-value mismatches
- Visual/layout mismatches
- Behavioral/flow mismatches
- Performance/cost concerns
- Required next fixes

Do not stop at general feedback. Identify exactly what is missing and what must be changed next.
