import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Little Genius - Educational Games for Kids",
    short_name: "Little Genius",
    description: "Fun educational games and stories for children with bilingual support",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4F46E5",
    orientation: "portrait",
    categories: ["education", "games", "kids"],    icons: [
      {
        src: "/placeholder-logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/placeholder-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/placeholder-logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
