import { describe, it, expect } from 'vitest';
import { WordSearchEngine, EN_WORD_LEVELS, ID_WORD_LEVELS } from './WordSearchEngine';

describe('WordSearchEngine', () => {
  it('initializes Level 1 EN correctly', () => {
    const engine = new WordSearchEngine(1, 'en');
    expect(engine.level).toBe(1);
    expect(engine.language).toBe('en');
    expect(engine.category).toBe('animals');
    expect(engine.size).toBe(6);
    expect(engine.grid.length).toBe(6);
    expect(engine.grid[0].length).toBe(6);
    expect(engine.targetWords.length).toBe(4);
    expect(engine.foundWords.length).toBe(0);
    expect(engine.won).toBe(false);
  });

  it('generates all 20 English levels reliably', () => {
    for (let lvl = 1; lvl <= 20; lvl++) {
      const engine = new WordSearchEngine(lvl, 'en');
      const expectedDef = EN_WORD_LEVELS.find(l => l.level === lvl)!;
      expect(engine.targetWords.length).toBe(expectedDef.words.length);
      expect(engine.size).toBe(expectedDef.size);
      expect(engine.grid.length).toBe(expectedDef.size);
    }
  });

  it('generates all 20 Indonesian levels reliably', () => {
    for (let lvl = 1; lvl <= 20; lvl++) {
      const engine = new WordSearchEngine(lvl, 'id');
      const expectedDef = ID_WORD_LEVELS.find(l => l.level === lvl)!;
      expect(engine.targetWords.length).toBe(expectedDef.words.length);
      expect(engine.size).toBe(expectedDef.size);
      expect(engine.grid.length).toBe(expectedDef.size);
    }
  });

  it('correctly validates straight line selection and finds target word', () => {
    const engine = new WordSearchEngine(1, 'en');
    const firstWord = engine.targetWords[0];
    expect(firstWord.path).toBeDefined();
    expect(firstWord.path!.length).toBeGreaterThan(1);

    const start = firstWord.path![0];
    const end = firstWord.path![firstWord.path!.length - 1];

    // Select start to end
    const res = engine.checkSelection(start, end);
    expect(res.success).toBe(true);
    expect(res.word).toBe(firstWord.word);
    expect(engine.foundWords).toContain(firstWord.word);
    expect(firstWord.found).toBe(true);

    // Re-selection reports alreadyFound
    const reRes = engine.checkSelection(start, end);
    expect(reRes.success).toBe(false);
    expect(reRes.alreadyFound).toBe(true);
  });

  it('supports selecting words backwards (end to start)', () => {
    const engine = new WordSearchEngine(1, 'en');
    const target = engine.targetWords[1];
    const start = target.path![0];
    const end = target.path![target.path!.length - 1];

    // Select backwards from end to start
    const res = engine.checkSelection(end, start);
    expect(res.success).toBe(true);
    expect(res.word).toBe(target.word);
    expect(target.found).toBe(true);
  });

  it('rejects invalid non-straight line selections', () => {
    const engine = new WordSearchEngine(1, 'en');
    // (0,0) to (1,2) is a knight's move, not horizontal, vertical, or diagonal
    const res = engine.checkSelection([0, 0], [1, 2]);
    expect(res.success).toBe(false);
  });

  it('provides helpful hints for unfound words', () => {
    const engine = new WordSearchEngine(1, 'en');
    const hint = engine.getHint();
    expect(hint).not.toBeNull();
    expect(hint!.word).toBe(engine.targetWords[0].word);
    expect(hint!.path.length).toBeGreaterThan(0);
  });

  it('detects win when all target words are found', () => {
    const engine = new WordSearchEngine(1, 'en');
    for (const tw of engine.targetWords) {
      const start = tw.path![0];
      const end = tw.path![tw.path!.length - 1];
      engine.checkSelection(start, end);
    }
    expect(engine.won).toBe(true);
  });

  it('serializes and restores from saved state correctly', () => {
    const engine = new WordSearchEngine(1, 'en');
    const firstWord = engine.targetWords[0];
    engine.checkSelection(firstWord.path![0], firstWord.path![firstWord.path!.length - 1]);

    const serialized = engine.serialize();
    expect(serialized.level).toBe(1);
    expect(serialized.foundWords.length).toBe(1);

    const restored = new WordSearchEngine(1, 'en', serialized);
    expect(restored.foundWords.length).toBe(1);
    expect(restored.foundWords[0]).toBe(firstWord.word);
    expect(restored.targetWords[0].found).toBe(true);
  });
});
