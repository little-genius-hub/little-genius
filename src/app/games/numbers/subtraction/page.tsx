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
  Sparkles,
  Zap,
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

const FloatingSticker = ({
  emoji,
  delay = 0,
  duration = 3,
}: {
  emoji: string;
  delay?: number;
  duration?: number;
}) => (
  <div
    className="absolute pointer-events-none animate-float-slow opacity-60"
    style={{
      left: `${Math.random() * 80 + 10}%`,
      top: `${Math.random() * 60 + 20}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      fontSize: "2rem",
    }}
  >
    {emoji}
  </div>
);

const SparkleEffect = ({ show }: { show: boolean }) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-sparkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.2}s`,
          }}
        >
          <Sparkles className="h-4 w-4 text-yellow-400" />
        </div>
      ))}
    </div>
  );
};

export default function SubtractionGamePage() {
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
  const [showSparkles, setShowSparkles] = useState(false);

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

      if (operand2 > operand1) [operand1, operand2] = [operand2, operand1];
      problems.push({
        id: `subtraction_${i}`,
        operation: "subtraction",
        operand1,
        operand2,
        answer: operand1 - operand2,
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
      const res = await fetch(`/api/progress/subtraction?childId=${childId}`);
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

    // Show sparkles for correct answers
    if (isCorrect) {
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 2000);
    }

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
      gameType: "subtraction-number",
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

  // Function untuk cek skor tertinggi per level
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

  // Game complete popup
  if (gameState.gameComplete) {
    const level = gameState.subLevel;
    const timeSpent =
      gameState.finalTimeSpent ??
      (startTime ? Math.floor((Date.now() - startTime) / 1000) : 0);

    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Floating celebration stickers */}
        <FloatingSticker emoji="🎉" delay={0} duration={4} />
        <FloatingSticker emoji="⭐" delay={0.5} duration={5} />
        <FloatingSticker emoji="🏆" delay={1} duration={3} />
        <FloatingSticker emoji="🎊" delay={1.5} duration={4} />
        <FloatingSticker emoji="✨" delay={2} duration={5} />
        <FloatingSticker emoji="🥳" delay={2.5} duration={4} />
        <FloatingSticker emoji="🎈" delay={3} duration={6} />
        <FloatingSticker emoji="🎁" delay={3.5} duration={3} />
        <FloatingSticker emoji="🍭" delay={4} duration={5} />
        <FloatingSticker emoji="🧁" delay={4.5} duration={4} />

        <Card className="w-full max-w-md bg-white/95 backdrop-blur-md border-2 border-purple-200 shadow-2xl rounded-2xl overflow-hidden relative">
          <SparkleEffect show={true} />
          <div className="relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-200 rounded-full opacity-30 blur-2xl animate-pulse-gentle"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-pink-200 rounded-full opacity-30 blur-2xl animate-pulse-gentle"></div>
            <CardContent className="p-8 text-center space-y-8 relative z-10">
              <div className="w-24 h-24 bg-gradient-to-tr from-pink-400 to-yellow-400 shadow-lg shadow-pink-400/30 rounded-full flex items-center justify-center mx-auto animate-bounce-gentle">
                <Trophy className="h-12 w-12 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-pink-800 mb-2 animate-fade-in">
                  {state.language === "en" ? "Congratulations!" : "Selamat!"}
                </h2>
                <p className="text-gray-600">
                  {state.language === "en"
                    ? "You completed the subtraction game!"
                    : "Anda telah menyelesaikan permainan pengurangan!"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-yellow-50 to-pink-50 p-4 rounded-xl shadow-inner transform hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl font-bold text-yellow-500 flex items-center justify-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 animate-spin-slow" />
                    {gameState.score}
                  </div>
                  <p className="text-sm text-gray-600 font-nunito mt-1">
                    {state.language === "en"
                      ? "Stars Earned"
                      : "Bintang Diperoleh"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-yellow-50 p-4 rounded-xl shadow-inner transform hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl font-bold text-green-500 flex items-center justify-center gap-2">
                    <Zap className="h-5 w-5 text-green-500 animate-pulse" />
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
                  <span className="font-bold text-pink-700">{level}</span>
                </span>
                <span className="text-sm text-gray-700">
                  Time Spent:{" "}
                  <span className="font-bold text-pink-700">
                    {timeSpent} seconds
                  </span>
                </span>
              </div>
              <div className="space-y-3 pt-2">
                <Button
                  onClick={restartGame}
                  className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  {state.language === "en" ? "Play Again" : "Main Lagi"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/games/numbers")}
                  className="w-full border-pink-200 text-pink-700 hover:bg-pink-50 transition-all duration-300 transform hover:scale-105"
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

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background floating stickers - Math themed */}
      <FloatingSticker emoji="🔢" delay={0} duration={4} />
      <FloatingSticker emoji="➖" delay={1} duration={5} />
      <FloatingSticker emoji="➕" delay={2} duration={3} />
      <FloatingSticker emoji="✖️" delay={3} duration={4} />
      <FloatingSticker emoji="➗" delay={4} duration={5} />
      <FloatingSticker emoji="🧮" delay={5} duration={6} />
      <FloatingSticker emoji="📊" delay={6} duration={4} />
      <FloatingSticker emoji="📈" delay={7} duration={5} />
      <FloatingSticker emoji="🎯" delay={8} duration={3} />
      <FloatingSticker emoji="🎲" delay={9} duration={4} />

      {/* Educational stickers */}
      <FloatingSticker emoji="📚" delay={0.5} duration={5} />
      <FloatingSticker emoji="📖" delay={1.5} duration={4} />
      <FloatingSticker emoji="📝" delay={2.5} duration={6} />
      <FloatingSticker emoji="✏️" delay={3.5} duration={3} />
      <FloatingSticker emoji="🖊️" delay={4.5} duration={5} />
      <FloatingSticker emoji="📐" delay={5.5} duration={4} />
      <FloatingSticker emoji="📏" delay={6.5} duration={6} />
      <FloatingSticker emoji="🎓" delay={7.5} duration={3} />

      {/* Fun animal learning buddies */}
      <FloatingSticker emoji="🐱" delay={1} duration={7} />
      <FloatingSticker emoji="🐶" delay={2} duration={5} />
      <FloatingSticker emoji="🐰" delay={3} duration={6} />
      <FloatingSticker emoji="🐻" delay={4} duration={4} />
      <FloatingSticker emoji="🦊" delay={5} duration={5} />
      <FloatingSticker emoji="🐼" delay={6} duration={6} />
      <FloatingSticker emoji="🐨" delay={7} duration={4} />
      <FloatingSticker emoji="🐸" delay={8} duration={5} />
      <FloatingSticker emoji="🦋" delay={9} duration={6} />
      <FloatingSticker emoji="🐝" delay={10} duration={4} />

      {/* Stars and sparkles */}
      <FloatingSticker emoji="⭐" delay={0.2} duration={8} />
      <FloatingSticker emoji="🌟" delay={1.2} duration={5} />
      <FloatingSticker emoji="✨" delay={2.2} duration={6} />
      <FloatingSticker emoji="💫" delay={3.2} duration={4} />
      <FloatingSticker emoji="🎪" delay={4.2} duration={7} />
      <FloatingSticker emoji="🎨" delay={5.2} duration={5} />

      {/* Header with Purple to Blue Gradient */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 shadow-lg relative overflow-hidden">
        {/* Shiny overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>

        <div className="max-w-4xl mx-auto px-4 py-4 relative z-10">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/games/numbers")}
              className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white drop-shadow-lg animate-fade-in font-nunito">
                {state.language === "en" ? "Subtraction" : "Pengurangan"}
              </h1>
              <Badge
                variant="secondary"
                className="bg-white/20 backdrop-blur-sm text-white border-0 shadow-md animate-pulse-gentle"
              >
                {state.language === "en" ? "Sub-Level" : "Sub-Level"}{" "}
                {gameState.subLevel}
              </Badge>
            </div>
            <div className="flex items-center gap-5 text-white">
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm py-1 px-3 rounded-full animate-pulse-gentle">
                <Star className="h-5 w-5 text-yellow-300 animate-spin-slow" />
                <span className="font-bold">{gameState.score}</span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: INITIAL_LIVES }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`h-5 w-5 transition-all duration-300 ${
                      i < gameState.lives
                        ? "text-red-400 fill-current animate-beat scale-110"
                        : "text-white/30 scale-90"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6 relative">
        {/* Progress */}
        <Card className="bg-white/95 backdrop-blur-md border-2 border-purple-100 shadow-xl rounded-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
          <CardContent className="p-4">
            <div className="flex justify-between text-sm mb-2 font-nunito">
              <span className="text-pink-700 font-medium flex items-center gap-1">
                <Sparkles className="h-4 w-4 animate-pulse" />
                {state.language === "en" ? "Progress" : "Kemajuan"}
              </span>
              <span className="bg-pink-50 px-2 py-0.5 rounded-full text-pink-700 font-medium animate-bounce-gentle">
                {gameState.currentProblem + 1}/{PROBLEMS_PER_LEVEL}
              </span>
            </div>
            <Progress
              value={progress}
              className="h-3 bg-pink-100 overflow-hidden rounded-full bg-gradient-to-r from-pink-500 to-yellow-400"
            />
          </CardContent>
        </Card>

        {/* Sub-Level Selector */}
        <Card className="bg-white/95 backdrop-blur-md border-2 border-purple-100 shadow-xl rounded-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
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
                    className={`min-w-[90px] py-5 transition-all duration-300 transform hover:scale-110 ${
                      gameState.subLevel === level
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 shadow-md shadow-purple-500/30 animate-pulse-gentle"
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
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Problem Card */}
        {currentProblem && (
          <Card className="bg-white/95 backdrop-blur-md border-2 border-purple-100 shadow-2xl rounded-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 relative">
            <SparkleEffect show={showSparkles} />
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 py-3 relative overflow-hidden">
              {/* Shiny overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              <CardHeader className="text-center pb-2 relative z-10">
                <CardTitle className="text-4xl font-bold text-white drop-shadow-lg animate-bounce-gentle font-nunito">
                  {currentProblem.operand1} - {currentProblem.operand2} = ?
                </CardTitle>
              </CardHeader>
            </div>
            <CardContent className="space-y-6 p-6">
              {!gameState.showResult ? (
                <>
                  <div className="text-center relative">
                    <div className="absolute -top-2 -right-2 text-2xl animate-bounce-gentle">
                      🤔
                    </div>
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
                      className="text-center text-3xl font-bold h-16 text-purple-700 border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl shadow-inner bg-purple-50/50 transition-all duration-300 transform focus:scale-105"
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
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl transform hover:scale-105"
                  >
                    <Zap className="h-5 w-5 mr-2 animate-pulse" />
                    {state.language === "en"
                      ? "Submit Answer"
                      : "Kirim Jawaban"}
                  </Button>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce-once relative ${
                      gameState.isCorrect
                        ? "bg-gradient-to-br from-green-100 to-yellow-100 shadow-green-200/50"
                        : "bg-gradient-to-br from-red-100 to-pink-100 shadow-red-200/50"
                    }`}
                  >
                    {gameState.isCorrect && (
                      <div className="absolute -top-2 -right-2 text-2xl animate-bounce-gentle">
                        🎉
                      </div>
                    )}
                    {gameState.isCorrect ? (
                      <CheckCircle className="h-12 w-12 text-green-600 animate-pulse" />
                    ) : (
                      <XCircle className="h-12 w-12 text-red-600 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h3
                      className={`text-2xl font-bold font-nunito animate-fade-in ${
                        gameState.isCorrect ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {gameState.isCorrect ? (
                        <span className="flex items-center justify-center gap-2">
                          {t("correct")}{" "}
                          <span className="text-2xl">✨</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          {t("tryAgain")}{" "}
                          <span className="text-2xl">💪</span>
                        </span>
                      )}
                    </h3>
                    {!gameState.isCorrect && (
                      <p className="text-gray-600 mt-2 font-nunito">
                        {state.language === "en"
                          ? "The correct answer is"
                          : "Jawaban yang benar adalah"}{" "}
                        <span className="font-bold text-purple-700 text-xl">
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
