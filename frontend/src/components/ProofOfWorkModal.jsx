import React, { useState } from 'react';
import { CheckCircle2, Image, FileText, X, Sparkles, Upload } from 'lucide-react';

export const ProofOfWorkModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [proofUrl, setProofUrl] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      completion_proof_url: proofUrl.trim(),
      completion_notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Complete Assistance & Proof of Work</h3>
              <p className="text-[11px] text-slate-500">Provide proof for requester verification</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Proof of Work Photo URL (Optional)
            </label>
            <div className="relative">
              <Image className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="url"
                placeholder="https://example.com/photo-proof.jpg"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Provide an image URL showing the completed repair, delivery receipt, or service result.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Resolution Summary / Work Done
            </label>
            <textarea
              rows="3"
              required
              placeholder="Briefly describe what assistance was rendered..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Mark Completed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProofOfWorkModal;
