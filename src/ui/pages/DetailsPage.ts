import { I18n } from '../../core/i18n';
import { Storage } from '../../core/storage';
import { SoundManager } from '../../audio/SoundManager';
import { Router } from '../router';
import { Icons } from '../icons';
import { GameMode } from '../../core/types';

export function renderDetailsPage(mode: GameMode = 'merge'): string {
  const data = Storage.getData();
  const stats = data.stats[mode] || { gamesPlayed: 0, gamesWon: 0, bestTimeSeconds: 0, highScore: 0, totalMoves: 0 };
  const activeGame = data.activeGames[mode];
  const hasActive = !!activeGame && !activeGame.won && !activeGame.gameOver;
  const currentLang = data.settings.language || 'en';

  let difficultyHtml = '';
  if (mode === 'merge') {
    difficultyHtml = `
      <div style="margin-bottom: 20px;">
        <label style="display: block; font-size: 13px; font-weight: 700; margin-bottom: 8px;">${I18n.t('difficulty')}</label>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary active-mode-btn" data-diff="classic" style="flex: 1; border: 2px solid var(--primary-color);">
            ${I18n.t('classicMode')}
          </button>
          <button class="btn btn-secondary" data-diff="timed" style="flex: 1;">
            ${I18n.t('timedMode')}
          </button>
        </div>
      </div>
    `;
  } else if (mode === 'slide') {
    difficultyHtml = `
      <div style="margin-bottom: 20px;">
        <label style="display: block; font-size: 13px; font-weight: 700; margin-bottom: 8px;">${I18n.t('boardSize')}</label>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary" data-diff="3" style="flex: 1;">3×3</button>
          <button class="btn btn-secondary active-mode-btn" data-diff="4" style="flex: 1; border: 2px solid var(--primary-color);">4×4</button>
          <button class="btn btn-secondary" data-diff="5" style="flex: 1;">5×5</button>
        </div>
      </div>
    `;
  } else if (mode === 'colorsort') {
    difficultyHtml = `
      <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <label style="font-size: 13px; font-weight: 700;">${I18n.t('selectLevel')}</label>
          <button class="btn btn-secondary" id="browse-levels-btn" style="padding: 4px 10px; font-size: 12px;">
            ${I18n.t('selectLevel')} ➔
          </button>
        </div>
        <div style="font-size: 14px; font-weight: 600; color: var(--text-muted);">
          ${I18n.t('level')} ${data.colorSortUnlockedLevel || 1} (Unlocked)
        </div>
      </div>
    `;
  } else if (mode === 'mahjong') {
    difficultyHtml = `
      <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <label style="font-size: 13px; font-weight: 700;">${I18n.t('selectLevel')}</label>
          <button class="btn btn-secondary" id="browse-levels-btn" style="padding: 4px 10px; font-size: 12px;">
            ${I18n.t('selectLevel')} ➔
          </button>
        </div>
        <div style="font-size: 14px; font-weight: 600; color: var(--text-muted);">
          ${I18n.t('level')} ${data.mahjongUnlockedLevel || 1} (Unlocked)
        </div>
      </div>
    `;
  } else if (mode === 'wordsearch') {
    const wsUnlocked = Storage.getUnlockedWordSearchLevel(currentLang);
    difficultyHtml = `
      <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <label style="font-size: 13px; font-weight: 700;">${I18n.t('selectLevel')}</label>
          <button class="btn btn-secondary" id="browse-levels-btn" style="padding: 4px 10px; font-size: 12px;">
            ${I18n.t('selectLevel')} ➔
          </button>
        </div>
        <div style="font-size: 14px; font-weight: 600; color: var(--text-muted);">
          ${I18n.t('level')} ${wsUnlocked || 1} (${currentLang.toUpperCase()} Unlocked)
        </div>
      </div>
    `;
  }

  return `
    <div class="page-details">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <button class="icon-btn" id="details-back-btn" aria-label="${I18n.t('back')}">
          ${Icons.back}
        </button>
        <div>
          <h2 style="font-size: 20px; font-weight: 800;">${I18n.t((mode + 'Title') as any)}</h2>
          <p style="font-size: 12px; color: var(--text-muted);">${I18n.t((mode + 'Subtitle') as any)}</p>
        </div>
      </div>

      <!-- Overview Card -->
      <div class="card">
        <p style="font-size: 14px; line-height: 1.5; color: var(--text-main); margin-bottom: 16px;">
          ${I18n.t((mode + 'Desc') as any)}
        </p>

        ${difficultyHtml}

        <!-- Best Stats Card -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
          <div style="background: rgba(36, 58, 115, 0.05); padding: 10px; border-radius: var(--radius-md); text-align: center;">
            <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
              ${mode === 'slide' || mode === 'mahjong' || mode === 'wordsearch' ? I18n.t('bestTime') : I18n.t('highScore')}
            </div>
            <div style="font-size: 18px; font-weight: 800; color: var(--primary-color);">
              ${(mode === 'slide' || mode === 'mahjong' || mode === 'wordsearch')
                ? (stats.bestTimeSeconds > 0 ? `${stats.bestTimeSeconds}s` : '-')
                : (stats.highScore || 0)}
            </div>
          </div>
          <div style="background: rgba(36, 58, 115, 0.05); padding: 10px; border-radius: var(--radius-md); text-align: center;">
            <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
              ${I18n.t('totalWins')}
            </div>
            <div style="font-size: 18px; font-weight: 800; color: var(--primary-color);">
              ${stats.gamesWon || 0}
            </div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${hasActive ? `
            <button class="btn btn-primary btn-block" id="resume-game-btn" style="padding: 14px; font-size: 16px;">
              ${Icons.play}
              <span>${I18n.t('resume')}</span>
            </button>
            <button class="btn btn-secondary btn-block" id="new-game-btn">
              ${Icons.restart}
              <span>${I18n.t('newGame')}</span>
            </button>
          ` : `
            <button class="btn btn-primary btn-block" id="start-game-btn" style="padding: 14px; font-size: 16px;">
              ${Icons.play}
              <span>${I18n.t('play')}</span>
            </button>
          `}
        </div>
      </div>

      <!-- Rules Guide Card -->
      <div class="card">
        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">
          ${I18n.t((mode + 'RulesTitle') as any)}
        </h3>
        <p style="font-size: 13px; line-height: 1.6; color: var(--text-muted);">
          ${I18n.t((mode + 'Rules') as any)}
        </p>
      </div>
    </div>
  `;
}

