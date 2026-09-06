import React, { useState, useEffect } from 'react';
import { Flag, Search, Filter, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export const StaffReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedReport, setSelectedReport] = useState(null);
  const [triageStatus, setTriageStatus] = useState('RESOLVED');
  const [notes, setNotes] = useState('');
  const [suspendUser, setSuspendUser] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleTriageSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    setSaving(true);

    try {
      await api.post(`/reports/${selectedReport.id}/triage/`, {
        status: triageStatus,
        moderation_notes: notes,
        suspend_user: suspendUser,
      });
      setMessage(`Report #${selectedReport.id} marked as ${triageStatus}.`);
      setSelectedReport(null);
      setNotes('');
      setSuspendUser(false);
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to triage report.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Flag className="w-6 h-6 text-rose-600" />
          Community Safety & Moderation Reports
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Investigate resident and request reports, take disciplinary action, and resolve community disputes.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm px-3.5 py-2 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
        >
          <option value="">All Report Statuses</option>
          <option value="PENDING">Pending Triage</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="DISMISSED">Dismissed</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading community reports..." />
      ) : reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    {rep.report_type_display}
                  </span>
                  <span className="text-xs text-slate-400">Report #{rep.id}</span>
                </div>
                <StatusBadge status={rep.status} />
              </div>

              <div className="space-y-2">
                <div className="text-xs text-slate-500">
                  <span>Filed by: <strong className="text-slate-800">{rep.reporter_name}</strong></span>
                  {rep.reported_user_name && (
                    <span className="ml-4">
                      Target User: <strong className="text-rose-600">{rep.reported_user_name}</strong>
                    </span>
                  )}
                  {rep.reported_request_title && (
                    <span className="ml-4">
                      Related Request: <strong className="text-slate-700">{rep.reported_request_title}</strong>
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 whitespace-pre-line">
                  {rep.description}
                </p>

                {rep.evidence_url && (
                  <div className="text-xs text-slate-500">
                    Evidence Link:{' '}
                    <a
                      href={rep.evidence_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 underline font-medium"
                    >
                      {rep.evidence_url}
                    </a>
                  </div>
                )}

                {rep.moderation_notes && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
                    <strong>Moderation Resolution Notes:</strong> {rep.moderation_notes} (by {rep.resolved_by_name || 'Staff'})
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedReport(rep);
                    setTriageStatus(rep.status === 'PENDING' ? 'UNDER_REVIEW' : 'RESOLVED');
                    setNotes(rep.moderation_notes || '');
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Triage / Investigate
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No reports found" description="There are currently no reports filed in your barangay matching this filter." />
      )}

      {/* Triage Dialog */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Triage Report #{selectedReport.id}</h3>

            <form onSubmit={handleTriageSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Update Status</label>
                <select
                  value={triageStatus}
                  onChange={(e) => setTriageStatus(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="UNDER_REVIEW">Under Review (Investigating)</option>
                  <option value="RESOLVED">Resolved (Action Taken)</option>
                  <option value="DISMISSED">Dismissed (No Violation)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Moderation Notes</label>
                <textarea
                  required
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Summarize investigation outcome..."
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              {selectedReport.reported_user && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="suspendCheck"
                      checked={suspendUser}
                      onChange={(e) => setSuspendUser(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded border-slate-300"
                    />
                    <label htmlFor="suspendCheck" className="text-xs font-bold text-rose-900 cursor-pointer">
                      Suspend Account ({selectedReport.reported_user_name})
                    </label>
                  </div>
                  <p className="text-[11px] text-rose-700">
                    Checking this will immediately deactivate the reported resident and change their status to Suspended.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Submitting...' : 'Save Triage Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffReportsPage;
