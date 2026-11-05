import { test, expect } from '@playwright/test';

test.describe('Mahjong Solitaire Gameplay & Progression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/');
  });

  test('displays Mahjong card on home page and navigates to details', async ({ page }) => {
    const card = page.locator('.game-card[data-mode="mahjong"]');
    await expect(card).toBeVisible();
    await expect(card).toContainText('Mahjong Solitaire');

    await card.click();
    await expect(page.locator('.page-details')).toBeVisible();
    await expect(page.locator('.page-details h2')).toContainText('Mahjong Solitaire');
    await expect(page.locator('#start-game-btn')).toBeVisible();
  });

  test('launches Mahjong game, mounts canvas, and renders HUD', async ({ page }) => {
    await page.locator('.game-card[data-mode="mahjong"]').click();
    await page.locator('#start-game-btn').click();

    await expect(page.locator('.gameplay-wrapper')).toBeVisible();
    await expect(page.locator('#phaser-container canvas')).toBeVisible();

    // Check HUD elements
    await expect(page.locator('#hud-level')).toHaveText('1');
    await expect(page.locator('#hud-remaining')).toBeVisible();
    await expect(page.locator('#hud-pairs')).toBeVisible();
    await expect(page.locator('#hud-time')).toBeVisible();

    // Check bottom controls
    await expect(page.locator('#game-shuffle-btn')).toBeVisible();
    await expect(page.locator('#game-hint-btn')).toBeVisible();
    await expect(page.locator('#game-restart-btn')).toBeVisible();
  });

  test('supports shuffle, hint, and pause modal', async ({ page }) => {
    await page.locator('.game-card[data-mode="mahjong"]').click();
    await page.locator('#start-game-btn').click();

    await page.waitForTimeout(1000);

    // Test Hint
    await page.locator('#game-hint-btn').click();
    await page.waitForTimeout(400);

    // Test Shuffle
    await page.locator('#game-shuffle-btn').click();
    await page.waitForTimeout(400);

    // Test Pause Modal
    await page.locator('#game-pause-btn').click();
    await expect(page.locator('#active-modal')).toBeVisible();
    await expect(page.locator('.modal-title')).toHaveText(/Pause/);

    // Resume
    await page.locator('#pause-resume-btn').click();
    await expect(page.locator('#active-modal')).not.toBeVisible();
  });

  test('completes level and cleanly advances to next level', async ({ page }) => {
    await page.locator('.game-card[data-mode="mahjong"]').click();
    await page.locator('#start-game-btn').click();

    await page.waitForTimeout(1000);

    // Complete level via launcher scene
    await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      if (scene && scene.engine) {
        for (const t of scene.engine.tiles) {
          t.isRemoved = true;
        }
        scene.engine.moves = 12;
        scene.engine.won = true;
        scene.notifyState();
      }
    });

    // Victory modal should appear
    await expect(page.locator('#active-modal')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#active-modal .result-title')).toHaveText('Puzzle Solved!');
    await expect(page.locator('#modal-next-level')).toBeVisible();

    // Click Next Level
    await page.locator('#modal-next-level').click();

    // Modal should close and Level HUD should advance to 2
    await expect(page.locator('#active-modal')).not.toBeVisible({ timeout: 4000 });
    await expect(page.locator('#hud-level')).toHaveText('2');
  });
});
