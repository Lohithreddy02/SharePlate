import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Unauthorized = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-xs">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 mb-2">
        403 Access Denied
      </span>

      <h1 className="text-3xl font-black text-slate-900 tracking-tight">
        Unauthorized Operation
      </h1>

      <p className="mt-2 text-sm text-slate-600 max-w-md leading-relaxed">
        Your current account role ({user?.role ? `'${user.role}'` : 'Guest'}) does not have permission to access this resource or perform this action.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-forest-800 hover:bg-forest-900 rounded-xl shadow-xs transition-colors"
        >
          <Home className="w-4 h-4" />
          Home Page
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
