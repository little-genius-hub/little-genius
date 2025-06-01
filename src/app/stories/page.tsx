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
      <div className="min-h-screen bg-gradient-radial from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4" />
          <p className="text-white text-lg font-nunito">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-radial from-indigo-400 via-purple-500 to-pink-500 animate-gradient-slow">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("home")}
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white text-glow-white font-nunito">
                  {state.language === "en"
                    ? "Story Library"
                    : "Perpustakaan Cerita"}
                </h1>
                <p className="text-white/90 text-lg font-nunito">
                  {state.language === "en"
                    ? `Welcome back, ${state.currentChild.name}!`
                    : `Selamat datang kembali, ${state.currentChild.name}!`}
                </p>
              </div>
            </div>
            <Button
              onClick={generateNewStory}
              disabled={isGenerating}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  {state.language === "en" ? "Creating..." : "Membuat..."}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {state.language === "en"
                    ? "Generate New Story"
                    : "Buat Cerita Baru"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4" />
              <p className="text-white text-lg font-nunito">{t("loading")}</p>
            </div>
          </div>
        ) : stories.length === 0 ? (
          <Card className="bg-white/95 backdrop-blur-md border-0 shadow-xl rounded-xl p-8 text-center">
            <div className="max-w-md mx-auto">
              <BookMarked className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2 font-nunito">
                {state.language === "en"
                  ? "No Stories Yet"
                  : "Belum Ada Cerita"}
              </h3>
              <p className="text-gray-600 mb-6 font-nunito">
                {state.language === "en"
                  ? "Start your magical journey by generating your first AI-powered story!"
                  : "Mulai perjalanan ajaib Anda dengan membuat cerita pertama yang dibuat AI!"}
              </p>
              <Button
                onClick={generateNewStory}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                {state.language === "en"
                  ? "Create Your First Story"
                  : "Buat Cerita Pertama"}
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Card
                key={story.id}
                className="bg-white/95 backdrop-blur-md border-0 shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group"
                onClick={() => handleStoryClick(story)}
              >
                <CardHeader className="p-0">
                  <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <div className="text-6xl">
                      {getCategoryIcon(story.category)}
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
                      {story.isGenerated && (
                        <Badge className="bg-emerald-500 text-white">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      )}
                      {story.isFavorite && (
                        <div className="bg-red-500 rounded-full p-1">
                          <Heart className="h-3 w-3 text-white fill-current" />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <Badge
                        className={`${getCategoryColor(
                          story.category
                        )} text-white`}
                      >
                        {story.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <CardTitle className="text-lg font-bold text-gray-800 mb-2 font-nunito line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {story.title[state.language]}
                  </CardTitle>

                  <p className="text-gray-600 text-sm mb-4 font-nunito line-clamp-3">
                    {story.description[state.language]}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {story.readingTime}{" "}
                      {state.language === "en" ? "min" : "menit"}
                    </span>
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {story.ageGroup[0]}-
                      {story.ageGroup[story.ageGroup.length - 1]}{" "}
                      {state.language === "en" ? "years" : "tahun"}
                    </span>
                    <span className="flex items-center">
                      <BookOpen className="h-3 w-3 mr-1" />
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
                      <div className="flex items-center text-emerald-600">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        <span className="text-xs font-nunito">
                          {state.language === "en" ? "Completed" : "Selesai"}
                        </span>
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
            className="mt-6 bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-dashed border-yellow-300 shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group"
            onClick={generateNewStory}
          >
            <CardContent className="p-8 text-center">
              <div className="max-w-sm mx-auto">
                <Plus className="h-12 w-12 text-yellow-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-yellow-800 mb-2 font-nunito">
                  {state.language === "en"
                    ? "Create Another Story"
                    : "Buat Cerita Lain"}
                </h3>
                <p className="text-yellow-700 font-nunito">
                  {state.language === "en"
                    ? "Let AI create a new magical adventure just for you!"
                    : "Biarkan AI membuat petualangan ajaib baru khusus untuk Anda!"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
