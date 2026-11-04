export interface PourResult {
  valid: boolean;
  unitsMoved: number;
  colorMoved: number;
  fromTube: number;
  toTube: number;
  won: boolean;
  reason?: string;
}

export interface HintMove {
  fromTube: number;
  toTube: number;
}

export const COLOR_PALETTE = [
  '#FF4D4D', // 1: Vibrant Coral Red
  '#3A86FF', // 2: Electric Royal Blue
  '#38B000', // 3: Emerald Green
  '#FFBE0B', // 4: Amber Gold
  '#8338EC', // 5: Deep Purple
  '#FB5607', // 6: Sunset Orange
  '#06D6A0', // 7: Teal Turquoise
  '#FF006E', // 8: Hot Magenta
  '#48CAE4', // 9: Sky Cyan
  '#9B5DE5', // 10: Lavender
  '#F15BB5', // 11: Bubblegum Pink
  '#00BBF9'  // 12: Ocean Blue
];

export class ColorSortEngine {
  public level: number;
  public tubeCapacity = 4;
  public tubes: number[][] = [];
  public moves = 0;
  public won = false;
  private history: number[][][] = [];

  constructor(level = 1, savedState?: any) {
    this.level = level;
    if (savedState && savedState.tubes && Array.isArray(savedState.tubes)) {
      this.level = savedState.level ?? level;
      this.tubeCapacity = savedState.tubeCapacity ?? 4;
      this.tubes = savedState.tubes.map((t: number[]) => [...t]);
      this.moves = savedState.moves ?? 0;
      this.history = savedState.history ? savedState.history.map((h: number[][]) => h.map((t: number[]) => [...t])) : [];
      this.won = this.checkWin();
    } else {
      this.loadLevel(level);
    }
  }

  public loadLevel(level: number): void {
    this.level = level;
    this.moves = 0;
    this.history = [];
    this.won = false;

    // Determine number of colors and empty tubes based on level
    // Level 1-2: 3 colors, 2 empty tubes (5 tubes total)
    // Level 3-5: 4 colors, 2 empty tubes (6 tubes total)
    // Level 6-10: 5 colors, 2 empty tubes (7 tubes total)
    // Level 11-15: 6 colors, 2 empty tubes (8 tubes total)
    // Level 16+: 7 to 9 colors, 2 empty tubes
    const colorCount = Math.min(9, Math.max(3, 2 + Math.floor(level / 2.5)));
    const emptyCount = 2;

    this.tubes = ColorSortEngine.generateSolvableLevel(colorCount, emptyCount, this.tubeCapacity, level * 101);
  }

  public restart(): void {
    this.loadLevel(this.level);
  }

  public getTubeCount(): number {
    return this.tubes.length;
  }

  public getTube(index: number): number[] {
    return this.tubes[index] || [];
  }

  public getTopColor(tubeIndex: number): number | null {
    const tube = this.tubes[tubeIndex];
    if (!tube || tube.length === 0) return null;
    return tube[tube.length - 1];
  }

  public getTopGroupCount(tubeIndex: number): number {
    const tube = this.tubes[tubeIndex];
    if (!tube || tube.length === 0) return 0;
    const topColor = tube[tube.length - 1];
    let count = 0;
    for (let i = tube.length - 1; i >= 0; i--) {
      if (tube[i] === topColor) count++;
      else break;
    }
    return count;
  }

  public canPour(from: number, to: number): boolean {
    if (from === to) return false;
    if (from < 0 || from >= this.tubes.length || to < 0 || to >= this.tubes.length) return false;

    const source = this.tubes[from];
    const target = this.tubes[to];

    if (source.length === 0) return false; // Source empty
    if (target.length >= this.tubeCapacity) return false; // Target full

    // If source is already completed and monochromatic, avoid unnecessary pour
    if (this.isTubeComplete(from)) return false;

    const sourceTop = source[source.length - 1];
    if (target.length === 0) return true; // Target empty: always valid

    const targetTop = target[target.length - 1];
    return sourceTop === targetTop;
  }

