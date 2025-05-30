"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Star,
  Heart,
  CheckCircle,
  XCircle,
  Trophy,
  Shuffle,
  Lightbulb,
} from "lucide-react";
import { useApp } from "@/store/app-context";
import { useTranslation } from "@/lib/i18n";
import type { WordProblem } from "@/types";

interface GameState {
  currentProblem: number;
  score: number;
  lives: number;
  problems: WordProblem[];
  userAnswer: string;
  showResult: boolean;
  isCorrect: boolean;
  gameComplete: boolean;
  subLevel: number;
  showHint: boolean;
}

// Word lists for different difficulty levels
const WORD_LISTS = {
  en: {
    1: ["cat", "dog", "sun", "car", "hat", "bat", "run", "fun", "cup", "pen"],
    2: [
      "house",
      "water",
      "happy",
      "green",
      "chair",
      "table",
      "apple",
      "bread",
      "smile",
      "dance",
    ],
    3: [
      "elephant",
      "computer",
      "beautiful",
      "adventure",
      "chocolate",
      "butterfly",
      "telephone",
      "wonderful",
      "basketball",
      "playground",
    ],
  },
  id: {
    1: [
      "kucing",
      "anjing",
      "matahari",
      "mobil",
      "topi",
      "kelelawar",
      "lari",
      "senang",
      "cangkir",
      "pena",
    ],
    2: [
      "rumah",
      "air",
      "bahagia",
      "hijau",
      "kursi",
      "meja",
      "apel",
      "roti",
      "senyum",
      "menari",
    ],
    3: [
      "gajah",
      "komputer",
      "indah",
      "petualangan",
      "cokelat",
      "kupu-kupu",
      "telepon",
      "menakjubkan",
      "bola basket",
      "taman bermain",
    ],
  },
};

