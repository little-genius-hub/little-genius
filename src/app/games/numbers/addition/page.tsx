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

export default function AdditionGamePage() {
  const { state, dispatch } = useApp();
  const { t } = useTranslation(state.language);
  const router = useRouter();

  // State
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
  const [isSaving, setIsSaving] = useState(false);
  const [progressData, setProgressData] = useState<any[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSavedRef = useRef(false);

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
          operand1 = Math.floor(Math.random() * 20) + 1;
          operand2 = Math.floor(Math.random() * 20) + 1;
          break;
        case 3:
          operand1 = Math.floor(Math.random() * 50) + 1;
          operand2 = Math.floor(Math.random() * 50) + 1;
          break;
        default:
          operand1 = Math.floor(Math.random() * 10) + 1;
          operand2 = Math.floor(Math.random() * 10) + 1;
      }
      problems.push({
        id: `addition_${i}`,
        operation: "addition",
        operand1,
        operand2,
        answer: operand1 + operand2,
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
      const res = await fetch(`/api/progress/addition?childId=${childId}`);
      const data = await res.json();

      setProgressData(data.progress || []);
    } catch (err) {
      console.error("Failed to fetch progress data", err);
      setProgressData([]);
    }
  }

  useEffect(() => {
    if (state.currentChild?.id) {
      fetchProgressData(state.currentChild.id);
    }
  }, [state.currentChild?.id]);

  // Tambahkan useEffect ini untuk auto set subLevel aktif
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

    // Set subLevel hanya jika berbeda dari state sekarang
    setGameState((prev) =>
      prev.subLevel !== highest ? { ...prev, subLevel: highest } : prev
    );
  }, [progressData]);

  // Handle answer submission
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
      gameType: "addition-number",
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

  if (gameState.gameComplete) {
    const level = gameState.subLevel;
    const timeSpent =
      gameState.finalTimeSpent ??
      (startTime ? Math.floor((Date.now() - startTime) / 1000) : 0);

    return (
      <div className="min-h-screen bg-gradient-radial from-teal-400 via-blue-500 to-indigo-600 animate-gradient-slow flex items-center justify-center p-4 relative overflow-hidden">
        {/* Floating Celebration Stickers */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 text-4xl animate-bounce-slow">
            🎉
          </div>
          <div className="absolute top-20 right-20 text-3xl animate-float delay-1000">
            ⭐
          </div>
          <div className="absolute bottom-20 left-20 text-3xl animate-spin-slow">
            🏆
          </div>
          <div className="absolute bottom-10 right-10 text-4xl animate-pulse-gentle">
            🎊
          </div>
          <div className="absolute top-1/2 left-5 text-2xl animate-bounce delay-500">
            🌟
          </div>
          <div className="absolute top-1/3 right-5 text-2xl animate-float delay-2000">
            🎈
          </div>
        </div>

        <Card className="w-full max-w-md bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-2xl overflow-hidden animate-scale-in">
          <div className="relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-200 rounded-full opacity-30 blur-2xl animate-pulse-gentle"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-200 rounded-full opacity-30 blur-2xl animate-pulse-gentle delay-1000"></div>
            <CardContent className="p-8 text-center space-y-8 relative z-10">
              <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-amber-500 shadow-lg shadow-yellow-400/30 rounded-full flex items-center justify-center mx-auto animate-float">
                <Trophy className="h-12 w-12 text-white animate-wiggle" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-indigo-800 mb-2 font-nunito animate-fade-in-up">
                  {state.language === "en" ? "Congratulations!" : "Selamat!"}
                </h2>
                <p className="text-gray-600 font-nunito animate-fade-in-up delay-200">
                  {state.language === "en"
                    ? "You completed the addition game!"
                    : "Anda telah menyelesaikan permainan penjumlahan!"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl shadow-inner animate-fade-in-up delay-300">
                  <div className="text-3xl font-bold text-yellow-500 flex items-center justify-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 animate-pulse-gentle" />
                    {gameState.score}
                  </div>
                  <p className="text-sm text-gray-600 font-nunito mt-1">
                    {state.language === "en"
                      ? "Stars Earned"
                      : "Bintang Diperoleh"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-xl shadow-inner animate-fade-in-up delay-400">
                  <div className="text-3xl font-bold text-green-500">
                    {Math.round((gameState.score / 100) * 100)}%
                  </div>
                  <p className="text-sm text-gray-600 font-nunito mt-1">
                    {state.language === "en" ? "Accuracy" : "Akurasi"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-1 animate-fade-in-up delay-500">
                <span className="text-sm text-gray-700">
                  Level:{" "}
                  <span className="font-bold text-indigo-700">{level}</span>
                </span>
                <span className="text-sm text-gray-700">
                  Time Spent:{" "}
                  <span className="font-bold text-indigo-700">
                    {timeSpent} seconds
                  </span>
                </span>
              </div>
              <div className="space-y-3 pt-2">
                <Button
                  onClick={restartGame}
                  className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up delay-600 hover:scale-105"
                >
                  {state.language === "en" ? "Play Again" : "Main Lagi"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/games/numbers")}
                  className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors duration-300 animate-fade-in-up delay-700 hover:scale-105"
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

  // Function to get the highest score for a specific level
  function getHighestScoreForLevel(level: number): number {
    if (!progressData || progressData.length === 0) return 0;
    const levelScores = progressData
      .filter((item: any) => item.level === level)
      .map((item: any) => item.score);
    return levelScores.length > 0 ? Math.max(...levelScores) : 0;
  }

  // Main game UI
  return (
    <div className="min-h-screen bg-gradient-radial from-teal-400 via-blue-500 to-indigo-600 animate-gradient-slow relative overflow-hidden">
      {/* Floating Math Stickers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 text-3xl animate-float">➕</div>
        <div className="absolute top-40 right-20 text-2xl animate-bounce-slow delay-1000">
          🔢
        </div>
        <div className="absolute bottom-40 left-20 text-3xl animate-spin-slow">
          ✨
        </div>
        <div className="absolute bottom-20 right-40 text-2xl animate-pulse-gentle delay-2000">
          🎯
        </div>
        <div className="absolute top-1/3 left-1/4 text-2xl animate-float delay-1500">
          📊
        </div>
        <div className="absolute top-2/3 right-1/4 text-2xl animate-bounce delay-3000">
          🧮
        </div>
        <div className="absolute top-1/2 right-10 text-xl animate-wiggle delay-500">
          💡
        </div>
        <div className="absolute bottom-1/3 left-10 text-xl animate-float delay-2500">
          🎲
        </div>
      </div>

      {/* Header with Purple to Blue Gradient */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 backdrop-blur-md border-b border-white/20 shadow-lg relative">
        {/* Decorative elements in header */}
        <div className="absolute top-2 left-1/4 text-yellow-300 text-sm animate-twinkle">
          ✨
        </div>
        <div className="absolute top-2 right-1/4 text-yellow-300 text-sm animate-twinkle delay-1000">
          ⭐
        </div>

        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/games/numbers")}
              className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 animate-fade-in-left"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Button>
            <div className="text-center animate-fade-in-down">
              <h1 className="text-xl font-bold text-white text-glow-white font-nunito">
                {t("addition")}
              </h1>
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-blue-400/80 to-indigo-400/80 text-white border-0 shadow-md animate-pulse-gentle"
              >
                {state.language === "en" ? "Sub-Level" : "Sub-Level"}{" "}
                {gameState.subLevel}
              </Badge>
            </div>
            <div className="flex items-center gap-5 text-white animate-fade-in-right">
              <div className="flex items-center gap-1 bg-white/10 py-1 px-3 rounded-full hover:bg-white/20 transition-all duration-300">
                <Star className="h-5 w-5 text-yellow-300 animate-pulse-gentle" />
                <span className="font-bold">{gameState.score}</span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: INITIAL_LIVES }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`h-5 w-5 transition-all duration-300 ${
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
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-xl rounded-xl overflow-hidden animate-slide-in-down">
          <CardContent className="p-4">
            <div className="flex justify-between text-sm mb-2 font-nunito">
              <span className="text-indigo-700 font-medium">
                {state.language === "en" ? "Progress" : "Kemajuan"}
              </span>
              <span className="bg-indigo-50 px-2 py-0.5 rounded-full text-indigo-700 font-medium">
                {gameState.currentProblem + 1}/{PROBLEMS_PER_LEVEL}
              </span>
            </div>
            <Progress
              value={progress}
              className="h-3 bg-blue-100 bg-gradient-to-r from-blue-500 to-indigo-600"
            />
          </CardContent>
        </Card>

        {/* Sub-Level Selector */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-xl rounded-xl overflow-hidden animate-slide-in-left">
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
                    className={`min-w-[90px] py-5 transition-all duration-300 hover:scale-105 ${
                      gameState.subLevel === level
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md shadow-blue-500/30 animate-glow"
                        : "border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50"
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
          <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-xl overflow-hidden animate-slide-in-right">
            <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600 py-3 relative">
              {/* Decorative math symbols in problem header */}
              <div className="absolute top-1 left-4 text-white/30 text-xs animate-float">
                +
              </div>
              <div className="absolute top-1 right-4 text-white/30 text-xs animate-float delay-1000">
                =
              </div>

              <CardHeader className="text-center pb-2">
                <CardTitle className="text-4xl font-bold text-white font-nunito text-glow-white animate-number-pop">
                  {currentProblem.operand1} + {currentProblem.operand2} = ?
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
                      className="text-center text-3xl font-bold h-16 text-indigo-800 border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl shadow-inner bg-indigo-50/50 transition-all duration-300 hover:shadow-md focus:scale-105"
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
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600 hover:from-purple-600 hover:via-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl hover:scale-105 animate-glow"
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
                      <CheckCircle className="h-12 w-12 text-green-600 animate-check-mark" />
                    ) : (
                      <XCircle className="h-12 w-12 text-red-600 animate-shake" />
                    )}
                  </div>
                  <div>
                    <h3
                      className={`text-2xl font-bold font-nunito animate-fade-in-up ${
                        gameState.isCorrect ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {gameState.isCorrect ? t("correct") : t("tryAgain")}
                    </h3>
                    {!gameState.isCorrect && (
                      <p className="text-gray-600 mt-2 font-nunito animate-fade-in-up delay-200">
                        {state.language === "en"
                          ? "The correct answer is"
                          : "Jawaban yang benar adalah"}{" "}
                        <span className="font-bold text-indigo-600 animate-highlight">
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

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-gentle {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-3deg);
          }
          75% {
            transform: rotate(3deg);
          }
        }

        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes number-pop {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes check-mark {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        @keyframes highlight {
          0%,
          100% {
            background-color: transparent;
          }
          50% {
            background-color: rgba(99, 102, 241, 0.1);
          }
        }

        @keyframes glow {
          0%,
          100% {
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-pulse-gentle {
          animation: pulse-gentle 2s ease-in-out infinite;
        }
        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        .animate-fade-in-left {
          animation: fade-in-left 0.6s ease-out;
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.6s ease-out;
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }
        .animate-slide-in-down {
          animation: slide-in-down 0.8s ease-out;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.6s ease-out;
        }
        .animate-number-pop {
          animation: number-pop 2s ease-in-out infinite;
        }
        .animate-check-mark {
          animation: check-mark 0.6s ease-out;
        }
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }
        .animate-highlight {
          animation: highlight 2s ease-in-out infinite;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-600 {
          animation-delay: 0.6s;
        }
        .delay-700 {
          animation-delay: 0.7s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-1500 {
          animation-delay: 1.5s;
        }
        .delay-2000 {
          animation-delay: 2s;
        }
        .delay-2500 {
          animation-delay: 2.5s;
        }
        .delay-3000 {
          animation-delay: 3s;
        }
      `}</style>
    </div>
  );
}
