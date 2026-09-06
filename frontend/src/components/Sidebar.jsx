import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, HeartHandshake, Wrench, Layers,
  Flag, Megaphone, FileText, Settings, Shield, UserCheck,
  Package, Calendar, Bell, LogOut, CheckCircle, MapPin, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    if (user?.role === 'PLATFORM_ADMIN') {
      return [
        { to: '/platform/dashboard', label: 'Platform Dashboard', icon: LayoutDashboard },
        { to: '/platform/barangays', label: 'Barangay Tenants', icon: Shield },
        { to: '/platform/users', label: 'User Directory', icon: Users },
        { to: '/platform/reports', label: 'Platform Reports', icon: FileText },
        { to: '/platform/activity-logs', label: 'System Logs', icon: FileText },
      ];
    }

    if (user?.role === 'BARANGAY_ADMIN') {
      return [
        { to: '/admin/dashboard', label: 'Barangay Dashboard', icon: LayoutDashboard },
        { to: '/admin/residents', label: 'Residents', icon: Users },
        { to: '/admin/staff', label: 'Barangay Staff', icon: UserCheck },
        { to: '/admin/requests', label: 'Assistance Requests', icon: HeartHandshake },
        { to: '/admin/skills', label: 'Skills & Categories', icon: Wrench },
        { to: '/admin/reports', label: 'Resident Reports', icon: Flag },
        { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
        { to: '/admin/activity-logs', label: 'Activity Logs', icon: FileText },
      ];
    }

    if (user?.role === 'BARANGAY_STAFF') {
      return [
        { to: '/staff/dashboard', label: 'Staff Dashboard', icon: LayoutDashboard },
        { to: '/staff/verifications', label: 'Resident Verifications', icon: UserCheck },
        { to: '/staff/requests', label: 'Community Requests', icon: HeartHandshake },
        { to: '/staff/reports', label: 'Triage Reports', icon: Flag },
        { to: '/staff/announcements', label: 'Barangay Notices', icon: Megaphone },
      ];
    }

    // Resident
    return [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/requests', label: 'Assistance Requests', icon: HeartHandshake },
      { to: '/assistance', label: 'My Assistance Activity', icon: CheckCircle },
      { to: '/skills', label: 'Skills & Availability', icon: Wrench },
      { to: '/resources', label: 'Community Resources', icon: Package },
      { to: '/notifications', label: 'Notifications', icon: Bell },
      { to: '/settings', label: 'Profile & Settings', icon: Settings },
    ];
  };

  const links = getLinks();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Sidebar Header with Logo */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Link
          to={user?.role === 'PLATFORM_ADMIN' ? '/platform/dashboard' : user?.role === 'BARANGAY_ADMIN' ? '/admin/dashboard' : user?.role === 'BARANGAY_STAFF' ? '/staff/dashboard' : '/dashboard'}
          className="flex items-center gap-3 group"
          onClick={() => setMobileOpen && setMobileOpen(false)}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-extrabold text-lg text-slate-900 leading-none">
              Kasandigan
              <span className="text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                SaaS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">A community you can rely on</p>
          </div>
        </Link>

        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tenant Indicator if assigned */}
      {user?.barangay_details && (
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{user.barangay_details.name}</span>
          </div>
          {user.zone && (
            <div className="text-[11px] text-slate-400 pl-5.5 font-medium">{user.zone}</div>
          )}
        </div>
      )}

      {/* Navigation Links */}
      <div className="p-3 flex-1 overflow-y-auto space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
          Menu
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-200 shrink-0">
            {user?.first_name?.[0] || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-900 truncate">
              {user?.full_name}
            </div>
            <div className="text-[10px] text-slate-400 capitalize truncate">
              {user?.role?.toLowerCase().replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 z-40 hidden md:block">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 max-w-[80vw] z-10 h-full shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
