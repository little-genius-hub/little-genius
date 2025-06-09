"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Plus,
  Heart,
  Clock,
  Users,
  Sparkles,
  ArrowLeft,
  BookMarked,
  Star,
} from "lucide-react";
import { useApp } from "@/store/app-context";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

// Custom animations styles
const customStyles = `
<style>
@keyframes shine {
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes spin-slow {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-shine {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  background-size: 200% 100%;
  animation: shine 6s infinite linear;
}

.animate-pulse-glow {
  animation: pulse-glow 2s infinite ease-in-out;
}

.animate-float {
  animation: float 3s infinite ease-in-out;
}

.animate-heartbeat {
  animation: heartbeat 1.5s infinite ease-in-out;
}

.animate-spin-slow {
  animation: spin-slow 8s infinite linear;
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out forwards;
}

.animate-gradient-slow {
  background-size: 200% 200%;
  animation: gradient 8s ease infinite;
}

.text-glow-white {
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
}
</style>
`;

interface StoryPage {
  pageNumber: number;
  title: string;
  content: string;
  illustration?: string;
}

interface Story {
  id: string;
  title: {
    en: string;
    id: string;
  };
  description: {
    en: string;
    id: string;
  };
  pages: {
    en: StoryPage[];
    id: StoryPage[];
  };
  thumbnail?: string;
  readingTime: number;
  ageGroup: number[];
  category: string;
  createdAt: Date;
  isGenerated?: boolean;
  isFavorite?: boolean;
  isRead?: boolean;
}

