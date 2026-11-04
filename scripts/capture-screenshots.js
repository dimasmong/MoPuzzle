import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function capture() {
  const screenshotsDir = path.resolve('docs/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 412, height: 860 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:4173...');
  await page.goto('http://localhost:4173');
  await page.waitForTimeout(600);

  // 1. Home (Light)
  await page.screenshot({ path: path.join(screenshotsDir, 'home-light.png') });
  console.log('Captured home-light.png');

  // 2. Home (Dark)
  await page.click('#theme-toggle-btn');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotsDir, 'home-dark.png') });
  console.log('Captured home-dark.png');
  await page.click('#theme-toggle-btn'); // back to light
  await page.waitForTimeout(300);

  // 3. Merge Numbers Gameplay
  await page.click('.game-card[data-mode="merge"]');
  await page.waitForTimeout(300);
  await page.locator('#start-game-btn, #resume-game-btn').first().click();
  await page.waitForTimeout(800);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(200);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotsDir, 'gameplay-merge.png') });
  console.log('Captured gameplay-merge.png');
  await page.click('#game-back-btn');
  await page.waitForTimeout(300);
  await page.click('#details-back-btn');
  await page.waitForTimeout(300);

  // 4. Color Sort Gameplay
  await page.click('.game-card[data-mode="colorsort"]');
  await page.waitForTimeout(300);
  await page.locator('#start-game-btn, #resume-game-btn').first().click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, 'gameplay-colorsort.png') });
  console.log('Captured gameplay-colorsort.png');
  await page.click('#game-back-btn');
  await page.waitForTimeout(300);
  await page.click('#details-back-btn');
  await page.waitForTimeout(300);

  // 5. Slide Puzzle Gameplay
  await page.click('.game-card[data-mode="slide"]');
  await page.waitForTimeout(300);
  await page.locator('#start-game-btn, #resume-game-btn').first().click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, 'gameplay-slide.png') });
  console.log('Captured gameplay-slide.png');
  await page.click('#game-back-btn');
  await page.waitForTimeout(300);
  await page.click('#details-back-btn');
  await page.waitForTimeout(300);

  // 6. Block Fit Gameplay
  await page.click('.game-card[data-mode="blockfit"]');
  await page.waitForTimeout(300);
  await page.locator('#start-game-btn, #resume-game-btn').first().click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, 'gameplay-blockfit.png') });
  console.log('Captured gameplay-blockfit.png');
  await page.click('#game-back-btn');
  await page.waitForTimeout(300);
  await page.click('#details-back-btn');
  await page.waitForTimeout(300);

  // 7. Achievements Page
  await page.click('button[data-nav="achievements"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotsDir, 'achievements.png') });
  console.log('Captured achievements.png');

  // 8. Stats Page
  await page.click('button[data-nav="stats"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotsDir, 'stats.png') });
  console.log('Captured stats.png');

  await browser.close();
  console.log('All screenshots captured successfully.');
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
