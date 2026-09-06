import React, { useState, useEffect } from 'react';
import { HeartHandshake, User, Calendar, Clock, MapPin, AlertCircle, X, Sparkles } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

export const WalkInIntakeModal = ({ isOpen, onClose, onCreated }) => {
  const [citizens, setCitizens] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    requester_id: '',
    title: '',
    description: '',
    category: '',
    preferred_date: new Date().toISOString().split('T')[0],
    preferred_time: 'Afternoon (1:00 PM - 5:00 PM)',
    zone: 'Zone 1',
    urgency: 'MEDIUM',
    helpers_needed: 1,
    auto_dispatch: true,
    additional_notes: 'Filed via Barangay Desk Officer Walk-In Intake',
  });

  useEffect(() => {
    if (!isOpen) return;
    const loadData = async () => {
      setLoadingInitial(true);
      setError('');
      try {
        const [usersRes, catRes] = await Promise.all([
          api.get('/users/?verification_status=VERIFIED'),
          api.get('/categories/'),
        ]);

        const uList = usersRes.data.results || usersRes.data || [];
        const cList = catRes.data.results || catRes.data || [];

        setCitizens(uList);
        setCategories(cList);

        if (uList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            requester_id: uList[0].id,
            zone: uList[0].zone || 'Zone 1',
          }));
        }
        if (cList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            category: cList[0].id,
          }));
        }
      } catch {
        setError('Failed to load verified citizens and categories.');
      } finally {
        setLoadingInitial(false);
      }
    };
    loadData();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCitizenChange = (citizenId) => {
    const found = citizens.find((c) => c.id === Number(citizenId));
    setFormData((prev) => ({
      ...prev,
      requester_id: citizenId,
      zone: found?.zone || prev.zone,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.requester_id) {
      setError('Please select a verified citizen.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...formData,
        requester_id: Number(formData.requester_id),
        category: Number(formData.category),
        helpers_needed: Number(formData.helpers_needed),
      };
      await api.post('/requests/', payload);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit desk walk-in intake request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Walk-In Citizen Assistance Intake</h3>
              <p className="text-xs text-slate-500 mt-0.5">Desk Officer intake for elderly or walk-in residents</p>
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

        {loadingInitial ? (
          <div className="p-10">
            <LoadingSpinner text="Loading verified residents directory..." />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Citizen / Requester <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.requester_id}
                onChange={(e) => handleCitizenChange(e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                {citizens.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name} ({c.email}) - {c.zone || 'Zone N/A'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Request Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Broken water pipe repair / Senior grocery errand"
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Urgency Level
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High Priority</option>
                  <option value="EMERGENCY">Emergency / Priority</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.preferred_date}
                  onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Time
                </label>
                <input
                  type="text"
                  value={formData.preferred_time}
                  onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Resident Zone / Location
                </label>
                <input
                  type="text"
                  required
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Helpers Needed
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.helpers_needed}
                  onChange={(e) => setFormData({ ...formData, helpers_needed: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description / Problem Details <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Details of the assistance required..."
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Auto-Dispatch Top Qualified Helpers
                </div>
                <div className="text-[10px] text-teal-700 mt-0.5">
                  Immediately send invitations to the top 3 scored helpers in this zone.
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.auto_dispatch}
                onChange={(e) => setFormData({ ...formData, auto_dispatch: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
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
                className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting Intake...' : 'Submit Walk-In Intake'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default WalkInIntakeModal;