export default function WordScramblePage() {
  const { state, dispatch } = useApp();
  const { t } = useTranslation(state.language);
  const router = useRouter();

  const [gameState, setGameState] = useState<GameState>({
    currentProblem: 0,
    score: 0,
    lives: 3,
    problems: [],
    userAnswer: "",
    showResult: false,
    isCorrect: false,
    gameComplete: false,
    subLevel: 1,
    showHint: false,
  });

  const [startTime, setStartTime] = useState<number | null>(null);

  // Set startTime setiap subLevel berubah (mulai ulang game)
  useEffect(() => {
    setStartTime(Date.now());
  }, [gameState.subLevel]);

  // Scramble a word
  const scrambleWord = (word: string): string => {
    const letters = word.split("");
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    // Make sure the scrambled word is different from the original
    const scrambled = letters.join("");
    return scrambled === word ? scrambleWord(word) : scrambled;
  };

  // Generate word problems based on sub-level
  const generateProblems = (subLevel: number): WordProblem[] => {
    const problems: WordProblem[] = [];
    const wordList =
      WORD_LISTS[state.language][subLevel as keyof typeof WORD_LISTS.en] ||
      WORD_LISTS[state.language][1];

    // Shuffle and take 10 words
    const shuffledWords = [...wordList]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);

    shuffledWords.forEach((word, index) => {
      problems.push({
        id: `scramble_${index}`,
        word: word.toLowerCase(),
        scrambledWord: scrambleWord(word.toLowerCase()),
        pronunciation: word.toLowerCase(),
        meaning: word.toLowerCase(), // In a real app, this would be the translation/meaning
        level: 1,
        subLevel,
        language: state.language,
      });
    });

    return problems;
  };

  // Initialize game
  useEffect(() => {
    const problems = generateProblems(gameState.subLevel);
    setGameState((prev) => ({ ...prev, problems }));
  }, [gameState.subLevel, state.language]);

  useEffect(() => {
    if (!state.currentChild) {
      router.push("/");
    }
  }, [state.currentChild, router]);

  if (!state.currentChild) {
    return null;
  }

  const handleAnswerSubmit = () => {
    const currentProblem = gameState.problems[gameState.currentProblem];
    const userAnswer = gameState.userAnswer.toLowerCase().trim();
    const isCorrect = userAnswer === currentProblem.word;

    setGameState((prev) => ({
      ...prev,
      showResult: true,
      isCorrect,
      score: isCorrect ? prev.score + 10 : prev.score,
      lives: isCorrect ? prev.lives : prev.lives - 1,
      showHint: false,
    }));

    setTimeout(() => {
      if (
        gameState.currentProblem + 1 >= gameState.problems.length ||
        (!isCorrect && gameState.lives - 1 <= 0) // lives habis setelah salah
      ) {
        setGameState((prev) => ({ ...prev, gameComplete: true }));
        saveProgress();
      } else {
        setGameState((prev) => ({
          ...prev,
          currentProblem: prev.currentProblem + 1,
          userAnswer: "",
          showResult: false,
        }));
      }
    }, 1500);
  };

  const saveProgress = async () => {
    if (!state.currentChild) return;

    const timeSpent = startTime
      ? Math.floor((Date.now() - startTime) / 1000)
      : 0;

    const completedLevel = {
      childId: state.currentChild.id,
      level: gameState.subLevel,
      subLevel: gameState.subLevel,
      score: gameState.score,
      timeSpent,
      completedAt: new Date(),
      mistakes: 10 - gameState.score / 10,
      gameType: "word-scramble",
    };

    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completedLevel),
      });
    } catch (err) {
      console.error("Failed to save progress to backend", err);
    }

    const updatedProgress = {
      letters: {
        ...state.currentChild.progress.letters,
        totalScore:
          state.currentChild.progress.letters.totalScore + gameState.score,
        completedLevels: [
          ...state.currentChild.progress.letters.completedLevels,
          completedLevel,
        ],
      },
    };

    dispatch({
      type: "UPDATE_CHILD_PROGRESS",
      payload: { childId: state.currentChild.id, progress: updatedProgress },
    });
  };

  const restartGame = () => {
    const problems = generateProblems(gameState.subLevel);
    setGameState({
      currentProblem: 0,
      score: 0,
      lives: 3,
      problems,
      userAnswer: "",
      showResult: false,
      isCorrect: false,
      gameComplete: false,
      subLevel: gameState.subLevel,
      showHint: false,
    });
  };

  const changeSubLevel = (newSubLevel: number) => {
    const problems = generateProblems(newSubLevel);
    setGameState({
      currentProblem: 0,
      score: 0,
      lives: 3,
      problems,
      userAnswer: "",
      showResult: false,
      isCorrect: false,
      gameComplete: false,
      subLevel: newSubLevel,
      showHint: false,
    });
  };

  const toggleHint = () => {
    setGameState((prev) => ({ ...prev, showHint: !prev.showHint }));
  };

  const scrambleAgain = () => {
    const currentProblem = gameState.problems[gameState.currentProblem];
    const newScrambled = scrambleWord(currentProblem.word);
    const updatedProblems = [...gameState.problems];
    updatedProblems[gameState.currentProblem] = {
      ...currentProblem,
      scrambledWord: newScrambled,
    };
    setGameState((prev) => ({ ...prev, problems: updatedProblems }));
  };

  const currentProblem = gameState.problems[gameState.currentProblem];
  const progress = ((gameState.currentProblem + 1) / 10) * 100;

  if (gameState.gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-radial from-violet-400 via-purple-500 to-indigo-600 animate-gradient-slow flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-2xl overflow-hidden">
          <div className="relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-200 rounded-full opacity-30 blur-2xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-200 rounded-full opacity-30 blur-2xl"></div>

            <CardContent className="p-8 text-center space-y-8 relative z-10">
              <div className="w-24 h-24 bg-gradient-to-tr from-purple-400 to-violet-500 shadow-lg shadow-purple-400/30 rounded-full flex items-center justify-center mx-auto animate-float">
                <Trophy className="h-12 w-12 text-white" />
              </div>

              <div>
                <h2 className="text-3xl font-bold text-indigo-800 mb-2 font-nunito">
                  {state.language === "en" ? "Congratulations!" : "Selamat!"}
                </h2>
                <p className="text-purple-600 font-nunito">
                  {state.language === "en"
                    ? "You completed the word scramble game!"
                    : "Anda telah menyelesaikan permainan mengacak kata!"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl shadow-inner">
                  <div className="text-3xl font-bold text-purple-500 flex items-center justify-center gap-2">
                    <Star className="h-5 w-5 text-purple-500 animate-pulse-gentle" />
                    {gameState.score}
                  </div>
                  <p className="text-sm text-gray-600 font-nunito mt-1">
                    {state.language === "en"
                      ? "Stars Earned"
                      : "Bintang Diperoleh"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl shadow-inner">
                  <div className="text-3xl font-bold text-indigo-500">
                    {Math.round((gameState.score / 100) * 100)}%
                  </div>
                  <p className="text-sm text-gray-600 font-nunito mt-1">
                    {state.language === "en" ? "Accuracy" : "Akurasi"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  onClick={restartGame}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {state.language === "en" ? "Play Again" : "Main Lagi"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/games/letters")}
                  className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors duration-300"
                >
                  {state.language === "en"
                    ? "Back to Games"
                    : "Kembali ke Permainan"}
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-radial from-violet-400 via-purple-500 to-indigo-600 animate-gradient-slow">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/games/letters")}
              className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Button>

            <div className="text-center">
              <h1 className="text-xl font-bold text-white text-glow-white font-nunito">
                {t("wordScramble")}
              </h1>
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-purple-400/80 to-violet-400/80 text-white border-0 shadow-md"
              >
                {state.language === "en" ? "Sub-Level" : "Sub-Level"}{" "}
                {gameState.subLevel}
              </Badge>
            </div>

            <div className="flex items-center gap-5 text-white">
              <div className="flex items-center gap-1 bg-white/10 py-1 px-3 rounded-full">
                <Star className="h-5 w-5 text-yellow-300 animate-pulse-gentle" />
                <span className="font-bold">{gameState.score}</span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`h-5 w-5 ${
                      i < gameState.lives
                        ? "text-red-400 fill-current animate-beat"
                        : "text-white/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Progress */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-xl rounded-xl overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between text-sm mb-2 font-nunito">
              <span className="text-purple-700 font-medium">
                {state.language === "en" ? "Progress" : "Kemajuan"}
              </span>
              <span className="bg-purple-50 px-2 py-0.5 rounded-full text-purple-700 font-medium">
                {gameState.currentProblem + 1}/10
              </span>
            </div>
            <Progress value={progress} className="h-3 bg-violet-100" />
          </CardContent>
        </Card>

        {/* Sub-Level Selector */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-xl rounded-xl overflow-hidden">
          <CardContent className="p-5">
            <div className="flex gap-3 justify-center">
              {[1, 2, 3].map((level) => (
                <Button
                  key={level}
                  variant={gameState.subLevel === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => changeSubLevel(level)}
                  className={`min-w-[90px] py-5 transition-all duration-300 ${
                    gameState.subLevel === level
                      ? "bg-gradient-to-r from-purple-500 to-indigo-600 shadow-md shadow-purple-500/30"
                      : "border-purple-200 text-purple-700 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-medium">{level}</div>
                    <div className="text-xs opacity-80">
                      {state.language === "en" ? "Level" : "Level"}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Problem Card */}
        {currentProblem && (
          <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 py-3">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg text-white/90 mb-2 font-nunito">
                  {t("unscrambleWord")}
                </CardTitle>
                <div className="text-4xl font-bold text-white font-nunito tracking-widest mb-4 text-glow-white bg-white/10 py-3 px-6 rounded-lg mx-auto inline-block">
                  {currentProblem.scrambledWord.toUpperCase()}
                </div>
              </CardHeader>
            </div>
            <div className="bg-gradient-to-r from-indigo-100 to-violet-100 py-2">
              <div className="flex gap-3 justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={scrambleAgain}
                  className="bg-white/70 text-indigo-700 hover:bg-white hover:text-indigo-800 transition-colors"
                >
                  <Shuffle className="h-4 w-4 mr-1" />
                  {state.language === "en" ? "Scramble Again" : "Acak Lagi"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleHint}
                  className="bg-white/70 text-indigo-700 hover:bg-white hover:text-indigo-800 transition-colors"
                >
                  <Lightbulb className="h-4 w-4 mr-1" />
                  {state.language === "en" ? "Hint" : "Petunjuk"}
                </Button>
              </div>
            </div>

            <CardContent className="space-y-6 p-5">
              {gameState.showHint && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-yellow-800 text-sm">
                    {state.language === "en"
                      ? "The word has"
                      : "Kata ini memiliki"}{" "}
                    {currentProblem.word.length}{" "}
                    {state.language === "en"
                      ? "letters and starts with"
                      : "huruf dan dimulai dengan"}{" "}
                    "{currentProblem.word.charAt(0).toUpperCase()}"
                  </p>
                </div>
              )}

              {!gameState.showResult ? (
                <>
                  <div className="text-center">
                    <Input
                      type="text"
                      value={gameState.userAnswer}
                      onChange={(e) =>
                        setGameState((prev) => ({
                          ...prev,
                          userAnswer: e.target.value,
                        }))
                      }
                      placeholder={
                        state.language === "en"
                          ? "Type the correct word"
                          : "Ketik kata yang benar"
                      }
                      className="text-center text-2xl font-bold h-16 text-gray-800"
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        gameState.userAnswer &&
                        handleAnswerSubmit()
                      }
                    />
                  </div>
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={!gameState.userAnswer.trim()}
                    className="w-full h-12 text-lg font-semibold"
                  >
                    {state.language === "en"
                      ? "Submit Answer"
                      : "Kirim Jawaban"}
                  </Button>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
                      gameState.isCorrect ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {gameState.isCorrect ? (
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    ) : (
                      <XCircle className="h-10 w-10 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3
                      className={`text-2xl font-bold ${
                        gameState.isCorrect ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {gameState.isCorrect ? t("correct") : t("tryAgain")}
                    </h3>
                    {!gameState.isCorrect && (
                      <p className="text-gray-600 mt-2">
                        {state.language === "en"
                          ? "The correct word is"
                          : "Kata yang benar adalah"}{" "}
                        <span className="font-bold">{currentProblem.word}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
