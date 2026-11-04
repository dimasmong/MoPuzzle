export interface PolyominoPiece {
  id: string;
  name: string;
  matrix: number[][];
  color: string;
  used: boolean;
}

export interface PlaceResult {
  placed: boolean;
  scoreGain: number;
  clearedRows: number[];
  clearedCols: number[];
  comboCount: number;
  gameOver: boolean;
  newRoundStarted: boolean;
}

export const BLOCK_SHAPES_DEF = [
  // 1x1
  { name: '1x1', matrix: [[1]], color: '#FFBE0B' },
  // 1x2, 2x1
  { name: '1x2', matrix: [[1, 1]], color: '#3A86FF' },
  { name: '2x1', matrix: [[1], [1]], color: '#3A86FF' },
  // 1x3, 3x1
  { name: '1x3', matrix: [[1, 1, 1]], color: '#06D6A0' },
  { name: '3x1', matrix: [[1], [1], [1]], color: '#06D6A0' },
  // 1x4, 4x1
  { name: '1x4', matrix: [[1, 1, 1, 1]], color: '#8338EC' },
  { name: '4x1', matrix: [[1], [1], [1], [1]], color: '#8338EC' },
  // 1x5, 5x1
  { name: '1x5', matrix: [[1, 1, 1, 1, 1]], color: '#FF006E' },
  { name: '5x1', matrix: [[1], [1], [1], [1], [1]], color: '#FF006E' },
  // 2x2
  { name: '2x2', matrix: [[1, 1], [1, 1]], color: '#FB5607' },
  // 3x3
  { name: '3x3', matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], color: '#D90429' },
  // Small Ls
  { name: 'small_l1', matrix: [[1, 0], [1, 1]], color: '#48CAE4' },
  { name: 'small_l2', matrix: [[0, 1], [1, 1]], color: '#48CAE4' },
  { name: 'small_l3', matrix: [[1, 1], [1, 0]], color: '#48CAE4' },
  { name: 'small_l4', matrix: [[1, 1], [0, 1]], color: '#48CAE4' },
  // Corner 3x3
  { name: 'big_l1', matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], color: '#9B5DE5' },
  { name: 'big_l2', matrix: [[0, 0, 1], [0, 0, 1], [1, 1, 1]], color: '#9B5DE5' },
  // T-shapes
  { name: 't1', matrix: [[1, 1, 1], [0, 1, 0]], color: '#F15BB5' },
  { name: 't2', matrix: [[0, 1, 0], [1, 1, 1]], color: '#F15BB5' },
  // Z-shapes
  { name: 'z1', matrix: [[1, 1, 0], [0, 1, 1]], color: '#38B000' },
  { name: 'z2', matrix: [[0, 1, 1], [1, 1, 0]], color: '#38B000' }
];

export class BlockFitEngine {
  public readonly size = 10;
  public grid: (string | null)[][];
  public score = 0;
  public currentPieces: PolyominoPiece[] = [];
  public comboStreak = 0;
  public gameOver = false;

  constructor(savedState?: any) {
    this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(null));