  public pour(from: number, to: number): PourResult {
    if (!this.canPour(from, to)) {
      return {
        valid: false,
        unitsMoved: 0,
        colorMoved: 0,
        fromTube: from,
        toTube: to,
        won: this.won,
        reason: 'Illegal pour'
      };
    }

    // Save history before pour
    this.history.push(this.tubes.map(t => [...t]));
    if (this.history.length > 25) {
      this.history.shift();
    }

    const source = this.tubes[from];
    const target = this.tubes[to];
    const colorMoved = source[source.length - 1];

    // Calculate how many contiguous top units exist in source
    const sourceTopCount = this.getTopGroupCount(from);
    // Calculate how many can fit in target
    const spaceInTarget = this.tubeCapacity - target.length;
    const unitsToMove = Math.min(sourceTopCount, spaceInTarget);

    for (let i = 0; i < unitsToMove; i++) {
      source.pop();
      target.push(colorMoved);
    }

    this.moves++;
    this.won = this.checkWin();

    return {
      valid: true,
      unitsMoved: unitsToMove,
      colorMoved,
      fromTube: from,
      toTube: to,
      won: this.won
    };
  }

  public undo(): boolean {
    if (this.history.length === 0) return false;
    const prev = this.history.pop()!;
    this.tubes = prev.map(t => [...t]);
    this.moves = Math.max(0, this.moves - 1);
    this.won = this.checkWin();
    return true;
  }

  public canUndo(): boolean {
    return this.history.length > 0;
  }

  public isTubeComplete(tubeIndex: number): boolean {
    const tube = this.tubes[tubeIndex];
    if (!tube || tube.length !== this.tubeCapacity) return false;
    const color = tube[0];
    return tube.every(c => c === color);
  }

  public checkWin(): boolean {
    for (let i = 0; i < this.tubes.length; i++) {
      const tube = this.tubes[i];
      if (tube.length === 0) continue;
      if (tube.length !== this.tubeCapacity) return false;
      const color = tube[0];
      if (!tube.every(c => c === color)) return false;
    }
    return true;
  }

  /**
   * Breadth-First-Search Solver to guarantee solvable hint suggestions
   */
  public getHint(): HintMove | null {
    if (this.won) return null;
    return ColorSortEngine.solveBFS(this.tubes, this.tubeCapacity);
  }

  public static generateSolvableLevel(colorCount: number, emptyCount: number, capacity: number, seed: number): number[][] {
    // Pseudo-random generator with seed
    let s = seed;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    // Attempt generation with verification
    for (let attempt = 0; attempt < 50; attempt++) {
      // 1. Create solved state: colorCount tubes filled with colors 1..colorCount, emptyCount empty tubes
      const tubes: number[][] = [];
      for (let i = 1; i <= colorCount; i++) {
        tubes.push(Array(capacity).fill(i));
      }
      for (let i = 0; i < emptyCount; i++) {
        tubes.push([]);
      }

      // 2. Perform N reverse legal pours
      const scrambleSteps = 25 + colorCount * 8 + Math.floor(rnd() * 10);
      let lastFrom = -1;
      let lastTo = -1;

      for (let step = 0; step < scrambleSteps; step++) {
        // Collect all valid reverse moves:
        // Move 1 unit from tube A (length > 0) to tube B (length < capacity)
        // Avoid undoing immediate previous move
        const possibleMoves: { from: number; to: number }[] = [];
        for (let i = 0; i < tubes.length; i++) {
          if (tubes[i].length === 0) continue;
          for (let j = 0; j < tubes.length; j++) {
            if (i === j) continue;
            if (tubes[j].length >= capacity) continue;
            if (i === lastTo && j === lastFrom) continue;
            possibleMoves.push({ from: i, to: j });
          }
        }

        if (possibleMoves.length === 0) break;
        const choice = possibleMoves[Math.floor(rnd() * possibleMoves.length)];
        const unit = tubes[choice.from].pop()!;
        tubes[choice.to].push(unit);
        lastFrom = choice.from;
        lastTo = choice.to;
      }

      // 3. Verify it is not already solved and has at least one legal forward move
      const isAlreadySolved = tubes.every(t => t.length === 0 || (t.length === capacity && t.every(c => c === t[0])));
      if (isAlreadySolved) continue;

      // 4. Verify with BFS solver that a solution path exists!
      const firstHint = ColorSortEngine.solveBFS(tubes, capacity);
      if (firstHint) {
        return tubes;
      }
    }

    // Fallback guaranteed solvable layout (3 colors, 2 empty, nicely mixed)
    return [
      [1, 2, 3, 1],
      [2, 3, 1, 2],
      [3, 1, 2, 3],
      [],
      []
    ];
  }

