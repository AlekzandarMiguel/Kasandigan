import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle, AlertCircle, X, Package } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

export const LinkEquipmentModal = ({ isOpen, onClose, requestId, onLinked }) => {
  const [resources, setResources] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const fetchResources = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/resources/?status=AVAILABLE');
        const list = res.data.results || res.data || [];
        setResources(list);
        if (list.length > 0) setSelectedId(list[0].id);
      } catch (err) {
        setError('Failed to load available barangay equipment.');
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId) {
      setError('Please select an equipment/tool to link.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await api.post(`/requests/${requestId}/link_equipment/`, {
        resource_id: Number(selectedId),
      });
      onLinked();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to borrow/link equipment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Borrow Barangay Equipment</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Link barangay shared tools directly to this ticket. Auto-returns upon completion.
              </p>
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
          <div className="p-12">
            <LoadingSpinner text="Checking available inventory..." />
          </div>
        ) : resources.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Package className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No Equipment Available</p>
            <p className="text-xs text-slate-500">
              All tools in the barangay inventory are currently in use or undergoing maintenance.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {resources.map((item) => (
                <label
                  key={item.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    Number(selectedId) === item.id
                      ? 'border-purple-500 bg-purple-50/40 ring-2 ring-purple-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="selectedResource"
                      value={item.id}
                      checked={Number(selectedId) === item.id}
                      onChange={(e) => setSelectedId(e.target.value)}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-purple-700">{item.category}</span>
                        {item.condition && <span>- Condition: {item.condition}</span>}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Available
                  </span>
                </label>
              ))}
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-[11px] text-purple-900 leading-relaxed">
              <strong>Notice:</strong> When you borrow this equipment for this assistance ticket, it is reserved for your team and will automatically return to <em>Available</em> status when the ticket is marked complete.
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
                className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {submitting ? 'Borrowing...' : 'Confirm & Borrow Equipment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LinkEquipmentModal;
