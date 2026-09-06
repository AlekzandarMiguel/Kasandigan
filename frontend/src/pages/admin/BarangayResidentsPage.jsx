import PageHeader from '../../components/PageHeader';
import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, ShieldCheck, ShieldAlert, CheckCircle, XCircle, Phone, MapPin, Mail, Ban, UserCheck, Star } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export const BarangayResidentsPage = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const [selectedResident, setSelectedResident] = useState(null);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounts/users/');
      // Filter for residents only
      const allUsers = res.data.results || res.data || [];
      const residentUsers = allUsers.filter(u => u.role === 'RESIDENT');
      setResidents(residentUsers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  const handleToggleStatus = async (userId, currentActive) => {
    try {
      await api.patch(`/accounts/users/${userId}/`, { is_active: !currentActive });
      fetchResidents();
    } catch (err) {
      alert('Failed to update resident status: ' + (err.response?.data?.detail || err.message));
    }
  };

  // Unique zones
  const zones = Array.from(new Set(residents.map(r => r.zone).filter(Boolean)));

  const filteredResidents = residents.filter((r) => {
    if (statusFilter && r.verification_status !== statusFilter) return false;
    if (zoneFilter && r.zone !== zoneFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const fullName = `${r.first_name} ${r.last_name}`.toLowerCase();
      const matchName = fullName.includes(q);
      const matchEmail = r.email?.toLowerCase().includes(q);
      const matchPhone = r.phone_number?.toLowerCase().includes(q);
      const matchZone = r.zone?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchZone) return false;
    }
    return true;
  });

  if (loading) return <LoadingSpinner text="Loading resident directory..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        badge="Barangay Administration"
        badgeIcon={Users}
        title="Resident Master Directory"
        description="Comprehensive registry of registered barangay residents, verification records, zones, and account statuses."
        theme="slate"
        actions={
          <div className="px-4 py-2 bg-white/15 border border-white/20 rounded-xl text-xs font-bold text-white flex items-center gap-2 backdrop-blur-xs">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>{residents.filter(r => r.verification_status === 'VERIFIED').length} Verified Residents</span>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by resident name, email, phone number, or zone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="">All Verification States</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="PENDING">Pending Review</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="">All Zones / Puroks</option>
            {zones.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Table */}
      {filteredResidents.length === 0 ? (
        <EmptyState
          title="No Residents Found"
          description="No resident accounts match your filter criteria."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Resident</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Zone / Purok</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Helper Rating</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredResidents.map((resident) => (
                  <tr key={resident.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                          {resident.first_name?.[0] || 'R'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {resident.first_name} {resident.last_name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: #{resident.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{resident.email}</span>
                        </div>
                        {resident.phone_number && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{resident.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-slate-700">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {resident.zone || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {resident.verification_status === 'VERIFIED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" /> VERIFIED
                        </span>
                      ) : resident.verification_status === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                          PENDING ID
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">
                          <XCircle className="w-3 h-3" /> REJECTED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 font-bold text-slate-800">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{parseFloat(resident.rating || 5.0).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {resident.is_active ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-rose-50 text-rose-700 border border-rose-200">
                          SUSPENDED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(resident.id, resident.is_active)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 ${
                          resident.is_active
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {resident.is_active ? (
                          <>
                            <Ban className="w-3 h-3" /> Suspend
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3" /> Re-activate
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarangayResidentsPage;
