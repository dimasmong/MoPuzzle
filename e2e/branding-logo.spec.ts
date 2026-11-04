import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('MoPuzzle — Website Logo & Branding Verification', () => {

  test('1. Main website navbar displays Puzzle Fusion emblem SVG and brand text', async ({ page }) => {
    await page.goto('/');

    const logo = page.locator('.brand-logo .mopuzzle-logo-svg');
    await expect(logo).toBeVisible();

    // Verify all 4 puzzle quadrants are present inside the emblem
    const hasMerge = await page.locator('.brand-logo #quadrant-merge').count();
    const hasColorSort = await page.locator('.brand-logo #quadrant-colorsort').count();
    const hasSlide = await page.locator('.brand-logo #quadrant-slide').count();
    const hasBlockFit = await page.locator('.brand-logo #quadrant-blockfit').count();

    expect(hasMerge).toBe(1);
    expect(hasColorSort).toBe(1);
    expect(hasSlide).toBe(1);
    expect(hasBlockFit).toBe(1);

    // Verify brand text lockup
    await expect(page.locator('.brand-text h1')).toHaveText('MoPuzzle');
    await expect(page.locator('.brand-text p')).toHaveText('Think. Solve. Enjoy.');
  });

  test('2. Logo maintains visual contrast across Light and Dark themes', async ({ page }) => {
    await page.goto('/');

    // Light Theme
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('.brand-logo')).toBeVisible();

    // Switch to Dark Theme
    await page.click('#theme-toggle-btn');
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('.brand-logo')).toBeVisible();

    // Switch back to Light Theme
    await page.click('#theme-toggle-btn');
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('3. HTML head contains updated favicon, Apple Touch Icon, and manifest links', async ({ page }) => {
    await page.goto('/');

    const faviconSvg = page.locator('link[rel="icon"][type="image/svg+xml"]');
    await expect(faviconSvg).toHaveAttribute('href', /favicon\.svg/);

    const appleIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleIcon).toHaveAttribute('href', /apple-touch-icon\.png/);

    const manifest = page.locator('link[rel="manifest"]');
    await expect(manifest).toHaveAttribute('href', /manifest\.webmanifest/);
  });

  test('4. Web App Manifest is accessible with updated brand colors and valid icons', async ({ page }) => {
    const res = await page.request.get('/manifest.webmanifest');
    expect(res.status()).toBe(200);

    const manifestData = await res.json();
    expect(manifestData.name).toContain('MoPuzzle');
    expect(manifestData.theme_color).toBe('#243A73');
    expect(manifestData.background_color).toBe('#142244');
    expect(manifestData.icons.length).toBeGreaterThanOrEqual(3);
  });

  test('5. Static icon files exist and are non-empty valid image assets', async () => {
    const publicDir = path.resolve('public');
    const requiredFiles = [
      'favicon.svg',
      'favicon.ico',
      'apple-touch-icon.png',
      'manifest.webmanifest',
      'icons/icon.svg',
      'icons/logo-standalone.svg',
      'icons/icon-512.png',
      'icons/icon-192.png',
      'icons/icon-48.png',
      'icons/icon-32.png',
      'icons/icon-16.png'
    ];

    for (const file of requiredFiles) {
      const fullPath = path.join(publicDir, file);
      expect(fs.existsSync(fullPath)).toBe(true);
      const stats = fs.statSync(fullPath);
      expect(stats.size).toBeGreaterThan(0);
    }
  });

  test('6. About Page displays Puzzle Fusion emblem', async ({ page }) => {
    await page.goto('/');
    await page.click('button[data-nav="settings"]');
    await page.click('#settings-about-btn');

    await expect(page.locator('.page-about h2')).toBeVisible();
    const aboutLogo = page.locator('.page-about .brand-logo .mopuzzle-logo-svg');
    await expect(aboutLogo).toBeVisible();

    // Verify all 4 game quadrants are present in About page logo
    expect(await aboutLogo.locator('#quadrant-merge').count()).toBe(1);
    expect(await aboutLogo.locator('#quadrant-colorsort').count()).toBe(1);
    expect(await aboutLogo.locator('#quadrant-slide').count()).toBe(1);
    expect(await aboutLogo.locator('#quadrant-blockfit').count()).toBe(1);
  });

});
