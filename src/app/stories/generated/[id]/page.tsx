"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Image from "next/image"
import {
  ArrowLeft,
  BookOpen,
  Heart,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Pause,
  Stars,
  Sparkles,
  Cloud,
  Sun,
  Moon,
  Zap,
  Rainbow,
  ImageIcon,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "@/store/app-context"
import { useTranslation } from "@/lib/i18n"
import { useToast } from "@/hooks/use-toast"
import { speechService } from "@/lib/speech"

// Sticker component for floating decorative elements
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

interface StoryPage {
  pageNumber: number
  title: string
  content: string
  illustration?: string
}

interface GeneratedStory {
  id: string
  title: {
    en: string
    id: string
  }
  description: {
    en: string
    id: string
  }
  pages: {
    en: StoryPage[]
    id: StoryPage[]
  }
  readingTime: number
  ageGroup: number[]
  category: string
  createdAt: Date
  isFavorite?: boolean
  isRead?: boolean
}

export default function StoryPage() {
  const { state } = useApp()
  const { t } = useTranslation(state.language)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const storyId = params.id as string

  const [story, setStory] = useState<GeneratedStory | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [isNarrating, setIsNarrating] = useState(false)
  const [isSpeechSupported, setIsSpeechSupported] = useState(true)
  const [activeSegment, setActiveSegment] = useState<number | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const confettiRef = useRef(null)

  // Image generation functions
  const generateImagePrompt = (title: string, content: string, index: number = 0): string => {
    const extractRelevantTerms = (text: string, idx: number = 0, titleText: string = ""): string[] => {
      const settings = [
        "forest", "castle", "mountain", "sea", "ocean", "village", "garden", "house", "cave", "school",
      ]
      const characters = [
        "girl", "boy", "child", "children", "princess", "prince", "animal", "dragon", "fairy", "wizard",
      ]
      const emotions = [
        "happy", "sad", "excited", "scared", "magical", "mysterious", "amazing", "wonderful",
      ]
      const scenes = ["beginning", "action", "climax", "resolution", "ending"]

      const textLower = text.toLowerCase()
      const foundTerms: string[] = []

      ;[...settings, ...characters, ...emotions].forEach((term) => {
        if (textLower.includes(term) && !foundTerms.includes(term)) {
          foundTerms.push(term)
        }
      })

      if (idx < scenes.length) {
        foundTerms.push(scenes[idx])
      }

      titleText
        .toLowerCase()
        .split(" ")
        .forEach((word) => {
          if (word.length > 3 && !foundTerms.includes(word)) {
            foundTerms.push(word)
          }
        })

      return foundTerms
    }

    const keyTerms = extractRelevantTerms(content, index, title)
    const styleModifiers = [
      "colorful, detailed illustration, children's book style, magical, whimsical, fantasy art",
      "vibrant, cartoon style, storybook illustration, cheerful, animated scene",
      "watercolor painting style, dreamy, soft colors, illustrated storybook, fantasy scene",
      "digital art, detailed scenery, character focused, dynamic lighting, illustrated for kids",
      "hand-drawn style, cute characters, bright colors, fairytale scene, child-friendly"
    ]

    const promptBase = `${title}, ${keyTerms.join(", ")}, ${styleModifiers[index % styleModifiers.length]}`
    const cleanedPrompt = promptBase
      .replace(/[^\w\s,]/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 200)

    return encodeURIComponent(cleanedPrompt)
  }

  const getStoryImageUrl = (title: string, content: string, index: number = 0): string => {
    const prompt = generateImagePrompt(title, content, index)
    return `https://image.pollinations.ai/prompt/${prompt}%20with%20background%20woods?nologo=true`
  }
  
  const getStoryImageUrls = (title: string, content: string, count: number = 5): string[] => {
    const urls: string[] = []
    for (let i = 0; i < count; i++) {
      urls.push(getStoryImageUrl(title, content, i))
    }
    return urls
  }

  const generateImageCaption = (title: string): string => {
    return state.language === "en"
      ? `Illustration: ${title}`
      : `Ilustrasi: ${title}`
  }

  const preloadNextPageImage = () => {
    if (story && currentPage < story.pages[state.language].length - 1) {
      const nextPage = story.pages[state.language][currentPage + 1]
      const urls = getStoryImageUrls(nextPage.title, nextPage.content, 5)

      if (typeof window !== "undefined") {
        urls.forEach(url => {
          const img = document.createElement("img")
          img.src = url
        })
      }
    }
  }
  
  const handleImageLoad = (index: number) => {
    setImagesLoaded(prev => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })
  }

  // Load story data
  useEffect(() => {
    const loadStory = async () => {
      try {
        setIsLoading(true)

        const cachedStoryStr = localStorage.getItem(`story-${storyId}`)
        const cachedTimestamp = localStorage.getItem(`story-${storyId}-timestamp`)

        if (cachedStoryStr && cachedTimestamp) {
          const now = new Date().getTime()
          const timestamp = parseInt(cachedTimestamp, 10)

          if (now - timestamp < 60 * 60 * 1000) {
            try {
              const cachedStory = JSON.parse(cachedStoryStr)
              cachedStory.createdAt = new Date(cachedStory.createdAt)
              setStory(cachedStory)
              setIsLoading(false)
              return
            } catch (e) {
              console.error("Error parsing cached story:", e)
            }
          }
        }

        const response = await fetch(`/api/stories/${storyId}`)

        if (response.ok) {
          const { story } = await response.json()
          localStorage.setItem(`story-${storyId}`, JSON.stringify(story))
          localStorage.setItem(`story-${storyId}-timestamp`, new Date().getTime().toString())
          setStory(story)
        } else {
          // Mock story data
          const mockStory: GeneratedStory = {
            id: String(storyId),
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
                  content: "Once upon a time, in a small village surrounded by tall mountains, lived a curious little girl named Luna. She had sparkling brown eyes and always wore a bright red backpack filled with treasures she found on her adventures. Every morning, Luna would look out her window at the mysterious forest beyond the village and wonder what secrets it held. Today felt different somehow - the birds were singing a melody she had never heard before, and the morning mist seemed to dance with excitement. Luna's grandmother had told her stories about magical creatures that lived deep in the forest, but she had always thought they were just fairy tales. Little did she know that today, her biggest adventure was about to begin!",
                },
                {
                  pageNumber: 2,
                  title: "Into the Enchanted Woods",
                  content: "With her red backpack secured tightly on her shoulders, Luna stepped into the forest for the first time. The trees seemed to whisper 'Welcome!' as their branches swayed gently in the breeze. Colorful butterflies danced around her head, and somewhere in the distance, she could hear the sound of bubbling water. As she walked deeper into the woods, Luna noticed that the flowers here were unlike any she had seen before - they sparkled like tiny stars and seemed to glow with their own inner light. Suddenly, she heard a small voice crying for help. Following the sound, Luna discovered a tiny fairy trapped under a fallen leaf, her delicate wings shimmering like rainbow drops. 'Please help me!' squeaked the fairy. 'I'm Pip, and I can't lift this heavy leaf by myself!'",
                },
                {
                  pageNumber: 3,
                  title: "The Surprising Discovery",
                  content: "Luna carefully lifted the leaf, and Pip fluttered up to eye level, her wings creating tiny sparkles in the air. 'Thank you so much!' Pip exclaimed, doing a little loop in the air. 'You have a kind heart, Luna.' But wait - how did the fairy know her name? Luna was about to ask when Pip gasped and pointed behind her. 'Oh no! The Shadow Wolves have found us!' Luna spun around expecting to see scary creatures, but instead, she saw three fluffy puppies with dark fur that seemed to absorb light. But here's the twist that made Luna gasp in amazement - these weren't dangerous wolves at all! They were the forest's protectors, and they were wagging their tails happily. The 'Shadow' wolves were actually friendly guardians who used their special ability to hide the forest's magic from those who might misuse it. Luna had passed their test of kindness by helping Pip!",
                },
                {
                  pageNumber: 4,
                  title: "The Magical Celebration",
                  content: "The Shadow Wolf puppies bounded over to Luna, their tails wagging so hard their whole bodies wiggled with joy. The largest puppy, who introduced himself as Storm, explained that they had been watching Luna for months, waiting to see if she was ready to learn about the forest's true magic. Pip clapped her tiny hands together and suddenly, the entire forest came alive with celebration! Flowers bloomed instantly, creating a carpet of colors, while friendly woodland creatures emerged from their hiding places. A wise old owl hooted a welcoming song, rabbits performed a joyful dance, and even the trees seemed to sway in rhythm. Luna learned that the forest was a sanctuary where magical creatures lived in harmony, and because of her kindness, she was now an honorary guardian. From that day forward, Luna visited her new friends every week, always remembering that the greatest magic of all is the kindness we show to others.",
                },
              ],
              id: [
                {
                  pageNumber: 1,
                  title: "Perjalanan Dimulai",
                  content: "Dahulu kala, di sebuah desa kecil yang dikelilingi gunung-gunung tinggi, hiduplah seorang gadis kecil yang penuh rasa ingin tahu bernama Luna. Dia memiliki mata coklat berkilau dan selalu mengenakan tas punggung merah cerah yang penuh dengan harta karun yang dia temukan dalam petualangannya. Setiap pagi, Luna akan melihat keluar jendela ke arah hutan misterius di luar desa dan bertanya-tanya rahasia apa yang tersimpan di dalamnya. Hari ini terasa berbeda entah bagaimana - burung-burung bernyanyi dengan melodi yang tidak pernah dia dengar sebelumnya, dan kabut pagi tampak menari dengan penuh semangat. Nenek Luna pernah menceritakan kisah tentang makhluk ajaib yang tinggal jauh di dalam hutan, tapi dia selalu mengira itu hanya dongeng. Dia tidak tahu bahwa hari ini, petualangan terbesarnya akan segera dimulai!",
                },
                {
                  pageNumber: 2,
                  title: "Masuk ke Hutan Terpesona",
                  content: "Dengan tas punggung merahnya terpasang erat di bahu, Luna melangkah masuk ke hutan untuk pertama kalinya. Pohon-pohon tampak berbisik 'Selamat datang!' saat dahan-dahan mereka bergoyang lembut tertiup angin. Kupu-kupu berwarna-warni menari di sekitar kepalanya, dan di kejauhan, dia bisa mendengar suara air yang bergemericik. Saat berjalan lebih dalam ke dalam hutan, Luna memperhatikan bahwa bunga-bunga di sini tidak seperti yang pernah dia lihat sebelumnya - mereka berkilau seperti bintang-bintang kecil dan tampak bersinar dengan cahaya dari dalam. Tiba-tiba, dia mendengar suara kecil yang meminta tolong. Mengikuti suara itu, Luna menemukan peri kecil yang terjebak di bawah daun yang jatuh, sayap halusnya berkilau seperti tetes pelangi. 'Tolong aku!' pinta peri itu. 'Aku Pip, dan aku tidak bisa mengangkat daun berat ini sendiri!'",
                },
                {
                  pageNumber: 3,
                  title: "Penemuan Mengejutkan",
                  content: "Luna dengan hati-hati mengangkat daun itu, dan Pip terbang hingga sejajar dengan matanya, sayapnya menciptakan percikan kecil di udara. 'Terima kasih banyak!' seru Pip, sambil melakukan putaran kecil di udara. 'Kamu memiliki hati yang baik, Luna.' Tapi tunggu - bagaimana peri itu tahu namanya? Luna hendak bertanya ketika Pip terengah dan menunjuk ke belakangnya. 'Oh tidak! Serigala Bayangan telah menemukan kita!' Luna berbalik mengharapkan melihat makhluk menakutkan, tapi malah dia melihat tiga anak anjing berbulu dengan bulu gelap yang tampak menyerap cahaya. Tapi inilah twist yang membuat Luna terengah kagum - ini bukan serigala berbahaya sama sekali! Mereka adalah pelindung hutan, dan mereka sedang mengibaskan ekor dengan gembira. Serigala 'Bayangan' itu sebenarnya adalah penjaga ramah yang menggunakan kemampuan khusus mereka untuk menyembunyikan keajaiban hutan dari mereka yang mungkin menyalahgunakannya. Luna telah lulus ujian kebaikan mereka dengan menolong Pip!",
                },
                {
                  pageNumber: 4,
                  title: "Perayaan Ajaib",
                  content: "Anak-anak anjing Serigala Bayangan berlari menghampiri Luna, ekor mereka bergoyang begitu kencang hingga seluruh tubuh mereka bergetar kegembiraan. Anak anjing terbesar, yang memperkenalkan diri sebagai Storm, menjelaskan bahwa mereka telah mengawasi Luna selama berbulan-bulan, menunggu untuk melihat apakah dia siap untuk belajar tentang keajaiban hutan yang sesungguhnya. Pip bertepuk tangan dengan tangan kecilnya dan tiba-tiba, seluruh hutan hidup dengan perayaan! Bunga-bunga mekar seketika, menciptakan karpet warna-warni, sementara makhluk hutan yang ramah muncul dari tempat persembunyian mereka. Seekor burung hantu tua yang bijak menghoot lagu selamat datang, kelinci-kelinci menampilkan tarian yang penuh sukacita, dan bahkan pohon-pohon tampak bergoyang mengikuti irama. Luna belajar bahwa hutan itu adalah tempat suci di mana makhluk ajaib hidup dalam harmoni, dan karena kebaikannya, dia sekarang menjadi penjaga kehormatan. Sejak hari itu, Luna mengunjungi teman-teman barunya setiap minggu, selalu ingat bahwa keajaiban terbesar dari semuanya adalah kebaikan yang kita tunjukkan kepada orang lain.",
                },
              ],
            },
            readingTime: 8,
            ageGroup: [3, 4, 5, 6, 7, 8],
            category: "adventure",
            createdAt: new Date(),
          }
          
          localStorage.setItem(`story-${storyId}`, JSON.stringify(mockStory))
          localStorage.setItem(`story-${storyId}-timestamp`, new Date().getTime().toString())
          setStory(mockStory)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading story:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: state.language === "en" ? "Failed to load story" : "Gagal memuat cerita",
        })
        setIsLoading(false)
      }
    }

    if (storyId) {
      loadStory()
    }
  }, [storyId, state.language])

  useEffect(() => {
    if (story && typeof story.isFavorite !== "undefined") {
      setIsFavorite(story.isFavorite)
    }
  }, [story])

  // Generate and set image URLs when the page changes
  useEffect(() => {
    if (story) {
      const currentStoryPage = story.pages[state.language][currentPage]
      const urls = getStoryImageUrls(currentStoryPage.title, currentStoryPage.content, 5)
      setImageUrls(urls)
      setImagesLoaded(new Array(urls.length).fill(false))
      setImageLoading(true)
      setCurrentSlide(0)
    }
  }, [currentPage, story, state.language])

  // Auto-slide carousel effect
  useEffect(() => {
    if (imageUrls.length > 0 && !imageLoading) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % imageUrls.length)
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [imageUrls, imageLoading])

  // Image loading tracking
  useEffect(() => {
    if (imagesLoaded.every(loaded => loaded) && imagesLoaded.length > 0) {
      setImageLoading(false)
    }
  }, [imagesLoaded])

  // Preload next page images
  useEffect(() => {
    if (!imageLoading && story) {
      preloadNextPageImage()
    }
  }, [imageLoading, currentPage, story])

  // Show confetti when reaching the last page
  useEffect(() => {
    if (story && currentPage === story.pages[state.language].length - 1) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    } else {
      setShowConfetti(false)
    }
  }, [currentPage, story, state.language])

  // Check speech support on mount
  useEffect(() => {
    const checkSpeechSupport = () => {
      const supported = typeof window !== "undefined" && "speechSynthesis" in window
      setIsSpeechSupported(supported)
    }
    checkSpeechSupport()

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        speechService.stop()
      }
    }
  }, [])

  useEffect(() => {
    if (isNarrating) {
      speechService.stop()
      setIsNarrating(false)
      setActiveSegment(null)
    }
  }, [currentPage])

  const narrateStory = async () => {
    if (!story || !isSpeechSupported) return

    if (isNarrating) {
      speechService.stop()
      setIsNarrating(false)
      setActiveSegment(null)
      return
    }

    const currentStoryPage = story.pages[state.language][currentPage]
    if (!currentStoryPage) return
    
    setIsNarrating(true)

    try {
      await narrateWithAnimation(currentStoryPage.title, true)
      setActiveSegment(0)
      await narrateWithAnimation(currentStoryPage.content, false)
      setIsNarrating(false)
      setActiveSegment(null)
    } catch (error) {
      console.error("Narration error:", error)
      setIsNarrating(false)
      setActiveSegment(null)
    }
  }

  const narrateWithAnimation = (text: string, isTitle: boolean): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        speechService
          .speak(text, state.language, { isChildFriendly: true })
          .then(() => {
            if (!isTitle) {
              setTimeout(() => {
                resolve()
              }, 300)
            } else {
              resolve()
            }
          })
          .catch((error) => {
            reject(error)
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setImageLoading(true)
      setCurrentPage(currentPage - 1)
    }
  }

  const markStoryAsRead = () => {
    if (story && !story.isRead) {
      const updatedStory = {
        ...story,
        isRead: true,
      }
      setStory(updatedStory)

      if (storyId) {
        localStorage.setItem(`story-${storyId}`, JSON.stringify(updatedStory))
        localStorage.setItem(`story-${storyId}-timestamp`, new Date().getTime().toString())
      }

      try {
        fetch(`/api/stories/${storyId}/read`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }).catch((e) => console.error("Network error updating read status:", e))
      } catch (error) {
        console.error("Error marking story as read:", error)
      }
    }
  }

  const handleNextPage = () => {
    if (story && currentPage < story.pages[state.language].length - 1) {
      setImageLoading(true)
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)

      if (nextPage === story.pages[state.language].length - 1) {
        markStoryAsRead()
      }
    }
  }

  const toggleFavorite = () => {
    const newFavoriteStatus = !isFavorite
    setIsFavorite(newFavoriteStatus)

    if (story && storyId) {
      const updatedStory = {
        ...story,
        isFavorite: newFavoriteStatus,
      }
      setStory(updatedStory)

      try {
        localStorage.setItem(`story-${storyId}`, JSON.stringify(updatedStory))
      } catch (e) {
        console.error("Error updating cached story favorites:", e)
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
    })
  }

  // Highlight special story elements for interactive reading
  const highlightSpecialWords = (text: string) => {
    const specialWords = [
      "magical", "magic", "sparkle", "fairy", "dragon", "shadow", 
      "wizard", "spell", "potion", "enchanted", "ajaib", "peri", 
      "sihir", "naga", "bayangan", "pesona", "terpesona", "ramuan",
    ]

    return text.split(/(\s+)/).map((word, idx) => {
      const cleanWord = word.toLowerCase().replace(/[^\w\s]/g, "")

      if (specialWords.some((special) => cleanWord === special)) {
        return (
          <motion.span
            key={idx}
            className="text-purple-600 font-semibold px-0.5 inline-block cursor-pointer"
            initial={{ scale: 1 }}
            animate={{
              scale: [1, 1.2, 1],
              color: ["#9333ea", "#f472b6", "#9333ea"],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            whileHover={{
              scale: 1.3,
              rotate: [0, -5, 5, 0],
              transition: { duration: 0.3 },
            }}
          >
            {word}
          </motion.span>
        )
      }

      if (word.includes('"') || word.includes("'") || word.includes("!")) {
        return (
          <motion.span
            key={idx}
            className="text-blue-600 italic cursor-pointer"
            whileHover={{
              scale: 1.05,
              color: "#2563eb",
              transition: { duration: 0.2 },
            }}
          >
            {word}
          </motion.span>
        )
      }

      return word
    })
  }

  if (!state.isLoading && !state.currentChild) {
    router.push("/")
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-radial from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-radial from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <Card className="bg-white/95 backdrop-blur-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{state.language === "en" ? "Story Not Found" : "Cerita Tidak Ditemukan"}</h2>
          <p className="text-gray-600 mb-6">{state.language === "en" ? "The story you're looking for doesn't exist." : "Cerita yang Anda cari tidak ada."}</p>
          <Button onClick={() => router.push("/stories")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Button>
        </Card>
      </div>
    )
  }

  const currentStoryPage = story.pages[state.language][currentPage]
  const totalPages = story.pages[state.language].length

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

      {/* Confetti effect for story completion */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0" ref={confettiRef}>
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: [
                    "#FF5252", "#FF4081", "#E040FB", "#7C4DFF", "#536DFE", "#448AFF",
                    "#40C4FF", "#18FFFF", "#64FFDA", "#69F0AE", "#B2FF59", "#EEFF41",
                    "#FFFF00", "#FFD740", "#FFAB40", "#FF6E40",
                  ][Math.floor(Math.random() * 16)],
                  top: `${Math.random() * -10}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: ["0vh", "100vh"],
                  x: [0, Math.random() * 100 - 50],
                  rotate: [0, Math.random() * 360],
                  opacity: [1, 0.8, 0],
                }}
                transition={{
                  duration: Math.random() * 2 + 3,
                  ease: "easeOut",
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Header with darker styling and purple-blue gradient */}
      <motion.div
        className="bg-gradient-to-r from-purple-800/40 via-indigo-800/40 to-blue-800/40 backdrop-blur-lg border-b border-purple-400/30 shadow-xl shadow-purple-500/20"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/stories")}
                  className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20 bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("back")}
                </Button>
              </motion.div>
              <div>
                <motion.h1
                  className="text-xl font-bold text-white drop-shadow-lg font-playful"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(147, 51, 234, 0.6)' }}
                >
                  {story.title[state.language]}
                </motion.h1>
                <motion.p
                  className="text-purple-200 text-sm font-playful"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.4)' }}
                >
                  {state.language === "en" ? "AI Generated Story" : "Cerita Dibuat AI"}
                </motion.p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.6 }}
              >
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-400/50 animate-pulse border border-white/20 backdrop-blur-sm">
                  {state.language === "en" ? "AI Generated" : "Dibuat AI"}
                </Badge>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.7 }}
                className="animate-wiggle"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFavorite}
                  className="text-white hover:bg-white/20 transition-all duration-300 border border-white/20 bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl"
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? "fill-current text-pink-300" : ""}`} />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Story Content with enhanced card styling */}
      <motion.div
        className="max-w-4xl mx-auto p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <Card className="bg-white/85 backdrop-blur-md border-0 shadow-2xl shadow-purple-400/20 rounded-xl overflow-hidden animate-pulse-glow">
          <CardHeader className="text-center p-6 bg-gradient-to-r from-purple-50/80 to-blue-50/80 backdrop-blur-sm border-b border-purple-200/30">
            <motion.h2
              className="text-2xl font-bold text-purple-800 mb-2 font-playful"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{ textShadow: '0 0 15px rgba(147, 51, 234, 0.4)' }}
            >
              {currentStoryPage.title}
            </motion.h2>
            <motion.div
              className="flex items-center justify-center gap-4 text-sm text-purple-700"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <span className="flex items-center font-playful">
                <BookOpen className="h-4 w-4 mr-1" />
                {state.language === "en" ? "Page" : "Halaman"} {currentPage + 1} {state.language === "en" ? "of" : "dari"} {totalPages}
              </span>
              <span className="font-playful">{story.readingTime} {state.language === "en" ? "min read" : "menit baca"}</span>
            </motion.div>
          </CardHeader>

          <CardContent className="p-8">
            {/* Story Image Carousel with enhanced styling */}
            <motion.div
              className="mb-8 rounded-lg overflow-hidden shadow-xl shadow-purple-200/40 group"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <AspectRatio
                ratio={16 / 9}
                className="bg-transparent overflow-hidden relative border border-purple-100/50"
              >
                {imageLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                      <p className="mt-2 text-sm text-purple-600 font-playful">
                        {state.language === "en" ? "Loading images..." : "Memuat gambar..."}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="w-full h-full relative bg-transparent">
                  <AnimatePresence>
                    {imageUrls.map((url, index) => (
                      <motion.div
                        key={`slide-${index}`}
                        className="absolute inset-0 bg-transparent"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: currentSlide === index ? 1 : 0,
                          scale: currentSlide === index ? 1 : 0.95,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7 }}
                        style={{ zIndex: currentSlide === index ? 20 : 10 }}
                      >
                        <Image
                          src={url}
                          alt={`${currentStoryPage.title} - ${index + 1}`}
                          fill
                          className="object-cover rounded-lg transition-transform duration-700 ease-in-out group-hover:scale-110 bg-transparent"
                          priority={currentPage === 0 && index === 0}
                          onLoadingComplete={() => handleImageLoad(index)}
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = "/placeholder.svg?height=400&width=600"
                            handleImageLoad(index)
                          }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Carousel navigation dots */}
                <div className="absolute bottom-3 left-0 right-0 z-30 flex justify-center gap-2">
                  {imageUrls.map((_, index) => (
                    <motion.button
                      key={`dot-${index}`}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        currentSlide === index ? "bg-white scale-125 shadow-md" : "bg-white/50 hover:bg-white/80"
                      }`}
                      whileHover={{ scale: 1.5 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>

                {!imageLoading && (
                  <a
                    href={imageUrls[currentSlide]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 z-30 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full transition-all duration-300 shadow-md backdrop-blur-sm"
                    title={
                      state.language === "en"
                        ? "View full image"
                        : "Lihat gambar penuh"
                    }
                  >
                    <ImageIcon className="w-5 h-5" />
                  </a>
                )}
              </AspectRatio>
              <motion.p
                className="text-center text-sm text-purple-600 italic mt-2 font-playful"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                {generateImageCaption(currentStoryPage.title)} ({currentSlide + 1}/5)
              </motion.p>
            </motion.div>

            {/* Story Text with enhanced styling */}
            <div className="prose prose-lg max-w-none">
              <div className="flex items-center justify-between mb-4">
                <motion.h3
                  className="text-xl font-semibold text-purple-700 mb-0 font-playful"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  style={{ textShadow: '0 0 10px rgba(147, 51, 234, 0.3)' }}
                >
                  {currentStoryPage.title}
                </motion.h3>

                {isSpeechSupported && (
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={narrateStory}
                      variant={isNarrating ? "outline" : "default"}
                      className={`${
                        isNarrating
                          ? "bg-purple-100 border-purple-300 animate-pulse text-purple-700"
                          : "bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-xl shadow-purple-300/50 animate-bounce-slow"
                      } transition-all duration-300 rounded-full px-4 font-playful`}
                    >
                      {isNarrating ? (
                        <>
                          <Pause className="h-5 w-5 mr-2" />
                          {state.language === "en" ? "Pause Reading" : "Jeda Bacaan"}
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-5 w-5 mr-2" />
                          {state.language === "en" ? "Read Story Aloud" : "Bacakan Cerita"}
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </div>

              <motion.div
                className="text-gray-700 leading-relaxed text-lg whitespace-pre-line bg-gradient-to-r from-purple-50/50 to-pink-50/50 p-6 rounded-xl border border-purple-100/50 shadow-inner backdrop-blur-sm font-playful"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.7 }}
              >
                <div
                  className={`transition-all duration-500 ${
                    activeSegment === 0
                      ? "bg-yellow-100 text-gray-800 px-3 py-2 rounded-lg shadow-sm border-l-4 border-yellow-300"
                      : ""
                  }`}
                >
                  {highlightSpecialWords(currentStoryPage.content)}
                </div>
              </motion.div>

              {!isSpeechSupported && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    {state.language === "en"
                      ? "Text-to-speech is not supported in your browser. Please use Chrome, Safari, or Edge for the best experience."
                      : "Fitur text-to-speech tidak didukung di browser Anda. Silakan gunakan Chrome, Safari, atau Edge untuk pengalaman terbaik."}
                  </p>
                </div>
              )}
            </div>

            {/* Navigation with enhanced styling */}
            <motion.div
              className="flex items-center justify-between mt-8 pt-6 border-t border-purple-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 font-playful shadow-md hover:shadow-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("previousPage")}
                </Button>
              </motion.div>

              {/* Page Indicators with enhanced styling */}
              <div className="flex gap-2">
                {story.pages[state.language].map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setImageLoading(true)
                      setCurrentPage(index)
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentPage
                        ? "bg-gradient-to-r from-purple-400 to-pink-400 scale-125 animate-pulse shadow-lg shadow-purple-300/50"
                        : "bg-purple-200 hover:bg-purple-300 shadow-sm"
                    }`}
                    whileHover={{ scale: 1.5, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.3 + index * 0.1, duration: 0.3 }}
                  />
                ))}
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages - 1}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-50 to-purple-50 border-purple-200 hover:bg-gradient-to-r hover:from-pink-100 hover:to-purple-100 font-playful shadow-md hover:shadow-lg"
                >
                  {t("nextPage")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Story Complete */}
            {currentPage === totalPages - 1 && (
              <motion.div
                className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl text-center border-2 border-emerald-100 shadow-lg animate-pulse-glow"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 1.5,
                  duration: 0.7,
                  type: "spring",
                  stiffness: 120,
                }}
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  <h3 className="text-xl font-bold text-emerald-700 mb-2 font-playful">
                    {state.language === "en" ? "Story Complete! 🎉" : "Cerita Selesai! 🎉"}
                  </h3>
                </motion.div>
                <motion.p
                  className="text-emerald-600 mb-4 font-playful"
                  animate={{
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                >
                  {state.language === "en"
                    ? "Great job reading this magical adventure! ✨"
                    : "Bagus sekali membaca petualangan ajaib ini! ✨"}
                </motion.p>
                <div className="flex gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.1, rotate: -3 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      onClick={() => setCurrentPage(0)}
                      variant="outline"
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-playful"
                    >
                      {state.language === "en" ? "Read Again 🔄" : "Baca Lagi 🔄"}
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1, rotate: 3 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      onClick={() => router.push("/stories")}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-playful"
                    >
                      {state.language === "en" ? "More Stories 📚" : "Cerita Lainnya 📚"}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}