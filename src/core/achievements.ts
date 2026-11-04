import { Achievement } from './types';
import { Storage } from './storage';
import { SoundManager } from '../audio/SoundManager';

export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlockedAt' | 'progress'>[] = [
  {
    id: 'first_step',
    titleKey: 'achFirstStepsTitle',
    descKey: 'achFirstStepsDesc',
    icon: '👣',
    category: 'general',
    maxProgress: 1
  },
  {
    id: 'merge_2048',
    titleKey: 'achMerge2048Title',
    descKey: 'achMerge2048Desc',
    icon: '✨',
    category: 'merge',
    maxProgress: 1
  },
  {
    id: 'merge_master',
    titleKey: 'achMergeMasterTitle',
    descKey: 'achMergeMasterDesc',
    icon: '👑',
    category: 'merge',
    maxProgress: 10000
  },
  {
    id: 'color_5',
    titleKey: 'achColor5Title',
    descKey: 'achColor5Desc',
    icon: '🧪',
    category: 'colorsort',
    maxProgress: 5
  },
  {
    id: 'color_15',
    titleKey: 'achColor15Title',
    descKey: 'achColor15Desc',
    icon: '⚗️',
    category: 'colorsort',
    maxProgress: 15
  },
  {
    id: 'color_no_undo',
    titleKey: 'achColorNoUndoTitle',
    descKey: 'achColorNoUndoDesc',
    icon: '🎯',
    category: 'colorsort',
    maxProgress: 1
  },
  {
    id: 'slide_3x3',
    titleKey: 'achSlide3Title',
    descKey: 'achSlide3Desc',
    icon: '🧩',
    category: 'slide',
    maxProgress: 1
  },
  {
    id: 'slide_4x4',
    titleKey: 'achSlide4Title',
    descKey: 'achSlide4Desc',
    icon: '🏆',
    category: 'slide',
    maxProgress: 1
  },
  {
    id: 'slide_speed',
    titleKey: 'achSlideSpeedTitle',
    descKey: 'achSlideSpeedDesc',
    icon: '⚡',
    category: 'slide',
    maxProgress: 1
  },
  {
    id: 'block_1000',
    titleKey: 'achBlock1000Title',
    descKey: 'achBlock1000Desc',
    icon: '🧱',
    category: 'blockfit',
    maxProgress: 1000
  },
  {
    id: 'block_combo',
    titleKey: 'achBlockComboTitle',
    descKey: 'achBlockComboDesc',
    icon: '💥',
    category: 'blockfit',
    maxProgress: 1
  },
  {
    id: 'block_50_lines',
    titleKey: 'achBlock50LinesTitle',
    descKey: 'achBlock50LinesDesc',
    icon: '🔥',
    category: 'blockfit',
    maxProgress: 50
  },
  {
    id: 'puzzler_all',
    titleKey: 'achPuzzlerTitle',
    descKey: 'achPuzzlerDesc',
    icon: '🌟',
    category: 'general',
    maxProgress: 4
  },
  {
    id: 'dedicated_500',
    titleKey: 'achDedicatedTitle',
    descKey: 'achDedicatedDesc',
    icon: '🏅',
    category: 'general',
    maxProgress: 500
  }
];

class AchievementManager {
  private unlockListeners: ((ach: Achievement) => void)[] = [];

  public getAllAchievements(): Achievement[] {
    const saved = Storage.getData().achievements;
    return ACHIEVEMENT_DEFINITIONS.map(def => {
      const entry = saved[def.id] || { unlockedAt: null, progress: 0 };
      return {
        ...def,
        unlockedAt: entry.unlockedAt,
        progress: entry.progress
      };
    });
  }

  public onUnlock(callback: (ach: Achievement) => void): () => void {
    this.unlockListeners.push(callback);
    return () => {
      this.unlockListeners = this.unlockListeners.filter(cb => cb !== callback);
    };
  }

  public async triggerUnlock(id: string): Promise<void> {
    const justUnlocked = await Storage.unlockAchievement(id);
    if (justUnlocked) {
      const full = this.getAllAchievements().find(a => a.id === id);
      if (full) {
        SoundManager.play('victory');
        this.unlockListeners.forEach(cb => cb(full));
      }
    }
  }

  public async trackProgress(id: string, currentVal: number): Promise<void> {
    const def = ACHIEVEMENT_DEFINITIONS.find(a => a.id === id);
    if (!def) return;

    const justUnlocked = await Storage.updateAchievementProgress(id, currentVal, def.maxProgress);
    if (justUnlocked) {
      const full = this.getAllAchievements().find(a => a.id === id);
      if (full) {
        SoundManager.play('victory');
        this.unlockListeners.forEach(cb => cb(full));
      }
    }
  }

  public async checkGeneralProgress(): Promise<void> {
    const data = Storage.getData();
    const stats = data.stats;

    // Check first step
    const totalMoves = stats.merge.totalMoves + stats.colorsort.totalMoves + stats.slide.totalMoves + stats.blockfit.totalMoves;
    if (totalMoves >= 1) {
      await this.triggerUnlock('first_step');
    }
    await this.trackProgress('dedicated_500', totalMoves);

    // Check puzzler_all
    let modesPlayed = 0;
    if (stats.merge.gamesPlayed > 0) modesPlayed++;
    if (stats.colorsort.gamesPlayed > 0) modesPlayed++;
    if (stats.slide.gamesPlayed > 0) modesPlayed++;
    if (stats.blockfit.gamesPlayed > 0) modesPlayed++;
    await this.trackProgress('puzzler_all', modesPlayed);
  }
}

export const Achievements = new AchievementManager();
