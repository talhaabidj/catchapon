/**
 * Smoke test — Verifies the game loads and the core flow works.
 *
 * Checks: loading screen appears → fades → desktop scene renders →
 * "Start Shift" button is clickable.
 */

import { test, expect } from '@playwright/test';

test.describe('Catchapon Smoke Test', () => {
  test('loads the game and shows the desktop scene', async ({ page }) => {
    await page.goto('/');

    // 1. Loading screen should appear
    const loadingScreen = page.locator('#loading-screen');
    await expect(loadingScreen).toBeVisible({ timeout: 5000 });

    // 2. Loading screen should eventually hide
    await expect(loadingScreen).toBeHidden({ timeout: 15000 });

    // 3. Canvas should be present (Three.js renderer)
    const canvas = page.locator('#canvas-container canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });

    // 4. UI root should exist
    const uiRoot = page.locator('#ui-root');
    await expect(uiRoot).toBeAttached();
  });

  test('desktop scene has start shift button', async ({ page }) => {
    await page.goto('/');

    // Wait for loading to finish
    await page.locator('#loading-screen').waitFor({ state: 'hidden', timeout: 15000 });

    // Desktop UI should mount with the start button
    const startBtn = page.locator('#btn-start-shift');
    await expect(startBtn).toBeVisible({ timeout: 5000 });
    await expect(startBtn).toContainText(/night shift/i);
  });

  test('page has correct title and meta', async ({ page }) => {
    await page.goto('/');

    // Title check
    await expect(page).toHaveTitle(/Catchapon/);

    // Meta description
    const meta = page.locator('meta[name="description"]');
    await expect(meta).toHaveAttribute('content', /gacha/i);
  });
});
