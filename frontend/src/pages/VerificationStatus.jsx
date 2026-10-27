import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Hourglass, 
  ShieldAlert, 
  Building2, 
  FileText, 
  RefreshCw, 
  Send,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

export const VerificationStatus = () => {
  const { user, refreshUser } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [orgName, setOrgName] = useState(user?.organization?.name || '');
  const [orgType, setOrgType] = useState(user?.organization?.type || 'food_bank');
  const [regNumber, setRegNumber] = useState(user?.organization?.regNumber || '');
  const [description, setDescription] = useState(user?.organization?.description || '');
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const status = user?.organization?.verificationStatus || 'pending';

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  const handleResubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.put('/auth/profile', {
        phone,
        address,
        organization: {
          name: orgName,
          type: orgType,
          regNumber,
          description
        },
        requestReverification: true
      });

      if (res.data?.success) {
        setSuccessMsg('Verification details successfully re-submitted for administrator review!');
        setEditing(false);
        await refreshUser();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to resubmit verification.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
            Security & Trust
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Organization Verification Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Food rescue integrity: Only vetted, non-profit community shelters are authorized to claim surplus food batches.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Check Live Status
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Primary Status Showcase */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                status === 'approved'
                  ? 'bg-emerald-100 text-emerald-700'
                  : status === 'rejected'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {status === 'approved' ? (
                <ShieldCheck className="w-8 h-8" />
              ) : status === 'rejected' ? (
                <ShieldAlert className="w-8 h-8" />
              ) : (
                <Hourglass className="w-8 h-8 animate-pulse" />
              )}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Current Status
              </p>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={status} size="lg" />
              </div>
            </div>
          </div>

          {status === 'approved' && (
            <Link
              to="/feed"
              className="px-6 py-2.5 bg-forest-800 hover:bg-forest-900 text-white font-bold rounded-xl text-xs shadow-md transition-all"
            >
              Explore & Claim Surplus Food
            </Link>
          )}
        </div>

        {/* Narrative & Details */}
        <div className="pt-6 space-y-4">
          {status === 'pending' && (
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 leading-relaxed space-y-2">
              <h3 className="font-bold text-sm text-amber-900">Application Under Review</h3>
              <p>
                Thank you for applying. A SharePlate system administrator is currently reviewing your charity registration number and food-handling credentials. Once verified, you will be able to claim any food donation across the platform.
              </p>
            </div>
          )}

          {status === 'approved' && (
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 leading-relaxed space-y-2">
              <h3 className="font-bold text-sm text-emerald-900">Verified Organization Partner</h3>
              <p>
                Your organization is fully verified. You have full access to claim surplus food, coordinate pickups, and record distributions in real time.
              </p>
              {user?.organization?.verifiedAt && (
                <p className="text-[11px] text-emerald-800 font-semibold">
                  Verified on: {new Date(user.organization.verifiedAt).toLocaleDateString([], { dateStyle: 'long' })}
                </p>
              )}
            </div>
          )}

          {status === 'rejected' && (
            <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-rose-950 leading-relaxed space-y-3">
              <h3 className="font-bold text-sm text-rose-900">Verification Could Not Be Completed</h3>
              <p>
                The administrator was unable to approve your application. Please review the note below, update your details, and re-submit for review.
              </p>
              {user?.organization?.verificationNotes && (
                <div className="p-3 bg-white rounded-xl border border-rose-200 font-medium text-rose-900">
                  <strong>Admin Feedback:</strong> {user.organization.verificationNotes}
                </div>
              )}
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl text-xs"
              >
                Update Organization Credentials & Re-submit
              </button>
            </div>
          )}

          {/* Current Submitted Credentials Summary */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Submitted Application Credentials
              </h3>
              {!editing && status !== 'approved' && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs font-bold text-forest-700 hover:underline"
                >
                  Edit Information
                </button>
              )}
            </div>

            {!editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-semibold">Organization Name:</span>
                  <span className="font-bold text-slate-800">{user?.organization?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Category Type:</span>
                  <span className="font-bold text-slate-800 capitalize">{user?.organization?.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Registration / Tax ID:</span>
                  <span className="font-bold text-slate-800">{user?.organization?.regNumber || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Contact Phone:</span>
                  <span className="font-bold text-slate-800">{user?.phone}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block font-semibold">Base Address:</span>
                  <span className="font-bold text-slate-800">{user?.address}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block font-semibold">Description & Facilities:</span>
                  <span className="text-slate-700">{user?.organization?.description || 'None provided'}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Category Type
                    </label>
                    <select
                      value={orgType}
                      onChange={(e) => setOrgType(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="food_bank">Food Bank</option>
                      <option value="shelter">Community Shelter</option>
                      <option value="ngo">Registered Charity / NGO</option>
                      <option value="community">Community Soup Kitchen</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Registration / Tax ID
                    </label>
                    <input
                      type="text"
                      required
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Operating Address
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mission & Cold-Storage Facilities Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-200 rounded-xl hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-bold text-white bg-forest-800 rounded-xl hover:bg-forest-900 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Re-submit for Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationStatus;
