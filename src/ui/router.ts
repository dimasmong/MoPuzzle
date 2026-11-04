import { renderHeader, bindHeaderEvents, renderBottomNav, bindBottomNavEvents, renderFooter } from './components';
import { renderHomePage, bindHomePageEvents } from './pages/HomePage';
import { renderDetailsPage, bindDetailsPageEvents } from './pages/DetailsPage';
import { renderGameplayPage, bindGameplayPageEvents } from './pages/GameplayPage';
import { renderLevelSelectPage, bindLevelSelectEvents } from './pages/LevelSelectPage';
import { renderStatsPage, bindStatsEvents } from './pages/StatsPage';
import { renderAchievementsPage, bindAchievementsEvents } from './pages/AchievementsPage';
import { renderSettingsPage, bindSettingsEvents } from './pages/SettingsPage';
import { renderAboutPage, bindAboutEvents } from './pages/AboutPage';
import { renderFAQPage, bindFAQEvents } from './pages/FAQPage';
import { GameMode } from '../core/types';
import { GameLauncher } from '../scenes/GameLauncher';

export type AppRoute =
  | 'home'
  | 'details'
  | 'play'
  | 'levelselect'
  | 'stats'
  | 'achievements'
  | 'settings'
  | 'about'
  | 'faq';

export interface RouteParams {
  mode?: GameMode;
  difficulty?: any;
}

class RouterService {
  private currentRoute: AppRoute = 'home';
  private currentParams: RouteParams = {};
  private appRoot: HTMLElement | null = null;

  public init(root: HTMLElement): void {
    this.appRoot = root;
    this.render();
  }

  public navigate(route: AppRoute, params: RouteParams = {}): void {
    if (this.currentRoute === 'play' && route !== 'play') {
      GameLauncher.destroy();
    }
    this.currentRoute = route;
    this.currentParams = params;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  public refreshCurrentPage(): void {
    this.render();
  }

  public getCurrentRoute(): AppRoute {
    return this.currentRoute;
  }

  private render(): void {
    if (!this.appRoot) return;

    let pageHtml = '';
    const mode = this.currentParams.mode || 'merge';
    const diff = this.currentParams.difficulty;

    switch (this.currentRoute) {
      case 'home':
        pageHtml = renderHomePage();
        break;
      case 'details':
        pageHtml = renderDetailsPage(mode);
        break;
      case 'play':
        pageHtml = renderGameplayPage(mode, diff);
        break;
      case 'levelselect':
        pageHtml = renderLevelSelectPage();
        break;
      case 'stats':
        pageHtml = renderStatsPage();
        break;
      case 'achievements':
        pageHtml = renderAchievementsPage();
        break;
      case 'settings':
        pageHtml = renderSettingsPage();
        break;
      case 'about':
        pageHtml = renderAboutPage();
        break;
      case 'faq':
        pageHtml = renderFAQPage();
        break;
    }

    const showBottomNav = this.currentRoute !== 'play';

    this.appRoot.innerHTML = `
      ${renderHeader()}
      <main class="app-content" id="main-content">
        ${pageHtml}
      </main>
      ${renderFooter()}
      ${showBottomNav ? renderBottomNav(this.currentRoute) : ''}
    `;

    // Bind common events
    bindHeaderEvents(this.appRoot);
    if (showBottomNav) {
      bindBottomNavEvents(this.appRoot);
    }

    // Bind page specific events
    const contentEl = this.appRoot.querySelector('#main-content') as HTMLElement;
    if (!contentEl) return;

    switch (this.currentRoute) {
      case 'home':
        bindHomePageEvents(contentEl);
        break;
      case 'details':
        bindDetailsPageEvents(contentEl, mode);
        break;
      case 'play':
        bindGameplayPageEvents(contentEl, mode, diff);
        break;
      case 'levelselect':
        bindLevelSelectEvents(contentEl);
        break;
      case 'stats':
        bindStatsEvents(contentEl);
        break;
      case 'achievements':
        bindAchievementsEvents(contentEl);
        break;
      case 'settings':
        bindSettingsEvents(contentEl);
        break;
      case 'about':
        bindAboutEvents(contentEl);
        break;
      case 'faq':
        bindFAQEvents(contentEl);
        break;
    }
  }
}

export const Router = new RouterService();
