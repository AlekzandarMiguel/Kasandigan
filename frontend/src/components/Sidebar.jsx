import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, HeartHandshake, Wrench, Layers,
  Flag, Megaphone, FileText, Settings, Shield, UserCheck,
  Package, Calendar, Bell, LogOut, CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
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

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 hidden md:flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Navigation
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
