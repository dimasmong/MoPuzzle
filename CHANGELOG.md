# Changelog

All notable changes to **MoPuzzle** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-11-05

### Added
- **Expansion to 6 Games**:
  - Upgraded MoPuzzle from 4 games to 6 games in one unified browser platform while preserving all existing games, player progression, high scores, brand identity, and theme options.
- **Game 5: Mahjong Solitaire**:
  - Built-in 20 guaranteed-solvable 3D layered layouts (Pyramid, Cross, Butterfly, Fortress, Gateway, Temple, Arena, Castle, etc.) spanning Easy (24-32 tiles), Medium (36-56 tiles), and Hard (60-72 tiles).
  - Strict classic Mahjong rules: a tile is selectable only when it is not covered by any upper-layer tile and has at least one lateral (left or right) side open.
  - Non-copyrighted original geometric symbol suits: `circle` (1..9), `bamboo` (1..9), `gem` (1..9), `wind` (E, S, W, N), and celestial `star` (Sun, Moon, Star, Comet).
  - 100% Guaranteed Solvability: Layouts populated through reverse-simulation pair generation.
  - In-game capabilities: intelligent Hint system, Undo history stack, board Shuffle / Redeal ensuring available pairs, and automatic stuck detection.
  - Dedicated level selector (1 to 20), responsive canvas scaling, and 3D elevation tweens.
- **Game 6: Word Search**:
  - Full 8-compass directional word placement: East, West, South, North, South-East, North-West, North-East, and South-West.
  - 40 curated levels: 20 levels in English and 20 in Indonesian across 8 vibrant categories (Animals, Nature, Technology, Food, Sports, Space, Countries, Everyday Objects).
  - Independent level progression and persistence for English and Indonesian.
  - Drag-and-drop line selection and touch tap support on desktop and mobile viewports with collinear straight-line validation.
  - Dynamic translucent capsule path highlights and responsive target word chips.
  - In-game Hint system revealing target word start locations.
- **System & Architecture Updates**:
  - **Storage Schema v2**: Upgraded storage schema with backward-compatible automatic migration from v1 to v2, adding `mahjongUnlockedLevel`, `wordSearchUnlockedLevelEn`, `wordSearchUnlockedLevelId`, and new mode statistics.
  - **10 New Achievements**: Added 5 achievements for Mahjong Solitaire (`mahjong_first_pair`, `mahjong_clear_board`, `mahjong_5_levels`, `mahjong_no_hint`, `mahjong_all_levels`) and 5 for Word Search (`word_first_found`, `word_first_puzzle`, `word_100_found`, `word_no_hint`, `word_all_levels`). Total achievements increased to 24.
  - **Localization**: Added comprehensive bilingual English and Indonesian translations for all new game modes, rules, HUD items, categories, and achievements.
  - **Responsive 6-Card Grid**: Updated homepage layout with 3-column desktop, 2-column tablet, and compact mobile views.
  - **PWA Service Worker**: Updated cache name to `mopuzzle-cache-v1.1.0`.
- **Testing & Quality Assurance**:
  - Added 17 new Vitest unit tests for Mahjong and Word Search engines (total: 63 tests across 7 test suites).
  - Added full Playwright E2E test suites (`e2e/mahjong-gameplay.spec.ts` and `e2e/wordsearch-gameplay.spec.ts`) verified across Desktop Chrome, Desktop Edge, Mobile Chrome, and iPhone 14.
  - Re-verified all existing regression suites for Merge Numbers, Color Sort, Slide Puzzle, and Block Fit.

## [1.0.3] - 2026-11-05

### Fixed
- **Desktop Chrome/Edge Color Sort Progression & Modal Loop**:
  - Resolved desktop-specific issue where clicking "Next Level" on Desktop Chrome/Edge caused the "Puzzle Solved!" modal to reappear.
  - Implemented event debouncing and click interception on `#modal-next-level` (`button.disabled = true; e.stopPropagation(); e.preventDefault()`), preventing double clicks and eliminating phantom click fall-through to underlying Phaser tubes.
  - Added pointer event isolation on modal overlays to prevent background scene clicks during modal dismissal.
  - Implemented scene lifecycle cleanup with `ColorSortScene.shutdown()`, properly destroying active containers, event listeners, and killing active tweens before advancing levels.
  - Synchronized `Storage.clearActiveGame('colorsort')` and atomic level advancement so previous victory state cannot trigger obsolete modal popups.
- **Save Data Sanitization & Compatibility for Existing Desktop Progress**:
  - Updated `Storage.validateAndMigrate()` and `saveActiveGame()` to automatically detect and purge completed games (`won === true` or `gameOver === true`) from `activeGames`.
  - Fixed `DetailsPage.ts` level resolution so clicking "Play" directly starts the user's latest unlocked level rather than defaulting to Level 1.
  - Fully preserved player high scores, all-time statistics, settings, and achievement unlocks.
- **PWA Service Worker Caching & Automatic Updates**:
  - Re-architected `public/sw.js` caching strategy: navigation requests (`/`, `/index.html`) now use **Network-First** with offline cache fallback, guaranteeing desktop Chrome and Edge clients immediately fetch the freshest HTML and asset hashes rather than being trapped on older cached bundles.
  - Upgraded cache name to `mopuzzle-cache-v1.0.3` and added automatic purge of obsolete caches on activation.
  - Added service worker `SKIP_WAITING` messaging and `controllerchange` auto-reload handler in `main.ts` for clean, seamless updates.
