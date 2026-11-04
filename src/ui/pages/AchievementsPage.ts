import { I18n } from '../../core/i18n';
import { Achievements } from '../../core/achievements';

export function renderAchievementsPage(): string {
  const all = Achievements.getAllAchievements();
  const unlockedCount = all.filter(a => !!a.unlockedAt).length;

  const cardsHtml = all.map(ach => {
    const isUnlocked = !!ach.unlockedAt;
    const progressPercent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

    return `
      <div class="card" style="display: flex; gap: 14px; align-items: flex-start; margin-bottom: 12px; ${isUnlocked ? 'border-color: rgba(16, 185, 129, 0.4);' : 'opacity: 0.8;'}">
        <div style="
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          background: ${isUnlocked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 0, 0, 0.05)'};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        ">
          ${ach.icon}
        </div>
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <div style="font-size: 15px; font-weight: 700; color: var(--text-main);">${I18n.t(ach.titleKey as any)}</div>
            <span style="
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              padding: 2px 6px;
              border-radius: var(--radius-sm);
              background: ${isUnlocked ? '#10B981' : 'rgba(0,0,0,0.1)'};
              color: ${isUnlocked ? '#FFFFFF' : 'var(--text-muted)'};
            ">
              ${isUnlocked ? I18n.t('unlockedBadge') : I18n.t('lockedBadge')}
            </span>
          </div>
          <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
            ${I18n.t(ach.descKey as any)}
          </p>

          <!-- Progress Bar -->
          <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.06); border-radius: 999px; overflow: hidden; margin-bottom: 4px;">
            <div style="width: ${progressPercent}%; height: 100%; background: ${isUnlocked ? '#10B981' : 'var(--primary-color)'}; transition: width 0.3s ease;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); font-weight: 600;">
            <span>${ach.progress} / ${ach.maxProgress}</span>
            ${isUnlocked && ach.unlockedAt ? `<span>${new Date(ach.unlockedAt).toLocaleDateString()}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="page-achievements">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 2px;">${I18n.t('achievementsTitle')}</h2>
          <p style="font-size: 12px; color: var(--text-muted);">${I18n.t('achievementsSubtitle')}</p>
        </div>
        <div style="background: var(--card-bg); border: 1px solid var(--card-border); padding: 6px 12px; border-radius: var(--radius-md); font-size: 13px; font-weight: 700; box-shadow: var(--shadow-sm);">
          🏆 ${unlockedCount} / ${all.length}
        </div>
      </div>

      <div>
        ${cardsHtml}
      </div>
    </div>
  `;
}

export function bindAchievementsEvents(_container: HTMLElement): void {
  // Read-only presentation
}
