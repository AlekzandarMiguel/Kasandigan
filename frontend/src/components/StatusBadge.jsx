import React from 'react';

const BADGE_STYLES = {
  // Verification
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING_VERIFICATION: 'bg-amber-50 text-amber-700 border-amber-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  SUSPENDED: 'bg-red-50 text-red-700 border-red-200',

  // Assistance status
  PENDING: 'bg-slate-100 text-slate-700 border-slate-200',
  MATCHED: 'bg-sky-50 text-sky-700 border-sky-200',
  ACCEPTED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  EN_ROUTE: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold animate-pulse',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',

  // Urgency
  LOW: 'bg-slate-50 text-slate-600 border-slate-200',
  MEDIUM: 'bg-blue-50 text-blue-600 border-blue-200',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
  EMERGENCY: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',

  // Reports
  UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DISMISSED: 'bg-slate-100 text-slate-600 border-slate-200',

  // Resource status
  AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  BORROWED: 'bg-purple-50 text-purple-700 border-purple-200',
  REQUESTED: 'bg-amber-50 text-amber-700 border-amber-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const LABELS = {
  PENDING_VERIFICATION: 'Pending Verification',
  EN_ROUTE: 'Helper En Route',
  IN_PROGRESS: 'In Progress',
  UNDER_REVIEW: 'Under Review',
};

export const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;
  const key = String(status).toUpperCase();
  const style = BADGE_STYLES[key] || 'bg-slate-100 text-slate-700 border-slate-200';
  const label = LABELS[key] || key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
