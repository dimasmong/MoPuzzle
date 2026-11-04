import { SaveDataSchema, UserSettings, ModeStatsMap, GameMode, GameStats } from './types';

const DB_NAME = 'MoPuzzleDB';
const DB_VERSION = 1;
const STORE_NAME = 'gameData';
const STORAGE_KEY = 'mopuzzle_v1_savedata';

const DEFAULT_SETTINGS: UserSettings = {
  language: 'en',
  theme: 'light',
  musicEnabled: true,
  musicVolume: 0.5,
  sfxEnabled: true,
  sfxVolume: 0.8,
  reducedMotion: false
};

const DEFAULT_STATS: ModeStatsMap = {
  merge: { gamesPlayed: 0, gamesWon: 0, highScore: 0, bestTimeSeconds: 0, totalMoves: 0, extraStats: { tile2048Count: 0 } },
  colorsort: { gamesPlayed: 0, gamesWon: 0, highScore: 0, bestTimeSeconds: 0, totalMoves: 0, extraStats: { totalPours: 0, maxLevelReached: 1 } },
  slide: { gamesPlayed: 0, gamesWon: 0, highScore: 0, bestTimeSeconds: 0, totalMoves: 0, extraStats: { puzzlesSolved: 0 } },
  blockfit: { gamesPlayed: 0, gamesWon: 0, highScore: 0, bestTimeSeconds: 0, totalMoves: 0, extraStats: { linesCleared: 0, maxCombo: 0 } }
};

export const DEFAULT_SAVE_DATA: SaveDataSchema = {
  version: 1,
  settings: DEFAULT_SETTINGS,
  stats: DEFAULT_STATS,
  achievements: {},
  colorSortUnlockedLevel: 1,
  activeGames: {}
};

class StorageService {
  private db: IDBDatabase | null = null;
  private memoryCache: SaveDataSchema | null = null;
  private isIndexedDBAvailable = false;

  public async init(): Promise<SaveDataSchema> {
    if (this.memoryCache) return this.memoryCache;

    let idbData: SaveDataSchema | null = null;
    this.isIndexedDBAvailable = typeof window !== 'undefined' && 'indexedDB' in window;
    if (this.isIndexedDBAvailable) {
      try {
        this.db = await this.openIndexedDB();
        idbData = await this.readFromIDB();
      } catch (err) {
        console.warn('[MoPuzzle Storage] IndexedDB initialization failed, falling back to LocalStorage:', err);
        this.isIndexedDBAvailable = false;
      }
    }

    // Read LocalStorage backup
    let localData: SaveDataSchema | null = null;
    try {
      const localRaw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (localRaw) {
        localData = JSON.parse(localRaw);
      }
    } catch (err) {
      console.warn('[MoPuzzle Storage] LocalStorage read failed or corrupted:', err);
    }

    // Reconcile IDB and LocalStorage so active games and stats are never lost
    let mergedData: SaveDataSchema | null = null;
    if (idbData && localData) {
      mergedData = {
        ...idbData,
        ...localData,
        settings: { ...idbData.settings, ...localData.settings },
        stats: { ...idbData.stats, ...localData.stats },
        activeGames: { ...(idbData.activeGames || {}), ...(localData.activeGames || {}) },
        achievements: { ...(idbData.achievements || {}), ...(localData.achievements || {}) },
        colorSortUnlockedLevel: Math.max(idbData.colorSortUnlockedLevel || 1, localData.colorSortUnlockedLevel || 1)
      };
    } else {
      mergedData = idbData || localData;
    }

    if (mergedData) {
      this.memoryCache = this.validateAndMigrate(mergedData);
      return this.memoryCache;
    }

    // Default fresh save
    this.memoryCache = JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
    await this.persist();
    return this.memoryCache!;
  }

