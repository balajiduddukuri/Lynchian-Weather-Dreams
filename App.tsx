import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Coordinates, AppState, LynchContent, ThemeConfig, CityWeather } from './types';
import { THEMES } from './constants';
import WorldMap from './components/WorldMap';
import LynchPlayer from './components/LynchPlayer';
import { fetchWeatherData, getTerrainDescription, fetchGlobalTemperatures } from './services/weatherService';
import { generateNarrative, generateSpeech, generateSceneryImage } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [content, setContent] = useState<LynchContent | null>(null);
  const [autoMode, setAutoMode] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(THEMES.LYNCH);
  const [logs, setLogs] = useState<string[]>([]);
  const [globalCities, setGlobalCities] = useState<CityWeather[]>([]);
  const autoModeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 5));

  // Initial Data Load
  useEffect(() => {
    const loadGlobalData = async () => {
        const cities = await fetchGlobalTemperatures();
        setGlobalCities(cities);
    };
    loadGlobalData();
    const interval = setInterval(loadGlobalData, 300000); // Refresh every 5 mins
    return () => clearInterval(interval);
  }, []);

  const handleSelectLocation = async (coords: Coordinates) => {
    if (appState !== AppState.IDLE && appState !== AppState.PLAYING && appState !== AppState.ERROR) {
      return; // Busy
    }

    setCurrentLocation(coords);
    await processLocation(coords);
  };

  const processLocation = async (coords: Coordinates) => {
    try {
      setAppState(AppState.FETCHING_WEATHER);
      addLog(`Connecting to coordinates: ${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)}...`);
      
      let weather;
      try {
        weather = await fetchWeatherData(coords);
      } catch (e) {
        console.warn("Weather fetch failed", e);
        throw new Error("WEATHER_FAILED");
      }
      
      addLog(`Conditions received. Temp: ${weather.temperature}°C.`);

      setAppState(AppState.GENERATING_NARRATIVE);
      let narrative;
      try {
        narrative = await generateNarrative(weather, currentTheme);
      } catch (e) {
        console.warn("Narrative generation failed", e);
        throw new Error("NARRATIVE_FAILED");
      }
      addLog("Narrative synthesized.");

      setAppState(AppState.GENERATING_MEDIA);
      addLog("Generating audiovisual hallucination...");

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const terrain = getTerrainDescription(coords.lat, coords.lng);
      
      // Parallel Generation of Audio and Static Image for speed
      const [audioBufferResult, imageResult] = await Promise.allSettled([
        generateSpeech(narrative, currentTheme, audioContextRef.current),
        generateSceneryImage(narrative, terrain, currentTheme)
      ]);

      if (audioBufferResult.status === 'rejected') {
        console.warn("Audio generation failed", audioBufferResult.reason);
        throw new Error("AUDIO_FAILED");
      }
      
      const finalImageUrl = imageResult.status === 'fulfilled' ? imageResult.value : null;

      setContent({
        narrativeText: narrative,
        audioBuffer: audioBufferResult.value,
        videoUrl: null, // Skipping video for immediate playback speed
        imageUrl: finalImageUrl,
        location: coords,
        themeId: currentTheme.id
      });

      setAppState(AppState.PLAYING);
      addLog("Ready. Playing transmission.");

    } catch (error: any) {
      console.error(error);
      setAppState(AppState.ERROR);
      
      let userMsg = "Transmission interrupted.";
      if (error.message === "WEATHER_FAILED") {
        userMsg = "Error: Unable to establish telemetry link (Weather Service Down).";
      } else if (error.message === "NARRATIVE_FAILED") {
        userMsg = "Error: Neural synthesis failure (LLM Unresponsive).";
      } else if (error.message === "AUDIO_FAILED") {
        userMsg = "Error: Audio frequency corruption (TTS Failed).";
      } else {
        userMsg = `Error: System failure (${error.message || 'Unknown'}).`;
      }
      
      addLog(userMsg);
    }
  };

  // Auto Mode Logic
  useEffect(() => {
    if (autoMode) {
      const runAutoLoop = async () => {
         const lat = (Math.random() * 160) - 80;
         const lng = (Math.random() * 360) - 180;
         await processLocation({ lat, lng });
      };

      runAutoLoop();
      autoModeTimerRef.current = setInterval(runAutoLoop, 60000); // Every 1 min
    } else {
      if (autoModeTimerRef.current) {
        clearInterval(autoModeTimerRef.current);
      }
    }

    return () => {
      if (autoModeTimerRef.current) clearInterval(autoModeTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMode]);

  return (
    <div className={`min-h-screen p-4 md:p-8 flex flex-col items-center transition-colors duration-1000 ${currentTheme.fontClass}`}
         style={{ backgroundColor: currentTheme.backgroundColor, color: currentTheme.id === 'WES' ? '#333' : '#e5e5e5' }}>
      
      <header className="mb-8 text-center space-y-2 w-full max-w-5xl flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase transition-colors"
              style={{ color: currentTheme.primaryColor }}>
            {currentTheme.name}
          </h1>
          <p className="text-xs font-mono tracking-widest opacity-60 uppercase">
             Atmospheric Simulation // {currentTheme.id}
          </p>
        </div>

        <div className="flex gap-2 mt-4 md:mt-0">
            {Object.values(THEMES).map(theme => (
                <button
                    key={theme.id}
                    onClick={() => setCurrentTheme(theme)}
                    className={`px-3 py-1 text-xs border transition-all ${currentTheme.id === theme.id ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
                    style={{ 
                        borderColor: theme.primaryColor, 
                        color: theme.primaryColor,
                        backgroundColor: currentTheme.id === theme.id ? theme.secondaryColor : 'transparent'
                    }}
                >
                    {theme.id}
                </button>
            ))}
        </div>
      </header>

      <main className="w-full max-w-5xl space-y-8">
        
        {/* Map Section */}
        <section className="relative">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-sm font-bold opacity-60 uppercase tracking-widest">Global Telemetry</h2>
            <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <span className={`text-xs font-mono ${autoMode ? 'animate-pulse' : 'opacity-60'}`}
                          style={{ color: autoMode ? currentTheme.primaryColor : undefined }}>
                    AUTO_DRIFT {autoMode ? '[ON]' : '[OFF]'}
                    </span>
                    <input 
                    type="checkbox" 
                    checked={autoMode} 
                    onChange={(e) => setAutoMode(e.target.checked)}
                    className="hidden"
                    />
                </label>
            </div>
          </div>
          
          <WorldMap 
            onSelectLocation={handleSelectLocation}
            disabled={appState === AppState.FETCHING_WEATHER || appState === AppState.GENERATING_MEDIA || appState === AppState.GENERATING_NARRATIVE}
            selectedLocation={currentLocation}
            cities={globalCities}
            theme={currentTheme}
          />
        </section>

        {/* Status/Logs */}
        <div className={`h-24 text-xs p-2 overflow-hidden flex flex-col-reverse border transition-colors ${currentTheme.id === 'LYNCH' ? 'font-mono' : ''}`}
             style={{ 
                 borderColor: currentTheme.primaryColor, 
                 backgroundColor: currentTheme.backgroundColor,
                 color: currentTheme.primaryColor 
             }}>
            {logs.map((log, i) => (
                <div key={i} className="opacity-70">> {log}</div>
            ))}
             {appState !== AppState.IDLE && appState !== AppState.PLAYING && (
                <div className="animate-pulse">> PROCESSING...</div>
            )}
        </div>

        {/* Player Section */}
        {content && (
            <LynchPlayer 
                content={content} 
                onEnded={() => {
                    addLog("Sequence ended.");
                }}
                autoPlay={true} // Always autoplay now as per requirement
                theme={currentTheme}
            />
        )}

      </main>

      <footer className="mt-16 text-center text-[10px] opacity-50 font-mono">
        <p>POWERED BY GEMINI FLASH, IMAGE & TTS</p>
      </footer>

    </div>
  );
};

export default App;