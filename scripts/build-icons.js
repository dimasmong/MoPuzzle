import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * MoPuzzle Master Logo — Puzzle Fusion
 * Combines all 4 puzzle games into ONE cohesive geometric emblem:
 * 1. Merge Numbers (2048) — Numbered tiles fusing with kinetic chevrons
 * 2. Color Sort — Glass sorting tube with 3 stratified liquid layers (Ice Blue, Green, Purple)
 * 3. Slide Puzzle — 2x2 sliding grid with numbered tiles (1, 2, 3) and an intentional empty space
 * 4. Block Fit — Polyomino geometric block pieces fitting into a grid with 3D bevels
 * Center: Central Puzzle Fusion Nexus locking all 4 realms together
 */
export function getMasterLogoSVG({ width = 512, height = 512, withBackground = true } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${width}" height="${height}">
  <defs>
    <!-- Master Board Gradient: Deep Navy -->
    <linearGradient id="mpBoardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#142244" />
      <stop offset="50%" stop-color="#243A73" />
      <stop offset="100%" stop-color="#101A33" />
    </linearGradient>

    <!-- Outer Beveled Specular Rim -->
    <linearGradient id="mpRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#BAF2FD" stop-opacity="0.65" />
      <stop offset="50%" stop-color="#A1E3F9" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#35D4A0" stop-opacity="0.45" />
    </linearGradient>

    <!-- Q1: Merge Numbers - Ice Blue Gradient -->
    <linearGradient id="mpMergeBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#BAF2FD" />
      <stop offset="100%" stop-color="#5EC8EE" />
    </linearGradient>

    <!-- Q1: Merge Numbers - Royal Purple Gradient -->
    <linearGradient id="mpMergePurple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#B282F5" />
      <stop offset="50%" stop-color="#9A64E8" />
      <stop offset="100%" stop-color="#7028D6" />
    </linearGradient>

    <!-- Q2: Liquid Layer 1 (Electric Ice Blue) -->
    <linearGradient id="mpLiquidBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#BAF2FD" />
      <stop offset="100%" stop-color="#4AC2EC" />
    </linearGradient>

    <!-- Q2: Liquid Layer 2 (Radiant Emerald Green) -->
    <linearGradient id="mpLiquidGreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4EE5B2" />
      <stop offset="50%" stop-color="#35D4A0" />
      <stop offset="100%" stop-color="#1DBB87" />
    </linearGradient>

    <!-- Q2: Liquid Layer 3 (Deep Purple) -->
    <linearGradient id="mpLiquidPurple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#AB7BF7" />
      <stop offset="100%" stop-color="#7834D9" />
    </linearGradient>

    <!-- Q4: Block Fit Green Blocks -->
    <linearGradient id="mpBlockGreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4CE8B3" />
      <stop offset="100%" stop-color="#24C18D" />
    </linearGradient>

    <!-- Q4: Block Fit Accent Block -->
    <linearGradient id="mpBlockAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#BAF2FD" />
      <stop offset="100%" stop-color="#55C9EE" />
    </linearGradient>

    <!-- Drop Shadows for Floating Elements -->
    <filter id="mpDropGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#050A18" flood-opacity="0.45" />
    </filter>
  </defs>

  ${withBackground ? `
  <!-- Master Board Squircle Base -->
  <rect width="512" height="512" rx="112" fill="url(#mpBoardBg)" />

  <!-- Outer Beveled Specular Border -->
  <rect x="14" y="14" width="484" height="484" rx="100" fill="none" stroke="url(#mpRimGrad)" stroke-width="4.5" />

  <!-- Inner Recessed Board Tray -->
  <rect x="36" y="36" width="440" height="440" rx="78" fill="#0B1426" fill-opacity="0.55" stroke="#1F325E" stroke-width="3" />

  <!-- Board Grid Dividing Channels (Horizontal & Vertical Groove) -->
  <line x1="256" y1="46" x2="256" y2="466" stroke="#14213D" stroke-width="12" stroke-linecap="round" />
  <line x1="256" y1="46" x2="256" y2="466" stroke="#2B437D" stroke-width="2" stroke-opacity="0.4" />
  <line x1="46" y1="256" x2="466" y2="256" stroke="#14213D" stroke-width="12" stroke-linecap="round" />
  <line x1="46" y1="256" x2="466" y2="256" stroke="#2B437D" stroke-width="2" stroke-opacity="0.4" />
  ` : ''}

  <!-- ======================================================== -->
  <!-- QUADRANT 1 (TOP-LEFT): MERGE NUMBERS (2048 Fusion)       -->
  <!-- ======================================================== -->
  <g id="quadrant-merge" ${withBackground ? 'filter="url(#mpDropGlow)"' : ''}>
    <rect x="52" y="52" width="188" height="188" rx="28" fill="#131E37" fill-opacity="0.6" stroke="#1E2F54" stroke-width="2" />
    <g transform="translate(68, 76)">
      <rect width="72" height="72" rx="18" fill="url(#mpMergeBlue)" />
      <rect x="4" y="4" width="64" height="8" rx="4" fill="#FFFFFF" fill-opacity="0.45" />
      <path d="M 26 27 C 26 20 46 20 46 28 C 46 34 39 37 32 44 L 26 50 L 47 50 L 47 55 L 25 55 L 25 49 L 36 38 C 40 33 42 30 42 27 C 42 24 38 23 34 23 C 30 23 28 25 27 28 Z" fill="#102042" />
    </g>
    <path d="M 124 132 L 134 140 L 124 148 M 132 132 L 142 140 L 132 148" fill="none" stroke="#A1E3F9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />
    <g transform="translate(132, 128)">
      <rect width="92" height="92" rx="22" fill="url(#mpMergePurple)" stroke="#D4BBFC" stroke-width="2" stroke-opacity="0.6" />
      <rect x="5" y="5" width="82" height="10" rx="5" fill="#FFFFFF" fill-opacity="0.4" />
      <path d="M 52 24 L 32 54 L 52 54 L 52 68 L 59 68 L 59 54 L 66 54 L 66 48 L 59 48 L 59 24 Z M 52 33 L 52 48 L 40 48 Z" fill="#FFFFFF" />
    </g>
  </g>

  <!-- ======================================================== -->
  <!-- QUADRANT 2 (TOP-RIGHT): COLOR SORT (Sorting Tube)        -->
  <!-- ======================================================== -->
  <g id="quadrant-colorsort" ${withBackground ? 'filter="url(#mpDropGlow)"' : ''}>
    <rect x="272" y="52" width="188" height="188" rx="28" fill="#131E37" fill-opacity="0.6" stroke="#1E2F54" stroke-width="2" />
    <g transform="translate(328, 64)">
      <rect x="-8" y="0" width="92" height="12" rx="6" fill="#A1E3F9" fill-opacity="0.25" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="2" />
      <clipPath id="mpTubeClip">
        <path d="M 0 8 L 0 126 A 38 38 0 0 0 76 126 L 76 8 Z" />
      </clipPath>
      <g clip-path="url(#mpTubeClip)">
        <rect x="0" y="8" width="76" height="160" fill="#0C1527" />
        <path d="M 0 110 L 0 126 A 38 38 0 0 0 76 126 L 76 110 Z" fill="url(#mpLiquidPurple)" />
        <rect x="0" y="66" width="76" height="46" fill="url(#mpLiquidGreen)" />
        <line x1="0" y1="66" x2="76" y2="66" stroke="#35D4A0" stroke-width="1.5" stroke-opacity="0.6" />
        <path d="M 0 24 Q 38 30 76 24 L 76 66 L 0 66 Z" fill="url(#mpLiquidBlue)" />
        <path d="M 0 24 Q 38 30 76 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-opacity="0.75" />
        <circle cx="24" cy="46" r="3.5" fill="#FFFFFF" fill-opacity="0.6" />
        <circle cx="52" cy="88" r="4" fill="#FFFFFF" fill-opacity="0.5" />
        <circle cx="34" cy="136" r="3" fill="#FFFFFF" fill-opacity="0.5" />
      </g>
      <path d="M 0 8 L 0 126 A 38 38 0 0 0 76 126 L 76 8" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-opacity="0.65" />
      <path d="M 8 16 L 8 124 A 30 30 0 0 0 38 154" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-opacity="0.4" />
    </g>
  </g>

  <!-- ======================================================== -->
  <!-- QUADRANT 3 (BOTTOM-LEFT): SLIDE PUZZLE (Numbered Tiles)  -->
  <!-- ======================================================== -->
  <g id="quadrant-slide" ${withBackground ? 'filter="url(#mpDropGlow)"' : ''}>
    <rect x="52" y="272" width="188" height="188" rx="28" fill="#131E37" fill-opacity="0.6" stroke="#1E2F54" stroke-width="2" />
    <g transform="translate(68, 288)">
      <g transform="translate(0, 0)">
        <rect width="72" height="72" rx="16" fill="url(#mpMergePurple)" />
        <rect x="4" y="4" width="64" height="8" rx="4" fill="#FFFFFF" fill-opacity="0.35" />
        <path d="M 33 28 L 40 23 L 44 23 L 44 51 L 37 51 L 37 28 Z M 30 51 L 49 51 L 49 55 L 30 55 Z" fill="#FFFFFF" />
      </g>
      <g transform="translate(84, 0)">
        <rect width="72" height="72" rx="16" fill="url(#mpMergeBlue)" />
        <rect x="4" y="4" width="64" height="8" rx="4" fill="#FFFFFF" fill-opacity="0.45" />
        <path d="M 27 27 C 27 20 47 20 47 28 C 47 34 40 37 33 44 L 27 50 L 48 50 L 48 55 L 26 55 L 26 49 L 37 38 C 41 33 43 30 43 27 C 43 24 39 23 35 23 C 31 23 29 25 28 28 Z" fill="#102042" />
      </g>
      <g transform="translate(0, 84)">
        <rect width="72" height="72" rx="16" fill="url(#mpBlockGreen)" />
        <rect x="4" y="4" width="64" height="8" rx="4" fill="#FFFFFF" fill-opacity="0.4" />
        <path d="M 28 24 L 46 24 L 46 29 L 37 37 C 42 37 47 40 47 46 C 47 53 41 56 34 56 C 29 56 26 53 25 49 L 31 47 C 32 49 33 51 35 51 C 38 51 40 49 40 46 C 40 42 37 41 33 41 L 29 41 L 29 36 L 38 29 L 28 29 Z" fill="#102042" />
      </g>
      <g transform="translate(84, 84)">
        <rect width="72" height="72" rx="16" fill="#080F1D" stroke="#A1E3F9" stroke-width="2" stroke-opacity="0.3" stroke-dasharray="6 4" />
        <path d="M 36 24 L 36 48 M 28 40 L 36 48 L 44 40" fill="none" stroke="#A1E3F9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.45" />
      </g>
    </g>
  </g>

  <!-- ======================================================== -->
  <!-- QUADRANT 4 (BOTTOM-RIGHT): BLOCK FIT (Polyomino Grid)    -->
  <!-- ======================================================== -->
  <g id="quadrant-blockfit" ${withBackground ? 'filter="url(#mpDropGlow)"' : ''}>
    <rect x="272" y="272" width="188" height="188" rx="28" fill="#131E37" fill-opacity="0.6" stroke="#1E2F54" stroke-width="2" />
    <g transform="translate(290, 290)">
      <g opacity="0.18" stroke="#A1E3F9" stroke-width="1.5">
        <rect x="0" y="0" width="48" height="48" rx="8" fill="none" />
        <rect x="52" y="0" width="48" height="48" rx="8" fill="none" />
        <rect x="104" y="0" width="48" height="48" rx="8" fill="none" />
        <rect x="0" y="52" width="48" height="48" rx="8" fill="none" />
        <rect x="52" y="52" width="48" height="48" rx="8" fill="none" />
        <rect x="104" y="52" width="48" height="48" rx="8" fill="none" />
        <rect x="0" y="104" width="48" height="48" rx="8" fill="none" />
        <rect x="52" y="104" width="48" height="48" rx="8" fill="none" />
        <rect x="104" y="104" width="48" height="48" rx="8" fill="none" />
      </g>
      <g transform="translate(0, 0)">
        <rect width="48" height="48" rx="10" fill="url(#mpBlockGreen)" />
        <rect x="3" y="3" width="42" height="6" rx="3" fill="#FFFFFF" fill-opacity="0.45" />
        <rect x="3" y="41" width="42" height="4" rx="2" fill="#000000" fill-opacity="0.2" />
      </g>
      <g transform="translate(0, 52)">
        <rect width="48" height="48" rx="10" fill="url(#mpBlockGreen)" />
        <rect x="3" y="3" width="42" height="6" rx="3" fill="#FFFFFF" fill-opacity="0.45" />
        <rect x="3" y="41" width="42" height="4" rx="2" fill="#000000" fill-opacity="0.2" />
      </g>
      <g transform="translate(52, 52)">
        <rect width="48" height="48" rx="10" fill="url(#mpBlockGreen)" />
        <rect x="3" y="3" width="42" height="6" rx="3" fill="#FFFFFF" fill-opacity="0.45" />
        <rect x="3" y="41" width="42" height="4" rx="2" fill="#000000" fill-opacity="0.2" />
      </g>
      <g transform="translate(52, 0)">
        <rect width="48" height="48" rx="10" fill="url(#mpBlockAccent)" stroke="#FFFFFF" stroke-width="2" stroke-opacity="0.8" />
        <rect x="3" y="3" width="42" height="6" rx="3" fill="#FFFFFF" fill-opacity="0.5" />
        <rect x="3" y="41" width="42" height="4" rx="2" fill="#000000" fill-opacity="0.2" />
      </g>
      <g transform="translate(104, 52)">
        <rect width="48" height="48" rx="10" fill="#35D4A0" fill-opacity="0.2" stroke="#35D4A0" stroke-width="2" stroke-dasharray="4 3" stroke-opacity="0.7" />
      </g>
    </g>
  </g>

  <!-- ======================================================== -->
  <!-- CENTER PUZZLE FUSION MEDALLION                           -->
  <!-- ======================================================== -->
  <g id="center-fusion-node">
    <circle cx="256" cy="256" r="36" fill="#0E182F" stroke="#243A73" stroke-width="3" />
    <circle cx="256" cy="256" r="26" fill="url(#mpBoardBg)" stroke="#A1E3F9" stroke-width="3.5" />
    <polygon points="256,238 268,256 256,274 244,256" fill="#BAF2FD" />
    <circle cx="256" cy="256" r="4.5" fill="#FFFFFF" />
  </g>
</svg>`;
}

export function getSmallIconSVG({ width = 512, height = 512 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${width}" height="${height}">
  <defs>
    <linearGradient id="smBoardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#142244" />
      <stop offset="50%" stop-color="#243A73" />
      <stop offset="100%" stop-color="#101A33" />
    </linearGradient>
    <linearGradient id="smMergeBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#BAF2FD" />
      <stop offset="100%" stop-color="#5EC8EE" />
    </linearGradient>
    <linearGradient id="smMergePurple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#B282F5" />
      <stop offset="100%" stop-color="#7028D6" />
    </linearGradient>
    <linearGradient id="smGreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4EE5B2" />
      <stop offset="100%" stop-color="#21BD8A" />
    </linearGradient>
  </defs>

  <rect width="512" height="512" rx="116" fill="url(#smBoardBg)" />
  <rect x="16" y="16" width="480" height="480" rx="100" fill="none" stroke="#A1E3F9" stroke-width="12" stroke-opacity="0.4" />

  <line x1="256" y1="36" x2="256" y2="476" stroke="#0D1629" stroke-width="24" stroke-linecap="round" />
  <line x1="36" y1="256" x2="476" y2="256" stroke="#0D1629" stroke-width="24" stroke-linecap="round" />

  <!-- Q1 (Top-Left): Merge Numbers -->
  <g transform="translate(68, 68)">
    <rect x="0" y="0" width="86" height="86" rx="22" fill="url(#smMergeBlue)" />
    <rect x="74" y="74" width="86" height="86" rx="22" fill="url(#smMergePurple)" />
    <circle cx="80" cy="80" r="18" fill="#FFFFFF" />
  </g>

  <!-- Q2 (Top-Right): Color Sort Tube -->
  <g transform="translate(322, 64)">
    <rect x="-10" y="0" width="108" height="18" rx="9" fill="#FFFFFF" />
    <clipPath id="smTubeClip">
      <path d="M 0 10 L 0 120 A 44 44 0 0 0 88 120 L 88 10 Z" />
    </clipPath>
    <g clip-path="url(#smTubeClip)">
      <rect x="0" y="10" width="88" height="44" fill="url(#smMergeBlue)" />
      <rect x="0" y="54" width="88" height="44" fill="url(#smGreen)" />
      <rect x="0" y="98" width="88" height="60" fill="url(#smMergePurple)" />
    </g>
    <path d="M 0 10 L 0 120 A 44 44 0 0 0 88 120 L 88 10" fill="none" stroke="#FFFFFF" stroke-width="10" />
  </g>

  <!-- Q3 (Bottom-Left): Slide Puzzle -->
  <g transform="translate(68, 284)">
    <rect x="0" y="0" width="74" height="74" rx="18" fill="url(#smMergePurple)" />
    <rect x="86" y="0" width="74" height="74" rx="18" fill="url(#smMergeBlue)" />
    <rect x="0" y="86" width="74" height="74" rx="18" fill="url(#smGreen)" />
    <rect x="86" y="86" width="74" height="74" rx="18" fill="#080F1E" stroke="#A1E3F9" stroke-width="5" stroke-dasharray="10 6" stroke-opacity="0.65" />
  </g>

  <!-- Q4 (Bottom-Right): Block Fit -->
  <g transform="translate(284, 284)">
    <rect x="0" y="0" width="74" height="74" rx="18" fill="url(#smGreen)" />
    <rect x="0" y="86" width="74" height="74" rx="18" fill="url(#smGreen)" />
    <rect x="86" y="86" width="74" height="74" rx="18" fill="url(#smGreen)" />
    <rect x="86" y="0" width="74" height="74" rx="18" fill="url(#smMergeBlue)" stroke="#FFFFFF" stroke-width="6" />
  </g>

  <!-- Center Core -->
  <circle cx="256" cy="256" r="32" fill="#142244" stroke="#A1E3F9" stroke-width="8" />
  <circle cx="256" cy="256" r="14" fill="#FFFFFF" />
</svg>`;
}

