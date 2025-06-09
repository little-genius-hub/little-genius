import type { Language } from "@/types";

export const translations = {
  en: {
    // Navigation
    home: "Home",
    games: "Games",
    stories: "Stories",
    parent: "Parent Dashboard",
    logout: "Logout",

    // Greetings
    hello: "Hello",

    // Games
    numbers: "Number Games",
    letters: "Letter Games",
    level: "Level",
    score: "Score",
    correct: "Correct!",
    tryAgain: "Try Again",
    nextProblem: "Next Problem",

    // Math Operations
    addition: "Addition",
    subtraction: "Subtraction",
    multiplication: "Multiplication",
    division: "Division",

    // Letter Games
    wordScramble: "Word Scramble",
    speechRecognition: "Say the Word",
    unscrambleWord: "Unscramble the word",
    speakWord: "Say this word clearly", // Stories
    fairytales: "Fairytales",
    readStory: "Read Story",
    listenStory: "Listen to Story",
    generateNewStory: "Generate New Story",
    generatingStory: "Generating Story...",
    storyGenerated: "Story Generated!",
    previousPage: "Previous Page",
    nextPage: "Next Page",

    // Auth
    signIn: "Sign In",
    signOut: "Sign Out",
    signInWithGoogle: "Sign in with Google",
    parentPin: "Parent PIN",
    enterPin: "Enter your 4-digit PIN",

    // Common
    start: "Start",
    continue: "Continue",
    finish: "Finish",
    back: "Back",
    next: "Next",
    loading: "Loading...",
    installApp: "Install App",
  },
  id: {
    // Navigation
    home: "Beranda",
    games: "Permainan",
    stories: "Cerita",
    parent: "Dashboard Orang Tua",
    logout: "Keluar",

    // Greetings
    hello: "Halo",

    // Games
    numbers: "Permainan Angka",
    letters: "Permainan Huruf",
    level: "Level",
    score: "Skor",
    correct: "Benar!",
    tryAgain: "Coba Lagi",
    nextProblem: "Soal Berikutnya",

    // Math Operations
    addition: "Penjumlahan",
    subtraction: "Pengurangan",
    multiplication: "Perkalian",
    division: "Pembagian",

    // Letter Games
    wordScramble: "Acak Kata",
    speechRecognition: "Ucapkan Kata",
    unscrambleWord: "Susun kata yang benar",
    speakWord: "Ucapkan kata ini dengan jelas",
    fairytales: "Dongeng",
    readStory: "Baca Cerita",
    listenStory: "Dengarkan Cerita",
    generateNewStory: "Buat Cerita Baru",
    generatingStory: "Membuat Cerita...",
    storyGenerated: "Cerita Berhasil Dibuat!",
    previousPage: "Halaman Sebelumnya",
    nextPage: "Halaman Selanjutnya",

    // Auth
    signIn: "Masuk",
    signOut: "Keluar",
    signInWithGoogle: "Masuk dengan Google",
    parentPin: "PIN Orang Tua",
    enterPin: "Masukkan PIN 4 digit",

    // Common
    start: "Mulai",
    continue: "Lanjutkan",
    finish: "Selesai",
    back: "Kembali",
    next: "Selanjutnya",
    loading: "Memuat...",
    installApp: "Pasang Aplikasi",
  },
};

export function useTranslation(language: Language) {
  return {
    t: (key: keyof typeof translations.en): string => {
      return translations[language][key] || translations.en[key] || key;
    },
  };
}
