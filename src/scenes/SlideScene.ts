import Phaser from 'phaser';
import confetti from 'canvas-confetti';
import { SlideEngine, SlideBoardSize } from '../engines/SlideEngine';
import { SoundManager } from '../audio/SoundManager';
import { Storage } from '../core/storage';
import { Stats } from '../core/stats';
import { Achievements } from '../core/achievements';
import { GameLauncher } from './GameLauncher';

export class SlideScene extends Phaser.Scene {
  public engine!: SlideEngine;
  private boardContainer!: Phaser.GameObjects.Container;
  private tileContainers: { [key: number]: Phaser.GameObjects.Container } = {};
  private tileSize = 80;
  private tileGap = 8;
  private boardOffset = { x: 0, y: 0 };
  private onStateChange?: (state: any) => void;
  private timerEvent?: Phaser.Time.TimerEvent;
  private isSliding = false;
  private boundWindowKeyDown?: (e: KeyboardEvent) => void;

  constructor() {
    super('SlideScene');
  }

  public init(data: { size?: SlideBoardSize; onStateChange?: (state: any) => void } = {}) {
    this.onStateChange = data?.onStateChange || GameLauncher.onStateChangeCallback || undefined;
    const saved = Storage.getActiveGame<any>('slide');
    const requestedSize = data?.size || GameLauncher.currentDifficulty || (saved && !saved.won ? saved.size : 4);
    const validSaved = (saved && !saved.won && (saved.size === undefined || saved.size === requestedSize)) ? saved : undefined;
    this.engine = new SlideEngine(requestedSize, validSaved);
    Stats.recordGameStart('slide');
    if (!validSaved) {
      Storage.saveActiveGame('slide', this.engine.serialize());
    }
  }

  public create(): void {
    const { width, height } = this.scale;
    const size = this.engine.size;

    // Responsive board size calculation
    const minDim = Math.min(width, height);
    const targetBoardWidth = Math.min(420, minDim * 0.9);
    this.tileSize = Math.floor((targetBoardWidth - this.tileGap * (size + 1)) / size);
    const totalBoardSize = this.tileSize * size + this.tileGap * (size + 1);

    this.boardOffset = {
      x: (width - totalBoardSize) / 2,
      y: (height - totalBoardSize) / 2
    };

    // Draw board frame
    const boardBg = this.add.graphics();
    boardBg.fillStyle(0x1E293B, 1);
    boardBg.fillRoundedRect(this.boardOffset.x, this.boardOffset.y, totalBoardSize, totalBoardSize, 14);

    this.boardContainer = this.add.container(0, 0);

    // Keyboard support: Window & Keyboard
    this.boundWindowKeyDown = (e: KeyboardEvent) => this.handleKeyDown(e);
    window.addEventListener('keydown', this.boundWindowKeyDown);

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

    this.renderTiles(false);
    this.notifyState();
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.engine.won || this.isSliding) return;
    let dir: 'up' | 'down' | 'left' | 'right' | null = null;
    const key = event.key || event.code;

    if (key === 'ArrowUp' || key === 'KeyW' || key === 'w' || key === 'W') dir = 'up';
    else if (key === 'ArrowDown' || key === 'KeyS' || key === 's' || key === 'S') dir = 'down';
    else if (key === 'ArrowLeft' || key === 'KeyA' || key === 'a' || key === 'A') dir = 'left';
    else if (key === 'ArrowRight' || key === 'KeyD' || key === 'd' || key === 'D') dir = 'right';

