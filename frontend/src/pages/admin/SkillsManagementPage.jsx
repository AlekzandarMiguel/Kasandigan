import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Search, ShieldCheck, CheckCircle2, Layers, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export const SkillsManagementPage = () => {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    requires_certification: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [skillsRes, catRes] = await Promise.all([
        api.get('/skills/skills/'),
        api.get('/skills/categories/'),
      ]);
      setSkills(skillsRes.data.results || skillsRes.data || []);
      setCategories(catRes.data.results || catRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    try {
      await api.post('/skills/skills/', {
        ...formData,
        category: formData.category ? parseInt(formData.category) : null,
      });
      setShowModal(false);
      setFormData({ name: '', description: '', category: '', requires_certification: false });
      fetchData();
    } catch (err) {
      alert('Failed to create skill: ' + (err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message));
    }
  };

  const filteredSkills = skills.filter((s) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchDesc = s.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  if (loading) return <LoadingSpinner text="Loading skills taxonomy..." />;

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
            <Wrench className="w-6 h-6 text-emerald-600" />
            Skills Taxonomy & Credential Standards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Define recognized community skills, trade specializations, and mandatory certification flags for helpers.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Recognized Skill
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search recognized skills by name or trade description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <EmptyState
          title="No Skills Defined"
          description="Click 'Add Recognized Skill' to introduce a trade or service specialization."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Wrench className="w-5 h-5" />
                  </div>
                  {skill.requires_certification && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <ShieldCheck className="w-3 h-3" /> Cert Required
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mt-3">{skill.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {skill.description || 'General community service skill without additional description.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1 text-slate-600 font-semibold">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  {skill.category_details?.name || 'General Category'}
                </span>
                <span>Active in Rule Engine (+50 pts)</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Skill Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-600" /> Add New Recognized Skill
            </h3>
            <form onSubmit={handleCreateSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skill Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrical Wiring, Plumbing, Mathematics Tutoring"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                >
                  <option value="">Select Category (Optional)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skill Description & Scope</label>
                <textarea
                  rows="3"
                  placeholder="Describe the trade requirements, safety protocols, or scope..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  checked={formData.requires_certification}
                  onChange={(e) => setFormData({ ...formData, requires_certification: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">Requires Verified Certification / TESDA</div>
                  <div className="text-[10px] text-slate-500">Helpers must upload proof of credential to offer this skill.</div>
                </div>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  Create Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsManagementPage;
