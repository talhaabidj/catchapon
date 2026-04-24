# Catchapon - CLAUDE.local.md Example

This is a personal instruction template for Claude Code.

Copy the parts you want into a real `CLAUDE.local.md` at the repository root if you want these rules to load automatically in your own Claude sessions.

```md
# Personal Catchapon Instructions

Read these files first:
- @AGENTS.md
- @PLAN.md
- @documentation/architecture.md
- @documentation/testing-and-deployment.md
- @documentation/coding-standards.md
- @.logs/ongoing-progress.md

IMPORTANT:
- `PLAN.md` is closed and must not be reopened.
- All work in this repository is post-plan bug fixing, design implementation, polish, and maintenance work.
- Do not propose finishing old roadmap milestones.
- Read the actual code before proposing or making changes.
- Preserve the current architecture and module seams unless the task explicitly asks for redesign.
- Keep changes small, safe, and reviewable.
- Append significant work to `.logs/ongoing-progress.md`.
- After implementation batches, keep these green:
  - `npm run lint`
  - `npm run test`
  - `npm run build`
  - `npm run test:e2e`

Default priorities:
1. crashes, soft locks, broken loops
2. gameplay correctness and UX blockers
3. design and visual polish
4. structural cleanup only when it supports the items above

If I paste exported Notion backlog content:
- normalize the backlog first
- dedupe repeated items
- merge overlapping bug and design items
- mark blocked or ambiguous items clearly
- batch the work before editing

Default output for completed work:
- summary of changes
- files changed
- validation results
- remaining risks
- next recommended batch

Default working style:
- use `opusplan`
- use `xhigh` effort by default
- use `max` only for short planning or blocker turns
- keep Fast Mode off
- prefer one implementation batch per session
```
