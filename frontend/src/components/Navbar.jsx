import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, MapPin, HeartHandshake, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const Navbar = ({ onToggleMobileSidebar, isPublic = false }) => {
  const { user, logout, isResident } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // If public view (landing, about, how-it-works, etc.)
  if (isPublic || !user) {
    return (
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
                  Kasandigan
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    SaaS
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">A community you can rely on</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-emerald-600 px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl shadow-sm transition-colors"
              >
                Get Started
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
                <span>LGU Maramag Municipal Command Center</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 hidden sm:inline">
                  Bukidnon
                </span>
              </div>
            )}
          </div>

          {/* Right: Notifications & Quick Profile */}
          <div className="flex items-center gap-3">
            <Link
              to={isResident ? "/notifications" : "/staff/announcements"}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-200">
                {user.first_name?.[0] || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {user.full_name}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">
                  {user.role?.toLowerCase().replace(/_/g, ' ')}
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
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
