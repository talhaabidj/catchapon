# 005 — Reveal & Collection (M5)

**Date:** 2026-04-18  
**Milestone:** M5 (Reveal & Collection)  
**Skill:** Mixed (WebAppStudioSkill primary, GameStudioSkill for 3D wall)

## What was done

### Save/Load System Integration

- `BedroomScene` now loads `GameState` from `localStorage` on construction
- `ShopScene.returnHome()` builds a `GameState` from all system states and saves to localStorage
- State flows: `Bedroom → loadState → Shop → saveState → Bedroom(state)`
- Systems (Economy, Collection, Progression) initialized from save data when entering shop

### PC Terminal — Live Stats

- `bedroomUI.updatePCStats(state)` populates the terminal from `GameState`:
  - Nights Worked
  - Total Money
  - Items Collected (n / 25)
  - Sets Completed (n / 4)
  - Secrets Found

### Collection Viewer

- Full overlay with 4 themed set groups, each showing:
  - Set name + owned count (e.g., "3 / 6")
  - Progress bar (gradient fill)
  - Completion reward text (when set is complete)
  - Item cards in a 3-column grid
    - Owned: rarity-colored icon + name + rarity label
    - Locked: "?" placeholder with dimmed style

### 3D Collection Wall

- `CollectionWall` now has 9 named slot meshes on 3 shelves
- `updateCollectionWallVisuals()` colors slots with rarity hex for owned items
- Called at `BedroomScene.init()` so the wall reflects the save

### Duplicate Detection

- `ShopScene.handleMachinePull()` checks `collection.isDuplicate()` before adding
- Duplicate pulls show "(DUPLICATE)" badge in the reveal overlay name

## Verified

- `npm run typecheck` — clean
- `npm run test` — 109/109 pass
- `npm run build` — 50 modules, all chunks successful
- Pushed to GitHub → Vercel auto-deploy
