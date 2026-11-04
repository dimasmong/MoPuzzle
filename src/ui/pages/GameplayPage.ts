import { I18n } from '../../core/i18n';
import { Storage } from '../../core/storage';
import { SoundManager } from '../../audio/SoundManager';
import { Router } from '../router';
import { Icons } from '../icons';
import { GameMode } from '../../core/types';
import { GameLauncher } from '../../scenes/GameLauncher';
import { openPauseModal } from './PauseModal';
import { Modal } from '../components';

export function renderGameplayPage(mode: GameMode, difficulty?: any): string {
  const data = Storage.getData();
  const stats = data.stats[mode];

  const showUndo = mode === 'merge' || mode === 'colorsort';
  const showHint = mode === 'colorsort';

  let modeLabel = '';
  if (mode === 'merge') modeLabel = difficulty === 'timed' ? I18n.t('timedMode') : I18n.t('classicMode');
  else if (mode === 'colorsort') modeLabel = `${I18n.t('level')} ${difficulty || data.colorSortUnlockedLevel}`;
  else if (mode === 'slide') modeLabel = `${difficulty || 4}×${difficulty || 4}`;
  else if (mode === 'blockfit') modeLabel = '10×10';

  return `
    <div class="gameplay-wrapper">
      <!-- Top Header -->
      <div class="game-top-bar">
        <button class="icon-btn" id="game-back-btn" aria-label="${I18n.t('back')}">
          ${Icons.back}
        </button>
        <div class="game-title-group">
          <div class="game-title-text">${I18n.t((mode + 'Title') as any)}</div>
          <span class="game-mode-badge">${modeLabel}</span>
        </div>
        <button class="icon-btn" id="game-pause-btn" aria-label="${I18n.t('pause')}">
          ${Icons.pause}
        </button>
      </div>

      <!-- In-Game HUD -->
      <div class="game-hud" id="gameplay-hud">
        ${renderHudItems(mode, { score: 0, best: stats.highScore, moves: 0, time: 0 })}
      </div>

      <!-- Canvas Mount Area -->
      <div class="game-canvas-container" id="phaser-container">
        <!-- Phaser renders here -->
      </div>

      <!-- Bottom In-Game Controls Bar -->
      <div class="game-controls-bar">
        ${showUndo ? `
          <button class="action-btn" id="game-undo-btn" title="${I18n.t('undo')}">
            ${Icons.undo}
            <span>${I18n.t('undo')}</span>
          </button>
        ` : ''}

        <button class="action-btn" id="game-restart-btn" title="${I18n.t('restart')}">
          ${Icons.restart}
          <span>${I18n.t('restart')}</span>
        </button>

        ${showHint ? `
          <button class="action-btn" id="game-hint-btn" title="${I18n.t('hint')}">
            ${Icons.hint}
            <span>${I18n.t('hint')}</span>
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

function renderHudItems(mode: GameMode, values: { score: number; best: number; moves: number; time: number; combo?: number }): string {
  if (mode === 'merge') {
    return `
      <div class="hud-item">
        <span class="hud-label">${I18n.t('score')}</span>
        <span class="hud-value" id="hud-score">${values.score}</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">${I18n.t('bestScore')}</span>
        <span class="hud-value" id="hud-best">${values.best}</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">${I18n.t('moves')}</span>
        <span class="hud-value" id="hud-moves">${values.moves}</span>
      </div>
      <div class="hud-item" id="hud-time-container" style="display: ${values.time > 0 ? 'flex' : 'none'};">
        <span class="hud-label">${I18n.t('time')}</span>
        <span class="hud-value" id="hud-time">${values.time}s</span>
      </div>
    `;
  } else if (mode === 'colorsort') {
    return `
      <div class="hud-item">
        <span class="hud-label">${I18n.t('level')}</span>
        <span class="hud-value" id="hud-level">${values.score || 1}</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">${I18n.t('moves')}</span>
        <span class="hud-value" id="hud-moves">${values.moves}</span>
      </div>
    `;
  } else if (mode === 'slide') {
    return `
      <div class="hud-item">
        <span class="hud-label">${I18n.t('moves')}</span>
        <span class="hud-value" id="hud-moves">${values.moves}</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">${I18n.t('time')}</span>
        <span class="hud-value" id="hud-time">${formatTime(values.time)}</span>
      </div>
    `;
  } else {
    // Block Fit
    return `
      <div class="hud-item">
        <span class="hud-label">${I18n.t('score')}</span>
        <span class="hud-value" id="hud-score">${values.score}</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">${I18n.t('highScore')}</span>
        <span class="hud-value" id="hud-best">${values.best}</span>
      </div>
      <div class="hud-item" id="hud-combo-item" style="display: ${values.combo && values.combo > 1 ? 'flex' : 'none'};">
        <span class="hud-label">${I18n.t('streak')}</span>
        <span class="hud-value" id="hud-combo">${values.combo}x</span>
      </div>
    `;
  }
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function bindGameplayPageEvents(container: HTMLElement, mode: GameMode, difficulty?: any): void {
  const canvasMount = container.querySelector('#phaser-container') as HTMLElement;
  if (!canvasMount) return;

  container.querySelector('#game-back-btn')?.addEventListener('click', () => {
    SoundManager.play('click');
    GameLauncher.destroy();
    Router.navigate('details', { mode });
  });

  container.querySelector('#game-pause-btn')?.addEventListener('click', () => {
    SoundManager.play('click');
    openPauseModal(mode, () => {
      // Resume callback
    }, () => {
      // Restart callback
      GameLauncher.restart();
    });
  });

  container.querySelector('#game-undo-btn')?.addEventListener('click', () => {
    GameLauncher.undo();
  });

  container.querySelector('#game-restart-btn')?.addEventListener('click', () => {
    GameLauncher.restart();
  });

  container.querySelector('#game-hint-btn')?.addEventListener('click', () => {
    const hintRes = GameLauncher.hint();
    if (hintRes) {
      // Hint animation is played in scene
    }
  });

  // Launch Phaser Scene
  GameLauncher.launch(mode, canvasMount, {
    difficulty,
    onStateChange: (state: any) => {
      // Update DOM HUD values
      const scoreEl = container.querySelector('#hud-score');
      if (scoreEl && state.score !== undefined) scoreEl.textContent = String(state.score);

      const movesEl = container.querySelector('#hud-moves');
      if (movesEl && state.moves !== undefined) movesEl.textContent = String(state.moves);

      const timeEl = container.querySelector('#hud-time');
      if (timeEl) {
        if (mode === 'merge' && state.timeRemaining !== undefined) {
          timeEl.textContent = `${state.timeRemaining}s`;
          const tc = container.querySelector('#hud-time-container') as HTMLElement;
          if (tc) tc.style.display = 'flex';
        } else if (mode === 'slide' && state.elapsedSeconds !== undefined) {
          timeEl.textContent = formatTime(state.elapsedSeconds);
        }
      }

      const levelEl = container.querySelector('#hud-level');
      if (levelEl && state.level !== undefined) levelEl.textContent = String(state.level);

      const bestEl = container.querySelector('#hud-best');
      if (bestEl) {
        const hs = Storage.getData().stats[mode].highScore;
        bestEl.textContent = String(Math.max(hs, state.score ?? 0));
      }

      const comboItem = container.querySelector('#hud-combo-item') as HTMLElement;
      const comboEl = container.querySelector('#hud-combo');
      if (comboItem && comboEl && state.comboStreak !== undefined) {
        comboItem.style.display = state.comboStreak > 1 ? 'flex' : 'none';
        comboEl.textContent = `${state.comboStreak}x`;
      }

      // Check for Victory Modal
      if (state.won) {
        showVictoryModal(mode, state);
      } else if (state.gameOver) {
        showGameOverModal(mode, state);
      }
    }
  });
}

function showVictoryModal(mode: GameMode, state: any): void {
  const content = `
    <div class="result-banner">
      <div class="result-icon">🏆</div>
      <h3 class="result-title">${I18n.t('victory')}</h3>
      <p class="result-desc">${I18n.t('victoryDesc')}</p>
      ${state.score ? `<div style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">${I18n.t('score')}: ${state.score}</div>` : ''}
      ${state.moves ? `<div style="font-size: 14px; color: var(--text-muted);">${I18n.t('moves')}: ${state.moves}</div>` : ''}
    </div>
  `;

  const actions = `
    <button class="btn btn-secondary" id="modal-victory-home">
      ${Icons.home}
      <span>${I18n.t('home')}</span>
    </button>
    ${mode === 'colorsort' ? `
      <button class="btn btn-primary" id="modal-next-level">
        ${Icons.play}
        <span>${I18n.t('nextLevel')}</span>
      </button>
    ` : `
      <button class="btn btn-primary" id="modal-play-again">
        ${Icons.restart}
        <span>${I18n.t('playAgain')}</span>
      </button>
    `}
  `;

  const modalEl = Modal.open(I18n.t('victory'), content, actions);

  modalEl.querySelector('#modal-victory-home')?.addEventListener('click', () => {
    SoundManager.play('click');
    Modal.close();
    GameLauncher.destroy();
    Router.navigate('home');
  });

  modalEl.querySelector('#modal-next-level')?.addEventListener('click', () => {
    SoundManager.play('click');
    Modal.close();
    const nextLvl = (state.level || 1) + 1;
    GameLauncher.destroy();
    Router.navigate('play', { mode: 'colorsort', difficulty: nextLvl });
  });

  modalEl.querySelector('#modal-play-again')?.addEventListener('click', () => {
    SoundManager.play('click');
    Modal.close();
    GameLauncher.restart();
  });
}

function showGameOverModal(_mode: GameMode, state: any): void {
  const content = `
    <div class="result-banner">
      <div class="result-icon">💥</div>
      <h3 class="result-title">${I18n.t('gameOver')}</h3>
      <p class="result-desc">${I18n.t('gameOverDesc')}</p>
      ${state.score ? `<div style="font-size: 18px; font-weight: 800; color: var(--primary-color);">${I18n.t('score')}: ${state.score}</div>` : ''}
    </div>
  `;

  const actions = `
    <button class="btn btn-secondary" id="modal-over-home">
      ${Icons.home}
      <span>${I18n.t('home')}</span>
    </button>
    <button class="btn btn-primary" id="modal-over-retry">
      ${Icons.restart}
      <span>${I18n.t('restart')}</span>
    </button>
  `;

  const modalEl = Modal.open(I18n.t('gameOver'), content, actions);

  modalEl.querySelector('#modal-over-home')?.addEventListener('click', () => {
    SoundManager.play('click');
    Modal.close();
    GameLauncher.destroy();
    Router.navigate('home');
  });

  modalEl.querySelector('#modal-over-retry')?.addEventListener('click', () => {
    SoundManager.play('click');
    Modal.close();
    GameLauncher.restart();
  });
}