  private openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  private readFromIDB(): Promise<SaveDataSchema | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve(null);
      try {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.get('saveData');
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
      } catch (e) {
        reject(e);
      }
    });
  }

  private async writeToIDB(data: SaveDataSchema): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.put(data, 'saveData');
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch (e) {
        reject(e);
      }
    });
  }

  public async persist(): Promise<void> {
    if (!this.memoryCache) return;
    const jsonStr = JSON.stringify(this.memoryCache);

    // Save to LocalStorage always as synchronous backup if available
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, jsonStr);
      } catch (err) {
        console.warn('[MoPuzzle Storage] Could not write to LocalStorage:', err);
      }
    }

    // Save to IndexedDB if available
    if (this.isIndexedDBAvailable && this.db) {
      try {
        await this.writeToIDB(this.memoryCache);
      } catch (err) {
        console.warn('[MoPuzzle Storage] Write to IDB failed:', err);
      }
    }
  }

  public getData(): SaveDataSchema {
    if (!this.memoryCache) {
      // Emergency fallback
      return JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
    }
    return this.memoryCache;
  }

  public async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const data = this.getData();
    data.settings = { ...data.settings, ...settings };
    await this.persist();
    return data.settings;
  }

  public async updateStats(mode: GameMode, updater: (stats: GameStats) => void): Promise<void> {
    const data = this.getData();
    if (!data.stats[mode]) {
      data.stats[mode] = { ...DEFAULT_STATS[mode] };
    }
    updater(data.stats[mode]);
    await this.persist();
  }

  public async unlockAchievement(id: string): Promise<boolean> {
    const data = this.getData();
    if (data.achievements[id]?.unlockedAt) {
      return false; // Already unlocked
    }
    data.achievements[id] = {
      unlockedAt: new Date().toISOString(),
      progress: 100
    };
    await this.persist();
    return true;
  }

  public async updateAchievementProgress(id: string, progress: number, maxProgress: number): Promise<boolean> {
    const data = this.getData();
    const existing = data.achievements[id] || { unlockedAt: null, progress: 0 };
    if (existing.unlockedAt) return false;

    existing.progress = Math.min(progress, maxProgress);
    let justUnlocked = false;
    if (existing.progress >= maxProgress) {
      existing.unlockedAt = new Date().toISOString();
      justUnlocked = true;
    }
    data.achievements[id] = existing;
    await this.persist();
    return justUnlocked;
  }

  public async saveActiveGame(mode: GameMode, state: any): Promise<void> {
    const data = this.getData();
    data.activeGames[mode] = state;
    await this.persist();
  }

  public getActiveGame<T>(mode: GameMode): T | null {
    const data = this.getData();
    return (data.activeGames[mode] as T) || null;
  }

  public async clearActiveGame(mode: GameMode): Promise<void> {
    const data = this.getData();
    delete data.activeGames[mode];
    await this.persist();
  }

  public async setUnlockedColorSortLevel(lvl: number): Promise<void> {
    const data = this.getData();
    if (lvl > data.colorSortUnlockedLevel) {
      data.colorSortUnlockedLevel = lvl;
      await this.persist();
    }
  }

  public async resetAll(): Promise<void> {
    this.memoryCache = JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
    await this.persist();
  }

  public validateAndMigrate(loaded: any): SaveDataSchema {
    if (!loaded || typeof loaded !== 'object') {
      return JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
    }

    const version = typeof loaded.version === 'number' ? loaded.version : 1;
    const settings: UserSettings = {
      ...DEFAULT_SETTINGS,
      ...(loaded.settings || {})
    };

    const stats: ModeStatsMap = {
      merge: { ...DEFAULT_STATS.merge, ...(loaded.stats?.merge || {}) },
      colorsort: { ...DEFAULT_STATS.colorsort, ...(loaded.stats?.colorsort || {}) },
      slide: { ...DEFAULT_STATS.slide, ...(loaded.stats?.slide || {}) },
      blockfit: { ...DEFAULT_STATS.blockfit, ...(loaded.stats?.blockfit || {}) }
    };

    const achievements = loaded.achievements && typeof loaded.achievements === 'object' ? loaded.achievements : {};
    const colorSortUnlockedLevel = typeof loaded.colorSortUnlockedLevel === 'number' && loaded.colorSortUnlockedLevel >= 1
      ? loaded.colorSortUnlockedLevel
      : 1;

    const activeGames = loaded.activeGames && typeof loaded.activeGames === 'object' ? loaded.activeGames : {};

    return {
      version,
      settings,
      stats,
      achievements,
      colorSortUnlockedLevel,
      activeGames
    };
  }
}

export const Storage = new StorageService();
