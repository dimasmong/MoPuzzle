export type SlideBoardSize = 3 | 4 | 5;

export interface SlideMoveResult {
  moved: boolean;
  tileIndex: number;
  emptyIndex: number;
  tileValue: number;
  won: boolean;
}

export class SlideEngine {
  public size: SlideBoardSize;
  public tiles: number[] = [];
  public moves = 0;
  public elapsedSeconds = 0;
  public won = false;

  constructor(size: SlideBoardSize = 4, savedState?: any) {
    this.size = size;
    if (savedState && savedState.tiles && Array.isArray(savedState.tiles) && savedState.tiles.length === size * size && !savedState.won && (savedState.size === undefined || savedState.size === size)) {
      this.size = savedState.size ?? size;
      this.tiles = [...savedState.tiles];
      this.moves = savedState.moves ?? 0;
      this.elapsedSeconds = savedState.elapsedSeconds ?? 0;
      this.won = this.checkWin();
    } else {
      this.restart();
    }
  }

  public restart(): void {
    this.moves = 0;
    this.elapsedSeconds = 0;
    this.won = false;
    this.tiles = SlideEngine.generateSolvableScramble(this.size);
  }

  public getEmptyIndex(): number {
    return this.tiles.indexOf(0);
  }

  public getTileAt(row: number, col: number): number {
    return this.tiles[row * this.size + col];
  }

  public canSlideTile(tileIndex: number): boolean {
    if (tileIndex < 0 || tileIndex >= this.tiles.length) return false;
    if (this.tiles[tileIndex] === 0) return false;

    const emptyIdx = this.getEmptyIndex();
    const tileRow = Math.floor(tileIndex / this.size);
    const tileCol = tileIndex % this.size;
    const emptyRow = Math.floor(emptyIdx / this.size);
    const emptyCol = emptyIdx % this.size;

    // Must be orthogonal neighbor (Manhattan distance = 1)
    const distance = Math.abs(tileRow - emptyRow) + Math.abs(tileCol - emptyCol);
    return distance === 1;
  }

  public slideTile(tileIndex: number): SlideMoveResult {
    if (this.won || !this.canSlideTile(tileIndex)) {
      return {
        moved: false,
        tileIndex,
        emptyIndex: this.getEmptyIndex(),
        tileValue: this.tiles[tileIndex] || 0,
        won: this.won
      };
    }

    const emptyIdx = this.getEmptyIndex();
    const tileVal = this.tiles[tileIndex];

    // Swap tile and blank
    this.tiles[emptyIdx] = tileVal;
    this.tiles[tileIndex] = 0;

    this.moves++;
    this.won = this.checkWin();

    return {
      moved: true,
      tileIndex,
      emptyIndex: emptyIdx,
      tileValue: tileVal,
      won: this.won
    };
  }

  public slideDirection(dir: 'up' | 'down' | 'left' | 'right'): SlideMoveResult {
    const emptyIdx = this.getEmptyIndex();
    const emptyRow = Math.floor(emptyIdx / this.size);
    const emptyCol = emptyIdx % this.size;

    // Moving 'up' means the tile BELOW the empty slot moves UP into the empty slot
    let targetRow = emptyRow;
    let targetCol = emptyCol;

    if (dir === 'up') targetRow = emptyRow + 1;
    else if (dir === 'down') targetRow = emptyRow - 1;
    else if (dir === 'left') targetCol = emptyCol + 1;
    else if (dir === 'right') targetCol = emptyCol - 1;

    if (targetRow < 0 || targetRow >= this.size || targetCol < 0 || targetCol >= this.size) {
      return {
        moved: false,
        tileIndex: -1,
        emptyIndex: emptyIdx,
        tileValue: 0,
        won: this.won
      };
    }

    const targetIdx = targetRow * this.size + targetCol;
    return this.slideTile(targetIdx);
  }

  public checkWin(): boolean {
    const total = this.size * this.size;
    for (let i = 0; i < total - 1; i++) {
      if (this.tiles[i] !== i + 1) {
        return false;
      }
    }
    return this.tiles[total - 1] === 0;
  }

  /**
   * Generates a guaranteed solvable board by starting with the solved board
   * and executing random valid neighbor moves.
   * Guarantees never unsolvable and never already solved!
   */
  public static generateSolvableScramble(size: SlideBoardSize, scrambleMoves = 150): number[] {
    const total = size * size;
    // Solved state: 1, 2, ..., total-1, 0
    const board = Array.from({ length: total }, (_, i) => (i === total - 1 ? 0 : i + 1));

    let emptyIdx = total - 1;
    let lastSwappedIdx = -1;

    for (let i = 0; i < scrambleMoves; i++) {
      const emptyRow = Math.floor(emptyIdx / size);
      const emptyCol = emptyIdx % size;

      const neighbors: number[] = [];
      if (emptyRow > 0) neighbors.push((emptyRow - 1) * size + emptyCol);
      if (emptyRow < size - 1) neighbors.push((emptyRow + 1) * size + emptyCol);
      if (emptyCol > 0) neighbors.push(emptyRow * size + (emptyCol - 1));
      if (emptyCol < size - 1) neighbors.push(emptyRow * size + (emptyCol + 1));

      // Filter out immediate undo to ensure high entropy
      const candidates = neighbors.filter(n => n !== lastSwappedIdx);
      const pick = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : neighbors[0];

      board[emptyIdx] = board[pick];
      board[pick] = 0;
      lastSwappedIdx = emptyIdx;
      emptyIdx = pick;
    }

    // Ensure it is not already solved
    let isSolved = true;
    for (let i = 0; i < total - 1; i++) {
      if (board[i] !== i + 1) {
        isSolved = false;
        break;
      }
    }

    if (isSolved) {
      // Perform 2 more moves
      return this.generateSolvableScramble(size, scrambleMoves + 2);
    }

    return board;
  }

  public serialize() {
    return {
      size: this.size,
      tiles: [...this.tiles],
      moves: this.moves,
      elapsedSeconds: this.elapsedSeconds,
      won: this.won
    };
  }
}
