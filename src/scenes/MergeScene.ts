import Phaser from 'phaser';
import { MergeEngine, Direction } from '../engines/MergeEngine';
import { SoundManager } from '../audio/SoundManager';
import { Storage } from '../core/storage';
import { Stats } from '../core/stats';
import { Achievements } from '../core/achievements';
import { GameLauncher } from './GameLauncher';

const TILE_COLORS: Record<number, { bg: number; text: string; size: number }> = {
  2: { bg: 0xEEE4DA, text: '#776E65', size: 38 },
  4: { bg: 0xEDE0C8, text: '#776E65', size: 38 },
  8: { bg: 0xF2B179, text: '#F9F6F2', size: 38 },
  16: { bg: 0xF59563, text: '#F9F6F2', size: 34 },
  32: { bg: 0xF67C5F, text: '#F9F6F2', size: 34 },
  64: { bg: 0xF65E3B, text: '#F9F6F2', size: 34 },
  128: { bg: 0xEDCF72, text: '#F9F6F2', size: 30 },
  256: { bg: 0xEDCC61, text: '#F9F6F2', size: 30 },
  512: { bg: 0xEDC850, text: '#F9F6F2', size: 30 },
  1024: { bg: 0xEDC53F, text: '#F9F6F2', size: 24 },
  2048: { bg: 0xEDC22E, text: '#FFFFFF', size: 24 },
  4096: { bg: 0x3C3A32, text: '#FFFFFF', size: 24 },
  8192: { bg: 0x243A73, text: '#FFFFFF', size: 24 }
};

export class MergeScene extends Phaser.Scene {
  public engine!: MergeEngine;
  private boardContainer!: Phaser.GameObjects.Container;
  private tileSize = 70;
  private tileGap = 10;
  private boardOffset = { x: 0, y: 0 };
  private touchStartX = 0;
  private touchStartY = 0;
  private isPointerDown = false;
  private onStateChange?: (state: any) => void;
  private timedTimerEvent?: Phaser.Time.TimerEvent;
  private boundWindowKeyDown?: (e: KeyboardEvent) => void;

  constructor() {
    super('MergeScene');
  }

  public init(data: { mode?: 'classic' | 'timed'; onStateChange?: (state: any) => void } = {}) {
    this.onStateChange = data?.onStateChange || GameLauncher.onStateChangeCallback || undefined;
    const saved = Storage.getActiveGame<any>('merge');
    const mode = data?.mode || GameLauncher.currentDifficulty || (saved?.mode ?? 'classic');
    this.engine = new MergeEngine(mode, saved);
    Stats.recordGameStart('merge');
  }

