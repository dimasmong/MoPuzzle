import { Language } from './types';

export const translations = {
  en: {
    // App Branding & Navigation
    appName: 'MoPuzzle',
    tagline: 'Think. Solve. Enjoy.',
    home: 'Home',
    games: 'Games',
    stats: 'Statistics',
    achievements: 'Achievements',
    settings: 'Settings',
    about: 'About',
    faq: 'FAQ',
    play: 'Play',
    continue: 'Continue',
    newGame: 'New Game',
    pause: 'Pause',
    resume: 'Resume',
    restart: 'Restart',
    undo: 'Undo',
    hint: 'Hint',
    rules: 'Rules',
    back: 'Back',
    close: 'Close',
    confirm: 'Confirm',
    cancel: 'Cancel',

    // Game Titles & Descriptions
    mergeTitle: 'Merge Numbers',
    mergeSubtitle: '2048 Strategy Puzzle',
    mergeDesc: 'Slide tiles and merge matching numbers to reach 2048 and beyond! Play Classic or Timed rush.',
    mergeRulesTitle: 'How to Play Merge Numbers',
    mergeRules: 'Use Arrow Keys, WASD, or swipe gestures to slide tiles in four directions. When two tiles with the same number collide, they merge into one with double the value! Each tile can merge only once per turn. Reach the 2048 tile to win, and keep playing to set an unbeatable high score.',
    
    colorSortTitle: 'Color Sort',
    colorsortTitle: 'Color Sort',
    colorSortSubtitle: 'Liquid Sorting Puzzle',
    colorsortSubtitle: 'Liquid Sorting Puzzle',
    colorSortDesc: 'Sort vibrant liquids into matching test tubes. Every puzzle is guaranteed solvable!',
    colorsortDesc: 'Sort vibrant liquids into matching test tubes. Every puzzle is guaranteed solvable!',
    colorSortRulesTitle: 'How to Play Color Sort',
    colorsortRulesTitle: 'How to Play Color Sort',
    colorSortRules: 'Tap a source tube to select it, then tap another tube to pour liquid. You can only pour liquid onto the same color, or into an empty tube, provided the target tube has enough room. Group all matching colors into their own tubes to clear the level.',
    colorsortRules: 'Tap a source tube to select it, then tap another tube to pour liquid. You can only pour liquid onto the same color, or into an empty tube, provided the target tube has enough room. Group all matching colors into their own tubes to clear the level.',
    
    slideTitle: 'Slide Puzzle',
    slideSubtitle: 'Classic Sliding Tiles',
    slideDesc: 'Slide scrambled numbered tiles back into numerical order on 3×3, 4×4, and 5×5 grids.',
    slideRulesTitle: 'How to Play Slide Puzzle',
    slideRules: 'Click or tap any numbered tile adjacent to the empty slot, or use Arrow keys/WASD, to slide it into the empty space. Arrange the tiles in sequential order from left to right, top to bottom, leaving the blank space in the bottom-right corner.',
    
    blockFitTitle: 'Block Fit',
    blockfitTitle: 'Block Fit',
    blockFitSubtitle: '10×10 Grid Placement',
    blockfitSubtitle: '10×10 Grid Placement',
    blockFitDesc: 'Fit polyomino blocks into a 10×10 grid. Complete horizontal and vertical lines for combo points!',
    blockfitDesc: 'Fit polyomino blocks into a 10×10 grid. Complete horizontal and vertical lines for combo points!',
    blockFitRulesTitle: 'How to Play Block Fit',
    blockfitRulesTitle: 'How to Play Block Fit',
    blockFitRules: 'Drag shapes from the bottom shelf onto the 10×10 board (or tap a shape then tap the board). Fill complete rows or columns to clear them and score points. Clear multiple rows/columns simultaneously for massive combo multipliers! The game ends when none of the 3 pieces can fit onto the board.',
    blockfitRules: 'Drag shapes from the bottom shelf onto the 10×10 board (or tap a shape then tap the board). Fill complete rows or columns to clear them and score points. Clear multiple rows/columns simultaneously for massive combo multipliers! The game ends when none of the 3 pieces can fit onto the board.',

    // HUD & Game In-progress
    score: 'Score',
    bestScore: 'Best',
    highScore: 'High Score',
    moves: 'Moves',
    time: 'Time',
    level: 'Level',
    bestTime: 'Best Time',
    selectLevel: 'Select Level',
    difficulty: 'Difficulty',
    boardSize: 'Board Size',
    classicMode: 'Classic',
    timedMode: 'Timed',
    unlimited: 'Unlimited',
    secondsLeft: 's left',
    combo: 'Combo!',
    streak: 'Streak',
    ready: 'Ready',
    gameOver: 'Game Over',
    victory: 'Puzzle Solved!',
    victoryDesc: 'Spectacular job! You completed this challenge.',
    gameOverDesc: 'No more legal moves left. Try again and beat your score!',
    playAgain: 'Play Again',
    nextLevel: 'Next Level',
    nextPuzzle: 'Next Puzzle',
    continuePlaying: 'Keep Going',
    campaignComplete: 'All Levels Solved!',
    campaignCompleteDesc: 'Congratulations! You have conquered all 30 Color Sort levels!',
    levelSelect: 'Level Select',
    noHintsRemaining: 'No hints available or already solved',
    hintSuggested: 'Suggested move: Tube {from} ➔ Tube {to}',
    invalidMove: 'No tiles can move in that direction!',
    cannotPour: 'Cannot pour here: colors must match or destination tube must be empty.',

    // Statistics Page
    statsTitle: 'Gameplay Statistics',
    totalGamesPlayed: 'Total Games Played',
    totalWins: 'Total Victories',
    winRate: 'Win Rate',
    totalMovesMade: 'Total Moves Executed',
    linesCleared: 'Lines Cleared',
    highestCombo: 'Highest Combo',
    maxLevel: 'Max Level Cleared',
    puzzlesSolved: 'Puzzles Solved',
    tile2048Reached: '2048 Tiles Formed',
    noStatsYet: 'No gameplay statistics yet. Start a game to see your stats here!',

    // Achievements Page
    achievementsTitle: 'Achievements',
    achievementsSubtitle: 'Earn trophies and badges by mastering puzzles!',
    unlockedBadge: 'Unlocked',
    lockedBadge: 'Locked',
    achievementUnlockedToast: 'Achievement Unlocked: {title}!',

    // Achievement Items
    achFirstStepsTitle: 'First Step',
    achFirstStepsDesc: 'Complete your first move in any game.',
    achMerge2048Title: 'The 2048 Club',
    achMerge2048Desc: 'Successfully merge a 2048 tile.',
    achMergeMasterTitle: 'Grand Merger',
    achMergeMasterDesc: 'Achieve a score of 10,000 points in Merge Numbers.',
    achColor5Title: 'Tidy Chemist',
    achColor5Desc: 'Complete 5 levels in Color Sort.',
    achColor15Title: 'Master Alchemist',
    achColor15Desc: 'Complete 15 levels in Color Sort.',
    achColorNoUndoTitle: 'Pure Precision',
    achColorNoUndoDesc: 'Win a Color Sort level without using Undo.',
    achSlide3Title: 'Sliding Initiate',
    achSlide3Desc: 'Solve a 3×3 Slide Puzzle.',
    achSlide4Title: 'Grid Master',
    achSlide4Desc: 'Solve a 4×4 Slide Puzzle.',
    achSlideSpeedTitle: 'Lightning Reflexes',
    achSlideSpeedDesc: 'Solve any Slide Puzzle in under 60 seconds.',
    achBlock1000Title: 'Tetra Apprentice',
    achBlock1000Desc: 'Score 1,000 points in Block Fit.',
    achBlockComboTitle: 'Combo Specialist',
    achBlockComboDesc: 'Clear 3 or more rows/columns in a single move in Block Fit.',
    achBlock50LinesTitle: 'Demolition Squad',
    achBlock50LinesDesc: 'Clear 50 total lines in Block Fit.',
    achPuzzlerTitle: 'All-Rounder',
    achPuzzlerDesc: 'Play all 4 game modes.',
    achDedicatedTitle: 'Dedicated Solver',
    achDedicatedDesc: 'Execute over 500 total moves across all games.',

    // Settings Page
    settingsTitle: 'Settings',
    generalSettings: 'General',
    audioSettings: 'Audio & Music',
    displaySettings: 'Display & Visuals',
    dataSettings: 'Storage & Progress',
    languageLabel: 'Language',
    themeLabel: 'Theme',
    lightTheme: 'Light',
    darkTheme: 'Dark',
    musicLabel: 'Background Music',
    musicVolumeLabel: 'Music Volume',
    sfxLabel: 'Sound Effects (SFX)',
    sfxVolumeLabel: 'SFX Volume',
    reducedMotionLabel: 'Reduced Motion',
    reducedMotionHint: 'Minimizes rapid screen tweens and animations.',
    resetProgressLabel: 'Reset Game Progress',
    resetProgressDesc: 'Permanently erase all local stats, active games, and achievements.',
    resetProgressBtn: 'Reset All Data',
    resetModalTitle: 'Reset All Progress?',
    resetModalDesc: 'Are you sure you want to reset all game data? This cannot be undone. All high scores, achievements, and active games will be permanently deleted.',
    resetConfirmedToast: 'All game progress has been successfully reset.',

    // About & FAQ Page
    aboutTitle: 'About MoPuzzle',
    aboutTagline: 'MoPuzzle v1.0.1 — Think. Solve. Enjoy.',
    aboutDesc: 'MoPuzzle is an open-source, client-side casual puzzle suite engineered for instant play on desktop, tablet, and mobile devices. Zero telemetry, zero paid APIs, zero logins, fully offline-capable.',
    developerLabel: 'Developer & Architecture',
    developerName: 'Dimas Mong',
    openSourceLabel: 'Open Source & Attribution',
    licenseNotice: 'MoPuzzle is open source software licensed under the MIT License.',
    footerText: '© 2026 MoPuzzle. Licensed under the MIT License. Crafted with ❤️ by Dimas Mong.',
    viewOnGithub: 'View on GitHub',
    
    faqTitle: 'Frequently Asked Questions',
    faq1Q: 'Is MoPuzzle completely free to play?',
    faq1A: 'Yes! MoPuzzle is 100% free, open-source, and contains no ads, no trackers, and no paywalls.',
    faq2Q: 'Where is my game progress saved?',
    faq2A: 'All your high scores, statistics, and in-progress games are stored locally on your device using IndexedDB and LocalStorage. Your data never leaves your browser.',
    faq3Q: 'Can I play MoPuzzle offline?',
    faq3A: 'Absolutely. MoPuzzle is a Progressive Web App (PWA). Once loaded, all code and sound effects are cached locally, allowing full offline play anytime.',
    faq4Q: 'Are the Color Sort and Slide puzzles always solvable?',
    faq4A: 'Yes! Every puzzle board is verified solvable. Color Sort puzzles are constructed through reverse simulation and verified with a breadth-first search solver. Slide puzzles are created by scrambling a solved grid with valid moves, guaranteeing an exact solution.',
    faq5Q: 'How do I install MoPuzzle on my home screen?',
    faq5A: 'On Chrome/Edge/Android, click "Install" in the address bar or menu. On iOS Safari, tap "Share" and select "Add to Home Screen".',

    // Offline / PWA Notification
    offlineReady: 'MoPuzzle is ready for offline play!',
    updateAvailable: 'A new version of MoPuzzle is available. Refresh to update.'
  },
  id: {
    // App Branding & Navigation
    appName: 'MoPuzzle',
    tagline: 'Pikir. Selesaikan. Nikmati.',
    home: 'Beranda',
    games: 'Permainan',
    stats: 'Statistik',
    achievements: 'Pencapaian',
    settings: 'Pengaturan',
    about: 'Tentang',
    faq: 'Tanya Jawab',
    play: 'Mainkan',
    continue: 'Lanjutkan',
    newGame: 'Game Baru',
    pause: 'Jeda',
    resume: 'Lanjutkan',
    restart: 'Mulai Ulang',
    undo: 'Urungkan',
    hint: 'Petunjuk',
    rules: 'Aturan',
    back: 'Kembali',
    close: 'Tutup',
    confirm: 'Konfirmasi',
    cancel: 'Batal',

    // Game Titles & Descriptions
    mergeTitle: 'Gabung Angka',
    mergeSubtitle: 'Teka-Teki Strategi 2048',
    mergeDesc: 'Geser ubin dan gabungkan angka yang sama untuk mencapai 2048 dan seterusnya! Mainkan mode Klasik atau Waktu.',
    mergeRulesTitle: 'Cara Bermain Gabung Angka',
    mergeRules: 'Gunakan Tombol Panah, WASD, atau usap layar untuk menggeser ubin dalam empat arah. Ketika dua ubin dengan angka yang sama bertabrakan, keduanya bergabung menjadi satu dengan nilai dua kali lipat! Setiap ubin hanya bisa bergabung sekali per gerakan. Capai ubin 2048 untuk menang, dan terus bermain untuk mencetak skor tertinggi.',
    
    colorSortTitle: 'Urutkan Warna',
    colorsortTitle: 'Urutkan Warna',
    colorSortSubtitle: 'Teka-Teki Cairan Warna',
    colorsortSubtitle: 'Teka-Teki Cairan Warna',
    colorSortDesc: 'Pindahkan cairan warna-warni ke tabung yang cocok. Setiap teka-teki dijamin dapat diselesaikan!',
    colorsortDesc: 'Pindahkan cairan warna-warni ke tabung yang cocok. Setiap teka-teki dijamin dapat diselesaikan!',
    colorSortRulesTitle: 'Cara Bermain Urutkan Warna',
    colorsortRulesTitle: 'Cara Bermain Urutkan Warna',
    colorSortRules: 'Ketuk tabung asal untuk memilihnya, lalu ketuk tabung lain untuk menuangkan cairan. Anda hanya dapat menuangkan cairan ke atas warna yang sama, atau ke dalam tabung kosong, asalkan tabung target memiliki ruang yang cukup. Kelompokkan semua warna yang serasi ke dalam tabungnya masing-masing untuk menyelesaikan level.',
    colorsortRules: 'Ketuk tabung asal untuk memilihnya, lalu ketuk tabung lain untuk menuangkan cairan. Anda hanya dapat menuangkan cairan ke atas warna yang sama, atau ke dalam tabung kosong, asalkan tabung target memiliki ruang yang cukup. Kelompokkan semua warna yang serasi ke dalam tabungnya masing-masing untuk menyelesaikan level.',
    
    slideTitle: 'Teka-Teki Geser',
    slideSubtitle: 'Geser Angka Klasik',
    slideDesc: 'Geser ubin bernomor yang teracak kembali ke urutan numerik pada papan 3×3, 4×4, dan 5×5.',
    slideRulesTitle: 'Cara Bermain Teka-Teki Geser',
    slideRules: 'Klik atau ketuk ubin bernomor yang bersebelahan dengan slot kosong, atau gunakan tombol Panah/WASD, untuk menggesernya ke slot kosong. Susun ubin secara berurutan dari kiri ke kanan, atas ke bawah, meninggalkan slot kosong di sudut kanan bawah.',
    
    blockFitTitle: 'Pasang Balok',
    blockfitTitle: 'Pasang Balok',
    blockFitSubtitle: 'Penempatan Grid 10×10',
    blockfitSubtitle: 'Penempatan Grid 10×10',
    blockFitDesc: 'Tempatkan balok poliomino ke papan 10×10. Lengkapi garis horizontal dan vertikal untuk poin kombo!',
    blockfitDesc: 'Tempatkan balok poliomino ke papan 10×10. Lengkapi garis horizontal dan vertikal untuk poin kombo!',
    blockFitRulesTitle: 'Cara Bermain Pasang Balok',
    blockfitRulesTitle: 'Cara Bermain Pasang Balok',
    blockFitRules: 'Tarik balok dari rak bawah ke papan 10×10 (atau ketuk balok lalu ketuk kotak papan). Isi baris atau kolom penuh untuk menghancurkannya dan mencetak poin. Bersihkan beberapa baris/kolom sekaligus untuk pengali kombo besar! Permainan berakhir jika tidak ada satu pun dari 3 balok yang muat di papan.',
    blockfitRules: 'Tarik balok dari rak bawah ke papan 10×10 (atau ketuk balok lalu ketuk kotak papan). Isi baris atau kolom penuh untuk menghancurkannya dan mencetak poin. Bersihkan beberapa baris/kolom sekaligus untuk pengali kombo besar! Permainan berakhir jika tidak ada satu pun dari 3 balok yang muat di papan.',

    // HUD & Game In-progress
    score: 'Skor',
    bestScore: 'Terbaik',
    highScore: 'Skor Tertinggi',
    moves: 'Langkah',
    time: 'Waktu',
    level: 'Level',
    bestTime: 'Waktu Terbaik',
    selectLevel: 'Pilih Level',
    difficulty: 'Tingkat Kesulitan',
    boardSize: 'Ukuran Papan',
    classicMode: 'Klasik',
    timedMode: 'Batas Waktu',
    unlimited: 'Tanpa Batas',
    secondsLeft: 'dtk tersisa',
    combo: 'Kombo!',
    streak: 'Beruntun',
    ready: 'Siap',
    gameOver: 'Permainan Berakhir',
    victory: 'Teka-Teki Terpecahkan!',
    victoryDesc: 'Kerja luar biasa! Anda berhasil menyelesaikan tantangan ini.',
    gameOverDesc: 'Tidak ada langkah yang tersisa. Coba lagi dan pecahkan rekor Anda!',
    playAgain: 'Main Lagi',
    nextLevel: 'Level Berikutnya',
    nextPuzzle: 'Teka-Teki Berikutnya',
    continuePlaying: 'Lanjut Main',
    campaignComplete: 'Semua Level Terpecahkan!',
    campaignCompleteDesc: 'Selamat! Anda telah menaklukkan semua 30 level Urutkan Warna!',
    levelSelect: 'Pilih Level',
    noHintsRemaining: 'Tidak ada petunjuk yang tersedia atau sudah terselesaikan',
    hintSuggested: 'Saran langkah: Tabung {from} ➔ Tabung {to}',
    invalidMove: 'Tidak ada ubin yang bisa bergerak ke arah itu!',
    cannotPour: 'Tidak bisa menuang: warna harus sama atau tabung tujuan harus kosong.',

    // Statistics Page
    statsTitle: 'Statistik Permainan',
    totalGamesPlayed: 'Total Permainan',
    totalWins: 'Total Kemenangan',
    winRate: 'Tingkat Kemenangan',
    totalMovesMade: 'Total Langkah',
    linesCleared: 'Garis Dibersihkan',
    highestCombo: 'Kombo Tertinggi',
    maxLevel: 'Level Maksimal',
    puzzlesSolved: 'Teka-Teki Terpecahkan',
    tile2048Reached: 'Ubin 2048 Terbentuk',
    noStatsYet: 'Belum ada statistik permainan. Mulai bermain untuk melihat statistik Anda di sini!',

    // Achievements Page
    achievementsTitle: 'Pencapaian',
    achievementsSubtitle: 'Raih trofi dan lencana dengan menguasai setiap teka-teki!',
    unlockedBadge: 'Terbuka',
    lockedBadge: 'Terkunci',
    achievementUnlockedToast: 'Pencapaian Terbuka: {title}!',

    // Achievement Items
    achFirstStepsTitle: 'Langkah Pertama',
    achFirstStepsDesc: 'Selesaikan langkah pertama Anda di permainan apa pun.',
    achMerge2048Title: 'Klub 2048',
    achMerge2048Desc: 'Berhasil menggabungkan ubin bernilai 2048.',
    achMergeMasterTitle: 'Ahli Penggabung',
    achMergeMasterDesc: 'Capai skor 10.000 poin di Gabung Angka.',
    achColor5Title: 'Kimiawan Rapi',
    achColor5Desc: 'Selesaikan 5 level di Urutkan Warna.',
    achColor15Title: 'Ahli Alkimia',
    achColor15Desc: 'Selesaikan 15 level di Urutkan Warna.',
    achColorNoUndoTitle: 'Presisi Murni',
    achColorNoUndoDesc: 'Menangkan level Urutkan Warna tanpa menggunakan tombol Urungkan.',
    achSlide3Title: 'Inisiasi Geser',
    achSlide3Desc: 'Selesaikan Teka-Teki Geser 3×3.',
    achSlide4Title: 'Master Grid',
    achSlide4Desc: 'Selesaikan Teka-Teki Geser 4×4.',
    achSlideSpeedTitle: 'Refleks Kilat',
    achSlideSpeedDesc: 'Selesaikan Teka-Teki Geser apa pun dalam waktu di bawah 60 detik.',
    achBlock1000Title: 'Magang Balok',
    achBlock1000Desc: 'Raih 1.000 poin di Pasang Balok.',
    achBlockComboTitle: 'Spesialis Kombo',
    achBlockComboDesc: 'Bersihkan 3 atau lebih baris/kolom dalam satu gerakan di Pasang Balok.',
    achBlock50LinesTitle: 'Pasukan Penghancur',
    achBlock50LinesDesc: 'Bersihkan total 50 garis di Pasang Balok.',
    achPuzzlerTitle: 'Serba Bisa',
    achPuzzlerDesc: 'Mainkan keempat mode permainan.',
    achDedicatedTitle: 'Pemecah Setia',
    achDedicatedDesc: 'Lakukan lebih dari 500 langkah di seluruh permainan.',

    // Settings Page
    settingsTitle: 'Pengaturan',
    generalSettings: 'Umum',
    audioSettings: 'Audio & Musik',
    displaySettings: 'Tampilan & Visual',
    dataSettings: 'Penyimpanan & Data',
    languageLabel: 'Bahasa',
    themeLabel: 'Tema',
    lightTheme: 'Terang',
    darkTheme: 'Gelap',
    musicLabel: 'Musik Latar',
    musicVolumeLabel: 'Volume Musik',
    sfxLabel: 'Efek Suara (SFX)',
    sfxVolumeLabel: 'Volume SFX',
    reducedMotionLabel: 'Kurangi Gerakan',
    reducedMotionHint: 'Mengurangi animasi cepat dan efek transisi layar.',
    resetProgressLabel: 'Atur Ulang Data Permainan',
    resetProgressDesc: 'Hapus permanen semua statistik lokal, permainan aktif, dan pencapaian.',
    resetProgressBtn: 'Hapus Semua Data',
    resetModalTitle: 'Hapus Semua Data?',
    resetModalDesc: 'Apakah Anda yakin ingin mengatur ulang semua data permainan? Tindakan ini tidak dapat dibatalkan. Semua rekor skor, pencapaian, dan permainan aktif akan dihapus secara permanen.',
    resetConfirmedToast: 'Semua data permainan berhasil diatur ulang.',

    // About & FAQ Page
    aboutTitle: 'Tentang MoPuzzle',
    aboutTagline: 'MoPuzzle v1.0.1 — Pikir. Selesaikan. Nikmati.',
    aboutDesc: 'MoPuzzle adalah rangkaian permainan teka-teki kasual sisi klien bersumber terbuka yang dirancang untuk dapat dimainkan secara instan di komputer desktop, tablet, dan ponsel. Tanpa telemetri, tanpa API berbayar, tanpa login, dan mendukung penggunaan luring penuh.',
    developerLabel: 'Pengembang & Arsitektur',
    developerName: 'Dimas Mong',
    openSourceLabel: 'Sumber Terbuka & Atribusi',
    licenseNotice: 'MoPuzzle adalah perangkat lunak sumber terbuka yang dilisensikan di bawah Lisensi MIT.',
    footerText: '© 2026 MoPuzzle. Dilisensikan di bawah Lisensi MIT. Dibuat dengan ❤️ oleh Dimas Mong.',
    viewOnGithub: 'Lihat di GitHub',
    
    faqTitle: 'Tanya Jawab (FAQ)',
    faq1Q: 'Apakah MoPuzzle benar-benar gratis untuk dimainkan?',
    faq1A: 'Ya! MoPuzzle 100% gratis, bersumber terbuka, tanpa iklan, tanpa pelacak, dan tanpa langganan.',
    faq2Q: 'Di mana data permainan saya disimpan?',
    faq2A: 'Semua skor tertinggi, statistik, dan permainan yang sedang berlangsung disimpan secara lokal di perangkat Anda menggunakan IndexedDB dan LocalStorage. Data Anda tidak pernah meninggalkan peramban Anda.',
    faq3Q: 'Bisakah saya memainkan MoPuzzle saat tidak ada internet (offline)?',
    faq3A: 'Tentu saja. MoPuzzle adalah Progressive Web App (PWA). Setelah dimuat pertama kali, seluruh kode dan efek suara disimpan dalam cache lokal sehingga Anda dapat bermain secara offline kapan saja.',
    faq4Q: 'Apakah teka-teki Urutkan Warna dan Geser selalu bisa diselesaikan?',
    faq4A: 'Ya! Setiap papan permainan dijamin dapat diselesaikan. Teka-teki Urutkan Warna dibuat dengan simulasi terbalik dan diverifikasi menggunakan pemecah algoritma pencarian BFS. Teka-teki Geser dibuat dengan mengacak papan yang sudah rapi menggunakan langkah legal, menjamin solusi yang pasti.',
    faq5Q: 'Bagaimana cara memasang MoPuzzle ke layar utama ponsel?',
    faq5A: 'Pada Chrome/Edge/Android, klik "Pasang Aplikasi" di menu atau bilah alamat. Pada iOS Safari, ketuk tombol "Bagikan" lalu pilih "Tambahkan ke Layar Utama".',

    // Offline / PWA Notification
    offlineReady: 'MoPuzzle siap dimainkan secara offline!',
    updateAvailable: 'Versi baru MoPuzzle tersedia. Muat ulang halaman untuk memperbarui.'
  }
};

export type TranslationKey = keyof typeof translations.en;

class I18nService {
  private currentLanguage: Language = 'en';
  private listeners: (() => void)[] = [];

  public setLanguage(lang: Language): void {
    if (this.currentLanguage !== lang) {
      this.currentLanguage = lang;
      this.listeners.forEach(cb => cb());
    }
  }

  public getLanguage(): Language {
    return this.currentLanguage;
  }

  public t(key: TranslationKey, params?: Record<string, string | number>): string {
    const dict = translations[this.currentLanguage] || translations.en;
    let text = dict[key] || translations.en[key] || key;
    if (params) {
      Object.keys(params).forEach(pKey => {
        text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(params[pKey]));
      });
    }
    return text;
  }

  public onChange(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }
}

export const I18n = new I18nService();
