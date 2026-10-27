import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  Building2, 
  Phone, 
  Mail, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft,
  Calendar,
  Layers,
  Thermometer,
  ShieldAlert,
  Edit,
  Trash2,
  PackageCheck
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import { useAuth } from '../context/AuthContext';
import { getRemainingTime } from '../components/FoodCard';

export const DonationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isDonor, isRecipient, isAdmin, isVerifiedRecipient } = useAuth();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchDonation = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/donations/${id}`);
      if (res.data?.success) {
        setDonation(res.data.donation);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load donation details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonation();
  }, [id]);

  // Workflow B: Claim Donation (Atomic Operation)
  const handleClaim = async () => {
    setActionLoading(true);
    setError('');
    try {
      const res = await api.post(`/donations/${id}/claim`);
      if (res.data?.success) {
        setDonation(res.data.donation);
        setClaimModalOpen(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to claim donation.');
    } finally {
      setActionLoading(false);
    }
  };

  // Workflow C: Mark as Picked Up
  const handlePickup = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/donations/${id}/pickup`);
      if (res.data?.success) {
        setDonation(res.data.donation);
        setPickupModalOpen(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update pickup status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Workflow C: Mark as Completed
  const handleComplete = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/donations/${id}/complete`);
      if (res.data?.success) {
        setDonation(res.data.donation);
        setCompleteModalOpen(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete donation.');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel Donation
  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/donations/${id}/cancel`, { reason: cancelReason });
      if (res.data?.success) {
        setDonation(res.data.donation);
        setCancelModalOpen(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel donation.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-forest-200 border-t-forest-700 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading donation details...</p>
      </div>
    );
  }

  if (error && !donation) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center bg-white rounded-3xl border border-slate-200 mt-8 space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Donation Listing Not Available</h2>
        <p className="text-sm text-slate-600">{error}</p>
        <button
          onClick={() => navigate('/feed')}
          className="px-6 py-2.5 text-xs font-bold text-white bg-forest-800 rounded-xl"
        >
          Return to Surplus Feed
        </button>
      </div>
    );
  }

  if (!donation) return null;

  const remaining = getRemainingTime(donation.safeCollectionDeadline);
  const isOwner = user?._id === donation.donor?._id;
  const isClaimant = user?._id === donation.claimedBy?._id;

  // Status Stepper Index
  const getStepIndex = (status) => {
    switch (status) {
      case 'available': return 1;
      case 'claimed': return 2;
      case 'picked_up': return 3;
      case 'completed': return 4;
      default: return 0; // cancelled / expired
    }
  };

  const currentStep = getStepIndex(donation.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-forest-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Previous Page
      </button>

      {/* Error alert if any action fails */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Hero Image */}
        <div className="relative h-64 sm:h-80 w-full bg-slate-900 overflow-hidden">
          <img
            src={donation.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80'}
            alt={donation.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="px-3 py-1 rounded-xl bg-white/90 backdrop-blur-md text-xs font-bold text-forest-900 shadow-xs">
              {donation.category}
            </span>
            <StatusBadge status={donation.status} size="lg" />
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{donation.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg">
                Quantity: {donation.quantity} {donation.unit}
              </span>
              <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg">
                Dietary: {donation.dietaryType}
              </span>
              <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg">
                Storage: {donation.storageCondition}
              </span>
            </div>
          </div>
        </div>

        {/* Status Lifecycle Stepper */}
        {['available', 'claimed', 'picked_up', 'completed'].includes(donation.status) && (
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <div className="max-w-3xl mx-auto">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">
                Donation Coordination Progress
              </p>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[
                  { step: 1, label: 'Available', desc: 'Listed by Donor' },
                  { step: 2, label: 'Claimed', desc: 'Assigned to NGO' },
                  { step: 3, label: 'Picked Up', desc: 'In Transit' },
                  { step: 4, label: 'Completed', desc: 'Distributed' }
                ].map((s) => {
                  const isDone = currentStep >= s.step;
                  const isCurrent = currentStep === s.step;
                  return (
                    <div key={s.step} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-all ${
                          isDone
                            ? 'bg-forest-800 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-500'
                        } ${isCurrent ? 'ring-4 ring-forest-200' : ''}`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                      </div>
                      <span className={`font-bold text-xs ${isDone ? 'text-forest-900' : 'text-slate-400'}`}>
                        {s.label}
                      </span>
                      <span className="text-[10px] text-slate-500 hidden sm:inline">{s.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Description */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              Food Description & Preparation Notes
            </h3>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed bg-cream-50/70 p-4 rounded-2xl border border-cream-200">
              {donation.description}
            </p>
          </div>

          {/* Time Windows Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Prepared At
              </span>
              <p className="text-sm font-bold text-slate-800">
                {new Date(donation.preparationTime).toLocaleString([], {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                Safe Collection Deadline
              </span>
              <p className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                {new Date(donation.safeCollectionDeadline).toLocaleString([], {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </p>
              <span className="text-[11px] text-amber-800 font-semibold mt-1 block">
                {remaining.text}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Pickup Window
              </span>
              <p className="text-sm font-bold text-slate-800">
                {new Date(donation.pickupWindow.start).toLocaleTimeString([], { timeStyle: 'short' })} –{' '}
                {new Date(donation.pickupWindow.end).toLocaleTimeString([], { timeStyle: 'short' })}
              </p>
              <span className="text-[11px] text-slate-500 block mt-1">
                {new Date(donation.pickupWindow.start).toLocaleDateString([], { dateStyle: 'medium' })}
              </span>
            </div>
          </div>

          {/* Allergens & Safety Notice */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Allergen Disclosure
              </h3>
              {donation.allergens && donation.allergens.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {donation.allergens.map((alg) => (
                    <span
                      key={alg}
                      className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold"
                    >
                      Contains: {alg}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No specific allergens declared by the food donor.</p>
              )}
            </div>

            {/* Food Safety Advisory Notice */}
            <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200 text-xs text-forest-900 leading-relaxed flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-forest-950">Food Safety & Hygiene Protocol</p>
                <p className="mt-0.5 text-forest-800">
                  Surplus food must be collected prior to the safe deadline and transported using appropriate thermal containment (hot boxes or insulated cold transport). Claiming organizations must inspect organoleptic quality upon pickup.
                </p>
              </div>
            </div>
          </div>

          {/* Pickup Address & Donor Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            {/* Donor Establishment */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Food Donor Details
              </h3>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Building2 className="w-4 h-4 text-forest-700" />
                  <span>{donation.donor?.organization?.name || donation.donor?.name}</span>
                </div>
                <p className="text-slate-600 capitalize">
                  Type: {donation.donor?.organization?.type || 'Donor Kitchen'}
                </p>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{donation.pickupAddress?.contactPhone || donation.donor?.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{donation.donor?.email}</span>
                </div>
              </div>
            </div>

            {/* Pickup Location */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Pickup Address & Instructions
              </h3>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {donation.pickupAddress?.street}
                    </p>
                    <p className="text-slate-600">
                      {donation.pickupAddress?.city}
                    </p>
                    {donation.pickupAddress?.landmark && (
                      <p className="text-amber-800 font-semibold mt-1">
                        Landmark: {donation.pickupAddress.landmark}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Claiming NGO Information if claimed */}
          {donation.claimedBy && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Claimed by Verified Organization
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-950">
                <p><strong>Organization:</strong> {donation.claimedBy.organization?.name || donation.claimedBy.name}</p>
                <p><strong>Representative:</strong> {donation.claimedBy.name}</p>
                <p><strong>Phone:</strong> {donation.claimedBy.phone}</p>
                <p><strong>Claimed At:</strong> {new Date(donation.claimedAt).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Audit Trail Timeline */}
          {donation.statusHistory && donation.statusHistory.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Status History & Audit Trail
              </h3>
              <div className="space-y-2 text-xs">
                {donation.statusHistory.map((hist, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="w-2 h-2 rounded-full bg-forest-600 shrink-0 mt-1.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 capitalize">
                          Status updated to '{hist.status}'
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(hist.changedAt).toLocaleString()}
                        </span>
                      </div>
                      {hist.note && <p className="text-slate-600 text-[11px] mt-0.5">{hist.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contextual Action Buttons */}
          <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            {/* Left side actions (Edit / Cancel for Owner or Admin) */}
            <div className="flex items-center gap-3">
              {(isOwner || isAdmin) && donation.status === 'available' && (
                <>
                  <Link
                    to={`/donor/edit/${donation._id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit Listing
                  </Link>

                  <button
                    onClick={() => setCancelModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Cancel Listing
                  </button>
                </>
              )}

              {(isOwner || isAdmin) && donation.status === 'claimed' && (
                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Cancel Claimed Listing
                </button>
              )}
            </div>

            {/* Right side primary action (Claim, Pickup, Complete) */}
            <div className="flex items-center gap-3">
              {/* Recipient Claim Action */}
              {donation.status === 'available' && (
                <>
                  {!isAuthenticated ? (
                    <Link
                      to="/login"
                      className="px-6 py-3 bg-forest-800 hover:bg-forest-900 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                    >
                      Sign In to Claim Food
                    </Link>
                  ) : isRecipient ? (
                    isVerifiedRecipient ? (
                      <button
                        onClick={() => setClaimModalOpen(true)}
                        className="px-7 py-3 bg-forest-800 hover:bg-forest-900 active:bg-forest-950 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all"
                      >
                        Claim This Surplus Food
                      </button>
                    ) : (
                      <Link
                        to="/recipient/verification"
                        className="px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Verification Required to Claim
                      </Link>
                    )
                  ) : null}
                </>
              )}

              {/* Claimant Pickup Action */}
              {donation.status === 'claimed' && (isClaimant || isOwner || isAdmin) && (
                <button
                  onClick={() => setPickupModalOpen(true)}
                  className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <PackageCheck className="w-4 h-4" />
                  Mark as Picked Up (In Transit)
                </button>
              )}

              {/* Claimant Complete Action */}
              {donation.status === 'picked_up' && (isClaimant || isOwner || isAdmin) && (
                <button
                  onClick={() => setCompleteModalOpen(true)}
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Completed / Distributed
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      {/* 1. Claim Modal */}
      <ConfirmationModal
        isOpen={claimModalOpen}
        title="Confirm Surplus Food Claim"
        message={`You are about to claim "${donation.title}" (${donation.quantity} ${donation.unit}) on behalf of ${user?.organization?.name || user?.name}. Your organization pledges to collect the food within the designated pickup window.`}
        confirmText="Confirm & Claim Food"
        isLoading={actionLoading}
        onConfirm={handleClaim}
        onCancel={() => setClaimModalOpen(false)}
      />

      {/* 2. Pickup Modal */}
      <ConfirmationModal
        isOpen={pickupModalOpen}
        title="Confirm Food Collection"
        message="Please confirm that the surplus food has been inspected, accepted, and loaded into transport from the donor's premises."
        confirmText="Confirm Pickup"
        isLoading={actionLoading}
        onConfirm={handlePickup}
        onCancel={() => setPickupModalOpen(false)}
      />

      {/* 3. Complete Modal */}
      <ConfirmationModal
        isOpen={completeModalOpen}
        title="Complete Food Rescue Workflow"
        message="Confirm that the collected food has been successfully delivered, stored, or distributed to community recipients. This marks the donation as completed in platform records."
        confirmText="Complete Donation"
        isLoading={actionLoading}
        onConfirm={handleComplete}
        onCancel={() => setCompleteModalOpen(false)}
      />

      {/* 4. Cancel Modal */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        title="Cancel Donation Listing"
        message="Are you sure you want to cancel this donation? This action will remove the listing and notify any claiming parties."
        confirmText="Yes, Cancel Listing"
        isDanger={true}
        isLoading={actionLoading}
        onConfirm={handleCancel}
        onCancel={() => setCancelModalOpen(false)}
      >
        <div className="mt-3">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Reason for cancellation:
          </label>
          <input
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g. Food spoiled, kitchen emergency, schedule changed"
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default DonationDetail;
