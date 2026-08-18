import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export const ChangePasswordCard = ({ theme = 'emerald', className = '' }) => {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.old_password) {
      setError('Please enter your current password.');
      return;
    }

    if (formData.new_password.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('New passwords do not match.');
      return;
    }

    if (formData.old_password === formData.new_password) {
      setError('New password must be different from your current password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/change-password/', {
        old_password: formData.old_password,
        new_password: formData.new_password,
      });

      setSuccess(res.data?.detail || 'Password changed successfully!');
      setFormData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  const btnBg = theme === 'indigo'
    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20';

  const iconColor = theme === 'indigo' ? 'text-indigo-600' : 'text-emerald-600';
  const focusRing = theme === 'indigo' ? 'focus:ring-indigo-500' : 'focus:ring-emerald-500';

  return (
    <div className={`p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-6 ${className}`}>
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl ${theme === 'indigo' ? 'bg-indigo-50' : 'bg-emerald-50'} ${iconColor} flex items-center justify-center font-bold shrink-0`}>
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Change Account Password</h3>
            <p className="text-xs text-slate-500">
              Ensure your account is protected with a strong, secure password of at least 8 characters.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted with PBKDF2 / SHA-256</span>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-semibold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
          <button type="button" onClick={() => setSuccess('')} className="text-emerald-700 hover:text-emerald-900 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center justify-between text-xs font-semibold animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError('')} className="text-rose-700 hover:text-rose-900 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Current Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showOld ? 'text' : 'password'}
              required
              value={formData.old_password}
              onChange={(e) => setFormData({ ...formData, old_password: e.target.value })}
              placeholder="Enter your current account password"
              className={`w-full text-xs px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 focus:ring-2 ${focusRing} focus:outline-hidden transition-all`}
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                placeholder="At least 8 characters"
                className={`w-full text-xs px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 focus:ring-2 ${focusRing} focus:outline-hidden transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                placeholder="Re-type your new password"
                className={`w-full text-xs px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 focus:ring-2 ${focusRing} focus:outline-hidden transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Password must be minimum 8 characters.
          </p>

          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center gap-2 px-5 py-2.5 ${btnBg} text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordCard;
