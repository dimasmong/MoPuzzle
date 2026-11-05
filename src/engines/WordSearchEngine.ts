import { Language } from '../core/types';

export interface TargetWord {
  word: string;
  found: boolean;
  path?: [number, number][];
}

export interface WordSearchResult {
  success: boolean;
  word?: string;
  path?: [number, number][];
  won: boolean;
  alreadyFound?: boolean;
}

export interface WordSearchHint {
  word: string;
  start: [number, number];
  end: [number, number];
  path: [number, number][];
}

export interface WordSearchLevelDef {
  level: number;
  category: string;
  size: number;
  words: string[];
}

export const WORD_SEARCH_CATEGORIES = [
  'animals',
  'nature',
  'technology',
  'food',
  'sports',
  'space',
  'countries',
  'objects'
] as const;

export const EN_WORD_LEVELS: WordSearchLevelDef[] = [
  // 1-5 (Easy: 6x6 - 7x7, 4-5 words)
  { level: 1, category: 'animals', size: 6, words: ['CAT', 'DOG', 'BIRD', 'FISH'] },
  { level: 2, category: 'food', size: 6, words: ['RICE', 'CAKE', 'SOUP', 'MILK'] },
  { level: 3, category: 'nature', size: 7, words: ['TREE', 'RAIN', 'WIND', 'RIVER', 'SUN'] },
  { level: 4, category: 'sports', size: 7, words: ['RUN', 'SWIM', 'BALL', 'GOLF', 'RACE'] },
  { level: 5, category: 'objects', size: 7, words: ['BOOK', 'PEN', 'CLOCK', 'LAMP', 'CHAIR'] },
  // 6-12 (Medium: 8x8 - 9x9, 6-7 words)
  { level: 6, category: 'technology', size: 8, words: ['ROBOT', 'SCREEN', 'CLOUD', 'DATA', 'CODE', 'PIXEL'] },
  { level: 7, category: 'space', size: 8, words: ['MOON', 'MARS', 'STAR', 'ORBIT', 'COMET', 'VENUS'] },
  { level: 8, category: 'countries', size: 8, words: ['SPAIN', 'JAPAN', 'ITALY', 'BRAZIL', 'CANADA', 'CHILE'] },
  { level: 9, category: 'animals', size: 9, words: ['LION', 'TIGER', 'PANDA', 'ZEBRA', 'MONKEY', 'EAGLE'] },
  { level: 10, category: 'food', size: 9, words: ['PIZZA', 'BURGER', 'CHEESE', 'BREAD', 'APPLE', 'SALAD', 'PASTA'] },
  { level: 11, category: 'nature', size: 9, words: ['OCEAN', 'FOREST', 'DESERT', 'VALLEY', 'ISLAND', 'CANYON', 'FLOWER'] },
  { level: 12, category: 'technology', size: 9, words: ['LAPTOP', 'MOBILE', 'SERVER', 'ROUTER', 'BATTERY', 'NETWORK', 'SENSOR'] },
  // 13-20 (Hard: 10x10 - 12x12, 8-10 words)
  { level: 13, category: 'sports', size: 10, words: ['SOCCER', 'TENNIS', 'BOXING', 'HOCKEY', 'ARCHERY', 'SURFING', 'CRICKET', 'SKATING'] },
  { level: 14, category: 'space', size: 10, words: ['JUPITER', 'SATURN', 'NEPTUNE', 'GALAXY', 'METEOR', 'NEBULA', 'ECLIPSE', 'SHUTTLE'] },
  { level: 15, category: 'countries', size: 10, words: ['FRANCE', 'GERMANY', 'NORWAY', 'SWEDEN', 'MEXICO', 'VIETNAM', 'POLAND', 'GREECE'] },
  { level: 16, category: 'objects', size: 10, words: ['MIRROR', 'PILLOW', 'BOTTLE', 'CAMERA', 'WALLET', 'GUITAR', 'PENCIL', 'WINDOW'] },
  { level: 17, category: 'animals', size: 11, words: ['ELEPHANT', 'GIRAFFE', 'DOLPHIN', 'KANGAROO', 'PENGUIN', 'CHEETAH', 'OCTOPUS', 'LEOPARD', 'GORILLA'] },
  { level: 18, category: 'food', size: 11, words: ['SANDWICH', 'PANCAKE', 'CHOCOLATE', 'AVOCADO', 'PINEAPPLE', 'NOODLES', 'BISCUIT', 'PUDDING', 'CUPCAKE'] },
  { level: 19, category: 'technology', size: 11, words: ['COMPUTER', 'SOFTWARE', 'HARDWARE', 'DATABASE', 'SECURITY', 'INTERNET', 'ALGORITHM', 'WIRELESS', 'PROCESSOR'] },
  { level: 20, category: 'space', size: 12, words: ['TELESCOPE', 'ASTRONAUT', 'SUPERNOVA', 'SATELLITE', 'SPACECRAFT', 'STARLIGHT', 'BLACKHOLE', 'ANDROMEDA', 'ASTEROID', 'UNIVERSE'] }
];

