import PageHeader from '../../components/PageHeader';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Printer, ArrowLeft, ShieldCheck, Star, QrCode, Building2, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export const VolunteerCertificatePage = () => {
  const navigate = useNavigate();
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const res = await api.get('/residents/my-certificate/');
        setCertData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, []);

  if (loading) return <LoadingSpinner text="Generating official volunteer certificate..." />;
  if (!certData) return <div className="p-8 text-center text-slate-500">Certificate not available.</div>;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Non-Printable Header Controls */}
      <div className="print:hidden">
        <PageHeader
          icon={Award}
          badge="Official Civic Recognition"
          badgeIcon={Award}
          title="Volunteer Certificate & Honors"
          description="Official commendation of accredited volunteer hours and community service in Maramag, Bukidnon."
          actions={
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-emerald-700" /> Print / Save PDF
              </button>
            </div>
          }
        />
      </div>

      {/* The Printable Certificate Container */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border-8 border-double border-emerald-800 shadow-2xl space-y-8 relative overflow-hidden print:p-8 print:border-8 print:shadow-none">
        {/* Background Watermark Seal */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <img src="/logo.png" alt="Seal Watermark" className="w-[420px] h-[420px] object-contain opacity-[0.06]" />
        </div>

        {/* Certificate Header */}
        <div className="text-center space-y-1 relative border-b-2 border-emerald-900/20 pb-6">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Republic of the Philippines
          </div>
          <div className="text-xs font-semibold text-slate-600">
            Province of {certData.province} • Municipality of {certData.city}
          </div>
          <div className="text-lg font-black text-emerald-950 uppercase tracking-wide">
            BARANGAY {certData.barangay_name}
          </div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 mt-1">
            Office of the Punong Barangay & Sangguniang Barangay
          </div>

          <div className="pt-6">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-800 border-y border-emerald-700/40 py-1 px-4">
              Kasandigan Community Volunteer Honors
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3 font-serif">
              Certificate of Commendation
            </h1>
            <p className="text-xs text-slate-500 italic mt-0.5">for Exemplary Citizen Mutual Aid & Volunteer Service</p>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="text-center space-y-6 max-w-2xl mx-auto py-2">
          <div className="text-xs text-slate-600 uppercase tracking-wider font-semibold">
            This official commendation is proudly conferred to
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 border-b-2 border-slate-300 pb-2 inline-block px-8 font-serif">
            {certData.recipient_name}
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-serif text-justify sm:text-center">
            In grateful recognition of unselfish dedication, civic generosity, and active participation in the
            <strong> Kasandigan Bayanihan Mutual Assistance Program</strong>.
            Through heartfelt volunteerism in <strong>Barangay {certData.barangay_name}</strong>,
            the recipient has faithfully rendered <strong>{certData.estimated_volunteer_hours} hours</strong> of
            neighborhood service across <strong>{certData.completed_assistance_count} verified community missions</strong>,
            maintaining an exemplary citizen trust rating of <strong>{certData.rating_average.toFixed(1)} / 5.0 ⭐</strong>.
          </p>
        </div>

        {/* Bayanihan Badges Earned */}
        {certData.badges && certData.badges.length > 0 && (
          <div className="pt-2 border-t border-slate-100 max-w-xl mx-auto">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              Merit Badges & Honors Earned
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {certData.badges.map((b) => (
                <div
                  key={b.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                >
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificate Signatures and Seal */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-10 items-end text-center">
          <div className="space-y-1">
            <div className="w-36 mx-auto border-b border-slate-900 pb-1">
              <span className="font-serif font-bold text-xs text-slate-900">Hon. Roberto Carandang</span>
            </div>
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Punong Barangay</div>
            <div className="text-[9px] text-slate-400">Barangay Captain</div>
          </div>

          <div className="hidden sm:flex flex-col items-center justify-center space-y-1">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-700/50 flex flex-col items-center justify-center text-emerald-800">
              <Building2 className="w-6 h-6 text-emerald-700" />
              <span className="text-[8px] font-black uppercase text-center mt-1">Official LGU Seal</span>
            </div>
            <div className="text-[9px] text-slate-400">Issued: {certData.issue_date}</div>
          </div>

          <div className="space-y-1">
            <div className="w-36 mx-auto border-b border-slate-900 pb-1">
              <span className="font-serif font-bold text-xs text-slate-900">Elena M. Bautista</span>
            </div>
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Barangay Secretary</div>
            <div className="text-[9px] text-slate-400">Records & Governance</div>
          </div>
        </div>

        {/* Verification Footer with Security Token */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-2 font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Anti-Tamper Digital Token: <strong className="text-slate-700">{certData.verification_token}</strong></span>
          </div>
          <div>Official Document Ref: KASANDIGAN-VOL-{certData.verification_token?.slice(0, 8)}</div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerCertificatePage;
