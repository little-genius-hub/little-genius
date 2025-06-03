"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  message: {
    message: string;
  };
}

interface Child {
  id?: string;
  name: string;
  age: number;
  grade: string;
  birthDate?: string;
}

export default function Register() {
  const { state, dispatch } = useApp();
  const { t } = useTranslation(state.language);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    children: [] as Child[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const toggleLanguage = () => {
    dispatch({
      type: "SET_LANGUAGE",
      payload: state.language === "en" ? "id" : "en",
    });
  };
  
  // Check for auth-related URL parameters
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setErrorMessage(error);
    }
  }, [searchParams]);

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
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) throw { status: res.status, message: await res.json() };

      toast({
        title: "Success!",
        description: "Registration successful! Please login.",
      });

      router.push("/login");
    } catch (err: unknown) {
      const error = err as ApiError;
      toast({
        variant: "destructive",
        title: "Error!",
        description: error?.message?.message || "Registration failed",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">      <div className="w-full max-w-md space-y-6">
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
                ? "Join Little Genius and start your learning journey"
                : "Bergabung dengan Little Genius dan mulai perjalanan belajar"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Features Preview - Smaller version for register */}
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 rounded-lg bg-blue-50">
                <Calculator className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-blue-800">
                  {t("numbers")}
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-green-50">
                <BookOpen className="h-4 w-4 text-green-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-green-800">
                  {t("letters")}
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-purple-50">
                <Heart className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-purple-800">
                  {t("fairytales")}
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-orange-50">
                <Mic className="h-4 w-4 text-orange-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-orange-800">
                  {state.language === "en" ? "Speech" : "Suara"}
                </p>
              </div>
            </div>

            {/* Register Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">
                  {state.language === "en" ? "Full Name" : "Nama Lengkap"}
                </Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={
                    state.language === "en"
                      ? "Enter your full name"
                      : "Masukkan nama lengkap Anda"
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">
                  {state.language === "en" ? "Username" : "Nama Pengguna"}
                </Label>
                <Input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder={
                    state.language === "en"
                      ? "Choose a username"
                      : "Pilih nama pengguna"
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  {state.language === "en" ? "Email" : "Email"}
                </Label>
                <Input
                  id="email"
                  type="email"
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
                      ? "Create a password (min 5 characters)"
                      : "Buat kata sandi (min 5 karakter)"
                  }
                  required
                  minLength={5}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isLoading}
              >
                {isLoading
                  ? state.language === "en"
                    ? "Creating account..."
                    : "Membuat akun..."
                  : state.language === "en"
                  ? "Sign Up"
                  : "Daftar"}
              </Button>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>
                    💡 {state.language === "en" ? "Tip" : "Tips"}:
                  </strong>{" "}
                  {state.language === "en"
                    ? "After registration, you can add your children's profiles to personalize their learning experience!"
                    : "Setelah mendaftar, Anda dapat menambahkan profil anak untuk mempersonalisasi pengalaman belajar mereka!"}
                </p>
              </div>
            </form>
            
            {/* Google Sign Up Button */}
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {state.language === "en" ? "Or register with" : "Atau daftar dengan"}
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
                {state.language === "en" ? "Sign up with Google" : "Daftar dengan Google"}
              </span>
            </Button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {state.language === "en"
                  ? "Already have an account?"
                  : "Sudah punya akun?"}{" "}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {state.language === "en" ? "Sign in" : "Masuk"}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
