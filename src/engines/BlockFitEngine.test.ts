import { describe, it, expect, beforeEach } from 'vitest';
import { BlockFitEngine } from './BlockFitEngine';

describe('BlockFitEngine', () => {
  let engine: BlockFitEngine;

  beforeEach(() => {
    engine = new BlockFitEngine();
  });

  it('initializes a 10x10 grid and generates 3 available pieces', () => {
    expect(engine.grid.length).toBe(10);
    expect(engine.grid[0].length).toBe(10);
    expect(engine.currentPieces.length).toBe(3);
    expect(engine.currentPieces.every(p => !p.used)).toBe(true);
    expect(engine.score).toBe(0);
    expect(engine.gameOver).toBe(false);
  });

  it('validates placement within boundaries and rejects out-of-bounds', () => {
    const piece = {
      id: 'test_piece',
      name: '1x3',
      matrix: [[1, 1, 1]],
      color: '#FF0000',
      used: false
    };

    // Valid placement inside
    expect(engine.canPlacePiece(piece, 0, 0)).toBe(true);
    expect(engine.canPlacePiece(piece, 9, 7)).toBe(true);

    // Out of bounds: startCol + 3 > 10
    expect(engine.canPlacePiece(piece, 0, 8)).toBe(false);
    expect(engine.canPlacePiece(piece, -1, 0)).toBe(false);
    expect(engine.canPlacePiece(piece, 10, 0)).toBe(false);
  });

  it('rejects placement when overlapping already filled cells', () => {
    const piece1 = {
      id: 'p1',
      name: '1x1',
      matrix: [[1]],
      color: '#FF0000',
      used: false
    };

    engine.currentPieces[0] = piece1;
    const res1 = engine.placePiece(0, 4, 4);
    expect(res1.placed).toBe(true);
    expect(engine.grid[4][4]).toBe('#FF0000');

    // Attempt to place another piece on (4, 4)
    const piece2 = {
      id: 'p2',
      name: '2x1',
      matrix: [[1], [1]],
      color: '#00FF00',
      used: false
    };
    engine.currentPieces[1] = piece2;
    expect(engine.canPlacePiece(piece2, 4, 4)).toBe(false);

    const res2 = engine.placePiece(1, 4, 4);
    expect(res2.placed).toBe(false);
  });

  it('clears completed row and awards line score', () => {
    // Fill row 5 except the last cell
    for (let c = 0; c < 9; c++) {
      engine.grid[5][c] = '#123456';
    }

    // Place a 1x1 block at row 5, col 9 to complete the row
    engine.currentPieces[0] = {
      id: 'p1',
      name: '1x1',
      matrix: [[1]],
      color: '#FFBE0B',
      used: false
    };

    const res = engine.placePiece(0, 5, 9);
    expect(res.placed).toBe(true);
    expect(res.clearedRows).toEqual([5]);
    expect(res.clearedCols).toEqual([]);

    // Row 5 should now be completely empty
    for (let c = 0; c < 10; c++) {
      expect(engine.grid[5][c]).toBeNull();
    }
  });

  it('clears simultaneous row and column with combo multiplier', () => {
    // Fill row 2 except (2, 2)
    for (let c = 0; c < 10; c++) {
      if (c !== 2) engine.grid[2][c] = '#AAAAAA';
    }
    // Fill col 2 except (2, 2)
    for (let r = 0; r < 10; r++) {
      if (r !== 2) engine.grid[r][2] = '#BBBBBB';
    }

    // Place 1x1 at (2, 2)
    engine.currentPieces[0] = {
      id: 'cross_piece',
      name: '1x1',
      matrix: [[1]],
      color: '#CCCCCC',
      used: false
    };

    const res = engine.placePiece(0, 2, 2);
    expect(res.placed).toBe(true);
    expect(res.clearedRows).toEqual([2]);
    expect(res.clearedCols).toEqual([2]);
    expect(res.comboCount).toBe(2);
    expect(res.scoreGain).toBeGreaterThan(300); // Base + 2 lines * 100 * multiplier
  });

  it('spawns 3 new pieces when all 3 pieces are placed', () => {
    for (let i = 0; i < 3; i++) {
      engine.currentPieces[i] = {
        id: `piece_${i}`,
        name: '1x1',
        matrix: [[1]],
        color: '#FFFFFF',
        used: false
      };
    }

    engine.placePiece(0, 0, 0);
    expect(engine.currentPieces[0].used).toBe(true);
    engine.placePiece(1, 0, 1);
    expect(engine.currentPieces[1].used).toBe(true);
    const res3 = engine.placePiece(2, 0, 2);

    expect(res3.newRoundStarted).toBe(true);
    expect(engine.currentPieces.length).toBe(3);
    expect(engine.currentPieces.every(p => !p.used)).toBe(true);
  });

  it('detects game over ONLY when no available piece can fit anywhere', () => {
    // Fill the entire board with blocks
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        engine.grid[r][c] = '#999999';
      }
    }

    // Board has only one empty cell at (9, 9)
    engine.grid[9][9] = null;

    // Piece is a 2x2 square, which cannot fit into a 1x1 empty cell
    engine.currentPieces[0] = {
      id: 'big_square',
      name: '2x2',
      matrix: [[1, 1], [1, 1]],
      color: '#FB5607',
      used: false
    };
    engine.currentPieces[1] = {
      id: 'p2',
      name: '3x1',
      matrix: [[1], [1], [1]],
      color: '#06D6A0',
      used: false
    };
    engine.currentPieces[2] = {
      id: 'p3',
      name: '1x3',
      matrix: [[1, 1, 1]],
      color: '#8338EC',
      used: false
    };

    expect(engine.checkGameOver()).toBe(true);

    // If we replace one piece with a 1x1 dot, game over should be false!
    engine.currentPieces[0] = {
      id: 'dot',
      name: '1x1',
      matrix: [[1]],
      color: '#FFBE0B',
      used: false
    };
    expect(engine.checkGameOver()).toBe(false);
  });

  it('allows valid placement at all four corners and edges', () => {
    const dot = {
      id: 'corner_dot',
      name: '1x1',
      matrix: [[1]],
      color: '#FFBE0B',
      used: false
    };

    // (0,0) Top-left corner
    expect(engine.canPlacePiece(dot, 0, 0)).toBe(true);
    // (0,9) Top-right corner
    expect(engine.canPlacePiece(dot, 0, 9)).toBe(true);
    // (9,0) Bottom-left corner
    expect(engine.canPlacePiece(dot, 9, 0)).toBe(true);
    // (9,9) Bottom-right corner
    expect(engine.canPlacePiece(dot, 9, 9)).toBe(true);

    // Multi-cell pieces at bottom and right edges
    const bar2x1 = {
      id: 'bar2x1',
      name: '2x1',
      matrix: [[1], [1]],
      color: '#3A86FF',
      used: false
    };
    // Can place at bottom edge row 8 (occupies 8 and 9)
    expect(engine.canPlacePiece(bar2x1, 8, 9)).toBe(true);
    // Cannot place at bottom edge row 9 (would overflow to 10)
    expect(engine.canPlacePiece(bar2x1, 9, 9)).toBe(false);

    const bar1x2 = {
      id: 'bar1x2',
      name: '1x2',
      matrix: [[1, 1]],
      color: '#3A86FF',
      used: false
    };
    // Can place at right edge col 8 (occupies 8 and 9)
    expect(engine.canPlacePiece(bar1x2, 9, 8)).toBe(true);
    // Cannot place at right edge col 9 (would overflow to 10)
    expect(engine.canPlacePiece(bar1x2, 9, 9)).toBe(false);
  });

  it('correctly serializes and deserializes game state for save and resume', () => {
    engine.grid[0][0] = '#FF0000';
    engine.grid[9][9] = '#00FF00';
    engine.score = 450;
    engine.comboStreak = 3;
    engine.currentPieces[0].used = true;

    const serialized = engine.serialize();
    expect(serialized.score).toBe(450);
    expect(serialized.comboStreak).toBe(3);
    expect(serialized.grid[0][0]).toBe('#FF0000');
    expect(serialized.grid[9][9]).toBe('#00FF00');
    expect(serialized.currentPieces[0].used).toBe(true);

    const resumedEngine = new BlockFitEngine(serialized);
    expect(resumedEngine.score).toBe(450);
    expect(resumedEngine.comboStreak).toBe(3);
    expect(resumedEngine.grid[0][0]).toBe('#FF0000');
    expect(resumedEngine.grid[9][9]).toBe('#00FF00');
    expect(resumedEngine.currentPieces[0].used).toBe(true);
  });
});
