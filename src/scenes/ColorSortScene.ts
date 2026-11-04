import Phaser from 'phaser';
import confetti from 'canvas-confetti';
import { ColorSortEngine, COLOR_PALETTE } from '../engines/ColorSortEngine';
import { SoundManager } from '../audio/SoundManager';
import { Storage } from '../core/storage';
import { Stats } from '../core/stats';
import { Achievements } from '../core/achievements';
import { GameLauncher } from './GameLauncher';

export class ColorSortScene extends Phaser.Scene {
  public engine!: ColorSortEngine;
  private selectedTubeIndex: number | null = null;
  private tubeContainers: Phaser.GameObjects.Container[] = [];
  private tubeWidth = 52;
  private tubeHeight = 170;
  private onStateChange?: (state: any) => void;
  private isAnimatingPour = false;

  constructor() {
    super('ColorSortScene');
  }

  public init(data: { level?: number; onStateChange?: (state: any) => void } = {}) {
    this.onStateChange = data?.onStateChange || GameLauncher.onStateChangeCallback || undefined;
    const saved = Storage.getActiveGame<any>('colorsort');
    const level = data?.level || GameLauncher.currentDifficulty || (saved?.level ?? 1);
    this.engine = new ColorSortEngine(level, saved);
    Stats.recordGameStart('colorsort');
  }

  public create(): void {
    this.renderTubes();
    this.notifyState();
  }

  public renderTubes(): void {
    this.children.removeAll();
    this.tubeContainers = [];
    this.selectedTubeIndex = null;

    const { width, height } = this.scale;
    const tubeCount = this.engine.getTubeCount();

    // Determine layout: 1 row if <= 6 tubes, 2 rows if > 6
    const rows = tubeCount > 6 ? 2 : 1;
    const tubesPerRow = Math.ceil(tubeCount / rows);

    // Responsive tube dimensions
    const maxAllowedWidth = Math.min(width * 0.9 / tubesPerRow, 70);
    this.tubeWidth = Math.max(38, Math.min(54, maxAllowedWidth - 14));
    this.tubeHeight = Math.max(120, Math.min(180, this.tubeWidth * 3.2));

    const layerHeight = (this.tubeHeight - 14) / this.engine.tubeCapacity;
    const gapX = Math.max(12, (width * 0.92 - tubesPerRow * this.tubeWidth) / (tubesPerRow + 1));
    const centerY = height * 0.48;

    for (let i = 0; i < tubeCount; i++) {
      const rowIndex = Math.floor(i / tubesPerRow);
      const colIndex = i % tubesPerRow;

      // Adjust startX for second row if it has fewer tubes to keep centered
      const countInThisRow = rowIndex === 0 ? tubesPerRow : tubeCount - tubesPerRow;
      const thisRowWidth = countInThisRow * this.tubeWidth + (countInThisRow - 1) * gapX;
      const rowStartX = (width - thisRowWidth) / 2;

      const tx = rowStartX + colIndex * (this.tubeWidth + gapX) + this.tubeWidth / 2;
      const ty = rows === 1
        ? centerY
        : centerY + (rowIndex === 0 ? -this.tubeHeight * 0.65 : this.tubeHeight * 0.65);

      const container = this.add.container(tx, ty);

      // Glass tube body graphics
      const glass = this.add.graphics();
      this.drawGlassTube(glass, this.tubeWidth, this.tubeHeight);

      // Liquid layers graphics
      const liquid = this.add.graphics();
      this.drawLiquidLayers(liquid, this.engine.getTube(i), layerHeight);

      container.add([liquid, glass]);
      container.setSize(this.tubeWidth + 16, this.tubeHeight + 20);
      container.setInteractive({ useHandCursor: true });

      const tubeIdx = i;
      container.on('pointerdown', () => this.handleTubeClick(tubeIdx));

      this.tubeContainers.push(container);
    }
  }

  private drawGlassTube(graphics: Phaser.GameObjects.Graphics, w: number, h: number): void {
    graphics.clear();
    const halfW = w / 2;
    const halfH = h / 2;
    const cornerRadius = w / 2;

    // Subtle glass background fill
    graphics.fillStyle(0xFFFFFF, 0.12);
    graphics.fillRoundedRect(-halfW, -halfH, w, h, { tl: 4, tr: 4, bl: cornerRadius, br: cornerRadius });

    // Glass stroke reflection
    graphics.lineStyle(3, 0xFFFFFF, 0.65);
    graphics.strokeRoundedRect(-halfW, -halfH, w, h, { tl: 4, tr: 4, bl: cornerRadius, br: cornerRadius });

    // Test tube rim lip at top
    graphics.fillStyle(0xFFFFFF, 0.85);
    graphics.fillRoundedRect(-halfW - 3, -halfH - 2, w + 6, 6, 3);
  }

