import { I18n } from '../../core/i18n';
import { SoundManager } from '../../audio/SoundManager';
import { Router } from '../router';
import { Icons } from '../icons';
import { GameMode } from '../../core/types';
import { Modal } from '../components';
import { GameLauncher } from '../../scenes/GameLauncher';

export function openPauseModal(
  _mode: GameMode,
  onResume: () => void,
  onRestart: () => void
): void {
  const content = `
    <div style="display: flex; flex-direction: column; gap: 12px; padding: 10px 0;">
      <button class="btn btn-primary btn-block" id="pause-resume-btn" style="padding: 12px;">
        ${Icons.play}
        <span>${I18n.t('resume')}</span>
      </button>
      <button class="btn btn-secondary btn-block" id="pause-restart-btn" style="padding: 12px;">
        ${Icons.restart}
        <span>${I18n.t('restart')}</span>
      </button>
      <button class="btn btn-secondary btn-block" id="pause-settings-btn" style="padding: 12px;">
        ${Icons.settings}
        <span>${I18n.t('settings')}</span>
      </button>
      <button class="btn btn-secondary btn-block" id="pause-home-btn" style="padding: 12px;">
        ${Icons.home}
        <span>${I18n.t('home')}</span>
      </button>
    </div>
  `;

  const modalEl = Modal.open(I18n.t('pause'), content, '');

  modalEl.querySelector('#pause-resume-btn')?.addEventListener('click', () => {
    SoundManager.play('click');
    Modal.close();
    onResume();
  });

  modalEl.querySelector('#pause-restart-btn')?.addEventListener('click', () => {
    SoundManager.play('click');
    Modal.close();
    onRestart();
  });

  modalEl.querySelector('#pause-settings-btn')?.addEventListener('click', () => {
    SoundManager.play('click');
    Modal.close();
    Router.navigate('settings');
  });

  modalEl.querySelector('#pause-home-btn')?.addEventListener('click', () => {
    SoundManager.play('click');
    Modal.close();
    GameLauncher.destroy();
    Router.navigate('home');
  });
}
