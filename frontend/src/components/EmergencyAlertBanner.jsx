import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, ShieldAlert, X } from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const EmergencyAlertBanner = () => {
  const [alert, setAlert] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchEmergency = async () => {
      try {
        const res = await api.get('/announcements/active-emergency/');
        if (res.data) {
          const dismissedId = sessionStorage.getItem('dismissed_emergency_' + res.data.id);
          if (!dismissedId) {
            setAlert(res.data);
          }
        }
      } catch (err) {
        // Silent catch if no emergency
      }
    };
    fetchEmergency();
    const interval = setInterval(fetchEmergency, 20000);
    return () => clearInterval(interval);
  }, []);

  if (!alert || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('dismissed_emergency_' + alert.id, 'true');
  };

  const levelStyles = {
    WARNING: {
      bg: 'bg-rose-600 text-white border-rose-700',
      badge: 'bg-white text-rose-700',
      icon: <ShieldAlert className="w-5 h-5 animate-pulse text-white shrink-0" />
    },
    WATCH: {
      bg: 'bg-amber-600 text-white border-amber-700',
      badge: 'bg-white text-amber-700',
      icon: <AlertTriangle className="w-5 h-5 text-white shrink-0" />
    },
    ADVISORY: {
      bg: 'bg-indigo-600 text-white border-indigo-700',
      badge: 'bg-white text-indigo-700',
      icon: <AlertCircle className="w-5 h-5 text-white shrink-0" />
    }
  };

  const currentStyle = levelStyles[alert.alert_level] || levelStyles.WARNING;

  return (
    <div className={`w-full px-4 py-3 ${currentStyle.bg} shadow-md border-b flex items-start sm:items-center justify-between gap-3 text-xs sm:text-sm z-50 animate-in fade-in slide-in-from-top-2 duration-300`}>
      <div className="flex items-start sm:items-center gap-2.5 flex-1">
        {currentStyle.icon}
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${currentStyle.badge}`}>
              MDRRMO {alert.alert_level}
            </span>
            <span className="font-bold tracking-tight">{alert.title}</span>
            <span className="text-[11px] opacity-85 hidden md:inline">• LGU Maramag Municipal Command</span>
          </div>
          <p className="text-xs opacity-95 leading-relaxed">{alert.content}</p>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="p-1 hover:bg-black/15 rounded-lg transition-colors text-white shrink-0 mt-0.5 sm:mt-0"
        title="Acknowledge / Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default EmergencyAlertBanner;
