import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, ShieldCheck, Building2, UserX, UserCheck, Shield, MapPin, Phone, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export const PlatformUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, brgyRes] = await Promise.all([
        api.get('/platform/users/'),
        api.get('/barangays/'),
      ]);
      setUsers(usersRes.data.results || usersRes.data || []);
      setBarangays(brgyRes.data.results || brgyRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleUserActive = async (userId) => {
    try {
      const res = await api.post(`/platform/users/${userId}/toggle_active/`);
      setMessage(res.data.detail);
      // Re-fetch users
      const usersRes = await api.get('/platform/users/');
      setUsers(usersRes.data.results || usersRes.data || []);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert('Failed to toggle user status.');
    }
  };

  // Filter users based on search & role
  const filteredUsers = users.filter((u) => {
    if (selectedRole && u.role !== selectedRole) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = (u.full_name || `${u.first_name} ${u.last_name}`).toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchPhone = u.mobile_number?.toLowerCase().includes(q);
      const matchZone = u.zone?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchZone) return false;
    }
    return true;
  });

  // Group filtered users by Barangay
  const platformAdminUsers = filteredUsers.filter((u) => u.role === 'PLATFORM_ADMIN' || !u.barangay);

  const barangayUserGroups = barangays.map((b) => {
    const bUsers = filteredUsers.filter((u) => u.barangay === b.id);
    return {
      barangay: b,
      users: bUsers,
    };
  });

  // Visible groups based on activeTab
  const visibleBarangays = activeTab === 'ALL'
    ? barangayUserGroups
    : activeTab === 'PLATFORM'
    ? []
    : barangayUserGroups.filter((g) => g.barangay.id === parseInt(activeTab));

  const showPlatformAdmins = activeTab === 'ALL' || activeTab === 'PLATFORM';

  if (loading) return <LoadingSpinner text="Loading users across all barangays..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800">
            SaaS Infrastructure
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 mt-1">
          <Users className="w-6 h-6 text-indigo-600" />
          Barangay-Separated User Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Citizen and administrator directories partitioned strictly by Barangay tenant, with separate accounts control.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="font-bold text-emerald-600 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Barangay Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'ALL'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          All Barangays (Separated Panels) ({users.length})
        </button>

        {barangays.map((b) => {
          const count = users.filter((u) => u.barangay === b.id).length;
          return (
            <button
              key={b.id}
              onClick={() => setActiveTab(String(b.id))}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === String(b.id)
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              {b.name} ({count})
            </button>
          );
        })}

        <button
          onClick={() => setActiveTab('PLATFORM')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'PLATFORM'
              ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Platform Admins ({users.filter(u => u.role === 'PLATFORM_ADMIN').length})
        </button>
      </div>

      {/* Global Search and Role Filter */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email address, mobile number, or zone..."
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
        >
          <option value="">All Account Roles</option>
          <option value="BARANGAY_ADMIN">Barangay Admin</option>
          <option value="BARANGAY_STAFF">Barangay Staff</option>
          <option value="RESIDENT">Resident (Citizen)</option>
          <option value="PLATFORM_ADMIN">Platform Superadmin</option>
        </select>
      </div>

      {/* Separated Barangay Panels */}
      <div className="space-y-8">
        {visibleBarangays.map(({ barangay, users: bUsers }) => (
          <div
            key={barangay.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
          >
            {/* Barangay Section Banner */}
            <div className="p-5 bg-gradient-to-r from-slate-50 to-emerald-50/40 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900">{barangay.name}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-slate-600 border border-slate-200">
                      {barangay.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    {barangay.city}, {barangay.province}
                  </p>
                </div>
              </div>

              {/* Barangay Tenant Breakdown Pill */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 shadow-2xs">
                  {bUsers.length} Users Total
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[11px]">
                  {bUsers.filter(u => u.role === 'BARANGAY_ADMIN').length} Admin
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 font-bold text-[11px]">
                  {bUsers.filter(u => u.role === 'BARANGAY_STAFF').length} Staff
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px]">
                  {bUsers.filter(u => u.role === 'RESIDENT').length} Residents
                </span>
              </div>
            </div>

            {/* Barangay Specific User Table */}
            {bUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 italic">
                No users found in {barangay.name} matching your search/filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/60 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-5">Name & Email</th>
                      <th className="py-3 px-5">Tenant Role</th>
                      <th className="py-3 px-5">Zone / Purok</th>
                      <th className="py-3 px-5">Verification</th>
                      <th className="py-3 px-5">Account State</th>
                      <th className="py-3 px-5 text-right">Administrative Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {bUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-slate-900 text-sm">
                            {u.full_name || `${u.first_name} ${u.last_name}`}
                          </div>
                          <div className="text-slate-400 text-xs">{u.email}</div>
                          {u.mobile_number && (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" /> {u.mobile_number}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            u.role === 'BARANGAY_ADMIN'
                              ? 'bg-indigo-100 text-indigo-800'
                              : u.role === 'BARANGAY_STAFF'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {u.role?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 whitespace-nowrap">
                          {u.zone ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                              <MapPin className="w-3 h-3 text-emerald-600" /> {u.zone}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <StatusBadge status={u.verification_status} />
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          {u.is_active ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                              Suspended
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleToggleUserActive(u.id)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 ${
                              u.is_active
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {u.is_active ? (
                              <>
                                <UserX className="w-3 h-3" /> Suspend
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3 h-3" /> Reactivate
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

        {/* Separated Platform Global Administrators Panel */}
        {showPlatformAdmins && platformAdminUsers.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shadow-xs">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Platform Superadministrators</h2>
                  <p className="text-xs text-indigo-200">
                    Cross-tenant operators with root SaaS infrastructure permissions.
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white">
                {platformAdminUsers.length} Root Operators
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Name & Email</th>
                    <th className="py-3 px-5">Role Scope</th>
                    <th className="py-3 px-5">Assigned Barangay</th>
                    <th className="py-3 px-5">Account State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {platformAdminUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900 text-sm">
                          {u.full_name || `${u.first_name} ${u.last_name}`}
                        </div>
                        <div className="text-slate-400 text-xs">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800">
                          GLOBAL PLATFORM ADMIN
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-bold text-indigo-600">
                          <Building2 className="w-3.5 h-3.5" /> All Tenants (Root)
                        </span>
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformUsersPage;
