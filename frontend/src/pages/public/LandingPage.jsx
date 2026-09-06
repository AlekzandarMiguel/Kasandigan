import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HeartHandshake, ShieldCheck, Users, Search, CheckCircle2,
  Package, Star, ArrowRight, Sparkles, Building2, UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (email, role) => {
    try {
      await login(email, 'Password123!');
      if (role === 'PLATFORM_ADMIN') navigate('/platform/dashboard');
      else if (role === 'BARANGAY_ADMIN') navigate('/admin/dashboard');
      else if (role === 'BARANGAY_STAFF') navigate('/staff/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      console.error(err);
      navigate('/login');
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-6 shadow-xs border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Municipality of Maramag, Bukidnon • 20 Barangays Assistance Network</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            A community you can <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy decoration-2">rely on</span>.
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with verified neighbors across all 20 barangays of Maramag, Bukidnon who can help, share practical skills, and lend household tools — through a transparent, rule-based matching system.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-14">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              <span>Join Your Barangay in Maramag</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/how-it-works"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all"
            >
              How It Works
            </Link>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-md p-6 text-left">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Instant Interactive Demo Accounts (Maramag, Bukidnon)
                </h3>
                <p className="text-xs text-slate-500">Click any role below to test the platform instantly (Password: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">Password123!</code>)</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <button
                onClick={() => handleQuickLogin('platform.admin@kasandigan.gov.ph', 'PLATFORM_ADMIN')}
                className="p-3 text-left rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 transition-all text-xs"
              >
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Platform Admin
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">LGU Maramag Command</div>
              </button>

              <button
                onClick={() => handleQuickLogin('admin.southpoblacion@kasandigan.gov.ph', 'BARANGAY_ADMIN')}
                className="p-3 text-left rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 transition-all text-xs"
              >
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Brgy Admin
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">South Poblacion</div>
              </button>

              <button
                onClick={() => handleQuickLogin('staff.southpoblacion@kasandigan.gov.ph', 'BARANGAY_STAFF')}
                className="p-3 text-left rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 transition-all text-xs"
              >
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-teal-600" /> Brgy Staff
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">Verification & Triage</div>
              </button>

              <button
                onClick={() => handleQuickLogin('admin.musuan@kasandigan.gov.ph', 'BARANGAY_ADMIN')}
                className="p-3 text-left rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 transition-all text-xs"
              >
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" /> Brgy Admin
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">Musuan (CMU)</div>
              </button>

              <button
                onClick={() => handleQuickLogin('maria.santos@example.com', 'RESIDENT')}
                className="p-3 text-left rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 transition-all text-xs"
              >
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-600" /> Maria (Requester)
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">Purok 2 Centro</div>
              </button>

              <button
                onClick={() => handleQuickLogin('juan.delacruz@example.com', 'RESIDENT')}
                className="p-3 text-left rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 transition-all text-xs"
              >
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-600" /> Juan (Helper)
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">4.9★ IT Helper</div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Simple & Trustworthy</h2>
          <h3 className="text-3xl font-extrabold text-slate-900">How Kasandigan Works</h3>
          <p className="text-slate-500 max-w-xl mx-auto mt-2 text-sm">Empowering residents to support one another in 5 transparent steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            { step: '01', title: 'Create Account', desc: 'Register with your name, zone, and barangay hall verification.' },
            { step: '02', title: 'Request or Offer Help', desc: 'Post an assistance need or list skills you can share.' },
            { step: '03', title: 'Rule-Based Matching', desc: 'Deterministic scoring ranks helpers by skill, zone, and schedule.' },
            { step: '04', title: 'Complete Assistance', desc: 'Helper accepts invitation and marks assistance completed.' },
            { step: '05', title: 'Build Community Trust', desc: 'Leave a verified rating and review to reinforce barangay trust.' }
          ].map((item, idx) => (
            <div key={idx} className="relative p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
              <div className="text-3xl font-black text-emerald-600/30 mb-3">{item.step}</div>
              <h4 className="text-base font-bold text-slate-900 mb-2">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Platform Capabilities</h2>
            <h3 className="text-3xl font-extrabold">Built Specifically for Philippine Barangays</h3>
            <p className="text-slate-400 text-sm mt-3">Logical tenant isolation ensures each community’s data remains private and secure.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white">Rule-Based Matching (No AI)</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Deterministic scoring out of 100 points: Skill Match (+50), Same Barangay (+20), Same Zone (+15), Availability (+10), and Rating (+5). Transparent explanations for every recommendation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white">Barangay Tenant Isolation</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Each barangay operates as an independent tenant. Resident profiles, assistance transactions, and announcements never cross municipal or barangay borders without authorization.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white">Community Resource Lending</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Share and borrow community ladders, drills, folding chairs, and gardening equipment with clear return tracking and owner approval workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-50/80 rounded-3xl p-8 sm:p-12 border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-200/60 text-emerald-900 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Trust & Accountability</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Community safety is our primary foundation.
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Every resident is verified by their local barangay hall staff. Contact details and exact home coordinates are never publicly exposed. With post-assistance ratings, active moderation, and user blocking, Kasandigan creates a safe digital space for mutual aid.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link
              to="/register"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors text-center"
            >
              Register Now
            </Link>
            <Link
              to="/about"
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-200 transition-colors text-center"
            >
              Read Safety Policies
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
