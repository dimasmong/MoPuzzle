import { I18n } from '../../core/i18n';
import { Storage } from '../../core/storage';
import { SoundManager } from '../../audio/SoundManager';
import { Router } from '../router';
import { Icons } from '../icons';
import { GameMode } from '../../core/types';

export function renderLevelSelectPage(mode: GameMode = 'colorsort'): string {
  const data = Storage.getData();
  const currentLang = data.settings.language || 'en';

  let unlocked = 1;
  let totalLevels = 20;

  if (mode === 'colorsort') {
    unlocked = data.colorSortUnlockedLevel || 1;
    totalLevels = 30;
  } else if (mode === 'mahjong') {
    unlocked = data.mahjongUnlockedLevel || 1;
    totalLevels = 20;
  } else if (mode === 'wordsearch') {
    unlocked = Storage.getUnlockedWordSearchLevel(currentLang) || 1;
    totalLevels = 20;
  }

  let buttonsHtml = '';

  for (let lvl = 1; lvl <= totalLevels; lvl++) {
    const isUnlocked = lvl <= unlocked;
    const isCurrent = lvl === unlocked;

    buttonsHtml += `
      <button 
        class="level-btn ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}" 
        data-level="${lvl}"
        ${!isUnlocked ? 'disabled' : ''}
        style="
          height: 60px;
          border-radius: var(--radius-md);
          font-size: 16px;
          font-weight: 700;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: ${isCurrent ? 'var(--primary-color)' : (isUnlocked ? 'var(--card-bg)' : 'rgba(0,0,0,0.05)')};
          color: ${isCurrent ? '#FFFFFF' : (isUnlocked ? 'var(--text-main)' : 'var(--text-muted)')};
          border: 1px solid ${isCurrent ? 'var(--primary-color)' : 'var(--card-border)'};
          cursor: ${isUnlocked ? 'pointer' : 'not-allowed'};
          box-shadow: ${isUnlocked ? 'var(--shadow-sm)' : 'none'};
          opacity: ${isUnlocked ? 1 : 0.4};
        "
      >
        <span>${lvl}</span>
        ${lvl < unlocked ? `<span style="font-size: 10px; color: #10B981;">✓</span>` : ''}
      </button>
    `;
  }

  return `
    <div class="page-levelselect">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <button class="icon-btn" id="levelselect-back-btn" aria-label="${I18n.t('back')}">
          ${Icons.back}
        </button>
        <div>
          <h2 style="font-size: 20px; font-weight: 800;">${I18n.t('selectLevel')}</h2>
          <p style="font-size: 12px; color: var(--text-muted);">${I18n.t((mode + 'Title') as any)}</p>
        </div>
      </div>

      <div class="card" style="padding: 16px;">
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;">
          ${buttonsHtml}
        </div>
      </div>
    </div>
  `;
}

export function bindLevelSelectEvents(container: HTMLElement, mode: GameMode = 'colorsort'): void {
  container.querySelector('#levelselect-back-btn')?.addEventListener('click', () => {
    SoundManager.play('click');
    Router.navigate('details', { mode });
  });

  container.querySelectorAll('[data-level]').forEach(el => {
    el.addEventListener('click', () => {
      const lvl = Number(el.getAttribute('data-level'));
      if (lvl) {
        SoundManager.play('click');
        Router.navigate('play', { mode, difficulty: lvl });
      }
    });
  });
}
