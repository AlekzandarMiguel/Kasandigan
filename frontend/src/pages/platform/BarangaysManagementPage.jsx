import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, Shield, MapPin, Edit2, X } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export const BarangaysManagementPage = () => {
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    code: '',
    municipality_city: '',
    province: '',
    region: 'National Capital Region',
    contact_number: '',
    email: '',
    zones: 'Zone 1, Zone 2, Zone 3',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchBarangays = async () => {
    setLoading(true);
    try {
      const res = await api.get('/barangays/');
      setBarangays(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarangays();
  }, []);

  const handleCreateBarangay = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const zonesList = form.zones.split(',').map((z) => z.trim()).filter(Boolean);
      await api.post('/barangays/', {
        ...form,
        zones: zonesList,
      });
      setMessage(`Barangay tenant '${form.name}' created!`);
      setModalOpen(false);
      setForm({
        name: '',
        code: '',
        municipality_city: '',
        province: '',
        region: 'National Capital Region',
        contact_number: '',
        email: '',
        zones: 'Zone 1, Zone 2, Zone 3',
      });
      fetchBarangays();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create barangay.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (bId) => {
    try {
      const res = await api.post(`/barangays/${bId}/toggle_status/`);
      setMessage(res.data.detail);
      fetchBarangays();
    } catch (err) {
      alert('Failed to toggle status.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading barangay tenants..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            Barangay Tenants Provisioning
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Provision, configure, and isolate barangay tenants operating on the SaaS platform.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Barangay</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Tenants Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Barangay Name</th>
                <th className="px-6 py-4">Municipality / Province</th>
                <th className="px-6 py-4">Contact & Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {barangays.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 text-sm">{b.name}</div>
                    <div className="text-slate-400 font-mono text-[11px]">Slug: {b.code}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div>{b.municipality_city}, {b.province}</div>
                    <div className="text-[11px] text-slate-400">{b.region}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div>{b.email || 'No email registered'}</div>
                    <div className="text-[11px] text-slate-400">{b.contact_number || 'No phone'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(b.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                        b.status === 'ACTIVE'
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {b.status === 'ACTIVE' ? 'Suspend Tenant' : 'Reactivate Tenant'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl relative space-y-4">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900">Provision Barangay Tenant</h3>

            <form onSubmit={handleCreateBarangay} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Barangay Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({
                      ...form,
                      name: e.target.value,
                      code: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                    })}
                    placeholder="e.g. Barangay San Antonio"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tenant Code / Slug</label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g. san-antonio"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Municipality / City</label>
                  <input
                    type="text"
                    required
                    value={form.municipality_city}
                    onChange={(e) => setForm({ ...form, municipality_city: e.target.value })}
                    placeholder="e.g. Pasig City"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Province</label>
                  <input
                    type="text"
                    required
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                    placeholder="e.g. Metro Manila"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Barangay Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="info@barangay.gov.ph"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={form.contact_number}
                    onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
                    placeholder="+63 2 8..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Zones / Puroks (comma separated)
                </label>
                <input
                  type="text"
                  value={form.zones}
                  onChange={(e) => setForm({ ...form, zones: e.target.value })}
                  placeholder="Zone 1, Zone 2, Zone 3, Purok Riverside"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Provision Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarangaysManagementPage;
