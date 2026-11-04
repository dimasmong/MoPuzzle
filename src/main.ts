import './styles/main.css';
import './styles/game.css';
import { Storage } from './core/storage';
import { I18n } from './core/i18n';
import { SoundManager } from './audio/SoundManager';
import { Achievements } from './core/achievements';
import { Toast } from './ui/components';
import { Router } from './ui/router';
import { GameLauncher } from './scenes/GameLauncher';

async function bootstrap() {
  const root = document.getElementById('app');
  if (!root) return;

  // 1. Initialize persistent storage
  const saveData = await Storage.init();

  // 2. Set theme and language from persisted settings
  document.documentElement.setAttribute('data-theme', saveData.settings.theme);
  I18n.setLanguage(saveData.settings.language);

  if (saveData.settings.reducedMotion) {
    document.body.classList.add('reduced-motion');
  }

  // 3. React to language changes
  I18n.onChange(() => {
    Router.refreshCurrentPage();
  });

  // 4. React to achievement unlocks with animated toast
  Achievements.onUnlock(ach => {
    const title = I18n.t(ach.titleKey as any);
    Toast.show(I18n.t('achievementUnlockedToast', { title }));
  });

  // 5. Register audio interaction trigger
  const enableAudioOnce = () => {
    SoundManager.registerUserInteraction();
    window.removeEventListener('pointerdown', enableAudioOnce);
    window.removeEventListener('keydown', enableAudioOnce);
  };
  window.addEventListener('pointerdown', enableAudioOnce);
  window.addEventListener('keydown', enableAudioOnce);

  // 6. Register Service Worker for PWA
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(
        reg => {
          console.log('[MoPuzzle PWA] ServiceWorker registered with scope:', reg.scope);
        },
        err => {
          console.warn('[MoPuzzle PWA] ServiceWorker registration failed:', err);
        }
      );
    });
  }

  // 7. Mount Router
  Router.init(root);

  // Expose for testing and inspection
  (window as any).__MOPUZZLE_LAUNCHER__ = GameLauncher;
  (window as any).__MOPUZZLE_ROUTER__ = Router;
}

// Start application
bootstrap();
