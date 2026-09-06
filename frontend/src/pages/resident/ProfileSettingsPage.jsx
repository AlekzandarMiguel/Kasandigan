import PageHeader from '../../components/PageHeader';
import React, { useState, useEffect } from 'react';
import {
  User, ShieldCheck, Lock, UserX, Star, MapPin,
  Phone, Mail, CheckCircle2, AlertTriangle, Trash2
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ChangePasswordCard from '../../components/ChangePasswordCard';

export const ProfileSettingsPage = () => {
  const { user, refreshUserProfile } = useAuth();
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    mobile_number: user?.mobile_number || '',
    zone: user?.zone || '',
    bio: user?.bio || '',
  });

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchBlockedUsers = async () => {
    try {
      const res = await api.get('/blocked-users/');
      setBlockedUsers(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.patch('/auth/me/', profileData);
      await refreshUserProfile();
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (id) => {
    try {
      await api.delete(`/blocked-users/${id}/`);
      fetchBlockedUsers();
      setMessage('User unblocked.');
    } catch (err) {
      alert('Failed to unblock user.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        icon={User}
        badge="Resident Account Profile"
        badgeIcon={User}
        title="Profile & Security Settings"
        description="Manage your personal details, residency verification badge, and safety preferences."
      />

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold ml-2">✕</button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Verification Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Barangay Residency Status</h3>
            <StatusBadge status={user?.verification_status} />
          </div>
          <p className="text-xs text-slate-500">
            Assigned to: <strong className="text-slate-800">{user?.barangay_details?.name || 'Barangay'}</strong>
            {user?.zone && ` (${user.zone})`}
          </p>
          {user?.verification_notes && (
            <p className="text-xs text-slate-600 italic">"{user.verification_notes}"</p>
          )}
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{Number(user?.rating_average || 0).toFixed(1)} ★ ({user?.rating_count || 0} reviews)</span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Personal Information
        </h3>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                required
                value={profileData.first_name}
                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={profileData.last_name}
                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
              <input
                type="text"
                value={profileData.mobile_number}
                onChange={(e) => setProfileData({ ...profileData, mobile_number: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Zone / Purok</label>
              <input
                type="text"
                value={profileData.zone}
                onChange={(e) => setProfileData({ ...profileData, zone: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Short Bio</label>
            <textarea
              rows="3"
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              placeholder="Tell your neighbors about your background and interests..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Account Password Change */}
      <ChangePasswordCard theme="emerald" />

      {/* Blocked Users Section (Section 22) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserX className="w-4 h-4 text-rose-600" />
            Blocked Users
          </h3>
          <p className="text-xs text-slate-500">
            Blocked users cannot invite you to requests and will never appear in your matching recommendations.
          </p>
        </div>

        {blockedUsers.length > 0 ? (
          <div className="space-y-2">
            {blockedUsers.map((b) => (
              <div key={b.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">{b.blocked_user_name}</span>
                  <span className="text-slate-400 ml-2">({b.blocked_user_email})</span>
                  {b.reason && <p className="text-[11px] text-slate-500 italic mt-0.5">Reason: {b.reason}</p>}
                </div>
                <button
                  onClick={() => handleUnblock(b.id)}
                  className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400">You have not blocked any residents in your barangay.</div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
