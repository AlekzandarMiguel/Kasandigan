import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshake, User, Mail, Phone, Lock, MapPin, ArrowRight, ShieldCheck, FileCheck, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    password: '',
    password_confirm: '',
    barangay_id: '',
    zone: '',
    id_document_type: 'BARANGAY_CLEARANCE',
    id_document_url: '',
  });

  const [barangays, setBarangays] = useState([]);
  const [zones, setZones] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        const res = await api.get('/barangays/active_list/');
        setBarangays(res.data || []);
        if (res.data?.length > 0) {
          const first = res.data[0];
          setFormData((prev) => ({
            ...prev,
            barangay_id: first.id,
            zone: first.zones?.[0] || '',
          }));
          setZones(first.zones || []);
        }
      } catch (err) {
        console.error('Failed to load barangays', err);
      }
    };
    fetchBarangays();
  }, []);

  const handleBarangayChange = (e) => {
    const bId = Number(e.target.value);
    const selected = barangays.find((b) => b.id === bId);
    const zList = selected?.zones || [];
    setZones(zList);
    setFormData((prev) => ({
      ...prev,
      barangay_id: bId,
      zone: zList[0] || '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      const errData = err.response?.data;
      if (typeof errData === 'object') {
        const firstErr = Object.values(errData)[0];
        setError(Array.isArray(firstErr) ? firstErr[0] : String(firstErr));
      } else {
        setError('Registration failed. Please check your information and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-600/30">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-full mb-1">
            Municipality of Maramag, Bukidnon
          </div>
          <h2 className="text-2xl font-black text-slate-900">Resident Citizen Registration</h2>
          <p className="text-xs text-slate-500 mt-1">Connect with neighbors and local barangay assistance</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="e.g. Maria"
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="e.g. Santos"
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.mobile_number}
                  onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                  placeholder="+63 9XX XXX XXXX"
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Barangay Tenant Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100">
            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1">Barangay (Maramag)</label>
              <select
                required
                value={formData.barangay_id}
                onChange={handleBarangayChange}
                className="w-full text-sm px-3 py-2 rounded-xl border border-emerald-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
              >
                {barangays.map((b) => (
                  <option key={b.id} value={b.id}>
                    Brgy. {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1">Purok / Sitio</label>
              {zones.length > 0 ? (
                <select
                  required
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-emerald-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                >
                  {zones.map((z, idx) => (
                    <option key={idx} value={z}>{z}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  placeholder="e.g. Purok 1 / Sitio Musuan"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-emerald-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              )}
            </div>
          </div>

          {/* Resident Residency Document Proof (Optional online, or walk-in) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Residency Verification Proof (Optional Online)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                LGU Verification
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">ID Document Type</label>
                <select
                  value={formData.id_document_type}
                  onChange={(e) => setFormData({ ...formData, id_document_type: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="BARANGAY_CLEARANCE">Barangay Residency Clearance</option>
                  <option value="VOTER_ID">COMELEC Voter's ID / Cert</option>
                  <option value="CMU_ID">Central Mindanao University (CMU) ID</option>
                  <option value="GOV_ID">National ID / Gov't Issued ID</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Document Link / Photo URL</label>
                <input
                  type="url"
                  value={formData.id_document_url}
                  onChange={(e) => setFormData({ ...formData, id_document_url: e.target.value })}
                  placeholder="https://... (Drive or image URL)"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              * CMU students & staff residing in Musuan or Dologon can provide their CMU ID for faster verification. If you do not have a link, you can register now and present your ID in-person at your Barangay Hall desk.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={formData.password_confirm}
                onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                placeholder="Repeat password"
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              By registering, your account enters <span className="font-bold">Pending Verification</span>. Your local Maramag barangay hall staff will inspect your ID proof before assistance matching is authorized.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Complete Resident Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already registered in your barangay?{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
