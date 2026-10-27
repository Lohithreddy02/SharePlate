import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  Building2, 
  Layers, 
  AlertCircle,
  Thermometer,
  ArrowRight
} from 'lucide-react';
import StatusBadge from './StatusBadge';

// Helper to calculate human readable remaining time
export const getRemainingTime = (deadline) => {
  const diff = new Date(deadline) - new Date();
  if (diff <= 0) return { text: 'Expired', urgent: true, isExpired: true };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0) {
    return { text: `${minutes}m remaining`, urgent: true, isExpired: false };
  }
  if (hours < 4) {
    return { text: `${hours}h ${minutes}m remaining`, urgent: true, isExpired: false };
  }
  return { text: `${hours}h remaining`, urgent: false, isExpired: false };
};

// Fallback images based on food category
const categoryImages = {
  'Cooked Meals': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  'Bakery & Bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  'Fresh Produce': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  'Dairy Products': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80',
  'Packaged Foods': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
  'Beverages': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
  'Other': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80'
};

export const FoodCard = ({ donation }) => {
  const remaining = getRemainingTime(donation.safeCollectionDeadline);
  const displayImage = donation.imageUrl || categoryImages[donation.category] || categoryImages['Other'];

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-forest-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Card Header & Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={displayImage}
          alt={donation.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white/90 backdrop-blur-md text-forest-900 shadow-xs">
            {donation.category}
          </span>
          <StatusBadge status={donation.status} />
        </div>

        {/* Bottom Image Overlay Badges */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-1.5 font-bold text-sm bg-forest-950/70 backdrop-blur-md px-2.5 py-1 rounded-lg">
            <span>{donation.quantity}</span>
            <span className="text-xs uppercase font-medium text-emerald-300">{donation.unit}</span>
          </div>

          <div
            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-md ${
              remaining.urgent
                ? 'bg-rose-600/90 text-white animate-pulse'
                : 'bg-slate-900/80 text-amber-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{remaining.text}</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Dietary & Storage Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              {donation.dietaryType}
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-slate-400" />
              {donation.storageCondition}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-forest-800 transition-colors">
            {donation.title}
          </h3>

          {/* Description */}
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {donation.description}
          </p>

          {/* Location & Donor */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-forest-600 shrink-0" />
              <span className="font-semibold text-slate-800 truncate">
                {donation.donor?.organization?.name || donation.donor?.name || 'Verified Donor'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {donation.pickupAddress?.city || 'Metro City'}
                {donation.pickupAddress?.landmark ? ` • ${donation.pickupAddress.landmark}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-3">
          <Link
            to={`/donations/${donation._id}`}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-forest-800 hover:bg-forest-900 active:bg-forest-950 rounded-xl shadow-xs group-hover:shadow transition-all"
          >
            <span>View Food Details & Claim</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
