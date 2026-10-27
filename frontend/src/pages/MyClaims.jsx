import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  Building2, 
  Phone, 
  PackageCheck, 
  CheckCircle2, 
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import { getRemainingTime } from '../components/FoodCard';

export const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState({ total: 0, activeClaims: 0, pickedUp: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('active'); // 'active', 'picked_up', 'completed', 'all'

  // Modal actions
  const [activeItem, setActiveItem] = useState(null);
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await api.get('/donations/my-claims');
      if (res.data?.success) {
        setClaims(res.data.claims || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load recipient claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handlePickupConfirm = async () => {
    if (!activeItem) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/donations/${activeItem._id}/pickup`);
      if (res.data?.success) {
        setPickupModalOpen(false);
        setActiveItem(null);
        fetchClaims();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update pickup status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteConfirm = async () => {
    if (!activeItem) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/donations/${activeItem._id}/complete`);
      if (res.data?.success) {
        setCompleteModalOpen(false);
        setActiveItem(null);
        fetchClaims();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete donation.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredClaims = claims.filter((c) => {
    if (filterTab === 'active') return c.status === 'claimed';
    if (filterTab === 'picked_up') return c.status === 'picked_up';
    if (filterTab === 'completed') return c.status === 'completed';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
            Recipient Coordination
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            My Claimed Surplus Donations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track and coordinate food collections, in-transit deliveries, and completed meal distributions.
          </p>
        </div>

        <button
          onClick={fetchClaims}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Claims
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Pending Collection
          </span>
          <p className="text-3xl font-black text-amber-600 mt-1">{stats.activeClaims}</p>
          <p className="text-xs text-slate-500 mt-1">Must be collected within window</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            In Transit (Picked Up)
          </span>
          <p className="text-3xl font-black text-blue-600 mt-1">{stats.pickedUp}</p>
          <p className="text-xs text-slate-500 mt-1">Loaded for distribution</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Completed Rescues
          </span>
          <p className="text-3xl font-black text-emerald-600 mt-1">{stats.completed}</p>
          <p className="text-xs text-slate-500 mt-1">Safely delivered to community</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'active', label: 'Pending Pickup', count: stats.activeClaims },
          { id: 'picked_up', label: 'In Transit', count: stats.pickedUp },
          { id: 'completed', label: 'Completed', count: stats.completed },
          { id: 'all', label: 'All History', count: stats.total }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              filterTab === tab.id
                ? 'bg-forest-800 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                filterTab === tab.id ? 'bg-forest-950 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Claims List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-32 bg-white rounded-3xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredClaims.length > 0 ? (
        <div className="space-y-4">
          {filteredClaims.map((claim) => {
            const remaining = getRemainingTime(claim.safeCollectionDeadline);

            return (
              <div
                key={claim._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-forest-100 text-forest-900">
                      {claim.category}
                    </span>
                    <StatusBadge status={claim.status} />
                    <span className="text-xs font-bold text-slate-700">
                      {claim.quantity} {claim.unit}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {claim.title}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-forest-700 shrink-0" />
                      <span className="font-semibold">{claim.donor?.organization?.name || claim.donor?.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-forest-700 shrink-0" />
                      <span>{claim.pickupAddress?.contactPhone || claim.donor?.phone}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                      <span>{claim.pickupAddress?.street}, {claim.pickupAddress?.city}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold text-amber-800">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Safe Deadline: {remaining.text}</span>
                    </div>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  <Link
                    to={`/donations/${claim._id}`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Details
                  </Link>

                  {claim.status === 'claimed' && (
                    <button
                      onClick={() => {
                        setActiveItem(claim);
                        setPickupModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors"
                    >
                      <PackageCheck className="w-4 h-4" />
                      Mark Picked Up
                    </button>
                  )}

                  {claim.status === 'picked_up' && (
                    <button
                      onClick={() => {
                        setActiveItem(claim);
                        setCompleteModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3">
          <p className="text-sm font-semibold text-slate-600">No claimed donations found in this tab.</p>
          <Link
            to="/feed"
            className="inline-block px-5 py-2.5 text-xs font-bold text-white bg-forest-800 rounded-xl"
          >
            Explore Available Food to Claim
          </Link>
        </div>
      )}

      {/* Modals */}
      <ConfirmationModal
        isOpen={pickupModalOpen}
        title="Confirm Pickup of Food Batch"
        message={`Confirm that your organization has collected "${activeItem?.title}" from the donor's premises.`}
        confirmText="Confirm Pickup"
        isLoading={actionLoading}
        onConfirm={handlePickupConfirm}
        onCancel={() => setPickupModalOpen(false)}
      />

      <ConfirmationModal
        isOpen={completeModalOpen}
        title="Mark Food Rescue as Completed"
        message={`Confirm that "${activeItem?.title}" has been successfully distributed to community recipients.`}
        confirmText="Complete Rescue"
        isLoading={actionLoading}
        onConfirm={handleCompleteConfirm}
        onCancel={() => setCompleteModalOpen(false)}
      />
    </div>
  );
};

export default MyClaims;
