import { test, expect } from '@playwright/test';

test.describe('Word Search Gameplay & Progression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/');
  });

  test('displays Word Search card on home page and navigates to details', async ({ page }) => {
    const card = page.locator('.game-card[data-mode="wordsearch"]');
    await expect(card).toBeVisible();
    await expect(card).toContainText('Word Search');

    await card.click();
    await expect(page.locator('.page-details')).toBeVisible();
    await expect(page.locator('.page-details h2')).toContainText('Word Search');
    await expect(page.locator('#start-game-btn')).toBeVisible();
  });

  test('launches Word Search game, renders target word chips, and verifies HUD', async ({ page }) => {
    await page.locator('.game-card[data-mode="wordsearch"]').click();
    await page.locator('#start-game-btn').click();

    await expect(page.locator('.gameplay-wrapper')).toBeVisible();
    await expect(page.locator('#phaser-container canvas')).toBeVisible();

    // Check HUD elements
    await expect(page.locator('#hud-level')).toHaveText('1');
    await expect(page.locator('#hud-found')).toContainText('0 /');
    await expect(page.locator('#hud-time')).toBeVisible();

    // Check word chips container
    const chipList = page.locator('#ws-chip-list');
    await expect(chipList).toBeVisible();
    const chips = chipList.locator('.word-chip');
    await expect(chips).toHaveCount(4); // Level 1 has 4 words
  });

  test('supports hint and solves puzzle to advance to next level', async ({ page }) => {
    await page.locator('.game-card[data-mode="wordsearch"]').click();
    await page.locator('#start-game-btn').click();

    await page.waitForTimeout(1000);

    // Test hint button
    await page.locator('#game-hint-btn').click();
    await page.waitForTimeout(400);

    // Simulate finding all words via launcher scene
    await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      if (scene && scene.engine) {
        for (const tw of scene.engine.targetWords) {
          tw.found = true;
          if (!scene.engine.foundWords.includes(tw.word)) {
            scene.engine.foundWords.push(tw.word);
          }
        }
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

    // Modal closes and advances to Level 2
    await expect(page.locator('#active-modal')).not.toBeVisible({ timeout: 4000 });
    await expect(page.locator('#hud-level')).toHaveText('2');
  });

  test('supports switching language to Indonesian and independent progression', async ({ page }) => {
    // Switch language to Indonesian via header lang-toggle-btn
    await page.locator('#lang-toggle-btn').click();
    await page.waitForTimeout(400);

    const wsCard = page.locator('.game-card[data-mode="wordsearch"]');
    await expect(wsCard).toContainText('Cari Kata');

    // Launch game in ID
    await wsCard.click();
    await page.locator('#start-game-btn').click();

    await expect(page.locator('.game-title-text')).toHaveText('Cari Kata');
    const chipList = page.locator('#ws-chip-list');
    await expect(chipList).toBeVisible();
    // In ID Level 1, words are KUCING, ANJING, IKAN, KUDA
    await expect(chipList).toContainText('KUCING');
  });
});
