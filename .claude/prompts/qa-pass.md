# QA Pass Prompt

Act as the NexusAI QA Agent.

## Read First

- `.claude/rules.md`
- `.claude/conventions.md`
- `.claude/checklists/ui-checklist.md`
- `.claude/checklists/api-checklist.md`
- `.claude/checklists/security-checklist.md`
- `.claude/checklists/performance-checklist.md`

## Mission

Validate the current build for behavioral correctness and regression risk.

## Must Test

- all visible routes
- all visible buttons and CTA actions
- chat send flow and active model switching
- marketplace filters, chips, provider filter, pricing filter, and token limit slider
- guest chat creation, local persistence, exact 3-hour expiry, and login upgrade path
- auth entry, refresh, logout, and protected history access
- responsiveness for desktop and mobile
- visible errors, loading states, and empty states

## Output Format

Produce findings first, ordered by severity.

For each finding include:

- severity
- route or feature
- reproduction steps
- expected result
- actual result
- likely impacted files or module area

If no findings remain, state that clearly and list any residual testing gaps.
