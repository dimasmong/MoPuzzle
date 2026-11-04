import Phaser from 'phaser';
import { BlockFitEngine, PolyominoPiece } from '../engines/BlockFitEngine';
import { SoundManager } from '../audio/SoundManager';
import { Storage } from '../core/storage';
import { Stats } from '../core/stats';
import { Achievements } from '../core/achievements';
import { GameLauncher } from './GameLauncher';

export class BlockFitScene extends Phaser.Scene {
  public engine!: BlockFitEngine;
  private cellSize = 32;
  private boardOffset = { x: 0, y: 0 };
  private gridBgGraphics!: Phaser.GameObjects.Graphics;
  private gridBlocksGraphics!: Phaser.GameObjects.Graphics;
  private previewGraphics!: Phaser.GameObjects.Graphics;
  private shelfContainers: Phaser.GameObjects.Container[] = [];
  private selectedPieceIndex: number | null = null;
  private draggingPieceContainer: Phaser.GameObjects.Container | null = null;
  private isDragging = false;
  private onStateChange?: (state: any) => void;

  constructor() {
    super('BlockFitScene');
  }

  public init(data: { onStateChange?: (state: any) => void } = {}) {
    this.onStateChange = data?.onStateChange || GameLauncher.onStateChangeCallback || undefined;
    const saved = Storage.getActiveGame<any>('blockfit');
    this.engine = new BlockFitEngine(saved);
    Stats.recordGameStart('blockfit');
  }

