import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User as UserIcon, Shield, MapPin, HeartHandshake } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import StatusBadge from './StatusBadge';

export const Navbar = () => {
  const { user, logout, isResident } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to={user ? (isResident ? '/dashboard' : user.role === 'PLATFORM_ADMIN' ? '/platform/dashboard' : user.role === 'BARANGAY_ADMIN' ? '/admin/dashboard' : '/staff/dashboard') : '/'} className="flex items-center gap-2 group">
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

            {/* Tenant indicator badge */}
            {user?.barangay_details && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 text-xs font-semibold ml-4">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{user.barangay_details.name}</span>
                {user.zone && <span className="text-emerald-600 font-normal">({user.zone})</span>}
              </div>
            )}
          </div>

          {/* Right Actions */}
          {user ? (
            <div className="flex items-center gap-3">
              {/* Notification bell for residents & staff */}
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

              {/* User badge */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm border border-emerald-200">
                  {user.first_name?.[0] || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    {user.full_name}
                    {user.verification_status === 'VERIFIED' && (
                      <span className="text-emerald-600" title="Verified Resident">✓</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 capitalize">
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
          ) : (
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
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
