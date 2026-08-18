import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Building2,
  UserX,
  UserCheck,
  Shield,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const formatBarangayName = (name) => {
  if (!name) return '';
  const clean = name.replace(/^(Barangay|Brgy\.?)\s+/i, '').trim();
  return `Barangay ${clean}`;
};

export const PlatformUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [selectedBarangayId, setSelectedBarangayId] = useState('');
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
      const fetchedUsers = usersRes.data.results || usersRes.data || [];
      const fetchedBarangays = brgyRes.data.results || brgyRes.data || [];
      setUsers(fetchedUsers);
      setBarangays(fetchedBarangays);

      // Default to first barangay if not set
      if (fetchedBarangays.length > 0 && !selectedBarangayId) {
        setSelectedBarangayId(String(fetchedBarangays[0].id));
      }
    } catch (err) {
      console.error('Error fetching user directory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Ensure selectedBarangayId is set once barangays are available
  useEffect(() => {
    if (barangays.length > 0 && !selectedBarangayId) {
      setSelectedBarangayId(String(barangays[0].id));
    }
  }, [barangays, selectedBarangayId]);

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

  const isPlatformAdminView = selectedBarangayId === 'PLATFORM';

  // Identify the currently selected barangay
  const currentBarangay = !isPlatformAdminView
    ? barangays.find((b) => String(b.id) === String(selectedBarangayId)) || barangays[0]
    : null;

  // Filter users based on search & role
  const matchesFilter = (u) => {
    if (selectedRole && u.role !== selectedRole) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = (u.full_name || `${u.first_name || ''} ${u.last_name || ''}`).toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchPhone = u.mobile_number?.toLowerCase().includes(q);
      const matchZone = u.zone?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchZone) return false;
    }
    return true;
  };

  // Filtered users for the active selection
  const currentBarangayAllUsers = currentBarangay
    ? users.filter((u) => u.barangay === currentBarangay.id)
    : [];

  const displayedUsers = isPlatformAdminView
    ? users.filter((u) => (u.role === 'PLATFORM_ADMIN' || !u.barangay) && matchesFilter(u))
    : currentBarangayAllUsers.filter(matchesFilter);

  const platformAdminTotalCount = users.filter((u) => u.role === 'PLATFORM_ADMIN' || !u.barangay).length;

  if (loading) return <LoadingSpinner text="Loading users and barangay tenants..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        badge="SaaS Infrastructure & Multi-Tenant Security"
        badgeIcon={Users}
        title="Barangay-Separated User Directory"
        description="Citizen and administrator directories partitioned strictly by Barangay tenant, with separate accounts control."
        theme="indigo"
      />

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="font-bold text-emerald-600 hover:text-emerald-900 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Barangay Dropdown Selector & Quick Telemetry Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0 shadow-xs">
              {isPlatformAdminView ? (
                <Shield className="w-6 h-6 text-indigo-600" />
              ) : (
                <Building2 className="w-6 h-6 text-emerald-600" />
              )}
            </div>
            <div>
              <label htmlFor="barangay-select" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Choose Barangay Tenant
              </label>
              <div className="relative mt-1">
                <select
                  id="barangay-select"
                  value={selectedBarangayId}
                  onChange={(e) => {
                    setSelectedBarangayId(e.target.value);
                    setSearch('');
                  }}
                  style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
                  className="w-full sm:w-[380px] text-sm font-black text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl px-4 py-2.5 pr-10 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer transition-all shadow-2xs appearance-none"
                >
                  <optgroup label="Official Barangays (20 Tenants)">
                    {barangays.map((b) => {
                      const count = users.filter((u) => u.barangay === b.id).length;
                      return (
                        <option key={b.id} value={String(b.id)}>
                          {formatBarangayName(b.name)} ({count} {count === 1 ? 'user' : 'users'})
                        </option>
                      );
                    })}
                  </optgroup>
                  <optgroup label="System Administration">
                    <option value="PLATFORM">
                      Platform Superadministrators ({platformAdminTotalCount} accounts)
                    </option>
                  </optgroup>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Quick Metrics for the Chosen Barangay */}
          {!isPlatformAdminView && currentBarangay && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200">
                Tenant: <span className="font-mono text-emerald-700 font-extrabold">{currentBarangay.code || 'MRM'}</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-800 shadow-2xs">
                {currentBarangayAllUsers.length} Users Total
              </span>
              <span className="px-2.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[11px]">
                {currentBarangayAllUsers.filter((u) => u.role === 'BARANGAY_ADMIN').length} Admin
              </span>
              <span className="px-2.5 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 font-bold text-[11px]">
                {currentBarangayAllUsers.filter((u) => u.role === 'BARANGAY_STAFF').length} Staff
              </span>
              <span className="px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px]">
                {currentBarangayAllUsers.filter((u) => u.role === 'RESIDENT').length} Residents
              </span>
            </div>
          )}

          {isPlatformAdminView && (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold">
                {platformAdminTotalCount} Root Operators
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200">
                Cross-Tenant Access Scope
              </span>
            </div>
          )}
        </div>

        {/* Search and Role Filter for the Chosen Barangay */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isPlatformAdminView
                  ? 'Search platform administrators...'
                  : `Search users in ${formatBarangayName(currentBarangay?.name)} by name, email, phone, or zone...`
              }
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {!isPlatformAdminView && (
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
            >
              <option value="">All Account Roles</option>
              <option value="BARANGAY_ADMIN">Barangay Admin</option>
              <option value="BARANGAY_STAFF">Barangay Staff</option>
              <option value="RESIDENT">Resident (Citizen)</option>
            </select>
          )}
        </div>
      </div>

      {/* CHOSEN BARANGAY PANEL - ONLY SHOW THE CHOSEN BARANGAY */}
      {!isPlatformAdminView && currentBarangay && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all">
          {/* Barangay Section Banner */}
          <div className="p-5 bg-gradient-to-r from-slate-50 to-emerald-50/40 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-slate-900">
                    {formatBarangayName(currentBarangay.name)}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-slate-600 border border-slate-200">
                    Slug: {currentBarangay.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    currentBarangay.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {currentBarangay.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  {currentBarangay.municipality_city || 'Maramag'}, {currentBarangay.province || 'Bukidnon'}
                  {currentBarangay.contact_number && (
                    <span className="ml-2 flex items-center gap-1 text-slate-400">
                      <Phone className="w-3 h-3" /> {currentBarangay.contact_number}
                    </span>
                  )}
                  {currentBarangay.email && (
                    <span className="ml-2 flex items-center gap-1 text-slate-400">
                      <Mail className="w-3 h-3" /> {currentBarangay.email}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              Showing <span className="font-bold text-slate-900">{displayedUsers.length}</span> of{' '}
              <span className="font-bold text-slate-900">{currentBarangayAllUsers.length}</span> registered users
            </div>
          </div>

          {/* Barangay User Table */}
          {displayedUsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600">No users found in {formatBarangayName(currentBarangay.name)}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {search || selectedRole
                  ? 'Try clearing your search query or role filter.'
                  : 'No residents or staff have registered under this barangay yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-5">Name & Email</th>
                    <th className="py-3.5 px-5">Tenant Role</th>
                    <th className="py-3.5 px-5">Zone / Purok</th>
                    <th className="py-3.5 px-5">Verification</th>
                    <th className="py-3.5 px-5">Account State</th>
                    <th className="py-3.5 px-5 text-right">Administrative Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {displayedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900 text-sm">
                          {u.full_name || `${u.first_name || ''} ${u.last_name || ''}`}
                        </div>
                        <div className="text-slate-400 text-xs">{u.email}</div>
                        {u.mobile_number && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" /> {u.mobile_number}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            u.role === 'BARANGAY_ADMIN'
                              ? 'bg-indigo-100 text-indigo-800'
                              : u.role === 'BARANGAY_STAFF'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
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
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer ${
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
      )}

      {/* PLATFORM SUPERADMINISTRATORS PANEL */}
      {isPlatformAdminView && (
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
              {displayedUsers.length} Root Operators
            </span>
          </div>

          {displayedUsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600">No platform administrators match your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-5">Name & Email</th>
                    <th className="py-3.5 px-5">Role Scope</th>
                    <th className="py-3.5 px-5">Assigned Barangay</th>
                    <th className="py-3.5 px-5">Account State</th>
                    <th className="py-3.5 px-5 text-right">Administrative Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {displayedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900 text-sm">
                          {u.full_name || `${u.first_name || ''} ${u.last_name || ''}`}
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
                          Active
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <span className="text-[11px] text-slate-400 font-bold italic">
                          Protected Root Account
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlatformUsersPage;
