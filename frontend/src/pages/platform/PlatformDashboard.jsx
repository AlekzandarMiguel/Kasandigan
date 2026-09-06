import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Users, HeartHandshake, CheckCircle2,
  ShieldCheck, AlertTriangle, ArrowRight, BarChart3, Layers
} from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export const PlatformDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPlatformData = async () => {
    try {
      const res = await api.get('/dashboard/');
      setMetrics(res.data);
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

  if (loading) return <LoadingSpinner text="Loading platform SaaS metrics..." />;

  const summary = metrics?.summary || {};
  const barangayStats = metrics?.barangay_stats || [];
  const topCategories = metrics?.top_categories || [];

  return (
    <div className="space-y-8">
      {/* SaaS Master Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Platform Administrator • SaaS Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Kasandigan Multi-Tenant SaaS Overview
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Centralized platform administration, tenant provisioning, cross-barangay performance, and security monitoring.
          </p>
        </div>
      </div>

      {/* Global SaaS Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Barangays</div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900">{summary.total_barangays || 0}</div>
            <Building2 className="w-6 h-6 text-indigo-600" />
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-2 block">
            {summary.active_barangays || 0} Active • {summary.suspended_barangays || 0} Suspended
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total SaaS Residents</div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900">{summary.total_residents || 0}</div>
            <Users className="w-6 h-6 text-emerald-600" />
          </div>
          <Link to="/platform/users" className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 mt-2 block">
            Browse all users →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Requests</div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900">{summary.total_requests || 0}</div>
            <HeartHandshake className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-[11px] text-blue-600 font-bold mt-2 block">
            {summary.completion_rate || '0%'} Completion Rate
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reported Accounts</div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-rose-600">{summary.reported_accounts || 0}</div>
            <AlertTriangle className="w-6 h-6 text-rose-500" />
          </div>
          <Link to="/platform/users" className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 mt-2 block">
            Review accounts →
          </Link>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Barangay Tenants Overview</h3>
            <p className="text-xs text-slate-500">Live multi-tenant partitions operating on Kasandigan SaaS.</p>
          </div>
          <Link
            to="/platform/barangays"
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
          >
            Manage Tenants
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
    </div>
  );
};

export default PlatformDashboard;
