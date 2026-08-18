import PageHeader from '../../components/PageHeader';
import React, { useState, useEffect } from 'react';
import {
  Megaphone, Plus, Radio, Search, Pin, Trash2,
  Calendar, Clock, ShieldAlert, CheckCircle2, X, AlertTriangle, AlertCircle, Filter
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export const PlatformAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Emergency Alert Modal state
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertSubmitting, setAlertSubmitting] = useState(false);
  const [alertSuccessMsg, setAlertSuccessMsg] = useState('');
  const [alertForm, setAlertForm] = useState({
    title: '',
    content: '',
    alert_level: 'WARNING',
  });

  // Regular Bulletin Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    priority: 'NORMAL',
    is_pinned: false,
  });

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements/');
      setAnnouncements(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to fetch announcements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Handle MDRRMO Emergency Broadcast submission
  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    setAlertSubmitting(true);
    try {
      await api.post('/announcements/', {
        title: alertForm.title,
        content: alertForm.content,
        alert_level: alertForm.alert_level,
        is_emergency_broadcast: true,
        is_pinned: true,
        is_active: true,
      });
      setAlertSuccessMsg('MDRRMO Municipal Emergency Alert Broadcasted Successfully across all 20 Barangays!');
      setAlertForm({ title: '', content: '', alert_level: 'WARNING' });
      fetchAnnouncements();
      setTimeout(() => {
        setShowAlertModal(false);
        setAlertSuccessMsg('');
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to broadcast emergency alert.');
    } finally {
      setAlertSubmitting(false);
    }
  };

  // Handle Regular Municipal Bulletin submission
  const handleCreateBulletin = async (e) => {
    e.preventDefault();
    setCreateSubmitting(true);
    try {
      await api.post('/announcements/', {
        title: createForm.title,
        content: createForm.content,
        priority: createForm.priority,
        is_pinned: createForm.is_pinned,
        is_emergency_broadcast: false,
      });
      setShowCreateModal(false);
      setCreateForm({ title: '', content: '', priority: 'NORMAL', is_pinned: false });
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to publish bulletin.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement permanently?')) return;
    try {
      await api.delete(`/announcements/${id}/`);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert('Failed to delete announcement.');
    }
  };

  const filtered = announcements.filter((a) => {
    if (typeFilter === 'EMERGENCY' && !a.is_emergency_broadcast) return false;
    if (typeFilter === 'MUNICIPAL' && (a.is_emergency_broadcast || a.barangay)) return false;
    if (typeFilter === 'BARANGAY' && !a.barangay) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (a.title || '').toLowerCase().includes(q);
      const matchContent = (a.content || '').toLowerCase().includes(q);
      const matchBrgy = (a.barangay_name || '').toLowerCase().includes(q);
      if (!matchTitle && !matchContent && !matchBrgy) return false;
    }
    return true;
  });

  if (loading) return <LoadingSpinner text="Loading municipal bulletins & emergency telemetry..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Megaphone}
        badge="Municipality of Maramag, Bukidnon • Central LGU Communications"
        badgeIcon={Megaphone}
        title="Municipal Bulletins & Public Advisories"
        description="Publish municipal announcements, manage public health advisories, and broadcast real-time MDRRMO disaster alerts to all 20 barangays."
        theme="indigo"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAlertModal(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
              title="Broadcast immediate emergency warning to all 20 barangays"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Broadcast MDRRMO Alert</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>Post Municipal Bulletin</span>
            </button>
          </div>
        }
      />

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search bulletins by title, keyword, or barangay..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {[
            { key: 'ALL', label: 'All Notices' },
            { key: 'EMERGENCY', label: '🚨 MDRRMO Alerts' },
            { key: 'MUNICIPAL', label: '🏛️ Municipal' },
            { key: 'BARANGAY', label: '📍 Barangay Level' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTypeFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                typeFilter === tab.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements Feed */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No Bulletins Found"
          description="No advisories matched your query. Use 'Broadcast MDRRMO Alert' or 'Post Municipal Bulletin' to publish updates."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const isEmergency = item.is_emergency_broadcast;
            return (
              <div
                key={item.id}
                className={`p-6 bg-white rounded-3xl border transition-all hover:shadow-md ${
                  isEmergency
                    ? 'border-rose-300 ring-2 ring-rose-500/20 bg-rose-50/20'
                    : item.is_pinned
                    ? 'border-indigo-300 shadow-sm'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    {/* Badge Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      {isEmergency ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                          <Radio className="w-3 h-3" />
                          MDRRMO Emergency Alert • {item.alert_level || 'WARNING'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                          {item.barangay_name ? `Barangay ${item.barangay_name}` : 'Municipal LGU Maramag'}
                        </span>
                      )}

                      {item.is_pinned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}

                      {item.priority && item.priority !== 'NORMAL' && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          item.priority === 'EMERGENCY' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.priority}
                        </span>
                      )}
                    </div>

                    {/* Headline */}
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      {item.title}
                    </h3>

                    {/* Body */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {item.content}
                    </p>

                    {/* Footer Details */}
                    <div className="flex flex-wrap items-center gap-4 pt-3 text-[11px] text-slate-400 border-t border-slate-100">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-300" />
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                      <span>Published by: <strong className="text-slate-700">{item.author_name || 'LGU Officer'}</strong></span>
                      <span>Target: <strong className="text-slate-700">{item.barangay_name ? `Barangay ${item.barangay_name}` : 'All 20 Barangays (Municipal-Wide)'}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0 self-start cursor-pointer"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MDRRMO Emergency Alert Broadcast Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-rose-700 to-rose-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-rose-200 animate-pulse" />
                <div>
                  <h3 className="font-bold text-sm">MDRRMO Municipal Emergency Alert Broadcast</h3>
                  <p className="text-[11px] text-rose-100">Broadcasts instant warning to all 20 Barangays in Maramag</p>
                </div>
              </div>
              <button
                onClick={() => setShowAlertModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBroadcastAlert} className="p-5 space-y-4 text-xs">
              {alertSuccessMsg ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <p>{alertSuccessMsg}</p>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                    <strong>Notice:</strong> This broadcast will immediately push an emergency notification and render a sticky high-visibility warning banner on the dashboards of all residents and staff in Maramag (Pulangi river basin, low-lying, and upland areas).
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Alert Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { level: 'WARNING', label: 'WARNING (Red)', color: 'border-rose-500 bg-rose-50 text-rose-800' },
                        { level: 'WATCH', label: 'WATCH (Orange)', color: 'border-amber-500 bg-amber-50 text-amber-800' },
                        { level: 'ADVISORY', label: 'ADVISORY (Yellow)', color: 'border-yellow-500 bg-yellow-50 text-yellow-800' },
                      ].map((lvl) => (
                        <button
                          key={lvl.level}
                          type="button"
                          onClick={() => setAlertForm({ ...alertForm, alert_level: lvl.level })}
                          className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                            alertForm.alert_level === lvl.level ? `${lvl.color} ring-2 ring-slate-900` : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Alert Headline / Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flash Flood Warning: Pulangi River Cresting (Dologon / South Poblacion)"
                      value={alertForm.title}
                      onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Citizen Directives & Safety Instructions</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Detail specific precautions, evacuation center locations (e.g. Maramag Municipal Gymnasium), and emergency hotline numbers..."
                      value={alertForm.content}
                      onChange={(e) => setAlertForm({ ...alertForm, content: e.target.value })}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAlertModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={alertSubmitting}
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/30 flex items-center gap-2 cursor-pointer"
                    >
                      {alertSubmitting ? 'Transmitting...' : 'Confirm Broadcast'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Regular Municipal Bulletin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-emerald-700 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="font-bold text-sm">Post Official Municipal Bulletin</h3>
                  <p className="text-[11px] text-emerald-100">Broadcast civil advisories and community updates</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBulletin} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bulletin Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maramag Rural Health Unit Free Medical & Dental Mission"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Announcement Body</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write the full announcement details, schedule, eligible participants, and instructions..."
                  value={createForm.content}
                  onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="IMPORTANT">Important</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="pinBulletin"
                    checked={createForm.is_pinned}
                    onChange={(e) => setCreateForm({ ...createForm, is_pinned: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                  <label htmlFor="pinBulletin" className="font-bold text-slate-700 cursor-pointer">
                    Pin to top of feed
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  {createSubmitting ? 'Publishing...' : 'Publish Bulletin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformAnnouncementsPage;
