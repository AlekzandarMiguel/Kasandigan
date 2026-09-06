import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Search, Plus, MapPin, Phone, User, Clock, AlertTriangle, CheckCircle, ArrowRight, ShieldAlert, ExternalLink, Wrench } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import WalkInIntakeModal from '../../components/WalkInIntakeModal';
import ReassignHelperModal from '../../components/ReassignHelperModal';

export const StaffRequestsTriagePage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState('ALL');
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [reassignModalTicket, setReassignModalTicket] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/assistance/requests/');
      setRequests(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((r) => {
    if (statusTab === 'PENDING' && r.status !== 'PENDING') return false;
    if (statusTab === 'ACTIVE' && !['ACCEPTED', 'IN_PROGRESS'].includes(r.status)) return false;
    if (statusTab === 'COMPLETED' && r.status !== 'COMPLETED') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchDesc = r.description?.toLowerCase().includes(q);
      const matchRequester = `${r.requester_details?.first_name} ${r.requester_details?.last_name}`.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchRequester) return false;
    }
    return true;
  });

  if (loading) return <LoadingSpinner text="Loading assistance triage board..." />;

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
            <HeartHandshake className="w-6 h-6 text-teal-600" />
            Community Aid & Field Triage Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Desk officer intake queue to triage incoming requests, monitor field work, and verify completion on the ground.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIntakeOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Intake Walk-In Citizen Request
          </button>
        </div>
      </div>

      {/* Triage Tabs & Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setStatusTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${statusTab === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            All Tickets ({requests.length})
          </button>
          <button
            onClick={() => setStatusTab('PENDING')}
            className={`px-3 py-1.5 rounded-lg transition-all ${statusTab === 'PENDING' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Awaiting Helper ({requests.filter(r => r.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setStatusTab('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg transition-all ${statusTab === 'ACTIVE' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            In Progress ({requests.filter(r => ['ACCEPTED', 'IN_PROGRESS'].includes(r.status)).length})
          </button>
          <button
            onClick={() => setStatusTab('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg transition-all ${statusTab === 'COMPLETED' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Completed ({requests.filter(r => r.status === 'COMPLETED').length})
          </button>
        </div>

        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search tickets by citizen or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Triage Cards */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          title="No Requests in this Triage State"
          description="There are currently no community assistance tickets matching this filter."
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((ticket) => (
            <div
              key={ticket.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-teal-200 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    ticket.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-800'
                      : ticket.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {ticket.status}
                  </span>
                  <span className="text-xs font-bold text-teal-700">
                    {ticket.category_details?.name || 'General Aid'}
                  </span>
                  {ticket.urgency === 'EMERGENCY' && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-100 text-rose-800 flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3 h-3" /> EMERGENCY PRIORITY
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  Ticket #{ticket.id} • {new Date(ticket.created_at).toLocaleString()}
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">{ticket.title}</h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{ticket.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Requester (Citizen)</div>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {ticket.requester_details?.first_name} {ticket.requester_details?.last_name}
                    </div>
                    <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {ticket.requester_details?.zone || 'Zone not specified'}
                    </div>
                  </div>
                  {ticket.requester_details?.phone_number && (
                    <a
                      href={`tel:${ticket.requester_details.phone_number}`}
                      className="p-2 bg-white rounded-lg border border-slate-200 text-teal-600 hover:bg-teal-50 transition-colors"
                      title="Call citizen"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="p-3 bg-teal-50/50 border border-teal-100/60 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-teal-700 uppercase">Assigned Helper</div>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {ticket.helper_details ? (
                        `${ticket.helper_details.first_name} ${ticket.helper_details.last_name}`
                      ) : (
                        <span className="text-slate-400 italic">Rule Engine Matching Active</span>
                      )}
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {ticket.helper_details?.phone_number || 'Awaiting acceptance'}
                    </div>
                  </div>
                  {ticket.helper_details?.phone_number && (
                    <a
                      href={`tel:${ticket.helper_details.phone_number}`}
                      className="p-2 bg-white rounded-lg border border-slate-200 text-teal-600 hover:bg-teal-50 transition-colors"
                      title="Call helper"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Triage Desk Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-400">
                  {ticket.helpers_needed > 1 && (
                    <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md mr-2">
                      {ticket.helpers_needed} Helpers Needed
                    </span>
                  )}
                  {ticket.linked_resource_name && (
                    <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                      Tool Borrowed: {ticket.linked_resource_name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {['PENDING', 'ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS'].includes(ticket.status) && (
                    <button
                      onClick={() => setReassignModalTicket(ticket)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" /> Reassign
                    </button>
                  )}

                  <Link
                    to={`/requests/${ticket.id}`}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <span>View Detail & Stepper</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Walk-In Intake Modal */}
      <WalkInIntakeModal
        isOpen={intakeOpen}
        onClose={() => setIntakeOpen(false)}
        onCreated={fetchRequests}
      />

      {/* Supervisor Helper Reassign Modal */}
      {reassignModalTicket && (
        <ReassignHelperModal
          isOpen={Boolean(reassignModalTicket)}
          onClose={() => setReassignModalTicket(null)}
          requestId={reassignModalTicket.id}
          currentHelperId={reassignModalTicket.assigned_helper}
          onReassigned={fetchRequests}
        />
      )}
    </div>
  );
};

export default StaffRequestsTriagePage;
