export class SpeechService {
  private synthesis: SpeechSynthesis | null = null;
  private recognition: SpeechRecognition | null = null;
  constructor() {
    if (typeof window !== "undefined") {
      this.synthesis = window.speechSynthesis;

      const SpeechRecognition: typeof window.SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
      }
    }
  }

  speak(text: string, language: "en" | "id" = "en"): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error("Speech synthesis not supported"));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "en" ? "en-US" : "id-ID";
      utterance.rate = 0.8;
      utterance.pitch = 1.1;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);

      this.synthesis.speak(utterance);
    });
  }

  listen(language: "en" | "id" = "en"): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error("Speech recognition not supported"));
        return;
      }

      this.recognition.lang = language === "en" ? "en-US" : "id-ID";

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript.toLowerCase().trim());
      };

      this.recognition.onerror = (event) => {
        reject(new Error(event.error));
      };

      this.recognition.onend = () => {
        setTimeout(() => reject(new Error("No speech detected")), 100);
      };

      this.recognition.start();
    });
  }

  stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}

export const speechService = new SpeechService();
