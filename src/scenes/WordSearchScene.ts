import Phaser from 'phaser';
import confetti from 'canvas-confetti';
import { WordSearchEngine } from '../engines/WordSearchEngine';
import { SoundManager } from '../audio/SoundManager';
import { Storage } from '../core/storage';
import { Stats } from '../core/stats';
import { Achievements } from '../core/achievements';
import { GameLauncher } from './GameLauncher';
import { Diagnostics } from '../core/diagnostics';
import { Language } from '../core/types';

const FOUND_COLORS = [
  0x10B981, // Emerald Green
  0x3B82F6, // Blue
  0xF59E0B, // Amber
  0x8B5CF6, // Purple
  0xEC4899, // Pink
  0x06B6D4, // Cyan
  0xF97316, // Orange
  0x14B8A6, // Teal
  0x6366F1, // Indigo
  0x84CC16  // Lime
];

export class WordSearchScene extends Phaser.Scene {
  public engine!: WordSearchEngine;
  private onStateChange?: (state: any) => void;
  private timerEvent?: Phaser.Time.TimerEvent;

  private gridBgGraphics!: Phaser.GameObjects.Graphics;
  private highlightsGraphics!: Phaser.GameObjects.Graphics;
  private previewGraphics!: Phaser.GameObjects.Graphics;

  private cellSize = 38;
  private boardOffset = { x: 0, y: 0 };
  private startCell: [number, number] | null = null;
  private currentCell: [number, number] | null = null;
  private isSelecting = false;

  constructor() {
    super('WordSearchScene');
  }

  public init(data: { level?: number; language?: Language; onStateChange?: (state: any) => void } = {}) {
    this.onStateChange = data?.onStateChange || GameLauncher.onStateChangeCallback || undefined;
    const currentLang = Storage.getData().settings.language || 'en';
    const lang = data?.language || currentLang;

    const saved = Storage.getActiveGame<any>('wordsearch');
    const unlockedLevel = Storage.getUnlockedWordSearchLevel(lang);
    const requestedLevel = data?.level || GameLauncher.currentDifficulty || (saved && !saved.won ? saved.level : unlockedLevel);
    const validSaved = (saved && !saved.won && (saved.level === undefined || saved.level === requestedLevel) && (saved.language === undefined || saved.language === lang)) ? saved : undefined;

    this.engine = new WordSearchEngine(requestedLevel, lang, validSaved);
    Stats.recordGameStart('wordsearch');

    if (!validSaved) {
      Storage.saveActiveGame('wordsearch', this.engine.serialize());
    }

    Diagnostics.log('wordsearch_scene_init', {
      requestedLevel,
      lang,
      unlockedLevel,
      wordsCount: this.engine.targetWords.length
    });
  }