export default function StoriesPage() {
  const { state } = useApp();
  const { t } = useTranslation(state.language);
  const router = useRouter();
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!state.isLoading && !state.currentChild) {
      router.push("/");
    }
  }, [state.currentChild, router, state.isLoading]);

  useEffect(() => {
    const loadStories = async () => {
      try {
        setIsLoading(true);

        const response = await fetch("/api/stories/user");

        if (response.ok) {
          const { stories } = await response.json();
          setStories(stories);
        } else {
          const sampleStories: Story[] = [
            {
              id: "sample-1",
              title: {
                en: "The Magical Forest Adventure",
                id: "Petualangan Hutan Ajaib",
              },
              description: {
                en: "A young explorer discovers magical creatures in an enchanted forest",
                id: "Seorang penjelajah muda menemukan makhluk ajaib di hutan yang terpesona",
              },
              thumbnail: "https://image.pollinations.ai/prompt/Colorful%20storybook%20cover%20featuring%20young%20explorer%20in%20magical%20forest%20with%20background%20woods%2C%20colorful%2C%20children%27s%20book%20style?nologo=true",
              pages: {
                en: [
                  {
                    pageNumber: 1,
                    title: "Beginning",
                    content: "Sample content...",
                  },
                ],
                id: [
                  {
                    pageNumber: 1,
                    title: "Permulaan",
                    content: "Contoh konten...",
                  },
                ],
              },
              readingTime: 8,
              ageGroup: [3, 4, 5, 6, 7, 8],
              category: "adventure",
              createdAt: new Date(),
              isGenerated: true,
              isFavorite: false,
              isRead: false,
            },
            {
              id: "sample-2",
              title: {
                en: "The Space Explorer",
                id: "Penjelajah Luar Angkasa",
              },
              description: {
                en: "A brave astronaut discovers new planets and makes alien friends",
                id: "Seorang astronot pemberani menemukan planet baru dan berteman dengan alien",
              },
              thumbnail: "https://image.pollinations.ai/prompt/Colorful%20storybook%20cover%20featuring%20astronaut%20in%20space%20with%20planets%20and%20alien%20friends%20with%20background%20woods%2C%20colorful%2C%20children%27s%20book%20style?nologo=true",
              pages: {
                en: [
                  {
                    pageNumber: 1,
                    title: "Launch",
                    content: "Sample content...",
                  },
                ],
                id: [
                  {
                    pageNumber: 1,
                    title: "Peluncuran",
                    content: "Contoh konten...",
                  },
                ],
              },
              readingTime: 6,
              ageGroup: [4, 5, 6, 7, 8, 9],
              category: "science",
              createdAt: new Date(),
              isGenerated: true,
              isFavorite: true,
              isRead: true,
            },
          ];
          setStories(sampleStories);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading stories:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description:
            state.language === "en"
              ? "Failed to load stories"
              : "Gagal memuat cerita",
        });
        setIsLoading(false);
      }
    };

    loadStories();
  }, [state.language]);

  const generateNewStory = async () => {
    try {
      setIsGenerating(true);

      const response = await fetch("/api/stories/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: state.language,
        }),
      });

      if (response.ok) {
        const { story } = await response.json();
        setStories((prev) => [story, ...prev]);

        toast({
          title:
            state.language === "en" ? "Story Generated!" : "Cerita Dibuat!",
          description:
            state.language === "en"
              ? "Your new magical story is ready to read"
              : "Cerita ajaib baru Anda siap untuk dibaca",
        });

        router.push(`/stories/generated/${story.id}`);
      } else {
        throw new Error("Failed to generate story");
      }
    } catch (error) {
      console.error("Error generating story:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          state.language === "en"
            ? "Failed to generate story. Please try again."
            : "Gagal membuat cerita. Silakan coba lagi.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStoryClick = (story: Story) => {
    router.push(`/stories/generated/${story.id}`);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      adventure: "bg-emerald-500",
      science: "bg-blue-500",
      fantasy: "bg-purple-500",
      friendship: "bg-pink-500",
      family: "bg-orange-500",
      nature: "bg-green-500",
      default: "bg-gray-500",
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "adventure":
        return "🏕️";
      case "science":
        return "🚀";
      case "fantasy":
        return "✨";
      case "friendship":
        return "👫";
      case "family":
        return "👨‍👩‍👧‍👦";
      case "nature":
        return "🌳";
      default:
        return "📚";
    }
  };

  if (!state.currentChild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-500 to-blue-500 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4" />
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-white/30 mx-auto"></div>
          </div>
          <p className="text-white text-lg font-nunito">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-600 via-violet-500 to-blue-500 animate-gradient-slow">
        {/* Shiny gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-violet-400/20 to-blue-500/30 animate-shine pointer-events-none"></div>
        
        {/* Floating Stickers Animation */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div
            className="absolute top-10 left-10 text-4xl animate-bounce"
            style={{ animationDelay: "0s", animationDuration: "3s" }}
          >
            ⭐
          </div>
          <div
            className="absolute top-20 right-20 text-3xl animate-bounce"
            style={{ animationDelay: "1s", animationDuration: "4s" }}
          >
            📚
          </div>
          <div
            className="absolute top-40 left-1/4 text-2xl animate-bounce"
            style={{ animationDelay: "2s", animationDuration: "3.5s" }}
          >
            🌟
          </div>
          <div
            className="absolute top-60 right-1/3 text-3xl animate-bounce"
            style={{ animationDelay: "0.5s", animationDuration: "4.5s" }}
          >
            🎨
          </div>
          <div
            className="absolute bottom-40 left-20 text-4xl animate-bounce"
            style={{ animationDelay: "1.5s", animationDuration: "3s" }}
          >
            🦄
          </div>
          <div
            className="absolute bottom-60 right-10 text-2xl animate-bounce"
            style={{ animationDelay: "2.5s", animationDuration: "4s" }}
          >
            🌈
          </div>
          <div
            className="absolute top-1/3 left-10 text-3xl animate-bounce"
            style={{ animationDelay: "3s", animationDuration: "3.5s" }}
          >
            🎭
          </div>
          <div
            className="absolute bottom-1/3 right-1/4 text-2xl animate-bounce"
            style={{ animationDelay: "0.8s", animationDuration: "4.2s" }}
          >
            🎪
          </div>
        </div>

        {/* Header */}
        <div className="bg-blue-600/10 backdrop-blur-md border-b border-white/20 shadow-lg relative z-10">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/")}
                  className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:rotate-1 transform group"
                >
                  <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                  {t("home")}
                </Button>
                <div className="animate-fade-in-up">
                  <h1 className="text-3xl font-bold text-white text-glow-white font-nunito flex items-center gap-2">
                    <span className="animate-pulse">📖</span>
                    {state.language === "en"
                      ? "Story Library"
                      : "Perpustakaan Cerita"}
                    <span className="animate-pulse">✨</span>
                  </h1>
                  <p className="text-white/90 text-lg font-nunito animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                    <span className="mr-2">👋</span>
                    {state.language === "en"
                      ? `Welcome back, ${state.currentChild.name}!`
                      : `Selamat datang kembali, ${state.currentChild.name}!`}
                  </p>
                </div>
              </div>
              <Button
                onClick={generateNewStory}
                disabled={isGenerating}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    {state.language === "en" ? "Creating..." : "Membuat..."}
                    <span className="ml-2">🎨</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                    {state.language === "en"
                      ? "Generate New Story"
                      : "Buat Cerita Baru"}
                    <span className="ml-2">🪄</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto p-6 relative z-10">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center animate-fade-in">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4" />
                  <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-white/30 mx-auto"></div>
                </div>
                <p className="text-white text-lg font-nunito flex items-center justify-center gap-2">
                  <span className="animate-bounce">📚</span>
                  {t("loading")}
                  <span className="animate-bounce" style={{ animationDelay: "0.5s" }}>
                    ✨
                  </span>
                </p>
              </div>
            </div>
          ) : stories.length === 0 ? (
            <Card className="bg-white/95 backdrop-blur-md border-0 shadow-xl rounded-xl p-8 text-center animate-fade-in-up hover:shadow-2xl transition-all duration-500">
              <div className="max-w-md mx-auto">
                <div className="relative mb-4">
                  <BookMarked className="h-16 w-16 text-gray-400 mx-auto animate-float" />
                  <div className="absolute -top-2 -right-2 text-2xl animate-bounce">📖</div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 font-nunito">
                  {state.language === "en" ? "No Stories Yet" : "Belum Ada Cerita"}
                  <span className="ml-2">😊</span>
                </h3>
                <p className="text-gray-600 mb-6 font-nunito">
                  <span className="mr-2">🌟</span>
                  {state.language === "en"
                    ? "Start your magical journey by generating your first AI-powered story!"
                    : "Mulai perjalanan ajaib Anda dengan membuat cerita pertama yang dibuat AI!"}
                  <span className="ml-2">🚀</span>
                </p>
                <Button
                  onClick={generateNewStory}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-pulse-glow"
                >
                  <Plus className="h-4 w-4 mr-2 animate-pulse" />
                  {state.language === "en"
                    ? "Create Your First Story"
                    : "Buat Cerita Pertama"}
                  <span className="ml-2">✨</span>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story, index) => (
                <Card
                  key={story.id}
                  className="bg-white/95 backdrop-blur-md border-0 shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group animate-fade-in-up hover:rotate-1 transform"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleStoryClick(story)}
                >
                  <CardHeader className="p-0 relative">
                    <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center overflow-hidden">
                      {story.thumbnail ? (
                        <div className="w-full h-full overflow-hidden">
                          <img
                            src={story.thumbnail}
                            alt={story.title[state.language]}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                      ) : (
                        <div className="text-6xl animate-float group-hover:scale-110 transition-transform duration-300">
                          {getCategoryIcon(story.category)}
                        </div>
                      )}

                      {/* Decorative corner stickers */}
                      <div className="absolute top-2 left-2 text-lg animate-bounce" style={{ animationDelay: "0s" }}>
                        🎨
                      </div>
                      <div className="absolute bottom-2 right-2 text-lg animate-bounce" style={{ animationDelay: "1s" }}>
                        ⭐
                      </div>

                      <div className="absolute top-3 right-3 flex gap-2">
                        {story.isGenerated && (
                          <Badge className="bg-emerald-500 text-white animate-pulse-glow">
                            <Sparkles className="h-3 w-3 mr-1 animate-spin-slow" />
                            AI
                          </Badge>
                        )}
                        {story.isFavorite && (
                          <div className="bg-red-500 rounded-full p-1 animate-pulse">
                            <Heart className="h-3 w-3 text-white fill-current animate-heartbeat" />
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <Badge
                          className={`${getCategoryColor(
                            story.category
                          )} text-white animate-fade-in hover:scale-110 transition-transform`}
                        >
                          {story.category}
                        </Badge>
                      </div>

                      {/* Hover overlay with sparkles */}
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="text-white text-4xl animate-bounce">✨</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 relative">
                    {/* Decorative corner sticker */}
                    <div className="absolute top-2 right-2 text-sm animate-bounce" style={{ animationDelay: "2s" }}>
                      🌟
                    </div>

                    <CardTitle className="text-lg font-bold text-gray-800 mb-2 font-nunito line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
                      {story.title[state.language]}
                    </CardTitle>

                    <p className="text-gray-600 text-sm mb-4 font-nunito line-clamp-3">
                      {story.description[state.language]}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span className="flex items-center hover:text-purple-600 transition-colors">
                        <Clock className="h-3 w-3 mr-1 animate-pulse" />
                        {story.readingTime}{" "}
                        {state.language === "en" ? "min" : "menit"}
                      </span>
                      <span className="flex items-center hover:text-purple-600 transition-colors">
                        <Users className="h-3 w-3 mr-1 animate-pulse" style={{ animationDelay: "0.5s" }} />
                        {story.ageGroup[0]}-
                        {story.ageGroup[story.ageGroup.length - 1]}{" "}
                        {state.language === "en" ? "years" : "tahun"}
                      </span>
                      <span className="flex items-center hover:text-purple-600 transition-colors">
                        <BookOpen className="h-3 w-3 mr-1 animate-pulse" style={{ animationDelay: "1s" }} />
                        {story.pages[state.language].length}{" "}
                        {state.language === "en" ? "pages" : "halaman"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {new Date(story.createdAt).toLocaleDateString(
                          state.language === "en" ? "en-US" : "id-ID"
                        )}
                      </span>
                      {story.isRead && (
                        <div className="flex items-center text-emerald-600 animate-fade-in">
                          <Star className="h-3 w-3 mr-1 fill-current animate-pulse" />
                          <span className="text-xs font-nunito">
                            {state.language === "en" ? "Completed" : "Selesai"}
                          </span>
                          <span className="ml-1">🎉</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Generate New Story Card */}
          {stories.length > 0 && (
            <Card
              className="mt-6 bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-dashed border-yellow-300 shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group animate-fade-in-up relative"
              onClick={generateNewStory}
            >
              {/* Decorative stickers */}
              <div className="absolute top-3 left-3 text-2xl animate-bounce">🎨</div>
              <div className="absolute top-3 right-3 text-2xl animate-bounce" style={{ animationDelay: "1s" }}>
                ✨
              </div>
              <div className="absolute bottom-3 left-3 text-2xl animate-bounce" style={{ animationDelay: "2s" }}>
                🌟
              </div>
              <div className="absolute bottom-3 right-3 text-2xl animate-bounce" style={{ animationDelay: "0.5s" }}>
                🪄
              </div>

              <CardContent className="p-8 text-center relative z-10">
                <div className="max-w-sm mx-auto">
                  <div className="relative">
                    <Plus className="h-12 w-12 text-yellow-600 mx-auto mb-4 group-hover:scale-110 transition-transform animate-float" />
                    <div className="absolute -top-2 -right-2 text-2xl animate-bounce">🎪</div>
                  </div>
                  <h3 className="text-xl font-bold text-yellow-800 mb-2 font-nunito flex items-center justify-center gap-2">
                    <span className="animate-bounce">🎭</span>
                    {state.language === "en"
                      ? "Create Another Story"
                      : "Buat Cerita Lain"}
                    <span className="animate-bounce" style={{ animationDelay: "0.5s" }}>
                      🎨
                    </span>
                  </h3>
                  <p className="text-yellow-700 font-nunito">
                    <span className="mr-2">🌈</span>
                    {state.language === "en"
                      ? "Let AI create a new magical adventure just for you!"
                      : "Biarkan AI membuat petualangan ajaib baru khusus untuk Anda!"}
                    <span className="ml-2">🚀</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}