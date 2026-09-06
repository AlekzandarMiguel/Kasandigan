import React from 'react';
import { HeartHandshake, Shield, Users, Target, Lock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <HeartHandshake className="w-4 h-4 text-emerald-600" />
          <span>About Kasandigan</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900">
          “A community you can rely on.”
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg">
          Kasandigan is a Philippine community assistance and skill-matching multi-tenant SaaS platform built to revitalize the spirit of <span className="font-semibold text-emerald-700">Bayanihan</span> in modern barangays.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Our Core Mission</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            To make it easier for people within the same barangay to request help, offer their skills, and connect with suitable community members through a structured and trusted platform.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Tenant Data Isolation</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every barangay is an isolated tenant. Private resident information, contact coordinates, and assistance histories are logically separated and protected.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Strictly Rule-Based (No AI)</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            No black-box algorithms or AI hallucinations. Recommendations follow deterministic criteria: Skill match (+50), Same barangay (+20), Same zone (+15), Availability (+10), and Rating (+5).
          </p>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Ready to make your barangay closer and more resilient?</h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Start collaborating with your verified neighbors today.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/register" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors">
            Get Started
          </Link>
          <Link to="/login" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
