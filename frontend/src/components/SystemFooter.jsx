import React, { useState } from 'react';
import { X, Shield, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';

export const SystemFooter = ({ className = '' }) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <footer
        className={`fixed bottom-0 inset-x-0 w-full z-40 h-10 border-t border-slate-200 bg-white text-slate-400 text-[11px] px-4 sm:px-6 select-none flex items-center ${className}`}
      >
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Left: Branding & Municipality */}
          <div className="flex items-center gap-2">
            <Logo size="xs" className="w-4 h-4" />
            <span className="font-bold text-slate-700">Kasandigan SaaS</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 truncate">{t('maramag_lgu', 'Municipality of Maramag, Bukidnon')}</span>
          </div>

          {/* Right: Clean text links & copyright (No badges) */}
          <div className="flex items-center gap-3 text-slate-400 shrink-0">
            <button
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              className="hover:text-slate-700 transition-colors cursor-pointer"
            >
              {t('footer_data_privacy', 'Data Privacy (RA 10173)')}
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => setShowSupportModal(true)}
              className="hover:text-slate-700 transition-colors cursor-pointer"
            >
              {t('footer_hotlines', 'Support & Hotlines')}
            </button>
            <span className="text-slate-300">•</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>

      {/* Data Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Data Privacy & Statutory Compliance</span>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-[60vh] overflow-y-auto">
              <p>
                <strong>Republic Act No. 10173 (Data Privacy Act of 2012):</strong> Kasandigan enforces strict tenant-level logical data separation. Resident records, verification IDs, and assistance requests remain strictly partitioned to your home barangay and authorized municipal staff.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">Privacy Safeguards Active</div>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                  <li>Encrypted in transit (TLS 1.3) and at rest</li>
                  <li>Role-based access control with audit logging</li>
                  <li>Automatic data anonymization for municipal reporting</li>
                </ul>
              </div>
              <p>
                Assistance transactions are recorded for public transparency under DILG community assistance guidelines without revealing sensitive personal contact numbers publicly.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hotlines & Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>Maramag Municipal Hotlines & Helpdesk</span>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">MDRRMO Maramag Emergency Dispatch</div>
                <div className="text-slate-800 font-mono text-sm font-bold">911 • (088) 828-2020</div>
                <div className="text-[11px] text-slate-500">24/7 Disaster Response & Ambulance Services</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800">PNP Maramag Station</div>
                  <div className="font-mono text-slate-600 text-xs mt-0.5">0917-710-1234</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800">BFP Fire Station</div>
                  <div className="font-mono text-slate-600 text-xs mt-0.5">0926-890-5678</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800">Municipal Health Office</div>
                  <div className="font-mono text-slate-600 text-xs mt-0.5">(088) 828-2234</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800">Kasandigan IT Support</div>
                  <div className="font-mono text-slate-600 text-xs mt-0.5">support@kasandigan.gov.ph</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SystemFooter;