export function bindDetailsPageEvents(container: HTMLElement, mode: GameMode): void {
  const data = Storage.getData();
  const currentLang = data.settings.language || 'en';
  let defaultDiff: any = 1;

  if (mode === 'slide') defaultDiff = 4;
  else if (mode === 'merge') defaultDiff = 'classic';
  else if (mode === 'colorsort') defaultDiff = data.colorSortUnlockedLevel || 1;
  else if (mode === 'mahjong') defaultDiff = data.mahjongUnlockedLevel || 1;
  else if (mode === 'wordsearch') defaultDiff = Storage.getUnlockedWordSearchLevel(currentLang) || 1;

  let selectedDifficulty = defaultDiff;

  container.querySelector('#details-back-btn')?.addEventListener('click', () => {
    SoundManager.play('click');
    Router.navigate('home');
  });

  container.querySelectorAll('[data-diff]').forEach(el => {
    el.addEventListener('click', () => {
      SoundManager.play('click');
      container.querySelectorAll('[data-diff]').forEach(btn => {
        (btn as HTMLElement).style.border = 'none';
      });
      (el as HTMLElement).style.border = '2px solid var(--primary-color)';
      const diffVal = el.getAttribute('data-diff');
      selectedDifficulty = mode === 'slide' ? Number(diffVal) : diffVal;
    });
  });

  container.querySelector('#browse-levels-btn')?.addEventListener('click', () => {
    SoundManager.play('click');
    Router.navigate('levelselect', { mode });
  });

  container.querySelector('#resume-game-btn')?.addEventListener('click', () => {
    SoundManager.play('click');
    Router.navigate('play', { mode, difficulty: selectedDifficulty });
  });

  container.querySelector('#new-game-btn')?.addEventListener('click', async () => {
    SoundManager.play('click');
    await Storage.clearActiveGame(mode);
    Router.navigate('play', { mode, difficulty: selectedDifficulty });
  });

  container.querySelector('#start-game-btn')?.addEventListener('click', () => {
    SoundManager.play('click');
    Router.navigate('play', { mode, difficulty: selectedDifficulty });
  });
}
