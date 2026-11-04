import { test, expect } from '@playwright/test';

test.describe('MoPuzzle Application & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads home page with brand, 4 game cards, and footer', async ({ page }) => {
    await expect(page).toHaveTitle(/MoPuzzle/);
    await expect(page.locator('.brand-text h1')).toHaveText('MoPuzzle');

    // 4 game cards
    const cards = page.locator('.game-card');
    await expect(cards).toHaveCount(4);

    // Footer
    await expect(page.locator('.app-footer')).toContainText('Dimas Mong');
    await expect(page.locator('.app-footer a')).toHaveAttribute('href', 'https://github.com/dimasmong/MoPuzzle');
  });

  test('toggles theme between light and dark', async ({ page }) => {
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');

    // Click theme toggle in header
    await page.click('#theme-toggle-btn');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Toggle back to light
    await page.click('#theme-toggle-btn');
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('toggles language between English and Bahasa Indonesia', async ({ page }) => {
    // Initially English
    await expect(page.locator('.brand-text p')).toHaveText('Think. Solve. Enjoy.');

    // Click language toggle button in header
    await page.click('#lang-toggle-btn');
    await expect(page.locator('.brand-text p')).toHaveText('Pikir. Selesaikan. Nikmati.');

    // Switch back to English
    await page.click('#lang-toggle-btn');
    await expect(page.locator('.brand-text p')).toHaveText('Think. Solve. Enjoy.');
  });

  test('navigates to Statistics and Achievements pages', async ({ page }) => {
    // Navigate to Stats
    await page.click('button[data-nav="stats"]');
    await expect(page.locator('.page-stats h2')).toBeVisible();

    // Navigate to Achievements
    await page.click('button[data-nav="achievements"]');
    await expect(page.locator('.page-achievements h2')).toBeVisible();
    await expect(page.locator('.page-achievements .card')).toHaveCount(14);

    // Navigate to Settings
    await page.click('button[data-nav="settings"]');
    await expect(page.locator('.page-settings h2')).toBeVisible();

    // Return to Home
    await page.click('button[data-nav="home"]');
    await expect(page.locator('.game-card')).toHaveCount(4);
  });
});

test.describe('MoPuzzle Gameplay Modes', () => {
  test('launches and plays Mode 1: Merge Numbers', async ({ page }) => {
    await page.goto('/');

    // Click Merge Numbers card
    await page.click('.game-card[data-mode="merge"]');
    await expect(page.locator('.page-details h2')).toContainText('Merge Numbers');

    // Start game
    await page.locator('#start-game-btn, #resume-game-btn').first().click();
    await expect(page.locator('.gameplay-wrapper')).toBeVisible();

    // Verify Phaser canvas is created
    const canvas = page.locator('#phaser-container canvas');
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(400);

    // Send keyboard move commands
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);

    // Moves counter should have updated
    const movesText = await page.locator('#hud-moves').innerText();
    expect(parseInt(movesText, 10)).toBeGreaterThanOrEqual(1);

    // Test Undo button
    await page.click('#game-undo-btn');
    await page.waitForTimeout(200);

    // Return to details
    await page.click('#game-back-btn');
    await expect(page.locator('.page-details')).toBeVisible();
  });

  test('launches and plays Mode 2: Color Sort', async ({ page }) => {
    await page.goto('/');

    // Click Color Sort card
    await page.click('.game-card[data-mode="colorsort"]');
    await expect(page.locator('.page-details h2')).toContainText('Color Sort');

    // Start game
    await page.locator('#start-game-btn, #resume-game-btn').first().click();
    await expect(page.locator('.gameplay-wrapper')).toBeVisible();

    const canvas = page.locator('#phaser-container canvas');
    await expect(canvas).toBeVisible();

    // Click hint button
    await page.click('#game-hint-btn');
    await page.waitForTimeout(300);

    // Test pause modal
    await page.click('#game-pause-btn');
    await expect(page.locator('#active-modal')).toBeVisible();
    await page.click('#pause-resume-btn');
    await expect(page.locator('#active-modal')).not.toBeVisible();
  });

  test('launches and plays Mode 3: Slide Puzzle', async ({ page }) => {
    await page.goto('/');

    await page.click('.game-card[data-mode="slide"]');
    await expect(page.locator('.page-details h2')).toContainText('Slide Puzzle');

    await page.locator('#start-game-btn, #resume-game-btn').first().click();
    await expect(page.locator('.gameplay-wrapper')).toBeVisible();

    const canvas = page.locator('#phaser-container canvas');
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(400);

    // Send keyboard moves
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);

    const moves = parseInt(await page.locator('#hud-moves').innerText(), 10);
    expect(moves).toBeGreaterThanOrEqual(1);
  });

  test('launches and plays Mode 4: Block Fit', async ({ page }) => {
    await page.goto('/');

    await page.click('.game-card[data-mode="blockfit"]');
    await expect(page.locator('.page-details h2')).toContainText('Block Fit');

    await page.locator('#start-game-btn, #resume-game-btn').first().click();
    await expect(page.locator('.gameplay-wrapper')).toBeVisible();

    const canvas = page.locator('#phaser-container canvas');
    await expect(canvas).toBeVisible();

    // Score HUD starts at 0
    await expect(page.locator('#hud-score')).toHaveText('0');
  });

  test('settings reset progress confirmation modal works', async ({ page }) => {
    await page.goto('/');
    await page.click('button[data-nav="settings"]');

    await page.click('#reset-data-btn');
    await expect(page.locator('#active-modal')).toBeVisible();

    // Cancel reset
    await page.click('#modal-cancel-reset');
    await expect(page.locator('#active-modal')).not.toBeVisible();
  });
});
