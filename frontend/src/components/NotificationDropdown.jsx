import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Clock,
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Megaphone,
  CheckCircle2,
  X
} from 'lucide-react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';

export const NotificationDropdown = () => {
  const { unreadCount, refreshNotifications, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchRecent = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications/');
      const list = res.data.results || res.data || [];
      // Show top 6 most recent
      setNotifications(list.slice(0, 6));
    } catch (err) {
      console.error('Error loading recent notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when opening
  useEffect(() => {
    if (isOpen) {
      fetchRecent();
    }
  }, [isOpen]);

  // Click outside and Escape key handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleMarkOneRead = async (notif, e) => {
    if (e) e.stopPropagation();
    if (!notif.is_read) {
      try {
        await api.post(`/notifications/${notif.id}/mark_read/`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        refreshNotifications();
      } catch (err) {
        console.error(err);
      }
    }

    if (notif.link) {
      setIsOpen(false);
      navigate(notif.link);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'EMERGENCY_ALERT':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'REQUEST_ACCEPTED':
      case 'INVITATION_RECEIVED':
      case 'REQUEST_CREATED':
        return <HeartHandshake className="w-4 h-4 text-emerald-600" />;
      case 'ASSISTANCE_COMPLETED':
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      case 'ACCOUNT_VERIFIED':
        return <ShieldCheck className="w-4 h-4 text-teal-600" />;
      case 'ANNOUNCEMENT':
        return <Megaphone className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-600" />;
    }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button with Ringing Animation */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group relative p-2 rounded-xl transition-all duration-200 cursor-pointer active:scale-90 ${
          isOpen
            ? 'bg-emerald-50 text-emerald-700'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
        }`}
        title="Notifications"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell
          className={`w-5 h-5 transition-transform duration-200 ${
            unreadCount > 0 ? 'animate-bell-ring text-emerald-600' : 'group-hover:rotate-12'
          }`}
        />

        {/* Unread Counter Badge with Ping Micro-Effect */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black items-center justify-center shadow-xs">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 pointer-events-none" />
            <span className="relative z-10">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </span>
        )}
      </button>

      {/* Floating Mini Modal / Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Popover Header */}
          <div className="p-4 bg-gradient-to-r from-slate-50 to-emerald-50/30 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 leading-none">Notifications</h3>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {unreadCount > 0 ? `${unreadCount} unread notice${unreadCount === 1 ? '' : 's'}` : 'All caught up'}
                </span>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100/50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
          </div>

          {/* Popover Notifications Body */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span>Loading notices...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-1.5">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/80 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No new notifications</p>
                <p className="text-[10px] text-slate-400">You're all caught up with your barangay notices.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={(e) => handleMarkOneRead(n, e)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                    !n.is_read ? 'bg-emerald-50/40' : 'bg-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {getNotifIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs truncate ${!n.is_read ? 'font-black text-slate-900' : 'font-semibold text-slate-700'}`}>
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Unread" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>{timeAgo(n.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Popover Footer: View All Link */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="w-full py-1.5 flex items-center justify-center gap-1.5 font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
            >
              <span>View all notifications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
