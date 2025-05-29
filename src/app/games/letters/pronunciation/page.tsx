"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Star, Heart, CheckCircle, XCircle, Trophy, Mic, MicOff, Volume2 } from "lucide-react"
import { useApp } from "@/store/app-context"
import { useTranslation } from "@/lib/i18n"
import { speechService } from "@/lib/speech"
import type { WordProblem } from "@/types"

interface GameState {
  currentProblem: number
  score: number
  lives: number
  problems: WordProblem[]
  isListening: boolean
  showResult: boolean
  isCorrect: boolean
  gameComplete: boolean
  subLevel: number
  userSpeech: string
  speechSupported: boolean
}

// Word lists for pronunciation practice
const PRONUNCIATION_WORDS = {
  en: {
    1: ["cat", "dog", "sun", "car", "hat", "bat", "run", "fun", "cup", "pen"],
    2: ["house", "water", "happy", "green", "chair", "table", "apple", "bread", "smile", "dance"],
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
    1: ["kucing", "anjing", "matahari", "mobil", "topi", "kelelawar", "lari", "senang", "cangkir", "pena"],
    2: ["rumah", "air", "bahagia", "hijau", "kursi", "meja", "apel", "roti", "senyum", "menari"],
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
}

export default function PronunciationPage() {
  const { state, dispatch } = useApp()
  const { t } = useTranslation(state.language)
  const router = useRouter()

  const [gameState, setGameState] = useState<GameState>({
    currentProblem: 0,
    score: 0,
    lives: 3,
    problems: [],
    isListening: false,
    showResult: false,
    isCorrect: false,
    gameComplete: false,
    subLevel: 1,
    userSpeech: "",
    speechSupported: false,
  })

  // Check speech recognition support
  useEffect(() => {
    const checkSpeechSupport = () => {
      const supported = "webkitSpeechRecognition" in window || "SpeechRecognition" in window
      setGameState((prev) => ({ ...prev, speechSupported: supported }))
    }
    checkSpeechSupport()
  }, [])

  // Generate word problems based on sub-level
  const generateProblems = (subLevel: number): WordProblem[] => {
    const problems: WordProblem[] = []
    const wordList =
      PRONUNCIATION_WORDS[state.language][subLevel as keyof typeof PRONUNCIATION_WORDS.en] ||
      PRONUNCIATION_WORDS[state.language][1]

    // Shuffle and take 10 words
    const shuffledWords = [...wordList].sort(() => Math.random() - 0.5).slice(0, 10)

    shuffledWords.forEach((word, index) => {
      problems.push({
        id: `pronunciation_${index}`,
        word: word.toLowerCase(),
        scrambledWord: "",
        pronunciation: word.toLowerCase(),
        meaning: word.toLowerCase(),
        level: 2,
        subLevel,
        language: state.language,
      })
    })

    return problems
  }

  // Initialize game
  useEffect(() => {
    const problems = generateProblems(gameState.subLevel)
    setGameState((prev) => ({ ...prev, problems }))
  }, [gameState.subLevel, state.language])

  const speakWord = async () => {
    const currentProblem = gameState.problems[gameState.currentProblem]
    if (currentProblem) {
      try {
        await speechService.speak(currentProblem.word, state.language)
      } catch (error) {
        console.error("Speech synthesis failed:", error)
      }
    }
  }

  const startListening = async () => {
    if (!gameState.speechSupported) {
      alert(
        state.language === "en"
          ? "Speech recognition is not supported in your browser"
          : "Pengenalan suara tidak didukung di browser Anda",
      )
      return
    }

    setGameState((prev) => ({ ...prev, isListening: true, userSpeech: "" }))

    try {
      const transcript = await speechService.listen(state.language)
      setGameState((prev) => ({ ...prev, userSpeech: transcript, isListening: false }))
      checkPronunciation(transcript)
    } catch (error) {
      console.error("Speech recognition failed:", error)
      setGameState((prev) => ({ ...prev, isListening: false }))
      alert(
        state.language === "en"
          ? "Could not hear you clearly. Please try again."
          : "Tidak dapat mendengar Anda dengan jelas. Silakan coba lagi.",
      )
    }
  }

  const stopListening = () => {
    speechService.stop()
    setGameState((prev) => ({ ...prev, isListening: false }))
  }

  const checkPronunciation = (transcript: string) => {
    const currentProblem = gameState.problems[gameState.currentProblem]
    const spokenWord = transcript.toLowerCase().trim()
    const targetWord = currentProblem.word.toLowerCase()

    // Simple pronunciation check - in a real app, this would be more sophisticated
    const isCorrect =
      spokenWord.includes(targetWord) ||
      targetWord.includes(spokenWord) ||
      levenshteinDistance(spokenWord, targetWord) <= 2

    setGameState((prev) => ({
      ...prev,
      showResult: true,
      isCorrect,
      score: isCorrect ? prev.score + 10 : prev.score,
      lives: isCorrect ? prev.lives : prev.lives - 1,
    }))

    // Auto-advance after showing result
    setTimeout(() => {
      if (gameState.currentProblem + 1 >= gameState.problems.length || gameState.lives <= 0) {
        // Game complete
        setGameState((prev) => ({ ...prev, gameComplete: true }))
        saveProgress()
      } else {
        // Next problem
        setGameState((prev) => ({
          ...prev,
          currentProblem: prev.currentProblem + 1,
          userSpeech: "",
          showResult: false,
        }))
      }
    }, 2000)
  }

  // Simple Levenshtein distance for pronunciation similarity
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = []
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        }
      }
    }
    return matrix[str2.length][str1.length]
  }

  const saveProgress = async () => {
    if (!state.currentChild) return

    const completedLevel = {
      level: 2,
      subLevel: gameState.subLevel,
      score: gameState.score,
      timeSpent: 0,
      completedAt: new Date(),
      mistakes: 10 - gameState.score / 10,
    }

    const updatedProgress = {
      letters: {
        ...state.currentChild.progress.letters,
        totalScore: state.currentChild.progress.letters.totalScore + gameState.score,
        completedLevels: [...state.currentChild.progress.letters.completedLevels, completedLevel],
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
      isListening: false,
      showResult: false,
      isCorrect: false,
      gameComplete: false,
      subLevel: gameState.subLevel,
      userSpeech: "",
      speechSupported: gameState.speechSupported,
    })
  }

  const changeSubLevel = (newSubLevel: number) => {
    const problems = generateProblems(newSubLevel)
    setGameState({
      currentProblem: 0,
      score: 0,
      lives: 3,
      problems,
      isListening: false,
      showResult: false,
      isCorrect: false,
      gameComplete: false,
      subLevel: newSubLevel,
      userSpeech: "",
      speechSupported: gameState.speechSupported,
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
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="h-10 w-10 text-white" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {state.language === "en" ? "Excellent Speaking!" : "Berbicara Sangat Baik!"}
              </h2>
              <p className="text-gray-600">
                {state.language === "en"
                  ? "You completed the pronunciation game!"
                  : "Anda telah menyelesaikan permainan pelafalan!"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">{gameState.score}</div>
                <p className="text-sm text-gray-600">
                  {state.language === "en" ? "Stars Earned" : "Bintang Diperoleh"}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">{Math.round((gameState.score / 100) * 100)}%</div>
                <p className="text-sm text-gray-600">{state.language === "en" ? "Accuracy" : "Akurasi"}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={restartGame} className="w-full">
                {state.language === "en" ? "Practice Again" : "Berlatih Lagi"}
              </Button>
              <Button variant="outline" onClick={() => router.push("/games/letters")} className="w-full">
                {state.language === "en" ? "Back to Letters" : "Kembali ke Huruf"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
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
              <h1 className="text-xl font-bold text-white">{t("speechRecognition")}</h1>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {state.language === "en" ? "Sub-Level" : "Sub-Level"} {gameState.subLevel}
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
                    className={`h-5 w-5 ${i < gameState.lives ? "text-red-400 fill-current" : "text-white/30"}`}
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
                  variant={gameState.subLevel === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => changeSubLevel(level)}
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
              <CardTitle className="text-lg text-gray-600 mb-4">{t("speakWord")}</CardTitle>
              <div className="text-5xl font-bold text-gray-800 mb-4">{currentProblem.word.toUpperCase()}</div>
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
                        {state.language === "en" ? "You said:" : "Anda berkata:"} "{gameState.userSpeech}"
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
                        {state.language === "en" ? "Start Speaking" : "Mulai Berbicara"}
                      </Button>
                    ) : (
                      <Button
                        onClick={stopListening}
                        className="w-full h-16 text-lg font-semibold bg-red-600 hover:bg-red-700 animate-pulse"
                      >
                        <MicOff className="h-6 w-6 mr-2" />
                        {state.language === "en" ? "Listening... Click to stop" : "Mendengarkan... Klik untuk berhenti"}
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
                    <h3 className={`text-2xl font-bold ${gameState.isCorrect ? "text-green-600" : "text-red-600"}`}>
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
                        {state.language === "en" ? "You said:" : "Anda berkata:"} "{gameState.userSpeech}"
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
