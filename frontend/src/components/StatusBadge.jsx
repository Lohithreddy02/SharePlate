import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  PackageCheck, 
  XCircle, 
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Hourglass
} from 'lucide-react';

export const StatusBadge = ({ status, size = 'sm' }) => {
  const sizeClasses = size === 'lg' ? 'px-3 py-1 text-sm font-semibold' : 'px-2.5 py-0.5 text-xs font-medium';

  switch (status) {
    case 'available':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          Available
        </span>
      );
    case 'claimed':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          Claimed (Pickup Pending)
        </span>
      );
    case 'picked_up':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200 ${sizeClasses}`}>
          <PackageCheck className="w-3.5 h-3.5 text-blue-700" />
          Picked Up (In Transit)
        </span>
      );
    case 'completed':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-forest-100 text-forest-900 border border-forest-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-forest-700" />
          Completed & Distributed
        </span>
      );
    case 'cancelled':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Cancelled
        </span>
      );
    case 'expired':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
          Expired
        </span>
      );
    // Verification statuses
    case 'approved':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 ${sizeClasses}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Verified NGO
        </span>
      );
    case 'pending':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 ${sizeClasses}`}>
          <Hourglass className="w-3.5 h-3.5 text-amber-700" />
          Verification Pending
        </span>
      );
    case 'rejected':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 ${sizeClasses}`}>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          Verification Rejected
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-800 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};

export default StatusBadge;
