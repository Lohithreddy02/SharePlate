import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, ShieldAlert, Heart, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-forest-950 text-slate-300 pt-16 pb-12 border-t border-forest-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-forest-900/60">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white font-sans tracking-tight">
                Share<span className="text-emerald-400">Plate</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              SharePlate is a surplus food coordination platform bridging restaurants, canteens, and caterers directly with verified non-governmental organizations and community shelters.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400/90 font-medium pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Real-time Surplus Food Rescue Platform
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/feed" className="hover:text-emerald-400 transition-colors">
                  Surplus Feed
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-emerald-400 transition-colors">
                  Register as Donor
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-emerald-400 transition-colors">
                  Register as NGO / Shelter
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  Account Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Compliance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">
              Food Safety & Trust
            </h4>
            <div className="p-3.5 rounded-xl bg-forest-900/80 border border-forest-800 text-xs text-slate-300 leading-relaxed space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                Safety Disclaimer
              </div>
              <p>
                All food listings display donor-verified preparation times and strict safe collection deadlines. Food must be inspected by recipients at the point of hand-off.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SharePlate. Built for End-Term Software Engineering Project.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>MERN Stack (MongoDB, Express, React, Node.js)</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">Zero Food Waste Initiative</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
