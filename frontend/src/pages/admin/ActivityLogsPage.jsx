import React, { useState, useEffect } from 'react';
import { FileText, Clock, User, Shield, Search } from 'lucide-react';
import api from '../../services/api';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = '/activity-logs/';
      if (actionFilter) url += `?action=${actionFilter}`;
      const res = await api.get(url);
      setLogs(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  if (loading) return <LoadingSpinner text="Loading audit logs..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            Barangay Activity & Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Immutable audit trail of verifications, suspensions, assistance transactions, and administrative changes.
          </p>
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="text-xs px-3.5 py-2 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
        >
          <option value="">All Logged Actions</option>
          <option value="ACCOUNT_VERIFICATION">Account Verification</option>
          <option value="ACCOUNT_SUSPENSION">Account Suspension</option>
          <option value="REQUEST_CREATION">Request Creation</option>
          <option value="REQUEST_COMPLETION">Request Completion</option>
          <option value="RATING_SUBMISSION">Rating Submission</option>
          <option value="ANNOUNCEMENT_POSTED">Announcement Broadcast</option>
          <option value="ADMIN_ACTION">Administrative Action</option>
        </select>
      </div>

      {logs.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 text-slate-800 font-bold">
                      {log.user_name || 'System'}
                      <div className="text-[10px] text-slate-400 font-normal">{log.user_email}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {log.action_display}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 max-w-sm">
                      {log.description}
                    </td>
                    <td className="px-6 py-3.5 text-slate-400">
                      {log.target_type && `${log.target_type} #${log.target_id}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No activity logs found" description="Actions performed within your barangay will appear here." />
      )}
    </div>
  );
};

export default ActivityLogsPage;
