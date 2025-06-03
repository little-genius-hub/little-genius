export class SpeechService {
  private synthesis: SpeechSynthesis | null = null;
  private recognition: SpeechRecognition | null = null;
  private elevenLabsApiKey: string | null = null;

  // ElevenLabs voice IDs
  // Using EXAVITQu4vr4xnSDxMaL (Rachel) for English
  // Using pNInz6obpgDQGcFmaJgB (Adam) for Indonesian
  private enVoiceId = "EXAVITQu4vr4xnSDxMaL";
  private idVoiceId = "pNInz6obpgDQGcFmaJgB";
  
  constructor() {
    if (typeof window !== "undefined") {
      // Keep the Web Speech API for fallback and recognition
      this.synthesis = window.speechSynthesis;
      
      // Get ElevenLabs API key from environment
      this.elevenLabsApiKey = process.env.ELEVENLABS_API_KEY || null;

      const SpeechRecognition: typeof window.SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
      }
    }
  }
  
  async speak(text: string, language: "en" | "id" = "en", options?: { isChildFriendly?: boolean }): Promise<void> {
    // If ElevenLabs API key is available, use it
    if (this.elevenLabsApiKey) {
      try {
        await this.speakWithElevenLabs(text, language, options);
        return;
      } catch (error) {
        console.error("ElevenLabs speech failed, falling back to Web Speech API:", error);
        // Fall back to browser's speech synthesis
        return this.speakWithWebSpeech(text, language, options);
      }
    } else {
      // Use the browser's speech synthesis if no API key
      return this.speakWithWebSpeech(text, language, options);
    }
  }
  
  private async speakWithElevenLabs(text: string, language: "en" | "id" = "en", options?: { isChildFriendly?: boolean }): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Select appropriate voice ID based on language
        const voiceId = language === "en" ? this.enVoiceId : this.idVoiceId;
        
        // Create speech using ElevenLabs API
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
          method: "POST",
          headers: {
            "Xi-Api-Key": this.elevenLabsApiKey as string,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "text": text,
            "model_id": "eleven_multilingual_v2"
          })
        });
        
        if (!response.ok) {
          throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
        }
        
        // Get the audio blob
        const audioBlob = await response.blob();
        
        // Create an audio element to play the speech
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        audio.onerror = (event) => {
          URL.revokeObjectURL(audioUrl);
          reject(new Error("Audio playback error"));
        };
        
        // Play the audio
        audio.play();
      } catch (error) {
        reject(error);
      }
    });
  }
  
  private speakWithWebSpeech(text: string, language: "en" | "id" = "en", options?: { isChildFriendly?: boolean }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error("Speech synthesis not supported"));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "en" ? "en-US" : "id-ID";
      
      // Use child-friendly speech settings - slightly slower and higher pitch
      const isChildFriendly = options?.isChildFriendly !== false;
      utterance.rate = isChildFriendly ? 0.75 : 0.9; // Even slower for children
      utterance.pitch = isChildFriendly ? 1.1 : 1.0; // Slightly higher pitch for children
      utterance.volume = 1.0;
      
      // Try to select a more pleasant voice if available
      if (typeof window !== "undefined" && this.synthesis.getVoices().length > 0) {
        // Get available voices
        const voices = this.synthesis.getVoices();
        
        // Try to find a good voice based on language
        const preferredVoice = voices.find(voice => {
          if (language === "en") {
            // For English, prefer female voices which sound clearer for children
            return voice.lang.includes('en') && 
                  (voice.name.includes('Female') || 
                   voice.name.includes('woman') ||
                   voice.name.includes('girl'));
          } else {
            // For Indonesian, just find any matching voice
            return voice.lang.includes('id');
          }
        });
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

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
