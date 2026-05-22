import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className, size = 40 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 92 92" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="hx2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6339FF"/>
          <stop offset="55%" stopColor="#3B1FA8"/>
          <stop offset="100%" stopColor="#00D4B4" stopOpacity={0.85}/>
        </linearGradient>
        <linearGradient id="cp2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A78BFA"/>
          <stop offset="100%" stopColor="#67E8F9"/>
        </linearGradient>
        <linearGradient id="dt2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5D03B"/>
          <stop offset="100%" stopColor="#FF6432"/>
        </linearGradient>
        <filter id="gl2">
          <feGaussianBlur stdDeviation="2.2" result="b"/>
          <feMerge>
            <feMergeNode in="b"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="46" cy="46" r="44" fill="none" stroke="url(#cp2)" strokeWidth="0.6" opacity="0.45"/>
      <circle cx="46" cy="46" r="38" fill="none" stroke="#6339FF" strokeWidth="0.4" opacity="0.25"/>
      <polygon points="46,8 80,27 80,65 46,84 12,65 12,27" fill="url(#hx2)"/>
      <rect x="28" y="26" width="36" height="8" rx="2" fill="url(#cp2)" filter="url(#gl2)"/>
      <rect x="28" y="58" width="36" height="8" rx="2" fill="url(#cp2)" filter="url(#gl2)"/>
      <rect x="40" y="34" width="12" height="24" rx="1.5" fill="#E0E7FF"/>
      <circle cx="28" cy="30" r="3.2" fill="url(#dt2)" filter="url(#gl2)"/>
      <circle cx="64" cy="30" r="3.2" fill="url(#dt2)" filter="url(#gl2)"/>
      <circle cx="28" cy="62" r="3.2" fill="#00D4B4" filter="url(#gl2)"/>
      <circle cx="64" cy="62" r="3.2" fill="#00D4B4" filter="url(#gl2)"/>
      <line x1="46" y1="1" x2="46" y2="7" stroke="#A78BFA" strokeWidth="1.5" opacity="0.9"/>
      <line x1="84" y1="24" x2="80" y2="27" stroke="#67E8F9" strokeWidth="1.5" opacity="0.9"/>
      <line x1="84" y1="68" x2="80" y2="65" stroke="#00D4B4" strokeWidth="1.5" opacity="0.9"/>
      <line x1="46" y1="91" x2="46" y2="85" stroke="#00D4B4" strokeWidth="1.5" opacity="0.9"/>
      <line x1="8"  y1="68" x2="12" y2="65" stroke="#F5D03B" strokeWidth="1.5" opacity="0.9"/>
      <line x1="8"  y1="24" x2="12" y2="27" stroke="#F5D03B" strokeWidth="1.5" opacity="0.9"/>
    </svg>
  );
};
