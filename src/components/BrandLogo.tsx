import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = false,
}) => {
  const boxClass =
    size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const titleClass =
    size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div
        className={`${boxClass} rounded-xl overflow-hidden shrink-0 shadow-xs border border-sky-200/80 bg-gradient-to-br from-sky-600 via-sky-700 to-teal-700 flex items-center justify-center`}
      >
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full"
          role="img"
          aria-label="شعار أكاديمية عزيز"
        >
          <defs>
            <linearGradient id="azizSkyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
            <linearGradient id="azizGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="14" fill="url(#azizSkyGrad)" />
          {/* Djerba whitewashed dome & Mediterranean arch silhouette */}
          <path
            d="M12 52V36C12 24.954 20.954 16 32 16C43.046 16 52 24.954 52 36V52H12Z"
            fill="#ffffff"
            fillOpacity="0.16"
          />
          <path
            d="M19 48V35C19 27.82 24.82 22 32 22C39.18 22 45 27.82 45 35V48"
            stroke="#ffffff"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
          {/* Open illustrated book forming the academy heart */}
          <path
            d="M21 44.5C24.5 42.5 28.5 42.5 32 44.8C35.5 42.5 39.5 42.5 43 44.5V35.5C39.5 33.5 35.5 33.5 32 35.8C28.5 33.5 24.5 33.5 21 35.5V44.5Z"
            fill="#ffffff"
          />
          <line
            x1="32"
            y1="35.8"
            x2="32"
            y2="44.8"
            stroke="#0284c7"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Tunisian bright morning star above the dome */}
          <path
            d="M32 9L34.1 13.8L39.2 14.3L35.3 17.7L36.5 22.8L32 20.1L27.5 22.8L28.7 17.7L24.8 14.3L29.9 13.8L32 9Z"
            fill="url(#azizGoldGrad)"
          />
        </svg>
      </div>

      <div className="min-w-0 text-right">
        <div
          className={`${titleClass} font-display font-bold tracking-tight text-slate-900 leading-tight whitespace-nowrap`}
        >
          أكاديمية عزيز
        </div>
        {showTagline && (
          <div className="text-xs font-semibold text-sky-700 whitespace-nowrap">
            الابتدائي التونسي · 2026
          </div>
        )}
      </div>
    </div>
  );
};