    if (savedState && savedState.grid && Array.isArray(savedState.grid) && savedState.grid.length === this.size) {
      this.grid = savedState.grid.map((r: (string | null)[]) => [...r]);
      this.score = savedState.score ?? 0;
      this.comboStreak = savedState.comboStreak ?? 0;
      this.currentPieces = savedState.currentPieces ? savedState.currentPieces.map((p: any) => ({ ...p })) : [];
      if (this.currentPieces.length === 0 || this.currentPieces.every(p => p.used)) {
        this.spawnThreePieces();
      }
      this.gameOver = this.checkGameOver();
    } else {
      this.restart();
    }
  }

  public restart(): void {
    this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(null));
    this.score = 0;
    this.comboStreak = 0;
    this.gameOver = false;
    this.spawnThreePieces();
  }

  public spawnThreePieces(): void {
    this.currentPieces = [];
    for (let i = 0; i < 3; i++) {
      const def = BLOCK_SHAPES_DEF[Math.floor(Math.random() * BLOCK_SHAPES_DEF.length)];
      this.currentPieces.push({
        id: `piece_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        name: def.name,
        matrix: def.matrix.map(row => [...row]),
        color: def.color,
        used: false
      });
    }
  }

  public canPlacePiece(piece: PolyominoPiece, startRow: number, startCol: number): boolean {
    if (piece.used) return false;
    const matrix = piece.matrix;
    const pieceRows = matrix.length;
    const pieceCols = matrix[0].length;

    if (startRow < 0 || startRow + pieceRows > this.size) return false;
    if (startCol < 0 || startCol + pieceCols > this.size) return false;

    for (let r = 0; r < pieceRows; r++) {
      for (let c = 0; c < pieceCols; c++) {
        if (matrix[r][c] === 1) {
          if (this.grid[startRow + r][startCol + c] !== null) {
            return false; // Cell already occupied
          }
        }
      }
    }
    return true;
  }

  public canPieceFitAnywhere(piece: PolyominoPiece): boolean {
    if (piece.used) return false;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.canPlacePiece(piece, r, c)) {
          return true;
        }
      }
    }
    return false;
  }

  public checkGameOver(): boolean {
    const availablePieces = this.currentPieces.filter(p => !p.used);
    if (availablePieces.length === 0) return false;

    for (const piece of availablePieces) {
      if (this.canPieceFitAnywhere(piece)) {
        return false; // At least one piece can fit!
      }
    }
    return true;
  }

  public placePiece(pieceIndex: number, startRow: number, startCol: number): PlaceResult {
    const piece = this.currentPieces[pieceIndex];
    if (!piece || piece.used || !this.canPlacePiece(piece, startRow, startCol)) {
      return {
        placed: false,
        scoreGain: 0,
        clearedRows: [],
        clearedCols: [],
        comboCount: 0,
        gameOver: this.gameOver,
        newRoundStarted: false
      };
    }

    // Place the piece onto grid
    let blockCount = 0;
    const matrix = piece.matrix;
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[0].length; c++) {
        if (matrix[r][c] === 1) {
          this.grid[startRow + r][startCol + c] = piece.color;
          blockCount++;
        }
      }
    }
    piece.used = true;

    // Base score: 1 point per block placed
    let scoreGain = blockCount * 10;

    // Check full rows and columns simultaneously
    const clearedRows: number[] = [];
    const clearedCols: number[] = [];

    for (let r = 0; r < this.size; r++) {
      let full = true;
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === null) {
          full = false;
          break;
        }
      }
      if (full) clearedRows.push(r);
    }

    for (let c = 0; c < this.size; c++) {
      let full = true;
      for (let r = 0; r < this.size; r++) {
        if (this.grid[r][c] === null) {
          full = false;
          break;
        }
      }
      if (full) clearedCols.push(c);
    }

    const totalLines = clearedRows.length + clearedCols.length;
    let comboMultiplier = 1;

    if (totalLines > 0) {
      this.comboStreak++;
      comboMultiplier = this.comboStreak * totalLines;
      scoreGain += totalLines * 100 * comboMultiplier;

      // Clear the rows
      clearedRows.forEach(r => {
        for (let c = 0; c < this.size; c++) {
          this.grid[r][c] = null;
        }
      });

      // Clear the columns
      clearedCols.forEach(c => {
        for (let r = 0; r < this.size; r++) {
          this.grid[r][c] = null;
        }
      });
    } else {
      this.comboStreak = 0;
    }

    this.score += scoreGain;

    // Check if all 3 pieces are used
    let newRoundStarted = false;
    if (this.currentPieces.every(p => p.used)) {
      this.spawnThreePieces();
      newRoundStarted = true;
    }

    // Check game over
    this.gameOver = this.checkGameOver();

    return {
      placed: true,
      scoreGain,
      clearedRows,
      clearedCols,
      comboCount: totalLines,
      gameOver: this.gameOver,
      newRoundStarted
    };
  }

  public serialize() {
    return {
      grid: this.grid.map(row => [...row]),
      score: this.score,
      comboStreak: this.comboStreak,
      currentPieces: this.currentPieces.map(p => ({
        id: p.id,
        name: p.name,
        matrix: p.matrix.map(r => [...r]),
        color: p.color,
        used: p.used
      }))
    };
  }
}
