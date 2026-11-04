import { test, expect } from '@playwright/test';

test.describe('MoPuzzle — Gameplay Progression & Victory Flow Regression Suite', () => {

  test('1. Color Sort: solving level 1 and clicking Next Level advances to level 2 immediately without reload', async ({ page }) => {
    await page.goto('/');
    await page.click('.game-card[data-mode="colorsort"]');
    await page.locator('#start-game-btn, #resume-game-btn').first().click();

    await expect(page.locator('.gameplay-wrapper')).toBeVisible();
    await expect(page.locator('#hud-level')).toHaveText('1');
    await expect(page.locator('#phaser-container canvas')).toBeVisible();
    await page.waitForFunction(() => (window as any).__MOPUZZLE_LAUNCHER__?.getCurrentScene()?.engine !== undefined);

    // Inject a near-win configuration with 1 simple legal pour to win
    await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      // Setup state where pouring tube 1 into tube 0 wins
      scene.engine.tubes = [
        [1, 1, 1],       // Needs 1 more unit of color 1
        [1],             // Has 1 unit of color 1
        [2, 2, 2, 2],    // Complete
        [3, 3, 3, 3],    // Complete
        []               // Empty
      ];
      scene.engine.moves = 7;
      scene.renderTubes();
    });

    await page.waitForTimeout(200);

    // Perform the winning pour: Tube 1 -> Tube 0
    await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      scene.handleTubeClick(1);
      scene.handleTubeClick(0);
    });

    // Verify victory modal appears
    const modal = page.locator('#active-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal.locator('.result-title')).toContainText('Puzzle Solved');

    // Click "Next Level"
    const nextBtn = modal.locator('#modal-next-level');
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Verify modal closes
    await expect(modal).not.toBeVisible();

    // Verify level number incremented to Level 2
    await expect(page.locator('#hud-level')).toHaveText('2');
    const badgeText = await page.locator('.game-mode-badge').innerText();
    expect(badgeText).toContain('2');

    // Verify moves counter reset to 0
    await expect(page.locator('#hud-moves')).toHaveText('0');

    // Verify new puzzle is rendered and not already won
    const isWon = await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      return scene.engine.won;
    });
    expect(isWon).toBe(false);

    // Reload page to verify persistence of unlocked level and active level 2
    await page.reload();
    await expect(page.locator('#continue-game-btn')).toBeVisible();
    await page.click('#continue-game-btn');
    await expect(page.locator('#hud-level')).toHaveText('2');
  });

  test('2. Color Sort: completing Level 30 displays Campaign Complete screen without broken Next Level button', async ({ page }) => {
    await page.goto('/');
    await page.click('.game-card[data-mode="colorsort"]');
    await page.locator('#start-game-btn, #resume-game-btn').first().click();

    await expect(page.locator('.gameplay-wrapper')).toBeVisible();
    await expect(page.locator('#phaser-container canvas')).toBeVisible();
    await page.waitForFunction(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      return launcher?.getCurrentScene()?.engine !== undefined;
    });

    // Set level to 30 with near-win state
    await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      scene.engine.level = 30;
      scene.engine.tubes = [
        [1, 1, 1],
        [1],
        [2, 2, 2, 2],
        [3, 3, 3, 3],
        []
      ];
      scene.renderTubes();
      // Perform winning pour
      scene.handleTubeClick(1);
      scene.handleTubeClick(0);
    });

    // Verify Campaign Complete modal
    const modal = page.locator('#active-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal.locator('.result-title')).toContainText('All Levels Solved');

    // Ensure Next Level button is NOT present
    await expect(modal.locator('#modal-next-level')).toHaveCount(0);

    // Verify Select Level and Play Again buttons exist
    await expect(modal.locator('#modal-select-level')).toBeVisible();
    await expect(modal.locator('#modal-play-again')).toBeVisible();

    // Clicking Select Level navigates to Level Select page
    await modal.locator('#modal-select-level').click();
    await expect(page.locator('.page-levelselect')).toBeVisible();
  });

  test('3. Slide Puzzle: solving a puzzle offers Next Puzzle which starts a fresh solvable scramble', async ({ page }) => {
    await page.goto('/');
    await page.click('.game-card[data-mode="slide"]');
    // Select 3x3 difficulty
    await page.click('button[data-diff="3"]');
    await page.locator('#start-game-btn, #resume-game-btn').first().click();

    await expect(page.locator('.gameplay-wrapper')).toBeVisible();
    await expect(page.locator('#phaser-container canvas')).toBeVisible();
    await page.waitForFunction(() => (window as any).__MOPUZZLE_LAUNCHER__?.getCurrentScene()?.engine !== undefined);

    // Inject near-win 3x3 board: [1, 2, 3, 4, 5, 6, 7, 0, 8]
    await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      scene.engine.tiles = [1, 2, 3, 4, 5, 6, 7, 0, 8];
      scene.engine.moves = 14;
      scene.engine.elapsedSeconds = 25;
      scene.renderTiles(false);
    });

    await page.waitForTimeout(200);

    // Slide tile 8 to win
    await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      scene.handleTileClick(8);
    });

    // Victory modal appears
    const modal = page.locator('#active-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal.locator('.result-title')).toContainText('Puzzle Solved');

    // Click Next Puzzle
    const nextPuzzleBtn = modal.locator('#modal-next-puzzle');
    await expect(nextPuzzleBtn).toBeVisible();
    await nextPuzzleBtn.click();

    // Modal closes
    await expect(modal).not.toBeVisible();

    // Moves and timer reset
    await expect(page.locator('#hud-moves')).toHaveText('0');
    await expect(page.locator('#hud-time')).toHaveText('0:00');

    // Board is not already won
    const isWon = await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      return scene.engine.won;
    });
    expect(isWon).toBe(false);
  });

  test('4. Merge Numbers: reaching 2048 allows Keep Going to continue playing without duplicate modals', async ({ page }) => {
    await page.goto('/');
    await page.click('.game-card[data-mode="merge"]');
    await page.locator('#start-game-btn, #resume-game-btn').first().click();

    await expect(page.locator('.gameplay-wrapper')).toBeVisible();
    await expect(page.locator('#phaser-container canvas')).toBeVisible();
    await page.waitForFunction(() => (window as any).__MOPUZZLE_LAUNCHER__?.getCurrentScene()?.engine !== undefined);

    // Inject 1024 + 1024 board
    await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      scene.engine.board = [
        [1024, 1024, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      scene.renderBoard(false);
    });

    await page.waitForTimeout(200);

    // Swipe left to merge into 2048
    await page.keyboard.press('ArrowLeft');

    // 2048 milestone modal appears
    const modal = page.locator('#active-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal.locator('.result-title')).toContainText('2048');

    // Click "Keep Going"
    const continueBtn = modal.locator('#modal-merge-continue');
    await expect(continueBtn).toBeVisible();
    await continueBtn.click();

    // Modal closes
    await expect(modal).not.toBeVisible();

    // Make another move
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);

    // Modal does NOT reappear
    await expect(modal).not.toBeVisible();

    // Board still contains 2048
    const has2048 = await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      return scene.engine.board.some((row: number[]) => row.includes(2048));
    });
    expect(has2048).toBe(true);
  });

  test('5. Block Fit: game over modal displays Retry which resets board cleanly', async ({ page }) => {
    await page.goto('/');
    await page.click('.game-card[data-mode="blockfit"]');
    await page.locator('#start-game-btn, #resume-game-btn').first().click();

    await expect(page.locator('.gameplay-wrapper')).toBeVisible();
    await expect(page.locator('#phaser-container canvas')).toBeVisible();
    await page.waitForFunction(() => (window as any).__MOPUZZLE_LAUNCHER__?.getCurrentScene()?.engine !== undefined);

    // Trigger game over by filling board
    await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          scene.engine.grid[r][c] = '#999999';
        }
      }
      scene.engine.currentPieces[0] = {
        id: 'big1',
        name: '3x3',
        matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
        color: '#FF0000',
        used: false
      };
      scene.engine.currentPieces[1] = {
        id: 'big2',
        name: '3x3',
        matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
        color: '#FF0000',
        used: false
      };
      scene.engine.currentPieces[2] = {
        id: 'big3',
        name: '3x3',
        matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
        color: '#FF0000',
        used: false
      };
      scene.engine.gameOver = true;
      scene.notifyState();
    });

    // Game Over modal appears
    const modal = page.locator('#active-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal.locator('.result-title')).toContainText('Game Over');

    // Click Retry
    const retryBtn = modal.locator('#modal-over-retry');
    await expect(retryBtn).toBeVisible();
    await retryBtn.click();

    // Modal closes
    await expect(modal).not.toBeVisible();

    // Score HUD resets to 0
    await expect(page.locator('#hud-score')).toHaveText('0');

    // Board grid is reset to empty
    const isGridEmpty = await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      return scene.engine.grid.every((row: any[]) => row.every(cell => cell === null));
    });
    expect(isGridEmpty).toBe(true);
  });

  test('6. Full Cross-Game Navigation & State Invariants', async ({ page }) => {
    // Home -> Color Sort -> Back -> Slide -> Back -> Merge -> Back -> Block Fit -> Home
    await page.goto('/');

    // 1. Color Sort
    await page.click('.game-card[data-mode="colorsort"]');
    await expect(page.locator('.page-details h2')).toContainText('Color Sort');
    await page.click('#details-back-btn');

    // 2. Slide
    await page.click('.game-card[data-mode="slide"]');
    await expect(page.locator('.page-details h2')).toContainText('Slide Puzzle');
    await page.click('#details-back-btn');

    // 3. Merge
    await page.click('.game-card[data-mode="merge"]');
    await expect(page.locator('.page-details h2')).toContainText('Merge Numbers');
    await page.click('#details-back-btn');

    // 4. Block Fit
    await page.click('.game-card[data-mode="blockfit"]');
    await expect(page.locator('.page-details h2')).toContainText('Block Fit');
    await page.click('#details-back-btn');

    // Verified back on Home with 4 game cards
    await expect(page.locator('.game-card')).toHaveCount(4);
  });

});
