"use client";

import { useState, FormEvent, ChangeEvent, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Calculator, Mic, Globe, Star, Heart, AlertCircle } from "lucide-react";
import { useApp } from "@/store/app-context";
import { useTranslation } from "@/lib/i18n";

interface ApiError {
  status: number;
  message: string | { message: string };
}

// SearchParamsHandler component to handle search parameters
function SearchParamsHandler({ setErrorMessage }: { setErrorMessage: (error: string | null) => void }) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setErrorMessage(error);
    }
  }, [searchParams, setErrorMessage]);
  
  return null;
}

export default function Login() {
  const { state, dispatch } = useApp();
  const { t } = useTranslation(state.language);
  const [formData, setFormData] = useState({
    email: "admin@mail.com",
    password: "rahasia",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const toggleLanguage = () => {
    dispatch({
      type: "SET_LANGUAGE",
      payload: state.language === "en" ? "id" : "en",
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) throw await res.json();
      toast({
        title: "Success!",
        description: "Login successful!",
      });

      window.location.href = "/";
    } catch (err) {
      const error = err as ApiError;
      let errorMessage = "Login failed";

      if (typeof error?.message === "string") {
        errorMessage = error.message;
      } else if (
        error?.message &&
        typeof error.message === "object" &&
        "message" in error.message
      ) {
        errorMessage = error.message.message;
      }

      toast({
        variant: "destructive",
        title: "Error!",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      {/* Wrap the component using useSearchParams in a Suspense boundary */}
      <Suspense fallback={null}>
        <SearchParamsHandler setErrorMessage={setErrorMessage} />
      </Suspense>
        
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
        
        {/* Error Alert */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

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
            <CardDescription>
              {state.language === "en"
                ? "Educational games and stories for kids"
                : "Permainan edukatif dan cerita untuk anak-anak"}
            </CardDescription>
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
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">
                  {state.language === "en" ? "Email" : "Email"}
                </Label>
                <Input
                  id="email"
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={
                    state.language === "en"
                      ? "Enter your email"
                      : "Masukkan email Anda"
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  {state.language === "en" ? "Password" : "Kata Sandi"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={
                    state.language === "en"
                      ? "Enter your password"
                      : "Masukkan kata sandi Anda"
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isLoading}
              >
                {isLoading
                  ? state.language === "en"
                    ? "Signing in..."
                    : "Masuk..."
                  : state.language === "en"
                  ? "Sign In"
                  : "Masuk"}
              </Button>
            </form>
            
            {/* Google Sign In Button */}
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {state.language === "en" ? "Or continue with" : "Atau lanjutkan dengan"}
                </span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.href = "/api/auth/google"}
              className="w-full mt-4 py-2 px-4 border flex justify-center items-center gap-2"
            >
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>
                {state.language === "en" ? "Sign in with Google" : "Masuk dengan Google"}
              </span>
            </Button>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {state.language === "en"
                  ? "Don't have an account?"
                  : "Belum punya akun?"}{" "}
                <Link
                  href="/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {state.language === "en" ? "Create Account" : "Buat Akun"}
                </Link>
              </p>
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
