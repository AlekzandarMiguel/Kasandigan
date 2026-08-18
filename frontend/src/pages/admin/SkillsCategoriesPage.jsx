import PageHeader from '../../components/PageHeader';
import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Layers, Tag, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export const SkillsCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Category
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // New Skill
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCat, setNewSkillCat] = useState('');
  const [newSkillDesc, setNewSkillDesc] = useState('');

  const [message, setMessage] = useState('');

  const fetchTaxonomies = async () => {
    try {
      const [catRes, skillRes] = await Promise.all([
        api.get('/categories/'),
        api.get('/skills/'),
      ]);
      const catList = catRes.data.results || catRes.data || [];
      setCategories(catList);
      setSkills(skillRes.data.results || skillRes.data || []);
      if (catList.length > 0 && !newSkillCat) {
        setNewSkillCat(catList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxonomies();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories/', {
        name: newCatName,
        description: newCatDesc,
      });
      setMessage(`Category '${newCatName}' created!`);
      setNewCatName('');
      setNewCatDesc('');
      fetchTaxonomies();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add category.');
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      await api.post('/skills/', {
        category: Number(newSkillCat),
        name: newSkillName,
        description: newSkillDesc,
      });
      setMessage(`Skill '${newSkillName}' added!`);
      setNewSkillName('');
      setNewSkillDesc('');
      fetchTaxonomies();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add skill.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading skill taxonomies..." />;

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Wrench}
        badge="Barangay Administration"
        badgeIcon={Wrench}
        title="Categories & Skills Taxonomy"
        description="Manage assistance categories and community skills recognized in your barangay."
        theme="slate"
      />

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Grid: Categories & Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="w-4 h-4 text-emerald-600" />
            Assistance Categories ({categories.length})
          </h3>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {categories.map((c) => (
              <div key={c.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-800">{c.name}</h4>
                  <p className="text-slate-400 text-[11px]">{c.description || 'General assistance category'}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {c.skills_count || 0} skills
                </span>
              </div>
            ))}
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Add New Category</h4>
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Legal & Documentation Assistance"
              className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-300"
            />
            <input
              type="text"
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              placeholder="Short description..."
              className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-300"
            />
            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl">
                Add Category
              </button>
            </div>
          </form>
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Tag className="w-4 h-4 text-teal-600" />
            Specific Skills ({skills.length})
          </h3>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {skills.map((s) => (
              <div key={s.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-800">{s.name}</h4>
                  <span className="text-[10px] text-slate-400">{s.category_name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Skill Form */}
          <form onSubmit={handleAddSkill} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Add New Skill</h4>
            <select
              value={newSkillCat}
              onChange={(e) => setNewSkillCat(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-300"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              type="text"
              required
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. Solar Inverter Troubleshooting"
              className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-300"
            />
            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl">
                Add Skill
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SkillsCategoriesPage;
