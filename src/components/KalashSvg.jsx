import React from 'react';

export default function KalashSvg({ className = "w-28 h-auto mx-auto" }) {
  return (
    <svg className={className} viewBox="0 0 120 140" aria-hidden="true" style={{ filter: 'drop-shadow(0 8px 12px rgba(201,150,43,.35))' }}>
      <defs>
        <linearGradient id="kb" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a8721a" />
          <stop offset="0.35" stopColor="#f7d27a" />
          <stop offset="0.6" stopColor="#e0a83a" />
          <stop offset="1" stopColor="#8f5f12" />
        </linearGradient>
        <linearGradient id="kl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6fb24f" />
          <stop offset="1" stopColor="#2f6b2a" />
        </linearGradient>
        <radialGradient id="kc" cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="#b07a45" />
          <stop offset="1" stopColor="#5e3a1a" />
        </radialGradient>
        <path id="leaf" d="M0 0 C8-10 10-30 0-46 C-10-30-8-10 0 0Z" />
      </defs>
      {/* mango leaves */}
      <g fill="url(#kl)" stroke="#2f6b2a" strokeWidth=".6">
        <use href="#leaf" transform="translate(60 60) rotate(-78)" />
        <use href="#leaf" transform="translate(60 60) rotate(78)" />
        <use href="#leaf" transform="translate(60 60) rotate(-52)" />
        <use href="#leaf" transform="translate(60 60) rotate(52)" />
        <use href="#leaf" transform="translate(60 60) rotate(-26)" />
        <use href="#leaf" transform="translate(60 60) rotate(26)" />
      </g>
      {/* coconut */}
      <ellipse cx="60" cy="42" rx="14" ry="18" fill="url(#kc)" />
      <path d="M55 25 C57 20 63 20 65 25 C62 23 58 23 55 25Z" fill="#7a5230" />
      <path d="M45 48 C50 40 70 40 75 48 L74 60 H46Z" fill="#c81e2e" />
      <path d="M46 52 C52 47 68 47 74 52" fill="none" stroke="#ffd27a" strokeWidth="1.4" />
      {/* rim and neck */}
      <ellipse cx="60" cy="61" rx="22" ry="5" fill="url(#kb)" stroke="#8f5f12" strokeWidth=".6" />
      <path d="M45 63 H75 L72 76 H48Z" fill="url(#kb)" />
      {/* kalava */}
      <path d="M47 68 H73" stroke="#d62828" strokeWidth="2.4" />
      <path d="M47.6 71 H72.4" stroke="#f5b301" strokeWidth="2" />
      {/* body */}
      <path d="M48 75 C22 80 14 106 28 122 C38 133 82 133 92 122 C106 106 98 80 72 75Z" fill="url(#kb)" stroke="#8f5f12" strokeWidth=".8" />
      <path d="M26 96 C40 101 80 101 94 96" fill="none" stroke="#fff3c4" strokeWidth="1" strokeDasharray="1.5 3" opacity=".9" />
      <ellipse cx="42" cy="100" rx="5" ry="13" fill="#fff" opacity=".22" />
      {/* swastik */}
      <g stroke="#a3172b" strokeWidth="2.6" strokeLinecap="round" fill="none">
        <path d="M60 99 V119 M50 109 H70" />
        <path d="M60 99 H67 M70 109 V116 M60 119 H53 M50 109 V102" />
      </g>
      <g fill="#a3172b">
        <circle cx="54.5" cy="103.5" r="1.4" />
        <circle cx="65.5" cy="103.5" r="1.4" />
        <circle cx="54.5" cy="114.5" r="1.4" />
        <circle cx="65.5" cy="114.5" r="1.4" />
      </g>
      {/* base */}
      <path d="M44 128 H76 L72 134 H48Z" fill="url(#kb)" stroke="#8f5f12" strokeWidth=".6" />
    </svg>
  );
}
