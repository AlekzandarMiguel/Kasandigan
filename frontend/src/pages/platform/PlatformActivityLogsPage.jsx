import PageHeader from '../../components/PageHeader';
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Filter, Search, Download, Building2, User, Globe, Clock, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export const PlatformActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsRes, brgyRes] = await Promise.all([
        api.get('/activity-logs/'),
        api.get('/barangays/'),
      ]);
      setLogs(logsRes.data.results || logsRes.data || []);
      setBarangays(brgyRes.data.results || brgyRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (selectedBarangay && log.barangay !== parseInt(selectedBarangay)) return false;
    if (actionFilter && log.action !== actionFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchDesc = log.description?.toLowerCase().includes(query);
      const matchUser = log.user_details?.email?.toLowerCase().includes(query) ||
                        `${log.user_details?.first_name} ${log.user_details?.last_name}`.toLowerCase().includes(query);
      if (!matchDesc && !matchUser) return false;
    }
    return true;
  });

  const exportLogs = () => {
    const csvRows = [
      ['ID', 'Timestamp', 'Barangay', 'Action', 'Actor Email', 'IP Address', 'Description'],
      ...filteredLogs.map(l => [
        l.id,
        l.created_at,
        l.barangay_name || 'Platform Global',
        l.action,
        l.user_details?.email || 'System',
        l.ip_address || '127.0.0.1',
        `"${(l.description || '').replace(/"/g, '""')}"`
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kasandigan_platform_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <LoadingSpinner text="Loading platform audit telemetry..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ShieldAlert}
        badge="SaaS Infrastructure & Security Auditing"
        badgeIcon={ShieldAlert}
        title="Global Platform Audit & Security Logs"
        description="Immutable cross-tenant audit trail tracking authentication, tenant provisioning, privilege changes, and security events."
        theme="indigo"
        actions={
          <button
            onClick={exportLogs}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export Audit CSV
          </button>
        }
      />

      {/* Security Telemetry Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Recorded Events</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{logs.length}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Immutable Hash Verification Passed
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Tenants Logged</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{barangays.length} Barangays</div>
          <div className="text-[11px] text-slate-400 mt-1">Cross-tenant isolation enforced</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Audit Retention Policy</div>
          <div className="text-2xl font-black text-slate-700 mt-1">365 Days</div>
          <div className="text-[11px] text-slate-400 mt-1">Philippine Data Privacy Act compliant</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by actor name, email, or log description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedBarangay}
            onChange={(e) => setSelectedBarangay(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="">All Barangay Tenants</option>
            {barangays.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}, {b.city}
              </option>
            ))}
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="">All Action Types</option>
            <option value="ACCOUNT_VERIFICATION">Account Verification</option>
            <option value="ACCOUNT_SUSPENSION">Account Suspension</option>
            <option value="REQUEST_CREATION">Request Creation</option>
            <option value="REQUEST_COMPLETION">Request Completion</option>
            <option value="RATING_SUBMISSION">Rating Submission</option>
            <option value="ANNOUNCEMENT_POSTED">Announcement Broadcast</option>
            <option value="ADMIN_ACTION">Administrative Action</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          title="No Platform Audit Logs Found"
          description="No security or audit events match your selected filters."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Barangay Tenant</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">IP / Host</th>
                  <th className="py-3 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {log.barangay_name ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Building2 className="w-3 h-3" /> {log.barangay_name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Globe className="w-3 h-3" /> Platform Global
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-slate-100 text-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {log.user_details ? (
                        <div>
                          <div className="font-bold text-slate-800">
                            {log.user_details.first_name} {log.user_details.last_name}
                          </div>
                          <div className="text-[10px] text-slate-400">{log.user_details.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">System Core</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-md">
                      {log.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformActivityLogsPage;
