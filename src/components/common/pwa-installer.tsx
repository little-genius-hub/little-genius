"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X, Star } from "lucide-react";
import { useApp } from "@/store/app-context";
import { useTranslation } from "@/lib/i18n";

export function PWAInstaller() {
  const { state } = useApp();
  const { t } = useTranslation(state.language);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    if (
      state.pwaInstallPrompt &&
      !window.matchMedia("(display-mode: standalone)").matches
    ) {
      setShowInstallPrompt(true);
    }
  }, [state.pwaInstallPrompt]);

  const handleInstall = async () => {
    if (state.pwaInstallPrompt) {
      state.pwaInstallPrompt.prompt();
      const { outcome } = await state.pwaInstallPrompt.userChoice;
      if (outcome === "accepted") {
        setShowInstallPrompt(false);
      }
    }
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 p-2 flex items-center justify-center">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">Little Genius</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {state.language === "en"
                  ? "Install our app for the best experience and offline access!"
                  : "Pasang aplikasi kami untuk pengalaman terbaik dan akses offline!"}
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {t("installApp")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowInstallPrompt(false)}
                  className="text-xs"
                >
                  {state.language === "en" ? "Later" : "Nanti"}
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInstallPrompt(false)}
              className="h-6 w-6 -mt-1 -mr-1 opacity-70 hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
