import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Users, HeartHandshake, CheckCircle2,
  ShieldCheck, AlertTriangle, ArrowRight, BarChart3, Layers,
  Radio, FileText, Search, PlusCircle, X, Megaphone, BellRing, Sparkles, Wrench
} from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export const PlatformDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [municipalGrid, setMunicipalGrid] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchBrgy, setSearchBrgy] = useState('');

  // MDRRMO Alert Modal State
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertForm, setAlertForm] = useState({
    title: '',
    content: '',
    alert_level: 'WARNING',
  });
  const [alertSubmitting, setAlertSubmitting] = useState(false);
  const [alertSuccessMsg, setAlertSuccessMsg] = useState('');

  const fetchPlatformData = async () => {
    try {
      const [resDashboard, resGrid] = await Promise.all([
        api.get('/dashboard/'),
        api.get('/reports/municipal-overview/')
      ]);
      setMetrics(resDashboard.data);
      setMunicipalGrid(resGrid.data?.grid || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatformData();
  }, []);

  const handleToggleBarangay = async (bId) => {
    try {
      await api.post(`/barangays/${bId}/toggle_status/`);
      fetchPlatformData();
    } catch (err) {
      alert('Failed to toggle barangay status.');
    }
  };

  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    setAlertSubmitting(true);
    setAlertSuccessMsg('');
    try {
      await api.post('/announcements/', {
        title: alertForm.title,
        content: alertForm.content,
        alert_level: alertForm.alert_level,
        is_emergency_broadcast: true,
        is_pinned: true,
        is_active: true
      });
      setAlertSuccessMsg('MDRRMO Municipal-Wide Alert Broadcasted Successfully across all 20 Barangays!');
      setAlertForm({ title: '', content: '', alert_level: 'WARNING' });
      setTimeout(() => {
        setShowAlertModal(false);
        setAlertSuccessMsg('');
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to broadcast alert. Please check permissions.');
    } finally {
      setAlertSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading Maramag SaaS & 20-Barangay Telemetry..." />;

  const summary = metrics?.summary || {};
  const barangayStats = metrics?.barangay_stats || [];

  const filteredGrid = municipalGrid.filter(b => 
    b.name.toLowerCase().includes(searchBrgy.toLowerCase()) ||
    (b.code && b.code.toLowerCase().includes(searchBrgy.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* SaaS Master Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>Municipality of Maramag, Bukidnon • Central SaaS Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Kasandigan Municipal Operations Hub
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              Unified governance, cross-barangay tenant orchestration, MDRRMO emergency broadcasts, and consolidated DILG performance compliance.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAlertModal(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              Broadcast MDRRMO Alert
            </button>
            <Link
              to="/platform/dilg-report"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <FileText className="w-4 h-4" />
              Municipal DILG Report
            </Link>
          </div>
        </div>
      </div>

      {/* Global SaaS Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Barangays</div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900">{summary.total_barangays || 20}</div>
            <Building2 className="w-6 h-6 text-indigo-600" />
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-2 block">
            {summary.active_barangays || 20} Active in Maramag
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total SaaS Residents</div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900">{summary.total_residents || 0}</div>
            <Users className="w-6 h-6 text-emerald-600" />
          </div>
          <Link to="/platform/users" className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 mt-2 block">
            Browse all verified citizens →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Requests</div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900">{summary.total_requests || 0}</div>
            <HeartHandshake className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-[11px] text-blue-600 font-bold mt-2 block">
            {summary.completion_rate || '0%'} Resolution Rate
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Disputes / Reports</div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-rose-600">{summary.reported_accounts || 0}</div>
            <AlertTriangle className="w-6 h-6 text-rose-500" />
          </div>
          <Link to="/platform/users" className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 mt-2 block">
            Audit compliance flags →
          </Link>
        </div>
      </div>

      {/* 20-BARANGAY MARAMAG LIVE STATUS BOARD */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                20 Official Barangays
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-1">
              Maramag 20-Barangay Telemetry Status Board
            </h2>
            <p className="text-xs text-slate-500">
              Live operational monitoring of assistance requests, resident engagement, and shared equipment across Maramag.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter barangay (e.g. Dologon, Musuan)..."
              value={searchBrgy}
              onChange={(e) => setSearchBrgy(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Status Board Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredGrid.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all bg-gradient-to-b from-white to-slate-50/50 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Brgy. {b.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      CODE: {b.code || 'MRM'} • {b.zones_count || 0} Puroks
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    b.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {b.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-100/80 p-2 rounded-xl">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Active Reqs</span>
                    <span className="text-sm font-black text-blue-700">{b.active_requests}</span>
                  </div>
                  <div className="bg-emerald-50/80 p-2 rounded-xl">
                    <span className="text-emerald-700 block text-[10px] uppercase font-bold">Completed</span>
                    <span className="text-sm font-black text-emerald-800">{b.completed_requests}</span>
                  </div>
                  <div className="bg-slate-100/80 p-2 rounded-xl">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Residents</span>
                    <span className="text-sm font-black text-slate-800">{b.residents_count}</span>
                  </div>
                  <div className="bg-amber-50/80 p-2 rounded-xl">
                    <span className="text-amber-700 block text-[10px] uppercase font-bold">Equipment</span>
                    <span className="text-sm font-black text-amber-800">{b.resources_count}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">Tenant #{b.id}</span>
                <button
                  onClick={() => handleToggleBarangay(b.id)}
                  className={`text-[11px] font-bold hover:underline ${
                    b.status === 'ACTIVE' ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {b.status === 'ACTIVE' ? 'Suspend Tenant' : 'Activate Tenant'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Tenant Configuration & Directory</h3>
            <p className="text-xs text-slate-500">Detailed tenant record table for LGU Maramag administrator review.</p>
          </div>
          <Link
            to="/platform/barangays"
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
          >
            Tenant Settings
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Barangay</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Registered Residents</th>
                <th className="px-4 py-3">Assistance Requests</th>
                <th className="px-4 py-3 text-right">Toggle Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {barangayStats.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900 text-sm">
                    {b.name}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{b.resident_count}</td>
                  <td className="px-4 py-3 text-slate-600">{b.req_count}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggleBarangay(b.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                        b.status === 'ACTIVE'
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {b.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
              <button onClick={() => setShowAlertModal(false)} className="p-1 hover:bg-white/10 rounded-lg text-white">
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
                        { level: 'ADVISORY', label: 'ADVISORY (Yellow)', color: 'border-yellow-500 bg-yellow-50 text-yellow-800' }
                      ].map((lvl) => (
                        <button
                          key={lvl.level}
                          type="button"
                          onClick={() => setAlertForm({ ...alertForm, alert_level: lvl.level })}
                          className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all ${
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
                      placeholder="e.g. Flash Flood Warning: Pulangi River Cresting (Dologon / North Poblacion)"
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
                      placeholder="State affected barangays, evacuation centers, MDRRMO hotline (0917-XXX-XXXX), and safety precautions..."
                      value={alertForm.content}
                      onChange={(e) => setAlertForm({ ...alertForm, content: e.target.value })}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAlertModal(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={alertSubmitting}
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-md shadow-rose-600/30 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      {alertSubmitting ? 'Transmitting Alert...' : 'Transmit Municipal Broadcast'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformDashboard;
