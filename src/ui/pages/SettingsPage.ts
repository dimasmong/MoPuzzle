import { I18n } from '../../core/i18n';
import { Storage } from '../../core/storage';
import { SoundManager } from '../../audio/SoundManager';
import { Modal, Toast } from '../components';
import { Router } from '../router';

export function renderSettingsPage(): string {
  const data = Storage.getData();
  const s = data.settings;

  return `
    <div class="page-settings">
      <div style="margin-bottom: 16px;">
        <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 4px;">${I18n.t('settingsTitle')}</h2>
      </div>

      <!-- General Settings -->
      <div class="card">
        <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 14px;">${I18n.t('generalSettings')}</h3>

        <!-- Language -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <div style="font-size: 14px; font-weight: 600;">${I18n.t('languageLabel')}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${s.language === 'en' ? 'English' : 'Bahasa Indonesia'}</div>
          </div>
          <select id="setting-language" style="
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            color: var(--text-main);
            padding: 8px 12px;
            border-radius: var(--radius-md);
            font-size: 13px;
            font-weight: 600;
          ">
            <option value="en" ${s.language === 'en' ? 'selected' : ''}>English</option>
            <option value="id" ${s.language === 'id' ? 'selected' : ''}>Bahasa Indonesia</option>
          </select>
        </div>

        <!-- Theme -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 14px; font-weight: 600;">${I18n.t('themeLabel')}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${s.theme === 'light' ? I18n.t('lightTheme') : I18n.t('darkTheme')}</div>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-secondary ${s.theme === 'light' ? 'btn-primary' : ''}" id="btn-theme-light" style="padding: 6px 12px; font-size: 13px;">
              ☀️ ${I18n.t('lightTheme')}
            </button>
            <button class="btn btn-secondary ${s.theme === 'dark' ? 'btn-primary' : ''}" id="btn-theme-dark" style="padding: 6px 12px; font-size: 13px;">
              🌙 ${I18n.t('darkTheme')}
            </button>
          </div>
        </div>
      </div>

      <!-- Audio Settings -->
      <div class="card">
        <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 14px;">${I18n.t('audioSettings')}</h3>

        <!-- Music Toggle & Volume -->
        <div style="margin-bottom: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 14px; font-weight: 600;">${I18n.t('musicLabel')}</div>
            <input type="checkbox" id="setting-music-toggle" ${s.musicEnabled ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--primary-color);">
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 12px; color: var(--text-muted); min-width: 80px;">${I18n.t('musicVolumeLabel')}</span>
            <input type="range" id="setting-music-vol" min="0" max="1" step="0.05" value="${s.musicVolume}" style="flex: 1; accent-color: var(--primary-color);">
          </div>
        </div>

        <!-- SFX Toggle & Volume -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 14px; font-weight: 600;">${I18n.t('sfxLabel')}</div>
            <input type="checkbox" id="setting-sfx-toggle" ${s.sfxEnabled ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--primary-color);">
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 12px; color: var(--text-muted); min-width: 80px;">${I18n.t('sfxVolumeLabel')}</span>
            <input type="range" id="setting-sfx-vol" min="0" max="1" step="0.05" value="${s.sfxVolume}" style="flex: 1; accent-color: var(--primary-color);">
          </div>
        </div>
      </div>

      <!-- Display / Accessibility Settings -->
      <div class="card">
        <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 14px;">${I18n.t('displaySettings')}</h3>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 14px; font-weight: 600;">${I18n.t('reducedMotionLabel')}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${I18n.t('reducedMotionHint')}</div>
          </div>
          <input type="checkbox" id="setting-motion-toggle" ${s.reducedMotion ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--primary-color);">
        </div>
      </div>

      <!-- About / App Info -->
      <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 14px; font-weight: 700;">${I18n.t('aboutTitle')}</div>
          <div style="font-size: 12px; color: var(--text-muted);">MoPuzzle v1.0.3 — Think. Solve. Enjoy.</div>
        </div>
        <button class="btn btn-secondary" id="settings-about-btn" style="padding: 6px 14px; font-size: 13px;">
          <span>${I18n.t('aboutTitle')} ➔</span>
        </button>
      </div>

      <!-- Data & Storage Reset -->
      <div class="card" style="border-color: rgba(239, 68, 68, 0.3);">
        <h3 style="font-size: 15px; font-weight: 700; color: #EF4444; margin-bottom: 6px;">${I18n.t('resetProgressLabel')}</h3>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">
          ${I18n.t('resetProgressDesc')}
        </p>
        <button class="btn btn-danger" id="reset-data-btn">
          <span>${I18n.t('resetProgressBtn')}</span>
        </button>
      </div>
    </div>
  `;
}

