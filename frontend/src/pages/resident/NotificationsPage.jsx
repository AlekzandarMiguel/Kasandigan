import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <LoadingSpinner text="Loading notifications..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600" />
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time updates regarding requests, invitations, and notices.
          </p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={handleMarkAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                n.is_read
                  ? 'bg-white border-slate-200'
                  : 'bg-emerald-50/40 border-emerald-200 ring-1 ring-emerald-400/20'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                  {n.link && (
                    <Link
                      to={n.link}
                      onClick={() => handleMarkRead(n.id)}
                      className="font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                    >
                      <span>Open link</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 px-2 py-1 rounded-md"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No notifications yet" description="You'll receive notifications when someone responds to requests." />
      )}
    </div>
  );
};

export default NotificationsPage;
