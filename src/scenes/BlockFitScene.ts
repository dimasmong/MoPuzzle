import Phaser from 'phaser';
import { BlockFitEngine, PolyominoPiece } from '../engines/BlockFitEngine';
import { SoundManager } from '../audio/SoundManager';
import { Storage } from '../core/storage';
import { Stats } from '../core/stats';
import { Achievements } from '../core/achievements';
import { GameLauncher } from './GameLauncher';

interface ShelfPieceContainer extends Phaser.GameObjects.Container {
  pieceIndex: number;
  origX: number;
  origY: number;
  trayScale: number;
}

export class BlockFitScene extends Phaser.Scene {
  public engine!: BlockFitEngine;
  private cellSize = 36;
  private boardOffset = { x: 0, y: 0 };
  private trayBounds = { x: 0, y: 0, width: 0, height: 0, slotWidth: 0, slotHeight: 0 };

  private gridBgGraphics!: Phaser.GameObjects.Graphics;
  private trayBgGraphics!: Phaser.GameObjects.Graphics;
  private gridBlocksGraphics!: Phaser.GameObjects.Graphics;
  private previewGraphics!: Phaser.GameObjects.Graphics;
  private boardHitArea!: Phaser.GameObjects.Zone;

  private shelfContainers: ShelfPieceContainer[] = [];
  private selectedPieceIndex: number | null = null;
  private draggingPieceContainer: ShelfPieceContainer | null = null;
  private isDragging = false;
  private isProcessingPlacement = false;
  private onStateChange?: (state: any) => void;

  constructor() {
    super('BlockFitScene');
  }

  public init(data: { onStateChange?: (state: any) => void } = {}): void {
    this.onStateChange = data?.onStateChange || GameLauncher.onStateChangeCallback || undefined;
    const saved = Storage.getActiveGame<any>('blockfit');
    const validSaved = (saved && !saved.gameOver) ? saved : undefined;
    this.engine = new BlockFitEngine(validSaved);
    Stats.recordGameStart('blockfit');
    if (!validSaved) {
      Storage.saveActiveGame('blockfit', this.engine.serialize());
    }
  }