- **Diagnostics & Testing**:
  - Added real-time diagnostics tracker `Diagnostics` (`window.__MOPUZZLE_DIAGNOSTICS__`) to monitor scene initialization, requested vs unlocked levels, engine victory state, and modal open/close lifecycles.
  - Added comprehensive multi-level Playwright test suite (`e2e/colorsort-desktop-progression.spec.ts`) validating 10 progression scenarios across Desktop Chrome, Desktop Edge, Mobile Chrome, and iPhone 14.

## [1.0.2] - 2026-11-05

### Fixed
- **Color Sort Level Progression**:
  - Fixed critical bug where clicking "Next Level" on the victory modal failed to advance the game due to active game state preserving the completed board.
  - Added clean `advanceToNextLevel()` progression transaction that increments level, loads a new solvable configuration, resets moves/undo, and immediately renders without requiring a page reload.
  - Implemented campaign completion handling for Level 30 with dedicated congratulatory screen and level selection navigation.
  - Ensured all 30 progressive levels generate with at least one buffer empty tube and verified BFS solvable paths.
- **Slide Puzzle Victory Flow**:
  - Replaced ambiguous "Play Again" with "Next Puzzle" action that generates a fresh solvable scramble of the current board size.
  - Fixed stopwatch timer to halt immediately upon victory and restart cleanly on subsequent puzzles.
- **Merge Numbers 2048 Milestone**:
  - Added "Keep Going" continuation action on the 2048 victory modal to resume playing the current board without re-triggering the victory modal on every move.
  - Added "New Game" button to easily start fresh from the victory screen.
- **Block Fit Game Over**:
  - Fixed "Retry" button on game over modal to reset 10×10 board, spawn 3 new pieces, reset score and combo streak, while preserving all-time high score.
  - Prevented game over boards from being stored as resumable active games.
- **Navigation & Modals**:
  - Audited and secured all modal buttons (Home, Next Level, Next Puzzle, Keep Going, Retry, Restart, Settings) across desktop and mobile devices.
  - Upgraded Playwright regression suite to 96 end-to-end tests covering all four puzzle modes and level progression flows.

## [1.0.1] - 2026-11-05

### Fixed
- **Block Fit Drag-and-Drop & Sizing**:
  - Resolved piece sizing mismatch (enforced 1:1 scale during dragging to match board grid cells exactly).
  - Unified drag preview and placement coordinate calculations to eliminate offsets.
  - Added responsive grid dimensions supporting viewports from 360px mobile to 1440px desktop.

### Added
- **Puzzle Fusion Brand Emblem**:
  - Brand-new geometric logo integrating visual elements from all four puzzle modes.
  - Multi-resolution icon exports (16, 32, 48, 180, 192, 512px) and vector favicon.

## [1.0.0] - 2026-11-05

### Added
- **MoPuzzle Launch**: Initial production release of the 4-in-1 browser puzzle suite.
- **Mode 1: Merge Numbers**:
  - Full 4×4 board with swipe gestures and Arrow/WASD keyboard controls.
  - Strict single-merge-per-move rule with score calculation.
  - Classic and Timed rush game modes.
  - Undo move history stack.
  - Automatic saving and unfinished game resumption.
- **Mode 2: Color Sort**:
  - Interactive test tubes with animated liquid transfers.
  - Valid pouring physics: color-matching constraint and capacity limits.
  - 100% solvable level generation via reverse-pour scramble and BFS verification.
  - Built-in Breadth-First-Search solver powering optimal hint suggestions.
  - 30 progressive difficulty levels with level selection menu.
- **Mode 3: Slide Puzzle**:
  - 3×3, 4×4, and 5×5 grid configurations.
  - Guaranteed solvable board generator with random valid move scrambling.
  - Stopwatch timer, move counter, and best time tracking.
- **Mode 4: Block Fit**:
  - 10×10 block placement grid with polyomino piece generation.
  - Drag-and-drop placement with real-time hover/drag cell highlight preview.
  - Simultaneous row and column clearing with combo streak scoring.
  - Exhaustive game-over detection only when no remaining piece fits.
- **UI/UX Design System**:
  - Casual gaming design with Light Theme (`#F5F8FF`) and Dark Theme (`#101827`).
  - Fluid responsive layouts optimized for mobile (360×800, 390×844), tablet, and desktop.
  - Support for reduced-motion accessibility preference.
  - Complete 10 application views: Home, Details, Gameplay, Pause, Level Select, Stats, Achievements, Settings, About, and FAQ.
- **Localization**:
  - Comprehensive English and Bahasa Indonesia translations across all strings, instructions, and dialogs.
- **Audio Synthesizer Engine**:
  - Zero-latency Web Audio API procedural sound effects for merges, pours, clicks, slides, line clears, and victory fanfares.
  - Procedural ambient chord background music.
  - User interaction gesture requirement compliant with browser autoplay policies.
- **Persistence & Offline PWA**:
  - IndexedDB storage engine with automatic LocalStorage fallback and schema migration.
  - Progressive Web App (PWA) manifest and Service Worker with cache-first asset caching for full offline play.
- **Testing & Quality Assurance**:
  - 35 Vitest unit tests verifying puzzle logic, solvability, and storage recovery.
  - Playwright browser E2E test suites on Desktop Chrome, Mobile Chrome, and iPhone 14.
