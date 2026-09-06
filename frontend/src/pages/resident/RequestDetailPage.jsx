import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HeartHandshake, Calendar, Clock, MapPin, Tag, User,
  CheckCircle, ArrowLeft, Send, Star, AlertTriangle, ShieldCheck,
  Award, Flag, XCircle, Play, Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import RatingModal from '../../components/RatingModal';
import ReportModal from '../../components/ReportModal';

export const RequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [matches, setMatches] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Modals
  const [ratingOpen, setRatingOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const fetchRequestDetails = async () => {
    try {
      const res = await api.get(`/requests/${id}/`);
      setRequest(res.data);

      // Fetch invitations
      const invRes = await api.get(`/invitations/?request=${id}`);
      setInvitations(invRes.data.results || invRes.data || []);

      // If user is requester or staff/admin, fetch rule-based matching recommendations
      if (res.data.requester === user?.id || ['BARANGAY_STAFF', 'BARANGAY_ADMIN', 'PLATFORM_ADMIN'].includes(user?.role)) {
        const matchRes = await api.get(`/requests/${id}/matches/`);
        setMatches(matchRes.data.matches || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id, user]);

  const handleInvite = async (helperId) => {
    setActionLoading(true);
    try {
      await api.post(`/requests/${id}/invite_helper/`, {
        helper_id: helperId,
        message: 'Hello, I would appreciate your help with this request!',
      });
      setMessage('Invitation sent to helper!');
      fetchRequestDetails();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to send invitation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    setActionLoading(true);
    try {
      await api.post(`/invitations/${invitationId}/accept/`);
      setMessage('You accepted this assistance request!');
      fetchRequestDetails();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to accept invitation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    const reason = prompt('Optional: Reason for declining:');
    setActionLoading(true);
    try {
      await api.post(`/invitations/${invitationId}/decline/`, { reason: reason || '' });
      fetchRequestDetails();
    } catch (err) {
      alert('Failed to decline invitation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartAssistance = async () => {
    setActionLoading(true);
    try {
      await api.post(`/assistance/workflow/${id}/start/`);
      fetchRequestDetails();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to start assistance.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteAssistance = async () => {
    setActionLoading(true);
    try {
      await api.post(`/assistance/workflow/${id}/complete/`);
      fetchRequestDetails();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to complete assistance.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!window.confirm('Are you sure you want to cancel this assistance request?')) return;
    setActionLoading(true);
    try {
      await api.post(`/requests/${id}/cancel/`);
      fetchRequestDetails();
    } catch (err) {
      alert('Failed to cancel request.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading assistance request details..." />;
  if (!request) return <div className="p-8 text-center text-slate-500">Request not found.</div>;

  const isRequester = request.requester === user?.id;
  const isHelper = request.assigned_helper === user?.id;
  const myInvitation = invitations.find((inv) => inv.helper === user?.id && inv.status === 'INVITED');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to list</span>
      </button>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Main Request Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                {request.category_name}
              </span>
              <StatusBadge status={request.urgency} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {request.title}
            </h1>
            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-4 pt-1">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Requester: {request.requester_name}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {request.zone}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {request.preferred_date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {request.preferred_time}
              </span>
            </div>
          </div>

          <div className="flex sm:flex-col items-end gap-2 shrink-0">
            <StatusBadge status={request.status} className="text-sm px-3 py-1" />
            <button
              onClick={() => setReportOpen(true)}
              className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 flex items-center gap-1 mt-1 transition-colors"
            >
              <Flag className="w-3 h-3" /> Report Request
            </button>
          </div>
        </div>

        {/* Description & Requirements */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {request.description}
          </p>
        </div>

        {request.additional_notes && (
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-xs text-amber-900">
            <span className="font-bold">Additional Notes: </span> {request.additional_notes}
          </div>
        )}

        {/* Workflow Action Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {request.assigned_helper_name ? (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Assigned Helper: <strong className="text-slate-900">{request.assigned_helper_name}</strong></span>
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                Waiting for helper selection and confirmation.
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Helper Invitation Response */}
            {myInvitation && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleAcceptInvitation(myInvitation.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all"
                >
                  Accept Assistance Invitation
                </button>
                <button
                  onClick={() => handleDeclineInvitation(myInvitation.id)}
                  disabled={actionLoading}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all"
                >
                  Decline
                </button>
              </div>
            )}

            {/* Assistance progress controls */}
            {request.status === 'ACCEPTED' && (isRequester || isHelper) && (
              <button
                onClick={handleStartAssistance}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> Start Assistance
              </button>
            )}

            {request.status === 'IN_PROGRESS' && (isRequester || isHelper) && (
              <button
                onClick={handleCompleteAssistance}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Mark as Completed
              </button>
            )}

            {/* Rating Trigger */}
            {request.status === 'COMPLETED' && isRequester && !request.has_rating && (
              <button
                onClick={() => setRatingOpen(true)}
                className="px-4 py-2 text-xs font-bold text-amber-900 bg-amber-300 hover:bg-amber-400 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 fill-amber-900" /> Rate Helper
              </button>
            )}

            {/* Cancel Button */}
            {['PENDING', 'MATCHED', 'ACCEPTED'].includes(request.status) && (isRequester || user?.role in ['BARANGAY_STAFF', 'BARANGAY_ADMIN']) && (
              <button
                onClick={handleCancelRequest}
                disabled={actionLoading}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                Cancel Request
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RULE-BASED MATCHING RESULTS SECTION (Section 14, 15, 16) */}
      {(isRequester || ['BARANGAY_STAFF', 'BARANGAY_ADMIN', 'PLATFORM_ADMIN'].includes(user?.role)) && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Deterministic Scoring Engine (No AI)</span>
              </div>
              <h2 className="text-lg font-black text-slate-900">Recommended Community Helpers</h2>
              <p className="text-xs text-slate-500">
                Ranked strictly by Skill Match (+50), Same Barangay (+20), Same Zone (+15), Availability (+10), and Rating (+5).
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full self-start">
              {matches.length} Qualified Helper{matches.length === 1 ? '' : 's'}
            </span>
          </div>

          {matches.length > 0 ? (
            <div className="space-y-4">
              {matches.map((m) => {
                const isAlreadyInvited = invitations.some((inv) => inv.helper === m.helper_id);
                const isAssigned = request.assigned_helper === m.helper_id;

                return (
                  <div
                    key={m.id || m.helper_id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isAssigned
                        ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-emerald-300 bg-white'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Helper Identity */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-base border border-emerald-200 shrink-0">
                          {m.helper_name[0]}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{m.helper_name}</h4>
                            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              ✓ Verified Resident
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-semibold text-amber-600">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {m.rating_average.toFixed(1)} ★ ({m.rating_count} reviews)
                            </span>
                            <span>•</span>
                            <span>{m.completed_assistance_count} completed</span>
                            {m.helper_zone && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-0.5">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {m.helper_zone}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Score Badge & Action */}
                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <div className="text-right">
                          <div className="text-2xl font-black text-emerald-600 leading-none">
                            {m.total_score}<span className="text-xs text-slate-400 font-semibold">/100</span>
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                            Match Score
                          </div>
                        </div>

                        {isRequester && request.status in { PENDING: 1, MATCHED: 1 } && (
                          <button
                            onClick={() => handleInvite(m.helper_id)}
                            disabled={actionLoading || isAlreadyInvited}
                            className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 ${
                              isAlreadyInvited
                                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                            }`}
                          >
                            <Send className="w-3 h-3" />
                            <span>{isAlreadyInvited ? 'Invitation Sent' : 'Select Helper'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Transparent Explanations */}
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="text-[11px] font-bold text-slate-600 mb-1.5">
                        Recommended because:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.reasons?.map((reason, rIdx) => (
                          <span
                            key={rIdx}
                            className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-50 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                          >
                            <span className="text-emerald-600 font-bold">✓</span> {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
              No matching helpers found with this specific skill set and availability in your barangay right now.
            </div>
          )}
        </div>
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingOpen}
        onClose={() => setRatingOpen(false)}
        request={request}
        onRated={fetchRequestDetails}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        reportedUserId={request.requester}
        reportedRequestId={request.id}
        targetName={request.title}
        onReported={fetchRequestDetails}
      />
    </div>
  );
};

export default RequestDetailPage;
