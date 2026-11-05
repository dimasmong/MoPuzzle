import { describe, it, expect, beforeEach } from 'vitest';
import { Storage } from './storage';

describe('StorageService', () => {
  beforeEach(async () => {
    await Storage.resetAll();
  });

  it('provides default initial state matching schema v2', () => {
    const data = Storage.getData();
    expect(data.version).toBe(2);
    expect(data.settings.language).toBe('en');
    expect(data.settings.theme).toBe('light');
    expect(data.colorSortUnlockedLevel).toBe(1);
    expect(data.mahjongUnlockedLevel).toBe(1);
    expect(data.wordSearchUnlockedLevelEn).toBe(1);
    expect(data.wordSearchUnlockedLevelId).toBe(1);
    expect(data.stats.mahjong).toBeDefined();
    expect(data.stats.wordsearch).toBeDefined();
  });

  it('updates and persists settings changes', async () => {
    await Storage.updateSettings({ language: 'id', theme: 'dark' });
    const data = Storage.getData();
    expect(data.settings.language).toBe('id');
    expect(data.settings.theme).toBe('dark');
  });

  it('safely recovers and validates corrupted or malformed data', () => {
    const corrupted1 = null;
    const validated1 = Storage.validateAndMigrate(corrupted1);
    expect(validated1.version).toBe(2);
    expect(validated1.settings.language).toBe('en');

    const malformed = {
      version: 999,
      settings: { language: 'id' },
      stats: 'garbage'
    };
    const validated2 = Storage.validateAndMigrate(malformed);
    expect(validated2.settings.language).toBe('id');
    expect(validated2.stats.merge).toBeDefined();
    expect(validated2.stats.merge.gamesPlayed).toBe(0);
    expect(validated2.stats.mahjong).toBeDefined();
    expect(validated2.stats.wordsearch).toBeDefined();
  });

  it('saves and clears active game state for resume functionality', async () => {
    const mergeProgress = {
      board: [[2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      score: 4,
      bestScore: 100,
      moves: 1,
      mode: 'classic' as const,
      history: []
    };

    await Storage.saveActiveGame('merge', mergeProgress);
    const loaded = Storage.getActiveGame('merge');
    expect(loaded).toEqual(mergeProgress);

    await Storage.clearActiveGame('merge');
    expect(Storage.getActiveGame('merge')).toBeNull();
  });

  it('purges already-won or game-over states from active games during migration and save', async () => {
    const legacyWithWon = {
      version: 1,
      colorSortUnlockedLevel: 2,
      activeGames: {
        colorsort: { level: 1, won: true, moves: 8 },
        merge: { score: 2048, won: true },
        slide: { moves: 10, won: false }
      }
    };

    const sanitized = Storage.validateAndMigrate(legacyWithWon);
    expect(sanitized.activeGames.colorsort).toBeUndefined();
    expect(sanitized.activeGames.merge).toBeUndefined();
    expect(sanitized.activeGames.slide).toBeDefined();

    // Also testing saveActiveGame directly with won state
    await Storage.saveActiveGame('colorsort', { level: 2, won: true });
    expect(Storage.getActiveGame('colorsort')).toBeNull();
  });

  it('migrates legacy v1 save data to v2 with default mahjong and word search progress', () => {
    const v1Data = {
      version: 1,
      settings: { language: 'id', theme: 'dark' },
      stats: {
        merge: { gamesPlayed: 5, gamesWon: 2, highScore: 4096, bestTimeSeconds: 0, totalMoves: 120, extraStats: {} },
        colorsort: { gamesPlayed: 10, gamesWon: 8, highScore: 0, bestTimeSeconds: 0, totalMoves: 80, extraStats: {} },
        slide: { gamesPlayed: 3, gamesWon: 1, highScore: 0, bestTimeSeconds: 45, totalMoves: 60, extraStats: {} },
        blockfit: { gamesPlayed: 7, gamesWon: 0, highScore: 1850, bestTimeSeconds: 0, totalMoves: 40, extraStats: {} }
      },
      achievements: { first_step: { unlockedAt: '2026-11-04T10:00:00Z', progress: 1 } },
      colorSortUnlockedLevel: 9,
      activeGames: {}
    };

    const migrated = Storage.validateAndMigrate(v1Data);
    expect(migrated.version).toBe(2);
    expect(migrated.settings.language).toBe('id');
    expect(migrated.settings.theme).toBe('dark');
    expect(migrated.colorSortUnlockedLevel).toBe(9);
    expect(migrated.mahjongUnlockedLevel).toBe(1);
    expect(migrated.wordSearchUnlockedLevelEn).toBe(1);
    expect(migrated.wordSearchUnlockedLevelId).toBe(1);
    expect(migrated.stats.merge.highScore).toBe(4096);
    expect(migrated.stats.mahjong.gamesPlayed).toBe(0);
    expect(migrated.stats.wordsearch.gamesPlayed).toBe(0);
  });
});
