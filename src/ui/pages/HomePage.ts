import { I18n } from '../../core/i18n';
import { Storage } from '../../core/storage';
import { SoundManager } from '../../audio/SoundManager';
import { Router } from '../router';
import { Icons } from '../icons';
import { GameMode } from '../../core/types';

export function renderHomePage(): string {
  const data = Storage.getData();
  const activeGames = data.activeGames;

  // Check if any game is in progress for Continue Playing banner
  let continueMode: GameMode | null = null;
  if (activeGames.merge) continueMode = 'merge';
  else if (activeGames.colorsort) continueMode = 'colorsort';
  else if (activeGames.slide) continueMode = 'slide';
  else if (activeGames.blockfit) continueMode = 'blockfit';

  const continueBanner = continueMode ? `
    <div class="card" style="background: linear-gradient(135deg, rgba(36, 58, 115, 0.95), rgba(58, 134, 255, 0.9)); color: #FFFFFF; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; opacity: 0.85;">${I18n.t('continue')}</div>
        <div style="font-size: 18px; font-weight: 800; margin-top: 2px;">${I18n.t((continueMode + 'Title') as any)}</div>
      </div>
      <button class="btn btn-accent" id="continue-game-btn" style="box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
        ${Icons.play}
        <span>${I18n.t('resume')}</span>
      </button>
    </div>
  ` : '';

  return `
    <div class="page-home">
      ${continueBanner}

      <div style="margin-bottom: 16px;">
        <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 4px;">${I18n.t('games')}</h2>
        <p style="font-size: 13px; color: var(--text-muted);">${I18n.t('tagline')}</p>
      </div>

      <div class="game-grid">
        <!-- MODE 1: Merge Numbers -->
        <div class="game-card" data-mode="merge">
          <div class="game-card-icon" style="background: #FEEBC8; color: #DD6B20;">
            🔢
          </div>
          <div>
            <div class="game-card-title">${I18n.t('mergeTitle')}</div>
            <div class="game-card-sub">${I18n.t('mergeSubtitle')}</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
            <span style="font-size: 12px; font-weight: 600; color: var(--text-muted);">
              ${I18n.t('highScore')}: ${data.stats.merge.highScore}
            </span>
            <button class="btn btn-primary" style="padding: 6px 14px; font-size: 13px;">
              ${Icons.play}
              <span>${I18n.t('play')}</span>
            </button>
          </div>
        </div>

        <!-- MODE 2: Color Sort -->
        <div class="game-card" data-mode="colorsort">
          <div class="game-card-icon" style="background: #EBF8FF; color: #3182CE;">
            🧪
          </div>
          <div>
            <div class="game-card-title">${I18n.t('colorSortTitle')}</div>
            <div class="game-card-sub">${I18n.t('colorSortSubtitle')}</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
            <span style="font-size: 12px; font-weight: 600; color: var(--text-muted);">
              ${I18n.t('level')} ${data.colorSortUnlockedLevel}
            </span>
            <button class="btn btn-primary" style="padding: 6px 14px; font-size: 13px;">
              ${Icons.play}
              <span>${I18n.t('play')}</span>
            </button>
          </div>
        </div>

        <!-- MODE 3: Slide Puzzle -->
        <div class="game-card" data-mode="slide">
          <div class="game-card-icon" style="background: #FEFCBF; color: #D69E2E;">
            🧩
          </div>
          <div>
            <div class="game-card-title">${I18n.t('slideTitle')}</div>
            <div class="game-card-sub">${I18n.t('slideSubtitle')}</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
            <span style="font-size: 12px; font-weight: 600; color: var(--text-muted);">
              ${data.stats.slide.gamesWon} ${I18n.t('puzzlesSolved')}
            </span>
            <button class="btn btn-primary" style="padding: 6px 14px; font-size: 13px;">
              ${Icons.play}
              <span>${I18n.t('play')}</span>
            </button>
          </div>
        </div>

        <!-- MODE 4: Block Fit -->
        <div class="game-card" data-mode="blockfit">
          <div class="game-card-icon" style="background: #E6FFFA; color: #319795;">
            🧱
          </div>
          <div>
            <div class="game-card-title">${I18n.t('blockFitTitle')}</div>
            <div class="game-card-sub">${I18n.t('blockFitSubtitle')}</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
            <span style="font-size: 12px; font-weight: 600; color: var(--text-muted);">
              ${I18n.t('highScore')}: ${data.stats.blockfit.highScore}
            </span>
            <button class="btn btn-primary" style="padding: 6px 14px; font-size: 13px;">
              ${Icons.play}
              <span>${I18n.t('play')}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick links banner -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 20px;">
        <button class="btn btn-secondary" id="faq-quick-btn" style="justify-content: flex-start; padding: 12px;">
          ${Icons.help}
          <span>${I18n.t('faq')}</span>
        </button>
        <button class="btn btn-secondary" id="about-quick-btn" style="justify-content: flex-start; padding: 12px;">
          ${Icons.info}
          <span>${I18n.t('about')}</span>
        </button>
      </div>
    </div>
  `;
}

export function bindHomePageEvents(container: HTMLElement): void {
  container.querySelector('#continue-game-btn')?.addEventListener('click', () => {
    SoundManager.play('click');
    const data = Storage.getData();
    if (data.activeGames.merge) Router.navigate('play', { mode: 'merge' });
    else if (data.activeGames.colorsort) Router.navigate('play', { mode: 'colorsort' });
    else if (data.activeGames.slide) Router.navigate('play', { mode: 'slide' });
    else if (data.activeGames.blockfit) Router.navigate('play', { mode: 'blockfit' });
  });

  container.querySelectorAll('[data-mode]').forEach(el => {
    el.addEventListener('click', () => {
      SoundManager.play('click');
      const mode = el.getAttribute('data-mode') as GameMode;
      if (mode) {
        Router.navigate('details', { mode });
      }
    });
  });

  container.querySelector('#faq-quick-btn')?.addEventListener('click', () => {
    SoundManager.play('click');
    Router.navigate('faq');
  });

  container.querySelector('#about-quick-btn')?.addEventListener('click', () => {
    SoundManager.play('click');
    Router.navigate('about');
  });
}
