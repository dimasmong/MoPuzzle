import { describe, it, expect, beforeEach } from 'vitest';
import { Storage } from './storage';

describe('StorageService', () => {
  beforeEach(async () => {
    await Storage.resetAll();
  });

  it('provides default initial state matching schema v1', () => {
    const data = Storage.getData();
    expect(data.version).toBe(1);
    expect(data.settings.language).toBe('en');
    expect(data.settings.theme).toBe('light');
    expect(data.colorSortUnlockedLevel).toBe(1);
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
    expect(validated1.version).toBe(1);
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
});
