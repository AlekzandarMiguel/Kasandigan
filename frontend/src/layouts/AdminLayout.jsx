import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import EmergencyAlertBanner from '../components/EmergencyAlertBanner';
import SystemFooter from '../components/SystemFooter';

export const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col pb-10">
      {/* Sidebar docked permanently to the left, ending above footer */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area filling remaining space to the right */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        <Navbar onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)} />
        <EmergencyAlertBanner />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Full-width fixed bottom footer occupying ALL the bottom space */}
      <SystemFooter />
    </div>
  );
};

export default AdminLayout;
