import PageHeader from '../../components/PageHeader';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Users, HeartHandshake, CheckCircle2,
  Flag, Award, Wrench, UserCheck, ArrowRight, Star
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export const BarangayDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/dashboard/');
        setMetrics(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return <LoadingSpinner text="Loading barangay tenant dashboard..." />;

  const summary = metrics?.summary || {};
  const topCategories = metrics?.top_categories || [];
  const topHelpers = metrics?.top_helpers || [];

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Building2}
        badge={`Barangay Tenant Administrator • ${metrics?.barangay_name || user?.barangay_details?.name || 'South Poblacion'}`}
        badgeIcon={Building2}
        title="Barangay Governance Console"
        description="Oversee community assistance workflows, resident records, staff delegations, and category taxonomies."
        theme="slate"
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Residents</div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900">{summary.total_residents || 0}</div>
            <Users className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-2 block">{summary.active_residents || 0} Verified Residents</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Requests</div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900">{summary.total_requests || 0}</div>
            <HeartHandshake className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-[11px] text-blue-600 font-bold mt-2 block">{summary.active_requests || 0} Active / In Progress</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Completed Assistance</div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-emerald-600">{summary.completed_requests || 0}</div>
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">{summary.cancelled_requests || 0} cancelled</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Open Reports</div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-rose-600">{summary.open_reports || 0}</div>
            <Flag className="w-6 h-6 text-rose-500" />
          </div>
          <Link to="/admin/reports" className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 mt-2 block">
            Moderate community →
          </Link>
        </div>
      </div>

      {/* Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Requested Categories */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-emerald-600" />
            Most Requested Assistance Categories
          </h3>
          {topCategories.length > 0 ? (
            <div className="space-y-3">
              {topCategories.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-bold text-slate-800">{c.name}</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {c.req_count} request{c.req_count === 1 ? '' : 's'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-6 text-center">No category data yet.</div>
          )}
        </div>

        {/* Top Community Helpers */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Top Community Helpers
          </h3>
          {topHelpers.length > 0 ? (
            <div className="space-y-3">
              {topHelpers.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{h.first_name} {h.last_name}</h4>
                    <span className="text-slate-400">{h.zone || 'Zone N/A'}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 block">{h.completed_assistance_count} completed</span>
                    <span className="text-amber-600 font-bold">{Number(h.rating_average || 0).toFixed(1)} ★</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-6 text-center">No helper history recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarangayDashboard;
