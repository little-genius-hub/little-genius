"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Star,
  Heart,
  CheckCircle,
  XCircle,
  Trophy,
  Mic,
  MicOff,
  Volume2,
} from "lucide-react";
import { useApp } from "@/store/app-context";
import { useTranslation } from "@/lib/i18n";
import { speechService } from "@/lib/speech";
import type { WordProblem } from "@/types";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

const INITIAL_LIVES = 3;
const PROBLEMS_PER_LEVEL = 10;

interface GameState {
  currentProblem: number;
  score: number;
  lives: number;
  problems: WordProblem[];
  isListening: boolean;
  showResult: boolean;
  isCorrect: boolean;
  gameComplete: boolean;
  subLevel: number;
  userSpeech: string;
  speechSupported: boolean;
}

export default function PronunciationPage() {
  const { state, dispatch } = useApp();
  const { t } = useTranslation(state.language);
  const router = useRouter();

  const [gameState, setGameState] = useState<GameState>({
    currentProblem: 0,
    score: 0,
    lives: INITIAL_LIVES,
    problems: [],
    isListening: false,
    showResult: false,
    isCorrect: false,
    gameComplete: false,
    subLevel: 1,
    userSpeech: "",
    speechSupported: false,
  });

  const [progressData, setProgressData] = useState<any[]>([]);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hasFetchedProblems, setHasFetchedProblems] = useState(false);
  const [problemsData, setProblemsData] = useState<WordProblem[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showSpeechError, setShowSpeechError] = useState(false);
  const [speechErrorMsg, setSpeechErrorMsg] = useState("");

  // Check speech recognition support
  useEffect(() => {
    const supported =
      "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    setGameState((prev) => ({ ...prev, speechSupported: supported }));
  }, []);

  // Fetch progress dari backend
  async function fetchProgressData(childId: string) {
    setIsLoadingProgress(true);
    try {
      const res = await fetch(
        `/api/games-letter/pronounciation/progress?childId=${childId}`
      );
      const data = await res.json();
      setProgressData(data.progress || []);
    } catch (err) {
      setProgressData([]);
    }
    setIsLoadingProgress(false);
  }

  // Fetch progress saat mount/child berubah
  useEffect(() => {
    if (state.currentChild?.id) {
      fetchProgressData(state.currentChild.id);
    }
  }, [state.currentChild?.id]);

  // Set subLevel setelah progressData didapat
  useEffect(() => {
    if (!progressData || progressData.length === 0) {
      setGameState((prev) => ({ ...prev, subLevel: 1 }));
      return;
    }
    const level1Score = progressData
      .filter((item: any) => item.level === 1)
      .map((item: any) => item.score);
    const isLevel2Unlocked =
      level1Score.length > 0 && Math.max(...level1Score) >= 80;
    const level2Score = progressData
      .filter((item: any) => item.level === 2)
      .map((item: any) => item.score);
    const isLevel3Unlocked =
      level2Score.length > 0 && Math.max(...level2Score) >= 80;

    let highest = 1;
    if (isLevel3Unlocked) highest = 3;
    else if (isLevel2Unlocked) highest = 2;

    if (gameState.subLevel !== highest) {
      setGameState((prev) => ({ ...prev, subLevel: highest }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressData]);

  // Fetch soal dari backend
  const fetchProblems = async () => {
    setLoading(true);
    setHasFetchedProblems(false);
    try {
      const res = await fetch(
        `/api/games-letter/pronounciation?language=${state.language}&level=${gameState.subLevel}`
      );
      const data = await res.json();
      const problems: WordProblem[] = (data.questions || []).map(
        (q: any, idx: number) => ({
          id: `pronunciation_${idx}`,
          word: q.word.toLowerCase(),
          scrambledWord: "",
          pronunciation: q.word.toLowerCase(),
          meaning: q.meaning || q.word.toLowerCase(),
          level: q.level,
          subLevel: q.level,
          language: q.language,
        })
      );
      setProblemsData(problems);
      setStartTime(Date.now()); // <-- Tambahkan ini
    } catch {
      setProblemsData([]);
    } finally {
      setLoading(false);
      setHasFetchedProblems(true);
    }
  };

  // Fetch soal listen ke subLevel
  useEffect(() => {
    fetchProblems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.subLevel, state.language]);

  // Konsumsi data dari problemsData, update gameState.problems jika data berubah
  useEffect(() => {
    if (!hasFetchedProblems) return;
    if (problemsData.length === 0) return;
    setGameState((prev) => ({
      ...prev,
      problems: problemsData,
      currentProblem: 0,
      score: 0,
      lives: INITIAL_LIVES,
      isListening: false,
      showResult: false,
      isCorrect: false,
      gameComplete: false,
      userSpeech: "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemsData, hasFetchedProblems]);

  // Function untuk cek skor tertinggi per level
  function getHighestScoreForLevel(level: number): number {
    if (!progressData || progressData.length === 0) return 0;
    const levelScores = progressData
      .filter((item: any) => item.level === level)
      .map((item: any) => item.score);
    return levelScores.length > 0 ? Math.max(...levelScores) : 0;
  }

  const [currentProblem, setCurrentProblem] = useState<WordProblem | null>(
    null
  );

  // Initialize game
  useEffect(() => {
    if (gameState.problems.length > 0) {
      setCurrentProblem(gameState.problems[gameState.currentProblem]);
    }
  }, [gameState.problems, gameState.currentProblem]);

  const speakWord = async () => {
    if (currentProblem) {
      try {
        await speechService.speak(currentProblem.word, state.language);
      } catch (error) {
        console.error("Speech synthesis failed:", error);
      }
    }
  };

  const startListening = async () => {
    if (!gameState.speechSupported) {
      setSpeechErrorMsg(
        state.language === "en"
          ? "Speech recognition is not supported in your browser"
          : "Pengenalan suara tidak didukung di browser Anda"
      );
      setShowSpeechError(true);
      return;
    }

    setGameState((prev) => ({ ...prev, isListening: true, userSpeech: "" }));

    try {
      const transcript = await speechService.listen(state.language);
      setGameState((prev) => ({
        ...prev,
        userSpeech: transcript,
        isListening: false,
      }));
      checkPronunciation(transcript);
    } catch (error: any) {
      console.error("Speech recognition failed:", error);
      setGameState((prev) => ({ ...prev, isListening: false }));
      setSpeechErrorMsg(
        error?.message === "No speech detected"
          ? state.language === "en"
            ? "No speech detected. Please try again and speak clearly."
            : "Tidak ada suara terdeteksi. Silakan coba lagi dan bicara dengan jelas."
          : state.language === "en"
          ? "Could not hear you clearly. Please try again."
          : "Tidak dapat mendengar Anda dengan jelas. Silakan coba lagi."
      );
      setShowSpeechError(true);
    }
  };

  const stopListening = () => {
    speechService.stop();
    setGameState((prev) => ({ ...prev, isListening: false }));
  };

  const checkPronunciation = (transcript: string) => {
    const spokenWord = transcript.toLowerCase().trim();
    const targetWord = currentProblem?.word?.toLowerCase() ?? "";

    // Simple pronunciation check - in a real app, this would be more sophisticated
    const isCorrect =
      spokenWord.includes(targetWord) ||
      targetWord.includes(spokenWord) ||
      levenshteinDistance(spokenWord, targetWord) <= 2;

    setGameState((prev) => ({
      ...prev,
      showResult: true,
      isCorrect,
      score: isCorrect ? prev.score + 10 : prev.score,
      lives: isCorrect ? prev.lives : prev.lives - 1,
    }));

    // Auto-advance after showing result
    setTimeout(() => {
      if (
        gameState.currentProblem + 1 >= gameState.problems.length ||
        gameState.lives <= 0
      ) {
        // Game complete
        setGameState((prev) => {
          const finalScore = prev.score;
          setTimeout(() => saveProgress(finalScore), 0); // pastikan skor terbaru
          return { ...prev, gameComplete: true };
        });
      } else {
        // Next problem
        setGameState((prev) => ({
          ...prev,
          currentProblem: prev.currentProblem + 1,
          userSpeech: "",
          showResult: false,
        }));
      }
    }, 2000);
  };

  // Simple Levenshtein distance for pronunciation similarity
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  // Ganti saveProgress agar sama dengan word-scramble
  const saveProgress = async (finalScore: number) => {
    if (!state.currentChild) return;

    const timeSpent = startTime
      ? Math.floor((Date.now() - startTime) / 1000)
      : 0;

    const completedLevel = {
      childId: state.currentChild.id,
      level: gameState.subLevel,
      score: finalScore,
      timeSpent,
      completedAt: new Date(),
      mistakes: 10 - finalScore / 10,
      gameType: "pronunciation",
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
    setGameState((prev) => ({
      ...prev,
      currentProblem: 0,
      score: 0,
      lives: INITIAL_LIVES,
      problems: [],
      isListening: false,
      showResult: false,
      isCorrect: false,
      gameComplete: false,
      userSpeech: "",
      // subLevel tetap, speechSupported tetap
    }));
    setHasFetchedProblems(false);
    setProblemsData([]);
    setStartTime(Date.now()); // <-- Tambahkan ini
    window.location.reload();
  };

  const changeSubLevel = (newSubLevel: number) => {
    setGameState((prev) => ({
      ...prev,
      currentProblem: 0,
      score: 0,
      lives: INITIAL_LIVES,
      problems: [],
      isListening: false,
      showResult: false,
      isCorrect: false,
      gameComplete: false,
      subLevel: newSubLevel,
      userSpeech: "",
      // speechSupported tetap
    }));
    setHasFetchedProblems(false);
    setProblemsData([]);
    setStartTime(Date.now()); // <-- Tambahkan ini
  };

  useEffect(() => {
    if (!state.isLoading && !state.currentChild) {
      router.push("/games/letters");
    }
  }, [state.currentChild, state.isLoading, router]);

  if (!state.currentChild) {
    return null; // Jangan render apapun saat redirect
  }

  const progress =
    ((gameState.currentProblem + 1) / gameState.problems.length) * 100;

  if (gameState.gameComplete) {
    const timeSpent = startTime
      ? Math.floor((Date.now() - startTime) / 1000)
      : 0;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <CardContent className="p-8 text-center space-y-8 relative z-10">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-400 to-pink-400 shadow-lg shadow-blue-400/30 rounded-full flex items-center justify-center mx-auto animate-float">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-indigo-800 mb-2 font-nunito">
                {state.language === "en" ? "Congratulations!" : "Selamat!"}
              </h2>
              <p className="text-purple-600 font-nunito">
                {state.language === "en"
                  ? "You completed the pronunciation game!"
                  : "Anda telah menyelesaikan permainan pelafalan!"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-yellow-50 to-blue-50 p-4 rounded-xl shadow-inner">
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
              <div className="bg-gradient-to-br from-blue-50 to-pink-50 p-4 rounded-xl shadow-inner">
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
                {state.language === "en" ? "Level:" : "Level:"}{" "}
                <span className="font-bold text-indigo-700">
                  {gameState.subLevel}
                </span>
              </span>
              <span className="text-sm text-gray-700">
                {state.language === "en" ? "Time Spent:" : "Waktu:"}{" "}
                <span className="font-bold text-indigo-700">
                  {timeSpent} {state.language === "en" ? "seconds" : "detik"}
                </span>
              </span>
            </div>
            <div className="space-y-3 pt-2">
              <Button
                onClick={restartGame}
                className="w-full bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                {state.language === "en" ? "Play Again" : "Main Lagi"}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/games/letters")}
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors duration-300"
              >
                {state.language === "en"
                  ? "Back to Games"
                  : "Kembali ke Permainan"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle loading progress
  if (isLoadingProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg font-semibold">
          {t("loading") || "Loading..."}
        </span>
      </div>
    );
  }

  // Handle loading soal
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg font-semibold">
          {t("loading") || "Loading..."}
        </span>
      </div>
    );
  }

  // Handle jika soal kosong
  if (!loading && hasFetchedProblems && gameState.problems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg font-semibold text-red-500">
          {state.language === "en"
            ? "No questions available for this level."
            : "Tidak ada soal untuk level ini."}
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/games/letters")}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("back")}
              </Button>

              <div className="text-center">
                <h1 className="text-xl font-bold text-white">
                  {t("speechRecognition")}
                </h1>
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-0"
                >
                  {state.language === "en" ? "Sub-Level" : "Sub-Level"}{" "}
                  {gameState.subLevel}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-white">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-300" />
                  <span className="font-bold">{gameState.score}</span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Heart
                      key={i}
                      className={`h-5 w-5 ${
                        i < gameState.lives
                          ? "text-red-400 fill-current"
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
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex justify-between text-sm mb-2">
                <span>{state.language === "en" ? "Progress" : "Kemajuan"}</span>
                <span>{gameState.currentProblem + 1}/10</span>
              </div>
              <Progress value={progress} className="h-3" />
            </CardContent>
          </Card>

          {/* Sub-Level Selector */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex gap-2 justify-center">
                {[1, 2, 3].map((level) => (
                  <Button
                    key={level}
                    variant={
                      gameState.subLevel === level ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => changeSubLevel(level)}
                    disabled={
                      (level === 2 && getHighestScoreForLevel(1) < 80) ||
                      (level === 3 && getHighestScoreForLevel(2) < 80)
                    }
                    className="min-w-[80px]"
                  >
                    {state.language === "en" ? "Level" : "Level"} {level}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Speech Support Warning */}
          {!gameState.speechSupported && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4 text-center">
                <p className="text-yellow-800">
                  {state.language === "en"
                    ? "Speech recognition is not supported in your browser. Please use Chrome or Safari for the best experience."
                    : "Pengenalan suara tidak didukung di browser Anda. Silakan gunakan Chrome atau Safari untuk pengalaman terbaik."}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Problem Card */}
          {currentProblem && (
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg text-gray-600 mb-4">
                  {t("speakWord")}
                </CardTitle>
                <div className="text-5xl font-bold text-gray-800 mb-4">
                  {currentProblem.word.toUpperCase()}
                </div>
                <Button variant="outline" onClick={speakWord} className="mb-4">
                  <Volume2 className="h-4 w-4 mr-2" />
                  {state.language === "en" ? "Listen" : "Dengarkan"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {!gameState.showResult ? (
                  <div className="text-center space-y-6">
                    {gameState.userSpeech && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800">
                          {state.language === "en"
                            ? "You said:"
                            : "Anda berkata:"}{" "}
                          "{gameState.userSpeech}"
                        </p>
                      </div>
                    )}

                    <div className="space-y-4">
                      {!gameState.isListening ? (
                        <Button
                          onClick={startListening}
                          disabled={!gameState.speechSupported}
                          className="w-full h-16 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                        >
                          <Mic className="h-6 w-6 mr-2" />
                          {state.language === "en"
                            ? "Start Speaking"
                            : "Mulai Berbicara"}
                        </Button>
                      ) : (
                        <Button
                          onClick={stopListening}
                          className="w-full h-16 text-lg font-semibold bg-red-600 hover:bg-red-700 animate-pulse"
                        >
                          <MicOff className="h-6 w-6 mr-2" />
                          {state.language === "en"
                            ? "Listening... Click to stop"
                            : "Mendengarkan... Klik untuk berhenti"}
                        </Button>
                      )}
                    </div>

                    <p className="text-sm text-gray-600">
                      {state.language === "en"
                        ? "Click the microphone and say the word clearly"
                        : "Klik mikrofon dan ucapkan kata dengan jelas"}
                    </p>
                  </div>
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
                          gameState.isCorrect
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {gameState.isCorrect
                          ? state.language === "en"
                            ? "Great pronunciation!"
                            : "Pelafalan bagus!"
                          : state.language === "en"
                          ? "Try again!"
                          : "Coba lagi!"}
                      </h3>
                      {gameState.userSpeech && (
                        <p className="text-gray-600 mt-2">
                          {state.language === "en"
                            ? "You said:"
                            : "Anda berkata:"}{" "}
                          "{gameState.userSpeech}"
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

      {/* AlertDialog for Speech Error */}
      <AlertDialog open={showSpeechError} onOpenChange={setShowSpeechError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {state.language === "en" ? "Speech Error" : "Kesalahan Suara"}
            </AlertDialogTitle>
            <AlertDialogDescription>{speechErrorMsg}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {state.language === "en" ? "Cancel" : "Batal"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowSpeechError(false);
                setTimeout(() => startListening(), 200);
              }}
            >
              {state.language === "en" ? "Try Again" : "Coba Lagi"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
