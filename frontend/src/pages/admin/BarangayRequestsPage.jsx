import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Search, Filter, AlertCircle, Clock, CheckCircle2, XCircle, ArrowUpRight, ShieldAlert, User, MapPin } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ReassignHelperModal from '../../components/ReassignHelperModal';

export const BarangayRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reassignModalReq, setReassignModalReq] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let url = '/assistance/requests/';
      const params = [];
      if (statusFilter) params.push(`status=${statusFilter}`);
      if (urgencyFilter) params.push(`urgency=${urgencyFilter}`);
      if (params.length) url += `?${params.join('&')}`;

      const res = await api.get(url);
      setRequests(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, urgencyFilter]);

  const handleAdminCancel = async (id) => {
    if (!window.confirm('Are you sure you want to administratively cancel this request?')) return;
    try {
      await api.patch(`/assistance/requests/${id}/cancel/`);
      fetchRequests();
    } catch (err) {
      alert('Error cancelling request: ' + (err.response?.data?.detail || err.message));
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = req.title.toLowerCase().includes(q);
      const matchDesc = req.description?.toLowerCase().includes(q);
      const matchReq = `${req.requester_details?.first_name} ${req.requester_details?.last_name}`.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchReq) return false;
    }
    return true;
  });

  if (loading) return <LoadingSpinner text="Loading assistance request registry..." />;

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
            <HeartHandshake className="w-6 h-6 text-emerald-600" />
            Assistance Request Supervisor Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Administrative monitoring and dispatch oversight for community requests across all zones.
          </p>
        </div>

        {/* Pipeline Summary Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold">
            {requests.filter(r => r.status === 'PENDING').length} Pending
          </span>
          <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold">
            {requests.filter(r => ['ACCEPTED', 'IN_PROGRESS'].includes(r.status)).length} In Progress
          </span>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
            {requests.filter(r => r.status === 'COMPLETED').length} Completed
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by request title, description, or requester name..."
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
            <option value="">All Statuses</option>
            <option value="PENDING">Pending (Looking for helper)</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="">All Urgency Levels</option>
            <option value="EMERGENCY">Emergency (Immediate)</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          title="No Assistance Requests Found"
          description="No requests match the selected supervisor filters."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Request & Category</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Assigned Helper</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{req.title}</div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        {req.category_details?.name || 'General Aid'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {req.requester_details?.first_name} {req.requester_details?.last_name}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {req.requester_details?.zone || 'Zone N/A'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {req.urgency === 'EMERGENCY' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 flex items-center gap-1 w-max animate-pulse">
                          <AlertCircle className="w-3 h-3" /> EMERGENCY
                        </span>
                      ) : req.urgency === 'HIGH' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 w-max">
                          HIGH
                        </span>
                      ) : req.urgency === 'MEDIUM' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 w-max">
                          MEDIUM
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 w-max">
                          LOW
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {req.helper_details ? (
                        <div>
                          <div className="font-bold text-slate-800">
                            {req.helper_details.first_name} {req.helper_details.last_name}
                          </div>
                          <div className="text-[10px] text-slate-400">{req.helper_details.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned (Matching)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${
                        req.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : req.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : req.status === 'CANCELLED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/requests/${req.id}`}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          View
                        </Link>
                        {['PENDING', 'ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS'].includes(req.status) && (
                          <button
                            onClick={() => setReassignModalReq(req)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors"
                          >
                            Reassign
                          </button>
                        )}
                        {req.status !== 'COMPLETED' && req.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleAdminCancel(req.id)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Supervisor Reassign Helper Modal */}
      {reassignModalReq && (
        <ReassignHelperModal
          isOpen={Boolean(reassignModalReq)}
          onClose={() => setReassignModalReq(null)}
          requestId={reassignModalReq.id}
          currentHelperId={reassignModalReq.assigned_helper}
          onReassigned={fetchRequests}
        />
      )}
    </div>
  );
};

export default BarangayRequestsPage;
