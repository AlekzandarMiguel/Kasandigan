import PageHeader from '../../components/PageHeader';
import React, { useState, useEffect } from 'react';
import {
  Bell, CheckCheck, Clock, ArrowRight, HeartHandshake,
  ShieldCheck, AlertTriangle, Sparkles, Filter, CheckCircle2, Megaphone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabFilter, setTabFilter] = useState('ALL');
  const { markAllAsRead, refreshNotifications } = useNotifications();

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/mark_read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      refreshNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const getNotifMeta = (type) => {
    switch (type) {
      case 'EMERGENCY_ALERT':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
          badge: 'bg-rose-100 text-rose-800',
          label: 'Emergency Alert',
        };
      case 'REQUEST_ACCEPTED':
      case 'INVITATION_RECEIVED':
        return {
          icon: <HeartHandshake className="w-4 h-4 text-emerald-600" />,
          badge: 'bg-emerald-100 text-emerald-800',
          label: 'Assistance Task',
        };
      case 'ASSISTANCE_COMPLETED':
        return {
          icon: <Sparkles className="w-4 h-4 text-amber-600" />,
          badge: 'bg-amber-100 text-amber-800',
          label: 'Task Completed',
        };
      case 'ACCOUNT_VERIFIED':
        return {
          icon: <ShieldCheck className="w-4 h-4 text-blue-600" />,
          badge: 'bg-blue-100 text-blue-800',
          label: 'Account Verification',
        };
      default:
        return {
          icon: <Bell className="w-4 h-4 text-indigo-600" />,
          badge: 'bg-indigo-100 text-indigo-800',
          label: 'Notification',
        };
    }
  };

  if (loading) return <LoadingSpinner text="Loading your personal notifications..." />;

  const filteredNotifs = notifications.filter((n) => {
    if (tabFilter === 'UNREAD') return !n.is_read;
    if (tabFilter === 'TASKS') return ['REQUEST_ACCEPTED', 'INVITATION_RECEIVED', 'ASSISTANCE_COMPLETED'].includes(n.type);
    if (tabFilter === 'SYSTEM') return ['ACCOUNT_VERIFIED', 'EMERGENCY_ALERT', 'GENERAL'].includes(n.type);
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const bulletinsLink =
    user?.role === 'PLATFORM_ADMIN'
      ? '/platform/announcements'
      : user?.role === 'BARANGAY_ADMIN'
      ? '/admin/announcements'
      : user?.role === 'BARANGAY_STAFF'
      ? '/staff/announcements'
      : '/announcements';

  const isPlatformAdmin = user?.role === 'PLATFORM_ADMIN';

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Bell}
        badge={`Personal Inbox • ${unreadCount > 0 ? `${unreadCount} Unread Updates` : 'All Caught Up'}`}
        badgeIcon={Bell}
        title="Personal Activity Notifications"
        description="Direct personal updates regarding your assistance tickets, volunteer assignments, ratings, and account status."
        theme="indigo"
        actions={
          <div className="flex flex-col lg:items-end gap-2.5 max-w-md w-full lg:w-auto">
            <p className="text-xs text-slate-300 leading-relaxed lg:text-right">
              {isPlatformAdmin
                ? 'Looking for municipal bulletins, MDRRMO alerts, or public advisories?'
                : 'Looking for official barangay advisories, clean-up drives, or weather advisories?'}
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to={bulletinsLink}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
              >
                <Megaphone className="w-4 h-4" />
                <span>{isPlatformAdmin ? 'View Municipal Bulletins' : 'View Bulletins'}</span>
              </Link>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto text-xs font-bold">
        {[
          { id: 'ALL', label: 'All Updates' },
          { id: 'UNREAD', label: `Unread (${unreadCount})` },
          { id: 'TASKS', label: 'Assistance Tasks' },
          { id: 'SYSTEM', label: 'Account & Safety' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTabFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              tabFilter === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifs.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifs.map((n) => {
            const meta = getNotifMeta(n.type);
            return (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  n.is_read
                    ? 'bg-white border-slate-200 shadow-xs'
                    : 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400/20 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {meta.icon}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${meta.badge}`}>
                        {meta.label}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{n.title}</h4>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-300" />
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                      {n.link && (
                        <Link
                          to={n.link}
                          onClick={() => handleMarkRead(n.id)}
                          className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                        >
                          <span>Open related ticket</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="text-[11px] font-bold text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No Notifications in this Category"
          description="You are all caught up! You'll receive direct updates when neighbors respond to your requests or when tasks are completed."
        />
      )}
    </div>
  );
};

export default NotificationsPage;
