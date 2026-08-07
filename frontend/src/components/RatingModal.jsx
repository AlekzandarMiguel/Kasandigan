import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import api from '../services/api';

export const RatingModal = ({ isOpen, onClose, request, onRated }) => {
  const [score, setScore] = useState(5);
  const [hoverScore, setHoverScore] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !request) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/ratings/', {
        request: request.id,
        score,
        review,
      });
      if (onRated) onRated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.request?.[0] || 'Failed to submit rating.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-1">Rate Community Helper</h3>
        <p className="text-sm text-slate-500 mb-4">
          How was your experience with <span className="font-semibold text-slate-700">{request.assigned_helper_name || 'your helper'}</span> for "{request.title}"?
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star selector */}
          <div className="flex justify-center items-center gap-2 py-3 bg-slate-50 rounded-xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setScore(star)}
                onMouseEnter={() => setHoverScore(star)}
                onMouseLeave={() => setHoverScore(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverScore || score) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="text-center text-xs font-semibold text-slate-600">
            {score === 5 && '★★★★★ Excellent assistance!'}
            {score === 4 && '★★★★ Very good helper'}
            {score === 3 && '★★★ Satisfactory'}
            {score === 2 && '★★ Needs improvement'}
            {score === 1 && '★ Unsatisfactory'}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Feedback or Compliment (Optional)
            </label>
            <textarea
              rows="3"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="e.g. Prompt, friendly, and repaired our chair cleanly..."
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
