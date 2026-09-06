import React, { useState, useEffect } from 'react';
import { UserCheck, AlertCircle, X, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

export const ReassignHelperModal = ({ isOpen, onClose, requestId, currentHelperId, onReassigned }) => {
  const [helpers, setHelpers] = useState([]);
  const [selectedHelperId, setSelectedHelperId] = useState('');
  const [reason, setReason] = useState('Supervisor manual reassignment');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const fetchHelpers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/requests/${requestId}/matches/`);
        const list = res.data.matches || [];
        setHelpers(list);
        if (list.length > 0) {
          const firstOther = list.find((h) => h.helper_id !== currentHelperId);
          setSelectedHelperId(firstOther ? firstOther.helper_id : list[0].helper_id);
        }
      } catch (err) {
        try {
          const userRes = await api.get('/users/?verification_status=VERIFIED');
          const uList = userRes.data.results || userRes.data || [];
          setHelpers(uList.map((u) => ({
            helper_id: u.id,
            helper_name: `${u.first_name} ${u.last_name}`,
            total_score: 100,
            helper_zone: u.zone,
          })));
          if (uList.length > 0) setSelectedHelperId(uList[0].id);
        } catch {
          setError('Failed to fetch available helpers.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHelpers();
  }, [isOpen, requestId, currentHelperId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHelperId) {
      setError('Please select a helper to assign.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await api.post(`/requests/${requestId}/reassign_helper/`, {
        helper_id: Number(selectedHelperId),
        reason: reason.trim(),
      });
      onReassigned();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reassign helper.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Reassign Helper</h3>
              <p className="text-xs text-slate-500 mt-0.5">Staff / Admin Supervisor Override</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="p-10">
            <LoadingSpinner text="Loading eligible helpers..." />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Qualified Community Helper <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedHelperId}
                onChange={(e) => setSelectedHelperId(e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                {helpers.map((h) => (
                  <option key={h.helper_id} value={h.helper_id}>
                    {h.helper_name} {h.total_score ? `(Score: ${h.total_score} pts)` : ''} {h.helper_zone ? `- ${h.helper_zone}` : ''} {h.helper_id === currentHelperId ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Reassignment / Audit Note <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows="2"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Previous helper was unavailable or emergency priority escalation..."
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
              <strong>Audit Log Warning:</strong> Manual reassignment will immediately cancel the previous assignment, notify both parties, and log this administrative intervention for transparency.
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {submitting ? 'Reassigning...' : 'Confirm Reassignment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReassignHelperModal;
