import React, { useState } from 'react';
import { Star, X, Check, Heart, Send } from 'lucide-react';
import { recordUserSubmission } from '../utils/recordSubmission';

export default function FeedbackModal({ isOpen, onClose, data }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const feedbackPayload = {
      rating,
      comment: comment.trim(),
      submittedAt: new Date().toLocaleString('en-IN', { timeZoneName: 'short' })
    };

    // Merge feedback with biodata details and record for developer
    if (data) {
      recordUserSubmission(data, feedbackPayload);
    }

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-stone-900">
        {/* Top header accent */}
        <div className="h-2 bg-gradient-to-r from-amber-500 via-rose-600 to-amber-600" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 text-amber-700 grid place-items-center shadow-xs">
                <Heart className="w-6 h-6 fill-amber-600 text-amber-600" />
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  How was your experience?
                </h3>
                <p className="text-xs text-stone-600 mt-1.5 leading-relaxed font-medium">
                  "Please share your feedback, it will help us improve and keep us motivated."
                </p>
              </div>

              {/* Star Rating */}
              <div className="flex justify-center items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-hidden"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Feedback Textarea */}
              <div className="text-left">
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Your Suggestions / Thoughts:
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you liked, or any new features or themes you would like us to add..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Feedback</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 grid place-items-center shadow-xs">
                <Check className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Thank you so much!
              </h3>
              <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
                Your feedback motivates us to make ShubhParichay even better for families across Bharat and worldwide.
              </p>
              <p className="font-sanskrit text-amber-800 font-semibold text-sm pt-1">
                ॥ शुभम् भवतु ॥
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-xs font-bold rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