export function bindSettingsEvents(container: HTMLElement): void {
  container.querySelector('#setting-language')?.addEventListener('change', async (e) => {
    SoundManager.play('click');
    const newLang = (e.target as HTMLSelectElement).value as 'en' | 'id';
    await Storage.updateSettings({ language: newLang });
    I18n.setLanguage(newLang);
  });

  container.querySelector('#btn-theme-light')?.addEventListener('click', async () => {
    SoundManager.play('click');
    await Storage.updateSettings({ theme: 'light' });
    document.documentElement.setAttribute('data-theme', 'light');
    Router.refreshCurrentPage();
  });

  container.querySelector('#btn-theme-dark')?.addEventListener('click', async () => {
    SoundManager.play('click');
    await Storage.updateSettings({ theme: 'dark' });
    document.documentElement.setAttribute('data-theme', 'dark');
    Router.refreshCurrentPage();
  });

  container.querySelector('#setting-music-toggle')?.addEventListener('change', async (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    await Storage.updateSettings({ musicEnabled: checked });
    SoundManager.setMusicEnabled(checked);
  });

  container.querySelector('#setting-music-vol')?.addEventListener('input', async (e) => {
    const val = parseFloat((e.target as HTMLInputElement).value);
    await Storage.updateSettings({ musicVolume: val });
    SoundManager.setMusicVolume(val);
  });

  container.querySelector('#setting-sfx-toggle')?.addEventListener('change', async (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    await Storage.updateSettings({ sfxEnabled: checked });
    SoundManager.setSfxEnabled(checked);
    if (checked) SoundManager.play('click');
  });

  container.querySelector('#setting-sfx-vol')?.addEventListener('input', async (e) => {
    const val = parseFloat((e.target as HTMLInputElement).value);
    await Storage.updateSettings({ sfxVolume: val });
    SoundManager.setSfxVolume(val);
    SoundManager.play('click');
  });

  container.querySelector('#setting-motion-toggle')?.addEventListener('change', async (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    await Storage.updateSettings({ reducedMotion: checked });
    if (checked) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
  });

  container.querySelector('#settings-about-btn')?.addEventListener('click', () => {
    SoundManager.play('click');
    Router.navigate('about');
  });

  // Reset Progress with confirmation
  container.querySelector('#reset-data-btn')?.addEventListener('click', () => {
    SoundManager.play('click');

    const content = `
      <p style="font-size: 14px; line-height: 1.5; color: var(--text-main);">
        ${I18n.t('resetModalDesc')}
      </p>
    `;

    const actions = `
      <button class="btn btn-secondary" id="modal-cancel-reset">
        <span>${I18n.t('cancel')}</span>
      </button>
      <button class="btn btn-danger" id="modal-confirm-reset">
        <span>${I18n.t('confirm')}</span>
      </button>
    `;

    const modalEl = Modal.open(I18n.t('resetModalTitle'), content, actions);

    modalEl.querySelector('#modal-cancel-reset')?.addEventListener('click', () => {
      SoundManager.play('click');
      Modal.close();
    });

    modalEl.querySelector('#modal-confirm-reset')?.addEventListener('click', async () => {
      SoundManager.play('click');
      await Storage.resetAll();
      Modal.close();
      Toast.show(I18n.t('resetConfirmedToast'));
      Router.navigate('home');
    });
  });
}
