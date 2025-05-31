"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Calculator, Mic, Globe, Star, Heart } from "lucide-react";
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
    children: [] as Child[], // Array kosong untuk data anak yang akan diisi nanti
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const toggleLanguage = () => {
    dispatch({ type: "SET_LANGUAGE", payload: state.language === "en" ? "id" : "en" })
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

      // Redirect to login page
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
                <p className="text-xs font-medium text-blue-800">{t("numbers")}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-green-50">
                <BookOpen className="h-4 w-4 text-green-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-green-800">{t("letters")}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-purple-50">
                <Heart className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-purple-800">{t("fairytales")}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-orange-50">
                <Mic className="h-4 w-4 text-orange-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-orange-800">{state.language === "en" ? "Speech" : "Suara"}</p>
              </div>
            </div>

            {/* Register Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">{state.language === "en" ? "Full Name" : "Nama Lengkap"}</Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={state.language === "en" ? "Enter your full name" : "Masukkan nama lengkap Anda"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">{state.language === "en" ? "Username" : "Nama Pengguna"}</Label>
                <Input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder={state.language === "en" ? "Choose a username" : "Pilih nama pengguna"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{state.language === "en" ? "Email" : "Email"}</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={state.language === "en" ? "Enter your email" : "Masukkan email Anda"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{state.language === "en" ? "Password" : "Kata Sandi"}</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={state.language === "en" ? "Create a password (min 5 characters)" : "Buat kata sandi (min 5 karakter)"}
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
                  ? (state.language === "en" ? "Creating account..." : "Membuat akun...")
                  : (state.language === "en" ? "Sign Up" : "Daftar")
                }
              </Button>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>💡 {state.language === "en" ? "Tip" : "Tips"}:</strong>{" "}
                  {state.language === "en"
                    ? "After registration, you can add your children's profiles to personalize their learning experience!"
                    : "Setelah mendaftar, Anda dapat menambahkan profil anak untuk mempersonalisasi pengalaman belajar mereka!"
                  }
                </p>
              </div>
            </form>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {state.language === "en" ? "Already have an account?" : "Sudah punya akun?"}{" "}
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
