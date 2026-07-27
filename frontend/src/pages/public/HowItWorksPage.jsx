import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, Search, HeartHandshake, CheckCircle, Star, ArrowRight, ShieldCheck } from 'lucide-react';

export const HowItWorksPage = () => {
  const steps = [
    {
      num: '1',
      title: 'Barangay Registration & Verification',
      desc: 'Register under your specific barangay and zone. Your barangay hall administrators or staff review residency records and approve your verified status.',
      icon: UserCheck,
    },
    {
      num: '2',
      title: 'Post a Request or Offer Skills',
      desc: 'Create an assistance request with category, date, and urgency, or configure your helper profile with offered skills and weekly schedule availability.',
      icon: HeartHandshake,
    },
    {
      num: '3',
      title: 'Deterministic Rule-Based Matching',
      desc: 'Our engine instantly ranks verified helpers based on skill relevance, zone proximity, time availability, and past ratings — completely transparently without AI.',
      icon: Search,
    },
    {
      num: '4',
      title: 'Helper Acceptance & In-Progress Tracking',
      desc: 'The requester invites a qualified helper. The helper must explicitly accept before assistance begins. Both parties track status updates in real time.',
      icon: CheckCircle,
    },
    {
      num: '5',
      title: 'Completion & Community Rating',
      desc: 'Once completed, the requester awards a 1 to 5 star rating with an optional review, boosting the helper’s community standing and trust score.',
      icon: Star,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">How Kasandigan Works</h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
          A step-by-step guide to requesting assistance, sharing skills, and borrowing resources in your barangay.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="flex gap-6 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
              <div className="shrink-0 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center border border-emerald-100">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-xs font-extrabold text-slate-400 mt-2">STEP {s.num}</div>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-emerald-900">Ready to get started?</h4>
          <p className="text-xs text-emerald-700">Join your verified neighbors in building a stronger community.</p>
        </div>
        <Link
          to="/register"
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors shrink-0"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default HowItWorksPage;
