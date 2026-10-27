import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Clock, 
  AlertTriangle, 
  RefreshCw,
  UtensilsCrossed,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import FoodCard from '../components/FoodCard';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'All',
  'Cooked Meals',
  'Bakery & Bread',
  'Fresh Produce',
  'Dairy Products',
  'Packaged Foods',
  'Beverages',
  'Other'
];

const DIETARY_TYPES = ['All', 'Vegetarian', 'Vegan', 'Non-Vegetarian', 'Eggitarian'];

export const DonationFeed = () => {
  const { user, isRecipient, isPendingRecipient, isRejectedRecipient } = useAuth();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDietary, setSelectedDietary] = useState('All');
  const [sortBy, setSortBy] = useState('urgent'); // 'urgent', 'newest', 'quantity_desc'

  const fetchDonations = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedDietary !== 'All') params.append('dietaryType', selectedDietary);
      if (search.trim()) params.append('search', search.trim());
      if (sortBy) params.append('sort', sortBy);

      const res = await api.get(`/donations?${params.toString()}`);
      if (res.data?.success) {
        setDonations(res.data.donations || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load surplus food listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [selectedCategory, selectedDietary, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonations();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Intro */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-100 text-forest-900 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-forest-700" />
            Live Surplus Feed
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Available Surplus Food
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Surplus food batches published by commercial kitchens, college canteens, and bakeries. Excludes expired or cancelled food automatically.
          </p>
        </div>

        <button
          onClick={fetchDonations}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Listings
        </button>
      </div>

      {/* Recipient Verification Warning Banner if Pending/Rejected */}
      {isRecipient && (isPendingRecipient || isRejectedRecipient) && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <p className="font-bold">
                {isPendingRecipient
                  ? 'Your Organization Verification is Pending Review'
                  : 'Your Organization Verification was Not Approved'}
              </p>
              <p className="text-amber-800 mt-0.5">
                You can browse surplus food, but claiming donations requires administrator verification.
              </p>
            </div>
          </div>
          <Link
            to="/recipient/verification"
            className="px-4 py-2 font-bold bg-amber-700 hover:bg-amber-800 text-white rounded-xl whitespace-nowrap shadow-xs"
          >
            Check Verification Status
          </Link>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by food name, description, city, or landmark..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-forest-800 hover:bg-forest-900 text-white font-bold rounded-2xl text-sm shadow-xs transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] shrink-0 mr-1">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-forest-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filters: Dietary & Sort */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">Dietary:</span>
            <select
              value={selectedDietary}
              onChange={(e) => setSelectedDietary(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-forest-600"
            >
              {DIETARY_TYPES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-forest-600"
            >
              <option value="urgent">Most Urgent (Closing Soon)</option>
              <option value="newest">Newest Listed</option>
              <option value="quantity_desc">Largest Quantity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feed Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-96 bg-white rounded-3xl border border-slate-200 p-4 animate-pulse space-y-4">
              <div className="h-44 bg-slate-200 rounded-2xl" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="h-10 bg-slate-200 rounded-xl mt-6" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">{error}</h3>
          <button
            onClick={fetchDonations}
            className="px-5 py-2 text-xs font-bold text-white bg-forest-800 rounded-xl"
          >
            Try Again
          </button>
        </div>
      ) : donations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <FoodCard key={donation._id} donation={donation} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              No Surplus Food Matches Your Filter
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Try adjusting your search criteria, clearing category filters, or check back shortly as food donors list batches around the clock.
            </p>
          </div>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setSelectedDietary('All');
            }}
            className="px-5 py-2 text-xs font-bold text-forest-800 bg-forest-50 hover:bg-forest-100 rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default DonationFeed;
