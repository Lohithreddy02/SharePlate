import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Utensils, 
  HeartHandshake, 
  Building2, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  FileText, 
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('donor'); // 'donor' or 'recipient'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Organization fields
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('restaurant');
  const [orgRegNumber, setOrgRegNumber] = useState('');
  const [orgDescription, setOrgDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'recipient') {
      setOrgType('food_bank');
    } else {
      setOrgType('restaurant');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role,
        phone,
        address,
        organization: {
          name: orgName || `${name}'s Organization`,
          type: orgType,
          regNumber: orgRegNumber,
          description: orgDescription
        }
      };

      const user = await register(payload);

      if (user.role === 'recipient') {
        navigate('/recipient/verification');
      } else if (user.role === 'donor') {
        navigate('/donor/dashboard');
      } else {
        navigate('/feed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-forest-900 text-white shadow-lg shadow-forest-900/20 mb-3">
            <Utensils className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Join the SharePlate Network
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Select your account type to begin coordinating or collecting surplus food.
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 gap-3 mb-8 bg-slate-200/60 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => handleRoleChange('donor')}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'donor'
                ? 'bg-white text-forest-900 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Utensils className="w-4 h-4 text-forest-700" />
            <span>Food Donor</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('recipient')}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'recipient'
                ? 'bg-white text-forest-900 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            <span>NGO / Shelter</span>
          </button>
        </div>

        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              {error}
            </div>
          )}

          {/* Role Explanation Note */}
          <div className="mb-6 p-4 rounded-2xl bg-forest-50 border border-forest-100 text-xs text-forest-900 leading-relaxed">
            {role === 'donor' ? (
              <p>
                <strong>Food Donors</strong> can publish surplus food batches, define safe collection windows, track claims, and monitor distribution hand-offs.
              </p>
            ) : (
              <p>
                <strong>NGOs & Community Shelters</strong> can discover and claim surplus food batches. For safety and compliance, new organizations enter a <strong>Pending Verification</strong> queue for admin approval.
              </p>
            )}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Primary Contact Person */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Email & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@kitchen.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password (min 6 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Organization Info */}
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">
                {role === 'donor' ? 'Establishment Information' : 'Organization Details'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder={role === 'donor' ? 'e.g. University North Canteen' : 'e.g. City Food Bank'}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category / Type
                  </label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
                  >
                    {role === 'donor' ? (
                      <>
                        <option value="restaurant">Restaurant / Café</option>
                        <option value="canteen">Hostel / College Canteen</option>
                        <option value="caterer">Event Caterer</option>
                        <option value="other">Bakery / Grocery</option>
                      </>
                    ) : (
                      <>
                        <option value="food_bank">Food Bank</option>
                        <option value="shelter">Community Shelter</option>
                        <option value="ngo">Registered Charity / NGO</option>
                        <option value="community">Community Soup Kitchen</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {role === 'recipient' && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Charity Registration / Tax-Exempt ID
                  </label>
                  <input
                    type="text"
                    required
                    value={orgRegNumber}
                    onChange={(e) => setOrgRegNumber(e.target.value)}
                    placeholder="e.g. 501(c)(3) # 88-124991"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Used by administrators to verify food-handling and charity authenticity.
                  </p>
                </div>
              )}

              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Physical Address / Base Location
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, District, City"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
                />
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description / Food Handling Facilities
                </label>
                <textarea
                  rows={2}
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                  placeholder="e.g. We operate cold-storage vans and distribute warm evening meals to 300+ people daily."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 px-4 bg-forest-800 hover:bg-forest-900 active:bg-forest-950 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-forest-800 hover:underline">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
