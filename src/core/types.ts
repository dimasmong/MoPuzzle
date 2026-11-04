export type GameMode = 'merge' | 'colorsort' | 'slide' | 'blockfit';

export type Language = 'en' | 'id';
export type Theme = 'light' | 'dark';

export interface UserSettings {
  language: Language;
  theme: Theme;
  musicEnabled: boolean;
  musicVolume: number; // 0.0 - 1.0
  sfxEnabled: boolean;
  sfxVolume: number; // 0.0 - 1.0
  reducedMotion: boolean;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  highScore: number;
  bestTimeSeconds: number; // For slide / timed modes (0 = none)
  totalMoves: number;
  extraStats: Record<string, number>;
}

export interface ModeStatsMap {
  merge: GameStats;
  colorsort: GameStats;
  slide: GameStats;
  blockfit: GameStats;
}

export interface Achievement {
  id: string;
  titleKey: string;
  descKey: string;
  icon: string;
  category: GameMode | 'general';
  unlockedAt: string | null;
  progress: number;
  maxProgress: number;
}

export interface SaveDataSchema {
  version: number;
  settings: UserSettings;
  stats: ModeStatsMap;
  achievements: Record<string, { unlockedAt: string | null; progress: number }>;
  colorSortUnlockedLevel: number;
  activeGames: {
    merge?: {
      board: number[][];
      score: number;
      bestScore?: number;
      moves: number;
      mode: 'classic' | 'timed';
      timeRemaining?: number;
      won?: boolean;
      gameOver?: boolean;
      hasContinuedAfterWin?: boolean;
      history: { board: number[][]; score: number }[];
    };
    colorsort?: {
      level: number;
      tubes: number[][];
      tubeCapacity: number;
      moves: number;
      won?: boolean;
      gameOver?: boolean;
      history: number[][][];
    };
    slide?: {
      size: number;
      tiles: number[];
      moves: number;
      elapsedSeconds: number;
      won?: boolean;
      gameOver?: boolean;
    };
    blockfit?: {
      grid: (string | null)[][] | number[][];
      score: number;
      highScore?: number;
      comboStreak: number;
      won?: boolean;
      gameOver?: boolean;
      currentPieces: { id: string; name?: string; matrix: number[][]; color: string; used: boolean }[];
    };
  };
}
