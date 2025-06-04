"use client";

import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { useApp } from "@/store/app-context";
import { useTranslation } from "@/lib/i18n";
import type { MathProblem } from "@/types";

interface GameState {
  currentProblem: number;
  score: number;
  lives: number;
  problems: MathProblem[];
  userAnswer: string;
  showResult: boolean;
  isCorrect: boolean;
  gameComplete: boolean;
  subLevel: number;
  finalTimeSpent?: number;
}

const INITIAL_LIVES = 3;
const PROBLEMS_PER_LEVEL = 10;

export default function MultiplicationGamePage() {
  const { state, dispatch } = useApp();
  const { t } = useTranslation(state.language);
  const router = useRouter();

  const [gameState, setGameState] = useState<GameState>({
    currentProblem: 0,
    score: 0,
    lives: INITIAL_LIVES,
    problems: [],
    userAnswer: "",
    showResult: false,
    isCorrect: false,
    gameComplete: false,
    subLevel: 1,
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  const [progressData, setProgressData] = useState<any[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSavedRef = useRef(false);

  // Generate multiplication problems
  function generateProblems(subLevel: number): MathProblem[] {
    const problems: MathProblem[] = [];
    for (let i = 0; i < PROBLEMS_PER_LEVEL; i++) {
      let operand1: number, operand2: number;
      switch (subLevel) {
        case 1:
          operand1 = Math.floor(Math.random() * 10) + 1;
          operand2 = Math.floor(Math.random() * 10) + 1;
          break;
        case 2:
          operand1 = Math.floor(Math.random() * 15) + 1;
          operand2 = Math.floor(Math.random() * 15) + 1;
          break;
        case 3:
          operand1 = Math.floor(Math.random() * 20) + 1;
          operand2 = Math.floor(Math.random() * 20) + 1;
          break;
        default:
          operand1 = Math.floor(Math.random() * 10) + 1;
          operand2 = Math.floor(Math.random() * 10) + 1;
      }
      problems.push({
        id: `multiplication_${i}`,
        operation: "multiplication",
        operand1,
        operand2,
        answer: operand1 * operand2,
        level: subLevel,
        subLevel,
      });
    }
    return problems;
  }

  useEffect(() => {
    setGameState((prev) => ({
      ...prev,
      problems: generateProblems(prev.subLevel),
    }));
  }, [gameState.subLevel]);

  useEffect(() => {
    setStartTime(Date.now());
  }, [gameState.subLevel]);

  async function fetchProgressData(childId: string) {
    try {
      const res = await fetch(
        `/api/progress/multiplication?childId=${childId}`
      );
      const data = await res.json();
      setProgressData(data.progress || []);
    } catch (err) {
      setProgressData([]);
    }
  }

  useEffect(() => {
    if (state.currentChild?.id) {
      fetchProgressData(state.currentChild.id);
    }
  }, [state.currentChild?.id]);

  function handleAnswerSubmit() {
    const current = gameState.problems[gameState.currentProblem];
    const userAnswerNum = Number.parseInt(gameState.userAnswer);
    const isCorrect = userAnswerNum === current.answer;
    const newScore = isCorrect ? gameState.score + 10 : gameState.score;
    const newLives = isCorrect ? gameState.lives : gameState.lives - 1;
    const isLastProblem =
      gameState.currentProblem + 1 >= gameState.problems.length;
    const isLastLife = newLives <= 0;

    if (
      (isLastProblem || isLastLife) &&
      !gameState.gameComplete &&
      !hasSavedRef.current
    ) {
      hasSavedRef.current = true;
      const timeSpent = startTime
        ? Math.floor((Date.now() - startTime) / 1000)
        : 0;
      saveProgress(newScore, timeSpent);
      setGameState((prev) => ({
        ...prev,
        showResult: true,
        isCorrect,
        score: newScore,
        lives: newLives,
        gameComplete: true,
        finalTimeSpent: timeSpent,
      }));
      return;
    }

    setGameState((prev) => ({
      ...prev,
      showResult: true,
      isCorrect,
      score: newScore,
      lives: newLives,
    }));

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        currentProblem: prev.currentProblem + 1,
        userAnswer: "",
        showResult: false,
      }));
    }, 1500);
  }

  async function saveProgress(finalScore: number, timeSpent: number) {
    if (!state.currentChild) return;
    const completedLevel = {
      childId: state.currentChild.id,
      level: gameState.subLevel,
      score: finalScore,
      timeSpent,
      completedAt: new Date(),
      mistakes: PROBLEMS_PER_LEVEL - finalScore / 10,
      gameType: "multiplication-number",
    };

    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completedLevel),
      });
    } catch (err) {}

    const updatedProgress = {
      numbers: {
        ...state.currentChild.progress.numbers,
        totalScore:
          state.currentChild.progress.numbers.totalScore + gameState.score,
        completedLevels: [
          ...state.currentChild.progress.numbers.completedLevels,
          completedLevel,
        ],
      },
    };

    dispatch({
      type: "UPDATE_CHILD_PROGRESS",
      payload: { childId: state.currentChild.id, progress: updatedProgress },
    });
  }

  function restartGame() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    hasSavedRef.current = false;
    setGameState({
      currentProblem: 0,
      score: 0,
      lives: INITIAL_LIVES,
      problems: generateProblems(gameState.subLevel),
      userAnswer: "",
      showResult: false,
      isCorrect: false,
      gameComplete: false,
      subLevel: gameState.subLevel,
    });
    setStartTime(Date.now());
    window.location.reload();
  }

  function changeSubLevel(newSubLevel: number) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    hasSavedRef.current = false;
    setGameState({
      currentProblem: 0,
      score: 0,
      lives: INITIAL_LIVES,
      problems: generateProblems(newSubLevel),
      userAnswer: "",
      showResult: false,
      isCorrect: false,
      gameComplete: false,
      subLevel: newSubLevel,
    });
    setStartTime(Date.now());
  }

  useEffect(() => {
    if (!state.isLoading && !state.currentChild) {
      window.location.href = "/";
    }
  }, [state.currentChild]);

  const currentProblem = gameState.problems[gameState.currentProblem];
  const progress = ((gameState.currentProblem + 1) / PROBLEMS_PER_LEVEL) * 100;

  function getHighestScoreForLevel(level: number): number {
    if (!progressData || progressData.length === 0) return 0;
    const levelScores = progressData
      .filter((item: any) => item.level === level)
      .map((item: any) => item.score);
    return levelScores.length > 0 ? Math.max(...levelScores) : 0;
  }

  useEffect(() => {
    if (!progressData || progressData.length === 0) return;

    // Cek apakah level 2 unlocked (skor level 1 >= 80)
    const level1Score = progressData
      .filter((item: any) => item.level === 1)
      .map((item: any) => item.score);
    const isLevel2Unlocked =
      level1Score.length > 0 && Math.max(...level1Score) >= 80;

    // Cek apakah level 3 unlocked (skor level 2 >= 80)
    const level2Score = progressData
      .filter((item: any) => item.level === 2)
      .map((item: any) => item.score);
    const isLevel3Unlocked =
      level2Score.length > 0 && Math.max(...level2Score) >= 80;

    let highest = 1;
    if (isLevel3Unlocked) {
      highest = 3;
    } else if (isLevel2Unlocked) {
      highest = 2;
    }

    setGameState((prev) =>
      prev.subLevel !== highest ? { ...prev, subLevel: highest } : prev
    );
  }, [progressData]);

  // Add animation styles
  const animationStyles = `
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-bounce-slow {
    animation: bounce-slow 3s infinite;
  }
  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }
`;

  if (gameState.gameComplete) {
    const level = gameState.subLevel;
    const timeSpent =
      gameState.finalTimeSpent ??
      (startTime ? Math.floor((Date.now() - startTime) / 1000) : 0);

    return (
      <div className="min-h-screen bg-gradient-radial from-purple-400 via-blue-400 to-green-400 animate-gradient-slow flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-2xl overflow-hidden">
          <div className="relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-200 rounded-full opacity-30 blur-2xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-200 rounded-full opacity-30 blur-2xl"></div>
            <CardContent className="p-8 text-center space-y-8 relative z-10">
              <div className="w-24 h-24 bg-gradient-to-tr from-purple-400 to-green-400 shadow-lg shadow-purple-400/30 rounded-full flex items-center justify-center mx-auto animate-float relative">
                <Trophy className="h-12 w-12 text-white animate-pulse" />
                <div className="absolute -top-4 -right-4 animate-bounce-slow">
                  🎉
                </div>
                <div
                  className="absolute -bottom-4 -left-4 animate-bounce-slow"
                  style={{ animationDelay: "0.5s" }}
                >
                  🎊
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-green-800 mb-2 font-nunito">
                  {state.language === "en" ? "Congratulations!" : "Selamat!"}
                </h2>
                <p className="text-gray-600 font-nunito">
                  {state.language === "en"
                    ? "You completed the multiplication game!"
                    : "Anda telah menyelesaikan permainan perkalian!"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-purple-50 p-4 rounded-xl shadow-inner">
                  <div className="text-3xl font-bold text-green-500 flex items-center justify-center gap-2">
                    <Star className="h-5 w-5 text-green-500 animate-pulse-gentle" />
                    {gameState.score}
                  </div>
                  <p className="text-sm text-gray-600 font-nunito mt-1">
                    {state.language === "en"
                      ? "Stars Earned"
                      : "Bintang Diperoleh"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-green-50 p-4 rounded-xl shadow-inner">
                  <div className="text-3xl font-bold text-blue-500">
                    {Math.round((gameState.score / 100) * 100)}%
                  </div>
                  <p className="text-sm text-gray-600 font-nunito mt-1">
                    {state.language === "en" ? "Accuracy" : "Akurasi"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <span className="text-sm text-gray-700">
                  Level:{" "}
                  <span className="font-bold text-green-700">{level}</span>
                </span>
                <span className="text-sm text-gray-700">
                  Time Spent:{" "}
                  <span className="font-bold text-green-700">
                    {timeSpent} seconds
                  </span>
                </span>
              </div>
              <div className="space-y-3 pt-2">
                <Button
                  onClick={restartGame}
                  className="w-full bg-gradient-to-r from-purple-500 to-green-500 hover:from-purple-600 hover:to-green-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {state.language === "en" ? "Play Again" : "Main Lagi"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/games/numbers")}
                  className="w-full border-green-200 text-green-700 hover:bg-green-50 transition-colors duration-300"
                >
                  {state.language === "en"
                    ? "Back to Numbers"
                    : "Kembali ke Angka"}
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    );
  }

  // --- JANGAN ADA HOOK/FUNCTION DI BAWAH INI ---

  return (
    <div className="min-h-screen bg-gradient-radial from-purple-400 via-blue-400 to-green-400 animate-gradient-slow">
      <style jsx global>
        {animationStyles}
      </style>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/80 to-green-500/80 backdrop-blur-md border-b border-white/20 shadow-lg relative overflow-hidden">
        <div className="absolute -top-6 left-4 animate-bounce-slow opacity-70">
          <div className="text-3xl">✨</div>
        </div>
        <div className="absolute top-2 right-8 animate-spin-slow opacity-70">
          <div className="text-3xl">🔢</div>
        </div>
        <div className="absolute -bottom-3 left-1/4 animate-pulse-gentle opacity-70">
          <div className="text-2xl">✖️</div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/games/numbers")}
              className="text-green-700 hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-green-700 text-glow-white font-nunito">
                {state.language === "en" ? "Multiplication" : "Perkalian"}
              </h1>
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-purple-400/80 to-green-400/80 text-white border-0 shadow-md"
              >
                {state.language === "en" ? "Sub-Level" : "Sub-Level"}{" "}
                {gameState.subLevel}
              </Badge>
            </div>
            <div className="flex items-center gap-5 text-green-700">
              <div className="flex items-center gap-1 bg-white/10 py-1 px-3 rounded-full">
                <Star className="h-5 w-5 text-green-300 animate-pulse-gentle" />
                <span className="font-bold">{gameState.score}</span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: INITIAL_LIVES }).map((_, i) => (
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
        {/* Floating Math Symbols */}
        <div className="absolute left-4 top-1/4 animate-bounce-slow opacity-70 hidden md:block">
          <div className="text-4xl">➗</div>
        </div>
        <div className="absolute right-8 top-1/3 animate-pulse-gentle opacity-70 hidden md:block">
          <div className="text-4xl">➕</div>
        </div>
        <div className="absolute left-16 bottom-1/4 animate-spin-slow opacity-70 hidden md:block">
          <div className="text-4xl">🧮</div>
        </div>
        {/* Progress */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-xl rounded-xl overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between text-sm mb-2 font-nunito">
              <span className="text-green-700 font-medium">
                {state.language === "en" ? "Progress" : "Kemajuan"}
              </span>
              <span className="bg-green-50 px-2 py-0.5 rounded-full text-green-700 font-medium">
                {gameState.currentProblem + 1}/{PROBLEMS_PER_LEVEL}
              </span>
            </div>
            <Progress
              value={progress}
              className="h-3 bg-green-100 bg-gradient-to-r from-purple-500 to-green-600"
            />
          </CardContent>
        </Card>

        {/* Sub-Level Selector */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-xl rounded-xl overflow-hidden">
          <CardContent className="p-5">
            <div className="flex gap-3 justify-center">
              {[1, 2, 3].map((level) => {
                let disabled = false;
                if (level === 2) disabled = getHighestScoreForLevel(1) < 80;
                if (level === 3) disabled = getHighestScoreForLevel(2) < 80;
                return (
                  <Button
                    key={level}
                    disabled={disabled}
                    variant={
                      gameState.subLevel === level ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => changeSubLevel(level)}
                    className={`min-w-[90px] py-5 transition-all duration-300 ${
                      gameState.subLevel === level
                        ? "bg-gradient-to-r from-purple-500 to-green-600 shadow-md shadow-purple-500/30"
                        : "border-green-200 text-green-700 hover:border-green-300 hover:bg-green-50"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-medium">{level}</div>
                      <div className="text-xs opacity-80">
                        {state.language === "en" ? "Level" : "Level"}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Problem Card */}
        {currentProblem && (
          <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-green-600 py-3">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-4xl font-bold text-green-700 font-nunito text-glow-white">
                  {currentProblem.operand1} × {currentProblem.operand2} = ?
                </CardTitle>
              </CardHeader>
            </div>
            <CardContent className="space-y-6 p-6">
              {!gameState.showResult ? (
                <>
                  <div className="text-center">
                    <Input
                      type="number"
                      value={gameState.userAnswer}
                      onChange={(e) =>
                        setGameState((prev) => ({
                          ...prev,
                          userAnswer: e.target.value,
                        }))
                      }
                      placeholder={
                        state.language === "en"
                          ? "Enter your answer"
                          : "Masukkan jawaban"
                      }
                      className="text-center text-3xl font-bold h-16 text-green-700 border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl shadow-inner bg-green-50/50"
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        gameState.userAnswer &&
                        handleAnswerSubmit()
                      }
                    />
                  </div>
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={!gameState.userAnswer}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-500 to-green-600 hover:from-purple-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl"
                  >
                    {state.language === "en"
                      ? "Submit Answer"
                      : "Kirim Jawaban"}
                  </Button>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce-once ${
                      gameState.isCorrect
                        ? "bg-gradient-to-br from-green-100 to-green-200 shadow-green-200/50"
                        : "bg-gradient-to-br from-red-100 to-red-200 shadow-red-200/50"
                    }`}
                  >
                    {gameState.isCorrect ? (
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    ) : (
                      <XCircle className="h-12 w-12 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3
                      className={`text-2xl font-bold font-nunito ${
                        gameState.isCorrect ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {gameState.isCorrect ? t("correct") : t("tryAgain")}
                    </h3>
                    {!gameState.isCorrect && (
                      <p className="text-gray-600 mt-2 font-nunito">
                        {state.language === "en"
                          ? "The correct answer is"
                          : "Jawaban yang benar adalah"}{" "}
                        <span className="font-bold text-green-700">
                          {currentProblem.answer}
                        </span>
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
