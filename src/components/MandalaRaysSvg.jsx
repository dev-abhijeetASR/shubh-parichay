import React, { useMemo } from 'react';

export function MandalaSvg({ className = "w-64 h-64 opacity-15" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100" fill="none" stroke="#ffd27a" strokeWidth="1.2">
      <circle r="46" />
      <circle r="34" />
      <circle r="12" />
      <g id="petal-m">
        <path d="M0-12 C8-22 8-30 0-44 C-8-30-8-22 0-12Z" />
      </g>
      {Array.from({ length: 11 }).map((_, i) => (
        <use key={i} href="#petal-m" transform={`rotate(${(i + 1) * 30})`} />
      ))}
    </svg>
  );
}

export function SuryaRaysSvg({ className = "w-[340px] h-[340px]" }) {
  // Generate 32 radial rays
  const rays = useMemo(() => {
    return Array.from({ length: 32 }).map((_, i) => {
      const len = i % 2 === 1 ? 78 : 98;
      return {
        d: `M0-${len} 3.2-40h-6.4z`,
        transform: `rotate(${(i * 360) / 32})`
      };
    });
  }, []);

  return (
    <svg className={className} viewBox="-100 -100 200 200" aria-hidden="true">
      <defs>
        <radialGradient id="surya-rg" r=".5">
          <stop offset=".3" stopColor="#ffe6a3" stopOpacity=".95" />
          <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="62" fill="#ffd27a" opacity=".18" />
      <g fill="url(#surya-rg)">
        {rays.map((ray, idx) => (
          <path key={idx} d={ray.d} transform={ray.transform} />
        ))}
      </g>
    </svg>
  );
}

export function VanshSunIcon({ className = "w-7 h-7 flex-none" }) {
  return (
    <svg className={className} viewBox="-16 -16 32 32" aria-hidden="true">
      <g fill="#d9480f">
        <circle r="6.5" />
        <g id="sr">
          <path d="M0-15 2-9h-4z" />
        </g>
        {Array.from({ length: 7 }).map((_, i) => (
          <use key={i} href="#sr" transform={`rotate(${(i + 1) * 45})`} />
        ))}
      </g>
      <circle r="3" fill="#ffd27a" />
    </svg>
  );
}
