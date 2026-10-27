import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  HeartHandshake, 
  PlusCircle, 
  LayoutDashboard, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  Utensils, 
  Clock, 
  Building2,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isDonor, isRecipient, isAdmin, isVerifiedRecipient } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-forest-900 flex items-center justify-center text-white shadow-md shadow-forest-900/10 group-hover:scale-105 transition-transform duration-200">
              <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-forest-950 font-sans">
                  Share<span className="text-emerald-600">Plate</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-forest-100 text-forest-800 rounded-md">
                  Surplus Food
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                Connecting Surplus Donors with Verified Shelters
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/feed"
              className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-all ${
                isActive('/feed')
                  ? 'bg-forest-100 text-forest-900'
                  : 'text-slate-600 hover:text-forest-900 hover:bg-slate-100'
              }`}
            >
              Browse Surplus Food
            </Link>

            {isAuthenticated && isDonor && (
              <>
                <Link
                  to="/donor/dashboard"
                  className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-all ${
                    isActive('/donor/dashboard')
                      ? 'bg-forest-100 text-forest-900'
                      : 'text-slate-600 hover:text-forest-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4 text-forest-700" />
                    Donor Dashboard
                  </span>
                </Link>
                <Link
                  to="/donor/create"
                  className="ml-2 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-forest-800 hover:bg-forest-900 rounded-xl shadow-sm hover:shadow transition-all"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-300" />
                  Publish Donation
                </Link>
              </>
            )}

            {isAuthenticated && isRecipient && (
              <>
                <Link
                  to="/recipient/claims"
                  className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-all ${
                    isActive('/recipient/claims')
                      ? 'bg-forest-100 text-forest-900'
                      : 'text-slate-600 hover:text-forest-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-forest-700" />
                    My Claims
                  </span>
                </Link>
                <Link
                  to="/recipient/verification"
                  className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-all ${
                    isActive('/recipient/verification')
                      ? 'bg-forest-100 text-forest-900'
                      : 'text-slate-600 hover:text-forest-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-forest-700" />
                    Verification
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isVerifiedRecipient ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'
                      }`}
                    />
                  </span>
                </Link>
              </>
            )}

            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-all ${
                  isActive('/admin')
                    ? 'bg-forest-100 text-forest-900'
                    : 'text-slate-600 hover:text-forest-900 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-forest-700" />
                  Admin Console
                </span>
              </Link>
            )}
          </nav>

          {/* User Profile / Auth Action */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 leading-tight">
                    {user?.name}
                  </p>
                  <p className="text-[11px] font-semibold text-forest-700 capitalize">
                    {user?.role === 'recipient' ? 'NGO Partner' : user?.role} • {user?.organization?.name || 'Account'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-forest-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-forest-800 hover:bg-forest-900 rounded-xl shadow-xs transition-all"
                >
                  Join Platform
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <Link
            to="/feed"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-slate-800 rounded-lg hover:bg-slate-100"
          >
            Browse Surplus Food
          </Link>

          {isAuthenticated ? (
            <>
              {isDonor && (
                <>
                  <Link
                    to="/donor/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-semibold text-slate-800 rounded-lg hover:bg-slate-100"
                  >
                    Donor Dashboard
                  </Link>
                  <Link
                    to="/donor/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-semibold text-white bg-forest-800 rounded-lg text-center"
                  >
                    + Publish Food Listing
                  </Link>
                </>
              )}

              {isRecipient && (
                <>
                  <Link
                    to="/recipient/claims"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-semibold text-slate-800 rounded-lg hover:bg-slate-100"
                  >
                    My Claims
                  </Link>
                  <Link
                    to="/recipient/verification"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-semibold text-slate-800 rounded-lg hover:bg-slate-100"
                  >
                    Organization Verification
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-semibold text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  Admin Console
                </Link>
              )}

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm font-semibold text-rose-600 bg-rose-50 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-forest-800 rounded-xl"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
