import { describe, it, expect, beforeEach } from 'vitest';
import { ColorSortEngine } from './ColorSortEngine';

describe('ColorSortEngine', () => {
  let engine: ColorSortEngine;

  beforeEach(() => {
    engine = new ColorSortEngine(1);
  });

  it('initializes with valid tubes and capacity 4', () => {
    expect(engine.tubes.length).toBeGreaterThanOrEqual(4);
    expect(engine.tubeCapacity).toBe(4);
    expect(engine.moves).toBe(0);
    expect(engine.won).toBe(false);
  });

  it('allows pouring into an empty tube', () => {
    engine.tubes = [
      [1, 2, 3, 4],
      []
    ];

    expect(engine.canPour(0, 1)).toBe(true);
    const result = engine.pour(0, 1);
    expect(result.valid).toBe(true);
    expect(result.unitsMoved).toBe(1);
    expect(result.colorMoved).toBe(4);
    expect(engine.tubes[0]).toEqual([1, 2, 3]);
    expect(engine.tubes[1]).toEqual([4]);
    expect(engine.moves).toBe(1);
  });

  it('allows pouring onto the same top color', () => {
    engine.tubes = [
      [1, 2, 3, 3],
      [1, 2, 3]
    ];

    expect(engine.canPour(0, 1)).toBe(true);
    const result = engine.pour(0, 1);
    expect(result.valid).toBe(true);
    expect(result.unitsMoved).toBe(1); // Destination only had room for 1
    expect(engine.tubes[0]).toEqual([1, 2, 3]);
    expect(engine.tubes[1]).toEqual([1, 2, 3, 3]);
  });

  it('transfers multiple contiguous units if target has room', () => {
    engine.tubes = [
      [1, 2, 3, 3],
      [4, 3]
    ];

    expect(engine.canPour(0, 1)).toBe(true);
    const result = engine.pour(0, 1);
    expect(result.valid).toBe(true);
    expect(result.unitsMoved).toBe(2);
    expect(engine.tubes[0]).toEqual([1, 2]);
    expect(engine.tubes[1]).toEqual([4, 3, 3, 3]);
  });

  it('rejects invalid pour when top colors do not match', () => {
    engine.tubes = [
      [1, 2, 3, 4],
      [1, 2, 3, 2]
    ];

    expect(engine.canPour(0, 1)).toBe(false);
    const result = engine.pour(0, 1);
    expect(result.valid).toBe(false);
    expect(engine.moves).toBe(0);
  });

  it('rejects pour when destination is full', () => {
    engine.tubes = [
      [1, 2, 3, 4],
      [1, 2, 3, 4]
    ];

    expect(engine.canPour(0, 1)).toBe(false);
  });

  it('detects victory when all filled tubes are monochromatic and full', () => {
    engine.tubes = [
      [1, 1, 1, 1],
      [2, 2, 2, 2],
      []
    ];

    expect(engine.checkWin()).toBe(true);
  });

  it('supports undoing pours', () => {
    engine.tubes = [
      [1, 2, 3, 4],
      []
    ];

    engine.pour(0, 1);
    expect(engine.tubes[1]).toEqual([4]);
    expect(engine.canUndo()).toBe(true);

    const undone = engine.undo();
    expect(undone).toBe(true);
    expect(engine.tubes[0]).toEqual([1, 2, 3, 4]);
    expect(engine.tubes[1]).toEqual([]);
    expect(engine.moves).toBe(0);
  });

  it('BFS solver returns a valid executable hint', () => {
    engine.tubes = [
      [1, 1, 1],
      [2, 2, 2, 1],
      [2]
    ];

    const hint = engine.getHint();
    expect(hint).not.toBeNull();
    if (hint) {
      expect(engine.canPour(hint.fromTube, hint.toTube)).toBe(true);
    }
  });

  it('generates solvable levels where BFS finds a solution', () => {
    const generated = ColorSortEngine.generateSolvableLevel(3, 2, 4, 42);
    expect(generated.length).toBe(5);
    const hint = ColorSortEngine.solveBFS(generated, 4, 1500);
    expect(hint).not.toBeNull();
  });

  it('rejects stale won savedState when requested level is new or won', () => {
    const wonSavedState = {
      level: 1,
      won: true,
      moves: 8,
      tubeCapacity: 4,
      tubes: [[1, 1, 1, 1], [2, 2, 2, 2], []]
    };

    // Advancing to level 2 with level 1 won saved state must load fresh level 2
    const level2Engine = new ColorSortEngine(2, wonSavedState);
    expect(level2Engine.level).toBe(2);
    expect(level2Engine.won).toBe(false);
    expect(level2Engine.moves).toBe(0);

    // Starting level 1 again with won state must also load fresh level 1
    const freshLevel1 = new ColorSortEngine(1, wonSavedState);
    expect(freshLevel1.level).toBe(1);
    expect(freshLevel1.won).toBe(false);
    expect(freshLevel1.moves).toBe(0);
  });

  it('correctly loads all 30 progressive levels without overflow or crashing', () => {
    for (let lvl = 1; lvl <= 30; lvl++) {
      engine.loadLevel(lvl);
      expect(engine.level).toBe(lvl);
      expect(engine.moves).toBe(0);
      expect(engine.won).toBe(false);
      expect(engine.tubes.length).toBeGreaterThanOrEqual(5);
      // Ensure there is at least one empty tube available to begin solving
      const emptyTubes = engine.tubes.filter(t => t.length === 0);
      expect(emptyTubes.length).toBeGreaterThanOrEqual(1);
    }
  });
});
