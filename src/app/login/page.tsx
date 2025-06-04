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
import {
  BookOpen,
  Calculator,
  Mic,
  Globe,
  Star,
  Heart,
  AlertCircle,
} from "lucide-react";
import { useApp } from "@/store/app-context";
import { useTranslation } from "@/lib/i18n";

interface ApiError {
  status: number;
  message: string | { message: string };
}

// SearchParamsHandler component to handle search parameters
function SearchParamsHandler({
  setErrorMessage,
}: {
  setErrorMessage: (error: string | null) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
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
  };
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-pink-200 rounded-full opacity-40 blur-2xl animate-bounce-slow z-0" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-200 rounded-full opacity-40 blur-2xl animate-bounce-slow2 z-0" />
      <div className="absolute top-10 right-10 w-16 h-16 bg-yellow-200 rounded-full opacity-30 blur-xl animate-spin-slow z-0" />
      {/* New Twinkling Elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-twinkle z-0" style={{ animationDelay: '0s' }} />
      <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-pink-300 rounded-full animate-twinkle z-0" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-cyan-300 rounded-full animate-twinkle z-0" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-orange-200 rounded-full animate-twinkle opacity-70 z-0" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-1/2 right-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-twinkle opacity-70 z-0" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/5 left-1/5 w-2 h-2 bg-purple-300 rounded-full animate-twinkle z-0" style={{ animationDelay: '0.2s' }} />
      <div className="absolute bottom-1/4 right-2/5 w-3 h-3 bg-teal-300 rounded-full animate-twinkle z-0" style={{ animationDelay: '0.7s' }} />
      <div className="absolute top-2/3 left-3/4 w-2 h-2 bg-green-300 rounded-full animate-twinkle z-0" style={{ animationDelay: '1.2s' }} />
      <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-orange-200 rounded-full animate-twinkle opacity-70 z-0" style={{ animationDelay: '1.8s' }} />
      <div className="absolute bottom-2/5 right-1/2 w-3 h-3 bg-pink-300 rounded-full animate-twinkle opacity-70 z-0" style={{ animationDelay: '2.2s' }} />
      {/* Wrap the component using useSearchParams in a Suspense boundary */}
      <Suspense fallback={null}>
        <SearchParamsHandler setErrorMessage={setErrorMessage} />
      </Suspense>
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Language Toggle */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="bg-white/30 border-white/50 text-purple-700 hover:bg-white/50 rounded-full shadow-md font-bold"
          >
            <Globe className="h-4 w-4 mr-2" />
            {state.language === "en" ? "English" : "Bahasa Indonesia"}
          </Button>
        </div>
        {/* Error Alert */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        {/* Main Card */}
        <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-2xl overflow-hidden rounded-3xl relative animate-fadeInScaleUp">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-pink-400 via-yellow-400 to-cyan-400 animate-gradient-x" />
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mb-4 shadow-xl animate-float relative">
              <Star className="h-12 w-12 text-white drop-shadow-lg animate-spin-slow" />
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-pink-300 rounded-full opacity-70 animate-bounce" />
            </div>
            <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent font-[Comic Sans MS,cursive] tracking-wide animate-pulse">
              Little Genius
            </CardTitle>
            <CardDescription className="text-base text-purple-600 font-semibold">
              {state.language === "en"
                ? "Educational games and stories for kids"
                : "Permainan edukatif dan cerita untuk anak-anak"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-purple-700">
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
                  className="rounded-full px-4 py-3 bg-yellow-50 border-yellow-300 focus:ring-2 focus:ring-yellow-500 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-bold text-purple-700">
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
                  className="rounded-full px-4 py-3 bg-yellow-50 border-yellow-300 focus:ring-2 focus:ring-yellow-500 text-base"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-green-500 hover:from-cyan-600 hover:via-teal-600 hover:to-green-600 text-white font-bold rounded-full py-3 text-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
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
                <span className="px-2 bg-white text-gray-500 font-bold">
                  {state.language === "en"
                    ? "Or continue with"
                    : "Atau lanjutkan dengan"}
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => (window.location.href = "/api/auth/google")}
              className="w-full mt-4 py-3 px-4 border-2 border-orange-400 flex justify-center items-center gap-2 rounded-full bg-white hover:bg-orange-50 shadow-md text-orange-700 font-bold text-base"
            >
              <svg
                width="20"
                height="20"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>
                {state.language === "en"
                  ? "Sign in with Google"
                  : "Masuk dengan Google"}
              </span>
            </Button>
            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600 font-bold">
                {state.language === "en"
                  ? "Don't have an account?"
                  : "Belum punya akun?"}{" "}
                <Link
                  href="/register"
                  className="font-bold text-orange-600 hover:text-pink-600 underline underline-offset-2"
                >
                  {state.language === "en" ? "Create Account" : "Buat Akun"}
                </Link>
              </p>
            </div>
            <p className="text-center text-xs text-purple-600 mt-6 font-semibold">
              {state.language === "en"
                ? "Sign in to save your child's progress and access all features."
                : "Masuk untuk menyimpan kemajuan anak dan mengakses semua fitur."}
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite;
        }
        .animate-bounce-slow2 {
          animation: bounce-slow 5s infinite 1s;
        }
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 4s ease-in-out infinite;
        }

        @keyframes fadeInScaleUp {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeInScaleUp {
          animation: fadeInScaleUp 0.7s ease-out forwards;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.7); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
