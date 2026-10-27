import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Home, Search } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-500 flex items-center justify-center mb-4">
        <UtensilsCrossed className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full mb-2">
        404 Not Found
      </span>

      <h1 className="text-3xl font-black text-slate-900 tracking-tight">
        Plate Not Found
      </h1>

      <p className="mt-2 text-sm text-slate-600 max-w-md leading-relaxed">
        The page you are looking for does not exist or may have been relocated.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Link
          to="/feed"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          <Search className="w-4 h-4" />
          Browse Surplus Food
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-forest-800 hover:bg-forest-900 rounded-xl shadow-xs transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
