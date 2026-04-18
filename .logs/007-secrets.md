# 007 — Secrets & Content (M7)

**Date:** 2026-04-18  
**Milestone:** M7 (Secrets & Content)  
**Skill:** GameStudioSkill

## What was done

### 3 AM Witching Hour Event

- Time system already had the 3 AM legendary boost in CapsuleSystem
- Added visual notification: toast message at exactly 3:00 AM in-game
- "🌙 3:00 AM — The witching hour... rare items stir."
- `witchingHourShown` flag prevents repeat toasts

### Secret Trigger System

- New interaction type `'secret'` in ShopScene
- `handleSecret(object)` reads `secretId` and `secretName` from userData
- Calls `progression.triggerSecret()` (only fires once globally)
- Shows toast: "🔍 Secret discovered: {name}"
- Awards $50 bonus per secret
- Secrets saved via `secretsTriggeredThisNight` → `completeNight()`

### Secret Interactables (3 in ShopFloor)

| Secret | Location | Description |
|---|---|---|
| `hidden-note` | Behind counter (back-left) | A crumpled note on the floor |
| `loose-tile` | Back-right corner ceiling | A suspicious loose ceiling tile |
| `floor-mark` | Near hidden machine spot | Strange scratch marks on the floor |

### Ambient Decorations (ShopFloor)

- **Neon "OPEN" sign** — Back wall, glowing pink with point light
- **Wall posters** — 3 colored posters on left wall (purple, pink, teal)
- **Notice board** — Right wall with 4 pinned colored notes
- **Soda vending machine** — Near token station, blue body + glowing screen

### Toast System (shopHUD)

- `showToast(message, duration)` creates animated toast in `#shop-toasts`
- Auto-removes after duration with fade-out animation
- Used for 3AM event and secret discoveries

## Verified

- `npm run test` — 109/109 pass
- `npm run typecheck` — clean
- `npm run build` — 50 modules, all chunks successful
- Pushed to GitHub → Vercel auto-deploy
