import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles, requiresVerification = false }) => {
  const { isAuthenticated, user, loading, isVerifiedRecipient } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-forest-200 border-t-forest-700 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-600">Verifying security credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiresVerification && user.role === 'recipient' && !isVerifiedRecipient) {
    return <Navigate to="/recipient/verification" replace />;
  }

  return children;
};

export default ProtectedRoute;
