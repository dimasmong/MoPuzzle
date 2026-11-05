import { test, expect } from '@playwright/test';

test.describe('MoPuzzle — Color Sort Desktop Progression & Multi-Level Audit', () => {

  test('1 to 6. Solve Level 1 -> Next Level -> Level 2 interactive -> Solve Level 2 -> Advance to Level 3', async ({ page }) => {
    await page.goto('/');
    await page.click('.game-card[data-mode="colorsort"]');
    await page.locator('#start-game-btn, #resume-game-btn').first().click();

    await expect(page.locator('.gameplay-wrapper')).toBeVisible();
    await expect(page.locator('#hud-level')).toHaveText('1');
    await page.waitForFunction(() => (window as any).__MOPUZZLE_LAUNCHER__?.getCurrentScene()?.engine !== undefined);

    // 1. Setup winning pour on Level 1
    await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      scene.engine.tubes = [
        [1, 1, 1],
        [1],
        [2, 2, 2, 2],
        [3, 3, 3, 3],
        []
      ];
      scene.engine.moves = 8;
      scene.renderTubes();
      scene.handleTubeClick(1);
      scene.handleTubeClick(0);
    });

    const modal = page.locator('#active-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal.locator('.result-title')).toContainText('Puzzle Solved');

    // 2. Click Next Level
    const nextBtn = modal.locator('#modal-next-level');
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // 3. Verify modal closes and stays closed
    await expect(modal).not.toBeVisible();
    await page.waitForTimeout(400);
    expect(await page.locator('#active-modal').isVisible()).toBe(false);

    // 4. Verify Level 2 loaded
    await expect(page.locator('#hud-level')).toHaveText('2');
    await expect(page.locator('#hud-moves')).toHaveText('0');
    const badgeText = await page.locator('.game-mode-badge').innerText();
    expect(badgeText).toContain('2');

    // 5. Play Level 2 and verify gameplay interaction
    const tubeCount = await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      return scene.engine.getTubeCount();
    });
    expect(tubeCount).toBeGreaterThanOrEqual(5);

    // Perform an interactive pour on Level 2: find a legal pour and execute it
    const legalMoveFound = await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      const hint = scene.engine.getHint();
      if (hint) {
        scene.handleTubeClick(hint.fromTube);
        scene.handleTubeClick(hint.toTube);
        return true;
      }
      return false;
    });
    expect(legalMoveFound).toBe(true);

    // Move count incremented to 1
    await expect(page.locator('#hud-moves')).toHaveText('1');

    // 6. Complete Level 2 and advance to Level 3
    await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      scene.engine.tubes = [
        [1, 1, 1],
        [1],
        [2, 2, 2, 2],
        [3, 3, 3, 3],
        []
      ];
      scene.renderTubes();
      scene.handleTubeClick(1);
      scene.handleTubeClick(0);
    });

    // Victory modal appears for Level 2
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal.locator('.result-title')).toContainText('Puzzle Solved');

    // Click Next Level again
    const nextBtn2 = modal.locator('#modal-next-level');
    await expect(nextBtn2).toBeVisible();
    await nextBtn2.click();

    // Verify modal closes and Level 3 loads
    await expect(modal).not.toBeVisible();
    await page.waitForTimeout(400);
    expect(await page.locator('#active-modal').isVisible()).toBe(false);
    await expect(page.locator('#hud-level')).toHaveText('3');
    await expect(page.locator('#hud-moves')).toHaveText('0');
  });

  test('7. Existing saved progress: Profile with legacy won state advances smoothly without stuck modal', async ({ page }) => {
    // Inject legacy save with level 1 completed (won: true)
    await page.addInitScript(() => {
      const legacySave = {
        version: 1,
        settings: { language: 'en', theme: 'light', musicEnabled: true, musicVolume: 0.5, sfxEnabled: true, sfxVolume: 0.8, reducedMotion: false },
        stats: {
          merge: { gamesPlayed: 0, gamesWon: 0, highScore: 0, bestTimeSeconds: 0, totalMoves: 0, extraStats: { tile2048Count: 0 } },
          colorsort: { gamesPlayed: 1, gamesWon: 1, highScore: 0, bestTimeSeconds: 0, totalMoves: 8, extraStats: { totalPours: 8, maxLevelReached: 1 } },
          slide: { gamesPlayed: 0, gamesWon: 0, highScore: 0, bestTimeSeconds: 0, totalMoves: 0, extraStats: { puzzlesSolved: 0 } },
          blockfit: { gamesPlayed: 0, gamesWon: 0, highScore: 0, bestTimeSeconds: 0, totalMoves: 0, extraStats: { linesCleared: 0, maxCombo: 0 } }
        },
        achievements: {},
        colorSortUnlockedLevel: 2,
        activeGames: {
          colorsort: {
            level: 1,
            tubeCapacity: 4,
            tubes: [[1, 1, 1, 1], [2, 2, 2, 2], [3, 3, 3, 3], [], []],
            moves: 8,
            history: [],
            won: true
          }
        }
      };
      localStorage.setItem('mopuzzle_v1_savedata', JSON.stringify(legacySave));
    });

    await page.goto('/');

    // Navigate to Color Sort Details
    await page.click('.game-card[data-mode="colorsort"]');

    // Click Play - should start unlocked level 2 directly!
    const playBtn = page.locator('#start-game-btn, #resume-game-btn').first();
    await expect(playBtn).toBeVisible();
    await playBtn.click();

    await expect(page.locator('.gameplay-wrapper')).toBeVisible();
    await page.waitForFunction(() => (window as any).__MOPUZZLE_LAUNCHER__?.getCurrentScene()?.engine !== undefined);

    // Verify Level 2 is loaded and modal is NOT open
    await expect(page.locator('#hud-level')).toHaveText('2');
    expect(await page.locator('#active-modal').isVisible()).toBe(false);

    // Solve Level 2
    await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      scene.engine.tubes = [
        [1, 1, 1],
        [1],
        [2, 2, 2, 2],
        [3, 3, 3, 3],
        []
      ];
      scene.renderTubes();
      scene.handleTubeClick(1);
      scene.handleTubeClick(0);
    });

    const modal = page.locator('#active-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Click Next Level
    await modal.locator('#modal-next-level').click();
    await expect(modal).not.toBeVisible();
    await page.waitForTimeout(400);

    // Verify modal stays closed and Level 3 is active
    expect(await page.locator('#active-modal').isVisible()).toBe(false);
    await expect(page.locator('#hud-level')).toHaveText('3');
  });

  test('8. PWA Service Worker & Cache Validation: sw.js responds correctly and caches shell', async ({ page }) => {
    // Verify sw.js is served with network-first for navigation and correct cache version
    const response = await page.request.get('/sw.js');
    expect(response.status()).toBe(200);
    const swContent = await response.text();
    expect(swContent).toContain('mopuzzle-cache-v1.0.3');
    expect(swContent).toContain('isNavigation');
    expect(swContent).toContain('SKIP_WAITING');
  });

});
