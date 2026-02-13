import { useState } from 'react';
import { Restaurant } from '../types';
import { Clock, Truck, ShoppingBag, MapPin } from 'lucide-react';

interface Props {
  restaurant: Restaurant;
}

export default function RestaurantHeader({ restaurant }: Props) {
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="relative w-full aspect-[16/9] max-h-[320px] overflow-hidden bg-gray-200">
        {!coverLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          loading="lazy"
          onLoad={() => setCoverLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            coverLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Logo */}
        <div className="absolute bottom-4 left-4 md:left-8">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
            {!logoLoaded && <div className="w-full h-full skeleton rounded-full" />}
            <img
              src={restaurant.logo}
              alt={`${restaurant.name} logo`}
              loading="lazy"
              onLoad={() => setLogoLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                logoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>
        </div>

        {/* Restaurant name on cover */}
        <div className="absolute bottom-5 left-28 md:left-36">
          <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
            {restaurant.name}
          </h1>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          {restaurant.isOpen ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-500 text-white shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Open
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-red-500 text-white shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full" />
              Closed — Opens at {restaurant.opensAt}
            </span>
          )}
        </div>
      </div>

      {/* Info Strip */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{restaurant.prepTime}</span>
            </div>

            <div className="w-px h-4 bg-gray-200" />

            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>
                Min. <span className="font-semibold text-gray-800">₺{restaurant.minOrder}</span>
              </span>
            </div>

            <div className="w-px h-4 bg-gray-200" />

            {restaurant.deliveryAvailable && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                <Truck className="w-3.5 h-3.5" />
                Delivery
              </span>
            )}

            {restaurant.pickupAvailable && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-medium">
                <ShoppingBag className="w-3.5 h-3.5" />
                Pick-up
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
