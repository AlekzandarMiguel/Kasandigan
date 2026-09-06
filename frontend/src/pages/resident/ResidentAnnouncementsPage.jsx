import React, { useState, useEffect } from 'react';
import { Megaphone, Pin, Clock, AlertTriangle, Search, Filter, Shield, Radio, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export const ResidentAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements/');
        setAnnouncements(res.data.results || res.data || []);
      } catch (err) {
        console.error('Failed to load announcements', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  if (loading) return <LoadingSpinner text="Loading community bulletins & notices..." />;

  const filtered = announcements.filter((a) => {
    if (priorityFilter === 'EMERGENCY' && !a.is_emergency_broadcast && a.priority !== 'EMERGENCY') return false;
    if (priorityFilter === 'IMPORTANT' && a.priority !== 'IMPORTANT') return false;
    if (priorityFilter === 'NORMAL' && a.priority !== 'NORMAL' && a.priority !== 'LOW') return false;

    if (search) {
      const q = search.toLowerCase();
      const matchTitle = (a.title || '').toLowerCase().includes(q);
      const matchContent = (a.content || '').toLowerCase().includes(q);
      const matchBrgy = (a.barangay_name || '').toLowerCase().includes(q);
      if (!matchTitle && !matchContent && !matchBrgy) return false;
    }
    return true;
  });

  const pinned = filtered.filter((a) => a.is_pinned || a.is_emergency_broadcast);
  const regular = filtered.filter((a) => !a.is_pinned && !a.is_emergency_broadcast);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold backdrop-blur-xs">
            <Megaphone className="w-3.5 h-3.5 text-emerald-300" />
            <span>Official Community Bulletins & Public Notices</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Barangay & MDRRMO Announcements
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl">
            Stay informed with verified advisories, disaster alerts, health schedules, and civic programs from your Barangay Council and the Municipality of Maramag.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search bulletins by title, topic, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="inline-flex p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            {['ALL', 'EMERGENCY', 'IMPORTANT', 'NORMAL'].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1 rounded-lg transition-all text-[11px] ${
                  priorityFilter === p ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {p === 'ALL' ? 'All Bulletins' : p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements Stream */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No Matching Bulletins"
          description="There are currently no announcements matching your search query or filter."
        />
      ) : (
        <div className="space-y-4">
          {/* Pinned & Emergency Section */}
          {pinned.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 px-1">
                <Pin className="w-3.5 h-3.5 text-amber-500" />
                <span>Priority & Pinned Notices ({pinned.length})</span>
              </div>
              {pinned.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    ann.is_emergency_broadcast || ann.priority === 'EMERGENCY'
                      ? 'bg-rose-50/70 border-rose-200 ring-2 ring-rose-500/20'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {ann.is_emergency_broadcast ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                            <Radio className="w-3 h-3" />
                            MDRRMO {ann.alert_level || 'EMERGENCY'} BROADCAST
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                            <Pin className="w-3 h-3" />
                            PINNED NOTICE
                          </span>
                        )}

                        <span className="text-[11px] font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200/60">
                          {ann.barangay_name ? `Brgy. ${ann.barangay_name}` : 'Municipality of Maramag'}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                        {ann.title}
                      </h3>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                        {ann.content}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Posted: {new Date(ann.created_at).toLocaleString()}
                    </span>
                    <span className="font-semibold text-slate-600">
                      Author: {ann.author_name || 'Barangay Administration'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Regular Bulletins */}
          {regular.length > 0 && (
            <div className="space-y-3 pt-2">
              {pinned.length > 0 && (
                <div className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">
                  <span>General Community Updates ({regular.length})</span>
                </div>
              )}
              {regular.map((ann) => (
                <div
                  key={ann.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ann.priority === 'IMPORTANT'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ann.priority || 'NORMAL'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {ann.barangay_name ? `Brgy. ${ann.barangay_name}` : 'Municipality of Maramag'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {ann.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {ann.content}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                    <span>{ann.author_name || 'Barangay Hall'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResidentAnnouncementsPage;
