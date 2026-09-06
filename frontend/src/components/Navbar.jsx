import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, MapPin, HeartHandshake, Shield, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';
import NotificationDropdown from './NotificationDropdown';

export const LanguagePicker = () => {
  const { lang, changeLanguage } = useLanguage();
  return (
    <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-[10px] font-bold">
      <button
        type="button"
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 rounded-lg transition-all ${lang === 'en' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
        title="English"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => changeLanguage('ceb')}
        className={`px-2 py-1 rounded-lg transition-all ${lang === 'ceb' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
        title="Bisaya (Cebuano)"
      >
        BIS
      </button>
      <button
        type="button"
        onClick={() => changeLanguage('fil')}
        className={`px-2 py-1 rounded-lg transition-all ${lang === 'fil' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
        title="Filipino (Tagalog)"
      >
        FIL
      </button>
    </div>
  );
};

export const Navbar = ({ onToggleMobileSidebar, isPublic = false }) => {
  const { user, logout, isResident } = useAuth();
  const { unreadCount } = useNotifications();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // If public view (landing, about, how-it-works, etc.)
  if (isPublic || !user) {
    return (
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 group">
              <Logo size="md" className="group-hover:scale-105 transition-transform" />
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
                  Kasandigan
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    SaaS
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  {t('brand_tagline', 'A community you can rely on')}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <LanguagePicker />
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-emerald-600 px-3 py-2 transition-colors"
              >
                {t('btn_sign_in', 'Sign In')}
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl shadow-sm transition-colors"
              >
                {t('btn_get_started', 'Get Started')}
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Dashboard Top Bar (docked along the top of content, right of sidebar)
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger & breadcrumb/tenant */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileSidebar}
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden transition-colors"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {user?.barangay_details ? (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{user.barangay_details.name}, Maramag</span>
                {user.zone && (
                  <span className="text-slate-400 font-normal hidden sm:inline">
                    • {user.zone}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>{t('maramag_command', 'LGU Maramag Municipal Command Center')}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 hidden sm:inline">
                  Bukidnon
                </span>
              </div>
            )}
          </div>

          {/* Right: Notifications & Quick Profile */}
          <div className="flex items-center gap-3">
            <LanguagePicker />
            <NotificationDropdown />

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-200">
                {user.first_name?.[0] || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {user.full_name}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">
                  {user?.role ? t(`role_${user.role.toLowerCase()}`, user.role.toLowerCase().replace(/_/g, ' ')) : ''}
                </div>
              </div>

              <button
                onClick={handleLogout}
                title={t('btn_sign_out', 'Sign out')}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
