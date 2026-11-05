import { I18n } from '../core/i18n';
import { Storage } from '../core/storage';
import { SoundManager } from '../audio/SoundManager';
import { Icons } from './icons';
import { Router } from './router';

export class Toast {
  private static container: HTMLElement | null = null;

  public static show(message: string, duration = 3000): void {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✨</span><span>${message}</span>`;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

export class Modal {
  public static open(title: string, contentHtml: string, actionsHtml: string): HTMLElement {
    this.close();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'active-modal';

    overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="icon-btn" id="modal-close-btn" aria-label="${I18n.t('close')}">
            ${Icons.close}
          </button>
        </div>
        <div class="modal-body">
          ${contentHtml}
        </div>
        <div class="modal-footer" style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
          ${actionsHtml}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Prevent pointer events from falling through to the canvas underneath
    overlay.addEventListener('pointerdown', (e) => e.stopPropagation());
    overlay.addEventListener('pointerup', (e) => e.stopPropagation());
    overlay.addEventListener('mousedown', (e) => e.stopPropagation());
    overlay.addEventListener('mouseup', (e) => e.stopPropagation());

    overlay.querySelector('#modal-close-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundManager.play('click');
      this.close();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        e.stopPropagation();
        SoundManager.play('click');
        this.close();
      }
    });

    return overlay;
  }

  public static close(): void {
    const existing = document.getElementById('active-modal');
    if (existing) {
      existing.remove();
    }
  }
}

export function renderHeader(): string {
  const currentLang = I18n.getLanguage();
  const currentTheme = Storage.getData().settings.theme;

  return `
    <header class="app-header">
      <div class="brand" id="brand-nav">
        <div class="brand-logo" aria-label="MoPuzzle Logo" title="MoPuzzle">
          ${Icons.logo}
        </div>
        <div class="brand-text">
          <h1>${I18n.t('appName')}</h1>
          <p>${I18n.t('tagline')}</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="icon-btn" id="lang-toggle-btn" title="Language" aria-label="Switch Language">
          <span style="font-size: 13px; font-weight: 700;">${currentLang.toUpperCase()}</span>
        </button>
        <button class="icon-btn" id="theme-toggle-btn" title="Theme" aria-label="Toggle Theme">
          <span style="font-size: 16px;">${currentTheme === 'dark' ? '🌙' : '☀️'}</span>
        </button>
        <button class="icon-btn" id="settings-nav-btn" title="${I18n.t('settings')}" aria-label="${I18n.t('settings')}">
          ${Icons.settings}
        </button>
      </div>
    </header>
  `;
}

export function bindHeaderEvents(container: HTMLElement): void {
  container.querySelector('#brand-nav')?.addEventListener('click', () => {
    SoundManager.play('click');
    Router.navigate('home');
  });

  container.querySelector('#lang-toggle-btn')?.addEventListener('click', async () => {
    SoundManager.play('click');
    const newLang = I18n.getLanguage() === 'en' ? 'id' : 'en';
    await Storage.updateSettings({ language: newLang });
    I18n.setLanguage(newLang);
  });

  container.querySelector('#theme-toggle-btn')?.addEventListener('click', async () => {
    SoundManager.play('click');
    const current = Storage.getData().settings.theme;
    const newTheme = current === 'dark' ? 'light' : 'dark';
    await Storage.updateSettings({ theme: newTheme });
    document.documentElement.setAttribute('data-theme', newTheme);
    Router.refreshCurrentPage();
  });

  container.querySelector('#settings-nav-btn')?.addEventListener('click', () => {
    SoundManager.play('click');
    Router.navigate('settings');
  });
}

export function renderBottomNav(activeRoute: string): string {
  const routes = [
    { id: 'home', icon: Icons.home, label: I18n.t('home') },
    { id: 'stats', icon: Icons.stats, label: I18n.t('stats') },
    { id: 'achievements', icon: Icons.trophy, label: I18n.t('achievements') },
    { id: 'settings', icon: Icons.settings, label: I18n.t('settings') }
  ];

  const items = routes
    .map(
      r => `
      <button class="nav-item ${activeRoute === r.id ? 'active' : ''}" data-nav="${r.id}" aria-label="${r.label}">
        ${r.icon}
        <span>${r.label}</span>
      </button>
    `
    )
    .join('');

  return `<nav class="bottom-nav">${items}</nav>`;
}

export function bindBottomNavEvents(container: HTMLElement): void {
  container.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => {
      SoundManager.play('click');
      const target = el.getAttribute('data-nav');
      if (target) {
        Router.navigate(target as any);
      }
    });
  });
}

export function renderFooter(): string {
  return `
    <footer class="app-footer">
      <p style="margin-bottom: 6px;">${I18n.t('footerText')}</p>
      <p>
        <a href="https://github.com/dimasmong/MoPuzzle" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 4px;">
          ${Icons.github}
          <span>github.com/dimasmong/MoPuzzle</span>
        </a>
      </p>
    </footer>
  `;
}
