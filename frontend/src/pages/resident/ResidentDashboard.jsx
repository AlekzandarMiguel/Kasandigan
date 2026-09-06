import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake, CheckCircle2, Star, PlusCircle, Wrench,
  Megaphone, Bell, ArrowRight, Sparkles, MapPin, Calendar, Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageHeader from '../../components/PageHeader';

export const ResidentDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/');
        setMetrics(res.data);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Loading community dashboard..." />;

  const summary = metrics?.summary || {};
  const announcements = metrics?.announcements || [];
  const notifications = metrics?.recent_notifications || [];

  return (
    <div className="space-y-8">
      <PageHeader
        badge={`${metrics?.barangay_name || user?.barangay_details?.name || 'Barangay'} ${user?.zone ? `• ${user.zone}` : ''}`}
        badgeIcon={MapPin}
        title={`Kumusta, ${user?.first_name || 'Ka-Barangay'}!`}
        description="Need a hand or ready to help a neighbor today? You are connected with verified community members in your barangay."
        theme="emerald"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/requests/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700" />
              <span>{t('btn_request_help', 'Request Assistance')}</span>
            </Link>
            <Link
              to="/skills"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs sm:text-sm font-bold rounded-xl backdrop-blur-xs transition-all cursor-pointer"
            >
              <Wrench className="w-4 h-4 text-emerald-300" />
              <span>{t('btn_offer_skills', 'Offer Skills & Availability')}</span>
            </Link>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            {t('stat_active_requests', 'My Active Requests')}
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900">{summary.my_active_requests || 0}</div>
            <HeartHandshake className="w-6 h-6 text-emerald-500" />
          </div>
          <Link to="/requests?scope=my_requests" className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 mt-2 block">
            View my requests →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            {t('stat_helping_requests', "Requests I'm Helping")}
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900">{summary.requests_helping || 0}</div>
            <CheckCircle2 className="w-6 h-6 text-blue-500" />
          </div>
          <Link to="/requests?scope=my_helping" className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 mt-2 block">
            Track assistance →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            {t('stat_completed_assistance', 'Completed Assistance')}
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900">{summary.completed_assistance || 0}</div>
            <Sparkles className="w-6 h-6 text-indigo-500" />
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">Community helper record</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            {t('stat_community_rating', 'Community Rating')}
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900 flex items-center gap-1">
              {summary.my_rating > 0 ? summary.my_rating.toFixed(1) : '5.0'}
              <span className="text-sm font-normal text-amber-500">★</span>
            </div>
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">From completed transactions</span>
        </div>
      </div>

      {/* Grid: Announcements & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Barangay Announcements */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-emerald-600" />
              Barangay Announcements
            </h3>
            <span className="text-xs font-medium text-slate-400">Official Notices</span>
          </div>

          {announcements.length > 0 ? (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-800">{ann.title}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ann.priority === 'EMERGENCY' ? 'bg-rose-100 text-rose-700' :
                      ann.priority === 'IMPORTANT' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {ann.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(ann.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No announcements yet" description="There are no active notices posted by your barangay hall right now." />
          )}
        </div>

        {/* Notifications preview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-600" />
              Recent Updates
            </h3>
            <Link to="/notifications" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              View All
            </Link>
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className={`p-3 rounded-xl border text-xs space-y-1 ${n.is_read ? 'bg-white border-slate-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                  <div className="font-bold text-slate-800">{n.title}</div>
                  <p className="text-slate-500 line-clamp-2">{n.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No notifications" description="You're all caught up with your assistance updates." />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;
