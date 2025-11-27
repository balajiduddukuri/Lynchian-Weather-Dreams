import { GoogleGenAI, Modality } from "@google/genai";
import { WEATHER_CODES } from "../constants";
import { WeatherData, ThemeConfig } from "../types";
import { decode, decodeAudioData } from "./utils";

const createClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a stylistic narrative based on weather data and the selected theme.
 * Uses `gemini-2.5-flash` for fast text generation.
 * 
 * @param weather - The current weather conditions (temp, wind, code).
 * @param theme - The active theme configuration containing system instructions.
 * @returns A string containing the generated monologue.
 */
export const generateNarrative = async (weather: WeatherData, theme: ThemeConfig): Promise<string> => {
  const ai = createClient();
  const weatherDesc = WEATHER_CODES[weather.conditionCode] || "Unknown";
  
  const prompt = `
    Location Data:
    Temperature: ${weather.temperature}°C.
    Wind: ${weather.windSpeed} km/h.
    Condition: ${weatherDesc}.
    
    Task: Write a short monologue based on the system instructions.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: theme.systemInstruction,
      temperature: 1.1, 
    },
  });

  return response.text || "Static...";
};

/**
 * Converts text to speech using the Gemini TTS model.
 * Uses specific voice profiles defined in the ThemeConfig.
 * 
 * @param text - The text to speak.
 * @param theme - The active theme (determines voiceName).
 * @param audioCtx - The browser's AudioContext for decoding.
 * @returns A decoded AudioBuffer ready for playback.
 */
export const generateSpeech = async (text: string, theme: ThemeConfig, audioCtx: AudioContext): Promise<AudioBuffer> => {
  const ai = createClient();
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: theme.voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
  if (!base64Audio) {
    throw new Error("No audio data returned");
  }

  return await decodeAudioData(
    decode(base64Audio),
    audioCtx,
    24000,
    1
  );
};

/**
 * Generates a static atmospheric image representing the location and narrative.
 * Uses `gemini-2.5-flash-image`.
 * 
 * @param narrative - The generated story (used to influence the scene).
 * @param terrain - A crude description of the geography (e.g., "industrial wasteland").
 * @param theme - The active theme (determines visual style prompt).
 * @returns A Base64 data URL of the generated image.
 */
export const generateSceneryImage = async (narrative: string, terrain: string, theme: ThemeConfig): Promise<string | null> => {
  const ai = createClient();
  const prompt = theme.videoPromptTemplate(narrative.substring(0, 100), terrain); // Reuse prompt template

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        // No specific config for basic image gen on 2.5-flash-image
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.warn("Image generation failed", e);
    return null;
  }
};

/**
 * Generates a video using Veo.
 * NOTE: Currently unused in the main flow to prioritize immediate playback speed,
 * but kept for future "High Quality" mode implementation.
 */
export const generateVideo = async (narrative: string, terrain: string, theme: ThemeConfig): Promise<string | null> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) return null; 
  }

  const ai = createClient();

  // Use theme specific template
  const prompt = theme.videoPromptTemplate(narrative.substring(0, 50), terrain);

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  
  if (!downloadLink) {
    throw new Error("Video generation failed");
  }

  return `${downloadLink}&key=${process.env.API_KEY}`;
};