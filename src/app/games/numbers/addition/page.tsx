"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Star, Heart, CheckCircle, XCircle, Trophy } from "lucide-react"
import { useApp } from "@/store/app-context"
import { useTranslation } from "@/lib/i18n"
import type { MathProblem } from "@/types"

interface GameState {
  currentProblem: number
  score: number
  lives: number
  problems: MathProblem[]
  userAnswer: string
  showResult: boolean
  isCorrect: boolean
  gameComplete: boolean
  subLevel: number
}

export default function AdditionGamePage() {
  const { state, dispatch } = useApp()
  const { t } = useTranslation(state.language)
  const router = useRouter()

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
  })

  // Generate math problems based on sub-level
  const generateProblems = (subLevel: number): MathProblem[] => {
    const problems: MathProblem[] = []

    for (let i = 0; i < 10; i++) {
      let operand1: number, operand2: number

      // Adjust difficulty based on sub-level
      switch (subLevel) {
        case 1: // Easy: 1-10 + 1-10
          operand1 = Math.floor(Math.random() * 10) + 1
          operand2 = Math.floor(Math.random() * 10) + 1
          break
        case 2: // Medium: 1-20 + 1-20
          operand1 = Math.floor(Math.random() * 20) + 1
          operand2 = Math.floor(Math.random() * 20) + 1
          break
        case 3: // Hard: 1-50 + 1-50
          operand1 = Math.floor(Math.random() * 50) + 1
          operand2 = Math.floor(Math.random() * 50) + 1
          break
        default:
          operand1 = Math.floor(Math.random() * 10) + 1
          operand2 = Math.floor(Math.random() * 10) + 1
      }

      problems.push({
        id: `addition_${i}`,
        operation: "addition",
        operand1,
        operand2,
        answer: operand1 + operand2,
        level: 1,
        subLevel,
      })
    }

    return problems
  }

  // Initialize game
  useEffect(() => {
    const problems = generateProblems(gameState.subLevel)
    setGameState((prev) => ({ ...prev, problems }))
  }, [gameState.subLevel])

  const handleAnswerSubmit = () => {
    const currentProblem = gameState.problems[gameState.currentProblem]
    const userAnswerNum = Number.parseInt(gameState.userAnswer)
    const isCorrect = userAnswerNum === currentProblem.answer

    setGameState((prev) => ({
      ...prev,
      showResult: true,
      isCorrect,
      score: isCorrect ? prev.score + 10 : prev.score,
      lives: isCorrect ? prev.lives : prev.lives - 1,
    }))

    // Auto-advance after showing result
    setTimeout(() => {
      if (gameState.currentProblem + 1 >= gameState.problems.length) {
        // Game complete
        setGameState((prev) => ({ ...prev, gameComplete: true }))
        saveProgress()
      } else {
        // Next problem
        setGameState((prev) => ({
          ...prev,
          currentProblem: prev.currentProblem + 1,
          userAnswer: "",
          showResult: false,
        }))
      }
    }, 1500)
  }

  const saveProgress = async () => {
    if (!state.currentChild) return

    const completedLevel = {
      level: 1,
      subLevel: gameState.subLevel,
      score: gameState.score,
      timeSpent: 0, // Would track actual time in real implementation
      completedAt: new Date(),
      mistakes: 10 - gameState.score / 10,
    }

    // Update child progress
    const updatedProgress = {
      numbers: {
        ...state.currentChild.progress.numbers,
        totalScore: state.currentChild.progress.numbers.totalScore + gameState.score,
        completedLevels: [...state.currentChild.progress.numbers.completedLevels, completedLevel],
      },
    }

    dispatch({
      type: "UPDATE_CHILD_PROGRESS",
      payload: { childId: state.currentChild.id, progress: updatedProgress },
    })
  }

  const restartGame = () => {
    const problems = generateProblems(gameState.subLevel)
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
    })
  }

  const changeSubLevel = (newSubLevel: number) => {
    const problems = generateProblems(newSubLevel)
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
    })
  }

  if (!state.currentChild) {
    router.push("/")
    return null
  }

  const currentProblem = gameState.problems[gameState.currentProblem]
  const progress = ((gameState.currentProblem + 1) / gameState.problems.length) * 100

  if (gameState.gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-radial from-teal-400 via-blue-500 to-indigo-600 animate-gradient-slow flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-2xl overflow-hidden">
          <div className="relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-200 rounded-full opacity-30 blur-2xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-200 rounded-full opacity-30 blur-2xl"></div>
            
            <CardContent className="p-8 text-center space-y-8 relative z-10">
              <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-amber-500 shadow-lg shadow-yellow-400/30 rounded-full flex items-center justify-center mx-auto animate-float">
                <Trophy className="h-12 w-12 text-white" />
              </div>

              <div>
                <h2 className="text-3xl font-bold text-indigo-800 mb-2 font-nunito">
                  {state.language === "en" ? "Congratulations!" : "Selamat!"}
                </h2>
                <p className="text-gray-600 font-nunito">
                  {state.language === "en"
                    ? "You completed the addition game!"
                    : "Anda telah menyelesaikan permainan penjumlahan!"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl shadow-inner">
                  <div className="text-3xl font-bold text-yellow-500 flex items-center justify-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 animate-pulse-gentle" />
                    {gameState.score}
                  </div>
                  <p className="text-sm text-gray-600 font-nunito mt-1">
                    {state.language === "en" ? "Stars Earned" : "Bintang Diperoleh"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-xl shadow-inner">
                  <div className="text-3xl font-bold text-green-500">{Math.round((gameState.score / 100) * 100)}%</div>
                  <p className="text-sm text-gray-600 font-nunito mt-1">{state.language === "en" ? "Accuracy" : "Akurasi"}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button 
                  onClick={restartGame} 
                  className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {state.language === "en" ? "Play Again" : "Main Lagi"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/games/numbers")} 
                  className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors duration-300"
                >
                  {state.language === "en" ? "Back to Numbers" : "Kembali ke Angka"}
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-radial from-teal-400 via-blue-500 to-indigo-600 animate-gradient-slow">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/games/numbers")}
              className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Button>

            <div className="text-center">
              <h1 className="text-xl font-bold text-white text-glow-white font-nunito">{t("addition")}</h1>
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-400/80 to-indigo-400/80 text-white border-0 shadow-md">
                {state.language === "en" ? "Sub-Level" : "Sub-Level"} {gameState.subLevel}
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
                    className={`h-5 w-5 ${i < gameState.lives ? "text-red-400 fill-current animate-beat" : "text-white/30"}`}
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
              <span className="text-indigo-700 font-medium">{state.language === "en" ? "Progress" : "Kemajuan"}</span>
              <span className="bg-indigo-50 px-2 py-0.5 rounded-full text-indigo-700 font-medium">{gameState.currentProblem + 1}/10</span>
            </div>
            <Progress value={progress} className="h-3 bg-blue-100" indicatorClassName="bg-gradient-to-r from-blue-500 to-indigo-600" />
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
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md shadow-blue-500/30" 
                      : "border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-medium">{level}</div>
                    <div className="text-xs opacity-80">{state.language === "en" ? "Level" : "Level"}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Problem Card */}
        {currentProblem && (
          <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 py-3">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-4xl font-bold text-white font-nunito text-glow-white">
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
                      onChange={(e) => setGameState((prev) => ({ ...prev, userAnswer: e.target.value }))}
                      placeholder={state.language === "en" ? "Enter your answer" : "Masukkan jawaban"}
                      className="text-center text-3xl font-bold h-16 text-indigo-800 border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl shadow-inner bg-indigo-50/50"
                      onKeyPress={(e) => e.key === "Enter" && gameState.userAnswer && handleAnswerSubmit()}
                    />
                  </div>
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={!gameState.userAnswer}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl"
                  >
                    {state.language === "en" ? "Submit Answer" : "Kirim Jawaban"}
                  </Button>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce-once ${
                      gameState.isCorrect ? "bg-gradient-to-br from-green-100 to-green-200 shadow-green-200/50" : "bg-gradient-to-br from-red-100 to-red-200 shadow-red-200/50"
                    }`}
                  >
                    {gameState.isCorrect ? (
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    ) : (
                      <XCircle className="h-12 w-12 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold font-nunito ${gameState.isCorrect ? "text-green-600" : "text-red-600"}`}>
                      {gameState.isCorrect ? t("correct") : t("tryAgain")}
                    </h3>
                    {!gameState.isCorrect && (
                      <p className="text-gray-600 mt-2 font-nunito">
                        {state.language === "en" ? "The correct answer is" : "Jawaban yang benar adalah"}{" "}
                        <span className="font-bold text-indigo-600">{currentProblem.answer}</span>
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
  )
}
