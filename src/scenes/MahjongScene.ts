import Phaser from 'phaser';
import confetti from 'canvas-confetti';
import { MahjongEngine, MahjongTile, MahjongSuit } from '../engines/MahjongEngine';
import { SoundManager } from '../audio/SoundManager';
import { Storage } from '../core/storage';
import { Stats } from '../core/stats';
import { Achievements } from '../core/achievements';
import { GameLauncher } from './GameLauncher';
import { Diagnostics } from '../core/diagnostics';

const SUIT_COLORS: Record<MahjongSuit, number> = {
  circle: 0x3B82F6,  // Sapphire Blue
  bamboo: 0x10B981,  // Emerald Green
  gem: 0xEF4444,     // Ruby Red
  wind: 0x8B5CF6,    // Amethyst Purple
  star: 0xF59E0B     // Amber Gold
};

const WIND_LABELS = ['E', 'S', 'W', 'N'];
const STAR_ICONS = ['☀️', '🌙', '⭐', '☄️'];

export class MahjongScene extends Phaser.Scene {
  public engine!: MahjongEngine;
  private tileContainers: Map<string, Phaser.GameObjects.Container> = new Map();
  private onStateChange?: (state: any) => void;
  private timerEvent?: Phaser.Time.TimerEvent;
  private isProcessingMatch = false;

  constructor() {
    super('MahjongScene');
  }

  public init(data: { level?: number; onStateChange?: (state: any) => void } = {}) {
    this.onStateChange = data?.onStateChange || GameLauncher.onStateChangeCallback || undefined;
    const saved = Storage.getActiveGame<any>('mahjong');
    const unlockedLevel = Storage.getData().mahjongUnlockedLevel || 1;
    const requestedLevel = data?.level || GameLauncher.currentDifficulty || (saved && !saved.won ? saved.level : unlockedLevel);
    const validSaved = (saved && !saved.won && (saved.level === undefined || saved.level === requestedLevel)) ? saved : undefined;

    this.engine = new MahjongEngine(requestedLevel, validSaved);
    Stats.recordGameStart('mahjong');

    if (!validSaved) {
      Storage.saveActiveGame('mahjong', this.engine.serialize());
    }

    Diagnostics.log('mahjong_scene_init', {
      requestedLevel,
      unlockedLevel,
      hadValidSaved: !!validSaved,
      tileCount: this.engine.tiles.length
    });
  }

