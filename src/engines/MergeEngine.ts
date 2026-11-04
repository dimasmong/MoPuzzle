export type Direction = 'up' | 'down' | 'left' | 'right';
export type MergeGameMode = 'classic' | 'timed';

export interface TileMove {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  value: number;
  mergedWith?: { row: number; col: number; newValue: number };
}

export interface MergeMoveResult {
  moved: boolean;
  scoreGain: number;
  spawnedTile?: { row: number; col: number; value: number };
  won: boolean;
  gameOver: boolean;
}

export interface MergeHistoryEntry {
  board: number[][];
  score: number;
  moves: number;
}

export class MergeEngine {
  public readonly size = 4;
  public board: number[][];
  public score = 0;
  public moves = 0;
  public won = false;
  public gameOver = false;
  public hasContinuedAfterWin = false;
  public gameMode: MergeGameMode = 'classic';
  public timeRemaining = 90; // seconds for timed mode
  private history: MergeHistoryEntry[] = [];

  constructor(mode: MergeGameMode = 'classic', savedState?: any) {
    this.gameMode = mode;
    this.board = Array.from({ length: this.size }, () => Array(this.size).fill(0));

    if (savedState && savedState.board && savedState.board.length === this.size) {
      this.board = savedState.board.map((row: number[]) => [...row]);
      this.score = savedState.score ?? 0;
      this.moves = savedState.moves ?? 0;
      this.gameMode = savedState.mode ?? mode;
      this.timeRemaining = savedState.timeRemaining ?? 90;
      this.history = savedState.history ? [...savedState.history] : [];
      this.won = this.checkWinCondition();
      this.gameOver = this.checkGameOver();
    } else {
      this.restart();
    }
  }

  public restart(): void {
    this.board = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    this.score = 0;
    this.moves = 0;
    this.won = false;
    this.gameOver = false;
    this.hasContinuedAfterWin = false;
    this.timeRemaining = this.gameMode === 'timed' ? 90 : 0;
    this.history = [];

    // Spawn 2 initial tiles
    this.spawnRandomTile();
    this.spawnRandomTile();
  }

