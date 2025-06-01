"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calculator, Mic, Globe, Star, Heart } from "lucide-react";
import { useApp } from "@/store/app-context";
import { useTranslation } from "@/lib/i18n";

export function WelcomeScreen() {
  const { state, dispatch } = useApp();
  const { t } = useTranslation(state.language);

  const toggleLanguage = () => {
    dispatch({
      type: "SET_LANGUAGE",
      payload: state.language === "en" ? "id" : "en",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Language Toggle */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <Globe className="h-4 w-4 mr-2" />
            {state.language === "en" ? "English" : "Bahasa Indonesia"}
          </Button>
        </div>

        {/* Main Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-xl animate-float">
              <Star className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Little Genius
            </CardTitle>
            <p className="text-gray-600 text-sm">
              {state.language === "en"
                ? "Educational games and stories for kids"
                : "Permainan edukatif dan cerita untuk anak-anak"}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all">
                <Calculator className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-blue-800">
                  {t("numbers")}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-all">
                <BookOpen className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-green-800">
                  {t("letters")}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-all">
                <Heart className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-purple-800">
                  {t("fairytales")}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-all">
                <Mic className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-orange-800">
                  {state.language === "en" ? "Speech" : "Suara"}
                </p>
              </div>
            </div>
            {/* Features List */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 border-blue-200"
                >
                  {state.language === "en" ? "Bilingual" : "Dwibahasa"}
                </Badge>
                <p className="text-xs text-gray-600">
                  {state.language === "en"
                    ? "English and Indonesian language support"
                    : "Mendukung bahasa Inggris dan Indonesia"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 border-green-200"
                >
                  {state.language === "en" ? "Voice" : "Suara"}
                </Badge>
                <p className="text-xs text-gray-600">
                  {state.language === "en"
                    ? "Speech recognition and text-to-speech"
                    : "Pengenalan suara dan teks-ke-suara"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-purple-100 text-purple-800 border-purple-200"
                >
                  {state.language === "en" ? "Progress" : "Kemajuan"}
                </Badge>
                <p className="text-xs text-gray-600">
                  {state.language === "en"
                    ? "Track learning progress for each child"
                    : "Lacak kemajuan belajar untuk setiap anak"}
                </p>
              </div>
            </div>{" "}
            {/* Auth Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => (window.location.href = "/login")}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <span>{state.language === "en" ? "Sign In" : "Masuk"}</span>
              </Button>

              <Button
                onClick={() => (window.location.href = "/register")}
                variant="outline"
                className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <span>
                  {state.language === "en" ? "Create Account" : "Buat Akun"}
                </span>
              </Button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-6">
              {state.language === "en"
                ? "Sign in to save your child's progress and access all features."
                : "Masuk untuk menyimpan kemajuan anak dan mengakses semua fitur."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
