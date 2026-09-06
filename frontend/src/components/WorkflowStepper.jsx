import React from 'react';
import { FileText, UserCheck, Navigation, Wrench, CheckCircle, Star } from 'lucide-react';

const STEPS = [
  { id: 'filed', label: 'Request Filed', icon: FileText, desc: 'Citizen posted request' },
  { id: 'assigned', label: 'Helper Assigned', icon: UserCheck, desc: 'Helper matched & confirmed' },
  { id: 'en_route', label: 'Helper En Route', icon: Navigation, desc: 'Traveling to location' },
  { id: 'in_progress', label: 'In Progress', icon: Wrench, desc: 'Assistance taking place' },
  { id: 'completed', label: 'Completed', icon: CheckCircle, desc: 'Proof submitted' },
  { id: 'rated', label: 'Rated & Closed', icon: Star, desc: 'Feedback submitted' },
];

export const WorkflowStepper = ({ status, hasRating = false }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-rose-500" />
        This assistance request was cancelled.
      </div>
    );
  }

  let activeIndex = 0;
  if (status === 'ACCEPTED') activeIndex = 1;
  else if (status === 'EN_ROUTE') activeIndex = 2;
  else if (status === 'IN_PROGRESS') activeIndex = 3;
  else if (status === 'COMPLETED') {
    activeIndex = hasRating ? 5 : 4;
  }

  return (
    <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
        Live Milestone Tracker
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div
              key={step.id}
              className={`p-3 rounded-xl border transition-all flex flex-col items-center text-center relative ${
                isDone
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : isCurrent
                  ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white/60 border-slate-200/80 text-slate-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-emerald-500 text-white animate-pulse'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[11px] font-bold leading-tight ${isCurrent ? 'text-slate-900' : ''}`}>
                {step.label}
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5 leading-tight line-clamp-1">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowStepper;
