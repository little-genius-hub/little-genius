import { db } from "@/db/config";
import { collectionProgress } from "@/db/models";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ObjectId } from "mongodb";

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
  thumbnail: string;
  pages: {
    en: StoryPage[];
    id: StoryPage[];
  };
  readingTime: number;
  ageGroup: number[];
  category: string;
  createdAt: Date;
}

interface ProgressAnalysis {
  subject: string;
  status: "Need Improvement" | "Improving" | "Great";
  recommendedGames: string[];
}

interface ChildProgress {
  _id: ObjectId;
  childId: ObjectId;
  level: number;
  score: number;
  timeSpent: number;
  completedAt: Date;
  mistakes: number;
  gameType: string;
}

export class GeminiService {
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

  async generateProgress(language: "en" | "id" = "id", childId: string): Promise<ProgressAnalysis> {
    console.log(childId, "<<<< childId");
    const collection = await collectionProgress();
    console.log(collection, "<<<< collection");
    const rawProgress = await collection.find({
      childId: new ObjectId(childId),
    }).toArray();
    let childProgress: ChildProgress[] = rawProgress.map((doc: any) => ({
      _id: doc._id,
      childId: doc.childId,
      level: doc.level,
      score: doc.score,
      timeSpent: doc.timeSpent,
      completedAt: doc.completedAt,
      mistakes: doc.mistakes,
      gameType: doc.gameType,
    }));
    console.log(childProgress, "<<<< childProgress");
    const prompt = this.generateProgressPrompt(language, childProgress);
    // console.log("masukkkkkk")
    try {
      const result = await this.model.generateContent(prompt);
      // console.log(result.response.text(), "<<<< result");
      const response = await result.response.text();
      let cleanResponse = response.replace(/```json|```/g, "").trim();
            let hasil = JSON.parse(cleanResponse);
      console.log(hasil, "<<<<< response")
      let database = await db.getDb()
      let progressCollection = database.collection("parent_dashboard");
      await progressCollection.insertOne({
        childId: new ObjectId(childId),
        language,
        analysis: hasil.analysis,
        overallSummary: hasil.overallSummary,
        createdAt: new Date(),
      });

      return hasil;
    } catch (error) {
      console.error("Error generating progress:", error);
      throw new Error("Failed to generate progress analysis");
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
  "thumbnail": "Deskripsi singkat gambar untuk thumbnail cerita yang ramah anak dan berwarna cerah, menampilkan karakter utama dan latar cerita",
  "pages": [
    {
      "pageNumber": 1,
      "title": "Judul Halaman",
      "content": "Isi cerita dalam 3 paragraf panjang",
      "imageDescription": "Deskripsi gambar halaman ini yang ramah anak, detail dan berwarna cerah (20-30 kata)"
    }
  ],
  "readingTime": 8,
  "ageGroup": [3, 4, 5, 6, 7, 8],
  "category": "adventure"
}

Pastikan deskripsi gambar sangat detail agar dapat diubah menjadi ilustrasi yang menarik. Setiap halaman harus memiliki deskripsi gambar yang berbeda dan sesuai dengan isi cerita di halaman tersebut. Pastikan cerita mengandung nilai moral positif dan sesuai untuk anak-anak.
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
  "thumbnail": "Short description for a child-friendly, colorful thumbnail image showing the main character and story setting",
  "pages": [
    {
      "pageNumber": 1,
      "title": "Page Title",
      "content": "Story content in 3 long paragraphs",
      "imageDescription": "Detailed, child-friendly, colorful image description for this page (20-30 words)"
    }
  ],
  "readingTime": 8,
  "ageGroup": [3, 4, 5, 6, 7, 8],
  "category": "adventure"
}

Ensure image descriptions are very detailed so they can be turned into appealing illustrations. Each page should have a different image description relevant to the content of that page. Ensure the story contains positive moral values suitable for children.
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
        
      // Generate thumbnail from the thumbnail description
      const thumbnailDescription = storyData.thumbnail || `Colorful storybook cover featuring ${storyData.title}`;
      const thumbnailUrl = this.generateImageUrl(thumbnailDescription, true);
      
