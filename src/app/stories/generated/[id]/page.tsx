"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Heart,
  ChevronLeft,
  ChevronRight,
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

interface GeneratedStory {
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
  isFavorite?: boolean;
  isRead?: boolean;
}

export default function GeneratedStoryPage() {
  const { state } = useApp();
  const { t } = useTranslation(state.language);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [story, setStory] = useState<GeneratedStory | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const storyId = params.id as string;

  useEffect(() => {
    const loadStory = async () => {
      try {
        setIsLoading(true);

        // Check local storage cache first
        const cachedStoryStr = localStorage.getItem(`story-${storyId}`);
        const cachedTimestamp = localStorage.getItem(
          `story-${storyId}-timestamp`
        );

        if (cachedStoryStr && cachedTimestamp) {
          const now = new Date().getTime();
          const timestamp = parseInt(cachedTimestamp, 10);

          if (now - timestamp < 60 * 60 * 1000) {
            try {
              const cachedStory = JSON.parse(cachedStoryStr);
              cachedStory.createdAt = new Date(cachedStory.createdAt);
              setStory(cachedStory);
              setIsLoading(false);
              return;
            } catch (e) {
              console.error("Error parsing cached story:", e);
            }
          }
        }

        // If no cache or cache expired, try to fetch from API
        const response = await fetch(`/api/stories/${storyId}`);

        if (response.ok) {
          const { story } = await response.json();

          // Cache the story in localStorage
          localStorage.setItem(`story-${storyId}`, JSON.stringify(story));
          localStorage.setItem(
            `story-${storyId}-timestamp`,
            new Date().getTime().toString()
          );

          setStory(story);
        } else {
          // Fallback to sample story for demo
          const sampleStory: GeneratedStory = {
            id: storyId,
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
                  title: "The Journey Begins",
                  content:
                    "Once upon a time, in a small village surrounded by tall mountains, lived a curious little girl named Luna. She had sparkling brown eyes and always wore a bright red backpack filled with treasures she found on her adventures. Every morning, Luna would look out her window at the mysterious forest beyond the village and wonder what secrets it held. Today felt different somehow - the birds were singing a melody she had never heard before, and the morning mist seemed to dance with excitement. Luna's grandmother had told her stories about magical creatures that lived deep in the forest, but she had always thought they were just fairy tales. Little did she know that today, her biggest adventure was about to begin!",
                },
                {
                  pageNumber: 2,
                  title: "Into the Enchanted Woods",
                  content:
                    "With her red backpack secured tightly on her shoulders, Luna stepped into the forest for the first time. The trees seemed to whisper 'Welcome!' as their branches swayed gently in the breeze. Colorful butterflies danced around her head, and somewhere in the distance, she could hear the sound of bubbling water. As she walked deeper into the woods, Luna noticed that the flowers here were unlike any she had seen before - they sparkled like tiny stars and seemed to glow with their own inner light. Suddenly, she heard a small voice crying for help. Following the sound, Luna discovered a tiny fairy trapped under a fallen leaf, her delicate wings shimmering like rainbow drops. 'Please help me!' squeaked the fairy. 'I'm Pip, and I can't lift this heavy leaf by myself!'",
                },
                {
                  pageNumber: 3,
                  title: "The Surprising Discovery",
                  content:
                    "Luna carefully lifted the leaf, and Pip fluttered up to eye level, her wings creating tiny sparkles in the air. 'Thank you so much!' Pip exclaimed, doing a little loop in the air. 'You have a kind heart, Luna.' But wait - how did the fairy know her name? Luna was about to ask when Pip gasped and pointed behind her. 'Oh no! The Shadow Wolves have found us!' Luna spun around expecting to see scary creatures, but instead, she saw three fluffy puppies with dark fur that seemed to absorb light. But here's the twist that made Luna gasp in amazement - these weren't dangerous wolves at all! They were the forest's protectors, and they were wagging their tails happily. The 'Shadow' wolves were actually friendly guardians who used their special ability to hide the forest's magic from those who might misuse it. Luna had passed their test of kindness by helping Pip!",
                },
                {
                  pageNumber: 4,
                  title: "The Magical Celebration",
                  content:
                    "The Shadow Wolf puppies bounded over to Luna, their tails wagging so hard their whole bodies wiggled with joy. The largest puppy, who introduced himself as Storm, explained that they had been watching Luna for months, waiting to see if she was ready to learn about the forest's true magic. Pip clapped her tiny hands together and suddenly, the entire forest came alive with celebration! Flowers bloomed instantly, creating a carpet of colors, while friendly woodland creatures emerged from their hiding places. A wise old owl hooted a welcoming song, rabbits performed a joyful dance, and even the trees seemed to sway in rhythm. Luna learned that the forest was a sanctuary where magical creatures lived in harmony, and because of her kindness, she was now an honorary guardian. From that day forward, Luna visited her new friends every week, always remembering that the greatest magic of all is the kindness we show to others.",
                },
              ],
              id: [
                {
                  pageNumber: 1,
                  title: "Perjalanan Dimulai",
                  content:
                    "Dahulu kala, di sebuah desa kecil yang dikelilingi gunung-gunung tinggi, hiduplah seorang gadis kecil yang penuh rasa ingin tahu bernama Luna. Dia memiliki mata coklat berkilau dan selalu mengenakan tas punggung merah cerah yang penuh dengan harta karun yang dia temukan dalam petualangannya. Setiap pagi, Luna akan melihat keluar jendela ke arah hutan misterius di luar desa dan bertanya-tanya rahasia apa yang tersimpan di dalamnya. Hari ini terasa berbeda entah bagaimana - burung-burung bernyanyi dengan melodi yang tidak pernah dia dengar sebelumnya, dan kabut pagi tampak menari dengan penuh semangat. Nenek Luna pernah menceritakan kisah tentang makhluk ajaib yang tinggal jauh di dalam hutan, tapi dia selalu mengira itu hanya dongeng. Dia tidak tahu bahwa hari ini, petualangan terbesarnya akan segera dimulai!",
                },
                {
                  pageNumber: 2,
                  title: "Masuk ke Hutan Terpesona",
                  content:
                    "Dengan tas punggung merahnya terpasang erat di bahu, Luna melangkah masuk ke hutan untuk pertama kalinya. Pohon-pohon tampak berbisik 'Selamat datang!' saat dahan-dahan mereka bergoyang lembut tertiup angin. Kupu-kupu berwarna-warni menari di sekitar kepalanya, dan di kejauhan, dia bisa mendengar suara air yang bergemericik. Saat berjalan lebih dalam ke dalam hutan, Luna memperhatikan bahwa bunga-bunga di sini tidak seperti yang pernah dia lihat sebelumnya - mereka berkilau seperti bintang-bintang kecil dan tampak bersinar dengan cahaya dari dalam. Tiba-tiba, dia mendengar suara kecil yang meminta tolong. Mengikuti suara itu, Luna menemukan peri kecil yang terjebak di bawah daun yang jatuh, sayap halusnya berkilau seperti tetes pelangi. 'Tolong aku!' pinta peri itu. 'Aku Pip, dan aku tidak bisa mengangkat daun berat ini sendiri!'",
                },
                {
                  pageNumber: 3,
                  title: "Penemuan Mengejutkan",
                  content:
                    "Luna dengan hati-hati mengangkat daun itu, dan Pip terbang hingga sejajar dengan matanya, sayapnya menciptakan percikan kecil di udara. 'Terima kasih banyak!' seru Pip, sambil melakukan putaran kecil di udara. 'Kamu memiliki hati yang baik, Luna.' Tapi tunggu - bagaimana peri itu tahu namanya? Luna hendak bertanya ketika Pip terengah dan menunjuk ke belakangnya. 'Oh tidak! Serigala Bayangan telah menemukan kita!' Luna berbalik mengharapkan melihat makhluk menakutkan, tapi malah dia melihat tiga anak anjing berbulu dengan bulu gelap yang tampak menyerap cahaya. Tapi inilah twist yang membuat Luna terengah kagum - ini bukan serigala berbahaya sama sekali! Mereka adalah pelindung hutan, dan mereka sedang mengibaskan ekor dengan gembira. Serigala 'Bayangan' itu sebenarnya adalah penjaga ramah yang menggunakan kemampuan khusus mereka untuk menyembunyikan keajaiban hutan dari mereka yang mungkin menyalahgunakannya. Luna telah lulus ujian kebaikan mereka dengan menolong Pip!",
                },
                {
                  pageNumber: 4,
                  title: "Perayaan Ajaib",
                  content:
                    "Anak-anak anjing Serigala Bayangan berlari menghampiri Luna, ekor mereka bergoyang begitu kencang hingga seluruh tubuh mereka bergetar kegembiraan. Anak anjing terbesar, yang memperkenalkan diri sebagai Storm, menjelaskan bahwa mereka telah mengawasi Luna selama berbulan-bulan, menunggu untuk melihat apakah dia siap untuk belajar tentang keajaiban hutan yang sesungguhnya. Pip bertepuk tangan dengan tangan kecilnya dan tiba-tiba, seluruh hutan hidup dengan perayaan! Bunga-bunga mekar seketika, menciptakan karpet warna-warni, sementara makhluk hutan yang ramah muncul dari tempat persembunyian mereka. Seekor burung hantu tua yang bijak menghoot lagu selamat datang, kelinci-kelinci menampilkan tarian yang penuh sukacita, dan bahkan pohon-pohon tampak bergoyang mengikuti irama. Luna belajar bahwa hutan itu adalah tempat suci di mana makhluk ajaib hidup dalam harmoni, dan karena kebaikannya, dia sekarang menjadi penjaga kehormatan. Sejak hari itu, Luna mengunjungi teman-teman barunya setiap minggu, selalu ingat bahwa keajaiban terbesar dari semuanya adalah kebaikan yang kita tunjukkan kepada orang lain.",
                },
              ],
            },
            readingTime: 8,
            ageGroup: [3, 4, 5, 6, 7, 8],
            category: "adventure",
            createdAt: new Date(),
          };
          // Cache the sample story too
          localStorage.setItem(`story-${storyId}`, JSON.stringify(sampleStory));
          localStorage.setItem(
            `story-${storyId}-timestamp`,
            new Date().getTime().toString()
          );

          setStory(sampleStory);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading story:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description:
            state.language === "en"
              ? "Failed to load story"
              : "Gagal memuat cerita",
        });
        setIsLoading(false);
      }
    };

    if (storyId) {
      loadStory();
    }
  }, [storyId, state.language]); // Removed toast from dependencies to avoid unnecessary refetching

  // Update isFavorite state when the story loads
  useEffect(() => {
    if (story && typeof story.isFavorite !== "undefined") {
      setIsFavorite(story.isFavorite);
    }
  }, [story]);

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  // Add a function to mark a story as read
  const markStoryAsRead = () => {
    // Only proceed if we have a story and it's not already marked as read
    if (story && !story.isRead) {
      // Update local story object
      const updatedStory = {
        ...story,
        isRead: true,
      };
      setStory(updatedStory);

      // Update in localStorage
      if (storyId) {
        localStorage.setItem(`story-${storyId}`, JSON.stringify(updatedStory));
        // Also update timestamp to prevent cache expiration
        localStorage.setItem(
          `story-${storyId}-timestamp`,
          new Date().getTime().toString()
        );
      }

      // Optionally update on server
      try {
        fetch(`/api/stories/${storyId}/read`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }).catch((e) =>
          console.error("Network error updating read status:", e)
        );
      } catch (error) {
        console.error("Error marking story as read:", error);
      }
    }
  };

  const handleNextPage = () => {
    if (story && currentPage < story.pages[state.language].length - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);

      // If this is the last page, mark the story as read
      if (nextPage === story.pages[state.language].length - 1) {
        markStoryAsRead();
      }
    }
  };
  const toggleFavorite = () => {
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);

    // Also update the story in localStorage and our state
    if (story && storyId) {
      // Update local story object
      const updatedStory = {
        ...story,
        isFavorite: newFavoriteStatus,
      };
      setStory(updatedStory);

      // Update in localStorage
      try {
        localStorage.setItem(`story-${storyId}`, JSON.stringify(updatedStory));
      } catch (e) {
        console.error("Error updating cached story favorites:", e);
      }
    }

    toast({
      title: isFavorite
        ? state.language === "en"
          ? "Removed from favorites"
          : "Dihapus dari favorit"
        : state.language === "en"
        ? "Added to favorites"
        : "Ditambahkan ke favorit",
    });
  };

  if (!state.isLoading && !state.currentChild) {
    router.push("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-radial from-indigo-400 via-purple-500 to-pink-500 animate-gradient-slow flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4" />
          <p className="text-white text-lg font-nunito">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-radial from-indigo-400 via-purple-500 to-pink-500 animate-gradient-slow flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg font-nunito">
            {state.language === "en"
              ? "Story not found"
              : "Cerita tidak ditemukan"}
          </p>
          <Button
            onClick={() => router.push("/stories")}
            className="mt-4 bg-white/20 hover:bg-white/30 text-white border border-white/30"
          >
            {t("back")}
          </Button>
        </div>
      </div>
    );
  }

  const currentStoryPage = story.pages[state.language][currentPage];
  const totalPages = story.pages[state.language].length;

  return (
    <div className="min-h-screen bg-gradient-radial from-indigo-400 via-purple-500 to-pink-500 animate-gradient-slow">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/stories")}
                className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("back")}
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white text-glow-white">
                  {story.title[state.language]}
                </h1>
                <p className="text-white/90 text-sm font-nunito">
                  {state.language === "en"
                    ? "AI Generated Story"
                    : "Cerita Dibuat AI"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500 text-white">
                {state.language === "en" ? "AI Generated" : "Dibuat AI"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFavorite}
                className="text-white hover:bg-white/20 transition-all duration-300"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isFavorite ? "fill-current text-red-300" : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="max-w-4xl mx-auto p-4">
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 font-nunito">
              {currentStoryPage.title}
            </h2>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <span className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1" />
                {state.language === "en" ? "Page" : "Halaman"} {currentPage + 1}{" "}
                {state.language === "en" ? "of" : "dari"} {totalPages}
              </span>
              <span>
                {story.readingTime}{" "}
                {state.language === "en" ? "min read" : "menit baca"}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {/* Story Text */}
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed font-nunito text-lg whitespace-pre-line">
                {currentStoryPage.content}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("previousPage")}
              </Button>

              {/* Page Indicators */}
              <div className="flex gap-2">
                {story.pages[state.language].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentPage
                        ? "bg-purple-500 scale-125"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className="flex items-center gap-2"
              >
                {t("nextPage")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Story Complete */}
            {currentPage === totalPages - 1 && (
              <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl text-center">
                <h3 className="text-xl font-bold text-emerald-700 mb-2 font-nunito">
                  {state.language === "en"
                    ? "Story Complete!"
                    : "Cerita Selesai!"}
                </h3>
                <p className="text-emerald-600 mb-4 font-nunito">
                  {state.language === "en"
                    ? "Great job reading this magical adventure!"
                    : "Bagus sekali membaca petualangan ajaib ini!"}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => setCurrentPage(0)}
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    {state.language === "en" ? "Read Again" : "Baca Lagi"}
                  </Button>
                  <Button
                    onClick={() => router.push("/stories")}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {state.language === "en"
                      ? "More Stories"
                      : "Cerita Lainnya"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
