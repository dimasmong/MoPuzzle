import { describe, it, expect } from 'vitest';
import { MahjongEngine, MAHJONG_TARGET_COUNTS } from './MahjongEngine';

describe('MahjongEngine', () => {
  it('initializes level 1 correctly with 24 tiles', () => {
    const engine = new MahjongEngine(1);
    expect(engine.level).toBe(1);
    expect(engine.tiles.length).toBe(24);
    expect(engine.moves).toBe(0);
    expect(engine.won).toBe(false);
    expect(engine.selectedTileId).toBeNull();
    expect(engine.getRemainingTileCount()).toBe(24);
  });

  it('generates all 20 levels with correct tile counts and initial available pairs', () => {
    for (let lvl = 1; lvl <= 20; lvl++) {
      const engine = new MahjongEngine(lvl);
      expect(engine.tiles.length).toBe(MAHJONG_TARGET_COUNTS[lvl - 1]);
      const available = engine.getAvailablePairs();
      expect(available.length).toBeGreaterThan(0);
      expect(engine.getHint()).not.toBeNull();
    }
  });

  it('correctly identifies free vs blocked tiles', () => {
    const engine = new MahjongEngine(1);
    const freeTiles = engine.tiles.filter(t => engine.isTileFree(t.id));
    expect(freeTiles.length).toBeGreaterThan(0);

    // If a tile is covered from above, it should NOT be free
    const topLayerTile = engine.tiles.find(t => t.z > 0);
    if (topLayerTile) {
      // Find a tile underneath it
      const coveredTile = engine.tiles.find(
        t => t.z < topLayerTile.z &&
        Math.abs(t.x - topLayerTile.x) < 2 &&
        Math.abs(t.y - topLayerTile.y) < 2
      );
      if (coveredTile) {
        expect(engine.isTileFree(coveredTile.id)).toBe(false);
      }
    }
  });

  it('handles tile selection and matching', () => {
    const engine = new MahjongEngine(1);
    const pairs = engine.getAvailablePairs();
    expect(pairs.length).toBeGreaterThan(0);

    const [t1, t2] = pairs[0];

    // Select first tile
    const res1 = engine.selectTile(t1.id);
    expect(res1.selectedId).toBe(t1.id);
    expect(res1.matched).toBe(false);
    expect(engine.selectedTileId).toBe(t1.id);

    // Deselect if clicked again
    const resDeselect = engine.selectTile(t1.id);
    expect(resDeselect.selectedId).toBeNull();
    expect(engine.selectedTileId).toBeNull();

    // Re-select first tile
    engine.selectTile(t1.id);

    // Match with second tile
    const res2 = engine.selectTile(t2.id);
    expect(res2.matched).toBe(true);
    expect(res2.selectedId).toBeNull();
    expect(engine.selectedTileId).toBeNull();
    expect(engine.moves).toBe(1);
    expect(engine.getRemainingTileCount()).toBe(22);
    expect(t1.isRemoved).toBe(true);
    expect(t2.isRemoved).toBe(true);
  });

  it('supports undo', () => {
    const engine = new MahjongEngine(1);
    const [t1, t2] = engine.getAvailablePairs()[0];

    engine.selectTile(t1.id);
    engine.selectTile(t2.id);

    expect(engine.getRemainingTileCount()).toBe(22);
    expect(engine.canUndo()).toBe(true);

    const undone = engine.undo();
    expect(undone).toBe(true);
    expect(engine.getRemainingTileCount()).toBe(24);
    expect(t1.isRemoved).toBe(false);
    expect(t2.isRemoved).toBe(false);
    expect(engine.canUndo()).toBe(false);
  });

  it('supports shuffle when remaining tiles exist', () => {
    const engine = new MahjongEngine(1);
    const shuffled = engine.shuffle();
    expect(shuffled).toBe(true);
    expect(engine.getAvailablePairs().length).toBeGreaterThan(0);
  });

  it('serializes and restores from saved state correctly', () => {
    const engine = new MahjongEngine(1);
    const [t1, t2] = engine.getAvailablePairs()[0];
    engine.selectTile(t1.id);
    engine.selectTile(t2.id);

    const serialized = engine.serialize();
    expect(serialized.level).toBe(1);
    expect(serialized.moves).toBe(1);
    expect(serialized.history.length).toBe(1);

    const restored = new MahjongEngine(1, serialized);
    expect(restored.moves).toBe(1);
    expect(restored.getRemainingTileCount()).toBe(22);
    expect(restored.getTile(t1.id)?.isRemoved).toBe(true);
    expect(restored.getTile(t2.id)?.isRemoved).toBe(true);
  });

  it('detects win when all tiles are removed', () => {
    const engine = new MahjongEngine(1);
    // Mark all tiles removed
    for (const tile of engine.tiles) {
      tile.isRemoved = true;
    }
    expect(engine.checkWin()).toBe(true);
  });
});
