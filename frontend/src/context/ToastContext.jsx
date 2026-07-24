import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  const getToastStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-950',
          badge: 'bg-emerald-200/60 text-emerald-800',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
          bg: 'bg-rose-50 border-rose-200 text-rose-950',
          badge: 'bg-rose-200/60 text-rose-800',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
          bg: 'bg-amber-50 border-amber-200 text-amber-950',
          badge: 'bg-amber-200/60 text-amber-800',
        };
      default:
        return {
          icon: <Info className="w-4 h-4 text-blue-600 shrink-0" />,
          bg: 'bg-blue-50 border-blue-200 text-blue-950',
          badge: 'bg-blue-200/60 text-blue-800',
        };
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Stacked Floating Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const style = getToastStyle(t.type);
          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-3.5 rounded-2xl border shadow-xl flex items-start gap-3 transition-all animate-in slide-in-from-bottom-3 duration-200 ${style.bg}`}
            >
              <div className="mt-0.5">{style.icon}</div>
              <div className="flex-1 text-xs font-semibold leading-snug">
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 hover:bg-black/5 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback so any component calling useToast without crashing
    return {
      success: (msg) => console.log('Toast success:', msg),
      error: (msg) => console.error('Toast error:', msg),
      warning: (msg) => console.warn('Toast warning:', msg),
      info: (msg) => console.info('Toast info:', msg),
    };
  }
  return context;
};

export default ToastContext;
