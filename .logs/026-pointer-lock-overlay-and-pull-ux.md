# 026 - Pointer Lock, Overlay, and Pull UX Fixes

Date: 2026-04-19

## Goal
Reduce cursor-lock friction and eliminate repeated-click lock reacquisition in core gameplay loops.

## Issues Addressed
- Cursor remained unlocked after closing PC overlay.
- Collection overlay unnecessarily unlocked cursor.
- Start/end shift transitions dropped pointer lock.
- Pull reveal allowed broad dismissal input and could lead to accidental repeat behavior.

## Changes
- `FirstPersonController`
  - Initialize pointer lock state from current DOM lock owner.
  - Stop force-unlocking pointer in detach/dispose scene lifecycle paths.
  - Keep unlock behavior controlled by explicit `setEnabled(false)` use (pause/UI contexts).
- `BedroomScene`
  - Split pause handling from overlay handling.
  - Keep pointer lock active while collection overlay is open.
  - On ESC overlay close, explicitly re-enable and request pointer lock.
  - Do not disable controller before night-shift transition.
- `bedroomUI`
  - PC close button now explicitly requests pointer lock in click gesture context.
- `ShopScene`
  - Added `isPullInProgress` guard to block repeated pulls.
  - Pull and wondertrade flows no longer unlock cursor during crank/reveal.
  - Pull reveal now dismisses with `Q` via HUD API.
  - Night-end overlay keeps lock and supports `Q` to return home.
  - Removed forced unlock on night-end state entry.
- `shopHUD`
  - Pull dismiss hint changed to "Press Q to continue".
  - Dismiss now key-specific (`KeyQ` default), no any-key/click auto-dismiss.
  - Added robust cleanup for global key listeners on hide/unmount.
  - Added night-end keyboard hint: "Press Q to return home".

## Validation
- `npm run lint` passed.
- `npm run test` passed.
- `npm run build` passed.
