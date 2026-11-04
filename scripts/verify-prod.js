import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function verifyProd() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  console.log('Navigating to production https://mopuzzle.vercel.app...');
  const res = await page.goto('https://mopuzzle.vercel.app', { waitUntil: 'networkidle' });
  console.log('HTTP status:', res ? res.status() : 'null');

  const brandText = await page.locator('.brand-text h1').innerText();
  console.log('Brand Title in production:', brandText);

  const brandLogoText = (await page.locator('.brand-logo').innerText()).trim();
  console.log('Brand Logo text (should NOT be M):', brandLogoText || '(pure SVG)');

  const hasSvg = await page.locator('.brand-logo svg.mopuzzle-logo-svg').count();
  console.log('Brand Logo SVG exists count:', hasSvg);

  const faviconHref = await page.locator('link[rel="icon"][type="image/svg+xml"]').getAttribute('href');
  console.log('Favicon href:', faviconHref);

  const outScreenshot = path.resolve('docs/screenshots/production-verified.png');
  await page.screenshot({ path: outScreenshot });
  console.log('Production screenshot saved to:', outScreenshot);

  // Also toggle dark mode and capture
  await page.locator('#theme-toggle-btn').click();
  await page.waitForTimeout(300);
  const outDark = path.resolve('docs/screenshots/production-verified-dark.png');
  await page.screenshot({ path: outDark });
  console.log('Production dark screenshot saved to:', outDark);

  await browser.close();
}

verifyProd().catch(err => {
  console.error('Prod verification error:', err);
  process.exit(1);
});
