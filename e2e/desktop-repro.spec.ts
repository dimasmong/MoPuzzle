import { test, expect } from '@playwright/test';

test.describe('Desktop Color Sort Next Level Reproduction & Diagnostics', () => {

  test('Scenario A: Mouse click vs Keyboard activation on #modal-next-level', async ({ page }) => {
    const consoleLogs: string[] = [];
    page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));

    await page.goto('/');
    await page.click('.game-card[data-mode="colorsort"]');
    await page.locator('#start-game-btn, #resume-game-btn').first().click();

    await expect(page.locator('.gameplay-wrapper')).toBeVisible();
    await page.waitForFunction(() => (window as any).__MOPUZZLE_LAUNCHER__?.getCurrentScene()?.engine !== undefined);

    // Setup winning pour
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

    // Click next level via mouse click
    const nextBtn = modal.locator('#modal-next-level');
    await nextBtn.click();

    await page.waitForTimeout(500);

    // Check if modal reappeared
    const modalVisible = await page.locator('#active-modal').isVisible();
    const currentLevel = await page.locator('#hud-level').innerText();
    console.log('Mouse click result -> modalVisible:', modalVisible, 'currentLevel:', currentLevel);
    expect(modalVisible).toBe(false);
    expect(currentLevel).toBe('2');
  });

  test('Scenario B: Existing saved progress with activeGames.colorsort from v1.0.1 (won=true)', async ({ page }) => {
    // Inject legacy v1.0.1 save data before navigating
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
        achievements: { first_step: { unlockedAt: '2026-11-04T12:00:00.000Z', progress: 100 } },
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
    
    // Check Home page continue banner
    const continueBtn = page.locator('#continue-game-btn');
    const isContinueVisible = await continueBtn.isVisible();
    console.log('Continue button visible with legacy won save:', isContinueVisible);

    // Navigate to Color Sort Details
    await page.click('.game-card[data-mode="colorsort"]');
    
    // In Details page, check what button is displayed
    const startBtn = page.locator('#start-game-btn');
    const resumeBtn = page.locator('#resume-game-btn');
    console.log('Start btn visible:', await startBtn.isVisible(), 'Resume btn visible:', await resumeBtn.isVisible());

    // Click Play / Resume
    if (await resumeBtn.isVisible()) {
      await resumeBtn.click();
    } else {
      await startBtn.click();
    }

    await expect(page.locator('.gameplay-wrapper')).toBeVisible();
    await page.waitForFunction(() => (window as any).__MOPUZZLE_LAUNCHER__?.getCurrentScene()?.engine !== undefined);

    const levelHud = await page.locator('#hud-level').innerText();
    const activeModal = await page.locator('#active-modal').isVisible();
    console.log('On enter gameplay with legacy save -> level:', levelHud, 'modal visible:', activeModal);
  });

  test('Scenario C: User plays, wins, clicks Next Level using keyboard (Enter / Space)', async ({ page }) => {
    await page.goto('/');
    await page.click('.game-card[data-mode="colorsort"]');
    await page.locator('#start-game-btn, #resume-game-btn').first().click();

    await expect(page.locator('.gameplay-wrapper')).toBeVisible();
    await page.waitForFunction(() => (window as any).__MOPUZZLE_LAUNCHER__?.getCurrentScene()?.engine !== undefined);

    // Setup winning pour
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

    const nextBtn = modal.locator('#modal-next-level');
    await nextBtn.focus();
    await page.keyboard.press('Enter');

    await page.waitForTimeout(500);

    const modalVisible = await page.locator('#active-modal').isVisible();
    const currentLevel = await page.locator('#hud-level').innerText();
    console.log('Keyboard Enter result -> modalVisible:', modalVisible, 'currentLevel:', currentLevel);
    expect(modalVisible).toBe(false);
    expect(currentLevel).toBe('2');
  });

});
