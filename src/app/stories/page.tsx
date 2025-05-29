"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Play, Heart, Star } from "lucide-react"
import { useApp } from "@/store/app-context"
import { useTranslation } from "@/lib/i18n"

const SAMPLE_STORIES = [
  {
    id: "little-red-riding-hood",
    title: { en: "Little Red Riding Hood", id: "Si Tudung Merah" },
    description: {
      en: "A classic tale about a girl and a wolf",
      id: "Kisah klasik tentang seorang gadis dan serigala",
    },
    readingTime: 5,
    ageGroup: [4, 5, 6, 7],
    category: "fairy-tale",
    illustration: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "three-little-pigs",
    title: { en: "Three Little Pigs", id: "Tiga Babi Kecil" },
    description: {
      en: "Three pigs build houses to protect from the wolf",
      id: "Tiga babi membangun rumah untuk melindungi dari serigala",
    },
    readingTime: 6,
    ageGroup: [3, 4, 5, 6],
    category: "fairy-tale",
    illustration: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "goldilocks",
    title: { en: "Goldilocks and the Three Bears", id: "Goldilocks dan Tiga Beruang" },
    description: {
      en: "A curious girl visits the bears' house",
      id: "Seorang gadis penasaran mengunjungi rumah beruang",
    },
    readingTime: 7,
    ageGroup: [4, 5, 6, 7, 8],
    category: "fairy-tale",
    illustration: "/placeholder.svg?height=200&width=300",
  },
]

export default function StoriesPage() {
  const { state } = useApp()
  const { t } = useTranslation(state.language)
  const router = useRouter()

  const readStories = state.currentChild?.progress.stories.readStories || []
  const favoriteStories = state.currentChild?.progress.stories.favoriteStories || []

  const handleStorySelect = (storyId: string) => {
    router.push(`/stories/${storyId}`)
  }

  const toggleFavorite = (storyId: string) => {
    // This would update the favorites in the database
    console.log("Toggle favorite:", storyId)
  }

  if (!state.currentChild) {
    router.push("/")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-radial from-indigo-400 via-purple-500 to-pink-500 animate-gradient-slow">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push("/")} 
              className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white text-glow-white">{t("fairytales")}</h1>
              <p className="text-white/90 text-sm font-nunito">
                {state.language === "en" ? "Listen to magical stories" : "Dengarkan cerita-cerita ajaib"}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-white">
                <BookOpen className="h-5 w-5 text-yellow-300 animate-pulse-gentle" />
                <span className="font-bold">{readStories.length}</span>
              </div>
              <p className="text-xs text-white/80 font-nunito">{state.language === "en" ? "Read" : "Dibaca"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Stats Card */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-xl rounded-xl overflow-hidden hover:shadow-blue-200/20 hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg hover:bg-indigo-50 transition-colors duration-300">
                <div className="text-2xl font-bold text-indigo-600">{readStories.length}</div>
                <p className="text-sm text-gray-600 font-nunito">{state.language === "en" ? "Stories Read" : "Cerita Dibaca"}</p>
              </div>
              <div className="p-3 rounded-lg hover:bg-pink-50 transition-colors duration-300">
                <div className="text-2xl font-bold text-pink-600">{favoriteStories.length}</div>
                <p className="text-sm text-gray-600 font-nunito">{state.language === "en" ? "Favorites" : "Favorit"}</p>
              </div>
              <div className="p-3 rounded-lg hover:bg-purple-50 transition-colors duration-300">
                <div className="text-2xl font-bold text-purple-600">{SAMPLE_STORIES.length}</div>
                <p className="text-sm text-gray-600 font-nunito">{state.language === "en" ? "Available" : "Tersedia"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stories Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_STORIES.map((story) => {
            const isRead = readStories.includes(story.id)
            const isFavorite = favoriteStories.includes(story.id)

            return (
              <Card
                key={story.id}
                className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white/95 backdrop-blur-md border-0 rounded-xl overflow-hidden hover:shadow-purple-200/30"
                onClick={() => handleStorySelect(story.id)}
              >
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden">
                    <img
                      src={story.illustration || "/placeholder.svg"}
                      alt={story.title[state.language]}
                      className="w-full h-48 object-cover transition-transform duration-700 hover:scale-110"
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/5 to-transparent opacity-60"></div>
                    <div className="absolute top-2 right-2 flex gap-2">
                      {isRead && (
                        <Badge className="bg-green-500 text-white shadow-lg shadow-green-500/20">{state.language === "en" ? "Read" : "Dibaca"}</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(story.id)
                        }}
                        className="h-8 w-8 p-0 bg-white/80 hover:bg-white shadow-lg hover:shadow-pink-200/30 transition-all duration-300"
                      >
                        <Heart className={`h-4 w-4 ${isFavorite ? "text-red-500 fill-current animate-bounce-gentle" : "text-gray-600"}`} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 mb-1 font-nunito">{story.title[state.language]}</h3>
                    <p className="text-sm text-gray-600 font-nunito">{story.description[state.language]}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 font-nunito">
                    <span className="flex items-center">
                      <BookOpen className="h-3 w-3 mr-1 text-indigo-400" />
                      {story.readingTime} {state.language === "en" ? "min read" : "menit baca"}
                    </span>
                    <span className="bg-indigo-50 px-2 py-1 rounded-full">
                      {state.language === "en" ? "Ages" : "Umur"} {story.ageGroup[0]}-
                      {story.ageGroup[story.ageGroup.length - 1]}
                    </span>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300 text-white" 
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {state.language === "en" ? "Read Story" : "Baca Cerita"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Coming Soon */}
        <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-0 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:shadow-purple-200/30">
          <div className="absolute inset-0 bg-gradient-conic from-indigo-200 via-purple-200 to-pink-200 opacity-20 animate-spin-slow"></div>
          <CardContent className="relative p-8 text-center">
            <Star className="h-12 w-12 text-purple-500 mx-auto mb-4 animate-pulse-slow" />
            <h3 className="font-bold text-purple-800 mb-2 text-xl font-nunito">
              {state.language === "en" ? "More Stories Coming Soon!" : "Lebih Banyak Cerita Segera Hadir!"}
            </h3>
            <p className="text-purple-600 text-sm font-nunito">
              {state.language === "en"
                ? "We're adding new magical stories every week. Stay tuned!"
                : "Kami menambahkan cerita ajaib baru setiap minggu. Nantikan!"}
            </p>
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-pink-200 rounded-full opacity-30 blur-xl"></div>
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-indigo-200 rounded-full opacity-30 blur-xl"></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