  public create(): void {
    const { width, height } = this.scale;

    // Responsive board size calculation
    const minDim = Math.min(width, height);
    const targetBoardWidth = Math.min(420, minDim * 0.9);
    this.tileSize = Math.floor((targetBoardWidth - this.tileGap * 5) / 4);
    const totalBoardSize = this.tileSize * 4 + this.tileGap * 5;

    this.boardOffset = {
      x: (width - totalBoardSize) / 2,
      y: (height - totalBoardSize) / 2
    };

    // Draw background board rounded card
    const boardBg = this.add.graphics();
    boardBg.fillStyle(0xBBADA0, 1);
    boardBg.fillRoundedRect(this.boardOffset.x, this.boardOffset.y, totalBoardSize, totalBoardSize, 14);

    // Draw empty cell slots
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const slotX = this.boardOffset.x + this.tileGap + c * (this.tileSize + this.tileGap);
        const slotY = this.boardOffset.y + this.tileGap + r * (this.tileSize + this.tileGap);
        const slot = this.add.graphics();
        slot.fillStyle(0xCDC1B4, 0.7);
        slot.fillRoundedRect(slotX, slotY, this.tileSize, this.tileSize, 8);
      }
    }

    this.boardContainer = this.add.container(0, 0);

    // Setup input: Window & Keyboard
    this.boundWindowKeyDown = (e: KeyboardEvent) => this.handleKeyDown(e);
    window.addEventListener('keydown', this.boundWindowKeyDown);

    // Setup input: Pointer / Touch Swipe
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isPointerDown = true;
      this.touchStartX = pointer.x;
      this.touchStartY = pointer.y;
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.isPointerDown) return;
      this.isPointerDown = false;
      const dx = pointer.x - this.touchStartX;
      const dy = pointer.y - this.touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) > 25) {
        if (absDx > absDy) {
          this.executeMove(dx > 0 ? 'right' : 'left');
        } else {
          this.executeMove(dy > 0 ? 'down' : 'up');
        }
      }
    });

    // Timed mode clock
    if (this.engine.gameMode === 'timed') {
      this.timedTimerEvent = this.time.addEvent({
        delay: 1000,
        callback: () => {
          if (!this.engine.gameOver && !this.engine.won) {
            this.engine.timeRemaining = Math.max(0, this.engine.timeRemaining - 1);
            if (this.engine.timeRemaining === 0) {
              this.engine.gameOver = true;
              SoundManager.play('gameover');
            }
            this.notifyState();
          }
        },
        loop: true
      });
    }

    this.renderBoard(false);
    this.notifyState();
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.engine.gameOver) return;
    let dir: Direction | null = null;
    const key = event.key || event.code;

    if (key === 'ArrowUp' || key === 'KeyW' || key === 'w' || key === 'W') dir = 'up';
    else if (key === 'ArrowDown' || key === 'KeyS' || key === 's' || key === 'S') dir = 'down';
    else if (key === 'ArrowLeft' || key === 'KeyA' || key === 'a' || key === 'A') dir = 'left';
    else if (key === 'ArrowRight' || key === 'KeyD' || key === 'd' || key === 'D') dir = 'right';

    if (dir) {
      this.executeMove(dir);
    }
  }

  public executeMove(dir: Direction): void {
    const result = this.engine.move(dir);
    if (!result.moved) {
      SoundManager.play('invalid');
      return;
    }

    Stats.recordMove('merge');
    Stats.recordScore('merge', this.engine.score);

    if (result.scoreGain > 0) {
      SoundManager.play('merge');
    } else {
      SoundManager.play('slide');
    }

    if (result.won) {
      SoundManager.play('victory');
      Stats.recordVictory('merge');
      Achievements.triggerUnlock('merge_2048');
    } else if (result.gameOver) {
      SoundManager.play('gameover');
    }

    this.renderBoard(true);
    Storage.saveActiveGame('merge', this.engine.serialize());
    this.notifyState();
  }

  public undoMove(): void {
    if (this.engine.undo()) {
      SoundManager.play('click');
      this.renderBoard(false);
      Storage.saveActiveGame('merge', this.engine.serialize());
      this.notifyState();
    }
  }

  public restartGame(): void {
    this.engine.restart();
    SoundManager.play('click');
    this.renderBoard(false);
    Storage.saveActiveGame('merge', this.engine.serialize());
    this.notifyState();
  }

  private renderBoard(animated: boolean): void {
    this.boardContainer.removeAll(true);

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = this.engine.board[r][c];
        if (val > 0) {
          this.createTileObject(r, c, val, animated);
        }
      }
    }
  }

  private createTileObject(row: number, col: number, value: number, animated: boolean): void {
    const x = this.boardOffset.x + this.tileGap + col * (this.tileSize + this.tileGap) + this.tileSize / 2;
    const y = this.boardOffset.y + this.tileGap + row * (this.tileSize + this.tileGap) + this.tileSize / 2;

    const container = this.add.container(x, y);
    const tileStyle = TILE_COLORS[value] || { bg: 0x1E293B, text: '#FFFFFF', size: 22 };

    const bg = this.add.graphics();
    bg.fillStyle(tileStyle.bg, 1);
    bg.fillRoundedRect(-this.tileSize / 2, -this.tileSize / 2, this.tileSize, this.tileSize, 8);

    const text = this.add.text(0, 0, String(value), {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: `${Math.round(tileStyle.size * (this.tileSize / 70))}px`,
      fontStyle: 'bold',
      color: tileStyle.text
    }).setOrigin(0.5);

    container.add([bg, text]);
    this.boardContainer.add(container);

    if (animated) {
      container.setScale(0.2);
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 140,
        ease: 'Back.easeOut'
      });
    }
  }

  private notifyState(): void {
    if (this.onStateChange) {
      this.onStateChange({
        score: this.engine.score,
        moves: this.engine.moves,
        won: this.engine.won,
        gameOver: this.engine.gameOver,
        canUndo: this.engine.canUndo(),
        timeRemaining: this.engine.timeRemaining,
        mode: this.engine.gameMode
      });
    }
  }

  public shutdown(): void {
    if (this.timedTimerEvent) {
      this.timedTimerEvent.destroy();
    }
    if (this.boundWindowKeyDown) {
      window.removeEventListener('keydown', this.boundWindowKeyDown);
    }
    this.input.keyboard?.off('keydown', this.handleKeyDown, this);
  }
}
