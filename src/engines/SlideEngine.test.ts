import { describe, it, expect, beforeEach } from 'vitest';
import { SlideEngine } from './SlideEngine';

describe('SlideEngine', () => {
  let engine3: SlideEngine;
  let engine4: SlideEngine;

  beforeEach(() => {
    engine3 = new SlideEngine(3);
    engine4 = new SlideEngine(4);
  });

  it('initializes boards of sizes 3x3 and 4x4 with correct tile counts', () => {
    expect(engine3.tiles.length).toBe(9);
    expect(engine4.tiles.length).toBe(16);

    // Must contain all numbers 0 through size^2 - 1 exactly once
    const set3 = new Set(engine3.tiles);
    expect(set3.size).toBe(9);
    for (let i = 0; i < 9; i++) expect(set3.has(i)).toBe(true);

    const set4 = new Set(engine4.tiles);
    expect(set4.size).toBe(16);
    for (let i = 0; i < 16; i++) expect(set4.has(i)).toBe(true);

    expect(engine3.checkWin()).toBe(false); // Scramble must never start pre-solved
  });

  it('correctly identifies valid adjacent tiles that can slide', () => {
    // 3x3 board where 0 is at center (row 1, col 1 -> index 4)
    engine3.tiles = [
      1, 2, 3,
      4, 0, 5,
      6, 7, 8
    ];

    expect(engine3.getEmptyIndex()).toBe(4);
    // Orthogonal neighbors: 1 (up), 7 (down), 3 (left), 5 (right) in indices: 1, 7, 3, 5
    expect(engine3.canSlideTile(1)).toBe(true); // row 0, col 1
    expect(engine3.canSlideTile(7)).toBe(true); // row 2, col 1
    expect(engine3.canSlideTile(3)).toBe(true); // row 1, col 0
    expect(engine3.canSlideTile(5)).toBe(true); // row 1, col 2

    // Non-neighbors (corners or 0 itself)
    expect(engine3.canSlideTile(0)).toBe(false); // row 0, col 0 (diagonal)
    expect(engine3.canSlideTile(4)).toBe(false); // 0 itself
    expect(engine3.canSlideTile(8)).toBe(false); // row 2, col 2
  });

  it('slides tile into empty space and swaps their positions', () => {
    engine3.tiles = [
      1, 2, 3,
      4, 0, 5,
      6, 7, 8
    ];

    const result = engine3.slideTile(1); // tile with value 2 at index 1
    expect(result.moved).toBe(true);
    expect(result.tileValue).toBe(2);
    expect(engine3.tiles[1]).toBe(0);
    expect(engine3.tiles[4]).toBe(2);
    expect(engine3.moves).toBe(1);
  });

  it('supports directional slide', () => {
    engine3.tiles = [
      1, 2, 3,
      4, 0, 5,
      6, 7, 8
    ];

    // sliding 'up' pulls the tile from bottom (index 7, val 7) into empty (index 4)
    const result = engine3.slideDirection('up');
    expect(result.moved).toBe(true);
    expect(result.tileValue).toBe(7);
    expect(engine3.tiles[4]).toBe(7);
    expect(engine3.tiles[7]).toBe(0);
  });

  it('detects victory correctly', () => {
    engine3.tiles = [
      1, 2, 3,
      4, 5, 6,
      7, 8, 0
    ];

    expect(engine3.checkWin()).toBe(true);

    engine3.tiles = [
      1, 2, 3,
      4, 5, 6,
      7, 0, 8
    ];
    expect(engine3.checkWin()).toBe(false);
  });

  it('scrambler always generates solvable combinations', () => {
    for (let i = 0; i < 5; i++) {
      const scrambled = SlideEngine.generateSolvableScramble(3, 40);
      expect(scrambled.length).toBe(9);
      expect(new Set(scrambled).size).toBe(9);
    }
  });
});
