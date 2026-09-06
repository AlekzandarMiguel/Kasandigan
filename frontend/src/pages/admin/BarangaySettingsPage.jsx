import PageHeader from '../../components/PageHeader';
import React, { useState, useEffect } from 'react';
import { Settings, Building2, MapPin, Phone, Clock, User, Save, CheckCircle, Shield, Plus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ChangePasswordCard from '../../components/ChangePasswordCard';

export const BarangaySettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [barangayData, setBarangayData] = useState({
    name: '',
    code: '',
    city: '',
    province: '',
    contact_email: '',
    contact_phone: '',
    address: 'Barangay Hall Complex, Main Street',
    captain_name: 'Hon. Roberto Carandang',
    office_hours: 'Monday to Friday, 8:00 AM - 5:00 PM',
    emergency_hotline: '911 / (02) 8888-0000',
  });

  const [zones, setZones] = useState(['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5']);
  const [newZone, setNewZone] = useState('');

  useEffect(() => {
    const fetchTenantDetails = async () => {
      setLoading(true);
      try {
        if (user?.barangay) {
          const res = await api.get(`/barangays/${user.barangay}/`);
          setBarangayData(prev => ({
            ...prev,
            ...res.data,
            name: res.data.name || prev.name,
            code: res.data.code || prev.code,
            city: res.data.city || prev.city,
            province: res.data.province || prev.province,
            contact_email: res.data.contact_email || prev.contact_email,
            contact_phone: res.data.contact_phone || prev.contact_phone,
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantDetails();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (user?.barangay) {
        await api.patch(`/barangays/${user.barangay}/`, {
          contact_email: barangayData.contact_email,
          contact_phone: barangayData.contact_phone,
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Error updating barangay settings: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const addZone = () => {
    if (newZone.trim() && !zones.includes(newZone.trim())) {
      setZones([...zones, newZone.trim()]);
      setNewZone('');
    }
  };

  const removeZone = (indexToRemove) => {
    setZones(zones.filter((_, idx) => idx !== indexToRemove));
  };

  if (loading) return <LoadingSpinner text="Loading barangay tenant configuration..." />;

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        icon={Building2}
        badge="Barangay Tenant Configuration"
        badgeIcon={Building2}
        title="Barangay Hall Profile & Tenant Configuration"
        description="Configure official barangay credentials, public hotline numbers, hall office hours, and recognized community zones/puroks."
        theme="slate"
      />

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-sm font-semibold animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          Barangay tenant profile and contact channels saved successfully.
        </div>
      )}

      {/* Tenant Identity Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{barangayData.name}</h2>
              <span className="px-2 py-0.5 rounded bg-emerald-500/30 border border-emerald-400/40 text-[10px] font-black font-mono">
                {barangayData.code}
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              {barangayData.city}, {barangayData.province} • Republic of the Philippines
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-bold flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-300" />
          <span>Tenant Isolated (LGU Tier)</span>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Hall Details */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Official Hall Address & Governance
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Punong Barangay (Captain)</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={barangayData.captain_name}
                  onChange={(e) => setBarangayData({ ...barangayData, captain_name: e.target.value })}
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Barangay Hall Physical Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={barangayData.address}
                  onChange={(e) => setBarangayData({ ...barangayData, address: e.target.value })}
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Office Operating Hours</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={barangayData.office_hours}
                  onChange={(e) => setBarangayData({ ...barangayData, office_hours: e.target.value })}
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Operations Hotline</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-rose-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={barangayData.emergency_hotline}
                  onChange={(e) => setBarangayData({ ...barangayData, emergency_hotline: e.target.value })}
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold text-rose-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Zones & Puroks Setup */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Configured Zones & Puroks (Rule-Based Matching Engine)
          </h3>
          <p className="text-xs text-slate-500">
            Helpers residing in the same zone as a requester receive **+15 points** proximity matching bonus.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {zones.map((zone, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200"
              >
                <span>{zone}</span>
                <button
                  type="button"
                  onClick={() => removeZone(idx)}
                  className="text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 max-w-sm">
            <input
              type="text"
              placeholder="e.g. Purok 6, Sitio Maligaya"
              value={newZone}
              onChange={(e) => setNewZone(e.target.value)}
              className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden flex-1"
            />
            <button
              type="button"
              onClick={addZone}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Add Zone
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving Changes...' : <><Save className="w-4 h-4" /> Save Barangay Profile</>}
            </button>
          </div>
        </div>
      </form>

      {/* Account Password Change */}
      <ChangePasswordCard theme="emerald" />
    </div>
  );
};

export default BarangaySettingsPage;
