import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartHandshake, ArrowLeft, Calendar, Clock, MapPin,
  AlertTriangle, Tag, Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const CreateRequestPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [zones, setZones] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    required_skill: '',
    preferred_date: new Date().toISOString().split('T')[0],
    preferred_time: 'Afternoon (1:00 PM - 5:00 PM)',
    zone: user?.zone || '',
    urgency: 'MEDIUM',
    additional_notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [catRes, skillRes] = await Promise.all([
          api.get('/categories/'),
          api.get('/skills/'),
        ]);
        const catList = catRes.data.results || catRes.data || [];
        setCategories(catList);
        setSkills(skillRes.data.results || skillRes.data || []);

        if (catList.length > 0) {
          setFormData((prev) => ({ ...prev, category: catList[0].id }));
        }

        if (user?.barangay_details?.zones) {
          setZones(user.barangay_details.zones);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadInitial();
  }, [user]);

  const filteredSkills = skills.filter((s) => s.category === Number(formData.category));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (user?.verification_status !== 'VERIFIED') {
      setError('Only verified residents can post assistance requests. Please wait for barangay hall verification.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        category: Number(formData.category),
        required_skill: formData.required_skill ? Number(formData.required_skill) : null,
      };
      const res = await api.post('/requests/', payload);
      navigate(`/requests/${res.data.id}`);
    } catch (err) {
      const errData = err.response?.data;
      if (typeof errData === 'object') {
        const first = Object.values(errData)[0];
        setError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setError('Failed to submit assistance request.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to requests</span>
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rule-Based Helper Matching</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Create Assistance Request</h1>
          <p className="text-xs text-slate-500 mt-1">
            Fill in the details below. Our matching system will rank qualified verified helpers in your barangay.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Request Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Need help fixing a computer / Plumbing leak repair"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assistance Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value, required_skill: '' })}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Specific Skill (Optional)
              </label>
              <select
                value={formData.required_skill}
                onChange={(e) => setFormData({ ...formData, required_skill: e.target.value })}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="">Any skill in this category</option>
                {filteredSkills.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preferred Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  required
                  value={formData.preferred_date}
                  onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preferred Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.preferred_time}
                  onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                  placeholder="e.g. 2:00 PM / Morning / Flexible"
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Approximate Location / Zone <span className="text-rose-500">*</span>
              </label>
              {zones.length > 0 ? (
                <select
                  required
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {zones.map((z, idx) => (
                    <option key={idx} value={z}>{z}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  placeholder="e.g. Zone 3"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              )}
              <span className="text-[11px] text-slate-400 mt-1 block">Exact house address will not be posted publicly.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Urgency Level
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="LOW">Low - Anytime this week</option>
                <option value="MEDIUM">Medium - Within 1-2 days</option>
                <option value="HIGH">High - Urgent needed today/tomorrow</option>
                <option value="EMERGENCY">Emergency / Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide context on what help you require so helpers can prepare proper tools..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Additional Notes (Optional)
            </label>
            <input
              type="text"
              value={formData.additional_notes}
              onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
              placeholder="e.g. I have ladder and screwdrivers available on site..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting & Matching...' : 'Submit Assistance Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequestPage;
