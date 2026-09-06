import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Filter, Check, X, Shield, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export const ResidentVerificationsPage = () => {
  const [residents, setResidents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Verification dialog
  const [selectedResident, setSelectedResident] = useState(null);
  const [newStatus, setNewStatus] = useState('VERIFIED');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchResidents = async () => {
    setLoading(true);
    try {
      let url = '/residents/';
      const params = [];
      if (statusFilter) params.push(`status=${statusFilter}`);
      if (search) params.push(`search=${search}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get(url);
      setResidents(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResidents();
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!selectedResident) return;
    setSaving(true);

    try {
      await api.post(`/residents/${selectedResident.id}/verify/`, {
        status: newStatus,
        notes,
      });
      setMessage(`Resident ${selectedResident.full_name} status updated to ${newStatus}.`);
      setSelectedResident(null);
      setNotes('');
      fetchResidents();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update verification status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-emerald-600" />
          Resident Verification & Moderation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Verify resident accounts to allow participation in community assistance and skill exchanges.
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
            placeholder="Search by resident name, email, or zone..."
            className="w-full text-sm pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm px-3 py-2 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
        >
          <option value="">All Verification Statuses</option>
          <option value="PENDING_VERIFICATION">Pending Verification</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Residents Table */}
      {loading ? (
        <LoadingSpinner text="Loading residents directory..." />
      ) : residents.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Resident</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Zone</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Activity</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {residents.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{r.full_name}</div>
                      <div className="text-slate-400">{r.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {r.mobile_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {r.zone || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={r.verification_status} />
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div>{r.completed_assistance_count} completed</div>
                      <div className="text-amber-600 font-bold">{Number(r.rating_average || 0).toFixed(1)} ★</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedResident(r);
                          setNewStatus(r.verification_status === 'PENDING_VERIFICATION' ? 'VERIFIED' : r.verification_status);
                          setNotes(r.verification_notes || '');
                        }}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold rounded-xl transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No residents matching criteria" description="Try clearing your filters or search keywords." />
      )}

      {/* Verification Dialog */}
      {selectedResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Verify Resident Account
            </h3>
            <p className="text-xs text-slate-500">
              Managing verification for <strong className="text-slate-800">{selectedResident.full_name}</strong> ({selectedResident.email})
            </p>

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Verification Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="VERIFIED">Verified (Approved Resident)</option>
                  <option value="PENDING_VERIFICATION">Pending Verification</option>
                  <option value="REJECTED">Rejected (Not in barangay records)</option>
                  <option value="SUSPENDED">Suspended (Temporary/Permanent ban)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Verification / Moderation Notes
                </label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Confirmed on Barangay Voter's list / Census records..."
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedResident(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentVerificationsPage;
