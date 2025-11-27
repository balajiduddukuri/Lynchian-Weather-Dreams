import React, { useEffect, useRef, useState } from 'react';
import { LynchContent, ThemeConfig } from '../types';

interface LynchPlayerProps {
  content: LynchContent;
  onEnded: () => void;
  autoPlay: boolean;
  theme: ThemeConfig;
}

const LynchPlayer: React.FC<LynchPlayerProps> = ({ content, onEnded, autoPlay, theme }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      stopPlayback();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) { /* ignore */ }
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const startPlayback = async () => {
    if (isPlaying) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    // If video exists, play it, otherwise just image is shown
    if (videoRef.current && content.videoUrl) {
      videoRef.current.loop = true; 
      videoRef.current.play().catch(e => console.error("Video play failed", e));
    }

    if (content.audioBuffer && audioContextRef.current) {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = content.audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setIsPlaying(false);
        if (videoRef.current) videoRef.current.pause();
        onEnded();
      };

      source.start();
      sourceNodeRef.current = source;
      setIsPlaying(true);
      
      visualize(source, audioContextRef.current);
    }
  };

  useEffect(() => {
    // Immediate auto play if requested
    if (autoPlay && content) {
        startPlayback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, autoPlay]);


  const visualize = (source: AudioBufferSourceNode, ctx: AudioContext) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const analyzer = ctx.createAnalyser();
    analyzer.fftSize = 256;
    source.connect(analyzer);

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
        if (!sourceNodeRef.current) return;
        requestAnimationFrame(draw);

        analyzer.getByteFrequencyData(dataArray);

        // Clear with theme background opacity
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for(let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];

            // Use theme primary color
            canvasCtx.fillStyle = theme.primaryColor;
            
            // Adjust opacity based on volume
            canvasCtx.globalAlpha = barHeight / 255;
            canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

            x += barWidth + 1;
        }
    };
    draw();
  };

  return (
    <div className={`relative w-full max-w-4xl mx-auto mt-8 transition-all duration-500 ${theme.containerClass}`}>
      
      {/* Visual Layer: Video OR Generated Image OR Placeholder */}
      <div className="relative aspect-video bg-black overflow-hidden">
        {content.videoUrl ? (
          <video 
            ref={videoRef}
            src={content.videoUrl}
            className="w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: isPlaying ? 1 : 0.6 }}
            muted 
            playsInline
          />
        ) : content.imageUrl ? (
            <img 
                src={content.imageUrl} 
                alt="Atmospheric Generation"
                className="w-full h-full object-cover animate-[pulse_10s_ease-in-out_infinite]"
            />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${theme.fontClass} italic`}
               style={{ color: theme.primaryColor }}>
             (Visuals obscured... Audio Only)
          </div>
        )}
        
        {/* CRT Overlay Effect - Only for Lynch/Blade */}
        {theme.id !== 'WES' && <div className="absolute inset-0 crt-overlay pointer-events-none"></div>}
      </div>

      {/* Controls & Visualization */}
      <div className={`p-4 border-t flex flex-col gap-4 transition-colors duration-500`}
           style={{ backgroundColor: theme.backgroundColor, borderColor: theme.primaryColor }}>
        
        <canvas ref={canvasRef} width="600" height="50" className="w-full h-12 opacity-80" />
        
        <div className="text-center">
            {!isPlaying ? (
                <button 
                onClick={startPlayback}
                className={`px-8 py-2 uppercase text-sm border hover:invert transition-all ${theme.fontClass}`}
                style={{ backgroundColor: theme.secondaryColor, color: theme.primaryColor, borderColor: theme.primaryColor }}
                >
                Replay Transmission
                </button>
            ) : (
                <div className={`text-xs animate-pulse ${theme.fontClass}`} style={{ color: theme.primaryColor }}>
                    TRANSMITTING...
                </div>
            )}
        </div>

        <div className={`${theme.fontClass} italic text-center text-sm px-8 leading-relaxed`}
             style={{ color: theme.id === 'WES' ? '#555' : '#888' }}>
            "{content.narrativeText}"
        </div>
      </div>
    </div>
  );
};

export default LynchPlayer;