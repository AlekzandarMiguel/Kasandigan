import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HeartHandshake, Lock, Mail, ArrowRight, ArrowLeft,
  Building2, ShieldCheck, UserCheck, Users,
  CheckCircle2, Radio, Layers, Eye, EyeOff, Shield,
  KeyRound, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import api from '../../services/api';

export const LoginPage = () => {
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password / 6-Digit OTP State
  const [viewMode, setViewMode] = useState('LOGIN'); // 'LOGIN' | 'FORGOT'
  const [forgotStep, setForgotStep] = useState('REQUEST_OTP'); // 'REQUEST_OTP' | 'VERIFY_RESET' | 'SUCCESS'
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [demoOtpHint, setDemoOtpHint] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let timer = null;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'PLATFORM_ADMIN') navigate('/platform/dashboard');
      else if (user.role === 'BARANGAY_ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'BARANGAY_STAFF') navigate('/staff/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  const handleOpenForgot = () => {
    setViewMode('FORGOT');
    setForgotStep('REQUEST_OTP');
    setForgotEmail(email || '');
    setForgotError('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setDemoOtpHint('');
  };

  const handleBackToLogin = () => {
    setViewMode('LOGIN');
    setError('');
    setForgotError('');
  };

  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    setForgotError('');
    if (!forgotEmail) {
      setForgotError('Please enter your email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/', { email: forgotEmail });
      if (res.data.otp) {
        setDemoOtpHint(res.data.otp);
      }
      setForgotStep('VERIFY_RESET');
      setResendTimer(60);
    } catch (err) {
      setForgotError(err.response?.data?.detail || 'Failed to send verification code. Please check your email.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || forgotLoading) return;
    setForgotError('');
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/', { email: forgotEmail });
      if (res.data.otp) {
        setDemoOtpHint(res.data.otp);
      }
      setResendTimer(60);
    } catch (err) {
      setForgotError(err.response?.data?.detail || 'Failed to resend code. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e?.preventDefault();
    setForgotError('');

    if (!otp || otp.length !== 6) {
      setForgotError('Please enter the full 6-digit OTP code.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setForgotError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    try {
      await api.post('/auth/reset-password/', {
        email: forgotEmail,
        otp,
        new_password: newPassword,
      });
      setForgotStep('SUCCESS');
      setEmail(forgotEmail);
      setPassword('');
    } catch (err) {
      setForgotError(err.response?.data?.detail || 'Failed to reset password. Please verify the code and try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Main 50/50 Auth Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-2 my-auto">
        
        {/* LEFT 50%: System Details (Dark Theme, No Badges) */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border-b lg:border-b-0 lg:border-r border-slate-800 p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle ambient lighting inside dark panel */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar: Back Link & Municipality Text (No Badges) */}
          <div className="flex items-center justify-between gap-3 mb-8 relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Home</span>
            </Link>

            <span className="text-xs font-medium text-slate-400">
              Municipality of Maramag, Bukidnon
            </span>
          </div>

          {/* Core System Information */}
          <div className="space-y-6 my-auto py-2 relative z-10">
            {/* Logo and Brand (No Badges) */}
            <div className="flex items-center gap-3.5">
              <Logo size="lg" />
              <div>
                <span className="text-2xl font-black text-white tracking-tight">Kasandigan</span>
                <p className="text-xs text-emerald-400 font-medium italic mt-0.5">
                  “A community you can rely on”
                </p>
              </div>
            </div>

            {/* System Headline & Overview */}
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                Unified Barangay Assistance & Resource Coordination
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                An integrated platform empowering the 20 barangays of Maramag, Bukidnon with rule-based volunteer matching, equipment lending, and emergency dispatch.
              </p>
            </div>

            {/* Key System Capabilities (Clean cards, no badges) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Deterministic Skill Matching</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Transparent, fair pairing of resident requests with verified neighborhood volunteers.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Community Resource & Apparatus Lending</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Track emergency tools, medical equipment, and communal barangay gear.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 shrink-0 mt-0.5">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">MDRRMO Emergency Bulletins</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Direct public broadcasts and emergency dispatch integration across all 20 nodes.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Security & Compliance (Clean text, no badges) */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 mt-8 relative z-10">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              RA 10173 PII Shielded
            </span>
            <span className="text-slate-600">•</span>
            <span>20 Barangays Covered</span>
            <span className="text-slate-600">•</span>
            <span>Audit-Logged</span>
          </div>
        </div>

        {/* RIGHT 50%: Login Portal / Forgot Password Portal (Clean White, No Badges) */}
        <div className="bg-white p-8 sm:p-10 lg:p-12 flex flex-col justify-between">
          
          {/* VIEW MODE 1: LOGIN FORM */}
          {viewMode === 'LOGIN' && (
            <div className="space-y-6 my-auto">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your credentials or select a one-click demo profile
                </p>
              </div>

              {/* Error Notification */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Quick Demo Access Bar */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Demo One-Click Fill (Maramag)</span>
                  <span className="text-[10px] font-medium text-slate-400">Click to autofill</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => autofill('platform.admin@kasandigan.gov.ph')}
                    className="px-2.5 py-2 bg-white hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl text-slate-700 font-semibold flex items-center gap-1.5 truncate text-left transition-colors cursor-pointer shadow-2xs"
                  >
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">LGU Platform Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => autofill('admin.southpoblacion@kasandigan.gov.ph')}
                    className="px-2.5 py-2 bg-white hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl text-slate-700 font-semibold flex items-center gap-1.5 truncate text-left transition-colors cursor-pointer shadow-2xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Barangay Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => autofill('staff.southpoblacion@kasandigan.gov.ph')}
                    className="px-2.5 py-2 bg-white hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl text-slate-700 font-semibold flex items-center gap-1.5 truncate text-left transition-colors cursor-pointer shadow-2xs"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">Barangay Staff</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => autofill('maria.santos@example.com')}
                    className="px-2.5 py-2 bg-white hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl text-slate-700 font-semibold flex items-center gap-1.5 truncate text-left transition-colors cursor-pointer shadow-2xs"
                  >
                    <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">Resident Maria</span>
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full text-sm pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleOpenForgot}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-sm pl-10 pr-10 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Registration Action */}
              <div className="pt-2 text-center text-xs text-slate-500">
                Not yet registered in your barangay?{' '}
                <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
                  Create an Account
                </Link>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: FORGOT PASSWORD (6-DIGIT OTP FLOW) */}
          {viewMode === 'FORGOT' && (
            <div className="space-y-6 my-auto">
              
              {/* STEP A: REQUEST OTP */}
              {forgotStep === 'REQUEST_OTP' && (
                <div className="space-y-5">
                  <div>
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-3 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Forgot Password</h2>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Enter your account email address. We will send you a secure 6-digit OTP code to reset your password.
                    </p>
                  </div>

                  {forgotError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Registered Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full text-sm pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full py-3.5 px-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>{forgotLoading ? 'Sending 6-Digit Code...' : 'Send 6-Digit OTP Code'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* STEP B: VERIFY OTP & ENTER NEW PASSWORD */}
              {forgotStep === 'VERIFY_RESET' && (
                <div className="space-y-5">
                  <div>
                    <button
                      type="button"
                      onClick={() => setForgotStep('REQUEST_OTP')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-3 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Change Email</span>
                    </button>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Enter 6-Digit OTP</h2>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Verification code sent to <strong className="text-slate-800">{forgotEmail}</strong>. Enter the code and set your new password.
                    </p>
                  </div>

                  {demoOtpHint && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <KeyRound className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Code: <strong className="font-mono text-sm tracking-widest">{demoOtpHint}</strong></span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtp(demoOtpHint)}
                        className="font-bold underline hover:text-emerald-950 cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}

                  {forgotError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-3.5">
                    {/* 6-Digit OTP Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          6-Digit Verification Code
                        </label>
                        <button
                          type="button"
                          disabled={resendTimer > 0 || forgotLoading}
                          onClick={handleResendOtp}
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 disabled:text-slate-400 cursor-pointer transition-colors"
                        >
                          {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="••••••"
                        className="w-full text-center font-mono text-2xl font-bold tracking-[0.6em] py-2.5 px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-all bg-slate-50/50"
                      />
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        New Password (Min 8 Characters)
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full text-sm pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full text-sm pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full py-3 px-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{forgotLoading ? 'Updating Password...' : 'Reset & Save Password'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* STEP C: SUCCESS CONFIRMATION */}
              {forgotStep === 'SUCCESS' && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Password Reset Complete!</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      Your password has been successfully updated. You can now sign in with your new credentials.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="w-full py-3.5 px-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          )}

          {/* Footer inside right container */}
          <div className="pt-6 border-t border-slate-100 text-center text-[11px] text-slate-400">
            &copy; {new Date().getFullYear()} Kasandigan SaaS • Municipality of Maramag, Bukidnon
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
