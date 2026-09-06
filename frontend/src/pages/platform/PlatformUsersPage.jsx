import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, ShieldCheck, Building2, UserX, UserCheck } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export const PlatformUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = '/platform/users/';
      const params = [];
      if (selectedBarangay) params.push(`barangay=${selectedBarangay}`);
      if (selectedRole) params.push(`role=${selectedRole}`);
      if (search) params.push(`search=${search}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get(url);
      setUsers(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        const res = await api.get('/barangays/');
        setBarangays(res.data.results || res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBarangays();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [selectedBarangay, selectedRole]);

  const handleToggleUserActive = async (userId) => {
    try {
      const res = await api.post(`/platform/users/${userId}/toggle_active/`);
      setMessage(res.data.detail);
      fetchUsers();
    } catch (err) {
      alert('Failed to toggle user status.');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  if (loading) return <LoadingSpinner text="Loading users across all tenants..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" />
          Global User Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Search and manage accounts across all barangay tenants operating on Kasandigan.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email address..."
            className="w-full text-sm pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </form>

        <select
          value={selectedBarangay}
          onChange={(e) => setSelectedBarangay(e.target.value)}
          className="text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
        >
          <option value="">All Barangays</option>
          {barangays.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
        >
          <option value="">All Roles</option>
          <option value="PLATFORM_ADMIN">Platform Admin</option>
          <option value="BARANGAY_ADMIN">Barangay Admin</option>
          <option value="BARANGAY_STAFF">Barangay Staff</option>
          <option value="RESIDENT">Resident</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Barangay</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Account Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 text-sm">{u.full_name}</div>
                    <div className="text-slate-400">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      {u.role?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {u.barangay_details?.name || 'Platform (Global)'}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={u.verification_status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.role !== 'PLATFORM_ADMIN' && (
                      <button
                        onClick={() => handleToggleUserActive(u.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                          u.is_active
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {u.is_active ? 'Suspend User' : 'Reactivate User'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlatformUsersPage;
