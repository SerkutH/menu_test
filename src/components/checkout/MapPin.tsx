import { useState, useRef, useCallback } from 'react';
import { MapPin as MapPinIcon, Move } from 'lucide-react';

interface Props {
  lat: number;
  lng: number;
  onPinMove: (lat: number, lng: number) => void;
}

export default function MapPin({ lat, lng, onPinMove }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [pinPosition, setPinPosition] = useState({ x: 50, y: 50 }); // percentage

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setPinPosition({ x, y });
    },
    [dragging]
  );

  const handlePointerUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    // Simulate lat/lng offset from center based on pin position
    const latOffset = ((50 - pinPosition.y) / 50) * 0.005;
    const lngOffset = ((pinPosition.x - 50) / 50) * 0.005;
    onPinMove(lat + latOffset, lng + lngOffset);
  }, [dragging, pinPosition, lat, lng, onPinMove]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
      {/* Static map image using OSM tile */}
      <div
        ref={containerRef}
        className="relative w-full h-48 cursor-crosshair select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          backgroundImage: `url(https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=600&height=300&center=lonlat:${lng},${lat}&zoom=15&apiKey=DEMO)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#e5e7eb',
        }}
      >
        {/* Grid pattern fallback when map image doesn't load */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(#9ca3af 1px, transparent 1px), linear-gradient(90deg, #9ca3af 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />

        {/* Street lines simulation */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-gray-500 -translate-y-1/2" />
          <div className="absolute top-0 bottom-0 left-1/2 w-[3px] bg-gray-500 -translate-x-1/2" />
          <div className="absolute top-1/4 left-0 right-0 h-[2px] bg-gray-400" />
          <div className="absolute top-3/4 left-0 right-0 h-[2px] bg-gray-400" />
          <div className="absolute top-0 bottom-0 left-1/4 w-[2px] bg-gray-400" />
          <div className="absolute top-0 bottom-0 left-3/4 w-[2px] bg-gray-400" />
        </div>

        {/* Map label */}
        <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1 text-[10px] text-gray-500 font-medium flex items-center gap-1">
          <Move className="w-3 h-3" />
          Drag pin to adjust location
        </div>

        {/* Draggable Pin */}
        <div
          className={`absolute z-10 -translate-x-1/2 -translate-y-full transition-transform ${
            dragging ? 'scale-125' : 'scale-100'
          }`}
          style={{
            left: `${pinPosition.x}%`,
            top: `${pinPosition.y}%`,
          }}
          onPointerDown={handlePointerDown}
        >
          {/* Pin shadow */}
          <div
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-4 h-1.5 bg-black/20 rounded-full blur-sm transition-all ${
              dragging ? 'w-5 h-2 opacity-30' : ''
            }`}
          />
          <MapPinIcon
            className={`w-8 h-8 drop-shadow-lg transition-colors ${
              dragging ? 'text-brand-600' : 'text-brand-500'
            }`}
            fill="currentColor"
            stroke="white"
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Coordinates display */}
      <div className="px-3 py-2 bg-white text-xs text-gray-400 flex items-center justify-between">
        <span>
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
        <span className="text-gray-300">Tap & drag to reposition</span>
      </div>
    </div>
  );
}
