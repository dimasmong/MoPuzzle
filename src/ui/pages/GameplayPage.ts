import { I18n } from '../../core/i18n';
import { Storage } from '../../core/storage';
import { SoundManager } from '../../audio/SoundManager';
import { Router } from '../router';
import { Icons } from '../icons';
import { GameMode } from '../../core/types';
import { GameLauncher } from '../../scenes/GameLauncher';
import { openPauseModal } from './PauseModal';
import { Modal } from '../components';
import { Diagnostics } from '../../core/diagnostics';

export function renderGameplayPage(mode: GameMode, difficulty?: any): string {
  const data = Storage.getData();
  const stats = data.stats[mode] || { highScore: 0 };
  const currentLang = data.settings.language || 'en';

  const showUndo = mode === 'merge' || mode === 'colorsort' || mode === 'mahjong';
  const showShuffle = mode === 'mahjong';
  const showHint = mode === 'colorsort' || mode === 'mahjong' || mode === 'wordsearch';

  let modeLabel = '';
  if (mode === 'merge') modeLabel = difficulty === 'timed' ? I18n.t('timedMode') : I18n.t('classicMode');
  else if (mode === 'colorsort') modeLabel = `${I18n.t('level')} ${difficulty || data.colorSortUnlockedLevel || 1}`;
  else if (mode === 'slide') modeLabel = `${difficulty || 4}×${difficulty || 4}`;
  else if (mode === 'blockfit') modeLabel = '10×10';
  else if (mode === 'mahjong') modeLabel = `${I18n.t('level')} ${difficulty || data.mahjongUnlockedLevel || 1}`;
  else if (mode === 'wordsearch') modeLabel = `${I18n.t('level')} ${difficulty || Storage.getUnlockedWordSearchLevel(currentLang) || 1}`;

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
        ${renderHudItems(mode, { score: 0, best: stats.highScore || 0, moves: 0, time: 0, level: difficulty || 1 })}
      </div>

      <!-- Mahjong Stuck Banner (Hidden by default) -->
      <div class="game-stuck-banner" id="mahjong-stuck-banner" style="display: none;">
        ${I18n.t('stuckNotice')}
      </div>

      <!-- Word Search Chip List (Rendered for wordsearch) -->
      ${mode === 'wordsearch' ? `<div class="word-search-chip-list" id="ws-chip-list"></div>` : ''}

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

        ${showShuffle ? `
          <button class="action-btn" id="game-shuffle-btn" title="${I18n.t('shuffle')}">
            ${Icons.shuffle}
            <span>${I18n.t('shuffle')}</span>
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

function renderHudItems(mode: GameMode, values: { score: number; best: number; moves: number; time: number; combo?: number; level?: number; remaining?: number; pairsAvailable?: number; found?: number; total?: number }): string {
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
        <span class="hud-value" id="hud-level">${values.level || 1}</span>
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
  } else if (mode === 'mahjong') {
    return `
      <div class="hud-item">
        <span class="hud-label">${I18n.t('level')}</span>
        <span class="hud-value" id="hud-level">${values.level || 1}</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">${I18n.t('remainingTiles')}</span>
        <span class="hud-value" id="hud-remaining">${values.remaining ?? 24}</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">${I18n.t('availablePairs')}</span>
        <span class="hud-value" id="hud-pairs">${values.pairsAvailable ?? 0}</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">${I18n.t('time')}</span>
        <span class="hud-value" id="hud-time">${formatTime(values.time)}</span>
      </div>
    `;
  } else if (mode === 'wordsearch') {
    return `
      <div class="hud-item">
        <span class="hud-label">${I18n.t('level')}</span>
        <span class="hud-value" id="hud-level">${values.level || 1}</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">${I18n.t('wordsFound')}</span>
        <span class="hud-value" id="hud-found">${values.found ?? 0} / ${values.total ?? 4}</span>
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

  container.querySelector('#game-shuffle-btn')?.addEventListener('click', () => {
    GameLauncher.shuffle();
  });

  container.querySelector('#game-restart-btn')?.addEventListener('click', () => {
    GameLauncher.restart();
  });

  container.querySelector('#game-hint-btn')?.addEventListener('click', () => {
    GameLauncher.hint();
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
        } else if ((mode === 'slide' || mode === 'mahjong' || mode === 'wordsearch') && (state.elapsedSeconds !== undefined || state.time !== undefined)) {
          timeEl.textContent = formatTime(state.elapsedSeconds ?? state.time ?? 0);
        }
      }

      const levelEl = container.querySelector('#hud-level');
      if (levelEl && state.level !== undefined) levelEl.textContent = String(state.level);

      const remainingEl = container.querySelector('#hud-remaining');
      if (remainingEl && state.remaining !== undefined) remainingEl.textContent = String(state.remaining);

      const pairsEl = container.querySelector('#hud-pairs');
      if (pairsEl && state.pairsAvailable !== undefined) pairsEl.textContent = String(state.pairsAvailable);

      const foundEl = container.querySelector('#hud-found');
      if (foundEl && state.found !== undefined && state.total !== undefined) {
        foundEl.textContent = `${state.found} / ${state.total}`;
      }

      const stuckBanner = container.querySelector('#mahjong-stuck-banner') as HTMLElement;
      if (stuckBanner) {
        stuckBanner.style.display = state.isStuck ? 'block' : 'none';
      }

      // Update Word Search Chips
      if (mode === 'wordsearch' && state.words && Array.isArray(state.words)) {
        const chipContainer = container.querySelector('#ws-chip-list');
        if (chipContainer) {
          chipContainer.innerHTML = state.words.map((tw: any) => `
            <span class="word-chip ${tw.found ? 'found' : ''}">${tw.word}</span>
          `).join('');
        }
      }

      const levelBadge = container.querySelector('.game-mode-badge');
      if (levelBadge && state.level !== undefined && (mode === 'colorsort' || mode === 'mahjong' || mode === 'wordsearch')) {
        levelBadge.textContent = `${I18n.t('level')} ${state.level}`;
      }

      const undoBtn = container.querySelector('#game-undo-btn') as HTMLButtonElement;
      if (undoBtn && state.canUndo !== undefined) {
        undoBtn.disabled = !state.canUndo;
        undoBtn.style.opacity = state.canUndo ? '1' : '0.5';
      }

      const bestEl = container.querySelector('#hud-best');
      if (bestEl) {
        const hs = Storage.getData().stats[mode]?.highScore || 0;
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
  if (document.getElementById('active-modal')) {
    return;
  }

  let title = I18n.t('victory');
  let desc = I18n.t('victoryDesc');
  let icon = '🏆';
  let detailsHtml = '';
  let actions = '';

  if (mode === 'colorsort') {
    const isCampaignEnd = (state.level || 1) >= 30;
    if (isCampaignEnd) {
      title = I18n.t('campaignComplete');
      desc = I18n.t('campaignCompleteDesc');
      icon = '🌟';
    }
    detailsHtml = `
      <div style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">${I18n.t('level')}: ${state.level || 1}</div>
      ${state.moves !== undefined ? `<div style="font-size: 14px; color: var(--text-muted);">${I18n.t('moves')}: ${state.moves}</div>` : ''}
    `;

    actions = `
      <button class="btn btn-secondary" id="modal-victory-home">
        ${Icons.home}
        <span>${I18n.t('home')}</span>
      </button>
      ${isCampaignEnd ? `
        <button class="btn btn-secondary" id="modal-select-level">
          ${Icons.settings}
          <span>${I18n.t('levelSelect')}</span>
        </button>
        <button class="btn btn-primary" id="modal-play-again">
          ${Icons.restart}
          <span>${I18n.t('playAgain')}</span>
        </button>
      ` : `
        <button class="btn btn-primary" id="modal-next-level">
          ${Icons.play}
          <span>${I18n.t('nextLevel')}</span>
        </button>
      `}
    `;
  } else if (mode === 'mahjong') {
    const isCampaignEnd = (state.level || 1) >= 20;
    if (isCampaignEnd) {
      title = I18n.t('campaignComplete');
      desc = I18n.t('campaignCompleteMahjong');
      icon = '🌟';
    }
    detailsHtml = `
      <div style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">${I18n.t('level')}: ${state.level || 1}</div>
      ${state.moves !== undefined ? `<div style="font-size: 14px; color: var(--text-muted);">${I18n.t('moves')}: ${state.moves}</div>` : ''}
      ${(state.time !== undefined || state.elapsedSeconds !== undefined) ? `<div style="font-size: 14px; color: var(--text-muted);">${I18n.t('time')}: ${formatTime(state.time ?? state.elapsedSeconds ?? 0)}</div>` : ''}
    `;

    actions = `
      <button class="btn btn-secondary" id="modal-victory-home">
        ${Icons.home}
        <span>${I18n.t('home')}</span>
      </button>
      ${isCampaignEnd ? `
        <button class="btn btn-secondary" id="modal-select-level">
          ${Icons.settings}
          <span>${I18n.t('levelSelect')}</span>
        </button>
        <button class="btn btn-primary" id="modal-play-again">
          ${Icons.restart}
          <span>${I18n.t('playAgain')}</span>
        </button>
      ` : `
        <button class="btn btn-primary" id="modal-next-level">
          ${Icons.play}
          <span>${I18n.t('nextLevel')}</span>
        </button>
      `}
    `;
  } else if (mode === 'wordsearch') {
    const isCampaignEnd = (state.level || 1) >= 20;
    if (isCampaignEnd) {
      title = I18n.t('campaignComplete');
      desc = I18n.t('campaignCompleteWordSearch');
      icon = '🌟';
    }
    detailsHtml = `
      <div style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">${I18n.t('level')}: ${state.level || 1}</div>
      ${state.found !== undefined ? `<div style="font-size: 14px; color: var(--text-muted);">${I18n.t('wordsFound')}: ${state.found} / ${state.total}</div>` : ''}
      ${(state.time !== undefined || state.elapsedSeconds !== undefined) ? `<div style="font-size: 14px; color: var(--text-muted);">${I18n.t('time')}: ${formatTime(state.time ?? state.elapsedSeconds ?? 0)}</div>` : ''}
    `;

    actions = `
      <button class="btn btn-secondary" id="modal-victory-home">
        ${Icons.home}
        <span>${I18n.t('home')}</span>
      </button>
      ${isCampaignEnd ? `
        <button class="btn btn-secondary" id="modal-select-level">
          ${Icons.settings}
          <span>${I18n.t('levelSelect')}</span>
        </button>
        <button class="btn btn-primary" id="modal-play-again">
          ${Icons.restart}
          <span>${I18n.t('playAgain')}</span>
        </button>
      ` : `
        <button class="btn btn-primary" id="modal-next-level">
          ${Icons.play}
          <span>${I18n.t('nextLevel')}</span>
        </button>
      `}
    `;
  } else if (mode === 'slide') {
    detailsHtml = `
      ${state.moves !== undefined ? `<div style="font-size: 14px; font-weight: 700; margin-bottom: 4px;">${I18n.t('moves')}: ${state.moves}</div>` : ''}
      ${state.elapsedSeconds !== undefined ? `<div style="font-size: 14px; color: var(--text-muted); margin-bottom: 4px;">${I18n.t('time')}: ${formatTime(state.elapsedSeconds)}</div>` : ''}
      ${state.bestTime ? `<div style="font-size: 12px; color: var(--primary-color);">${I18n.t('bestTime')}: ${formatTime(state.bestTime)}</div>` : ''}
    `;

    actions = `
      <button class="btn btn-secondary" id="modal-victory-home">
        ${Icons.home}
        <span>${I18n.t('home')}</span>
      </button>
      <button class="btn btn-primary" id="modal-next-puzzle">
        ${Icons.play}
        <span>${I18n.t('nextPuzzle')}</span>
      </button>
    `;
  } else if (mode === 'merge') {
    title = '2048!';
    desc = I18n.t('victoryDesc');
    detailsHtml = `
      ${state.score !== undefined ? `<div style="font-size: 18px; font-weight: 800; color: var(--primary-color); margin-bottom: 6px;">${I18n.t('score')}: ${state.score}</div>` : ''}
      ${state.moves !== undefined ? `<div style="font-size: 14px; color: var(--text-muted);">${I18n.t('moves')}: ${state.moves}</div>` : ''}
    `;

    actions = `
      <button class="btn btn-secondary" id="modal-victory-home">
        ${Icons.home}
        <span>${I18n.t('home')}</span>
      </button>
      <button class="btn btn-secondary" id="modal-merge-restart">
        ${Icons.restart}
        <span>${I18n.t('newGame')}</span>
      </button>
      <button class="btn btn-primary" id="modal-merge-continue">
        ${Icons.play}
        <span>${I18n.t('continuePlaying')}</span>
      </button>
    `;
  } else {
    detailsHtml = `
      ${state.score !== undefined ? `<div style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">${I18n.t('score')}: ${state.score}</div>` : ''}
      ${state.moves !== undefined ? `<div style="font-size: 14px; color: var(--text-muted);">${I18n.t('moves')}: ${state.moves}</div>` : ''}
    `;
    actions = `
      <button class="btn btn-secondary" id="modal-victory-home">
        ${Icons.home}
        <span>${I18n.t('home')}</span>
      </button>
      <button class="btn btn-primary" id="modal-play-again">
        ${Icons.restart}
        <span>${I18n.t('playAgain')}</span>
      </button>
    `;
  }

  const content = `
    <div class="result-banner">
      <div class="result-icon">${icon}</div>
      <h3 class="result-title">${title}</h3>
      <p class="result-desc">${desc}</p>
      ${detailsHtml}
    </div>
  `;

  Diagnostics.log('show_victory_modal', { mode, level: state.level, moves: state.moves });
  const modalEl = Modal.open(title, content, actions);

  modalEl.querySelector('#modal-victory-home')?.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    SoundManager.play('click');
    Modal.close();
    Storage.clearActiveGame(mode);
    GameLauncher.destroy();
    Router.navigate('home');
  });

  const nextBtn = modalEl.querySelector('#modal-next-level') as HTMLButtonElement | null;
  nextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (nextBtn.disabled) return;
    nextBtn.disabled = true;

    Diagnostics.log('modal_next_level_clicked', { mode, level: state.level });
    SoundManager.play('click');
    Modal.close();

    const advanced = GameLauncher.nextLevel();
    Diagnostics.log('modal_next_level_advancement_result', { advanced });

    if (!advanced) {
      const currentLvl = (state.level || 1);
      const nextLvl = currentLvl + 1;
      const maxLvl = mode === 'colorsort' ? 30 : 20;
      if (nextLvl > maxLvl) {
        Router.navigate('levelselect', { mode });
        return;
      }
      Storage.clearActiveGame(mode);
      GameLauncher.destroy();
      Router.navigate('play', { mode, difficulty: nextLvl });
    }
  });

  modalEl.querySelector('#modal-select-level')?.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    SoundManager.play('click');
    Modal.close();
    Storage.clearActiveGame(mode);
    GameLauncher.destroy();
    Router.navigate('levelselect', { mode });
  });

  modalEl.querySelector('#modal-next-puzzle')?.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    SoundManager.play('click');
    Modal.close();
    GameLauncher.restart();
  });

  modalEl.querySelector('#modal-merge-restart')?.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    SoundManager.play('click');
    Modal.close();
    GameLauncher.restart();
  });

  modalEl.querySelector('#modal-merge-continue')?.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    SoundManager.play('click');
    Modal.close();
    GameLauncher.continuePlaying();
  });

  modalEl.querySelector('#modal-play-again')?.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    SoundManager.play('click');
    Modal.close();
    GameLauncher.restart();
  });
}

function showGameOverModal(mode: GameMode, state: any): void {
  if (document.getElementById('active-modal')) {
    return;
  }

  const content = `
    <div class="result-banner">
      <div class="result-icon">💥</div>
      <h3 class="result-title">${I18n.t('gameOver')}</h3>
      <p class="result-desc">${I18n.t('gameOverDesc')}</p>
      ${state.score !== undefined ? `<div style="font-size: 18px; font-weight: 800; color: var(--primary-color);">${I18n.t('score')}: ${state.score}</div>` : ''}
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
    Storage.clearActiveGame(mode);
    GameLauncher.destroy();
    Router.navigate('home');
  });

  modalEl.querySelector('#modal-over-retry')?.addEventListener('click', () => {
    SoundManager.play('click');
    Modal.close();
    GameLauncher.restart();
  });
}
