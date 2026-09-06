import PageHeader from '../../components/PageHeader';
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle, AlertTriangle, Building2, Wrench } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export const PlatformReportsPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/dashboard/');
        setMetrics(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <LoadingSpinner text="Loading aggregated platform reports..." />;

  const summary = metrics?.summary || {};
  const barangayStats = metrics?.barangay_stats || [];
  const topCategories = metrics?.top_categories || [];

  return (
    <div className="space-y-8">
      <PageHeader
        icon={BarChart3}
        badge="Central SaaS Intelligence"
        badgeIcon={BarChart3}
        title="Aggregated Platform Analytics & Reports"
        description="SaaS-wide key performance indicators, completion rates, and community assistance trends across Maramag."
        theme="indigo"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Completion Rate</div>
          <div className="text-4xl font-black text-emerald-600">{summary.completion_rate || '0%'}</div>
          <p className="text-xs text-slate-400">
            {summary.completed_requests} of {summary.total_requests} requests successfully completed
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Community Base</div>
          <div className="text-4xl font-black text-indigo-600">{summary.total_residents || 0}</div>
          <p className="text-xs text-slate-400">
            Registered residents across {summary.total_barangays} active barangays
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Safety Index</div>
          <div className="text-4xl font-black text-teal-600">
            {Math.max(0, 100 - (summary.reported_accounts || 0))}%
          </div>
          <p className="text-xs text-slate-400">
            Only {summary.reported_accounts || 0} reported accounts under investigation
          </p>
        </div>
      </div>

      {/* Most Active Barangays */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Building2 className="w-5 h-5 text-indigo-600" />
          Tenant Activity Rankings (Assistance Requests Volume)
        </h3>

        <div className="space-y-4">
          {barangayStats.map((b, idx) => {
            const maxReq = Math.max(...barangayStats.map((x) => x.req_count), 1);
            const pct = Math.round((b.req_count / maxReq) * 100);

            return (
              <div key={b.id} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">
                    #{idx + 1} {b.name}
                  </span>
                  <span className="text-indigo-600">
                    {b.req_count} requests • {b.resident_count} residents
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Categories Across Platform */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Wrench className="w-5 h-5 text-emerald-600" />
          Highest Demand Assistance Categories
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {topCategories.map((c) => (
            <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h4 className="font-bold text-sm text-slate-800">{c.name}</h4>
              <div className="text-2xl font-black text-emerald-600">{c.req_count}</div>
              <p className="text-[11px] text-slate-400">Total assistance requests</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlatformReportsPage;
