import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";

if (!API_KEY) {
  console.warn("GEMINI_API_KEY is not set. Story generation will not work.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export interface StoryPage {
  pageNumber: number;
  title: string;
  content: string;
  illustration?: string;
}

export interface GeneratedStory {
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
}

class GeminiService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateStory(language: "en" | "id" = "id"): Promise<GeneratedStory> {
    const prompt = this.getStoryPrompt(language);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseStoryResponse(text, language);
    } catch (error) {
      console.error("Error generating story:", error);
      throw new Error("Failed to generate story");
    }
  }

  private getStoryPrompt(language: "en" | "id"): string {
    // Create an array of random themes to add variety
    const themes = [
      "jungle adventure",
      "space exploration",
      "underwater discovery",
      "magical forest",
      "desert journey",
      "mountain climbing",
      "time travel",
      "ancient ruins",
      "futuristic city",
      "animal friends",
    ];

    // Randomly pick a theme
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];

    // Generate a random seed to enhance variety
    const seed = Math.floor(Math.random() * 10000);

    if (language === "id") {
      return `
Buatkan cerita pendek anak bertema petualangan yang variatif dengan spesifikasi:

1. Gunakan tema: "${randomTheme}" sebagai inspirasi, tapi jangan terpaku pada tema ini saja.

2. Panjang: 3-5 lembar

3. Struktur per lembar:
   - Lembar 1: Pengenalan tokoh & latar
   - Lembar 2-4: Konflik + aksi seru
   - Lembar terakhir: Penyelesaian & pesan moral

4. Setiap lembar HARUS berisi 3 paragraf panjang (masing-masing 4-6 kalimat)

5. Elemen wajib: 
   - Dialog antartokoh 
   - Deskripsi sensorik (suara, warna, tekstur)
   - Twist mengejutkan di lembar 3

6. Bahasa: Indonesia sederhana, gunakan onomatope (contoh: "Braak!" "Whoosh!") 

7. Target usia: 2-10 tahun

8. SANGAT PENTING untuk variasi:
   - Buat judul yang UNIK dan KREATIF
   - JANGAN gunakan "Lily", "Pip", atau nama karakter yang umum
   - Gunakan kombinasi karakter yang tidak biasa (seperti hewan yang jarang, objek yang menjadi hidup, dll)
   - Cerita harus original dan tidak mengikuti pola cerita anak yang sudah umum
   - Seed number untuk variasi: ${seed}

9. Format output harus JSON dengan struktur:
{
  "title": "Judul Cerita",
  "description": "Deskripsi singkat cerita",
  "pages": [
    {
      "pageNumber": 1,
      "title": "Judul Halaman",
      "content": "Isi cerita dalam 3 paragraf panjang"
    }
  ],
  "readingTime": 8,
  "ageGroup": [3, 4, 5, 6, 7, 8],
  "category": "adventure"
}

Pastikan cerita mengandung nilai moral positif dan sesuai untuk anak-anak.
`;
    } else {
      return `
Create a children's adventure short story with specifications:

1. Use theme: "${randomTheme}" as inspiration, but don't be limited to just this theme.

2. Length: 3-5 pages

3. Structure per page:
   - Page 1: Character introduction & setting
   - Pages 2-4: Conflict + exciting action
   - Last page: Resolution & moral message

4. Each page MUST contain 3 long paragraphs (4-6 sentences each)

5. Required elements:
   - Character dialogue
   - Sensory descriptions (sounds, colors, textures)
   - Surprising twist on page 3

6. Language: Simple English, use onomatopoeia (example: "Bang!" "Whoosh!")

7. Target age: 2-10 years

8. VERY IMPORTANT for variation:
   - Create a UNIQUE and CREATIVE title
   - DO NOT use "Lily", "Pip", or common character names
   - Use unusual character combinations (like uncommon animals, objects that come to life, etc.)
   - Story must be original and not follow common children's story patterns
   - Seed number for variation: ${seed}

9. Output format must be JSON with structure:
{
  "title": "Story Title",
  "description": "Brief story description",
  "pages": [
    {
      "pageNumber": 1,
      "title": "Page Title",
      "content": "Story content in 3 long paragraphs"
    }
  ],
  "readingTime": 8,
  "ageGroup": [3, 4, 5, 6, 7, 8],
  "category": "adventure"
}

Ensure the story contains positive moral values suitable for children.
`;
    }
  }

  private parseStoryResponse(
    text: string,
    language: "en" | "id"
  ): GeneratedStory {
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const storyData = JSON.parse(jsonMatch[0]);

      // Generate unique ID
      const id = `story-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Create story object with both languages
      const story: GeneratedStory = {
        id,
        title:
          language === "id"
            ? { id: storyData.title, en: storyData.title }
            : { en: storyData.title, id: storyData.title },
        description:
          language === "id"
            ? { id: storyData.description, en: storyData.description }
            : { en: storyData.description, id: storyData.description },
        pages:
          language === "id"
            ? { id: storyData.pages, en: storyData.pages }
            : { en: storyData.pages, id: storyData.pages },
        readingTime: storyData.readingTime || 8,
        ageGroup: storyData.ageGroup || [3, 4, 5, 6, 7, 8],
        category: storyData.category || "adventure",
        createdAt: new Date(),
      };

      return story;
    } catch (error) {
      console.error("Error parsing story response:", error);
      throw new Error("Failed to parse generated story");
    }
  }
}

export const geminiService = new GeminiService();
