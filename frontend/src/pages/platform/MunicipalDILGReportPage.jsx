import React, { useState, useEffect } from 'react';
import { Printer, Download, Calendar, ShieldCheck, Building2, TrendingUp, Users, CheckCircle2, MapPin, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export const MunicipalDILGReportPage = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/municipal-dilg-summary/?month=${month}&year=${year}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load Municipal DILG Report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!data || !data.barangay_breakdown) return;
    const headers = ['Barangay Name', 'Code', 'Total Requests', 'Completed', 'Completion Rate (%)', 'Active Helpers', 'Registered Residents', 'Average Rating'];
    const rows = data.barangay_breakdown.map((b) => [
      `"${b.name}"`,
      `"${b.code}"`,
      b.total_requests,
      b.completed_requests,
      b.completion_rate,
      b.active_helpers,
      b.registered_residents,
      b.average_rating
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DILG_Municipal_Report_Maramag_${month}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Generating Consolidated Municipal DILG Report across 20 Barangays of Maramag..." />
      </div>
    );
  }

  const exec = data?.executive_summary || {};

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Control Bar (Hidden when printing) */}
      <div className="print:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/platform/dashboard"
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title="Back to Platform Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Municipal DILG Consolidated Report
            </h1>
            <p className="text-xs text-slate-500">Municipality of Maramag • 20 Barangays Unified Performance Dossier</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white"
          >
            {[
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ].map((mName, idx) => (
              <option key={idx + 1} value={idx + 1}>{mName}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white"
          >
            {[2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Printable Official DILG Document Container */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-lg text-slate-900 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Official LGU Header */}
        <div className="text-center border-b-2 border-slate-900/80 pb-6 space-y-1">
          <div className="text-xs uppercase tracking-widest font-serif font-bold text-slate-600">Republic of the Philippines</div>
          <div className="text-xs uppercase tracking-wider font-serif font-bold text-slate-700">Province of Bukidnon • Region X (Northern Mindanao)</div>
          <div className="text-xl sm:text-2xl font-black font-serif tracking-tight text-slate-900 mt-1 uppercase">
            Municipality of Maramag
          </div>
          <div className="text-xs font-bold tracking-wide text-indigo-700 uppercase">
            Office of the Municipal Mayor • Municipal DRRMO & Social Welfare Desk
          </div>
          <div className="text-sm font-black text-slate-800 uppercase tracking-wider pt-3">
            Consolidated Barangay Community Assistance & Volunteer Engagement Report
          </div>
          <div className="text-xs font-semibold text-slate-500 pt-1">
            Reporting Period: <span className="font-bold text-slate-900">{data?.reporting_period}</span> • 20 Official Barangays
          </div>
        </div>

        {/* Section I: Municipal Executive KPIs */}
        <div className="space-y-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            Section I: Municipal Executive Key Performance Indicators
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Filed Across 20 Barangays</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{exec.total_requests ?? 0}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Assistance tickets submitted</div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="text-[11px] font-semibold text-emerald-800 uppercase">Completed Resolutions</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">{exec.completed_requests ?? 0}</div>
              <div className="text-[10px] text-emerald-600 font-bold mt-0.5">{exec.completion_rate}% Municipal Success Rate</div>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
              <div className="text-[11px] font-semibold text-indigo-800 uppercase">Active Volunteer Pool</div>
              <div className="text-2xl font-black text-indigo-700 mt-1">{exec.active_volunteer_helpers ?? 0}</div>
              <div className="text-[10px] text-indigo-600 mt-0.5">Verified local helpers</div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <div className="text-[11px] font-semibold text-amber-800 uppercase">Registered Citizens</div>
              <div className="text-2xl font-black text-amber-700 mt-1">{exec.total_registered_residents ?? 0}</div>
              <div className="text-[10px] text-amber-600 mt-0.5">Across all Maramag Puroks</div>
            </div>
          </div>
        </div>

        {/* Section II: 20-Barangay Performance Ranking */}
        <div className="space-y-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Section II: 20-Barangay Community Performance & Equity Table
          </h2>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Barangay Name</th>
                  <th className="py-2.5 px-3 text-center">Requests Filed</th>
                  <th className="py-2.5 px-3 text-center">Completed</th>
                  <th className="py-2.5 px-3 text-center">Completion Rate</th>
                  <th className="py-2.5 px-3 text-center">Active Helpers</th>
                  <th className="py-2.5 px-3 text-center">Residents</th>
                  <th className="py-2.5 px-3 text-center">Citizen Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.barangay_breakdown?.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-2 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      {b.name}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-slate-800">{b.total_requests}</td>
                    <td className="py-2 px-3 text-center font-semibold text-emerald-700">{b.completed_requests}</td>
                    <td className="py-2 px-3 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${b.completion_rate >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {b.completion_rate}%
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center text-slate-600">{b.active_helpers}</td>
                    <td className="py-2 px-3 text-center text-slate-600">{b.registered_residents}</td>
                    <td className="py-2 px-3 text-center font-bold text-amber-600">
                      ★ {b.average_rating.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section III: Municipality-Wide Category Breakdown */}
        <div className="space-y-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            Section III: Municipal Skill & Assistance Demand Distribution
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {data?.category_breakdown?.map((c, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">{c.category_name}</div>
                  <div className="text-[11px] text-slate-500">
                    {c.total_completed} resolved of {c.total_filed} requested
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-700">{c.completion_rate}%</div>
                  <div className="text-[10px] text-slate-400">Resolution</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Official Signatures & Certification */}
        <div className="pt-8 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-12">
            <div className="text-slate-500 text-[11px]">Prepared & Certified Correct By:</div>
            <div className="border-t border-slate-900/60 pt-1.5 mx-auto max-w-xs font-bold text-slate-900">
              {data?.generated_by || 'LGU Maramag Municipal Admin'}
              <div className="text-[10px] text-slate-500 font-normal">Platform Administrator & Command Overseer</div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="text-slate-500 text-[11px]">Noted & Approved For Submission:</div>
            <div className="border-t border-slate-900/60 pt-1.5 mx-auto max-w-xs font-bold text-slate-900">
              HON. MUNICIPAL MAYOR
              <div className="text-[10px] text-slate-500 font-normal">Municipality of Maramag, Province of Bukidnon</div>
            </div>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-400 pt-4">
          {data?.compliance_statement} • Generated on {data?.generated_at}
        </div>
      </div>
    </div>
  );
};

export default MunicipalDILGReportPage;
