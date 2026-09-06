import PageHeader from '../../components/PageHeader';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Star, Clock, User, HeartHandshake, ChevronRight, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export const AssistanceTrackerPage = () => {
  const { user } = useAuth();
  const [activeRequests, setActiveRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracker = async () => {
      try {
        const [myReqsRes, helpReqsRes, ratingsRes] = await Promise.all([
          api.get('/requests/?scope=my_requests'),
          api.get('/requests/?scope=my_helping'),
          api.get(`/ratings/?helper=${user?.id}`),
        ]);

        const all = [...(myReqsRes.data.results || []), ...(helpReqsRes.data.results || [])];
        const unique = Array.from(new Map(all.map((item) => [item.id, item])).values());

        setActiveRequests(unique.filter((r) => ['ACCEPTED', 'IN_PROGRESS'].includes(r.status)));
        setCompletedRequests(unique.filter((r) => r.status === 'COMPLETED'));
        setRatings(ratingsRes.data.results || ratingsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTracker();
  }, [user]);

  if (loading) return <LoadingSpinner text="Loading assistance tracker..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        icon={CheckCircle2}
        badge="Citizen Bayanihan Ledger"
        badgeIcon={CheckCircle2}
        title="My Assistance Activity"
        description="Track active commitments, view completed community service, and review neighbor commendations."
      />

      {/* Active Commitments */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Active Commitments (In Progress / Accepted)
          </h3>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
            {activeRequests.length} Active
          </span>
        </div>

        {activeRequests.length > 0 ? (
          <div className="space-y-3">
            {activeRequests.map((req) => (
              <Link
                key={req.id}
                to={`/requests/${req.id}`}
                className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 bg-slate-50/50 hover:bg-white transition-all flex items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{req.category_name}</span>
                    <StatusBadge status={req.status} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {req.title}
                  </h4>
                  <div className="text-xs text-slate-500">
                    {req.requester === user?.id
                      ? `Helper: ${req.assigned_helper_name || 'Assigned'}`
                      : `Assisting: ${req.requester_name}`} • {req.zone} • {req.preferred_date}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No active commitments" description="You have no ongoing assistance transactions right now." />
        )}
      </div>

      {/* Completed History */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Completed Assistance History
          </h3>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            {completedRequests.length} Completed
          </span>
        </div>

        {completedRequests.length > 0 ? (
          <div className="space-y-3">
            {completedRequests.map((req) => (
              <Link
                key={req.id}
                to={`/requests/${req.id}`}
                className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-4 group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400">{req.category_name}</span>
                    <StatusBadge status="COMPLETED" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{req.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {req.requester === user?.id
                      ? `Helped by ${req.assigned_helper_name}`
                      : `You helped ${req.requester_name}`} • Completed on {new Date(req.completed_at || req.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No completed records yet" description="Completed transactions will be logged here." />
        )}
      </div>

      {/* Reviews Received */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Community Reviews Received
          </h3>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            {ratings.length} Review{ratings.length === 1 ? '' : 's'}
          </span>
        </div>

        {ratings.length > 0 ? (
          <div className="space-y-3">
            {ratings.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{r.requester_name}</span>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                    {'★'.repeat(r.score)} ({r.score}.0)
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">For "{r.request_title}"</div>
                {r.review && (
                  <p className="text-xs text-slate-600 italic mt-1">"{r.review}"</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No ratings yet" description="Ratings from neighbors you assist will appear here." />
        )}
      </div>
    </div>
  );
};

export default AssistanceTrackerPage;