  private drawLiquidLayers(graphics: Phaser.GameObjects.Graphics, colors: number[], layerHeight: number): void {
    graphics.clear();
    const w = this.tubeWidth - 6;
    const halfW = w / 2;
    const bottomY = this.tubeHeight / 2 - 4;
    const cornerRadius = (this.tubeWidth - 6) / 2;

    for (let layerIdx = 0; layerIdx < colors.length; layerIdx++) {
      const colorId = colors[layerIdx];
      const colorHex = COLOR_PALETTE[(colorId - 1) % COLOR_PALETTE.length];
      const numColor = parseInt(colorHex.replace('#', '0x'), 16);

      const y = bottomY - (layerIdx + 1) * layerHeight;
      graphics.fillStyle(numColor, 0.95);

      if (layerIdx === 0) {
        // Bottom layer with rounded bottom corners
        graphics.fillRoundedRect(-halfW, y, w, layerHeight, { tl: 3, tr: 3, bl: cornerRadius, br: cornerRadius });
      } else {
        graphics.fillRoundedRect(-halfW, y, w, layerHeight, 3);
      }
    }
  }

  public handleTubeClick(index: number): void {
    if (this.isAnimatingPour || this.engine.won) return;

    if (this.selectedTubeIndex === null) {
      // First selection: source tube
      if (this.engine.getTube(index).length === 0) {
        SoundManager.play('invalid');
        return;
      }
      this.selectedTubeIndex = index;
      SoundManager.play('click');
      this.liftTube(index, true);
    } else if (this.selectedTubeIndex === index) {
      // Deselect clicked tube
      this.liftTube(index, false);
      this.selectedTubeIndex = null;
      SoundManager.play('click');
    } else {
      // Target tube selected: attempt pour
      const from = this.selectedTubeIndex;
      const to = index;

      if (!this.engine.canPour(from, to)) {
        SoundManager.play('invalid');
        this.shakeTube(this.tubeContainers[to]);
        return;
      }

      this.executePourAnimation(from, to);
    }
  }

  private liftTube(index: number, lift: boolean): void {
    const container = this.tubeContainers[index];
    if (!container) return;

    this.tweens.add({
      targets: container,
      y: lift ? container.y - 24 : container.y + 24,
      duration: 120,
      ease: 'Quad.easeOut'
    });
  }

  private shakeTube(container: Phaser.GameObjects.Container): void {
    const origX = container.x;
    this.tweens.add({
      targets: container,
      x: origX - 6,
      duration: 40,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        container.x = origX;
      }
    });
  }

  private executePourAnimation(from: number, to: number): void {
    this.isAnimatingPour = true;
    const fromContainer = this.tubeContainers[from];
    const toContainer = this.tubeContainers[to];

    const result = this.engine.pour(from, to);
    Stats.recordMove('colorsort');
    SoundManager.play('pour');

    // Tilt source towards target
    const tiltAngle = toContainer.x > fromContainer.x ? 35 : -35;

    this.tweens.add({
      targets: fromContainer,
      angle: tiltAngle,
      x: fromContainer.x + (toContainer.x > fromContainer.x ? 18 : -18),
      duration: 200,
      ease: 'Quad.easeInOut',
      onComplete: () => {
        // Redraw liquids
        this.renderTubes();

        if (result.won) {
          SoundManager.play('victory');
          Stats.recordVictory('colorsort');
          Storage.setUnlockedColorSortLevel(this.engine.level + 1);

          Achievements.triggerUnlock('first_step');
          if (this.engine.level >= 5) Achievements.triggerUnlock('color_5');
          if (this.engine.level >= 15) Achievements.triggerUnlock('color_15');
          if (this.engine.moves <= this.engine.level * 4) Achievements.triggerUnlock('color_no_undo');

          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        }

        Storage.saveActiveGame('colorsort', this.engine.serialize());
        this.notifyState();
        this.isAnimatingPour = false;
      }
    });
  }

  public undoMove(): void {
    if (this.isAnimatingPour) return;
    if (this.engine.undo()) {
      SoundManager.play('click');
      this.renderTubes();
      Storage.saveActiveGame('colorsort', this.engine.serialize());
      this.notifyState();
    }
  }

  public restartGame(): void {
    if (this.isAnimatingPour) return;
    this.engine.restart();
    SoundManager.play('click');
    this.renderTubes();
    Storage.saveActiveGame('colorsort', this.engine.serialize());
    this.notifyState();
  }

  public showHint(): { from: number; to: number } | null {
    if (this.isAnimatingPour || this.engine.won) return null;
    const hint = this.engine.getHint();
    if (hint) {
      SoundManager.play('hint');
      const fromC = this.tubeContainers[hint.fromTube];
      const toC = this.tubeContainers[hint.toTube];
      if (fromC && toC) {
        this.tweens.add({
          targets: [fromC, toC],
          scaleX: 1.12,
          scaleY: 1.12,
          yoyo: true,
          repeat: 2,
          duration: 150
        });
      }
      return { from: hint.fromTube + 1, to: hint.toTube + 1 };
    }
    return null;
  }

  private notifyState(): void {
    if (this.onStateChange) {
      this.onStateChange({
        level: this.engine.level,
        moves: this.engine.moves,
        won: this.engine.won,
        canUndo: this.engine.canUndo()
      });
    }
  }
}
