import React, { useMemo } from 'react';

export default function FallingPetals({ count = 20 }) {
  const petals = useMemo(() => {
    const kinds = [
      'bg-gradient-to-br from-amber-300 to-orange-500', // Saffron/Marigold
      'bg-gradient-to-br from-rose-300 to-rose-600',    // Rose red
      'bg-gradient-to-br from-yellow-200 to-amber-400'  // Golden Marigold
    ];

    return Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100;
      const duration = 10 + Math.random() * 12;
      const delay = -Math.random() * 20;
      const scale = 0.7 + Math.random() * 0.8;
      const bgClass = kinds[i % 3];

      return {
        id: i,
        bgClass,
        style: {
          left: `${left}vw`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          width: `${14 * scale}px`,
          height: `${10 * scale}px`
        }
      };
    });
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden no-print" aria-hidden="true">
      {petals.map(p => (
        <span key={p.id} className={`petal ${p.bgClass}`} style={p.style} />
      ))}
    </div>
  );
}
