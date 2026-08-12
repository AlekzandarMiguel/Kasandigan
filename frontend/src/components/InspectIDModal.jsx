import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, ShieldCheck, FileText, User, MapPin } from 'lucide-react';
import api from '../services/api';

export const InspectIDModal = ({ resident, onClose, onVerified }) => {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!resident) return null;

  const docTypeLabels = {
    BARANGAY_CLEARANCE: 'Barangay Residency Clearance',
    VOTER_ID: "COMELEC Voter's ID",
    CMU_ID: 'Central Mindanao University (CMU) ID',
    GOV_ID: 'Government Issued ID',
  };

  const handleAction = async (status) => {
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/residents/${resident.id}/verify/`, {
        status,
        notes: notes || (status === 'VERIFIED' ? 'ID Document verified by Barangay Staff' : 'Residency proof rejected')
      });
      onVerified();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update verification status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-bold text-sm">Resident ID Verification</h3>
              <p className="text-[11px] text-emerald-100">Municipality of Maramag • Barangay Staff Desk</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Resident Details */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Resident Name</div>
              <div className="font-bold text-slate-900 text-sm">{resident.full_name || `${resident.first_name} ${resident.last_name}`}</div>
              <div className="text-slate-500 text-[11px]">{resident.email}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Purok / Location</div>
              <div className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                {resident.zone || 'Purok not specified'}
              </div>
              <div className="text-slate-500 text-[11px]">{resident.mobile_number || 'No contact number'}</div>
            </div>
          </div>

          {/* ID Document Preview Card */}
          <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                {docTypeLabels[resident.id_document_type] || 'Barangay Residency Document'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                {resident.id_document_type || 'CLEARANCE'}
              </span>
            </div>

            {resident.id_document_url ? (
              <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={resident.id_document_url}
                  alt="Resident ID Document"
                  className="w-full max-h-56 object-contain bg-slate-900/5"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div style={{ display: 'none' }} className="p-4 text-center text-slate-500 text-xs">
                  Unable to preview image directly. <a href={resident.id_document_url} target="_blank" rel="noreferrer" className="text-emerald-600 underline">Click here to open link</a>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center text-slate-500 text-xs">
                <FileText className="w-8 h-8 mx-auto text-slate-400 mb-1.5" />
                <p className="font-medium text-slate-700">No digital photo attached by resident.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Resident may have presented physical ID at the South Poblacion / Musuan Barangay Hall desk.</p>
              </div>
            )}
          </div>

          {/* Verification Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Barangay Staff Verification Notes (Optional)
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Confirmed resident of Purok 2 via physical Barangay ID logbook."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleAction('REJECTED')}
            disabled={submitting}
            className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" /> Reject ID
          </button>
          <button
            type="button"
            onClick={() => handleAction('VERIFIED')}
            disabled={submitting}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm rounded-xl transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Verify Resident
          </button>
        </div>
      </div>
    </div>
  );
};

export default InspectIDModal;
