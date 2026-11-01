import React, { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';

export default function InfoTooltip({ title, text, example }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-flex items-center ml-1 align-middle" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-stone-400 hover:text-amber-600 focus:outline-hidden p-0.5 rounded-full hover:bg-amber-50 transition-colors"
        title="More information & guidance"
        aria-label="More information"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-stone-900 text-stone-100 rounded-xl shadow-xl z-50 text-xs leading-relaxed border border-stone-700 animate-in fade-in zoom-in-95">
          <div className="flex items-start justify-between gap-1 mb-1 border-b border-stone-700/60 pb-1">
            <span className="font-semibold text-amber-300 text-[11px] uppercase tracking-wider">
              {title || 'Guidance'}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-stone-300 text-[11px] mb-1.5">{text}</p>
          {example && (
            <div className="p-1.5 rounded-lg bg-stone-800/80 border border-stone-700 text-[10px] text-amber-200">
              <span className="text-stone-400 font-medium">Tip: </span>{example}
            </div>
          )}
          {/* Arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-stone-900" />
        </div>
      )}
    </div>
  );
}
