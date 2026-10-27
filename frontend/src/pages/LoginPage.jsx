import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Utensils, Lock, Mail, AlertCircle, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const isSessionExpired = searchParams.get('expired') === 'true';

  const redirectAfterLogin = (user) => {
    const from = location.state?.from?.pathname;
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }

    if (user.role === 'admin') navigate('/admin');
    else if (user.role === 'donor') navigate('/donor/dashboard');
    else navigate('/feed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      redirectAfterLogin(loggedUser);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPassword) => {
    setError('');
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);

    try {
      const loggedUser = await login(demoEmail, demoPassword);
      redirectAfterLogin(loggedUser);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-forest-900 text-white shadow-lg shadow-forest-900/20 mb-4">
          <Utensils className="w-7 h-7 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Sign In to SharePlate
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Access your food donor portal or verified organization claims feed.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200">
          {/* Session Expired / Error Banner */}
          {isSessionExpired && !error && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              Your previous session has expired. Please log in again to continue.
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              {error}
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.org"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-forest-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-forest-800 hover:bg-forest-900 active:bg-forest-950 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Demo Accounts Selector */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1-Click Demo Accounts
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                For Fast Evaluation
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('donor@greenleaf.com', 'Donor@123')}
                className="w-full p-2.5 rounded-xl bg-forest-50/80 hover:bg-forest-100/90 text-forest-900 border border-forest-200 font-semibold flex items-center justify-between transition-colors"
              >
                <span>Chef Marcus • Green Leaf Bistro</span>
                <span className="text-[10px] bg-forest-200/80 px-2 py-0.5 rounded text-forest-950">Food Donor</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('ngo@cityrescue.org', 'Ngo@123')}
                className="w-full p-2.5 rounded-xl bg-emerald-50/80 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 font-semibold flex items-center justify-between transition-colors"
              >
                <span>David Chen • City Food Rescue</span>
                <span className="text-[10px] bg-emerald-200 px-2 py-0.5 rounded text-emerald-900 font-bold">Verified NGO</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@shareplate.org', 'Admin@123')}
                className="w-full p-2.5 rounded-xl bg-purple-50/80 hover:bg-purple-100 text-purple-950 border border-purple-200 font-semibold flex items-center justify-between transition-colors"
              >
                <span>System Administrator</span>
                <span className="text-[10px] bg-purple-200 px-2 py-0.5 rounded text-purple-900">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('hope@shelter.org', 'Ngo@123')}
                className="w-full p-2.5 rounded-xl bg-amber-50/80 hover:bg-amber-100 text-amber-950 border border-amber-200 font-semibold flex items-center justify-between transition-colors"
              >
                <span>Sarah Jenkins • Hope Shelter</span>
                <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded text-amber-900">Pending NGO</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-forest-800 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
