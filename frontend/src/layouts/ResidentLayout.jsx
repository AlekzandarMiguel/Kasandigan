import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import EmergencyAlertBanner from '../components/EmergencyAlertBanner';
import { LayoutDashboard, HeartHandshake, CheckCircle, Package, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ResidentLayout = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex pb-16 md:pb-0">
      {/* Sidebar docked permanently to the left */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area filling remaining space to the right */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        <Navbar onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)} />
        <EmergencyAlertBanner />

        {/* Verification Banner if pending */}
        {user?.verification_status === 'PENDING_VERIFICATION' && (
          <div className="bg-amber-500 text-white px-4 py-2 text-xs sm:text-sm font-medium text-center shadow-xs">
            Your account is currently <span className="font-bold underline">Pending Barangay Verification</span>. Once verified by your barangay hall staff, you can participate in all assistance transactions.
          </div>
        )}

        {user?.verification_status === 'REJECTED' && (
          <div className="bg-rose-600 text-white px-4 py-2 text-xs sm:text-sm font-medium text-center">
            Your resident account verification was rejected. Reason: {user.verification_notes || 'Please visit your barangay hall.'}
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-30 md:hidden flex justify-around py-2 px-1 shadow-md">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center text-[10px] font-medium px-2 py-1 ${
              isActive ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/requests"
          className={({ isActive }) =>
            `flex flex-col items-center text-[10px] font-medium px-2 py-1 ${
              isActive ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <HeartHandshake className="w-5 h-5 mb-0.5" />
          <span>Requests</span>
        </NavLink>
        <NavLink
          to="/assistance"
          className={({ isActive }) =>
            `flex flex-col items-center text-[10px] font-medium px-2 py-1 ${
              isActive ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <CheckCircle className="w-5 h-5 mb-0.5" />
          <span>Assistance</span>
        </NavLink>
        <NavLink
          to="/resources"
          className={({ isActive }) =>
            `flex flex-col items-center text-[10px] font-medium px-2 py-1 ${
              isActive ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span>Resources</span>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center text-[10px] font-medium px-2 py-1 ${
              isActive ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default ResidentLayout;
