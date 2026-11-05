import { I18n } from '../../core/i18n';
import { SoundManager } from '../../audio/SoundManager';
import { Router } from '../router';
import { Icons } from '../icons';

export function renderAboutPage(): string {
  return `
    <div class="page-about">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <button class="icon-btn" id="about-back-btn" aria-label="${I18n.t('back')}">
          ${Icons.back}
        </button>
        <div>
          <h2 style="font-size: 20px; font-weight: 800;">${I18n.t('aboutTitle')}</h2>
          <p style="font-size: 12px; color: var(--text-muted);">${I18n.t('aboutTagline')}</p>
        </div>
      </div>

      <div class="card">
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">
          <div class="brand-logo" style="width: 52px; height: 52px;" aria-label="MoPuzzle Logo" title="MoPuzzle">
            ${Icons.logo}
          </div>
          <div>
            <h3 style="font-size: 18px; font-weight: 800;">MoPuzzle</h3>
            <span style="font-size: 12px; font-weight: 700; background: var(--accent-color); color: #0D1B2A; padding: 2px 8px; border-radius: var(--radius-full);">
              v1.1.0 (Release)
            </span>
          </div>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: var(--text-main); margin-bottom: 18px;">
          ${I18n.t('aboutDesc')}
        </p>

        <div style="border-top: 1px solid var(--card-border); padding-top: 14px; margin-bottom: 14px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">
            ${I18n.t('developerLabel')}
          </div>
          <div style="font-size: 15px; font-weight: 700;">
            ${I18n.t('developerName')}
          </div>
        </div>

        <div style="border-top: 1px solid var(--card-border); padding-top: 14px; margin-bottom: 18px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">
            ${I18n.t('openSourceLabel')}
          </div>
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 10px;">
            ${I18n.t('licenseNotice')}
          </p>
          <ul style="font-size: 12px; color: var(--text-muted); padding-left: 20px; line-height: 1.6;">
            <li>Phaser 3 (MIT License)</li>
            <li>Canvas Confetti (ISC License)</li>
            <li>TypeScript (Apache 2.0)</li>
            <li>Vite (MIT License)</li>
          </ul>
        </div>

        <a href="https://github.com/dimasmong/MoPuzzle" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-block">
          ${Icons.github}
          <span>${I18n.t('viewOnGithub')}</span>
        </a>
      </div>
    </div>
  `;
}

export function bindAboutEvents(container: HTMLElement): void {
  container.querySelector('#about-back-btn')?.addEventListener('click', () => {
    SoundManager.play('click');
    Router.navigate('home');
  });
}
