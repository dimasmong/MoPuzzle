export const Icons = {
  logo: `<svg class="mopuzzle-logo-svg" viewBox="0 0 512 512" width="100%" height="100%" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="mpNavBoardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#142244" />
      <stop offset="50%" stop-color="#243A73" />
      <stop offset="100%" stop-color="#101A33" />
    </linearGradient>
    <linearGradient id="mpNavRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#BAF2FD" stop-opacity="0.65" />
      <stop offset="50%" stop-color="#A1E3F9" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#35D4A0" stop-opacity="0.45" />
    </linearGradient>
    <linearGradient id="mpNavMergeBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#BAF2FD" />
      <stop offset="100%" stop-color="#5EC8EE" />
    </linearGradient>
    <linearGradient id="mpNavMergePurple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#B282F5" />
      <stop offset="50%" stop-color="#9A64E8" />
      <stop offset="100%" stop-color="#7028D6" />
    </linearGradient>
    <linearGradient id="mpNavLiquidBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#BAF2FD" />
      <stop offset="100%" stop-color="#4AC2EC" />
    </linearGradient>
    <linearGradient id="mpNavLiquidGreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4EE5B2" />
      <stop offset="50%" stop-color="#35D4A0" />
      <stop offset="100%" stop-color="#1DBB87" />
    </linearGradient>
    <linearGradient id="mpNavLiquidPurple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#AB7BF7" />
      <stop offset="100%" stop-color="#7834D9" />
    </linearGradient>
    <linearGradient id="mpNavBlockGreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4CE8B3" />
      <stop offset="100%" stop-color="#24C18D" />
    </linearGradient>
    <linearGradient id="mpNavBlockAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#BAF2FD" />
      <stop offset="100%" stop-color="#55C9EE" />
    </linearGradient>
    <filter id="mpNavDropGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#050A18" flood-opacity="0.45" />
    </filter>
  </defs>

  <!-- Master Board Squircle Base -->
  <rect width="512" height="512" rx="112" fill="url(#mpNavBoardBg)" />
  <rect x="14" y="14" width="484" height="484" rx="100" fill="none" stroke="url(#mpNavRimGrad)" stroke-width="4.5" />
  <rect x="36" y="36" width="440" height="440" rx="78" fill="#0B1426" fill-opacity="0.55" stroke="#1F325E" stroke-width="3" />

  <!-- Dividing Channels -->
  <line x1="256" y1="46" x2="256" y2="466" stroke="#14213D" stroke-width="12" stroke-linecap="round" />
  <line x1="256" y1="46" x2="256" y2="466" stroke="#2B437D" stroke-width="2" stroke-opacity="0.4" />
  <line x1="46" y1="256" x2="466" y2="256" stroke="#14213D" stroke-width="12" stroke-linecap="round" />
  <line x1="46" y1="256" x2="466" y2="256" stroke="#2B437D" stroke-width="2" stroke-opacity="0.4" />

  <!-- Q1 (Top-Left): Merge Numbers -->
  <g id="quadrant-merge" filter="url(#mpNavDropGlow)">
    <rect x="52" y="52" width="188" height="188" rx="28" fill="#131E37" fill-opacity="0.6" stroke="#1E2F54" stroke-width="2" />
    <g transform="translate(68, 76)">
      <rect width="72" height="72" rx="18" fill="url(#mpNavMergeBlue)" />
      <rect x="4" y="4" width="64" height="8" rx="4" fill="#FFFFFF" fill-opacity="0.45" />
      <path d="M 26 27 C 26 20 46 20 46 28 C 46 34 39 37 32 44 L 26 50 L 47 50 L 47 55 L 25 55 L 25 49 L 36 38 C 40 33 42 30 42 27 C 42 24 38 23 34 23 C 30 23 28 25 27 28 Z" fill="#102042" />
    </g>
    <path d="M 124 132 L 134 140 L 124 148 M 132 132 L 142 140 L 132 148" fill="none" stroke="#A1E3F9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />
    <g transform="translate(132, 128)">
      <rect width="92" height="92" rx="22" fill="url(#mpNavMergePurple)" stroke="#D4BBFC" stroke-width="2" stroke-opacity="0.6" />
      <rect x="5" y="5" width="82" height="10" rx="5" fill="#FFFFFF" fill-opacity="0.4" />
      <path d="M 52 24 L 32 54 L 52 54 L 52 68 L 59 68 L 59 54 L 66 54 L 66 48 L 59 48 L 59 24 Z M 52 33 L 52 48 L 40 48 Z" fill="#FFFFFF" />
    </g>
  </g>

  <!-- Q2 (Top-Right): Color Sort -->
  <g id="quadrant-colorsort" filter="url(#mpNavDropGlow)">
    <rect x="272" y="52" width="188" height="188" rx="28" fill="#131E37" fill-opacity="0.6" stroke="#1E2F54" stroke-width="2" />
    <g transform="translate(328, 64)">
      <rect x="-8" y="0" width="92" height="12" rx="6" fill="#A1E3F9" fill-opacity="0.25" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="2" />
      <clipPath id="mpNavTubeClip">
        <path d="M 0 8 L 0 126 A 38 38 0 0 0 76 126 L 76 8 Z" />
      </clipPath>
      <g clip-path="url(#mpNavTubeClip)">
        <rect x="0" y="8" width="76" height="160" fill="#0C1527" />
        <path d="M 0 110 L 0 126 A 38 38 0 0 0 76 126 L 76 110 Z" fill="url(#mpNavLiquidPurple)" />
        <rect x="0" y="66" width="76" height="46" fill="url(#mpNavLiquidGreen)" />
        <line x1="0" y1="66" x2="76" y2="66" stroke="#35D4A0" stroke-width="1.5" stroke-opacity="0.6" />
        <path d="M 0 24 Q 38 30 76 24 L 76 66 L 0 66 Z" fill="url(#mpNavLiquidBlue)" />
        <path d="M 0 24 Q 38 30 76 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-opacity="0.75" />
        <circle cx="24" cy="46" r="3.5" fill="#FFFFFF" fill-opacity="0.6" />
        <circle cx="52" cy="88" r="4" fill="#FFFFFF" fill-opacity="0.5" />
        <circle cx="34" cy="136" r="3" fill="#FFFFFF" fill-opacity="0.5" />
      </g>
      <path d="M 0 8 L 0 126 A 38 38 0 0 0 76 126 L 76 8" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-opacity="0.65" />
      <path d="M 8 16 L 8 124 A 30 30 0 0 0 38 154" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-opacity="0.4" />
    </g>
  </g>

  <!-- Q3 (Bottom-Left): Slide Puzzle -->
  <g id="quadrant-slide" filter="url(#mpNavDropGlow)">
    <rect x="52" y="272" width="188" height="188" rx="28" fill="#131E37" fill-opacity="0.6" stroke="#1E2F54" stroke-width="2" />
    <g transform="translate(68, 288)">
      <g transform="translate(0, 0)">
        <rect width="72" height="72" rx="16" fill="url(#mpNavMergePurple)" />
        <rect x="4" y="4" width="64" height="8" rx="4" fill="#FFFFFF" fill-opacity="0.35" />
        <path d="M 33 28 L 40 23 L 44 23 L 44 51 L 37 51 L 37 28 Z M 30 51 L 49 51 L 49 55 L 30 55 Z" fill="#FFFFFF" />
      </g>
      <g transform="translate(84, 0)">
        <rect width="72" height="72" rx="16" fill="url(#mpNavMergeBlue)" />
        <rect x="4" y="4" width="64" height="8" rx="4" fill="#FFFFFF" fill-opacity="0.45" />
        <path d="M 27 27 C 27 20 47 20 47 28 C 47 34 40 37 33 44 L 27 50 L 48 50 L 48 55 L 26 55 L 26 49 L 37 38 C 41 33 43 30 43 27 C 43 24 39 23 35 23 C 31 23 29 25 28 28 Z" fill="#102042" />
      </g>
      <g transform="translate(0, 84)">
        <rect width="72" height="72" rx="16" fill="url(#mpNavBlockGreen)" />
        <rect x="4" y="4" width="64" height="8" rx="4" fill="#FFFFFF" fill-opacity="0.4" />
        <path d="M 28 24 L 46 24 L 46 29 L 37 37 C 42 37 47 40 47 46 C 47 53 41 56 34 56 C 29 56 26 53 25 49 L 31 47 C 32 49 33 51 35 51 C 38 51 40 49 40 46 C 40 42 37 41 33 41 L 29 41 L 29 36 L 38 29 L 28 29 Z" fill="#102042" />
      </g>
      <g transform="translate(84, 84)">
        <rect width="72" height="72" rx="16" fill="#080F1D" stroke="#A1E3F9" stroke-width="2" stroke-opacity="0.3" stroke-dasharray="6 4" />
        <path d="M 36 24 L 36 48 M 28 40 L 36 48 L 44 40" fill="none" stroke="#A1E3F9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.45" />
      </g>
    </g>
  </g>

  <!-- Q4 (Bottom-Right): Block Fit -->
  <g id="quadrant-blockfit" filter="url(#mpNavDropGlow)">
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
        <rect width="48" height="48" rx="10" fill="url(#mpNavBlockGreen)" />
        <rect x="3" y="3" width="42" height="6" rx="3" fill="#FFFFFF" fill-opacity="0.45" />
        <rect x="3" y="41" width="42" height="4" rx="2" fill="#000000" fill-opacity="0.2" />
      </g>
      <g transform="translate(0, 52)">
        <rect width="48" height="48" rx="10" fill="url(#mpNavBlockGreen)" />
        <rect x="3" y="3" width="42" height="6" rx="3" fill="#FFFFFF" fill-opacity="0.45" />
        <rect x="3" y="41" width="42" height="4" rx="2" fill="#000000" fill-opacity="0.2" />
      </g>
      <g transform="translate(52, 52)">
        <rect width="48" height="48" rx="10" fill="url(#mpNavBlockGreen)" />
        <rect x="3" y="3" width="42" height="6" rx="3" fill="#FFFFFF" fill-opacity="0.45" />
        <rect x="3" y="41" width="42" height="4" rx="2" fill="#000000" fill-opacity="0.2" />
      </g>
      <g transform="translate(52, 0)">
        <rect width="48" height="48" rx="10" fill="url(#mpNavBlockAccent)" stroke="#FFFFFF" stroke-width="2" stroke-opacity="0.8" />
        <rect x="3" y="3" width="42" height="6" rx="3" fill="#FFFFFF" fill-opacity="0.5" />
        <rect x="3" y="41" width="42" height="4" rx="2" fill="#000000" fill-opacity="0.2" />
      </g>
      <g transform="translate(104, 52)">
        <rect width="48" height="48" rx="10" fill="#35D4A0" fill-opacity="0.2" stroke="#35D4A0" stroke-width="2" stroke-dasharray="4 3" stroke-opacity="0.7" />
      </g>
    </g>
  </g>

  <!-- Center Fusion Medallion -->
  <g id="center-fusion-node">
    <circle cx="256" cy="256" r="36" fill="#0E182F" stroke="#243A73" stroke-width="3" />
    <circle cx="256" cy="256" r="26" fill="url(#mpNavBoardBg)" stroke="#A1E3F9" stroke-width="3.5" />
    <polygon points="256,238 268,256 256,274 244,256" fill="#BAF2FD" />
    <circle cx="256" cy="256" r="4.5" fill="#FFFFFF" />
  </g>
</svg>`,
  home: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  games: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="6"/></svg>`,
  stats: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>`,
  trophy: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
  settings: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
  info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  help: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`,
  play: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>`,
  pause: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
  restart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>`,
  undo: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>`,
  hint: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
  back: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`,
  check: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  close: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>`,
  github: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`,
  star: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
};
