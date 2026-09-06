import PageHeader from '../../components/PageHeader';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, UserCheck, Flag, HeartHandshake,
  Users, Megaphone, CheckCircle, AlertTriangle, ArrowRight
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export const StaffDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [pendingResidents, setPendingResidents] = useState([]);
  const [openReports, setOpenReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const [dashRes, resRes, repRes] = await Promise.all([
          api.get('/dashboard/'),
          api.get('/residents/?status=PENDING_VERIFICATION'),
          api.get('/reports/?status=PENDING'),
        ]);
        setMetrics(dashRes.data);
        setPendingResidents(resRes.data.results || resRes.data || []);
        setOpenReports(repRes.data.results || repRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaffData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading staff dashboard..." />;

  const summary = metrics?.summary || {};

  return (
    <div className="space-y-8">
      <PageHeader
        badge={`Barangay Staff Console • ${metrics?.barangay_name || user?.barangay_details?.name || 'South Poblacion'}`}
        title="Staff Operations Portal"
        description="Verify local residents, triage community moderation reports, and monitor assistance workflows."
        theme="teal"
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pending Verifications</div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-amber-600">{summary.pending_verifications || 0}</div>
            <UserCheck className="w-6 h-6 text-amber-500" />
          </div>
          <Link to="/staff/verifications" className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 mt-2 block">
            Review residency queue →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Open Reports</div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-rose-600">{summary.open_reports || 0}</div>
            <Flag className="w-6 h-6 text-rose-500" />
          </div>
          <Link to="/staff/reports" className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 mt-2 block">
            Investigate reports →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Active Assistance</div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-blue-600">{summary.active_requests || 0}</div>
            <HeartHandshake className="w-6 h-6 text-blue-500" />
          </div>
          <Link to="/staff/requests" className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 mt-2 block">
            Monitor activity →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Residents</div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900">{summary.total_residents || 0}</div>
            <Users className="w-6 h-6 text-emerald-500" />
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">{summary.active_residents || 0} verified</span>
        </div>
      </div>

      {/* Action Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Verifications Queue */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-500" />
              Pending Resident Approvals
            </h3>
            <Link to="/staff/verifications" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              View All ({pendingResidents.length})
            </Link>
          </div>

          {pendingResidents.length > 0 ? (
            <div className="space-y-3">
              {pendingResidents.slice(0, 5).map((r) => (
                <div key={r.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{r.full_name}</h4>
                    <p className="text-slate-500">{r.email} • {r.zone || 'No zone specified'}</p>
                  </div>
                  <Link
                    to="/staff/verifications"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shrink-0"
                  >
                    Verify
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              No pending residents in the verification queue.
            </div>
          )}
        </div>

        {/* Open Reports Queue */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flag className="w-5 h-5 text-rose-500" />
              Recent Moderation Reports
            </h3>
            <Link to="/staff/reports" className="text-xs font-semibold text-rose-600 hover:text-rose-700">
              View All ({openReports.length})
            </Link>
          </div>

          {openReports.length > 0 ? (
            <div className="space-y-3">
              {openReports.slice(0, 5).map((rep) => (
                <div key={rep.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-700">{rep.report_type_display}</span>
                    <StatusBadge status={rep.status} />
                  </div>
                  <p className="text-slate-600 line-clamp-2">{rep.description}</p>
                  <div className="text-[11px] text-slate-400">
                    Reported by: {rep.reporter_name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              No active community reports pending triage.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
