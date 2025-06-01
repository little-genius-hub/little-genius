"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  BookOpen,
  Heart,
  User,
  LogOut,
  Star,
  Trophy,
  Globe,
  BarChart3,
} from "lucide-react";
import { useApp } from "@/store/app-context";
import { useTranslation } from "@/lib/i18n";
import { useRouter } from "next/navigation";

export function MainMenu() {
  const { state, dispatch, logout } = useApp();
  const { t } = useTranslation(state.language);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const toggleLanguage = () => {
    dispatch({
      type: "SET_LANGUAGE",
      payload: state.language === "en" ? "id" : "en",
    });
  };

  const switchChild = () => {
    dispatch({ type: "SET_CURRENT_CHILD", payload: null });
  };

  const openParentDashboard = () => {
    dispatch({ type: "SET_PARENT_MODE", payload: true });
    router.push("/parent-dashboard");
  };
  const currentProgress = state.currentChild?.progress || {
    numbers: { level: 1, subLevel: 1, totalScore: 0, completedLevels: [] },
    letters: { level: 1, subLevel: 1, totalScore: 0, completedLevels: [] },
    stories: { readStories: [], favoriteStories: [] },
  };

  const gameMenuItems = [
    {
      id: "numbers",
      title: t("numbers"),
      description:
        state.language === "en"
          ? "Learn math with fun games"
          : "Belajar matematika dengan permainan seru",
      icon: Calculator,
      color: "from-blue-400 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      route: "/games/numbers",
      progress: (currentProgress.numbers || { level: 1 }).level,
    },
    {
      id: "letters",
      title: t("letters"),
      description:
        state.language === "en"
          ? "Practice words and pronunciation"
          : "Latihan kata dan pelafalan",
      icon: BookOpen,
      color: "from-green-400 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      route: "/games/letters",
      progress: (currentProgress.letters || { level: 1 }).level,
    },
    {
      id: "stories",
      title: t("fairytales"),
      description:
        state.language === "en"
          ? "Listen to magical stories"
          : "Dengarkan cerita-cerita ajaib",
      icon: Heart,
      color: "from-purple-400 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      route: "/stories",
      progress: (currentProgress.stories || { readStories: [] }).readStories
        .length,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4 overflow-y-auto">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-white">
              {state.currentChild?.avatar ? (
                <AvatarImage
                  src={state.currentChild.avatar}
                  alt={state.currentChild.name}
                />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {state.currentChild?.name?.[0] || "?"}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-white">
                {t("hello")} {state.currentChild?.name}!
              </h2>{" "}
              <div className="flex items-center gap-1.5">
                {" "}
                <Badge className="bg-yellow-400/80 hover:bg-yellow-500 text-yellow-950">
                  <Trophy className="h-3 w-3 mr-1" />
                  {t("level")}{" "}
                  {Math.max(
                    (currentProgress.numbers || { level: 1 }).level,
                    (currentProgress.letters || { level: 1 }).level
                  )}
                </Badge>
                <Badge className="bg-white/20 hover:bg-white/30 text-white">
                  {state.language === "en" ? "Age" : "Usia"}:{" "}
                  {state.currentChild?.age || "?"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleLanguage}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <Globe className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={switchChild}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Categories */}
        <div className="grid grid-cols-2 gap-3">
          {gameMenuItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden border-0 shadow-lg card-hover-effect"
            >
              <button
                className="w-full h-full text-left"
                onClick={() => router.push(item.route)}
              >
                <div
                  className={`h-1.5 w-full bg-gradient-to-r ${item.color}`}
                />
                <CardContent className={`p-4 ${item.bgColor}`}>
                  <div className="mb-3 flex justify-between items-start">
                    <div
                      className={`p-2 rounded-lg ${item.bgColor} ${item.textColor}`}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    <Badge className="bg-yellow-400/90 text-yellow-950">
                      {t("level")} {item.progress}
                    </Badge>
                  </div>
                  <h3 className={`font-semibold ${item.textColor}`}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {item.description}
                  </p>
                </CardContent>
              </button>
            </Card>
          ))}
        </div>

        {/* Stories */}
        <Card className="border-0 shadow-lg overflow-hidden card-hover-effect">
          <div className="h-1.5 w-full bg-gradient-to-r from-purple-400 to-purple-600" />
          <CardContent className="p-4 bg-purple-50">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                  <Heart className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-purple-700">
                  {t("stories")}
                </h3>
              </div>
              <Badge className="bg-yellow-400/90 text-yellow-950">
                {state.language === "en" ? "NEW" : "BARU"}
              </Badge>
            </div>
            <p className="text-xs text-gray-600">
              {state.language === "en"
                ? "Interactive storybooks with voice narration"
                : "Buku cerita interaktif dengan narasi suara"}
            </p>
            <Button
              onClick={() => router.push("/stories")}
              className="mt-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {state.language === "en" ? "Open Stories" : "Buka Cerita"}
            </Button>
          </CardContent>
        </Card>

        {/* Parent Controls */}
        <div className="flex justify-between mt-6 pt-4 border-t border-white/20">
          <Button
            variant="outline"
            onClick={openParentDashboard}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {state.language === "en" ? "Parent Dashboard" : "Dasbor Orangtua"}
          </Button>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {state.language === "en" ? "Sign Out" : "Keluar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
