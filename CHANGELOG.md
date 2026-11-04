# Changelog

All notable changes to **MoPuzzle** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
