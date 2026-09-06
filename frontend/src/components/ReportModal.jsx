import React, { useState } from 'react';
import { Flag, X, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const REPORT_TYPES = [
  { value: 'INAPPROPRIATE_BEHAVIOR', label: 'Inappropriate or Disrespectful Behavior' },
  { value: 'SPAM', label: 'Spam / Misleading Information' },
  { value: 'FRAUDULENT_ACTIVITY', label: 'Fraudulent Activity or Scam' },
  { value: 'MISUSE_OF_PLATFORM', label: 'Misuse of Barangay Platform' },
  { value: 'HARASSMENT', label: 'Harassment or Threats' },
  { value: 'OTHER', label: 'Other Issue' },
];

export const ReportModal = ({ isOpen, onClose, reportedUserId, reportedRequestId, targetName, onReported }) => {
  const [reportType, setReportType] = useState('INAPPROPRIATE_BEHAVIOR');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/reports/', {
        reported_user: reportedUserId || null,
        reported_request: reportedRequestId || null,
        report_type: reportType,
        description,
        evidence_url: evidenceUrl,
      });
      setSuccess(true);
      if (onReported) onReported();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Report Issue</h3>
            <p className="text-xs text-slate-500">Concern regarding {targetName || 'community member'}</p>
          </div>
        </div>

        {success ? (
          <div className="p-4 my-4 rounded-xl bg-emerald-50 text-emerald-800 text-center text-sm font-medium">
            ✓ Report filed successfully. Barangay staff will investigate.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Report
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {REPORT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Description
              </label>
              <textarea
                required
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred with specific details..."
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Evidence Link or Screenshot URL (Optional)
              </label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'File Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
