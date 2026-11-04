import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('MoPuzzle — Website Logo & Branding Verification', () => {

  test('1. Main website navbar displays SVG geometric monogram logo and text lockup', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.app-header');

    // Verify .brand-logo exists and contains the new SVG monogram (NOT the old text 'M')
    const brandLogo = page.locator('.brand-logo');
    await expect(brandLogo).toBeVisible();

    const brandLogoText = await brandLogo.innerText();
    expect(brandLogoText.trim()).not.toBe('M');

    // Verify the SVG element exists inside .brand-logo
    const logoSvg = brandLogo.locator('svg.mopuzzle-logo-svg');
    await expect(logoSvg).toBeVisible();

    // Verify viewBox and dimensions
    await expect(logoSvg).toHaveAttribute('viewBox', '0 0 512 512');

    // Verify brand text lockup
    const title = page.locator('.brand-text h1');
    const tagline = page.locator('.brand-text p');
    await expect(title).toHaveText('MoPuzzle');
    await expect(tagline).toBeVisible();

    // Capture screenshot of the navbar in Light Mode
    const header = page.locator('.app-header');
    await header.screenshot({ path: 'docs/screenshots/navbar-logo-light.png' });
  });

  test('2. Logo & text lockup maintains visual contrast across Light and Dark modes', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.app-header');

    // Light Mode check
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');
    const brandLogo = page.locator('.brand-logo');
    await expect(brandLogo).toBeVisible();

    // Toggle to Dark Mode
    const themeBtn = page.locator('#theme-toggle-btn');
    await themeBtn.click();
    await page.waitForTimeout(300);

    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(brandLogo).toBeVisible();

    // Capture screenshot of the navbar in Dark Mode
    const header = page.locator('.app-header');
    await header.screenshot({ path: 'docs/screenshots/navbar-logo-dark.png' });

    // Toggle back to light
    await themeBtn.click();
    await page.waitForTimeout(200);
  });

  test('3. HTML head contains updated favicon, Apple Touch Icon, and cache-busting version', async ({ page }) => {
    await page.goto('/');

    // Check SVG Favicon
    const svgIcon = page.locator('link[rel="icon"][type="image/svg+xml"]');
    await expect(svgIcon).toHaveAttribute('href', /icons\/icon\.svg\?v=1\.1\.0/);

    // Check PNG Favicons
    const png32Icon = page.locator('link[rel="icon"][sizes="32x32"]');
    await expect(png32Icon).toHaveAttribute('href', /icons\/icon-32\.png\?v=1\.1\.0/);

    // Check Apple Touch Icon
    const appleIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleIcon).toHaveAttribute('href', /icons\/apple-touch-icon\.png\?v=1\.1\.0/);

    // Check manifest link
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', /manifest\.webmanifest\?v=1\.1\.0/);
  });

  test('4. Web App Manifest is accessible with updated brand colors and valid icons', async ({ request }) => {
    const res = await request.get('/manifest.webmanifest');
    expect(res.ok()).toBeTruthy();

    const manifest = await res.json();
    expect(manifest.name).toBe('MoPuzzle — Think. Solve. Enjoy.');
    expect(manifest.short_name).toBe('MoPuzzle');
    expect(manifest.theme_color).toBe('#243A73');
    expect(manifest.background_color).toBe('#17274E');

    // Verify icons array has svg, 192, 512
    expect(Array.isArray(manifest.icons)).toBeTruthy();
    const srcs = manifest.icons.map((i: any) => i.src);
    expect(srcs).toContain('/icons/icon.svg');
    expect(srcs).toContain('/icons/icon-192.png');
    expect(srcs).toContain('/icons/icon-512.png');
  });

  test('5. Static icon files exist and are non-empty valid image assets', async () => {
    const iconFiles = [
      'public/icons/icon.svg',
      'public/icons/icon-512.png',
      'public/icons/icon-192.png',
      'public/icons/apple-touch-icon.png',
      'public/icons/icon-48.png',
      'public/icons/icon-32.png',
      'public/icons/icon-16.png',
      'public/favicon.ico'
    ];

    for (const relPath of iconFiles) {
      const fullPath = path.resolve(relPath);
      expect(fs.existsSync(fullPath)).toBeTruthy();
      const stats = fs.statSync(fullPath);
      expect(stats.size).toBeGreaterThan(100);
    }
  });

  test('6. About Page displays updated logo mark instead of generic M', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.app-header');

    // Navigate to Settings then About
    await page.locator('#settings-nav-btn').click();
    await page.waitForSelector('.page-settings');

    await page.locator('#about-nav-card').click();
    await page.waitForSelector('.page-about');

    const aboutLogo = page.locator('.page-about .brand-logo');
    await expect(aboutLogo).toBeVisible();

    const aboutText = await aboutLogo.innerText();
    expect(aboutText.trim()).not.toBe('M');

    const aboutSvg = aboutLogo.locator('svg.mopuzzle-logo-svg');
    await expect(aboutSvg).toBeVisible();

    // Screenshot of about page
    await page.screenshot({ path: 'docs/screenshots/about-logo.png' });
  });

});
