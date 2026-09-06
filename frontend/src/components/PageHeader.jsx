import React from 'react';

/**
 * Standardized PageHeader component for Kasandigan SaaS.
 * Enforces consistent visual hierarchy, badge styling, typography, and action layout across all pages.
 */
export const PageHeader = ({
  icon: Icon,
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  actions,
  theme = 'emerald', // 'emerald' | 'indigo' | 'slate' | 'teal'
}) => {
  const themeClasses = {
    emerald: 'bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 border-emerald-800/40',
    indigo: 'bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border-indigo-900/40',
    slate: 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700/40',
    teal: 'bg-gradient-to-r from-teal-800 via-emerald-900 to-slate-900 border-teal-800/40',
  }[theme] || 'bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 border-emerald-800/40';

  return (
    <div className={`text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border ${themeClasses}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2 max-w-2xl">
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold backdrop-blur-xs">
              {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5 text-emerald-300" />}
              <span>{badge}</span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            {Icon && <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400 shrink-0" />}
            <span>{title}</span>
          </h1>
          {description && (
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
