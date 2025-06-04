"use client";

import { useState, FormEvent, ChangeEvent, useEffect, Suspense } from "react";
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
import {
  BookOpen,
  Calculator,
  Mic,
  Globe,
  Star,
  Heart,
  AlertCircle,
  Stars,
  Sparkles,
  Cloud,
  Sun,
  Moon,
  Zap,
  Rainbow,
} from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "@/store/app-context";
import { useTranslation } from "@/lib/i18n";

type StickerProps = {
  icon: React.ReactNode
  color: string
  top: number
  left: number
  delay?: number
  rotate?: number
}

const Sticker = ({ icon, color, top, left, delay = 0, rotate = 0 }: StickerProps) => {
  return (
    <motion.div
      className={`absolute z-10 text-${color} opacity-70`}
      style={{ top: `${top}%`, left: `${left}%` }}
      initial={{ scale: 0, rotate: 0 }}
      animate={{
        scale: [0.8, 1.2, 1],
        rotate: [0, rotate],
        y: [0, -15, 0],
      }}
      transition={{
        delay: delay,
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      }}
    >
      {icon}
    </motion.div>
  )
}

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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 relative overflow-hidden">
      {/* Enhanced hologram overlay effects with purple to blue gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-300/30 to-blue-300/40 animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-radial from-purple-400/20 via-transparent to-blue-400/30"></div>
      
      {/* Shimmer overlay for extra shine */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent animate-pulse opacity-60"></div>
      
      {/* Animated hologram lines with purple to blue colors */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent animate-pulse shadow-lg shadow-purple-400/40"></div>
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent animate-pulse delay-1000 shadow-lg shadow-blue-400/40"></div>
        <div className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent animate-pulse delay-2000 shadow-lg shadow-indigo-400/40"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent animate-pulse delay-3000 shadow-lg shadow-purple-400/40"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent animate-pulse delay-4000 shadow-lg shadow-blue-400/40"></div>
      </div>

      {/* Floating stickers with updated colors */}
      <Sticker icon={<Stars className="h-10 w-10" />} color="purple-300" top={15} left={5} rotate={15} />
      <Sticker icon={<Cloud className="h-16 w-16" />} color="blue-200" top={8} left={80} delay={0.5} rotate={-10} />
      <Sticker icon={<Sparkles className="h-8 w-8" />} color="indigo-300" top={70} left={10} delay={1} rotate={20} />
      <Sticker icon={<Sun className="h-12 w-12" />} color="purple-300" top={75} left={85} delay={1.5} rotate={-15} />
      <Sticker icon={<Moon className="h-10 w-10" />} color="blue-300" top={40} left={92} delay={2} rotate={25} />
      <Sticker icon={<Zap className="h-8 w-8" />} color="indigo-300" top={25} left={25} delay={2.5} rotate={-20} />
      <Sticker icon={<Rainbow className="h-12 w-12" />} color="purple-300" top={60} left={5} delay={3} rotate={10} />
      
      {/* Wrap the component using useSearchParams in a Suspense boundary */}
      <Suspense fallback={null}>
        <SearchParamsHandler setErrorMessage={setErrorMessage} />
      </Suspense>
      
      <motion.div 
        className="w-full max-w-md space-y-6 relative z-10 mx-auto px-4 py-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Language Toggle */}
        <motion.div 
          className="flex justify-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="bg-white/20 border-white/40 text-white hover:bg-white/30 rounded-full shadow-lg font-bold backdrop-blur-md transition-all duration-300 hover:shadow-xl"
            >
              <Globe className="h-4 w-4 mr-2" />
              {state.language === "en" ? "English" : "Bahasa Indonesia"}
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Error Alert */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive" className="bg-red-50/90 backdrop-blur-md border border-red-200 shadow-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          </motion.div>
        )}
        
        {/* Main Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7, type: "spring", stiffness: 100 }}
        >
          <Card className="bg-white/85 backdrop-blur-md border-0 shadow-2xl shadow-purple-400/20 overflow-hidden rounded-3xl relative animate-pulse-glow">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-pink-400 via-yellow-400 to-cyan-400 animate-gradient-x" />
            
            <CardHeader className="text-center pb-4">
              <motion.div 
                className="mx-auto w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mb-4 shadow-xl relative"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Star className="h-12 w-12 text-white drop-shadow-lg" />
                </motion.div>
                <motion.span 
                  className="absolute -top-2 -right-2 w-6 h-6 bg-pink-300 rounded-full opacity-70"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent font-[Comic Sans MS,cursive] tracking-wide">
                  Little Genius
                </CardTitle>
                <CardDescription className="text-base text-purple-600 font-semibold mt-2">
                  {state.language === "en"
                    ? "Educational games and stories for kids"
                    : "Permainan edukatif dan cerita untuk anak-anak"}
                </CardDescription>
              </motion.div>
            </CardHeader>            
            
            <CardContent className="space-y-6 p-6">
              <motion.form 
                className="space-y-4" 
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <motion.div 
                  className="space-y-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.4 }}
                >
                  <Label htmlFor="name" className="font-bold text-purple-700">
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
                    className="rounded-full px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-base transition-all duration-300 shadow-inner"
                  />
                </motion.div>
                
                <motion.div 
                  className="space-y-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.0, duration: 0.4 }}
                >
                  <Label htmlFor="username" className="font-bold text-purple-700">
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
                    className="rounded-full px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-base transition-all duration-300 shadow-inner"
                  />
                </motion.div>
                
                <motion.div 
                  className="space-y-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.4 }}
                >
                  <Label htmlFor="email" className="font-bold text-purple-700">
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
                    className="rounded-full px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-base transition-all duration-300 shadow-inner"
                  />
                </motion.div>
                
                <motion.div 
                  className="space-y-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                >
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
                        ? "Create a password (min 5 characters)"
                        : "Buat kata sandi (min 5 karakter)"
                    }
                    required
                    minLength={5}
                    className="rounded-full px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-base transition-all duration-300 shadow-inner"
                  />
                </motion.div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.3, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-bold rounded-full py-3 text-lg shadow-xl shadow-purple-300/50 transition-all duration-300 transform hover:shadow-2xl hover:shadow-purple-400/60"
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
                </motion.div>
              
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                  className="mt-4 p-3 bg-blue-50/80 backdrop-blur-sm rounded-lg border border-blue-200/70 text-sm text-blue-700 shadow-sm"
                >
                  <p>
                    <strong>
                      💡 {state.language === "en" ? "Tip" : "Tips"}:
                    </strong>{" "}
                    {state.language === "en"
                      ? "After registration, you can add your children's profiles to personalize their learning experience!"
                      : "Setelah mendaftar, Anda dapat menambahkan profil anak untuk mempersonalisasi pengalaman belajar mereka!"}
                  </p>
                </motion.div>
              </motion.form>
              
              {/* Google Sign Up Button */}
              <motion.div 
                className="relative mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-purple-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/70 backdrop-blur-sm text-purple-600 font-bold rounded-md">
                    {state.language === "en"
                      ? "or register with"
                      : "atau daftar dengan"}
                  </span>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.4 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => (window.location.href = "/api/auth/google")}
                  className="w-full mt-4 py-3 px-4 border-2 border-orange-300 flex justify-center items-center gap-2 rounded-full bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 shadow-lg hover:shadow-xl shadow-orange-200/50 text-orange-700 font-bold text-base transition-all duration-300"
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
                      ? "Sign up with Google"
                      : "Daftar dengan Google"}
                  </span>
                </Button>
              </motion.div>
              
              {/* Login Link */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.7, duration: 0.5 }}
              >
                <p className="text-sm text-purple-700 font-bold">
                  {state.language === "en"
                    ? "Already have an account?"
                    : "Sudah punya akun?"}{" "}
                  <motion.span whileHover={{ scale: 1.05 }}>
                    <Link
                      href="/login"
                      className="font-bold text-orange-600 hover:text-pink-600 underline underline-offset-2 transition-colors duration-300"
                    >
                      {state.language === "en" ? "Sign in" : "Masuk"}
                    </Link>
                  </motion.span>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      
      {/* Custom Animations */}
      <style jsx global>{`
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

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(147, 51, 234, 0.3), 0 0 40px rgba(147, 51, 234, 0.1);
          }
          50% {
            box-shadow: 0 0 30px rgba(147, 51, 234, 0.5), 0 0 60px rgba(147, 51, 234, 0.2);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .bg-gradient-radial {
          background: radial-gradient(ellipse at center, var(--tw-gradient-stops));
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        .animate-wiggle {
          animation: wiggle 2s ease-in-out infinite;
        }

        .font-playful {
          font-family: 'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive;
        }

        /* Enhanced holographic effect */
        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}
