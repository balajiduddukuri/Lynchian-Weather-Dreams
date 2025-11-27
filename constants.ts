import { ThemeConfig } from './types';

export const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  95: "Thunderstorm",
};

export const MAJOR_CITIES = [
  { name: "LA", lat: 34.05, lng: -118.24 },
  { name: "NY", lat: 40.71, lng: -74.00 },
  { name: "LDN", lat: 51.50, lng: -0.12 },
  { name: "TKY", lat: 35.67, lng: 139.65 },
  { name: "SYD", lat: -33.86, lng: 151.20 },
  { name: "MOS", lat: 55.75, lng: 37.61 },
  { name: "RIO", lat: -22.90, lng: -43.17 },
  { name: "CAI", lat: 30.04, lng: 31.23 },
  { name: "MUM", lat: 19.07, lng: 72.87 },
  { name: "PAR", lat: 48.85, lng: 2.35 },
  { name: "KEF", lat: 64.00, lng: -22.56 }, // Iceland
  { name: "ANT", lat: -75.25, lng: 0.00 }, // Antarctica
];

export const THEMES: Record<string, ThemeConfig> = {
  LYNCH: {
    id: 'LYNCH',
    name: 'The Dreamer',
    systemInstruction: `
      You are David Lynch. You are speaking directly to the viewer.
      I will provide you with weather data and a location.
      Describe the weather and the location, but make it surreal, dreamlike, and slightly unsettling.
      Focus on industrial sounds, quality of light, and subconscious feelings.
      Metaphors: coffee, logs, curtains, dark highways.
      Keep it under 80 words. Do not greet.
    `,
    videoPromptTemplate: (weather, terrain) => `
      Cinematic, 35mm film grain, David Lynch style shot of ${terrain}. 
      Atmosphere: ${weather}, moody lighting, surreal, dim, high contrast, mysterious, eerie stillness. 
      No people.
    `,
    voiceName: 'Fenrir',
    primaryColor: '#ef4444', // red-500
    secondaryColor: '#450a0a', // red-950
    backgroundColor: '#050505',
    fontClass: 'font-mono', // Courier
    containerClass: 'border-[#330000] shadow-[0_0_30px_#330000] bg-black',
    mapFilter: 'grayscale(100%) contrast(150%) brightness(50%) invert(100%)',
    markerClass: 'bg-red-600 shadow-[0_0_8px_#ff0000]',
  },
  WES: {
    id: 'WES',
    name: 'The Auteur',
    systemInstruction: `
      You are a narrator in a Wes Anderson film.
      Describe the weather with precise, twee detail. 
      Mention pastel colors, symmetry, and specific, odd objects (a vintage binocular, a yellow canary).
      Keep it dry, factual, but whimsical. 
      Keep it under 80 words.
    `,
    videoPromptTemplate: (weather, terrain) => `
      Cinematic shot of ${terrain} in the style of Wes Anderson.
      Symmetrical composition, pastel color palette, flat lighting, whimsical, highly detailed, yellow and pink hues.
      Atmosphere: ${weather}. No people.
    `,
    voiceName: 'Puck',
    primaryColor: '#fbbf24', // amber-400
    secondaryColor: '#fef3c7', // amber-100
    backgroundColor: '#fdf2f8', // pink-50
    fontClass: 'font-[Oswald] tracking-wider',
    containerClass: 'border-4 border-yellow-400 shadow-none bg-[#fff0f5]',
    mapFilter: 'sepia(50%) hue-rotate(330deg) saturate(150%) brightness(110%)',
    markerClass: 'bg-yellow-400 border-2 border-white shadow-sm',
  },
  BLADE: {
    id: 'BLADE',
    name: 'The Runner',
    systemInstruction: `
      You are a weary Blade Runner in a cyberpunk future.
      Describe the weather using tech-noir slang.
      Mention acid rain, neon reflections, steam from vents, corporate holograms, and decay.
      Gritty, cynical, and poetic.
      Keep it under 80 words.
    `,
    videoPromptTemplate: (weather, terrain) => `
      Cyberpunk sci-fi cityscape shot of ${terrain}.
      Neon lights, rain-slicked surfaces, volumetric fog, blue and purple lighting, high tech low life aesthetic.
      Atmosphere: ${weather}.
    `,
    voiceName: 'Charon',
    primaryColor: '#00e5ff', // cyan-400
    secondaryColor: '#1e1b4b', // indigo-950
    backgroundColor: '#020617', // slate-950
    fontClass: 'font-sans',
    containerClass: 'border border-cyan-500 shadow-[0_0_20px_#00e5ff] bg-[#000510]',
    mapFilter: 'hue-rotate(180deg) saturate(200%) contrast(120%) brightness(70%)',
    markerClass: 'bg-cyan-400 shadow-[0_0_8px_#00e5ff]',
  }
};

export const DEFAULT_COORDINATES = { lat: 34.137, lng: -118.352 };