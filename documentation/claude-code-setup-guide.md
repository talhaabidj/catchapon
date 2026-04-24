# Catchapon - Claude Code Setup Guide

This guide is tuned for working on Catchapon in Claude Code while preserving as much Max-plan Opus capacity as possible.

## 1. Login and billing sanity check

Use your Claude subscription login, not API billing, unless you intentionally want API charges.

Checklist:

1. In Claude Code, run:
   ```bash
   /status
   ```
2. If you see API-key-backed auth and want to stay on your Max subscription, run:
   ```bash
   /logout
   /login
   ```
3. Choose your Claude.ai account during login.
4. In your terminal, make sure you are not accidentally forcing API billing:
   ```bash
   echo $ANTHROPIC_API_KEY
   ```

If `ANTHROPIC_API_KEY` is set, Claude Code may use API billing instead of your subscription. Remove or unset it in the shell you use for Claude Code if your goal is to stay inside your plan.

## 2. Recommended personal settings

Put this in `~/.claude/settings.json`:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "model": "opusplan",
  "effortLevel": "xhigh",
  "defaultMode": "default",
  "fastModePerSessionOptIn": true,
  "showClearContextOnPlanAccept": true
}
```

Why these defaults:

- `model: "opusplan"` uses Opus in Plan Mode and Sonnet in execution, which is the best tradeoff for a large backlog.
- `effortLevel: "xhigh"` is the best default for difficult coding work without paying the cost of session-long `max`.
- `defaultMode: "default"` keeps new sessions safe and predictable. Switch into Plan Mode or `acceptEdits` intentionally.
- `fastModePerSessionOptIn: true` prevents fast mode from sticking across sessions if you ever toggle it on by accident.
- `showClearContextOnPlanAccept: true` makes it easier to start implementation with a cleaner context after planning.

## 3. Best session pattern for Catchapon

Use this pattern for most work:

1. Start Claude Code in the repo:
   ```bash
   cd /Users/talhaabid/Desktop/pon
   claude
   ```
2. Check usage before a long session:
   ```bash
   /status
   ```
3. Set model and effort explicitly if needed:
   ```bash
   /model opusplan
   /effort xhigh
   ```
4. Start large tasks in Plan Mode:
   - use `/plan`, or
   - press `Shift+Tab` until Plan Mode is active, or
   - launch with `claude --permission-mode plan`
5. After the plan is accepted, switch to `acceptEdits` for the implementation batch.
6. End the session after one major batch, or when the conversation becomes bloated.

## 4. When to use each effort level

- `xhigh`: default for most Catchapon work.
- `max`: only for short, high-value reasoning turns:
  - first triage of a large exported Notion backlog
  - difficult root-cause debugging
  - refactor planning
- `high`: use when the task is important but narrower and you want to save capacity.
- `medium` or `low`: reserve for quick formatting, copy edits, or very scoped questions.

If you want one turn to think harder without changing your session default, include `ultrathink` in that one prompt.

## 5. How to avoid wasting Max-plan usage

- Keep Fast Mode off unless you intentionally want extra-usage billing.
- Do not use session-long `max` effort by default.
- Export or paste the Notion Design Tasks and Bugs pages once and reuse them instead of asking Claude to rediscover the same backlog every session.
- Keep AGENTS, PLAN, architecture docs, and key logs in Claude’s project knowledge or in the first bootstrap message.
- Batch related work into one prompt instead of drip-feeding many tiny prompts.
- Start a new session when:
  - the task changes category,
  - the conversation has become long and messy,
  - Claude starts re-reading or re-summarizing too much history,
  - one implementation batch has already shipped and validated.
- Disable or avoid non-critical tools/connectors when they are not needed for a given session.
- Do not force 1M-context Opus for every task. Use the default `opusplan` flow unless the session truly needs huge context.

## 6. Catchapon-specific working rules

Claude should always be told:

- `PLAN.md` is closed and must not be reopened.
- Work is post-plan quality, bug-fix, polish, and architecture maintenance work.
- Read repo files before proposing changes.
- Keep batches small and reviewable.
- Append significant work to `.logs/ongoing-progress.md`.
- Keep `npm run lint`, `npm run test`, `npm run build`, and `npm run test:e2e` green after implementation batches.
- Preserve current architecture unless the task explicitly calls for a structural refactor.
- Prioritize:
  1. crashes, broken loops, soft locks
  2. gameplay correctness and UX blockers
  3. design polish
  4. structural cleanup only when it supports the first three

## 7. Files to use with this guide

- Prompt pack: [claude-code-catchapon-workflow-pack.md](/Users/talhaabid/Desktop/pon/.prompts/claude-code-catchapon-workflow-pack.md)
- Personal instruction template: [claude-code-catchapon-CLAUDE.local.example.md](/Users/talhaabid/Desktop/pon/.prompts/claude-code-catchapon-CLAUDE.local.example.md)

## References

- Claude Code settings: <https://code.claude.com/docs/en/settings>
- Claude Code model configuration: <https://code.claude.com/docs/en/model-config>
- Claude Code permission modes: <https://code.claude.com/docs/en/permission-modes>
- Claude Code common workflows: <https://code.claude.com/docs/en/tutorials>
- Using Claude Code with your Pro or Max plan: <https://support.claude.com/en/articles/11145838-using-claude-code-with-your-pro-or-max-plan>
- Usage limit best practices: <https://support.claude.com/en/articles/9797557-usage-limit-best-practices>
