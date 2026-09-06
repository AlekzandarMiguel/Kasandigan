import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, Mail, MapPin, CheckCircle, Clock, ShieldCheck, XCircle, UserCheck, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export const StaffResidentsDirectoryPage = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const [selectedResident, setSelectedResident] = useState(null);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounts/users/');
      const allUsers = res.data.results || res.data || [];
      setResidents(allUsers.filter(u => u.role === 'RESIDENT'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  const handleVerifyInPerson = async (residentId) => {
    if (!window.confirm('Confirm in-person verification with physical government ID presented at desk?')) return;
    try {
      await api.patch(`/accounts/users/${residentId}/`, {
        verification_status: 'VERIFIED',
      });
      fetchResidents();
      setSelectedResident(null);
    } catch (err) {
      alert('Error updating verification: ' + (err.response?.data?.detail || err.message));
    }
  };

  const zones = Array.from(new Set(residents.map(r => r.zone).filter(Boolean)));

  const filteredResidents = residents.filter((r) => {
    if (zoneFilter && r.zone !== zoneFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = `${r.first_name} ${r.last_name}`.toLowerCase().includes(q);
      const matchEmail = r.email?.toLowerCase().includes(q);
      const matchPhone = r.phone_number?.toLowerCase().includes(q);
      const matchZone = r.zone?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchZone) return false;
    }
    return true;
  });

  if (loading) return <LoadingSpinner text="Loading front-desk resident registry..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800">
              Staff Operations
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 mt-1">
            <Users className="w-6 h-6 text-teal-600" />
            Front-Desk Resident Quick Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Rapid resident identity verification and contact lookup for walk-ins and telephone inquiries at the barangay hall.
          </p>
        </div>

        <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3.5 py-2 rounded-xl">
          Total Registered: <span className="text-teal-700 font-extrabold">{residents.length}</span>
        </div>
      </div>

      {/* Search & Fast Filters */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Type citizen name, phone number, or street..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>

        <select
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value)}
          className="text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
        >
          <option value="">All Puroks / Zones</option>
          {zones.map(z => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
      </div>

      {/* Grid of Resident Cards for Fast Scanning */}
      {filteredResidents.length === 0 ? (
        <EmptyState
          title="No Matching Citizens Found"
          description="Try typing a different name or telephone number."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResidents.map((resident) => (
            <div
              key={resident.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 font-black flex items-center justify-center text-sm">
                      {resident.first_name?.[0] || 'R'}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        {resident.first_name} {resident.last_name}
                      </h3>
                      <div className="text-[11px] text-slate-400 font-mono">Resident #{resident.id}</div>
                    </div>
                  </div>

                  {resident.verification_status === 'VERIFIED' ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                      <CheckCircle className="w-2.5 h-2.5" /> VERIFIED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-800 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> UNVERIFIED
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="font-semibold text-slate-700">{resident.zone || 'No Zone Set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{resident.phone_number || 'No contact provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{resident.email}</span>
                  </div>
                </div>
              </div>

              {resident.verification_status !== 'VERIFIED' && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleVerifyInPerson(resident.id)}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> In-Person ID Verify
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffResidentsDirectoryPage;
