import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Logo from '../components/Logo';
import { HeartHandshake } from 'lucide-react';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar isPublic={true} />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5 text-white font-extrabold text-lg">
                <Logo size="sm" />
                <span>Kasandigan</span>
              </div>
              <p className="text-sm text-slate-400 italic font-medium">
                “A community you can rely on.”
              </p>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                A secure multi-tenant SaaS platform empowering Philippine barangays to request and offer assistance, match skills deterministically, share community resources, and cultivate trust.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Quick Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
                <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About the Platform</Link></li>
                <li><Link to="/how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Access Portal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Resident Registration</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} Kasandigan SaaS. Designed for Philippine Local Government Units.</p>
            <p className="mt-2 sm:mt-0">Rule-Based Matching • Transparent • Logically Isolated</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
