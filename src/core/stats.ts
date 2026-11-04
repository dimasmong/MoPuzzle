import { GameMode, GameStats } from './types';
import { Storage } from './storage';
import { Achievements } from './achievements';

class StatsManager {
  public getStats(mode: GameMode): GameStats {
    const data = Storage.getData();
    return data.stats[mode];
  }

  public getAllStats() {
    return Storage.getData().stats;
  }

  public async recordGameStart(mode: GameMode): Promise<void> {
    await Storage.updateStats(mode, s => {
      s.gamesPlayed += 1;
    });
    await Achievements.checkGeneralProgress();
  }

  public async recordMove(mode: GameMode): Promise<void> {
    await Storage.updateStats(mode, s => {
      s.totalMoves += 1;
    });
    await Achievements.checkGeneralProgress();
  }

  public async recordScore(mode: GameMode, score: number): Promise<void> {
    await Storage.updateStats(mode, s => {
      if (score > s.highScore) {
        s.highScore = score;
      }
    });

    if (mode === 'merge') {
      await Achievements.trackProgress('merge_master', score);
    } else if (mode === 'blockfit') {
      await Achievements.trackProgress('block_1000', score);
    }
  }

  public async recordVictory(mode: GameMode, timeSeconds?: number): Promise<void> {
    await Storage.updateStats(mode, s => {
      s.gamesWon += 1;
      if (timeSeconds && timeSeconds > 0) {
        if (s.bestTimeSeconds === 0 || timeSeconds < s.bestTimeSeconds) {
          s.bestTimeSeconds = timeSeconds;
        }
      }
    });
  }

  public async recordExtraStat(mode: GameMode, key: string, delta: number): Promise<number> {
    let newVal = 0;
    await Storage.updateStats(mode, s => {
      if (!s.extraStats[key]) s.extraStats[key] = 0;
      s.extraStats[key] += delta;
      newVal = s.extraStats[key];
    });
    return newVal;
  }
}

export const Stats = new StatsManager();