  public create(): void {
    const { width, height } = this.scale;
    const size = this.engine.size;

    // Responsive board layout
    const maxBoardDim = Math.min(width * 0.94, height * 0.74);
    this.cellSize = Math.floor(maxBoardDim / size);
    const totalSize = this.cellSize * size;

    this.boardOffset = {
      x: (width - totalSize) / 2,
      y: (height - totalSize) / 2
    };

    // 1. Grid background
    this.gridBgGraphics = this.add.graphics();
    this.drawGridBackground(totalSize);

    // 2. Persistent found word highlight overlay
    this.highlightsGraphics = this.add.graphics();

    // 3. Selection preview line
    this.previewGraphics = this.add.graphics();

    // 4. Render letters
    this.renderLetters();

    // 5. Draw existing found words
    this.drawFoundHighlights();

    // 6. Setup Pointer Events
    this.setupPointerEvents(totalSize);

    // 7. Timer loop
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

  private drawGridBackground(totalSize: number): void {
    const { x, y } = this.boardOffset;
    const size = this.engine.size;

    this.gridBgGraphics.clear();

    // Board background card
    this.gridBgGraphics.fillStyle(0x0F172A, 0.04);
    this.gridBgGraphics.fillRoundedRect(x - 8, y - 8, totalSize + 16, totalSize + 16, 16);
    this.gridBgGraphics.lineStyle(2, 0xE2E8F0, 1);
    this.gridBgGraphics.strokeRoundedRect(x - 8, y - 8, totalSize + 16, totalSize + 16, 16);

    // Light cell dividers / grid lines
    this.gridBgGraphics.lineStyle(1, 0xF1F5F9, 0.8);
    for (let i = 1; i < size; i++) {
      // Horizontal lines
      this.gridBgGraphics.lineBetween(x, y + i * this.cellSize, x + totalSize, y + i * this.cellSize);
      // Vertical lines
      this.gridBgGraphics.lineBetween(x + i * this.cellSize, y, x + i * this.cellSize, y + totalSize);
    }
  }

  private renderLetters(): void {
    const { x, y } = this.boardOffset;
    const size = this.engine.size;
    const fontSize = Math.max(14, Math.min(26, Math.floor(this.cellSize * 0.52)));

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const char = this.engine.grid[r][c];
        const cx = x + c * this.cellSize + this.cellSize / 2;
        const cy = y + r * this.cellSize + this.cellSize / 2;

        this.add.text(cx, cy, char, {
          fontSize: `${fontSize}px`,
          color: '#1E293B',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontStyle: 'bold'
        }).setOrigin(0.5);
      }
    }
  }

  private setupPointerEvents(totalSize: number): void {
    const { x, y } = this.boardOffset;

    // Interactive zone covering the board
    const zone = this.add.zone(x + totalSize / 2, y + totalSize / 2, totalSize, totalSize);
    zone.setInteractive({ useHandCursor: true });

    zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.engine.won) return;
      const cell = this.getCellFromPointer(pointer);
      if (cell) {
        this.isSelecting = true;
        this.startCell = cell;
        this.currentCell = cell;
        this.drawPreview();
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isSelecting || !this.startCell) return;
      const cell = this.getCellFromPointer(pointer);
      if (cell && (!this.currentCell || cell[0] !== this.currentCell[0] || cell[1] !== this.currentCell[1])) {
        this.currentCell = cell;
        this.drawPreview();
      }
    });

    const endSelection = () => {
      if (!this.isSelecting || !this.startCell || !this.currentCell) {
        this.isSelecting = false;
        this.startCell = null;
        this.currentCell = null;
        this.previewGraphics.clear();
        return;
      }

      const start = this.startCell;
      const end = this.currentCell;
      this.isSelecting = false;
      this.startCell = null;
      this.currentCell = null;
      this.previewGraphics.clear();

      this.processSelection(start, end);
    };

    zone.on('pointerup', endSelection);
    this.input.on('pointerup', endSelection);
  }

  private getCellFromPointer(pointer: Phaser.Input.Pointer): [number, number] | null {
    const { x, y } = this.boardOffset;
    const relX = pointer.x - x;
    const relY = pointer.y - y;
    const size = this.engine.size;

    if (relX < 0 || relX >= size * this.cellSize || relY < 0 || relY >= size * this.cellSize) {
      return null;
    }

    const c = Math.floor(relX / this.cellSize);
    const r = Math.floor(relY / this.cellSize);

    if (r >= 0 && r < size && c >= 0 && c < size) {
      return [r, c];
    }

    return null;
  }

  private drawPreview(): void {
    this.previewGraphics.clear();
    if (!this.startCell || !this.currentCell) return;

    const [r1, c1] = this.startCell;
    const [r2, c2] = this.currentCell;

    const dr = r2 - r1;
    const dc = c2 - c1;

    // Check if straight line
    const isHorizontal = dr === 0 && dc !== 0;
    const isVertical = dc === 0 && dr !== 0;
    const isDiagonal = Math.abs(dr) === Math.abs(dc) && dr !== 0;

    const { x, y } = this.boardOffset;
    const startX = x + c1 * this.cellSize + this.cellSize / 2;
    const startY = y + r1 * this.cellSize + this.cellSize / 2;

    if (!isHorizontal && !isVertical && !isDiagonal) {
      // Just highlight the start circle
      this.previewGraphics.fillStyle(0x3B82F6, 0.35);
      this.previewGraphics.fillCircle(startX, startY, this.cellSize * 0.44);
      return;
    }

    const endX = x + c2 * this.cellSize + this.cellSize / 2;
    const endY = y + r2 * this.cellSize + this.cellSize / 2;

    // Draw active capsule preview line
    this.previewGraphics.lineStyle(this.cellSize * 0.78, 0x3B82F6, 0.45);
    this.previewGraphics.lineBetween(startX, startY, endX, endY);
    this.previewGraphics.fillStyle(0x3B82F6, 0.45);
    this.previewGraphics.fillCircle(startX, startY, this.cellSize * 0.39);
    this.previewGraphics.fillCircle(endX, endY, this.cellSize * 0.39);
  }

  public processSelection(start: [number, number], end: [number, number]): void {
    const result = this.engine.checkSelection(start, end);

    if (result.success && result.word) {
      SoundManager.play('clear');
      Achievements.triggerUnlock('word_first_found');

      if (this.engine.foundWords.length >= 100) {
        Achievements.triggerUnlock('word_100_found');
      }

      if (result.won) {
        SoundManager.play('victory');
        Stats.recordVictory('wordsearch');

        if (this.engine.language === 'id') {
          Storage.setUnlockedWordSearchLevel('id', this.engine.level + 1);
        } else {
          Storage.setUnlockedWordSearchLevel('en', this.engine.level + 1);
        }

        Achievements.triggerUnlock('word_first_puzzle');
        if (this.engine.level >= 20) {
          Achievements.triggerUnlock('word_all_levels');
        }

        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
        Storage.clearActiveGame('wordsearch');
      } else {
        Storage.saveActiveGame('wordsearch', this.engine.serialize());
      }

      this.drawFoundHighlights();
      this.notifyState();
    } else if (result.alreadyFound) {
      SoundManager.play('click');
    }
  }

  private drawFoundHighlights(): void {
    this.highlightsGraphics.clear();
    const { x, y } = this.boardOffset;

    let colorIdx = 0;
    for (const tw of this.engine.targetWords) {
      if (tw.found && tw.path && tw.path.length > 0) {
        const color = FOUND_COLORS[colorIdx % FOUND_COLORS.length];
        colorIdx++;

        const pStart = tw.path[0];
        const pEnd = tw.path[tw.path.length - 1];

        const sx = x + pStart[1] * this.cellSize + this.cellSize / 2;
        const sy = y + pStart[0] * this.cellSize + this.cellSize / 2;
        const ex = x + pEnd[1] * this.cellSize + this.cellSize / 2;
        const ey = y + pEnd[0] * this.cellSize + this.cellSize / 2;

        this.highlightsGraphics.lineStyle(this.cellSize * 0.74, color, 0.4);
        this.highlightsGraphics.lineBetween(sx, sy, ex, ey);
        this.highlightsGraphics.fillStyle(color, 0.4);
        this.highlightsGraphics.fillCircle(sx, sy, this.cellSize * 0.37);
        this.highlightsGraphics.fillCircle(ex, ey, this.cellSize * 0.37);
      }
    }
  }

  public advanceToNextLevel(): boolean {
    const prevLevel = this.engine ? this.engine.level : 1;
    const nextLevel = prevLevel + 1;
    if (nextLevel > 20) {
      Diagnostics.log('advance_to_next_wordsearch_level_capped', { prevLevel, nextLevel });
      return false;
    }

    if (this.tweens) this.tweens.killAll();
    this.isSelecting = false;
    this.startCell = null;
    this.currentCell = null;

    this.engine.loadLevel(nextLevel, this.engine.language);

    Storage.clearActiveGame('wordsearch');
    if (this.engine.language === 'id') {
      Storage.setUnlockedWordSearchLevel('id', nextLevel);
    } else {
      Storage.setUnlockedWordSearchLevel('en', nextLevel);
    }
    Storage.saveActiveGame('wordsearch', this.engine.serialize());
    Stats.recordGameStart('wordsearch');

    // Re-create the board with new grid dimensions
    this.children.removeAll();
    this.create();

    Diagnostics.log('advance_to_next_wordsearch_level_success', {
      prevLevel,
      nextLevel,
      engineWon: this.engine.won
    });

    return true;
  }

  public restartGame(): void {
    if (this.tweens) this.tweens.killAll();
    this.isSelecting = false;
    this.startCell = null;
    this.currentCell = null;

    this.engine.restart();
    SoundManager.play('click');
    Storage.saveActiveGame('wordsearch', this.engine.serialize());

    this.children.removeAll();
    this.create();
  }

  public showHint(): { word: string; start: [number, number]; end: [number, number] } | null {
    if (this.engine.won) return null;
    const hint = this.engine.getHint();
    if (hint) {
      SoundManager.play('hint');
      const { x, y } = this.boardOffset;
      const sx = x + hint.start[1] * this.cellSize + this.cellSize / 2;
      const sy = y + hint.start[0] * this.cellSize + this.cellSize / 2;

      // Pulse first letter
      const flash = this.add.circle(sx, sy, this.cellSize * 0.44, 0xFBBF24, 0.7);
      this.tweens.add({
        targets: flash,
        scaleX: 1.35,
        scaleY: 1.35,
        alpha: 0,
        duration: 500,
        repeat: 3,
        onComplete: () => flash.destroy()
      });

      return { word: hint.word, start: hint.start, end: hint.end };
    }
    return null;
  }

  public shutdown(): void {
    Diagnostics.log('wordsearch_scene_shutdown', { level: this.engine?.level });
    this.isSelecting = false;
    if (this.tweens) this.tweens.killAll();
    if (this.timerEvent) {
      this.timerEvent.destroy();
      this.timerEvent = undefined;
    }
    this.input.removeAllListeners();
    this.onStateChange = undefined;
  }

  private notifyState(): void {
    if (this.onStateChange) {
      this.onStateChange({
        level: this.engine.level,
        language: this.engine.language,
        category: this.engine.category,
        words: this.engine.targetWords,
        foundWords: this.engine.foundWords,
        found: this.engine.foundWords.length,
        total: this.engine.targetWords.length,
        time: this.engine.elapsedSeconds,
        won: this.engine.won
      });
    }
  }
}
