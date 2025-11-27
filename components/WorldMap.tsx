import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Coordinates, CityWeather, ThemeConfig } from '../types';

interface WorldMapProps {
  onSelectLocation: (coords: Coordinates) => void;
  disabled: boolean;
  selectedLocation: Coordinates | null;
  cities: CityWeather[];
  theme: ThemeConfig;
}

const WorldMap: React.FC<WorldMapProps> = ({ onSelectLocation, disabled, selectedLocation, cities, theme }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [hoverCoords, setHoverCoords] = useState<Coordinates | null>(null);
  const [sunPos, setSunPos] = useState<{lat: number, lng: number} | null>(null);

  // Calculate Sun Position for Day/Night Cycle
  useEffect(() => {
    const calculateSunPosition = () => {
      const now = new Date();
      const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
      
      // Longitude: Sun moves 15 deg/hour. At 12:00 UTC it is at 0 deg.
      // Formula: (12 - UTC) * 15
      let sunLng = (12 - utcHours) * 15;
      if (sunLng < -180) sunLng += 360;
      if (sunLng > 180) sunLng -= 360;

      // Latitude (Declination): Approx sine wave between -23.44 and +23.44
      // Day of year
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - start.getTime();
      const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
      // Approx declination. 81 is roughly the equinox.
      const sunLat = 23.44 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));

      setSunPos({ lat: sunLat, lng: sunLng });
    };

    calculateSunPosition();
    const interval = setInterval(calculateSunPosition, 60000 * 10); // Update every 10 mins
    return () => clearInterval(interval);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || !mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = x / rect.width;
    const normY = y / rect.height;
    const lng = (normX * 360) - 180;
    const lat = 90 - (normY * 180);

    onSelectLocation({ lat, lng });
  };

  const handleCityClick = (e: React.MouseEvent, city: CityWeather) => {
    e.stopPropagation(); 
    if (disabled) return;
    onSelectLocation({ lat: city.lat, lng: city.lng });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
     if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = x / rect.width;
    const normY = y / rect.height;
    setHoverCoords({
        lng: (normX * 360) - 180,
        lat: 90 - (normY * 180)
    });
  };

  // Convert lat/lng to percentage coordinates
  const getPos = (lat: number, lng: number) => ({
    left: `${((lng + 180) / 360) * 100}%`,
    top: `${((90 - lat) / 180) * 100}%`
  });

  return (
    <div className={`relative w-full aspect-[2/1] bg-[#020202] overflow-hidden group border transition-colors duration-500 ${theme.containerClass.split(' ')[0]}`}>
      
      {/* Background Map Image */}
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png" 
        alt="World Map"
        className="absolute inset-0 w-full h-full object-cover transition-all duration-1000"
        style={{ filter: theme.mapFilter }}
      />

      {/* Day/Night Overlay */}
      {sunPos && (
        <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-80"
             style={{
                // We create a large radial gradient centered at the sun to represent "Day"
                // The rest is dark (Night). 
                // Since this is 2D projection, it's not a perfect circle on the map, but good approximation visually.
                background: `radial-gradient(circle at ${((sunPos.lng + 180) / 360) * 100}% ${((90 - sunPos.lat) / 180) * 100}%, transparent 10%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.9) 60%)`
             }}
        />
      )}
      
      {/* Grid Overlay - Thematic */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{ 
            backgroundImage: `linear-gradient(${theme.primaryColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.primaryColor} 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}
      />

      {/* Click Handler Overlay */}
      <div 
        ref={mapRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverCoords(null)}
        className={`absolute inset-0 cursor-crosshair ${disabled ? 'cursor-wait' : ''} z-10`}
      />

      {/* City Markers */}
      {cities.map((city) => (
        <div
          key={city.name}
          onClick={(e) => handleCityClick(e, city)}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group/city cursor-pointer flex flex-col items-center"
          style={getPos(city.lat, city.lng)}
        >
          <div className={`w-2 h-2 rounded-full transition-transform hover:scale-150 ${theme.markerClass}`} />
          <div className={`mt-1 text-[8px] opacity-70 group-hover/city:opacity-100 whitespace-nowrap px-1 rounded ${theme.fontClass}`}
               style={{ backgroundColor: theme.backgroundColor, color: theme.primaryColor }}>
            {city.name} {city.temperature}°
          </div>
        </div>
      ))}

      {/* Selected Location Marker */}
      {selectedLocation && (
        <div 
          className="absolute w-4 h-4 border-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-pulse"
          style={{
            borderColor: theme.primaryColor,
            ...getPos(selectedLocation.lat, selectedLocation.lng)
          }}
        />
      )}

      {/* Hover Info */}
      <div className={`absolute bottom-2 left-2 text-xs p-1 pointer-events-none z-30 ${theme.fontClass}`}
           style={{ backgroundColor: theme.backgroundColor, color: theme.primaryColor }}>
        {hoverCoords 
          ? `LAT: ${hoverCoords.lat.toFixed(2)} / LNG: ${hoverCoords.lng.toFixed(2)}`
          : "SEARCHING..."}
      </div>
    </div>
  );
};

export default WorldMap;