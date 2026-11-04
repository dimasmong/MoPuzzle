# Changelog

All notable changes to **MoPuzzle** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