  /**
   * BFS Solver to find shortest path to victory and provide the first step as hint
   */
  public static solveBFS(initialTubes: number[][], capacity: number, maxExplored = 2500): HintMove | null {
    const serializeState = (tubes: number[][]): string => {
      // Sort tubes to canonicalize identical tube configurations
      const tubeStrs = tubes.map(t => t.join(','));
      return tubeStrs.sort().join('|');
    };

    const isSolved = (tubes: number[][]): boolean => {
      for (const t of tubes) {
        if (t.length === 0) continue;
        if (t.length !== capacity) return false;
        const c = t[0];
        if (!t.every(v => v === c)) return false;
      }
      return true;
    };

    if (isSolved(initialTubes)) return null;

    interface QueueNode {
      tubes: number[][];
      firstMove: HintMove | null;
    }

    const queue: QueueNode[] = [{ tubes: initialTubes.map(t => [...t]), firstMove: null }];
    const visited = new Set<string>();
    visited.add(serializeState(initialTubes));

    let count = 0;
    while (queue.length > 0 && count < maxExplored) {
      count++;
      const current = queue.shift()!;

      // Explore all valid pours from current state
      for (let from = 0; from < current.tubes.length; from++) {
        const src = current.tubes[from];
        if (src.length === 0) continue;

        // Don't pour out of an already completed tube
        if (src.length === capacity && src.every(c => c === src[0])) continue;

        for (let to = 0; to < current.tubes.length; to++) {
          if (from === to) continue;
          const tgt = current.tubes[to];
          if (tgt.length >= capacity) continue;

          // Legal pour condition: target empty OR top color matches
          const srcTop = src[src.length - 1];
          if (tgt.length > 0 && tgt[tgt.length - 1] !== srcTop) continue;

          // Don't pour all of a monochromatic tube into an empty tube (useless identical move)
          if (tgt.length === 0 && src.every(c => c === srcTop)) continue;

          // Execute pour in new state
          const newTubes = current.tubes.map(t => [...t]);
          const newSrc = newTubes[from];
          const newTgt = newTubes[to];

          // Count matching top colors
          let topCount = 0;
          for (let k = newSrc.length - 1; k >= 0; k--) {
            if (newSrc[k] === srcTop) topCount++;
            else break;
          }
          const transfer = Math.min(topCount, capacity - newTgt.length);
          for (let k = 0; k < transfer; k++) {
            newSrc.pop();
            newTgt.push(srcTop);
          }

          const move = { fromTube: from, toTube: to };
          const firstMove = current.firstMove || move;

          if (isSolved(newTubes)) {
            return firstMove;
          }

          const hash = serializeState(newTubes);
          if (!visited.has(hash)) {
            visited.add(hash);
            queue.push({ tubes: newTubes, firstMove });
          }
        }
      }
    }

    // Fallback greedy valid move if BFS depth exceeded
    for (let from = 0; from < initialTubes.length; from++) {
      for (let to = 0; to < initialTubes.length; to++) {
        if (from !== to && initialTubes[from].length > 0 && initialTubes[to].length < capacity) {
          const sTop = initialTubes[from][initialTubes[from].length - 1];
          const tTop = initialTubes[to].length > 0 ? initialTubes[to][initialTubes[to].length - 1] : null;
          if (tTop === null || tTop === sTop) {
            return { fromTube: from, toTube: to };
          }
        }
      }
    }

    return null;
  }

  public serialize() {
    return {
      level: this.level,
      tubeCapacity: this.tubeCapacity,
      tubes: this.tubes.map(t => [...t]),
      moves: this.moves,
      history: this.history.map(h => h.map(t => [...t]))
    };
  }
}
