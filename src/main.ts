import './styles/main.css';
import './styles/game.css';
import { Storage } from './core/storage';
import { I18n } from './core/i18n';
import { SoundManager } from './audio/SoundManager';
import { Achievements } from './core/achievements';
import { Toast } from './ui/components';
import { Router } from './ui/router';
import { GameLauncher } from './scenes/GameLauncher';
import { Diagnostics } from './core/diagnostics';

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

  // 6. Register Service Worker for PWA with automatic update activation
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(
        reg => {
          Diagnostics.log('sw_registered', { scope: reg.scope });

          // If a new worker is waiting, tell it to skipWaiting
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          // Listen for new service worker installation
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                Diagnostics.log('sw_update_available');
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          });
        },
        err => {
          console.warn('[MoPuzzle PWA] ServiceWorker registration failed:', err);
        }
      );

      // Auto-reload once when the new controller takes over to prevent mixing old and new bundles
      let isRefreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!isRefreshing) {
          isRefreshing = true;
          Diagnostics.log('sw_controller_changed');
          window.location.reload();
        }
      });
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
