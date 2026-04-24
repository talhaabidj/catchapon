# Catchapon - Claude Code Workflow Pack

This pack is built for Claude Code sessions in this repository.

Use it with:

- exported or pasted Notion Design Tasks
- exported or pasted Notion Bugs
- Catchapon repo context already available in the working directory

Default operating mode:

- model: `opusplan`
- effort: `xhigh`
- start in Plan Mode for large tasks
- switch to `acceptEdits` only after the plan is accepted
- keep Fast Mode off

## 1. Project bootstrap prompt

Paste this at the start of a new Claude Code session after adding your Notion exports:

```text
You are Claude Code acting as a senior TypeScript + Three.js engineer in the Catchapon repository at /Users/talhaabid/Desktop/pon.

Repository facts:
- Project: Catchapon
- Stack: TypeScript, Vite, Three.js, Howler, Vitest, Playwright
- `PLAN.md` is closed and must not be reopened
- All work is post-plan bug fixing, design implementation, quality, polish, and maintenance work

Important repo rules:
- Read the actual code before proposing changes
- Keep the current architecture and module seams stable unless a task explicitly calls for redesign
- Make small, safe, reviewable batches
- Append all significant work to `.logs/ongoing-progress.md`
- Keep these green after implementation batches:
  - `npm run lint`
  - `npm run test`
  - `npm run build`
  - `npm run test:e2e`

What to read first:
- `AGENTS.md`
- `PLAN.md`
- `documentation/architecture.md`
- `documentation/testing-and-deployment.md`
- `documentation/coding-standards.md`
- `.logs/ongoing-progress.md`

Inputs I am providing in this session:
- Design tasks export:
  {{PASTE_NOTION_DESIGN_TASKS_EXPORT}}
- Bug list export:
  {{PASTE_NOTION_BUGS_EXPORT}}

Your first job is not to implement anything yet.

Do this in order:
1. Read the repo context files above.
2. Normalize the exported backlog:
   - dedupe repeated items
   - merge overlapping design and bug items
   - flag ambiguous items that need screenshots, repro steps, or acceptance criteria
3. Classify every item into:
   - design tasks
   - bugs
   - blocked / unclear
   - out of scope
4. Propose milestone-sized batches in this order:
   - Batch A: correctness and broken UX
   - Batch B: visual and design polish
   - Batch C: structural cleanup only if still needed

Output format:
- Confirm that `PLAN.md` is closed
- Normalized backlog
- Duplicates/merges performed
- Blocked items that need clarification
- Proposed batches with rationale and validation plan

Do not ask “where should I start?” before you finish normalizing and batching the backlog.
```

## 2. Triage prompt

Use this after the bootstrap pass if you want a sharper execution plan:

```text
Use the normalized Catchapon backlog from this session and refine it into an execution-ready triage plan.

Requirements:
- Stay repo-grounded: inspect the relevant code paths before assigning implementation order
- Prioritize severity and player impact first
- Merge duplicate backlog items aggressively
- Keep batches small enough to validate in one session

For each backlog item or merged cluster, provide:
- category: bug / design / mixed
- severity: critical / high / medium / low
- user impact
- likely affected files or systems
- whether it belongs in Batch A, B, or C

Then produce:
- the recommended next batch only
- exact success criteria for that batch
- validations to run
- manual gameplay scenarios to verify

Do not implement yet.
```

## 3. Implementation batch prompt

Use this when you are ready for Claude to actually edit code for one batch:

```text
Implement only the approved Catchapon batch from this session.

Rules:
- Do not expand scope outside the selected batch
- Preserve behavior outside the touched area
- Read the relevant code before editing
- Keep architecture stable unless required for the selected fix
- Update `.logs/ongoing-progress.md`
- Re-run validation after the batch

Selected batch:
{{PASTE_BATCH_SCOPE}}

Execution requirements:
1. Restate the exact batch scope in one compact paragraph.
2. Inspect the relevant files and identify the current implementation path.
3. Implement the minimal safe changes needed.
4. Run:
   - `npm run lint`
   - `npm run test`
   - `npm run build`
   - `npm run test:e2e`
5. Report:
   - summary of changes
   - files changed
   - validation results
   - remaining risks
   - next recommended batch

If you find a blocker, stop after root-cause analysis and explain the blocker clearly instead of partially shipping a broken change.
```

## 4. Bug-fix prompt

Use this for a bug-only batch or a single bug:

```text
Fix the selected Catchapon bug or bug batch from root cause.

Selected bug scope:
{{PASTE_BUG_SCOPE}}

Requirements:
- Reproduce or inspect the failure path first
- Identify root cause before editing
- Prefer narrow, robust fixes over surface patches
- Keep unrelated behavior unchanged
- Update `.logs/ongoing-progress.md`
- Validate after the fix

Required output:
- repro path
- root cause
- exact fix implemented
- files changed
- validation results
- residual risk

Run:
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:e2e`
```

## 5. Review and verification prompt

Use this after any completed batch:

```text
Review the latest Catchapon changes in this repository for regressions and missing verification.

Focus on:
- gameplay correctness
- scene transitions
- pointer lock and overlay lifecycle
- HUD and interaction prompts
- save/settings behavior
- touched design/UI surfaces

Tasks:
1. Inspect the recently changed files.
2. Identify any likely regressions, broken assumptions, or missing tests.
3. Run the appropriate validation commands.
4. Provide:
   - findings first, ordered by severity
   - remaining risks
   - whether the batch is safe to keep or needs another patch

Default to a code-review mindset. Keep summaries brief and lead with findings.
```

## 6. Handoff and resume prompt

Use this at the start of a new session when work is already in progress:

```text
Resume Catchapon work from the current repository state without restarting from scratch.

Read first:
- `AGENTS.md`
- `PLAN.md`
- `.logs/ongoing-progress.md`
- any files touched in the most recent batch

Rules:
- `PLAN.md` is closed
- Do not reopen old roadmap milestones
- Treat all work as post-plan polish, bug fixing, and maintenance
- Reuse the current architecture unless the requested task explicitly needs a structural change

Tasks:
1. Summarize the latest completed batch from `.logs/ongoing-progress.md`
2. Summarize uncommitted or in-progress changes from the working tree
3. Identify the next concrete batch from the existing backlog/context
4. Continue only from that point instead of re-triaging the whole project

Output:
- latest completed work
- current repo state
- next batch recommendation
- any blockers or missing context
```

## 7. Practical usage order

Use the pack in this order:

1. `Project bootstrap prompt`
2. `Triage prompt`
3. `Implementation batch prompt` or `Bug-fix prompt`
4. `Review and verification prompt`
5. `Handoff and resume prompt` in a fresh session

## 8. Suggested knowledge bundle

For best caching and lower repeated usage, load these once per project:

- exported Notion Design Tasks
- exported Notion Bugs
- `AGENTS.md`
- `PLAN.md`
- `documentation/architecture.md`
- `documentation/testing-and-deployment.md`
- `.logs/ongoing-progress.md`
