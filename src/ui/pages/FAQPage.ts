import { I18n } from '../../core/i18n';
import { SoundManager } from '../../audio/SoundManager';
import { Router } from '../router';
import { Icons } from '../icons';

export function renderFAQPage(): string {
  const faqs = [
    { q: 'faq1Q', a: 'faq1A' },
    { q: 'faq2Q', a: 'faq2A' },
    { q: 'faq3Q', a: 'faq3A' },
    { q: 'faq4Q', a: 'faq4A' },
    { q: 'faq5Q', a: 'faq5A' }
  ];

  const faqItemsHtml = faqs.map((f, idx) => `
    <div class="card" style="margin-bottom: 12px; padding: 16px;">
      <h3 style="font-size: 15px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">
        ${idx + 1}. ${I18n.t(f.q as any)}
      </h3>
      <p style="font-size: 13px; line-height: 1.6; color: var(--text-muted);">
        ${I18n.t(f.a as any)}
      </p>
    </div>
  `).join('');

  return `
    <div class="page-faq">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <button class="icon-btn" id="faq-back-btn" aria-label="${I18n.t('back')}">
          ${Icons.back}
        </button>
        <div>
          <h2 style="font-size: 20px; font-weight: 800;">${I18n.t('faqTitle')}</h2>
          <p style="font-size: 12px; color: var(--text-muted);">${I18n.t('appName')}</p>
        </div>
      </div>

      <div>
        ${faqItemsHtml}
      </div>
    </div>
  `;
}

export function bindFAQEvents(container: HTMLElement): void {
  container.querySelector('#faq-back-btn')?.addEventListener('click', () => {
    SoundManager.play('click');
    Router.navigate('home');
  });
}
