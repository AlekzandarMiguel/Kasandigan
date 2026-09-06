import React, { useState, useEffect } from 'react';
import { Flag, AlertTriangle, ShieldAlert, CheckCircle, Ban, MessageSquare, Clock, User, Check, X } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export const BarangayReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionType, setActionType] = useState('RESOLVED');
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let url = '/reports/';
      if (statusFilter) url += `?status=${statusFilter}`;
      const res = await api.get(url);
      setReports(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    setSubmitting(true);
    try {
      await api.patch(`/reports/${selectedReport.id}/resolve/`, {
        status: actionType,
        resolution_notes: resolutionNotes,
      });

      // If action is BAN, also suspend the reported user
      if (actionType === 'BAN' && selectedReport.reported_user) {
        await api.patch(`/accounts/users/${selectedReport.reported_user}/`, { is_active: false });
      }

      setSelectedReport(null);
      setResolutionNotes('');
      fetchReports();
    } catch (err) {
      alert('Error updating report: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading incident reports registry..." />;

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
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            Resident Incident & Disciplinary Tribunal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Adjudicate citizen dispute filings, enforce code of conduct sanctions, and issue official barangay account suspensions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            {reports.filter(r => r.status === 'SUBMITTED').length} Pending Adjudication
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="text-xs font-bold text-slate-700">Filter Disciplinary Cases:</div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
        >
          <option value="">All Case Statuses</option>
          <option value="SUBMITTED">Submitted (Awaiting Action)</option>
          <option value="INVESTIGATING">Under Formal Investigation</option>
          <option value="RESOLVED">Resolved & Sanctioned</option>
          <option value="DISMISSED">Dismissed / Unfounded</option>
        </select>
      </div>

      {/* Reports Grid */}
      {reports.length === 0 ? (
        <EmptyState
          title="No Disciplinary Reports"
          description="There are currently no reports or misconduct filings logged in your barangay."
        />
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    report.status === 'SUBMITTED'
                      ? 'bg-rose-100 text-rose-800'
                      : report.status === 'INVESTIGATING'
                      ? 'bg-amber-100 text-amber-800'
                      : report.status === 'RESOLVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {report.status}
                  </span>
                  <span className="text-xs font-bold text-slate-400">Case #{report.id}</span>
                  <span className="text-xs font-semibold text-slate-700">Category: {report.reason}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(report.created_at).toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reporting Resident</div>
                  <div className="font-bold text-slate-800 mt-1">
                    {report.reporter_details?.first_name} {report.reporter_details?.last_name}
                  </div>
                  <div className="text-slate-500">{report.reporter_details?.email}</div>
                </div>

                <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
                  <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Reported Subject</div>
                  <div className="font-bold text-slate-800 mt-1">
                    {report.reported_user_details
                      ? `${report.reported_user_details.first_name} ${report.reported_user_details.last_name}`
                      : report.request_details
                      ? `Request: "${report.request_details.title}"`
                      : 'Specified Incident'}
                  </div>
                  <div className="text-slate-500">{report.reported_user_details?.email || 'N/A'}</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-700 mb-1">Incident Allegation:</div>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {report.description}
                </p>
              </div>

              {report.resolution_notes && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs">
                  <div className="font-bold text-emerald-900 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Barangay Resolution Ruling:
                  </div>
                  <p className="text-emerald-800 mt-0.5">{report.resolution_notes}</p>
                </div>
              )}

              {report.status !== 'RESOLVED' && report.status !== 'DISMISSED' && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedReport(report);
                      setActionType('RESOLVED');
                      setResolutionNotes('');
                    }}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" /> Adjudicate & Sanction
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" /> Adjudicate Case #{selectedReport.id}
            </h3>

            <form onSubmit={handleResolve} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Disciplinary Ruling</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
                >
                  <option value="RESOLVED">Issue Formal Warning & Close Case</option>
                  <option value="BAN">Suspend User Account (Revoke Access)</option>
                  <option value="INVESTIGATING">Mark as Under Active Investigation</option>
                  <option value="DISMISSED">Dismiss Allegation as Unfounded</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Barangay Resolution Notes</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Detail the findings, counseling conducted, or sanction terms..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Applying Ruling...' : 'Confirm Ruling'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarangayReportsPage;
