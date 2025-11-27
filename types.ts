export interface Coordinates {
  lat: number;
  lng: number;
}

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  conditionCode: number;
  locationName?: string;
}

export interface CityWeather {
  name: string;
  lat: number;
  lng: number;
  temperature: number;
}

export interface ThemeConfig {
  id: string;
  name: string;
  systemInstruction: string;
  videoPromptTemplate: (weather: string, terrain: string) => string;
  voiceName: string; // 'Fenrir' | 'Puck' | 'Kore' | 'Zephyr' | 'Charon'
  
  // Visuals
  primaryColor: string; // For visualizer and accents
  secondaryColor: string; 
  backgroundColor: string; // App background
  fontClass: string;
  containerClass: string; // Border/Shadow styles
  mapFilter: string; // CSS filter for the map
  markerClass: string; // CSS for map markers
}

export enum AppState {
  IDLE = 'IDLE',
  FETCHING_WEATHER = 'FETCHING_WEATHER',
  GENERATING_NARRATIVE = 'GENERATING_NARRATIVE',
  GENERATING_MEDIA = 'GENERATING_MEDIA', 
  PLAYING = 'PLAYING',
  ERROR = 'ERROR'
}

export interface LynchContent {
  narrativeText: string;
  audioBuffer: AudioBuffer | null;
  videoUrl: string | null;
  imageUrl: string | null;
  location: Coordinates;
  themeId: string;
}