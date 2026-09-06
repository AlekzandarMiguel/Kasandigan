import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshake, Lock, Mail, ArrowRight, Building2, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center">
          <Logo size="xl" className="mx-auto mb-3" />
          <h2 className="text-2xl font-black text-slate-900">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1">Sign in to your Kasandigan account</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Quick Autofill Buttons */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Demo One-Click Fill (Maramag)</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => autofill('platform.admin@kasandigan.gov.ph')}
              className="px-2 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 rounded-lg text-slate-700 font-medium flex items-center gap-1 truncate text-left"
            >
              <Building2 className="w-3 h-3 text-indigo-600 shrink-0" /> LGU Maramag Admin
            </button>
            <button
              type="button"
              onClick={() => autofill('admin.southpoblacion@kasandigan.gov.ph')}
              className="px-2 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 rounded-lg text-slate-700 font-medium flex items-center gap-1 truncate text-left"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" /> Brgy Admin (Poblacion)
            </button>
            <button
              type="button"
              onClick={() => autofill('staff.southpoblacion@kasandigan.gov.ph')}
              className="px-2 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 rounded-lg text-slate-700 font-medium flex items-center gap-1 truncate text-left"
            >
              <UserCheck className="w-3 h-3 text-teal-600 shrink-0" /> Brgy Staff
            </button>
            <button
              type="button"
              onClick={() => autofill('maria.santos@example.com')}
              className="px-2 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 rounded-lg text-slate-700 font-medium flex items-center gap-1 truncate text-left"
            >
              <Users className="w-3 h-3 text-amber-600 shrink-0" /> Resident Maria
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Not yet registered in your barangay?{' '}
          <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
