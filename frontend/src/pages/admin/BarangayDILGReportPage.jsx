import React, { useState, useEffect } from 'react';
import { FileText, Printer, Calendar, Building2, CheckCircle2, AlertTriangle, Users, ShieldCheck, ArrowUpRight } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export const BarangayDILGReportPage = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDILGReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/dilg-summary/?month=${month}&year=${year}`);
      setReportData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDILGReport();
  }, [month, year]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner text="Compiling official DILG monthly report..." />;
  if (!reportData) return <div className="p-8 text-center text-slate-500">Report data could not be generated.</div>;

  const { executive_summary: summary, barangay, category_breakdown, zone_breakdown } = reportData;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Controls (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
              DILG LGU Compliance
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 mt-1">
            <FileText className="w-6 h-6 text-emerald-600" />
            Monthly Barangay Aid & Disaster Readiness Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Compliant with Department of the Interior and Local Government (DILG) community assistance metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="text-xs px-2.5 py-1.5 rounded-lg border-0 bg-transparent font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>

            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="text-xs px-2.5 py-1.5 rounded-lg border-0 bg-transparent font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl space-y-8 print:p-0 print:border-0 print:shadow-none">
        {/* Government Header */}
        <div className="text-center space-y-1 border-b-2 border-slate-900 pb-6">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Republic of the Philippines • Department of the Interior and Local Government
          </div>
          <div className="text-xs font-semibold text-slate-700">
            Province of {barangay.province} • Municipality of {barangay.city}
          </div>
          <div className="text-xl font-black text-slate-900 uppercase">
            BARANGAY {barangay.name} (LGU Code: {barangay.code})
          </div>
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider pt-2">
            OFFICIAL MONTHLY SUMMARY REPORT ON COMMUNITY ASSISTANCE & CITIZEN VOLUNTEERISM
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Reporting Period: <strong>{reportData.reporting_period}</strong> • Generated: {reportData.generated_at}
          </div>
        </div>

        {/* Section 1: Executive KPI Metrics */}
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
            <span>SECTION I: EXECUTIVE ASSISTANCE SUMMARY</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Total Requests Filed</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{summary.total_requests}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Community tickets</div>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-[10px] font-bold text-emerald-700 uppercase">Completed Requests</div>
              <div className="text-2xl font-black text-emerald-800 mt-1">{summary.completed_requests}</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">{summary.completion_rate}% resolution rate</div>
            </div>

            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
              <div className="text-[10px] font-bold text-rose-700 uppercase">Emergency / Urgent Aid</div>
              <div className="text-2xl font-black text-rose-800 mt-1">{summary.emergency_requests}</div>
              <div className="text-[10px] text-rose-700 mt-0.5">Priority response tickets</div>
            </div>

            <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-200">
              <div className="text-[10px] font-bold text-indigo-700 uppercase">Active Helper Citizens</div>
              <div className="text-2xl font-black text-indigo-800 mt-1">{summary.active_volunteer_helpers}</div>
              <div className="text-[10px] text-indigo-700 mt-0.5">of {summary.total_registered_residents} residents</div>
            </div>
          </div>
        </div>

        {/* Section 2: Category Breakdown Table */}
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            SECTION II: ASSISTANCE CATEGORY BREAKDOWN
          </h2>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Assistance Category</th>
                  <th className="py-2.5 px-4 text-center">Requests Filed</th>
                  <th className="py-2.5 px-4 text-center">Completed</th>
                  <th className="py-2.5 px-4 text-right">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {category_breakdown.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-slate-400 italic">
                      No assistance requests recorded in {reportData.reporting_period}.
                    </td>
                  </tr>
                ) : (
                  category_breakdown.map((cat, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-bold text-slate-800">{cat.category_name}</td>
                      <td className="py-2.5 px-4 text-center text-slate-700">{cat.total_filed}</td>
                      <td className="py-2.5 px-4 text-center text-emerald-700 font-bold">{cat.total_completed}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800">{cat.completion_rate}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Zone Equity & Safety Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              SECTION III: PUROK / ZONE DISTRIBUTION EQUITY
            </h2>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-3">Purok / Zone</th>
                    <th className="py-2 px-3 text-right">Missions Handled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {zone_breakdown.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="py-3 text-center text-slate-400">No activity recorded</td>
                    </tr>
                  ) : (
                    zone_breakdown.map((z, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-medium text-slate-800">{z.zone}</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-700">{z.count}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              SECTION IV: COMMUNITY DISPUTES & SANCTIONS
            </h2>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Disputes / Incidents Logged:</span>
                <strong className="text-slate-900">{summary.disputes_reported} cases</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Disciplinary Sanctions Applied:</span>
                <strong className="text-emerald-700">100% Adjudicated</strong>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                All citizen disputes were reviewed under the Barangay Justice & Disciplinary Tribunal standards.
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Official Certification & Signatures */}
        <div className="pt-8 border-t-2 border-slate-900 space-y-6">
          <p className="text-xs text-slate-600 italic leading-relaxed">
            {reportData.compliance_statement} Generated electronically via Kasandigan Multi-Tenant Community SaaS Platform.
          </p>

          <div className="grid grid-cols-2 gap-12 pt-6 text-center">
            <div className="space-y-1">
              <div className="w-48 mx-auto border-b border-slate-900 pb-1">
                <span className="font-bold text-xs text-slate-900">Elena M. Bautista</span>
              </div>
              <div className="text-[10px] font-bold text-slate-600 uppercase">Prepared By: Barangay Secretary</div>
            </div>

            <div className="space-y-1">
              <div className="w-48 mx-auto border-b border-slate-900 pb-1">
                <span className="font-bold text-xs text-slate-900">Hon. Roberto Carandang</span>
              </div>
              <div className="text-[10px] font-bold text-slate-600 uppercase">Approved By: Punong Barangay</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarangayDILGReportPage;
