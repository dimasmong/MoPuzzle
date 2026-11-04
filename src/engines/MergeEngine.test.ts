import { describe, it, expect, beforeEach } from 'vitest';
import { MergeEngine } from './MergeEngine';

describe('MergeEngine', () => {
  let engine: MergeEngine;

  beforeEach(() => {
    engine = new MergeEngine('classic');
  });

  it('initializes with a 4x4 board and exactly 2 tiles', () => {
    expect(engine.board.length).toBe(4);
    expect(engine.board[0].length).toBe(4);

    let nonZeroCount = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (engine.board[r][c] !== 0) {
          nonZeroCount++;
          expect([2, 4]).toContain(engine.board[r][c]);
        }
      }
    }
    expect(nonZeroCount).toBe(2);
    expect(engine.score).toBe(0);
    expect(engine.moves).toBe(0);
    expect(engine.gameOver).toBe(false);
  });

  it('correctly implements the single-merge rule (e.g. 2,2,2,2 -> 4,4,0,0)', () => {
    engine.board = [
      [2, 2, 2, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];

    const { moved, scoreGain } = engine.slide('left');
    expect(moved).toBe(true);
    expect(scoreGain).toBe(8); // 4 + 4
    expect(engine.board[0]).toEqual([4, 4, 0, 0]);
  });

  it('does not double merge already merged tiles in same turn', () => {
    engine.board = [
      [2, 2, 4, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];

    const { moved, scoreGain } = engine.slide('left');
    expect(moved).toBe(true);
    expect(scoreGain).toBe(4);
    // [2, 2] merges to 4, but cannot merge with the subsequent 4 in the same move
    expect(engine.board[0]).toEqual([4, 4, 0, 0]);
  });

  it('invalid move does not change board or spawn tiles', () => {
    engine.board = [
      [2, 0, 0, 0],
      [4, 0, 0, 0],
      [8, 0, 0, 0],
      [16, 0, 0, 0]
    ];

    const beforeBoard = engine.board.map(r => [...r]);
    const result = engine.move('left');

    expect(result.moved).toBe(false);
    expect(result.spawnedTile).toBeUndefined();
    expect(engine.board).toEqual(beforeBoard);
    expect(engine.moves).toBe(0);
  });

  it('supports undoing previous moves correctly', () => {
    engine.board = [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    engine.score = 10;
    engine.moves = 5;

    const initialBoard = engine.board.map(r => [...r]);
    engine.move('left');

    expect(engine.score).toBe(14);
    expect(engine.moves).toBe(6);
    expect(engine.canUndo()).toBe(true);

    const undone = engine.undo();
    expect(undone).toBe(true);
    expect(engine.board).toEqual(initialBoard);
    expect(engine.score).toBe(10);
    expect(engine.moves).toBe(5);
  });

  it('detects victory when 2048 tile is achieved', () => {
    engine.board = [
      [1024, 1024, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];

    const result = engine.move('left');
    expect(result.won).toBe(true);
    expect(engine.won).toBe(true);
    expect(engine.board[0][0]).toBe(2048);
  });

  it('detects game over when board is completely full and no moves exist', () => {
    engine.board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2]
    ];

    expect(engine.checkGameOver()).toBe(true);
    const result = engine.move('up');
    expect(result.moved).toBe(false);
    expect(result.gameOver).toBe(true);
  });

  it('serializes and resumes correctly', () => {
    engine.board = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    engine.score = 512;
    engine.moves = 25;

    const serialized = engine.serialize();
    const restoredEngine = new MergeEngine('classic', serialized);

    expect(restoredEngine.board).toEqual(engine.board);
    expect(restoredEngine.score).toBe(512);
    expect(restoredEngine.moves).toBe(25);
  });
});
