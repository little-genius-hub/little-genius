"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Star, Trophy, Lock } from "lucide-react";
import { useApp } from "@/store/app-context";
import { useTranslation } from "@/lib/i18n";

const OPERATIONS = [
  {
    id: "addition",
    level: 1,
    icon: "➕",
    color: "from-green-400 to-green-600",
  },
  {
    id: "subtraction",
    level: 2,
    icon: "➖",
    color: "from-blue-400 to-blue-600",
  },
  {
    id: "multiplication",
    level: 3,
    icon: "✖️",
    color: "from-purple-400 to-purple-600",
  },
  {
    id: "division",
    level: 4,
    icon: "➗",
    color: "from-orange-400 to-orange-600",
  },
];

export default function NumberGamesPage() {
  const { state } = useApp();
  const { t } = useTranslation(state.language);
  const router = useRouter();
  const [selectedOperation, setSelectedOperation] = useState<string | null>(
    null
  );

  const currentProgress = state.currentChild?.progress.numbers || {
    level: 1,
    subLevel: 1,
    totalScore: 0,
    completedLevels: [],
  };

  // Redirect jika tidak ada currentChild
  useEffect(() => {
    if (!state.isLoading && !state.currentChild) {
      router.push("/");
    }
  }, [state.currentChild, router]);

  const isOperationUnlocked = (level: number) => {
    return (
      level <= currentProgress.level ||
      currentProgress.completedLevels.some((cl) => cl.level >= level)
    );
  };

  const getOperationProgress = (level: number) => {
    const completedSubLevels = currentProgress.completedLevels.filter(
      (cl) => cl.level === level
    ).length;
    return Math.min((completedSubLevels / 3) * 100, 100);
  };

  const handleOperationSelect = (operation: string, level: number) => {
    if (!isOperationUnlocked(level)) return;
    router.push(`/games/numbers/${operation}`);
  };

  if (!state.currentChild) {
    return null; // Jangan render apapun saat redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
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
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t("numbers")}
            </h1>
            <p className="text-sm text-gray-600 text-center mb-6">
              {state.language === "en"
                ? "Learn math operations with fun games!"
                : "Belajar operasi matematika dengan permainan seru!"}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {OPERATIONS.map((op) => {
                const isUnlocked = isOperationUnlocked(op.level);
                return (
                  <Card
                    key={op.id}
                    className={`overflow-hidden border-0 shadow-md ${
                      isUnlocked
                        ? "card-hover-effect opacity-100"
                        : "opacity-50"
                    }`}
                  >
                    <button
                      className="w-full h-full text-left"
                      onClick={() => handleOperationSelect(op.id, op.level)}
                      disabled={!isUnlocked}
                    >
                      <div
                        className={`h-1 w-full bg-gradient-to-r ${op.color}`}
                      />
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br border-2 border-white flex items-center justify-center shadow-md">
                              <span className="text-xl">{op.icon}</span>
                            </div>
                            <div>
                              {" "}
                              <h3 className="font-medium">
                                {op.id === "addition" &&
                                  (state.language === "en"
                                    ? "Addition"
                                    : "Penjumlahan")}
                                {op.id === "subtraction" &&
                                  (state.language === "en"
                                    ? "Subtraction"
                                    : "Pengurangan")}
                                {op.id === "multiplication" &&
                                  (state.language === "en"
                                    ? "Multiplication"
                                    : "Perkalian")}
                                {op.id === "division" &&
                                  (state.language === "en"
                                    ? "Division"
                                    : "Pembagian")}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {t("level")} {op.level}
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
                                {Math.round(getOperationProgress(op.level))}%
                              </span>
                            </div>
                            <Progress
                              value={getOperationProgress(op.level)}
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
        </Card>{" "}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 border-0 shadow-lg">
          <h2 className="font-semibold mb-2">
            {state.language === "en" ? "Learning Tips" : "Tips Belajar"}
          </h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
            <li>
              {state.language === "en"
                ? "Practice each level multiple times"
                : "Latih setiap level beberapa kali"}
            </li>
            <li>
              {state.language === "en"
                ? "Complete all levels to unlock new operations"
                : "Selesaikan semua level untuk membuka operasi baru"}
            </li>
            <li>
              {state.language === "en"
                ? "Earn stars to track your progress"
                : "Dapatkan bintang untuk melacak kemajuanmu"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
