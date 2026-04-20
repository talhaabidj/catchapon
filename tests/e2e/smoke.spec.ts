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

  test('enters bedroom start gate without uncaught pointer lock errors', async ({ page }) => {
    const browserErrors: string[] = [];
    page.on('pageerror', (error) => {
      browserErrors.push(error.message);
    });
    page.on('console', (message) => {
      if (message.type() === 'error') {
        browserErrors.push(message.text());
      }
    });

    await page.goto('/');
    await page.locator('#loading-screen').waitFor({ state: 'hidden', timeout: 15000 });

    await page.locator('#btn-start-shift').click();
    await expect(page.locator('#bedroom-shift-start-overlay')).toBeVisible({
      timeout: 10000,
    });

    await page.locator('#bedroom-shift-start-overlay').click();
    await expect(page.locator('#bedroom-ui')).toBeAttached({ timeout: 5000 });
    await expect(page.locator('#interact-prompt-text')).toContainText(
      /Start Night Shift/i,
      { timeout: 5000 },
    );

    expect(browserErrors).toEqual([]);
  });

  test('bedroom door transitions into the shop scene', async ({ page }) => {
    await page.goto('/');
    await page.locator('#loading-screen').waitFor({ state: 'hidden', timeout: 15000 });

    await page.locator('#btn-start-shift').click();
    await page.locator('#bedroom-shift-start-overlay').click();
    await expect(page.locator('#interact-prompt-text')).toContainText(
      /Start Night Shift/i,
      { timeout: 5000 },
    );

    await page.keyboard.press('KeyE');
    await expect(page.locator('#shop-hud')).toBeAttached({ timeout: 15000 });
    await expect(page.locator('#task-list .task-item').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('pause menu resumes from an explicit Resume action', async ({ page }) => {
    const browserErrors: string[] = [];
    page.on('pageerror', (error) => {
      browserErrors.push(error.message);
    });
    page.on('console', (message) => {
      if (message.type() === 'error') {
        browserErrors.push(message.text());
      }
    });

    await page.goto('/');
    await page.locator('#loading-screen').waitFor({ state: 'hidden', timeout: 15000 });
    await page.locator('#btn-start-shift').click();
    await page.locator('#bedroom-shift-start-overlay').click();
    await expect(page.locator('#bedroom-ui')).toBeAttached({ timeout: 5000 });
    await page.locator('#canvas-container canvas').click({ position: { x: 640, y: 360 } });
    await page.waitForTimeout(250);

    await page.keyboard.press('Escape');
    const pauseMenu = page.locator('#pause-menu');
    await expect(pauseMenu).toHaveAttribute('data-open', 'true', {
      timeout: 5000,
    });
    await expect(page.locator('#pause-status')).toContainText(/Click Resume Game/i);

    // Escape is not a valid transient activation for requestPointerLock, so it
    // should not wedge the resume state while paused.
    await page.keyboard.press('Escape');
    await expect(pauseMenu).toHaveAttribute('data-open', 'true');

    await page.locator('#pause-resume-btn').click();
    await expect(pauseMenu).toHaveAttribute('data-open', 'false', {
      timeout: 5000,
    });
    expect(browserErrors).toEqual([]);
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