export const ID_WORD_LEVELS: WordSearchLevelDef[] = [
  // 1-5 (Easy: 6x6 - 7x7, 4-5 words)
  { level: 1, category: 'animals', size: 6, words: ['KUCING', 'ANJING', 'IKAN', 'KUDA'] },
  { level: 2, category: 'food', size: 6, words: ['NASI', 'ROTI', 'SUSU', 'SOTO'] },
  { level: 3, category: 'nature', size: 7, words: ['POHON', 'HUJAN', 'ANGIN', 'SUNGAI', 'DAUN'] },
  { level: 4, category: 'sports', size: 7, words: ['LARI', 'RENANG', 'BOLA', 'SENAM', 'SILAT'] },
  { level: 5, category: 'objects', size: 7, words: ['BUKU', 'PENA', 'MEJA', 'KURSI', 'LAMPU'] },
  // 6-12 (Medium: 8x8 - 9x9, 6-7 words)
  { level: 6, category: 'technology', size: 8, words: ['ROBOT', 'LAYAR', 'AWAN', 'DATA', 'KODE', 'SINYAL'] },
  { level: 7, category: 'space', size: 8, words: ['BULAN', 'BINTANG', 'ORBIT', 'KOMET', 'SURYA', 'PLANET'] },
  { level: 8, category: 'countries', size: 8, words: ['JEPANG', 'KOREA', 'SPANYOL', 'BRASIL', 'KANADA', 'MESIR'] },
  { level: 9, category: 'animals', size: 9, words: ['SINGA', 'HARIMAU', 'PANDA', 'ZEBRA', 'MONYET', 'ELANG'] },
  { level: 10, category: 'food', size: 9, words: ['RENDANG', 'BAKSO', 'KEJU', 'APEL', 'SALAD', 'SATE', 'GUDEG'] },
  { level: 11, category: 'nature', size: 9, words: ['LAUTAN', 'HUTAN', 'GURUN', 'LEMBAH', 'PULAU', 'DANAU', 'BUNGA'] },
  { level: 12, category: 'technology', size: 9, words: ['LAPTOP', 'PONSEL', 'SERVER', 'ROUTER', 'BATERAI', 'JARINGAN', 'SENSOR'] },
  // 13-20 (Hard: 10x10 - 12x12, 8-10 words)
  { level: 13, category: 'sports', size: 10, words: ['SEPAKBOLA', 'TENIS', 'TINJU', 'PANAHAN', 'SELANCAR', 'BASKET', 'BADMINTON', 'DAYUNG'] },
  { level: 14, category: 'space', size: 10, words: ['JUPITER', 'SATURNUS', 'NEPTUNUS', 'GALAKSI', 'METEOR', 'GERHANA', 'ROKET', 'KOSMOS'] },
  { level: 15, category: 'countries', size: 10, words: ['PERANCIS', 'JERMAN', 'BELGIA', 'SWEDIA', 'MEKSIKO', 'VIETNAM', 'POLANDIA', 'ITALIA'] },
  { level: 16, category: 'objects', size: 10, words: ['CERMIN', 'BANTAL', 'BOTOL', 'KAMERA', 'DOMPET', 'GITAR', 'PENSIL', 'JENDELA'] },
  { level: 17, category: 'animals', size: 11, words: ['GAJAH', 'JERAPAH', 'LUMBALUMBA', 'KANGGURU', 'PENGUIN', 'LUMBA', 'GURITA', 'MACAN', 'ORANGUTAN'] },
  { level: 18, category: 'food', size: 11, words: ['MARTABAK', 'GADOGADO', 'COKELAT', 'ALPUKAT', 'NANAS', 'MIEGORENG', 'KUECUBIT', 'BUBUR', 'KLEPON'] },
  { level: 19, category: 'technology', size: 11, words: ['KOMPUTER', 'PERANGKAT', 'DATABASE', 'KEAMANAN', 'INTERNET', 'ALGORITMA', 'NIRKABEL', 'PROSESOR', 'DIGITAL'] },
  { level: 20, category: 'space', size: 12, words: ['TELESKOP', 'ASTRONOT', 'SUPERNOVA', 'SATELIT', 'KOSMONOT', 'METEORIT', 'LUBANGHITAM', 'ANDROMEDA', 'ASTEROID', 'SEMESTA'] }
];

