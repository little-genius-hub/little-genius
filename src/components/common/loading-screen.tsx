"use client";

import { Star, Heart, BookOpen, Calculator } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          {/* Main Logo */}
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg animate-pulse">
            <Star className="h-12 w-12 text-yellow-500" />
          </div>

          {/* Floating Icons */}
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
            <Calculator className="h-4 w-4 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce delay-100">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center animate-bounce delay-200">
            <Heart className="h-4 w-4 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 animate-float">
          Little Genius
        </h1>
        <p className="text-white/80 mb-6">Loading your learning adventure...</p>

        {/* Loading Spinner */}
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
