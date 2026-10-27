import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Utensils, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Building2, 
  Sparkles, 
  HeartHandshake, 
  Truck, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import FoodCard from '../components/FoodCard';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated, isDonor, isRecipient } = useAuth();
  const [featuredDonations, setFeaturedDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentDonations = async () => {
      try {
        const res = await api.get('/donations?sort=newest');
        if (res.data?.success) {
          setFeaturedDonations(res.data.donations.slice(0, 3));
        }
      } catch (err) {
        console.warn('Could not load sample donations for landing page:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentDonations();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Vision & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-100 text-forest-900 border border-forest-200 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-forest-700" />
                Zero Food Waste Movement
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight font-sans leading-[1.15]">
                Turn Commercial <br />
                <span className="text-forest-800 underline decoration-forest-400 decoration-wavy underline-offset-8">
                  Surplus Food
                </span>{' '}
                into Community Meals.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                SharePlate bridges restaurants, hostel mess halls, canteens, and caterers directly with verified NGOs and shelters before edible food expires.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/feed"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-base font-bold text-white bg-forest-800 hover:bg-forest-900 rounded-2xl shadow-lg shadow-forest-900/15 hover:shadow-xl transition-all"
                >
                  <span>Explore Available Food</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                {!isAuthenticated ? (
                  <Link
                    to="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl shadow-xs transition-all"
                  >
                    Register as Donor / NGO
                  </Link>
                ) : isDonor ? (
                  <Link
                    to="/donor/create"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-bold text-forest-900 bg-forest-100 hover:bg-forest-200 rounded-2xl transition-all"
                  >
                    + Publish Food Listing
                  </Link>
                ) : (
                  <Link
                    to="/recipient/claims"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-bold text-forest-900 bg-forest-100 hover:bg-forest-200 rounded-2xl transition-all"
                  >
                    My Active Pickups
                  </Link>
                )}
              </div>

              {/* Verified Trust Badges */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Admin-Verified NGOs Only</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Safe Expiry Timeframes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-forest-700" />
                  <span>Atomic Race-Free Claiming</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Graphic Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/80">
                <div className="relative h-60 rounded-2xl overflow-hidden mb-5">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                    alt="Wholesome freshly prepared meal surplus"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-forest-900 shadow-xs">
                    Cooked Meals • Hot/Heated
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl text-white flex items-center justify-between text-xs">
                    <span className="font-bold">University Hostel Mess</span>
                    <span className="text-emerald-300 font-semibold">60 Portions Available</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">
                      Steamed Veggie Rice & Lentils
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      Available
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Prepared at 11:30 AM today. Kept in food-grade thermal containers. Suitable for immediate community distribution.
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-amber-700">
                      <Clock className="w-3.5 h-3.5" />
                      Safe window: Today, 5:30 PM
                    </span>
                    <span className="text-forest-700 font-bold">Metro City Gate 3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Illustrative Platform Impact Statistics (Clearly labeled as illustrative) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Coordinated Food Rescue
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
                Our Environmental & Community Impact
              </h2>
              <p className="text-xs text-emerald-200/80 mt-1 italic">
                *(Illustrative example figures representing platform capacity & demonstration metrics)*
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <p className="text-3xl sm:text-4xl font-black text-emerald-400">14,800+</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-1">Meals Rescued</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Example metric</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <p className="text-3xl sm:text-4xl font-black text-amber-300">6,200 kg</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-1">Food Waste Diverted</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Example metric</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <p className="text-3xl sm:text-4xl font-black text-emerald-400">45+</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-1">Commercial Donors</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Restaurants & canteens</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <p className="text-3xl sm:text-4xl font-black text-amber-300">28</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-1">Verified Shelters</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Vetted non-profits</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How SharePlate Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
            Transparent Workflows
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3">
            How SharePlate Coordinates Surplus Food
          </h2>
          <p className="text-base text-slate-600 mt-3">
            From the kitchen counter to the community table in three safe, synchronized steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-900">Donor Publishes Surplus</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Donors input food category, quantity, preparation timestamp, allergen tags, and a strict safe pickup deadline.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-lg">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-900">Verified NGO Claims</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Approved recipient organizations browse available listings and claim them atomically, preventing double-claims.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-900 flex items-center justify-center font-black text-lg">
              3
            </div>
            <h3 className="text-xl font-bold text-slate-900">Fast Pickup & Distribution</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              The recipient collects food within the scheduled window, marks it as picked up, and completes the distribution workflow.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Live Available Food Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
              Live Feed
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">
              Recently Available Surplus
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Food items currently open for collection by verified organizations.
            </p>
          </div>

          <Link
            to="/feed"
            className="inline-flex items-center gap-2 text-sm font-bold text-forest-800 hover:text-forest-950"
          >
            <span>View All Surplus Food</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-slate-200/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : featuredDonations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDonations.map((donation) => (
              <FoodCard key={donation._id} donation={donation} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-600 font-medium">No live donations available right now.</p>
            <Link
              to="/donor/create"
              className="mt-3 inline-block px-5 py-2 text-sm font-bold text-white bg-forest-800 rounded-xl"
            >
              Publish First Donation
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default LandingPage;