    if (dir) {
      const res = this.engine.slideDirection(dir);
      if (res.moved) {
        this.onTileMoved(res.tileValue, res.emptyIndex, res.won);
      } else {
        SoundManager.play('invalid');
      }
    }
  }

  public renderTiles(animated: boolean): void {
    this.boardContainer.removeAll(true);
    this.tileContainers = {};

    const size = this.engine.size;
    for (let i = 0; i < this.engine.tiles.length; i++) {
      const val = this.engine.tiles[i];
      if (val === 0) continue; // Blank slot

      const row = Math.floor(i / size);
      const col = i % size;
      const x = this.boardOffset.x + this.tileGap + col * (this.tileSize + this.tileGap) + this.tileSize / 2;
      const y = this.boardOffset.y + this.tileGap + row * (this.tileSize + this.tileGap) + this.tileSize / 2;

      const container = this.add.container(x, y);

      // Tile graphics: subtle bevel, gradient primary
      const bg = this.add.graphics();
      bg.fillStyle(0x243A73, 1);
      bg.fillRoundedRect(-this.tileSize / 2, -this.tileSize / 2, this.tileSize, this.tileSize, 10);

      // Subtle top highlight
      bg.fillStyle(0xA1E3F9, 0.3);
      bg.fillRoundedRect(-this.tileSize / 2 + 3, -this.tileSize / 2 + 3, this.tileSize - 6, 8, 4);

      const text = this.add.text(0, 0, String(val), {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: `${Math.round(this.tileSize * 0.42)}px`,
        fontStyle: 'bold',
        color: '#FFFFFF'
      }).setOrigin(0.5);

      container.add([bg, text]);
      container.setSize(this.tileSize, this.tileSize);
      container.setInteractive({ useHandCursor: true });

      const tileVal = val;
      container.on('pointerdown', () => this.handleTileClick(tileVal));

      this.boardContainer.add(container);
      this.tileContainers[val] = container;

      if (animated) {
        container.setScale(0.8);
        this.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 150
        });
      }
    }
  }

  public handleTileClick(tileValue: number): void {
    if (this.engine.won || this.isSliding) return;
    const tileIdx = this.engine.tiles.indexOf(tileValue);
    if (tileIdx === -1) return;

    const res = this.engine.slideTile(tileIdx);
    if (!res.moved) {
      SoundManager.play('invalid');
      const container = this.tileContainers[tileValue];
      if (container) {
        const origX = container.x;
        this.tweens.add({
          targets: container,
          x: origX - 4,
          duration: 40,
          yoyo: true,
          repeat: 2,
          onComplete: () => { container.x = origX; }
        });
      }
      return;
    }

    this.onTileMoved(tileValue, res.emptyIndex, res.won);
  }

  private onTileMoved(tileValue: number, newEmptyTargetIdx: number, won: boolean): void {
    this.isSliding = true;
    SoundManager.play('slide');
    Stats.recordMove('slide');

    const size = this.engine.size;
    const targetRow = Math.floor(newEmptyTargetIdx / size);
    const targetCol = newEmptyTargetIdx % size;
    const targetX = this.boardOffset.x + this.tileGap + targetCol * (this.tileSize + this.tileGap) + this.tileSize / 2;
    const targetY = this.boardOffset.y + this.tileGap + targetRow * (this.tileSize + this.tileGap) + this.tileSize / 2;

    const container = this.tileContainers[tileValue];
    if (container) {
      this.tweens.add({
        targets: container,
        x: targetX,
        y: targetY,
        duration: 90,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          this.isSliding = false;
          if (won) {
            this.handleVictory();
          } else {
            Storage.saveActiveGame('slide', this.engine.serialize());
            this.notifyState();
          }
        }
      });
    } else {
      this.isSliding = false;
    }
  }

  private handleVictory(): void {
    if (this.timerEvent) {
      this.timerEvent.destroy();
      this.timerEvent = undefined;
    }
    SoundManager.play('victory');
    Stats.recordVictory('slide', this.engine.elapsedSeconds);
    Achievements.triggerUnlock('first_step');

    if (this.engine.size === 3) Achievements.triggerUnlock('slide_3x3');
    if (this.engine.size === 4) Achievements.triggerUnlock('slide_4x4');
    if (this.engine.elapsedSeconds > 0 && this.engine.elapsedSeconds <= 60) {
      Achievements.triggerUnlock('slide_speed');
    }

    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 }
    });

    Storage.clearActiveGame('slide');
    this.notifyState();
  }

  public restartGame(): void {
    this.engine.restart();
    SoundManager.play('click');
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }
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
    this.renderTiles(true);
    Storage.saveActiveGame('slide', this.engine.serialize());
    this.notifyState();
  }

  private notifyState(): void {
    if (this.onStateChange) {
      const stats = Storage.getData().stats.slide;
      this.onStateChange({
        moves: this.engine.moves,
        elapsedSeconds: this.engine.elapsedSeconds,
        bestTime: stats.bestTimeSeconds,
        won: this.engine.won,
        size: this.engine.size
      });
    }
  }

  public shutdown(): void {
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }
    if (this.boundWindowKeyDown) {
      window.removeEventListener('keydown', this.boundWindowKeyDown);
    }
    this.input.keyboard?.off('keydown', this.handleKeyDown, this);
  }
}
