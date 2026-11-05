import { I18n } from '../../core/i18n';
import { Storage } from '../../core/storage';
import { GameMode } from '../../core/types';

export function renderStatsPage(): string {
  const data = Storage.getData();
  const stats = data.stats;
  const currentLang = data.settings.language || 'en';

  const modes: GameMode[] = ['merge', 'colorsort', 'slide', 'blockfit', 'mahjong', 'wordsearch'];

  const totalPlayed = modes.reduce((acc, m) => acc + (stats[m]?.gamesPlayed || 0), 0);
  const totalWins = modes.reduce((acc, m) => acc + (stats[m]?.gamesWon || 0), 0);
  const winRate = totalPlayed > 0 ? Math.round((totalWins / totalPlayed) * 100) : 0;
  const totalMoves = modes.reduce((acc, m) => acc + (stats[m]?.totalMoves || 0), 0);

  const renderModeStatsCard = (mode: GameMode, titleKey: string, icon: string, extraItems: { label: string; value: string | number }[]) => {
    const s = stats[mode] || { gamesPlayed: 0, gamesWon: 0, totalMoves: 0, highScore: 0, bestTimeSeconds: 0 };
    return `
      <div class="card" style="margin-bottom: 14px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
          <span style="font-size: 22px;">${icon}</span>
          <h3 style="font-size: 16px; font-weight: 700;">${I18n.t(titleKey as any)}</h3>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
          <div style="background: rgba(36, 58, 115, 0.04); padding: 8px; border-radius: var(--radius-sm); text-align: center;">
            <div style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">${I18n.t('totalGamesPlayed')}</div>
            <div style="font-size: 16px; font-weight: 800; color: var(--text-main); margin-top: 2px;">${s.gamesPlayed}</div>
          </div>
          <div style="background: rgba(36, 58, 115, 0.04); padding: 8px; border-radius: var(--radius-sm); text-align: center;">
            <div style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">${I18n.t('totalWins')}</div>
            <div style="font-size: 16px; font-weight: 800; color: var(--primary-color); margin-top: 2px;">${s.gamesWon}</div>
          </div>
          ${extraItems.map(item => `
            <div style="background: rgba(36, 58, 115, 0.04); padding: 8px; border-radius: var(--radius-sm); text-align: center;">
              <div style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">${item.label}</div>
              <div style="font-size: 16px; font-weight: 800; color: var(--text-main); margin-top: 2px;">${item.value}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  };

  return `
    <div class="page-stats">
      <div style="margin-bottom: 16px;">
        <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 4px;">${I18n.t('statsTitle')}</h2>
      </div>

      <!-- Overall Aggregate Grid -->
      <div class="card" style="background: linear-gradient(135deg, var(--primary-color), #3B82F6); color: #FFFFFF; margin-bottom: 18px;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
          <div>
            <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; opacity: 0.85;">${I18n.t('totalGamesPlayed')}</div>
            <div style="font-size: 20px; font-weight: 800; margin-top: 4px;">${totalPlayed}</div>
          </div>
          <div>
            <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; opacity: 0.85;">${I18n.t('winRate')}</div>
            <div style="font-size: 20px; font-weight: 800; margin-top: 4px;">${winRate}%</div>
          </div>
          <div>
            <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; opacity: 0.85;">${I18n.t('totalMovesMade')}</div>
            <div style="font-size: 20px; font-weight: 800; margin-top: 4px;">${totalMoves}</div>
          </div>
        </div>
      </div>

      <!-- 1. Merge Numbers Stats -->
      ${renderModeStatsCard('merge', 'mergeTitle', '🔢', [
        { label: I18n.t('highScore'), value: stats.merge.highScore },
        { label: I18n.t('totalMovesMade'), value: stats.merge.totalMoves }
      ])}

      <!-- 2. Color Sort Stats -->
      ${renderModeStatsCard('colorsort', 'colorSortTitle', '🧪', [
        { label: I18n.t('maxLevel'), value: data.colorSortUnlockedLevel },
        { label: I18n.t('totalMovesMade'), value: stats.colorsort.totalMoves }
      ])}

      <!-- 3. Slide Puzzle Stats -->
      ${renderModeStatsCard('slide', 'slideTitle', '🧩', [
        { label: I18n.t('bestTime'), value: stats.slide.bestTimeSeconds > 0 ? `${stats.slide.bestTimeSeconds}s` : '-' },
        { label: I18n.t('totalMovesMade'), value: stats.slide.totalMoves }
      ])}

      <!-- 4. Block Fit Stats -->
      ${renderModeStatsCard('blockfit', 'blockFitTitle', '🧱', [
        { label: I18n.t('highScore'), value: stats.blockfit.highScore },
        { label: I18n.t('linesCleared'), value: stats.blockfit.extraStats?.linesCleared || 0 }
      ])}

      <!-- 5. Mahjong Solitaire Stats -->
      ${renderModeStatsCard('mahjong', 'mahjongTitle', '🀄', [
        { label: I18n.t('maxLevel'), value: data.mahjongUnlockedLevel || 1 },
        { label: I18n.t('bestTime'), value: stats.mahjong?.bestTimeSeconds > 0 ? `${stats.mahjong.bestTimeSeconds}s` : '-' }
      ])}

      <!-- 6. Word Search Stats -->
      ${renderModeStatsCard('wordsearch', 'wordSearchTitle', '🔍', [
        { label: I18n.t('maxLevel'), value: Storage.getUnlockedWordSearchLevel(currentLang) || 1 },
        { label: I18n.t('puzzlesSolved'), value: stats.wordsearch?.gamesWon || 0 }
      ])}
    </div>
  `;
}

export function bindStatsEvents(_container: HTMLElement): void {
  // Read-only presentation
}