      // Process pages to add illustration URLs
      const processedPages = (storyData.pages || []).map((page: any) => {
        // Get image description or create one based on page title
        const imageDescription = page.imageDescription || `Illustration of "${page.title}"`;
        
        // Generate illustration URL using Pollinations AI
        const illustration = this.generateImageUrl(imageDescription, false);
        
        return {
          pageNumber: page.pageNumber,
          title: page.title,
          content: page.content,
          illustration
        };
      });

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
        thumbnail: thumbnailUrl,
        pages:
          language === "id"
            ? { id: processedPages, en: processedPages }
            : { en: processedPages, id: processedPages },
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


  private generateImageUrl(prompt: string, isThumb: boolean = false): string {
    // Ensure the prompt is not empty
    if (!prompt || prompt.trim() === '') {
      prompt = isThumb 
        ? "Colorful storybook cover with child-friendly characters" 
        : "Children's book illustration";
    }
    
    // Add specific styling based on whether it's a thumbnail or page illustration
    const enhancedPrompt = isThumb
      ? `${prompt} with background woods, colorful, children's book style`
      : `${prompt}, colorful, children's book style`;
      
    // Encode the prompt for URL
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
      // Create the Pollinations AI URL
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true`;
  }
  
  private generateProgressPrompt(language: "en" | "id", childProgress: ChildProgress[]): string {
    let games = [
      "addition-number",
      "subtraction-number",
      "multiplication-number",
      "division-number",
      "addition-number",
      "word-scramble",
      "word-pronounciation",
      "stories"
    ]
    if (language === "id") {
      return `
Analisa data kemajuan pembelajaran anak berikut dan berikan rekomendasi dalam format JSON.
Gunakan data berikut sebagai acuan: ${JSON.stringify(childProgress)}
Data akan mencakup:
- Tipe permainan yang dimainkan (numbers, letters, stories)
- Skor untuk setiap permainan
- Waktu yang dihabiskan
- Tingkat kesalahan

Berikan analisis untuk setiap subject dengan format berikut:
{
  "analysis": [
    {
      "subject": "string (contoh: 'Numbers', 'Letters', 'Reading')",
      "status": "Need Improvement" | "Improving" | "Great",
      "recommendedGames": ["nama game 1", "nama game 2"] (gunakan nama game yang diambil dari daftar berikut: ${games.join(", ")}, setiap game memiliki 3 level, rekomendasikan level yang paling cocok untuk user)
    }
  ],
  "overallSummary": "ringkasan singkat kemajuan anak secara keseluruhan"
}

Kriteria status:
- "Need Improvement": skor < 60% atau tingkat kesalahan > 40%
- "Improving": skor 60-80% atau tingkat kesalahan 20-40%
- "Great": skor > 80% atau tingkat kesalahan < 20%

Rekomendasi permainan harus sesuai dengan:
1. Level kemampuan anak saat ini
2. Area yang perlu ditingkatkan
3. Pola belajar yang terlihat dari data
`;
    } else {
      return `
Analyze the following child learning progress data and provide recommendations in JSON format.
Use the following data as a reference: ${JSON.stringify(childProgress)} 
The data will include:
- Types of games played (numbers, letters, stories)
- Scores for each game
- Time spent
- Error rates

Provide analysis for each subject in the following format:
{
  "analysis": [
    {
      "subject": "string (e.g., 'Numbers', 'Letters', 'Reading')",
      "status": "Need Improvement" | "Improving" | "Great",
      "recommendedGames": ["game name 1", "game name 2", "game name 3"] (use game names from the following list: ${games.join(", ")}, each game has 3 levels, recommend the most suitable level for the user)
    }
  ],
  "overallSummary": "brief summary of child's overall progress"
}

Status criteria:
- "Need Improvement": score < 60% or error rate > 40%
- "Improving": score 60-80% or error rate 20-40%
- "Great": score > 80% or error rate < 20%

Game recommendations should consider:
1. Child's current ability level
2. Areas needing improvement
3. Learning patterns visible in the data
`;
    }
  }
}

export const geminiService = new GeminiService();
