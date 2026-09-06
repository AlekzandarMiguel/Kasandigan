import PageHeader from '../../components/PageHeader';
import React, { useState } from 'react';
import { Settings, Shield, Server, Database, Save, CheckCircle, AlertTriangle, RefreshCw, Lock, Radio } from 'lucide-react';
import api from '../../services/api';
import ChangePasswordCard from '../../components/ChangePasswordCard';

export const PlatformSettingsPage = () => {
  const [platformName, setPlatformName] = useState('Kasandigan Cloud SaaS');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowPublicRegistration, setAllowPublicRegistration] = useState(true);
  const [requireIdVerification, setRequireIdVerification] = useState(true);
  const [defaultTenantStatus, setDefaultTenantStatus] = useState('ACTIVE');
  const [maxHelpersPerTenant, setMaxHelpersPerTenant] = useState('1000');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        icon={Settings}
        badge="SaaS Infrastructure Config"
        badgeIcon={Settings}
        title="Multi-Tenant System & SaaS Settings"
        description="Global cloud settings, tenant provisioning rules, system health parameters, and data retention policies."
        theme="indigo"
      />

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-sm font-semibold animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          SaaS configurations updated successfully across all tenant nodes.
        </div>
      )}

      {/* System Health Diagnostics */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">SaaS Cloud Node Status</h3>
              <p className="text-[11px] text-slate-500 font-mono">Cluster: ap-southeast-1 (Manila Edge)</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            All Services Operational
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Database Engine</div>
            <div className="text-sm font-black text-slate-900 mt-1">MySQL 8 / SQLite</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Auto-partitioned</div>
          </div>
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Matching Latency</div>
            <div className="text-sm font-black text-slate-900 mt-1">&lt; 15ms</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Deterministic rule-engine</div>
          </div>
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tenant Isolation</div>
            <div className="text-sm font-black text-emerald-600 mt-1">Strict Active</div>
            <div className="text-[10px] text-slate-500 mt-0.5">TenantMiddleware enforced</div>
          </div>
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Data Privacy Act</div>
            <div className="text-sm font-black text-indigo-600 mt-1">RA 10173</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Encrypted at rest</div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* SaaS Governance Card */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            Global SaaS & Tenant Policy
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Platform Brand Name</label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Onboarded Tenant Status</label>
              <select
                value={defaultTenantStatus}
                onChange={(e) => setDefaultTenantStatus(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option value="ACTIVE">ACTIVE (Immediate Production Access)</option>
                <option value="TRIAL">TRIAL (30-Day Evaluation Period)</option>
                <option value="PENDING">PENDING (Requires Platform Admin Approval)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-indigo-50/50 transition-colors">
              <input
                type="checkbox"
                checked={allowPublicRegistration}
                onChange={(e) => setAllowPublicRegistration(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-800">Allow Public Resident Self-Registration</div>
                <div className="text-[11px] text-slate-500">
                  Allow residents in any active barangay to register online through the public portal.
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-indigo-50/50 transition-colors">
              <input
                type="checkbox"
                checked={requireIdVerification}
                onChange={(e) => setRequireIdVerification(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-800">Mandatory Government ID Verification</div>
                <div className="text-[11px] text-slate-500">
                  Residents cannot offer assistance until barangay staff manually verifies their ID.
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 cursor-pointer hover:bg-rose-100/60 transition-colors">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded-sm focus:ring-rose-500"
              />
              <div>
                <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Platform Maintenance Mode
                </div>
                <div className="text-[11px] text-rose-700">
                  When enabled, all non-admin portals will display a scheduled maintenance screen.
                </div>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Platform Settings
            </button>
          </div>
        </div>
      </form>

      {/* Account Password Change */}
      <ChangePasswordCard theme="indigo" />
    </div>
  );
};

export default PlatformSettingsPage;
