import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Layers, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Building2,
  Phone,
  Eye,
  Calendar,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { getRemainingTime } from '../components/FoodCard';

export const DonorDashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    claimed: 0,
    picked_up: 0,
    completed: 0,
    expiredOrCancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'claimed', 'completed', 'history'

  const fetchMyDonations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/donations/my-donations');
      if (res.data?.success) {
        setDonations(res.data.donations || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load donor listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const filteredDonations = donations.filter((d) => {
    if (activeTab === 'active') return d.status === 'available';
    if (activeTab === 'claimed') return ['claimed', 'picked_up'].includes(d.status);
    if (activeTab === 'completed') return d.status === 'completed';
    if (activeTab === 'history') return ['cancelled', 'expired'].includes(d.status);
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-forest-900 to-forest-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-white/10 px-3 py-1 rounded-full">
            Donor Operations Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
            Establishment: <strong className="text-white">{user?.organization?.name || 'Kitchen Portal'}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchMyDonations}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
            title="Refresh listings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/donor/create"
            className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-forest-950 font-black rounded-xl shadow-md transition-all text-xs sm:text-sm"
          >
            <PlusCircle className="w-4 h-4 text-forest-950" />
            + Publish Food Surplus
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Active Available
          </span>
          <p className="text-3xl font-black text-forest-800 mt-1">{stats.available}</p>
          <p className="text-xs text-slate-500 mt-1">Ready for pickup claim</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Claimed / In Transit
          </span>
          <p className="text-3xl font-black text-amber-600 mt-1">
            {stats.claimed + stats.picked_up}
          </p>
          <p className="text-xs text-slate-500 mt-1">Coordinating with NGOs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Completed Rescues
          </span>
          <p className="text-3xl font-black text-emerald-600 mt-1">{stats.completed}</p>
          <p className="text-xs text-slate-500 mt-1">Successfully distributed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Expired or Cancelled
          </span>
          <p className="text-3xl font-black text-slate-600 mt-1">{stats.expiredOrCancelled}</p>
          <p className="text-xs text-slate-500 mt-1">Uncollected listings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm">
        {[
          { id: 'active', label: 'Active Listings', count: stats.available },
          { id: 'claimed', label: 'In Coordination (Claimed)', count: stats.claimed + stats.picked_up },
          { id: 'completed', label: 'Completed Rescues', count: stats.completed },
          { id: 'history', label: 'Expired & Cancelled', count: stats.expiredOrCancelled }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-forest-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-forest-950 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Listings Table / Card List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredDonations.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredDonations.map((donation) => {
              const remaining = getRemainingTime(donation.safeCollectionDeadline);

              return (
                <div
                  key={donation._id}
                  className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-forest-900 bg-forest-100 px-2.5 py-0.5 rounded-md">
                        {donation.category}
                      </span>
                      <StatusBadge status={donation.status} />
                      <span className="text-xs font-semibold text-slate-500">
                        {donation.quantity} {donation.unit}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {donation.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1 text-amber-800 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        Deadline: {new Date(donation.safeCollectionDeadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} ({remaining.text})
                      </span>
                      <span>
                        Pickup: {new Date(donation.pickupWindow.start).toLocaleTimeString([], { timeStyle: 'short' })} - {new Date(donation.pickupWindow.end).toLocaleTimeString([], { timeStyle: 'short' })}
                      </span>
                    </div>

                    {/* Claiming NGO note if claimed */}
                    {donation.claimedBy && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>
                            Claimed by <strong>{donation.claimedBy?.organization?.name || donation.claimedBy?.name}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-slate-700">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{donation.claimedBy?.phone}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/donations/${donation._id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </Link>

                    {donation.status === 'available' && (
                      <Link
                        to={`/donor/edit/${donation._id}`}
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-forest-800 bg-forest-50 hover:bg-forest-100 rounded-xl transition-colors"
                      >
                        Edit
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3">
          <p className="text-sm font-semibold text-slate-600">No donations found in this tab.</p>
          <Link
            to="/donor/create"
            className="inline-block px-5 py-2.5 text-xs font-bold text-white bg-forest-800 rounded-xl"
          >
            + Create a New Listing
          </Link>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