  public getEmptyCells(): { row: number; col: number }[] {
    const empty: { row: number; col: number }[] = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.board[r][c] === 0) {
          empty.push({ row: r, col: c });
        }
      }
    }
    return empty;
  }

  public spawnRandomTile(): { row: number; col: number; value: number } | null {
    const emptyCells = this.getEmptyCells();
    if (emptyCells.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const cell = emptyCells[randomIndex];
    // 90% chance of 2, 10% chance of 4
    const value = Math.random() < 0.9 ? 2 : 4;
    this.board[cell.row][cell.col] = value;
    return { row: cell.row, col: cell.col, value };
  }

  public canMoveInDirection(dir: Direction): boolean {
    const testEngine = new MergeEngine(this.gameMode);
    testEngine.board = this.board.map(row => [...row]);
    const { moved } = testEngine.slide(dir);
    return moved;
  }

  public canMoveAny(): boolean {
    if (this.getEmptyCells().length > 0) return true;
    return (
      this.canMoveInDirection('left') ||
      this.canMoveInDirection('right') ||
      this.canMoveInDirection('up') ||
      this.canMoveInDirection('down')
    );
  }

  public move(dir: Direction): MergeMoveResult {
    this.gameOver = this.checkGameOver();
    if (this.gameOver) {
      return { moved: false, scoreGain: 0, won: this.won, gameOver: true };
    }

    // Save history before moving for Undo
    const previousState: MergeHistoryEntry = {
      board: this.board.map(row => [...row]),
      score: this.score,
      moves: this.moves
    };

    const { moved, scoreGain } = this.slide(dir);

    if (!moved) {
      this.gameOver = this.checkGameOver();
      return { moved: false, scoreGain: 0, won: this.won, gameOver: this.gameOver };
    }

    // Save to undo stack (max 10 steps)
    this.history.push(previousState);
    if (this.history.length > 10) {
      this.history.shift();
    }

    this.score += scoreGain;
    this.moves++;

    // In timed mode, merges grant bonus seconds
    if (this.gameMode === 'timed' && scoreGain > 0) {
      const bonusSeconds = Math.min(5, Math.max(1, Math.floor(scoreGain / 16)));
      this.timeRemaining = Math.min(120, this.timeRemaining + bonusSeconds);
    }

    // Spawn new tile after valid move
    const spawnedTile = this.spawnRandomTile() || undefined;

    // Check victory (reached 2048 tile)
    let justWon = false;
    if (!this.won && !this.hasContinuedAfterWin) {
      if (this.checkWinCondition()) {
        this.won = true;
        justWon = true;
      }
    }

    // Check game over
    this.gameOver = this.checkGameOver();

    return {
      moved: true,
      scoreGain,
      spawnedTile,
      won: justWon,
      gameOver: this.gameOver
    };
  }

  public undo(): boolean {
    if (this.history.length === 0) return false;
    const prev = this.history.pop()!;
    this.board = prev.board.map(r => [...r]);
    this.score = prev.score;
    this.moves = prev.moves;
    this.gameOver = false;
    return true;
  }

  public canUndo(): boolean {
    return this.history.length > 0;
  }

  public continueAfterWin(): void {
    this.hasContinuedAfterWin = true;
  }

  public checkWinCondition(): boolean {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.board[r][c] >= 2048) {
          return true;
        }
      }
    }
    return false;
  }

  public checkGameOver(): boolean {
    return !this.canMoveAny();
  }

  public slide(dir: Direction): { moved: boolean; scoreGain: number } {
    let moved = false;
    let scoreGain = 0;

    // Normalize operation so we can operate row by row (left slide)
    for (let i = 0; i < this.size; i++) {
      const line: number[] = [];
      for (let j = 0; j < this.size; j++) {
        let val = 0;
        if (dir === 'left') val = this.board[i][j];
        else if (dir === 'right') val = this.board[i][this.size - 1 - j];
        else if (dir === 'up') val = this.board[j][i];
        else if (dir === 'down') val = this.board[this.size - 1 - j][i];
        line.push(val);
      }

      const { newLine, lineScoreGain, lineMoved } = this.slideLine(line);
      if (lineMoved) moved = true;
      scoreGain += lineScoreGain;

      for (let j = 0; j < this.size; j++) {
        const val = newLine[j];
        if (dir === 'left') this.board[i][j] = val;
        else if (dir === 'right') this.board[i][this.size - 1 - j] = val;
        else if (dir === 'up') this.board[j][i] = val;
        else if (dir === 'down') this.board[this.size - 1 - j][i] = val;
      }
    }

    return { moved, scoreGain };
  }

  private slideLine(line: number[]): { newLine: number[]; lineScoreGain: number; lineMoved: boolean } {
    const nonZero = line.filter(v => v !== 0);
    const result: number[] = [];
    let lineScoreGain = 0;

    let idx = 0;
    while (idx < nonZero.length) {
      if (idx + 1 < nonZero.length && nonZero[idx] === nonZero[idx + 1]) {
        // Merge tiles: each tile can merge only once per move!
        const mergedVal = nonZero[idx] * 2;
        result.push(mergedVal);
        lineScoreGain += mergedVal;
        idx += 2;
      } else {
        result.push(nonZero[idx]);
        idx += 1;
      }
    }

    // Fill remaining cells with 0
    while (result.length < this.size) {
      result.push(0);
    }

    const lineMoved = result.some((val, i) => val !== line[i]);
    return { newLine: result, lineScoreGain, lineMoved };
  }

  public serialize() {
    return {
      board: this.board.map(r => [...r]),
      score: this.score,
      moves: this.moves,
      mode: this.gameMode,
      timeRemaining: this.timeRemaining,
      history: this.history.map(h => ({
        board: h.board.map(r => [...r]),
        score: h.score,
        moves: h.moves
      }))
    };
  }
}