const DIRECTIONS: [number, number][] = [
  [0, 1],   // East
  [0, -1],  // West
  [1, 0],   // South
  [-1, 0],  // North
  [1, 1],   // South-East
  [-1, -1], // North-West
  [-1, 1],  // North-East
  [1, -1]   // South-West
];

function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export class WordSearchEngine {
  public level: number;
  public language: Language;
  public category = '';
  public size = 6;
  public grid: string[][] = [];
  public targetWords: TargetWord[] = [];
  public foundWords: string[] = [];
  public elapsedSeconds = 0;
  public won = false;

  constructor(level = 1, language: Language = 'en', savedState?: any) {
    this.level = Math.max(1, Math.min(20, level));
    this.language = language;

    if (savedState && savedState.grid && Array.isArray(savedState.grid) && !savedState.won &&
        (savedState.level === undefined || savedState.level === level) &&
        (savedState.language === undefined || savedState.language === language)) {
      this.level = savedState.level ?? level;
      this.language = savedState.language ?? language;
      this.category = savedState.category ?? '';
      this.size = savedState.grid.length;
      this.grid = savedState.grid.map((r: string[]) => [...r]);
      this.targetWords = savedState.targetWords ? savedState.targetWords.map((tw: any) => ({ ...tw })) : [];
      this.foundWords = savedState.foundWords ? [...savedState.foundWords] : [];
      this.elapsedSeconds = savedState.elapsedSeconds ?? 0;
      this.won = this.checkWin();
    } else {
      this.loadLevel(this.level, this.language);
    }
  }

  public loadLevel(level: number, language?: Language): void {
    this.level = Math.max(1, Math.min(20, level));
    if (language) this.language = language;
    this.foundWords = [];
    this.elapsedSeconds = 0;
    this.won = false;

    const list = this.language === 'id' ? ID_WORD_LEVELS : EN_WORD_LEVELS;
    const config = list.find(l => l.level === this.level) || list[0];
    this.category = config.category;
    this.size = config.size;

    const generated = WordSearchEngine.generateLevelGrid(config, this.level * (this.language === 'id' ? 888 : 777));
    this.grid = generated.grid;
    this.targetWords = generated.targetWords;
  }

  public restart(): void {
    this.loadLevel(this.level, this.language);
  }

  public checkSelection(start: [number, number], end: [number, number]): WordSearchResult {
    const [r1, c1] = start;
    const [r2, c2] = end;

    const dr = r2 - r1;
    const dc = c2 - c1;

    // Must be straight line: horizontal, vertical, or 45-degree diagonal
    const isHorizontal = dr === 0 && dc !== 0;
    const isVertical = dc === 0 && dr !== 0;
    const isDiagonal = Math.abs(dr) === Math.abs(dc) && dr !== 0;

    if (!isHorizontal && !isVertical && !isDiagonal) {
      return { success: false, won: this.won };
    }

    const stepCount = Math.max(Math.abs(dr), Math.abs(dc));
    const stepR = Math.sign(dr);
    const stepC = Math.sign(dc);

    const path: [number, number][] = [];
    let formed = '';

    for (let i = 0; i <= stepCount; i++) {
      const r = r1 + stepR * i;
      const c = c1 + stepC * i;
      if (r < 0 || r >= this.size || c < 0 || c >= this.size) {
        return { success: false, won: this.won };
      }
      path.push([r, c]);
      formed += this.grid[r][c];
    }

    const reversed = formed.split('').reverse().join('');

    // Check against unfound target words
    const match = this.targetWords.find(tw => !tw.found && (tw.word === formed || tw.word === reversed));

    if (match) {
      match.found = true;
      match.path = path;
      this.foundWords.push(match.word);
      this.won = this.checkWin();

      return {
        success: true,
        word: match.word,
        path,
        won: this.won
      };
    }

    // Check if user re-selected an already found word
    const alreadyFound = this.targetWords.find(tw => tw.found && (tw.word === formed || tw.word === reversed));
    if (alreadyFound) {
      return {
        success: false,
        alreadyFound: true,
        word: alreadyFound.word,
        won: this.won
      };
    }

    return { success: false, won: this.won };
  }

  public getHint(): WordSearchHint | null {
    const unfound = this.targetWords.find(tw => !tw.found);
    if (!unfound || !unfound.path || unfound.path.length === 0) return null;

    return {
      word: unfound.word,
      start: unfound.path[0],
      end: unfound.path[unfound.path.length - 1],
      path: unfound.path
    };
  }

  public checkWin(): boolean {
    return this.targetWords.length > 0 && this.targetWords.every(tw => tw.found);
  }

  public getProgress(): { found: number; total: number } {
    return {
      found: this.foundWords.length,
      total: this.targetWords.length
    };
  }

  public serialize(): any {
    return {
      level: this.level,
      language: this.language,
      category: this.category,
      grid: this.grid.map(r => [...r]),
      targetWords: this.targetWords.map(tw => ({ ...tw, path: tw.path ? [...tw.path] : undefined })),
      foundWords: [...this.foundWords],
      elapsedSeconds: this.elapsedSeconds,
      won: this.won
    };
  }

  public static generateLevelGrid(levelDef: WordSearchLevelDef, baseSeed: number): { grid: string[][]; targetWords: TargetWord[] } {
    const size = levelDef.size;
    const cleanWords = levelDef.words.map(w => w.toUpperCase().replace(/[^A-Z]/g, '')).sort((a, b) => b.length - a.length);

    for (let retry = 0; retry < 100; retry++) {
      const rng = mulberry32(baseSeed + retry * 79);
      const grid = Array.from({ length: size }, () => Array(size).fill(''));
      const placed: TargetWord[] = [];
      let allPlaced = true;

      for (const word of cleanWords) {
        let placedWord = false;
        const shuffledDirs = [...DIRECTIONS].sort(() => rng() - 0.5);

        for (let attempt = 0; attempt < 500 && !placedWord; attempt++) {
          const dir = shuffledDirs[Math.floor(rng() * shuffledDirs.length)];
          const dr = dir[0];
          const dc = dir[1];

          const minR = dr < 0 ? word.length - 1 : 0;
          const maxR = dr > 0 ? size - word.length : size - 1;
          const minC = dc < 0 ? word.length - 1 : 0;
          const maxC = dc > 0 ? size - word.length : size - 1;

          if (maxR < minR || maxC < minC) continue;

          const startR = minR + Math.floor(rng() * (maxR - minR + 1));
          const startC = minC + Math.floor(rng() * (maxC - minC + 1));

          let canPlace = true;
          const path: [number, number][] = [];
          for (let i = 0; i < word.length; i++) {
            const r = startR + dr * i;
            const c = startC + dc * i;
            const existing = grid[r][c];
            if (existing !== '' && existing !== word[i]) {
              canPlace = false;
              break;
            }
            path.push([r, c]);
          }

          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              const [r, c] = path[i];
              grid[r][c] = word[i];
            }
            placed.push({ word, found: false, path });
            placedWord = true;
          }
        }

        if (!placedWord) {
          allPlaced = false;
          break;
        }
      }

      if (allPlaced) {
        // Fill remaining spaces with random uppercase letters A-Z
        const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (grid[r][c] === '') {
              grid[r][c] = ALPHABET[Math.floor(rng() * ALPHABET.length)];
            }
          }
        }
        return { grid, targetWords: placed };
      }
    }

    throw new Error(`Failed to generate Word Search level ${levelDef.level} after 100 attempts`);
  }
}
