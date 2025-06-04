"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Star, Trophy, Lock, Shuffle, Mic } from "lucide-react";
import { useApp } from "@/store/app-context";
import { useTranslation } from "@/lib/i18n";
import { useEffect } from "react";

const LETTER_GAMES = [
  {
    id: "word-scramble",
    level: 1,
    icon: Shuffle,
    color: "from-green-400 to-green-600",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    route: "/games/letters/word-scramble",
  },
  {
    id: "pronunciation",
    level: 2,
    icon: Mic,
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    route: "/games/letters/pronunciation",
  },
];

export default function LetterGamesPage() {
  const { state } = useApp();
  const { t } = useTranslation(state.language);
  const router = useRouter();

  const currentProgress = state.currentChild?.progress.letters || {
    level: 1,
    subLevel: 1,
    totalScore: 0,
    completedLevels: [],
  };

  useEffect(() => {
    if (!state.currentChild) {
      router.push("/games/letters");
    }
  }, [state.currentChild, router]);

  if (!state.currentChild) {
    return null;
  }

  const isGameUnlocked = (level: number) => {
    return (
      level <= currentProgress.level ||
      currentProgress.completedLevels.some((cl) => cl.level >= level)
    );
  };

  const getGameProgress = (level: number) => {
    const completedSubLevels = currentProgress.completedLevels.filter(
      (cl) => cl.level === level
    ).length;
    return Math.min((completedSubLevels / 3) * 100, 100);
  };

  const handleGameSelect = (gameId: string, level: number, route: string) => {
    if (!isGameUnlocked(level)) return;
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-teal-500 to-blue-500 p-4">
      <div className="w-full max-w-md mx-auto">
        <header className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/")}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-yellow-400/80 text-yellow-950 border-yellow-500"
            >
              <Trophy className="h-3 w-3 mr-1" />
              <span>
                {t("level")} {currentProgress.level}
              </span>
            </Badge>
            <Badge
              variant="outline"
              className="bg-white/20 border-white/30 text-white"
            >
              <Star className="h-3 w-3 mr-1" />
              <span>{currentProgress.totalScore}</span>
            </Badge>
          </div>
        </header>

        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl mb-6 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500"></div>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {t("letters")}
            </h1>
            <p className="text-sm text-gray-600 text-center mb-6">
              {state.language === "en"
                ? "Learn letters and words with fun activities!"
                : "Belajar huruf dan kata dengan aktivitas seru!"}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {LETTER_GAMES.map((game) => {
                const isUnlocked = isGameUnlocked(game.level);
                return (
                  <Card
                    key={game.id}
                    className={`overflow-hidden border-0 shadow-md ${
                      isUnlocked
                        ? "card-hover-effect opacity-100"
                        : "opacity-50"
                    }`}
                  >
                    <button
                      className="w-full h-full text-left"
                      onClick={() => router.push(game.route)}
                      disabled={!isUnlocked}
                    >
                      <div
                        className={`h-1 w-full bg-gradient-to-r ${game.color}`}
                      />
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full bg-gradient-to-br ${game.color} border-2 border-white flex items-center justify-center shadow-md`}
                            >
                              <game.icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium">
                                {game.id === "word-scramble"
                                  ? state.language === "en"
                                    ? "Word Scramble"
                                    : "Acak Kata"
                                  : ""}
                                {game.id === "pronunciation"
                                  ? state.language === "en"
                                    ? "Pronunciation"
                                    : "Pelafalan"
                                  : ""}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {t("level")} {game.level}
                              </p>
                            </div>
                          </div>
                          {!isUnlocked && (
                            <Lock className="h-5 w-5 text-gray-400" />
                          )}
                        </div>

                        {isUnlocked && (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs text-gray-600">
                              <span>
                                {state.language === "en"
                                  ? "Progress"
                                  : "Kemajuan"}
                              </span>
                              <span>
                                {Math.round(getGameProgress(game.level))}%
                              </span>
                            </div>
                            <Progress
                              value={getGameProgress(game.level)}
                              className="h-1.5 bg-gray-100"
                            />
                          </div>
                        )}
                      </CardContent>
                    </button>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 border-0 shadow-lg">
          <h2 className="font-semibold mb-2">
            {state.language === "en"
              ? "Activity Description"
              : "Deskripsi Aktivitas"}
          </h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="p-3 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800 mb-1">
                {state.language === "en" ? "Word Scramble" : "Acak Kata"}
              </h3>
              <p className="text-xs">
                {state.language === "en"
                  ? "Rearrange letters to form correct words. Great for vocabulary building!"
                  : "Susun ulang huruf untuk membentuk kata yang benar. Bagus untuk membangun kosakata!"}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-1">
                {state.language === "en" ? "Pronunciation" : "Pelafalan"}
              </h3>
              <p className="text-xs">
                {state.language === "en"
                  ? "Practice saying words correctly. Uses your device's microphone."
                  : "Latih pengucapan kata dengan benar. Menggunakan mikrofon perangkat Anda."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
