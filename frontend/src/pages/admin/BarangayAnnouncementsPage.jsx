import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Pin, Calendar, Globe, Users, ShieldCheck, Search, Trash2, Eye } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export const BarangayAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_pinned: false,
    audience: 'ALL',
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements/');
      setAnnouncements(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements/', formData);
      setShowModal(false);
      setFormData({ title: '', content: '', is_pinned: false, audience: 'ALL' });
      fetchAnnouncements();
    } catch (err) {
      alert('Error creating announcement: ' + (err.response?.data?.detail || err.message));
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) return <LoadingSpinner text="Loading barangay bulletins & announcements..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Barangay Administration
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 mt-1">
            <Megaphone className="w-6 h-6 text-emerald-600" />
            Official Barangay Proclamations & Bulletins
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Publish official advisories, health drives, community assemblies, and disaster alerts to citizens.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Broadcast Proclamation
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search proclamations and bulletins by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <EmptyState
          title="No Announcements Published"
          description="Click 'Broadcast Proclamation' to issue your barangay's first community bulletin."
        />
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((item) => (
            <div
              key={item.id}
              className={`p-6 bg-white rounded-3xl border transition-all ${
                item.is_pinned
                  ? 'border-amber-300 shadow-md ring-1 ring-amber-200/60'
                  : 'border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  {item.is_pinned && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                      <Pin className="w-3 h-3 fill-amber-700 text-amber-700" /> PINNED PRIORITY
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Official Release
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(item.created_at).toLocaleDateString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-lg font-black text-slate-900">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                  {item.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
                    PB
                  </div>
                  <span className="font-semibold text-slate-700">Office of the Punong Barangay</span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>Broadcasted to all residents</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Broadcast Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-emerald-600" /> Issue Official Proclamation
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bulletin Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Barangay General Assembly & Free Rabies Vaccination Drive"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Statement / Details</label>
                <textarea
                  rows="5"
                  required
                  placeholder="Write the full announcement details, date, venue, and instructions for residents..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                <input
                  type="checkbox"
                  checked={formData.is_pinned}
                  onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded-sm focus:ring-amber-500"
                />
                <div>
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1">
                    <Pin className="w-3.5 h-3.5 fill-amber-700 text-amber-700" /> Pin as Urgent Notice
                  </div>
                  <div className="text-[10px] text-amber-700">Display this advisory prominently at the very top of all resident feeds.</div>
                </div>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  Broadcast Bulletin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarangayAnnouncementsPage;
