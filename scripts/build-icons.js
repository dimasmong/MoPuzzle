import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// The Master SVG Monogram Definition (512x512)
export function getMasterLogoSVG({ width = 512, height = 512, withBackground = true } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${width}" height="${height}">
  <defs>
    <!-- Background Gradient: Deep MoNavy -->
    <linearGradient id="mpBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#17274E" />
      <stop offset="50%" stop-color="#243A73" />
      <stop offset="100%" stop-color="#121F40" />
    </linearGradient>

    <!-- Accent Sky Aqua Gradient for P & Right Wing -->
    <linearGradient id="mpAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#BAF2FD" />
      <stop offset="50%" stop-color="#A1E3F9" />
      <stop offset="100%" stop-color="#55C9EE" />
    </linearGradient>

    <!-- Frost White Gradient for Left M Wing -->
    <linearGradient id="mpWhiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#E8F6FE" />
    </linearGradient>

    <!-- Tactile Drop Shadow for Logo Mark -->
    <filter id="mpShadow" x="-12%" y="-12%" width="124%" height="124%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#050A18" flood-opacity="0.48" />
    </filter>
  </defs>

  ${withBackground ? `
  <!-- Squircle Base Tile -->
  <rect width="512" height="512" rx="114" fill="url(#mpBgGrad)" />

  <!-- Subtle Specular Inner Rim -->
  <rect x="14" y="14" width="484" height="484" rx="100" fill="none" stroke="#A1E3F9" stroke-opacity="0.22" stroke-width="5" />
  ` : ''}

  <!-- Interlocking M + P Puzzle Monogram Emblem -->
  <g ${withBackground ? 'filter="url(#mpShadow)"' : ''}>
    
    <!-- PIECE 1: LEFT WING OF M (Frost White) with Interlocking Convex Puzzle Tab -->
    <!-- 
      - Left Pillar: X from 100 to 156, Y from 114 to 398
      - Diagonal: Slopes down to center junction
      - Puzzle Tab: Authentic circular jigsaw knob centered at X: 248, Y: 256
    -->
    <path d="
      M 120 114
      C 109 114 100 123 100 134
      L 100 378
      C 100 389 109 398 120 398
      L 146 398
      C 157 398 166 389 166 378
      L 166 250
      L 214 332
      C 220 342 232 346 242 342
      C 248 339 252 334 252 326
      L 252 284
      C 240 284 230 274 230 262
      C 230 240 266 240 266 262
      C 266 274 256 284 244 284
      L 244 290
      L 186 142
      C 180 128 166 114 150 114
      Z" fill="url(#mpWhiteGrad)" />

    <!-- PIECE 2: P-LOOP & RIGHT WING OF M (Electric Sky Aqua) with Interlocking Socket -->
    <!-- 
      - Center Stem: Matches puzzle socket at Y: 262
      - P Loop: Arches rightward to X: 412, Y: 114 to 326
      - Right Leg of M: Extends to bottom at X: 356, Y: 398
    -->
    <path d="
      M 264 114
      C 252 114 242 124 242 136
      L 242 216
      C 254 216 264 226 264 238
      C 264 260 228 260 228 238
      C 228 226 238 216 250 216
      L 250 174
      L 336 174
      C 378 174 412 208 412 250
      C 412 292 378 326 336 326
      L 316 326
      L 366 378
      C 374 386 368 398 356 398
      L 328 398
      C 320 398 312 394 306 388
      L 260 338
      L 260 378
      C 260 389 251 398 240 398
      L 224 398
      C 216 398 210 392 210 384
      Z" fill="url(#mpAccentGrad)" />

    <!-- Negative Space Counter inside P -->
    <rect x="306" y="222" width="44" height="56" rx="22" fill="#17274E" />
  </g>
</svg>`;
}

async function buildIcons() {
  const iconsDir = path.resolve('public/icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // 1. Write the main SVG icon
  const svg = getMasterLogoSVG({ width: 512, height: 512, withBackground: true });
  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svg, 'utf-8');
  console.log('✓ Wrote public/icons/icon.svg');

  // Also write a standalone version (without squircle) for optional transparent usage
  const svgStandalone = getMasterLogoSVG({ width: 512, height: 512, withBackground: false });
  fs.writeFileSync(path.join(iconsDir, 'logo-standalone.svg'), svgStandalone, 'utf-8');
  console.log('✓ Wrote public/icons/logo-standalone.svg');

  // 2. Launch Chromium with Playwright to render pixel-perfect PNGs
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const renderSizes = [
    { name: 'icon-512.png', size: 512 },
    { name: 'icon-192.png', size: 192 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-48.png', size: 48 },
    { name: 'icon-32.png', size: 32 },
    { name: 'icon-16.png', size: 16 }
  ];

  for (const { name, size } of renderSizes) {
    const html = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { width: ${size}px; height: ${size}px; overflow: hidden; background: transparent; }
        svg { width: ${size}px; height: ${size}px; display: block; }
      </style>
    </head>
    <body>
      ${svg}
    </body>
    </html>`;

    await page.setViewportSize({ width: size, height: size });
    await page.setContent(html);
    await page.waitForTimeout(50);

    const outPath = path.join(iconsDir, name);
    await page.screenshot({ path: outPath, omitBackground: true });
    console.log('✓ Rendered ' + name + ' (' + size + 'x' + size + ')');
  }

  // Also create public/apple-touch-icon.png at root if browsers look there
  const rootAppleIcon = path.resolve('public/apple-touch-icon.png');
  fs.copyFileSync(path.join(iconsDir, 'apple-touch-icon.png'), rootAppleIcon);
  console.log('✓ Wrote public/apple-touch-icon.png');

  // Also create public/favicon.svg
  fs.writeFileSync(path.resolve('public/favicon.svg'), svg, 'utf-8');
  console.log('✓ Wrote public/favicon.svg');

  await browser.close();
  console.log('All icons generated successfully!');
}

buildIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
