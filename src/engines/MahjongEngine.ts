export type MahjongSuit = 'circle' | 'bamboo' | 'gem' | 'wind' | 'star';

export interface MahjongTile {
  id: string;
  x: number;
  y: number;
  z: number;
  suit: MahjongSuit;
  value: number;
  isRemoved: boolean;
}

export interface MahjongSelectResult {
  matched: boolean;
  selectedId: string | null;
  removedPair?: [string, string];
  win: boolean;
  error?: string;
}

export const MAHJONG_TARGET_COUNTS = [
  24, 26, 28, 30, 32, // Levels 1-5 (Easy)
  36, 40, 42, 44, 48, 52, 56, // Levels 6-12 (Medium)
  60, 62, 64, 66, 68, 70, 72, 72 // Levels 13-20 (Hard)
];

const SUITS: MahjongSuit[] = ['circle', 'bamboo', 'gem', 'wind', 'star'];

function checkOverlap(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
  return Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2;
}

function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export class MahjongEngine {
  public level: number;
  public tiles: MahjongTile[] = [];
  public selectedTileId: string | null = null;
  public moves = 0;
  public won = false;
  public history: { tile1Id: string; tile2Id: string }[] = [];
  public elapsedSeconds = 0;

  constructor(level = 1, savedState?: any) {
    this.level = Math.max(1, Math.min(20, level));
    if (savedState && savedState.tiles && Array.isArray(savedState.tiles) && !savedState.won && (savedState.level === undefined || savedState.level === level)) {
      this.level = savedState.level ?? level;
      this.tiles = savedState.tiles.map((t: any) => ({ ...t }));
      this.selectedTileId = savedState.selectedTileId ?? null;
      this.moves = savedState.moves ?? 0;
      this.history = savedState.history ? savedState.history.map((h: any) => ({ ...h })) : [];
      this.elapsedSeconds = savedState.elapsedSeconds ?? 0;
      this.won = this.checkWin();
    } else {
      this.loadLevel(this.level);
    }
  }

  public loadLevel(level: number): void {
    this.level = Math.max(1, Math.min(20, level));
    this.moves = 0;
    this.history = [];
    this.selectedTileId = null;
    this.won = false;
    this.elapsedSeconds = 0;

    this.tiles = MahjongEngine.generateSolvableLayout(this.level);
  }

  public restart(): void {
    this.loadLevel(this.level);
  }

  public getTile(id: string): MahjongTile | undefined {
    return this.tiles.find(t => t.id === id);
  }

  public isTileFree(tileId: string): boolean {
    const tile = this.getTile(tileId);
    if (!tile || tile.isRemoved) return false;
    return MahjongEngine.isTileFreeInSet(tile, this.tiles);
  }

  public static isTileFreeInSet(tile: { x: number; y: number; z: number; isRemoved: boolean }, allTiles: { x: number; y: number; z: number; isRemoved: boolean }[]): boolean {
    if (tile.isRemoved) return false;

    // 1. Check if covered from above
    for (let i = 0; i < allTiles.length; i++) {
      const o = allTiles[i];
      if (!o.isRemoved && o.z > tile.z && checkOverlap(tile, o)) {
        return false;
      }
    }

    // 2. Check if blocked on both left and right
    let hasLeft = false;
    let hasRight = false;
    for (let i = 0; i < allTiles.length; i++) {
      const o = allTiles[i];
      if (!o.isRemoved && o.z === tile.z) {
        if (o.x === tile.x - 2 && Math.abs(o.y - tile.y) < 2) {
          hasLeft = true;
        }
        if (o.x === tile.x + 2 && Math.abs(o.y - tile.y) < 2) {
          hasRight = true;
        }
      }
    }

    return !hasLeft || !hasRight;
  }

  public selectTile(tileId: string): MahjongSelectResult {
    if (this.won) {
      return { matched: false, selectedId: this.selectedTileId, win: true };
    }

    const tile = this.getTile(tileId);
    if (!tile || tile.isRemoved) {
      return { matched: false, selectedId: this.selectedTileId, win: false, error: 'Tile not found or already removed' };
    }

    if (!this.isTileFree(tileId)) {
      return { matched: false, selectedId: this.selectedTileId, win: false, error: 'Tile is blocked' };
    }

    // If clicking already selected tile, deselect it
    if (this.selectedTileId === tileId) {
      this.selectedTileId = null;
      return { matched: false, selectedId: null, win: false };
    }

    // If no tile currently selected, select this one
    if (!this.selectedTileId) {
      this.selectedTileId = tileId;
      return { matched: false, selectedId: tileId, win: false };
    }

    // Compare with currently selected tile
    const prevTile = this.getTile(this.selectedTileId);
    if (!prevTile || prevTile.isRemoved || !this.isTileFree(prevTile.id)) {
      this.selectedTileId = tileId;
      return { matched: false, selectedId: tileId, win: false };
    }

    // Check if match
    if (prevTile.suit === tile.suit && prevTile.value === tile.value) {
      // Valid Match!
      prevTile.isRemoved = true;
      tile.isRemoved = true;
      const pair: [string, string] = [prevTile.id, tile.id];
      this.history.push({ tile1Id: prevTile.id, tile2Id: tile.id });
      this.selectedTileId = null;
      this.moves++;
      this.won = this.checkWin();

      return {
        matched: true,
        selectedId: null,
        removedPair: pair,
        win: this.won
      };
    } else {
      // Not a match: switch selection to the new tile
      this.selectedTileId = tileId;
      return { matched: false, selectedId: tileId, win: false };
    }
  }

  public undo(): boolean {
    if (this.history.length === 0) return false;

    const last = this.history.pop()!;
    const t1 = this.getTile(last.tile1Id);
    const t2 = this.getTile(last.tile2Id);

    if (t1) t1.isRemoved = false;
    if (t2) t2.isRemoved = false;

    this.selectedTileId = null;
    this.won = false;
    return true;
  }

  public canUndo(): boolean {
    return this.history.length > 0;
  }

  public getAvailablePairs(): [MahjongTile, MahjongTile][] {
    const freeTiles = this.tiles.filter(t => !t.isRemoved && this.isTileFree(t.id));
    const pairs: [MahjongTile, MahjongTile][] = [];

    for (let i = 0; i < freeTiles.length; i++) {
      for (let j = i + 1; j < freeTiles.length; j++) {
        const a = freeTiles[i];
        const b = freeTiles[j];
        if (a.suit === b.suit && a.value === b.value) {
          pairs.push([a, b]);
        }
      }
    }

    return pairs;
  }

  public getHint(): [MahjongTile, MahjongTile] | null {
    const pairs = this.getAvailablePairs();
    if (pairs.length === 0) return null;
    return pairs[0];
  }

  public isStuck(): boolean {
    if (this.won || this.getRemainingTileCount() === 0) return false;
    return this.getAvailablePairs().length === 0;
  }

  public getRemainingTileCount(): number {
    return this.tiles.filter(t => !t.isRemoved).length;
  }

  public checkWin(): boolean {
    return this.tiles.length > 0 && this.tiles.every(t => t.isRemoved);
  }

  public shuffle(): boolean {
    const remaining = this.tiles.filter(t => !t.isRemoved);
    if (remaining.length <= 1) return false;

    // Deselect any current tile
    this.selectedTileId = null;

    // Collect face assignments of all remaining tiles
    const faces = remaining.map(t => ({ suit: t.suit, value: t.value }));

    // Shuffle faces until at least 1 legal pair is free, up to 100 attempts
    for (let attempt = 0; attempt < 100; attempt++) {
      // Fisher-Yates shuffle
      for (let i = faces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = faces[i];
        faces[i] = faces[j];
        faces[j] = temp;
      }

      // Apply to remaining tiles
      for (let i = 0; i < remaining.length; i++) {
        remaining[i].suit = faces[i].suit;
        remaining[i].value = faces[i].value;
      }

      // Check if there is at least one pair available
      if (this.getAvailablePairs().length > 0) {
        return true;
      }
    }

    return false;
  }

  public serialize(): any {
    return {
      level: this.level,
      tiles: this.tiles.map(t => ({ ...t })),
      selectedTileId: this.selectedTileId,
      moves: this.moves,
      elapsedSeconds: this.elapsedSeconds,
      won: this.won,
      history: this.history.map(h => ({ ...h }))
    };
  }

  // Generate Solvable Layout for Level 1..20
  public static generateSolvableLayout(level: number): MahjongTile[] {
    const safeLevel = Math.max(1, Math.min(20, level));
    const targetCount = MAHJONG_TARGET_COUNTS[safeLevel - 1];
    const coords: { id: string; x: number; y: number; z: number; isRemoved: boolean }[] = [];

    const exists = (x: number, y: number, z: number) => coords.some(c => c.x === x && c.y === y && c.z === z);
    const add = (x: number, y: number, z: number) => {
      if (!exists(x, y, z)) coords.push({ id: `t_${coords.length}`, x, y, z, isRemoved: false });
    };
    const addSym = (x: number, y: number, z: number, midX: number) => {
      add(x, y, z);
      const oppX = 2 * midX - x;
      if (oppX !== x) add(oppX, y, z);
    };

    const rng = mulberry32(safeLevel * 1337);
    const cols = 6 + Math.min(4, Math.floor(safeLevel / 3));
    const rows = 4 + Math.min(3, Math.floor(safeLevel / 4));
    const coreY = rows * 2;
    const coreX = cols * 2;
    const midX = Math.floor(coreX / 2);

    const candidates: { x: number; y: number; dist: number }[] = [];
    for (let y = 0; y < coreY; y += 2) {
      for (let x = 0; x <= midX; x += 2) {
        const dx = Math.abs(x - midX);
        const dy = Math.abs(y - Math.floor(coreY / 2));
        candidates.push({ x, y, dist: dx + dy });
      }
    }

    const shape = safeLevel % 4;
    if (shape === 0) candidates.sort((a, b) => a.dist - b.dist);
    else if (shape === 1) candidates.sort((a, b) => (a.x * a.x + a.y * a.y) - (b.x * b.x + b.y * b.y));
    else candidates.sort(() => rng() - 0.5);

    for (const c of candidates) {
      if (coords.length >= targetCount - 6) break;
      addSym(c.x, c.y, 0, midX);
    }

    // Upper layers for depth
    if (targetCount >= 32) {
      for (let y = 2; y < coreY - 2; y += 2) {
        for (let x = 2; x <= midX; x += 2) {
          if (coords.length >= targetCount - 2) break;
          addSym(x + 1, y + 1, 1, midX);
        }
      }
    }

    if (targetCount >= 56) {
      add(midX, Math.floor(coreY / 2), 2);
      if (midX % 2 === 0) add(midX + 2, Math.floor(coreY / 2), 2);
    }

    while (coords.length > targetCount) coords.pop();
    if (coords.length % 2 !== 0) coords.pop();

    let wingY = Math.floor(coreY / 4) * 2;
    let wingX = -2;
    while (coords.length < targetCount) {
      addSym(wingX, wingY, 0, midX);
      wingY = (wingY + 2) % coreY;
      if (wingY === 0) wingX -= 2;
    }

    const baseTiles: MahjongTile[] = coords.slice(0, targetCount).map((c, i) => ({
      id: `m_${i}`,
      x: c.x,
      y: c.y,
      z: c.z,
      suit: 'circle',
      value: 1,
      isRemoved: false
    }));

    // Reverse Solvable Face Assignment
    const simTiles = baseTiles.map(t => ({ ...t, isRemoved: false }));
    const simRng = mulberry32(safeLevel * 1001);

    const availableFaces: { suit: MahjongSuit; value: number }[] = [];
    for (const s of SUITS) {
      const maxVal = (s === 'wind' || s === 'star') ? 4 : 9;
      for (let v = 1; v <= maxVal; v++) {
        availableFaces.push({ suit: s, value: v });
      }
    }

    let faceIdx = 0;
    const numPairs = baseTiles.length / 2;

    for (let step = 0; step < numPairs; step++) {
      const free = simTiles.filter(t => !t.isRemoved && MahjongEngine.isTileFreeInSet(t, simTiles));
      if (free.length < 2) {
        // Fallback in rare case: pick any 2 unremoved
        const remaining = simTiles.filter(t => !t.isRemoved);
        if (remaining.length >= 2) {
          free.push(remaining[0], remaining[1]);
        }
      }

      const idx1 = Math.floor(simRng() * free.length);
      const t1 = free[idx1];
      free.splice(idx1, 1);
      const idx2 = Math.floor(simRng() * free.length);
      const t2 = free[idx2];

      const face = availableFaces[faceIdx % availableFaces.length];
      faceIdx++;

      t1.isRemoved = true;
      t2.isRemoved = true;

      const target1 = baseTiles.find(bt => bt.id === t1.id);
      const target2 = baseTiles.find(bt => bt.id === t2.id);
      if (target1) {
        target1.suit = face.suit;
        target1.value = face.value;
      }
      if (target2) {
        target2.suit = face.suit;
        target2.value = face.value;
      }
    }

    return baseTiles;
  }
}