  public create(): void {
    const { width, height } = this.scale;

    // Calculate responsive sizes
    const boardAvailableWidth = Math.min(width * 0.94, 400);
    this.cellSize = Math.floor(boardAvailableWidth / 10);
    const totalBoardPx = this.cellSize * 10;

    this.boardOffset = {
      x: (width - totalBoardPx) / 2,
      y: Math.max(14, (height - totalBoardPx - 130) / 2)
    };

    // Draw board backdrop
    this.gridBgGraphics = this.add.graphics();
    this.drawBoardBackground();

    // Layer for placed blocks
    this.gridBlocksGraphics = this.add.graphics();

    // Layer for hover / placement preview
    this.previewGraphics = this.add.graphics();

    // Interactive board surface for tap placement
    const boardHitArea = this.add.zone(
      this.boardOffset.x + totalBoardPx / 2,
      this.boardOffset.y + totalBoardPx / 2,
      totalBoardPx,
      totalBoardPx
    ).setInteractive({ useHandCursor: true });

    boardHitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.selectedPieceIndex !== null && !this.isDragging) {
        const col = Math.floor((pointer.x - this.boardOffset.x) / this.cellSize);
        const row = Math.floor((pointer.y - this.boardOffset.y) / this.cellSize);
        this.attemptPlacement(this.selectedPieceIndex, row, col);
      }
    });

    boardHitArea.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.selectedPieceIndex !== null || this.isDragging) {
        const pieceIdx = this.selectedPieceIndex !== null ? this.selectedPieceIndex : (this.draggingPieceContainer as any)?.pieceIndex;
        if (pieceIdx !== undefined && pieceIdx !== null) {
          const col = Math.floor((pointer.x - this.boardOffset.x) / this.cellSize);
          const row = Math.floor((pointer.y - this.boardOffset.y) / this.cellSize);
          this.renderPreview(pieceIdx, row, col);
        }
      }
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging && this.draggingPieceContainer) {
        const pieceIdx = (this.draggingPieceContainer as any).pieceIndex;
        const col = Math.floor((pointer.x - this.boardOffset.x) / this.cellSize);
        const row = Math.floor((pointer.y - this.boardOffset.y) / this.cellSize);

        this.attemptPlacement(pieceIdx, row, col);
        this.clearDragState();
      }
    });

    this.renderBoardBlocks();
    this.renderShelfPieces();
    this.notifyState();
  }

  private drawBoardBackground(): void {
    this.gridBgGraphics.clear();
    const totalBoardPx = this.cellSize * 10;

    // Outer board card
    this.gridBgGraphics.fillStyle(0x1E2A3D, 1);
    this.gridBgGraphics.fillRoundedRect(this.boardOffset.x - 6, this.boardOffset.y - 6, totalBoardPx + 12, totalBoardPx + 12, 12);

    // Inner cells
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const x = this.boardOffset.x + c * this.cellSize;
        const y = this.boardOffset.y + r * this.cellSize;
        this.gridBgGraphics.fillStyle(0x101827, 0.7);
        this.gridBgGraphics.fillRoundedRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2, 4);
      }
    }
  }

  public renderBoardBlocks(): void {
    this.gridBlocksGraphics.clear();
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const colorHex = this.engine.grid[r][c];
        if (colorHex) {
          const x = this.boardOffset.x + c * this.cellSize;
          const y = this.boardOffset.y + r * this.cellSize;
          const numColor = parseInt(colorHex.replace('#', '0x'), 16);

          this.gridBlocksGraphics.fillStyle(numColor, 1);
          this.gridBlocksGraphics.fillRoundedRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4, 6);

          // Top bevel highlight
          this.gridBlocksGraphics.fillStyle(0xFFFFFF, 0.25);
          this.gridBlocksGraphics.fillRoundedRect(x + 3, y + 3, this.cellSize - 6, 4, 2);
        }
      }
    }
  }

  private renderPreview(pieceIndex: number, row: number, col: number): void {
    this.previewGraphics.clear();
    const piece = this.engine.currentPieces[pieceIndex];
    if (!piece || piece.used) return;

    const valid = this.engine.canPlacePiece(piece, row, col);
    const previewColor = valid ? 0x06D6A0 : 0xEF4444;

    const matrix = piece.matrix;
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[0].length; c++) {
        if (matrix[r][c] === 1) {
          const br = row + r;
          const bc = col + c;
          if (br >= 0 && br < 10 && bc >= 0 && bc < 10) {
            const x = this.boardOffset.x + bc * this.cellSize;
            const y = this.boardOffset.y + br * this.cellSize;
            this.previewGraphics.fillStyle(previewColor, 0.45);
            this.previewGraphics.fillRoundedRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4, 6);
          }
        }
      }
    }
  }

  public renderShelfPieces(): void {
    this.shelfContainers.forEach(c => c.destroy());
    this.shelfContainers = [];

    const { width } = this.scale;
    const totalBoardPx = this.cellSize * 10;
    const shelfY = this.boardOffset.y + totalBoardPx + 65;
    const slotWidth = width / 3;

    for (let i = 0; i < 3; i++) {
      const piece = this.engine.currentPieces[i];
      if (!piece || piece.used) continue;

      const slotCenterX = slotWidth * i + slotWidth / 2;
      const container = this.createPieceContainer(piece, i, slotCenterX, shelfY, 0.7);
      this.shelfContainers.push(container);
    }
  }

  private createPieceContainer(
    piece: PolyominoPiece,
    pieceIndex: number,
    x: number,
    y: number,
    scale: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    (container as any).pieceIndex = pieceIndex;
    (container as any).origX = x;
    (container as any).origY = y;

    const matrix = piece.matrix;
    const rows = matrix.length;
    const cols = matrix[0].length;
    const piecePxW = cols * this.cellSize * scale;
    const piecePxH = rows * this.cellSize * scale;
    const numColor = parseInt(piece.color.replace('#', '0x'), 16);

    const graphics = this.add.graphics();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (matrix[r][c] === 1) {
          const bx = (c - cols / 2) * this.cellSize * scale;
          const by = (r - rows / 2) * this.cellSize * scale;
          graphics.fillStyle(numColor, 1);
          graphics.fillRoundedRect(bx + 1, by + 1, this.cellSize * scale - 2, this.cellSize * scale - 2, 5);
          graphics.fillStyle(0xFFFFFF, 0.25);
          graphics.fillRoundedRect(bx + 2, by + 2, this.cellSize * scale - 4, 3, 2);
        }
      }
    }

    container.add(graphics);
    container.setSize(piecePxW + 20, piecePxH + 20);
    container.setInteractive({ useHandCursor: true, draggable: true });

    // Tap to select
    container.on('pointerdown', (_pointer: Phaser.Input.Pointer) => {
      this.selectedPieceIndex = pieceIndex;
      SoundManager.play('click');
      this.highlightSelectedShelfPiece(pieceIndex);
    });

    // Drag support
    this.input.setDraggable(container);

    container.on('dragstart', () => {
      this.isDragging = true;
      this.selectedPieceIndex = pieceIndex;
      this.draggingPieceContainer = container;
      container.setScale(1.0); // Expand to 100% board scale while dragging
      container.setDepth(100);
    });

    container.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      // Offset finger slightly on touch screens so finger does not cover blocks
      const touchOffset = pointer.wasTouch ? -60 : 0;
      container.x = dragX;
      container.y = dragY + touchOffset;

      const col = Math.floor((container.x - (cols * this.cellSize) / 2 - this.boardOffset.x) / this.cellSize + 0.5);
      const row = Math.floor((container.y - (rows * this.cellSize) / 2 - this.boardOffset.y) / this.cellSize + 0.5);
      this.renderPreview(pieceIndex, row, col);
    });

    container.on('dragend', () => {
      // Handled in pointerup
    });

    return container;
  }

  private highlightSelectedShelfPiece(selectedIdx: number): void {
    this.shelfContainers.forEach(c => {
      const pIdx = (c as any).pieceIndex;
      c.setScale(pIdx === selectedIdx ? 0.85 : 0.7);
    });
  }

  private attemptPlacement(pieceIndex: number, row: number, col: number): void {
    const piece = this.engine.currentPieces[pieceIndex];
    if (!piece || piece.used) return;

    if (!this.engine.canPlacePiece(piece, row, col)) {
      SoundManager.play('invalid');
      this.previewGraphics.clear();
      return;
    }

    const result = this.engine.placePiece(pieceIndex, row, col);
    Stats.recordMove('blockfit');
    Stats.recordScore('blockfit', this.engine.score);
    SoundManager.play('place');

    if (result.clearedRows.length > 0 || result.clearedCols.length > 0) {
      if (result.comboCount >= 2) {
        SoundManager.play('combo');
      } else {
        SoundManager.play('clear');
      }

      const totalLines = result.clearedRows.length + result.clearedCols.length;
      Stats.recordExtraStat('blockfit', 'linesCleared', totalLines);

      if (result.comboCount >= 3) {
        Achievements.triggerUnlock('block_combo');
      }
      const allLines = Storage.getData().stats.blockfit.extraStats.linesCleared || 0;
      if (allLines >= 50) {
        Achievements.triggerUnlock('block_50_lines');
      }
    }

    if (result.gameOver) {
      SoundManager.play('gameover');
    }

    this.selectedPieceIndex = null;
    this.previewGraphics.clear();
    this.renderBoardBlocks();
    this.renderShelfPieces();

    Storage.saveActiveGame('blockfit', this.engine.serialize());
    this.notifyState();
  }

  private clearDragState(): void {
    if (this.draggingPieceContainer) {
      const origX = (this.draggingPieceContainer as any).origX;
      const origY = (this.draggingPieceContainer as any).origY;

      this.tweens.add({
        targets: this.draggingPieceContainer,
        x: origX,
        y: origY,
        scaleX: 0.7,
        scaleY: 0.7,
        duration: 150,
        ease: 'Cubic.easeOut'
      });
    }
    this.isDragging = false;
    this.draggingPieceContainer = null;
    this.previewGraphics.clear();
  }

  public restartGame(): void {
    this.engine.restart();
    SoundManager.play('click');
    this.selectedPieceIndex = null;
    this.renderBoardBlocks();
    this.renderShelfPieces();
    this.previewGraphics.clear();
    Storage.saveActiveGame('blockfit', this.engine.serialize());
    this.notifyState();
  }

  private notifyState(): void {
    if (this.onStateChange) {
      this.onStateChange({
        score: this.engine.score,
        gameOver: this.engine.gameOver,
        comboStreak: this.engine.comboStreak
      });
    }
  }
}
