import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, CheckCircle2, HeartHandshake, Tag, FileText, Info } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export const CategoriesManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'HeartHandshake',
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/skills/categories/');
      setCategories(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/skills/categories/', formData);
      setShowModal(false);
      setFormData({ name: '', description: '', icon: 'HeartHandshake' });
      fetchCategories();
    } catch (err) {
      alert('Failed to create category: ' + (err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message));
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) return <LoadingSpinner text="Loading assistance categories..." />;

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
            <Layers className="w-6 h-6 text-emerald-600" />
            Assistance Request Categories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure community aid categories, service classification groups, and citizen intake forms.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search assistance categories by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Categories Cards */}
      {filteredCategories.length === 0 ? (
        <EmptyState
          title="No Categories Found"
          description="Click 'Add Category' to organize citizen assistance requests into standard service groups."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Intake
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mt-3">{category.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-3">
                  {category.description || 'Assistance requests filed under this community classification.'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono text-[10px]">Slug: {category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}</span>
                <span className="text-emerald-600 font-bold">Public Available</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" /> Create Assistance Category
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Home Repairs, Emergency Transport, Childcare"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scope & Citizen Guidance</label>
                <textarea
                  rows="3"
                  placeholder="Guidelines for residents filing requests under this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagementPage;
