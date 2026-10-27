import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  Utensils, 
  Hourglass, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Search,
  Eye,
  Trash2,
  Lock,
  Unlock,
  Building2,
  FileText
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications', 'users', 'donations'
  const [loading, setLoading] = useState(true);

  // Tab 1: Verifications State
  const [verifications, setVerifications] = useState([]);
  const [verificationFilter, setVerificationFilter] = useState('pending'); // 'pending', 'approved', 'rejected', ''
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Tab 2: Users State
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  // Tab 3: Donations State
  const [donationsList, setDonationsList] = useState([]);
  const [donationStatusFilter, setDonationStatusFilter] = useState('');

  // General Error / Success
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/admin/metrics');
      if (res.data?.success) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    }
  };

  const fetchVerifications = async () => {
    try {
      const query = verificationFilter ? `?status=${verificationFilter}` : '';
      const res = await api.get(`/admin/verifications${query}`);
      if (res.data?.success) {
        setVerifications(res.data.organizations || []);
      }
    } catch (err) {
      console.error('Failed to load verification requests:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (userRoleFilter) params.append('role', userRoleFilter);
      if (userSearch.trim()) params.append('search', userSearch.trim());
      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data?.success) {
        setUsersList(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users list:', err);
    }
  };

  const fetchDonations = async () => {
    try {
      const query = donationStatusFilter ? `?status=${donationStatusFilter}` : '';
      const res = await api.get(`/admin/donations${query}`);
      if (res.data?.success) {
        setDonationsList(res.data.donations || []);
      }
    } catch (err) {
      console.error('Failed to load donations for admin:', err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    setError('');
    await fetchMetrics();
    if (activeTab === 'verifications') await fetchVerifications();
    if (activeTab === 'users') await fetchUsers();
    if (activeTab === 'donations') await fetchDonations();
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, [activeTab, verificationFilter, userRoleFilter, donationStatusFilter]);

  // Handle Verification Review
  const handleOpenReview = (org, decision) => {
    setSelectedOrg(org);
    setReviewDecision(decision);
    setReviewNotes(
      decision === 'approved'
        ? 'Verified authentic charity registration and food storage safety compliance.'
        : 'Missing required 501(c)(3) tax exemption documentation.'
    );
    setReviewModalOpen(true);
  };

  const submitVerificationReview = async () => {
    if (!selectedOrg) return;
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.patch(`/admin/verifications/${selectedOrg._id}`, {
        status: reviewDecision,
        notes: reviewNotes
      });

      if (res.data?.success) {
        setSuccess(`Organization successfully marked as ${reviewDecision}!`);
        setReviewModalOpen(false);
        await fetchVerifications();
        await fetchMetrics();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update verification status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle User Suspension Toggle
  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/status`);
      if (res.data?.success) {
        fetchUsers();
        fetchMetrics();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle user status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-forest-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-forest-900">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-forest-900/80 px-3 py-1 rounded-full">
            Platform Administration & Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">
            SharePlate Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Oversee organization vetting, platform moderation, and rescue metrics.
          </p>
        </div>

        <button
          onClick={refreshAll}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* High-level Platform Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Pending NGO Reviews
          </span>
          <div className="flex items-center justify-between mt-1">
            <p className="text-3xl font-black text-amber-600">
              {metrics?.users?.pendingVerifications || 0}
            </p>
            {(metrics?.users?.pendingVerifications || 0) > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">Shelters awaiting approval</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Users
          </span>
          <p className="text-3xl font-black text-forest-900 mt-1">
            {metrics?.users?.total || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {metrics?.users?.donors || 0} donors • {metrics?.users?.recipients || 0} NGOs
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Active Food Listings
          </span>
          <p className="text-3xl font-black text-emerald-600 mt-1">
            {metrics?.donations?.available || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {metrics?.donations?.claimed || 0} claimed • {metrics?.donations?.pickedUp || 0} in transit
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Completed Rescues
          </span>
          <p className="text-3xl font-black text-forest-800 mt-1">
            {metrics?.donations?.completed || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {metrics?.donations?.total || 0} total all-time listings
          </p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-5 py-2.5 font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'verifications'
              ? 'bg-forest-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Organization Verification Queue</span>
          {metrics?.users?.pendingVerifications > 0 && (
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-400 text-amber-950 font-black">
              {metrics.users.pendingVerifications}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2.5 font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-forest-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Moderation</span>
        </button>

        <button
          onClick={() => setActiveTab('donations')}
          className={`px-5 py-2.5 font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'donations'
              ? 'bg-forest-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Donation Oversight</span>
        </button>
      </div>

      {/* TAB 1: Organization Verification Queue */}
      {activeTab === 'verifications' && (
        <div className="space-y-6">
          {/* Sub-filters for verification status */}
          <div className="flex items-center gap-2 text-xs">
            {['pending', 'approved', 'rejected', ''].map((st) => (
              <button
                key={st || 'all'}
                onClick={() => setVerificationFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl font-bold capitalize transition-all ${
                  verificationFilter === st
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {st ? `${st} Requests` : 'All Organizations'}
              </button>
            ))}
          </div>

          {/* List of Applications */}
          {verifications.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {verifications.map((org) => {
                const orgStatus = org.organization?.verificationStatus || 'pending';

                return (
                  <div
                    key={org._id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 capitalize">
                          {org.organization?.type || 'NGO'}
                        </span>
                        <StatusBadge status={orgStatus} />
                        <span className="text-xs text-slate-400">
                          Applied: {new Date(org.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900">
                        {org.organization?.name || org.name}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                        <p><strong>Primary Contact:</strong> {org.name} ({org.phone})</p>
                        <p><strong>Email:</strong> {org.email}</p>
                        <p><strong>Registration ID:</strong> {org.organization?.regNumber || 'None provided'}</p>
                        <p><strong>Location:</strong> {org.address}</p>
                      </div>

                      {org.organization?.description && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <strong>Mission & Facilities:</strong> {org.organization.description}
                        </p>
                      )}

                      {org.organization?.verificationNotes && (
                        <p className="text-xs text-slate-500 italic">
                          <strong>Review Notes:</strong> {org.organization.verificationNotes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenReview(org, 'approved')}
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve NGO
                      </button>

                      <button
                        onClick={() => handleOpenReview(org, 'rejected')}
                        className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject Request
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
              <p className="text-sm font-semibold text-slate-600">
                No organization applications found matching this filter.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: User Moderation */}
      {activeTab === 'users' && (
        <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pb-4 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by name, email, or org..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-full sm:w-64"
              />
              <button
                onClick={fetchUsers}
                className="px-4 py-2 font-bold bg-slate-800 text-white rounded-xl"
              >
                Search
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500">Role:</span>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="">All Roles</option>
                <option value="donor">Food Donor</option>
                <option value="recipient">NGO / Recipient</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">User / Organization</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-slate-500">{u.organization?.name || 'Individual'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <p>{u.email}</p>
                      <p>{u.phone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u._id)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                            u.status === 'active'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend User' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Donation Oversight */}
      {activeTab === 'donations' && (
        <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 text-xs">
            <h3 className="font-bold text-slate-800">Platform Food Listings Audit</h3>
            <select
              value={donationStatusFilter}
              onChange={(e) => setDonationStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="claimed">Claimed</option>
              <option value="picked_up">Picked Up</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Food Title & Donor</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donationsList.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{d.title}</p>
                      <p className="text-slate-500">{d.donor?.organization?.name || d.donor?.name}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {d.quantity} {d.unit}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {d.claimedBy ? (
                        <span className="font-semibold text-emerald-800">
                          {d.claimedBy?.organization?.name || d.claimedBy?.name}
                        </span>
                      ) : (
                        <span className="text-slate-400">Unclaimed</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/donations/${d._id}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                      >
                        View Full Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verification Review Modal */}
      <ConfirmationModal
        isOpen={reviewModalOpen}
        title={`${reviewDecision === 'approved' ? 'Approve' : 'Reject'} Organization Verification`}
        message={`You are updating the verification status of ${selectedOrg?.organization?.name || selectedOrg?.name} to '${reviewDecision}'.`}
        confirmText={`Confirm ${reviewDecision === 'approved' ? 'Approval' : 'Rejection'}`}
        isDanger={reviewDecision === 'rejected'}
        isLoading={actionLoading}
        onConfirm={submitVerificationReview}
        onCancel={() => setReviewModalOpen(false)}
      >
        <div className="space-y-2 mt-4 text-xs">
          <label className="block font-bold text-slate-700">
            Reviewer Evaluation Notes:
          </label>
          <textarea
            rows={3}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default AdminDashboard;
