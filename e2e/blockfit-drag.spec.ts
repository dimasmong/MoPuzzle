import { test, expect, Page } from '@playwright/test';

async function navigateToBlockFit(page: Page) {
  await page.goto('/');
  await page.click('.game-card[data-mode="blockfit"]');
  await page.locator('#start-game-btn, #resume-game-btn').first().click();
  await expect(page.locator('#phaser-container canvas')).toBeVisible();
  await page.waitForTimeout(400);
}

test.describe('Block Fit Drag-and-Drop & Responsive Layout Regression Suite', () => {

  const viewports = [
    { name: 'small-mobile', width: 360, height: 800 },
    { name: 'iphone-14', width: 390, height: 844 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop-wide', width: 1440, height: 900 }
  ];

  for (const vp of viewports) {
    test(`renders correctly at viewport ${vp.name} (${vp.width}x${vp.height}) without overflow`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await navigateToBlockFit(page);

      // Verify no horizontal page scrolling / overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });
      expect(overflow).toBe(false);

      // Verify board geometry and tray geometry
      const geometry = await page.evaluate(() => {
        const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
        const scene = launcher?.getCurrentScene();
        if (!scene) return null;
        return {
          cellSize: scene.cellSize,
          boardOffset: scene.boardOffset,
          trayBounds: scene.trayBounds,
          shelfCount: scene.shelfContainers.length
        };
      });

      expect(geometry).not.toBeNull();
      expect(geometry!.cellSize).toBeGreaterThanOrEqual(28);
      expect(geometry!.cellSize).toBeLessThanOrEqual(48);
      expect(geometry!.boardOffset.x).toBeGreaterThanOrEqual(0);
      expect(geometry!.boardOffset.y).toBeGreaterThanOrEqual(10);
      // Tray matches board width and is positioned beneath board
      expect(geometry!.trayBounds.width).toBe(geometry!.cellSize * 10);
      expect(geometry!.trayBounds.y).toBeGreaterThan(geometry!.boardOffset.y + geometry!.cellSize * 10);
      expect(geometry!.shelfCount).toBe(3);
    });
  }

  test('validates deterministic grid snapping and 1:1 piece sizing', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await navigateToBlockFit(page);

    const testResult = await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      const cellSize = scene.cellSize;
      const boardOffset = scene.boardOffset;

      // 1. Check piece block sizing inside shelf container
      const container = scene.shelfContainers[0];
      const trayScale = container.trayScale;

      // In tray, container is scaled down
      const isScaledInTray = container.scaleX < 0.9;

      // Top-left origin mapping test
      // Piece 0 cols/rows
      const piece0 = scene.engine.currentPieces[0];
      const rows = piece0.matrix.length;
      const cols = piece0.matrix[0].length;

      // Container center positioned so top-left is exactly at boardOffset
      const centerX = boardOffset.x + (cols * cellSize) / 2;
      const centerY = boardOffset.y + (rows * cellSize) / 2;

      const snap00 = scene.getPlacementCoordinates(0, centerX, centerY);

      // Small jitter (+/- 0.3 * cellSize) should still deterministically snap to (0, 0)
      const snapJitter = scene.getPlacementCoordinates(
        0,
        centerX + cellSize * 0.28,
        centerY + cellSize * 0.28
      );

      // Shift by 1 full cellSize should snap to (1, 1)
      const snap11 = scene.getPlacementCoordinates(
        0,
        centerX + cellSize,
        centerY + cellSize
      );

      return {
        isScaledInTray,
        trayScale,
        snap00: { row: snap00.row, col: snap00.col },
        snapJitter: { row: snapJitter.row, col: snapJitter.col },
        snap11: { row: snap11.row, col: snap11.col }
      };
    });

    expect(testResult.isScaledInTray).toBe(true);
    expect(testResult.snap00).toEqual({ row: 0, col: 0 });
    expect(testResult.snapJitter).toEqual({ row: 0, col: 0 });
    expect(testResult.snap11).toEqual({ row: 1, col: 1 });
  });

  test('validates placement at corners, edges, out-of-bounds, and overlap rejection', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await navigateToBlockFit(page);

    const placementChecks = await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      const engine = scene.engine;

      // Setup a 1x1 test piece
      const dotPiece = {
        id: 'test_dot',
        name: '1x1',
        matrix: [[1]],
        color: '#FFBE0B',
        used: false
      };
      engine.currentPieces[0] = dotPiece;

      // 1. All four corners
      const canTopLeft = engine.canPlacePiece(dotPiece, 0, 0);
      const canTopRight = engine.canPlacePiece(dotPiece, 0, 9);
      const canBottomLeft = engine.canPlacePiece(dotPiece, 9, 0);
      const canBottomRight = engine.canPlacePiece(dotPiece, 9, 9);

      // 2. Out of bounds
      const canOOBTop = engine.canPlacePiece(dotPiece, -1, 0);
      const canOOBBottom = engine.canPlacePiece(dotPiece, 10, 0);
      const canOOBLeft = engine.canPlacePiece(dotPiece, 0, -1);
      const canOOBRight = engine.canPlacePiece(dotPiece, 0, 10);

      // 3. Multi-cell edge fit
      const bar3x1 = {
        id: 'bar3x1',
        name: '3x1',
        matrix: [[1], [1], [1]],
        color: '#3A86FF',
        used: false
      };
      const canFitBottomEdge = engine.canPlacePiece(bar3x1, 7, 0); // Rows 7, 8, 9
      const cannotFitBottomEdge = engine.canPlacePiece(bar3x1, 8, 0); // Rows 8, 9, 10 (overflow)

      // 4. Overlap rejection
      scene.attemptPlacement(0, 0, 0);
      const isOccupied = engine.grid[0][0] !== null;

      // Try placing another piece at (0, 0)
      const dotPiece2 = {
        id: 'test_dot_2',
        name: '1x1',
        matrix: [[1]],
        color: '#EF4444',
        used: false
      };
      engine.currentPieces[1] = dotPiece2;
      const canOverlap = engine.canPlacePiece(dotPiece2, 0, 0);

      return {
        corners: { canTopLeft, canTopRight, canBottomLeft, canBottomRight },
        oob: { canOOBTop, canOOBBottom, canOOBLeft, canOOBRight },
        edge: { canFitBottomEdge, cannotFitBottomEdge },
        overlap: { isOccupied, canOverlap }
      };
    });

    expect(placementChecks.corners).toEqual({
      canTopLeft: true,
      canTopRight: true,
      canBottomLeft: true,
      canBottomRight: true
    });
    expect(placementChecks.oob).toEqual({
      canOOBTop: false,
      canOOBBottom: false,
      canOOBLeft: false,
      canOOBRight: false
    });
    expect(placementChecks.edge).toEqual({
      canFitBottomEdge: true,
      cannotFitBottomEdge: false
    });
    expect(placementChecks.overlap.isOccupied).toBe(true);
    expect(placementChecks.overlap.canOverlap).toBe(false);
  });

  test('validates drag cancellation outside the board returns piece smoothly to tray', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await navigateToBlockFit(page);

    const cancelResult = await page.evaluate(async () => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      const container = scene.shelfContainers[1];

      const origX = container.origX;
      const origY = container.origY;
      const origScale = container.trayScale;

      // Simulate dragging far out of bounds (e.g. x: 50, y: 50)
      container.x = 50;
      container.y = 50;
      container.setScale(1.0);
      scene.isDragging = true;
      scene.draggingPieceContainer = container;

      // Handle drop outside
      scene.handleDrop(container);

      // Wait for tween back to complete
      await new Promise(r => setTimeout(r, 350));

      return {
        returnedX: Math.round(container.x),
        expectedX: Math.round(origX),
        returnedY: Math.round(container.y),
        expectedY: Math.round(origY),
        returnedScale: Math.round(container.scaleX * 100) / 100,
        expectedScale: Math.round(origScale * 100) / 100,
        isDragging: scene.isDragging
      };
    });

    expect(Math.abs(cancelResult.returnedX - cancelResult.expectedX)).toBeLessThanOrEqual(1);
    expect(Math.abs(cancelResult.returnedY - cancelResult.expectedY)).toBeLessThanOrEqual(1);
    expect(Math.abs(cancelResult.returnedScale - cancelResult.expectedScale)).toBeLessThanOrEqual(0.02);
    expect(cancelResult.isDragging).toBe(false);
  });

  test('updates score and HUD on piece placement and handles line clears and combos', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await navigateToBlockFit(page);

    const hudBefore = await page.locator('#hud-score').innerText();
    expect(hudBefore).toBe('0');

    // Place a piece and test score update
    await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();

      // Ensure piece 0 is a 2x2
      scene.engine.currentPieces[0] = {
        id: 'test_score_2x2',
        name: '2x2',
        matrix: [[1, 1], [1, 1]],
        color: '#FB5607',
        used: false
      };

      scene.attemptPlacement(0, 1, 1);
    });

    await page.waitForTimeout(100);
    const hudAfter = await page.locator('#hud-score').innerText();
    expect(parseInt(hudAfter, 10)).toBe(40); // 4 blocks * 10 pts

    // Test simultaneous row + col clear
    const lineClearResult = await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      const engine = scene.engine;

      // Pre-fill row 5 and col 5 except (5, 5)
      for (let c = 0; c < 10; c++) {
        if (c !== 5) engine.grid[5][c] = '#10B981';
      }
      for (let r = 0; r < 10; r++) {
        if (r !== 5) engine.grid[r][5] = '#10B981';
      }

      // 1x1 key piece
      scene.engine.currentPieces[1] = {
        id: 'key_1x1',
        name: '1x1',
        matrix: [[1]],
        color: '#FFBE0B',
        used: false
      };

      const res = engine.placePiece(1, 5, 5);
      return {
        clearedRows: res.clearedRows,
        clearedCols: res.clearedCols,
        comboCount: res.comboCount,
        newScore: engine.score
      };
    });

    expect(lineClearResult.clearedRows).toEqual([5]);
    expect(lineClearResult.clearedCols).toEqual([5]);
    expect(lineClearResult.comboCount).toBe(2);
    expect(lineClearResult.newScore).toBeGreaterThan(400);
  });

  test('preserves progress on page reload (save and resume)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await navigateToBlockFit(page);

    // Place a unique piece
    await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      scene.engine.currentPieces[0] = {
        id: 'save_test_piece',
        name: '1x1',
        matrix: [[1]],
        color: '#FF006E',
        used: false
      };
      scene.attemptPlacement(0, 3, 3);
    });

    await page.waitForTimeout(200);

    // Reload page
    await page.reload();
    await page.waitForTimeout(300);

    // Return to Block Fit
    await page.click('.game-card[data-mode="blockfit"]');
    await page.waitForTimeout(300);
    const resumeBtn = page.locator('#resume-game-btn');
    if (await resumeBtn.isVisible()) {
      await resumeBtn.click();
    } else {
      await page.locator('#start-game-btn').first().click();
    }
    await expect(page.locator('#phaser-container canvas')).toBeVisible();
    await page.waitForTimeout(300);

    // Verify cell at (3, 3) is still preserved
    const resumedCell = await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      const scene = launcher.getCurrentScene();
      return scene.engine.grid[3][3];
    });

    expect(resumedCell).toBe('#FF006E');
  });

  test('dynamically adjusts on viewport resize without breaking layout', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await navigateToBlockFit(page);

    // Check desktop cell size
    const desktopCell = await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      return launcher.getCurrentScene().cellSize;
    });
    expect(desktopCell).toBeGreaterThanOrEqual(44);

    // Resize viewport to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);

    // Cell size should adjust down
    const mobileCell = await page.evaluate(() => {
      const launcher = (window as any).__MOPUZZLE_LAUNCHER__;
      return launcher.getCurrentScene().cellSize;
    });
    expect(mobileCell).toBeLessThan(desktopCell);
    expect(mobileCell).toBeGreaterThanOrEqual(28);
  });

  test('captures screenshots in desktop and mobile viewports for visual audit', async ({ page }) => {
    // 1. Desktop Light
    await page.setViewportSize({ width: 1440, height: 900 });
    await navigateToBlockFit(page);
    await page.screenshot({ path: 'docs/screenshots/gameplay-blockfit.png' });

    // 2. Mobile Light
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'docs/screenshots/gameplay-blockfit-mobile.png' });

    // 3. Desktop Dark
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.click('#theme-toggle-btn');
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'docs/screenshots/gameplay-blockfit-dark.png' });
  });

});