  public create(): void {
    const { width, height } = this.scale;
    this.calculateLayout(width, height);

    // Graphic layers
    this.gridBgGraphics = this.add.graphics();
    this.trayBgGraphics = this.add.graphics();
    this.gridBlocksGraphics = this.add.graphics();
    this.previewGraphics = this.add.graphics();

    // Hit area for board
    this.boardHitArea = this.add.zone(0, 0, 10, 10).setOrigin(0, 0);
    this.updateBoardHitArea();

    // Tap-to-place board interaction
    this.boardHitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.selectedPieceIndex !== null && !this.isDragging) {
        const col = Math.floor((pointer.x - this.boardOffset.x) / this.cellSize);
        const row = Math.floor((pointer.y - this.boardOffset.y) / this.cellSize);
        this.attemptPlacement(this.selectedPieceIndex, row, col);
      }
    });

    // Board hover preview for tap-selection mode
    this.boardHitArea.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.selectedPieceIndex !== null && !this.isDragging) {
        const col = Math.floor((pointer.x - this.boardOffset.x) / this.cellSize);
        const row = Math.floor((pointer.y - this.boardOffset.y) / this.cellSize);
        this.renderPreview(this.selectedPieceIndex, row, col);
      }
    });

    // Global pointer up / drop listener
    this.input.on('pointerup', (_pointer: Phaser.Input.Pointer) => {
      if (this.isDragging && this.draggingPieceContainer) {
        this.handleDrop(this.draggingPieceContainer);
      }
    });

    // Draw elements
    this.redrawAll();
    this.notifyState();
  }

  /**
   * Recalculates responsive dimensions and positioning for board and tray
   */
  private calculateLayout(width: number, height: number): void {
    // Board width budget: up to 480px on desktop, margins on mobile
    const availableWidth = Math.min(width - 24, 480);
    // Board height budget: canvas height minus tray and margins
    const availableHeight = Math.max(280, height - 150);

    let cell = Math.floor(Math.min(availableWidth / 10, availableHeight / 10));
    // Clamp cell size between 28px (small mobile) and 48px (large desktop)
    this.cellSize = Math.max(28, Math.min(48, cell));

    const totalBoardPx = this.cellSize * 10;
    const boardX = Math.round((width - totalBoardPx) / 2);

    // Vertical positioning: balanced between top margin and tray space
    let boardY = Math.round((height - totalBoardPx - 130) / 2);
    boardY = Math.max(10, Math.min(36, boardY));

    this.boardOffset = { x: boardX, y: boardY };

    // Tray layout: directly beneath board, matching board width
    const trayY = boardY + totalBoardPx + 14;
    const trayH = Math.max(90, Math.min(125, height - trayY - 8));
    const slotW = (totalBoardPx - 16) / 3;
    const slotH = trayH - 12;

    this.trayBounds = {
      x: boardX,
      y: trayY,
      width: totalBoardPx,
      height: trayH,
      slotWidth: slotW,
      slotHeight: slotH
    };
  }

  private updateBoardHitArea(): void {
    const totalBoardPx = this.cellSize * 10;
    this.boardHitArea.setPosition(this.boardOffset.x, this.boardOffset.y);
    this.boardHitArea.setSize(totalBoardPx, totalBoardPx);
    this.boardHitArea.setInteractive({ useHandCursor: true });
  }

  public onResize(width: number, height: number): void {
    this.calculateLayout(width, height);
    this.updateBoardHitArea();
    this.redrawAll();
  }

  private redrawAll(): void {
    this.drawBoardBackground();
    this.drawTrayBackground();
    this.renderBoardBlocks();
    this.renderShelfPieces();
  }

  private isDarkTheme(): boolean {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  private drawBoardBackground(): void {
    this.gridBgGraphics.clear();
    const totalBoardPx = this.cellSize * 10;
    const dark = this.isDarkTheme();

    // Outer card container
    const boardBgColor = dark ? 0x1E2A3D : 0xE2E8F0;
    const boardBorderColor = dark ? 0x27374D : 0xCBD5E1;
    this.gridBgGraphics.fillStyle(boardBgColor, 1);
    this.gridBgGraphics.fillRoundedRect(this.boardOffset.x - 7, this.boardOffset.y - 7, totalBoardPx + 14, totalBoardPx + 14, 14);

    this.gridBgGraphics.lineStyle(1.5, boardBorderColor, 1);
    this.gridBgGraphics.strokeRoundedRect(this.boardOffset.x - 7, this.boardOffset.y - 7, totalBoardPx + 14, totalBoardPx + 14, 14);

    // Inner cells
    const cellBgColor = dark ? 0x131C2E : 0xFFFFFF;
    const cellBorderColor = dark ? 0x1A253A : 0xEEF2F6;

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const x = this.boardOffset.x + c * this.cellSize;
        const y = this.boardOffset.y + r * this.cellSize;

        this.gridBgGraphics.fillStyle(cellBgColor, 1);
        this.gridBgGraphics.fillRoundedRect(x + 1.5, y + 1.5, this.cellSize - 3, this.cellSize - 3, 5);

        this.gridBgGraphics.lineStyle(1, cellBorderColor, 0.8);
        this.gridBgGraphics.strokeRoundedRect(x + 1.5, y + 1.5, this.cellSize - 3, this.cellSize - 3, 5);
      }
    }
  }

  private drawTrayBackground(): void {
    this.trayBgGraphics.clear();
    const dark = this.isDarkTheme();
    const { x, y, width, height, slotWidth, slotHeight } = this.trayBounds;

    // Tray card background
    const trayBg = dark ? 0x1E2A3D : 0xEDF2F7;
    const trayBorder = dark ? 0x27374D : 0xCBD5E1;
    this.trayBgGraphics.fillStyle(trayBg, 1);
    this.trayBgGraphics.fillRoundedRect(x, y, width, height, 14);
    this.trayBgGraphics.lineStyle(1.5, trayBorder, 0.8);
    this.trayBgGraphics.strokeRoundedRect(x, y, width, height, 14);

    // 3 distinct wells for the pieces
    const wellBg = dark ? 0x131C2E : 0xE2E8F0;
    const wellBorder = dark ? 0x1A253A : 0xCBD5E1;

    for (let i = 0; i < 3; i++) {
      const wellX = x + 8 + i * (slotWidth + 4);
      const wellY = y + (height - slotHeight) / 2;

      this.trayBgGraphics.fillStyle(wellBg, 0.8);
      this.trayBgGraphics.fillRoundedRect(wellX, wellY, slotWidth - 4, slotHeight, 10);
      this.trayBgGraphics.lineStyle(1, wellBorder, 0.6);
      this.trayBgGraphics.strokeRoundedRect(wellX, wellY, slotWidth - 4, slotHeight, 10);
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

          // Base block
          this.gridBlocksGraphics.fillStyle(numColor, 1);
          this.gridBlocksGraphics.fillRoundedRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4, 6);

          // Beveled specular highlight (top edge)
          this.gridBlocksGraphics.fillStyle(0xFFFFFF, 0.35);
          this.gridBlocksGraphics.fillRoundedRect(x + 3, y + 3, this.cellSize - 6, 4, 2);

          // Darker lower-right bevel shadow
          this.gridBlocksGraphics.fillStyle(0x000000, 0.15);
          this.gridBlocksGraphics.fillRoundedRect(x + 3, y + this.cellSize - 6, this.cellSize - 6, 3, 2);
        }
      }
    }
  }

  /**
   * Deterministic coordinate calculator.
   * Given container center coordinates, returns the target grid row and col.
   * Used identically by preview rendering and drop placement.
   */
  private getPlacementCoordinates(
    pieceIndex: number,
    containerX: number,
    containerY: number
  ): { row: number; col: number; inBoardArea: boolean } {
    const piece = this.engine.currentPieces[pieceIndex];
    if (!piece) return { row: -99, col: -99, inBoardArea: false };

    const matrix = piece.matrix;
    const rows = matrix.length;
    const cols = matrix[0].length;

    // The container center is (0, 0) of the bounding box (cols * cellSize, rows * cellSize)
    const topLeftX = containerX - (cols * this.cellSize) / 2;
    const topLeftY = containerY - (rows * this.cellSize) / 2;

    // Calculate grid row and col relative to board top-left using exact rounding
    const col = Math.round((topLeftX - this.boardOffset.x) / this.cellSize);
    const row = Math.round((topLeftY - this.boardOffset.y) / this.cellSize);

    // Overlaps the 10x10 board area
    const inBoardArea = col > -cols && col < 10 && row > -rows && row < 10;

    return { row, col, inBoardArea };
  }

  private renderPreview(pieceIndex: number, row: number, col: number): void {
    this.previewGraphics.clear();
    const piece = this.engine.currentPieces[pieceIndex];
    if (!piece || piece.used) return;

    const valid = this.engine.canPlacePiece(piece, row, col);
    const matrix = piece.matrix;
    const pieceRows = matrix.length;
    const pieceCols = matrix[0].length;

    if (valid) {
      // Crisp emerald green indicator for valid placement
      const fillColor = 0x10B981;
      const strokeColor = 0x34D399;

      for (let r = 0; r < pieceRows; r++) {
        for (let c = 0; c < pieceCols; c++) {
          if (matrix[r][c] === 1) {
            const br = row + r;
            const bc = col + c;
            const x = this.boardOffset.x + bc * this.cellSize;
            const y = this.boardOffset.y + br * this.cellSize;

            this.previewGraphics.fillStyle(fillColor, 0.55);
            this.previewGraphics.fillRoundedRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4, 6);

            this.previewGraphics.lineStyle(2, strokeColor, 0.95);
            this.previewGraphics.strokeRoundedRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4, 6);
          }
        }
      }
    } else {
      // Translucent red indicator for invalid / overlapping / out-of-bounds placement
      const fillColor = 0xEF4444;
      const strokeColor = 0xF87171;

      for (let r = 0; r < pieceRows; r++) {
        for (let c = 0; c < pieceCols; c++) {
          if (matrix[r][c] === 1) {
            const br = row + r;
            const bc = col + c;
            // Only draw preview for cells that fall onto the board
            if (br >= 0 && br < 10 && bc >= 0 && bc < 10) {
              const x = this.boardOffset.x + bc * this.cellSize;
              const y = this.boardOffset.y + br * this.cellSize;

              this.previewGraphics.fillStyle(fillColor, 0.4);
              this.previewGraphics.fillRoundedRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4, 6);

              this.previewGraphics.lineStyle(1.5, strokeColor, 0.8);
              this.previewGraphics.strokeRoundedRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4, 6);
            }
          }
        }
      }
    }
  }

  public renderShelfPieces(): void {
    this.shelfContainers.forEach(c => c.destroy());
    this.shelfContainers = [];

    const { x, y, height, slotWidth } = this.trayBounds;
    const centerY = y + height / 2;

    for (let i = 0; i < 3; i++) {
      const piece = this.engine.currentPieces[i];
      if (!piece || piece.used) continue;

      const wellCenterX = x + 8 + i * (slotWidth + 4) + (slotWidth - 4) / 2;
      const container = this.createPieceContainer(piece, i, wellCenterX, centerY);
      this.shelfContainers.push(container);
    }
  }

  private createPieceContainer(
    piece: PolyominoPiece,
    pieceIndex: number,
    x: number,
    y: number
  ): ShelfPieceContainer {
    const container = this.add.container(x, y) as ShelfPieceContainer;
    container.pieceIndex = pieceIndex;
    container.origX = x;
    container.origY = y;

    const matrix = piece.matrix;
    const rows = matrix.length;
    const cols = matrix[0].length;
    const numColor = parseInt(piece.color.replace('#', '0x'), 16);

    // Compute tray thumbnail scale dynamically so any shape fits nicely in its slot
    const maxDim = Math.max(rows, cols);
    const targetSize = Math.min(this.trayBounds.slotWidth * 0.74, this.trayBounds.slotHeight * 0.74);
    const trayScale = Math.min(0.68, Math.max(0.42, targetSize / (maxDim * this.cellSize)));
    container.trayScale = trayScale;
    container.setScale(trayScale);

    // Draw blocks at FULL board cellSize inside the container
    const graphics = this.add.graphics();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (matrix[r][c] === 1) {
          const bx = (c - cols / 2) * this.cellSize;
          const by = (r - rows / 2) * this.cellSize;

          graphics.fillStyle(numColor, 1);
          graphics.fillRoundedRect(bx + 2, by + 2, this.cellSize - 4, this.cellSize - 4, 6);

          graphics.fillStyle(0xFFFFFF, 0.35);
          graphics.fillRoundedRect(bx + 3, by + 3, this.cellSize - 6, 4, 2);

          graphics.fillStyle(0x000000, 0.15);
          graphics.fillRoundedRect(bx + 3, by + this.cellSize - 6, this.cellSize - 6, 3, 2);
        }
      }
    }
    container.add(graphics);

    const fullPxW = cols * this.cellSize;
    const fullPxH = rows * this.cellSize;
    container.setSize(fullPxW, fullPxH);
    container.setInteractive({ useHandCursor: true, draggable: true });

    // Tap to select (alternative to dragging)
    container.on('pointerdown', () => {
      if (!this.isDragging) {
        this.selectedPieceIndex = pieceIndex;
        SoundManager.play('click');
        this.highlightSelectedShelfPiece(pieceIndex);
      }
    });

    // Setup drag events
    this.input.setDraggable(container);

    container.on('dragstart', () => {
      this.isDragging = true;
      this.selectedPieceIndex = pieceIndex;
      this.draggingPieceContainer = container;

      // Expand to 100% board scale so it aligns 1:1 with the board grid
      container.setScale(1.0);
      container.setAlpha(0.9);
      container.setDepth(200);
    });

    container.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      // Touch elevation offset: raise piece above finger on touch screens so finger does not block view
      const touchOffset = pointer.wasTouch ? -Math.max(52, Math.round(this.cellSize * 1.35)) : 0;
      container.x = dragX;
      container.y = dragY + touchOffset;

      const { row, col, inBoardArea } = this.getPlacementCoordinates(pieceIndex, container.x, container.y);
      if (inBoardArea) {
        this.renderPreview(pieceIndex, row, col);
      } else {
        this.previewGraphics.clear();
      }
    });

    return container;
  }

  private handleDrop(container: ShelfPieceContainer): void {
    if (this.isProcessingPlacement) return;
    this.isProcessingPlacement = true;

    const pieceIndex = container.pieceIndex;
    const { row, col, inBoardArea } = this.getPlacementCoordinates(pieceIndex, container.x, container.y);
    const piece = this.engine.currentPieces[pieceIndex];

    if (piece && !piece.used && this.engine.canPlacePiece(piece, row, col)) {
      // Valid placement: commit placement onto board
      this.attemptPlacement(pieceIndex, row, col);
      this.previewGraphics.clear();
      this.isDragging = false;
      this.draggingPieceContainer = null;
      this.isProcessingPlacement = false;
    } else {
      // Invalid drop: play warning sound if attempted on board, and tween back smoothly to slot
      if (inBoardArea) {
        SoundManager.play('invalid');
      }
      this.previewGraphics.clear();

      this.tweens.add({
        targets: container,
        x: container.origX,
        y: container.origY,
        scaleX: container.trayScale,
        scaleY: container.trayScale,
        alpha: 1.0,
        duration: 180,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          container.setDepth(1);
          this.isDragging = false;
          this.draggingPieceContainer = null;
          this.isProcessingPlacement = false;
        }
      });
    }
  }

  private highlightSelectedShelfPiece(selectedIdx: number): void {
    this.shelfContainers.forEach(c => {
      const isSel = c.pieceIndex === selectedIdx;
      c.setScale(isSel ? c.trayScale * 1.15 : c.trayScale);
      c.setAlpha(isSel ? 1 : 0.85);
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
      Storage.clearActiveGame('blockfit');
    } else {
      Storage.saveActiveGame('blockfit', this.engine.serialize());
    }

    this.selectedPieceIndex = null;
    this.previewGraphics.clear();
    this.renderBoardBlocks();
    this.renderShelfPieces();

    this.notifyState();
  }

  public restartGame(): void {
    this.engine.restart();
    SoundManager.play('click');
    this.selectedPieceIndex = null;
    this.isDragging = false;
    this.draggingPieceContainer = null;
    this.isProcessingPlacement = false;
    this.previewGraphics.clear();
    this.renderBoardBlocks();
    this.renderShelfPieces();
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
