import { useState } from 'react';
import { MapPin, Copy, Check } from 'lucide-react';
import { RestaurantLocation } from '../../types';

interface Props {
  location: RestaurantLocation;
  restaurantName: string;
}

export default function PickupInfo({ location, restaurantName }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(location.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 text-xs font-bold flex items-center justify-center">
          2
        </span>
        Pick-up Location
      </h3>

      {/* Static map */}
      <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
        <div
          className="w-full h-40"
          style={{
            backgroundImage: `url(https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=600&height=250&center=lonlat:${location.lng},${location.lat}&zoom=16&apiKey=DEMO)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#e5e7eb',
          }}
        >
          {/* Grid fallback */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(#9ca3af 1px, transparent 1px), linear-gradient(90deg, #9ca3af 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }} />

          {/* Street lines */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-gray-500 -translate-y-1/2" />
            <div className="absolute top-0 bottom-0 left-1/2 w-[3px] bg-gray-500 -translate-x-1/2" />
          </div>

          {/* Fixed Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10">
            <MapPin
              className="w-8 h-8 text-brand-500 drop-shadow-lg"
              fill="currentColor"
              stroke="white"
              strokeWidth={1.5}
            />
          </div>
        </div>
      </div>

      {/* Address Card */}
      <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{restaurantName}</p>
          <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{location.address}</p>
        </div>
        <button
          onClick={handleCopy}
          className={`flex-shrink-0 p-2 rounded-lg transition-all ${
            copied
              ? 'bg-emerald-100 text-emerald-600'
              : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`}
          title="Copy address"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
