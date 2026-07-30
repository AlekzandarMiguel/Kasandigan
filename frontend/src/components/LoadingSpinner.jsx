import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
      <span className="text-sm font-medium text-slate-500">{text}</span>
    </div>
  );
};

export const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm animate-pulse space-y-3">
    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
    <div className="h-6 bg-slate-200 rounded w-3/4"></div>
    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
  </div>
);

export default LoadingSpinner;