function createIcoFile(images) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  let offset = 6 + count * 16;
  const entries = [];
  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += img.buffer.length;
    entries.push(entry);
  }

  return Buffer.concat([header, ...entries, ...images.map(img => img.buffer)]);
}

async function buildIcons() {
  const iconsDir = path.resolve('public/icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // 1. Write the primary SVG master assets
  const primarySvg = getMasterLogoSVG({ width: 512, height: 512, withBackground: true });
  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), primarySvg, 'utf-8');
  console.log('✓ Wrote public/icons/icon.svg');

  const primaryStandaloneSvg = getMasterLogoSVG({ width: 512, height: 512, withBackground: false });
  fs.writeFileSync(path.join(iconsDir, 'logo-standalone.svg'), primaryStandaloneSvg, 'utf-8');
  console.log('✓ Wrote public/icons/logo-standalone.svg');

  // 2. Write the small icon SVG (used for browser favicon)
  const smallSvg = getSmallIconSVG({ width: 512, height: 512 });
  fs.writeFileSync(path.resolve('public/favicon.svg'), smallSvg, 'utf-8');
  console.log('✓ Wrote public/favicon.svg');

  // 3. Launch Chromium with Playwright to render pixel-perfect PNGs
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const largeRenders = [
    { name: 'icon-512.png', size: 512 },
    { name: 'icon-192.png', size: 192 },
    { name: 'apple-touch-icon.png', size: 180 }
  ];

  for (const { name, size } of largeRenders) {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>* { margin: 0; padding: 0; } body { width: ${size}px; height: ${size}px; overflow: hidden; background: transparent; } svg { width: ${size}px; height: ${size}px; display: block; }</style></head><body>${primarySvg}</body></html>`;
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(html);
    await page.waitForTimeout(50);
    const outPath = path.join(iconsDir, name);
    await page.screenshot({ path: outPath, omitBackground: true });
    console.log(`✓ Rendered ${name} (${size}x${size})`);
  }

  const smallRenders = [
    { name: 'icon-48.png', size: 48 },
    { name: 'icon-32.png', size: 32 },
    { name: 'icon-16.png', size: 16 }
  ];

  const icoBuffers = [];

  for (const { name, size } of smallRenders) {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>* { margin: 0; padding: 0; } body { width: ${size}px; height: ${size}px; overflow: hidden; background: transparent; } svg { width: ${size}px; height: ${size}px; display: block; }</style></head><body>${smallSvg}</body></html>`;
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(html);
    await page.waitForTimeout(50);
    const outPath = path.join(iconsDir, name);
    const buf = await page.screenshot({ path: outPath, omitBackground: true });
    icoBuffers.push({ width: size, height: size, buffer: buf });
    console.log(`✓ Rendered ${name} (${size}x${size})`);
  }

  const rootAppleIcon = path.resolve('public/apple-touch-icon.png');
  fs.copyFileSync(path.join(iconsDir, 'apple-touch-icon.png'), rootAppleIcon);
  console.log('✓ Wrote public/apple-touch-icon.png');

  const icoData = createIcoFile(icoBuffers);
  fs.writeFileSync(path.resolve('public/favicon.ico'), icoData);
  console.log('✓ Wrote public/favicon.ico (16x16, 32x32, 48x48)');

  await browser.close();
  console.log('All branding icons generated successfully!');
}

buildIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