  public create(): void {
    this.renderBoard();

    // Timer loop for stopwatch
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.engine.won) {
          this.engine.elapsedSeconds++;
          this.notifyState();
        }
      },
      loop: true
    });

    this.notifyState();
  }

  public renderBoard(): void {
    this.children.removeAll();
    this.tileContainers.clear();

    const { width, height } = this.scale;
    const tiles = this.engine.tiles;

    // Calculate bounding box of active layout
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const t of tiles) {
      if (t.x < minX) minX = t.x;
      if (t.x + 2 > maxX) maxX = t.x + 2;
      if (t.y < minY) minY = t.y;
      if (t.y + 2 > maxY) maxY = t.y + 2;
    }

    const layoutUnitsW = Math.max(8, maxX - minX);
    const layoutUnitsH = Math.max(6, maxY - minY);

    // Responsive sizing
    const availableW = width * 0.92;
    const availableH = height * 0.72;

    const unitW = availableW / layoutUnitsW;
    const unitH = availableH / layoutUnitsH;
    const unitSize = Math.max(16, Math.min(32, Math.min(unitW, unitH)));

    const tileW = unitSize * 2 - 4;
    const tileH = tileW * 1.32;

    const totalLayoutPxW = layoutUnitsW * unitSize;
    const totalLayoutPxH = layoutUnitsH * unitSize;

    const startX = (width - totalLayoutPxW) / 2;
    const startY = (height - totalLayoutPxH) / 2;

    // Sort tiles by z ascending, then y ascending, then x ascending for proper layering
    const sortedTiles = [...tiles].sort((a, b) => {
      if (a.z !== b.z) return a.z - b.z;
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });

    for (const tile of sortedTiles) {
      if (tile.isRemoved) continue;

      const tx = startX + (tile.x - minX) * unitSize + tileW / 2 - tile.z * 3;
      const ty = startY + (tile.y - minY) * unitSize + tileH / 2 - tile.z * 5;

      const isFree = this.engine.isTileFree(tile.id);
      const isSelected = this.engine.selectedTileId === tile.id;

      const container = this.add.container(tx, isSelected ? ty - 6 : ty);
      container.setData('tileId', tile.id);
      container.setData('baseY', ty);

      // Render 3D Tile visuals
      this.drawTile(container, tile, tileW, tileH, isFree, isSelected);

      if (isFree) {
        container.setSize(tileW, tileH);
        container.setInteractive({ useHandCursor: true });
        container.on('pointerdown', () => this.handleTileClick(tile.id));
      }

      this.tileContainers.set(tile.id, container);
    }
  }

  private drawTile(
    container: Phaser.GameObjects.Container,
    tile: MahjongTile,
    w: number,
    h: number,
    isFree: boolean,
    isSelected: boolean
  ): void {
    const gfx = this.add.graphics();
    const corner = 6;
    const depth = 4;

    // Cast soft shadow underneath
    gfx.fillStyle(0x000000, 0.22);
    gfx.fillRoundedRect(-w / 2 + 2, -h / 2 + 3, w, h + depth, corner);

    // 3D bottom-right side extrusion
    gfx.fillStyle(0x94A3B8, 1);
    gfx.fillRoundedRect(-w / 2, -h / 2 + depth, w, h, corner);

    // Face base (clean cream / ivory tone)
    const faceColor = isSelected ? 0xFEF9C3 : (isFree ? 0xFFFFFF : 0xE2E8F0);
    gfx.fillStyle(faceColor, 1);
    gfx.fillRoundedRect(-w / 2, -h / 2, w, h, corner);

    // Outline
    const strokeColor = isSelected ? 0x2563EB : (isFree ? 0xCBD5E1 : 0x94A3B8);
    gfx.lineStyle(isSelected ? 3 : 1.5, strokeColor, 1);
    gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, corner);

    container.add(gfx);

    // Tile Symbol / Graphic
    this.drawTileFace(container, tile, w, h, isFree);
  }

  private drawTileFace(
    container: Phaser.GameObjects.Container,
    tile: MahjongTile,
    w: number,
    h: number,
    isFree: boolean
  ): void {
    const suit = tile.suit;
    const val = tile.value;
    const color = SUIT_COLORS[suit];
    const alpha = isFree ? 1 : 0.65;

    if (suit === 'circle') {
      const g = this.add.graphics();
      g.fillStyle(color, alpha);
      const rad = Math.min(w, h) * 0.16;
      g.fillCircle(0, 0, rad);
      g.lineStyle(2, 0xFFFFFF, alpha);
      g.strokeCircle(0, 0, rad);
      container.add(g);

      const numTxt = this.add.text(0, 0, val.toString(), {
        fontSize: `${Math.round(w * 0.32)}px`,
        color: '#FFFFFF',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      numTxt.setAlpha(alpha);
      container.add(numTxt);
    } else if (suit === 'bamboo') {
      const g = this.add.graphics();
      g.fillStyle(color, alpha);
      const barW = Math.max(3, w * 0.08);
      const barH = h * 0.44;
      g.fillRoundedRect(-barW / 2, -barH / 2, barW, barH, 2);
      g.lineStyle(1.5, 0x065F46, alpha);
      g.strokeRoundedRect(-barW / 2, -barH / 2, barW, barH, 2);
      container.add(g);

      const numTxt = this.add.text(0, -h * 0.02, val.toString(), {
        fontSize: `${Math.round(w * 0.34)}px`,
        color: '#065F46',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      numTxt.setAlpha(alpha);
      container.add(numTxt);
    } else if (suit === 'gem') {
      const g = this.add.graphics();
      g.fillStyle(color, alpha);
      const r = Math.min(w, h) * 0.22;
      // Diamond polygon
      g.beginPath();
      g.moveTo(0, -r);
      g.lineTo(r, 0);
      g.lineTo(0, r);
      g.lineTo(-r, 0);
      g.closePath();
      g.fillPath();
      container.add(g);

      const numTxt = this.add.text(0, 0, val.toString(), {
        fontSize: `${Math.round(w * 0.3)}px`,
        color: '#FFFFFF',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      numTxt.setAlpha(alpha);
      container.add(numTxt);
    } else if (suit === 'wind') {
      const letter = WIND_LABELS[val - 1] || 'E';
      const txt = this.add.text(0, 0, letter, {
        fontSize: `${Math.round(w * 0.42)}px`,
        color: `#${color.toString(16).padStart(6, '0')}`,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      txt.setAlpha(alpha);
      container.add(txt);
    } else if (suit === 'star') {
      const icon = STAR_ICONS[val - 1] || '⭐';
      const txt = this.add.text(0, 0, icon, {
        fontSize: `${Math.round(w * 0.38)}px`,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }).setOrigin(0.5);
      txt.setAlpha(alpha);
      container.add(txt);
    }
  }

  public handleTileClick(tileId: string): void {
    if (this.isProcessingMatch || this.engine.won) return;

    SoundManager.play('click');
    const result = this.engine.selectTile(tileId);

    if (result.matched && result.removedPair) {
      this.isProcessingMatch = true;
      SoundManager.play('clear');
      Achievements.triggerUnlock('mahjong_first_pair');

      const [id1, id2] = result.removedPair;
      const c1 = this.tileContainers.get(id1);
      const c2 = this.tileContainers.get(id2);

      const targets = [c1, c2].filter(Boolean);

      this.tweens.add({
        targets,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        duration: 220,
        ease: 'Back.easeIn',
        onComplete: () => {
          this.isProcessingMatch = false;

          if (result.win) {
            SoundManager.play('victory');
            Stats.recordVictory('mahjong');
            Storage.setUnlockedMahjongLevel(this.engine.level + 1);

            Achievements.triggerUnlock('mahjong_clear_board');
            if (this.engine.level >= 5) Achievements.triggerUnlock('mahjong_5_levels');
            if (this.engine.level >= 20) Achievements.triggerUnlock('mahjong_all_levels');

            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 }
            });
            Storage.clearActiveGame('mahjong');
          } else {
            Storage.saveActiveGame('mahjong', this.engine.serialize());
          }

          this.renderBoard();
          this.notifyState();
        }
      });
    } else {
      // Re-render board to show new selection state
      this.renderBoard();
      this.notifyState();
      Storage.saveActiveGame('mahjong', this.engine.serialize());
    }
  }

  public advanceToNextLevel(): boolean {
    const prevLevel = this.engine ? this.engine.level : 1;
    const nextLevel = prevLevel + 1;
    if (nextLevel > 20) {
      Diagnostics.log('advance_to_next_mahjong_level_capped', { prevLevel, nextLevel });
      return false;
    }

    if (this.tweens) this.tweens.killAll();
    this.isProcessingMatch = false;

    this.engine.loadLevel(nextLevel);

    Storage.clearActiveGame('mahjong');
    Storage.setUnlockedMahjongLevel(nextLevel);
    Storage.saveActiveGame('mahjong', this.engine.serialize());
    Stats.recordGameStart('mahjong');

    this.renderBoard();
    this.notifyState();

    Diagnostics.log('advance_to_next_mahjong_level_success', {
      prevLevel,
      nextLevel,
      engineWon: this.engine.won
    });

    return true;
  }

  public undoMove(): void {
    if (this.isProcessingMatch) return;
    if (this.engine.undo()) {
      SoundManager.play('click');
      this.renderBoard();
      Storage.saveActiveGame('mahjong', this.engine.serialize());
      this.notifyState();
    }
  }

  public restartGame(): void {
    if (this.isProcessingMatch) return;
    this.engine.restart();
    SoundManager.play('click');
    this.renderBoard();
    Storage.saveActiveGame('mahjong', this.engine.serialize());
    this.notifyState();
  }

  public shuffle(): boolean {
    if (this.isProcessingMatch || this.engine.won) return false;
    const success = this.engine.shuffle();
    if (success) {
      SoundManager.play('click');
      this.renderBoard();
      Storage.saveActiveGame('mahjong', this.engine.serialize());
      this.notifyState();
    }
    return success;
  }

  public showHint(): { id1: string; id2: string } | null {
    if (this.isProcessingMatch || this.engine.won) return null;
    const hint = this.engine.getHint();
    if (hint) {
      SoundManager.play('hint');
      const [t1, t2] = hint;
      const c1 = this.tileContainers.get(t1.id);
      const c2 = this.tileContainers.get(t2.id);

      if (c1 && c2) {
        this.tweens.add({
          targets: [c1, c2],
          scaleX: 1.15,
          scaleY: 1.15,
          yoyo: true,
          repeat: 2,
          duration: 160
        });
      }
      return { id1: t1.id, id2: t2.id };
    }
    return null;
  }

  public shutdown(): void {
    Diagnostics.log('mahjong_scene_shutdown', { level: this.engine?.level });
    this.isProcessingMatch = false;
    if (this.tweens) this.tweens.killAll();
    if (this.timerEvent) {
      this.timerEvent.destroy();
      this.timerEvent = undefined;
    }
    this.tileContainers.forEach(container => {
      container.removeAllListeners();
      container.destroy();
    });
    this.tileContainers.clear();
    this.onStateChange = undefined;
  }

  private notifyState(): void {
    if (this.onStateChange) {
      this.onStateChange({
        level: this.engine.level,
        moves: this.engine.moves,
        time: this.engine.elapsedSeconds,
        remaining: this.engine.getRemainingTileCount(),
        pairsAvailable: this.engine.getAvailablePairs().length,
        won: this.engine.won,
        isStuck: this.engine.isStuck(),
        canUndo: this.engine.canUndo(),
        canShuffle: true
      });
    }
  }
}
