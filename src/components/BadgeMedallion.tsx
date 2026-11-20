import React, { useId } from 'react';
import { Lock } from 'lucide-react';
import { BadgeDefinition, BadgeIconKind } from '../types/curriculum';

interface BadgeMedallionProps {
  badge: BadgeDefinition;
  unlocked: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface PaletteSpec {
  rimLight: string;
  rimDark: string;
  coreTop: string;
  coreBottom: string;
  accent: string;
  ribbon: string;
  glowClass: string;
}

const ICON_PALETTES: Record<BadgeIconKind, PaletteSpec> = {
  launch: {
    rimLight: '#7DD3FC',
    rimDark: '#0369A1',
    coreTop: '#0284C7',
    coreBottom: '#0C4A6E',
    accent: '#FDE047',
    ribbon: '#0EA5E9',
    glowClass: 'drop-shadow-[0_6px_14px_rgba(2,132,199,0.28)]',
  },
  perfect: {
    rimLight: '#FDE68A',
    rimDark: '#B45309',
    coreTop: '#F59E0B',
    coreBottom: '#78350F',
    accent: '#FEF9C3',
    ribbon: '#D97706',
    glowClass: 'drop-shadow-[0_6px_16px_rgba(217,119,6,0.34)]',
  },
  lightning: {
    rimLight: '#FDA4AF',
    rimDark: '#BE123C',
    coreTop: '#E11D48',
    coreBottom: '#881337',
    accent: '#FDE047',
    ribbon: '#F43F5E',
    glowClass: 'drop-shadow-[0_6px_14px_rgba(225,29,72,0.28)]',
  },
  science: {
    rimLight: '#6EE7B7',
    rimDark: '#047857',
    coreTop: '#10B981',
    coreBottom: '#064E3B',
    accent: '#A7F3D0',
    ribbon: '#059669',
    glowClass: 'drop-shadow-[0_6px_14px_rgba(5,150,105,0.28)]',
  },
  math: {
    rimLight: '#93C5FD',
    rimDark: '#1D4ED8',
    coreTop: '#2563EB',
    coreBottom: '#1E3A8A',
    accent: '#FDE68A',
    ribbon: '#3B82F6',
    glowClass: 'drop-shadow-[0_6px_14px_rgba(37,99,235,0.28)]',
  },
  bilingual: {
    rimLight: '#C4B5FD',
    rimDark: '#5B21B6',
    coreTop: '#6366F1',
    coreBottom: '#312E81',
    accent: '#DDD6FE',
    ribbon: '#4F46E5',
    glowClass: 'drop-shadow-[0_6px_14px_rgba(79,70,229,0.28)]',
  },
  treasure: {
    rimLight: '#FCD34D',
    rimDark: '#B45309',
    coreTop: '#D97706',
    coreBottom: '#451A03',
    accent: '#FEF08A',
    ribbon: '#F59E0B',
    glowClass: 'drop-shadow-[0_6px_16px_rgba(245,158,11,0.32)]',
  },
  beacon: {
    rimLight: '#FDE047',
    rimDark: '#92400E',
    coreTop: '#0F172A',
    coreBottom: '#1E293B',
    accent: '#FBBF24',
    ribbon: '#D97706',
    glowClass: 'drop-shadow-[0_8px_18px_rgba(217,119,6,0.36)]',
  },
};

export const BadgeMedallion: React.FC<BadgeMedallionProps> = ({
  badge,
  unlocked,
  size = 'md',
}) => {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  const sizeClass =
    size === 'sm'
      ? 'w-11 h-11'
      : size === 'lg'
      ? 'w-20 h-20'
      : size === 'xl'
      ? 'w-28 h-28'
      : 'w-14 h-14';

  const palette = ICON_PALETTES[badge.icon];

  if (!unlocked) {
    const lockIconClass =
      size === 'sm'
        ? 'w-4 h-4'
        : size === 'lg'
        ? 'w-7 h-7'
        : size === 'xl'
        ? 'w-9 h-9'
        : 'w-5 h-5';
    return (
      <div
        className={`${sizeClass} relative flex items-center justify-center shrink-0 select-none`}
      >
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden="true">
          <polygon
            points="40,4 54,10 68,18 74,33 74,47 68,62 54,70 40,76 26,70 12,62 6,47 6,33 12,18 26,10"
            fill="#F1F5F9"
            stroke="#CBD5E1"
            strokeWidth="2.5"
            strokeDasharray="4 3"
          />
          <circle
            cx="40"
            cy="40"
            r="24"
            fill="#E2E8F0"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />
        </svg>
        <Lock
          className={`${lockIconClass} text-slate-400 absolute`}
          aria-hidden="true"
        />
      </div>
    );
  }

  const rimGradId = `rim-${uid}`;
  const coreGradId = `core-${uid}`;
  const shineGradId = `shine-${uid}`;

  const renderCrestEmblem = () => {
    switch (badge.icon) {
      case 'launch':
        return (
          <g>
            {/* Orbital ring & ascending rocket */}
            <ellipse
              cx="40"
              cy="42"
              rx="18"
              ry="7"
              transform="rotate(-24 40 42)"
              fill="none"
              stroke={palette.accent}
              strokeWidth="1.75"
              strokeOpacity="0.8"
            />
            <path
              d="M40 19 C46 26 47 36 45 45 L40 49 L35 45 C33 36 34 26 40 19 Z"
              fill="#FFFFFF"
            />
            <circle cx="40" cy="33" r="3.4" fill={palette.coreBottom} />
            <path d="M34 40 L29 46 L35 45 Z" fill={palette.accent} />
            <path d="M46 40 L51 46 L45 45 Z" fill={palette.accent} />
            <path d="M37.5 49 L40 56 L42.5 49 Z" fill="#FDE047" />
          </g>
        );

      case 'perfect':
        return (
          <g>
            {/* Royal crown with faceted gem apex */}
            <path
              d="M23 48 L21 30 L31 37 L40 23 L49 37 L59 30 L57 48 Z"
              fill="#FEF3C7"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <rect x="23" y="48" width="34" height="4.5" rx="2" fill="#FDE047" />
            <circle cx="21" cy="28" r="2.2" fill="#FFFFFF" />
            <circle cx="40" cy="21" r="2.6" fill="#FFFFFF" />
            <circle cx="59" cy="28" r="2.2" fill="#FFFFFF" />
            <polygon points="40,33 44,39 40,45 36,39" fill="#0284C7" />
          </g>
        );

      case 'lightning':
        return (
          <g>
            {/* Twin speed wings + bold golden bolt */}
            <path
              d="M19 32 C24 31 28 34 31 38 L22 39 Z"
              fill="#FFFFFF"
              fillOpacity="0.85"
            />
            <path
              d="M61 32 C56 31 52 34 49 38 L58 39 Z"
              fill="#FFFFFF"
              fillOpacity="0.85"
            />
            <polygon
              points="43,20 30,41 39,41 36,58 51,36 42,36"
              fill="#FEF08A"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </g>
        );

      case 'science':
        return (
          <g>
            {/* Conical Erlenmeyer flask + atomic orbit */}
            <ellipse
              cx="40"
              cy="39"
              rx="19"
              ry="8"
              transform="rotate(28 40 39)"
              fill="none"
              stroke="#A7F3D0"
              strokeWidth="1.4"
              strokeOpacity="0.85"
            />
            <path
              d="M35 23 H45 M37 23 V32 L28 49 C27 51 28.5 53 31 53 H49 C51.5 53 53 51 52 49 L43 32 V23"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M31.5 43 H48.5 L51 49 C51.5 50.5 50.5 51.5 48.8 51.5 H31.2 C29.5 51.5 28.5 50.5 29 49 Z"
              fill="#6EE7B7"
            />
            <circle cx="38" cy="47" r="1.6" fill="#FFFFFF" />
            <circle cx="43" cy="45" r="1.3" fill="#FFFFFF" />
          </g>
        );

      case 'math':
        return (
          <g>
            {/* 8-point Moroccan/Tunisian geometric star (Rub el Hizb) + compass */}
            <rect
              x="27"
              y="27"
              width="26"
              height="26"
              rx="2"
              fill="none"
              stroke="#FDE68A"
              strokeWidth="2"
            />
            <rect
              x="27"
              y="27"
              width="26"
              height="26"
              rx="2"
              transform="rotate(45 40 40)"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <circle cx="40" cy="40" r="6" fill="#FDE047" />
            <circle cx="40" cy="40" r="2.5" fill={palette.coreBottom} />
          </g>
        );

      case 'bilingual':
        return (
          <g>
            {/* Open book with twin glowing stars (AR / FR) */}
            <path
              d="M22 29 C28 27 35 28 40 32 C45 28 52 27 58 29 V50 C52 48 45 49 40 53 C35 49 28 48 22 50 Z"
              fill="#FFFFFF"
              fillOpacity="0.95"
              stroke="#C4B5FD"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <line
              x1="40"
              y1="32"
              x2="40"
              y2="52"
              stroke={palette.coreBottom}
              strokeWidth="1.6"
            />
            <polygon
              points="31,34 32.3,37 35.5,37.2 33,39.2 33.8,42.2 31,40.5 28.2,42.2 29,39.2 26.5,37.2 29.7,37"
              fill="#F59E0B"
            />
            <polygon
              points="49,34 50.3,37 53.5,37.2 51,39.2 51.8,42.2 49,40.5 46.2,42.2 47,39.2 44.5,37.2 47.7,37"
              fill="#4F46E5"
            />
          </g>
        );

      case 'treasure':
        return (
          <g>
            {/* Faceted brilliant cut gem */}
            <polygon
              points="28,26 52,26 60,36 40,56 20,36"
              fill="#FEF08A"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <polygon points="28,26 52,26 46,36 34,36" fill="#FFFFFF" fillOpacity="0.7" />
            <polygon points="20,36 34,36 40,56" fill="#F59E0B" fillOpacity="0.65" />
            <polygon points="60,36 46,36 40,56" fill="#B45309" fillOpacity="0.45" />
            <line x1="20" y1="36" x2="60" y2="36" stroke="#FFFFFF" strokeWidth="1.2" />
          </g>
        );

      case 'beacon':
        return (
          <g>
            {/* Golden Lighthouse of Tunisia with twin rays */}
            <polygon points="40,26 18,19 18,33" fill="#FDE047" fillOpacity="0.45" />
            <polygon points="40,26 62,19 62,33" fill="#FDE047" fillOpacity="0.45" />
            <path d="M35 31 H45 L48 54 H32 Z" fill="#FFFFFF" />
            <rect x="33.5" y="38" width="13" height="4" fill="#F59E0B" />
            <rect x="32.5" y="46" width="15" height="4" fill="#F59E0B" />
            <rect x="35" y="23" width="10" height="8" rx="1.5" fill="#FDE047" />
            <polygon points="40,16 33,23 47,23" fill="#F59E0B" />
            <circle cx="40" cy="27" r="2.6" fill="#FFFFFF" />
          </g>
        );
    }
  };

  return (
    <div
      className={`${sizeClass} relative flex items-center justify-center shrink-0 select-none ${palette.glowClass}`}
    >
      <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden="true">
        <defs>
          <linearGradient id={rimGradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={palette.rimLight} />
            <stop offset="50%" stopColor={palette.ribbon} />
            <stop offset="100%" stopColor={palette.rimDark} />
          </linearGradient>
          <linearGradient id={coreGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.coreTop} />
            <stop offset="100%" stopColor={palette.coreBottom} />
          </linearGradient>
          <linearGradient id={shineGradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.38" />
            <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Decorative bottom ribbon tails */}
        <path
          d="M25 60 L20 76 L31 71 L35 76 L38 62 Z"
          fill={palette.ribbon}
          stroke={palette.rimDark}
          strokeWidth="1"
        />
        <path
          d="M55 60 L60 76 L49 71 L45 76 L42 62 Z"
          fill={palette.ribbon}
          stroke={palette.rimDark}
          strokeWidth="1"
        />

        {/* Scalloped / 12-point heritage rosette seal */}
        <polygon
          points="40,3 49,9 60,9 65,19 74,26 72,37 77,46 69,55 67,65 56,67 48,74 40,71 32,74 24,67 13,65 11,55 3,46 8,37 6,26 15,19 20,9 31,9"
          fill={`url(#${rimGradId})`}
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />

        {/* Inner enameled medallion disc */}
        <circle
          cx="40"
          cy="40"
          r="25"
          fill={`url(#${coreGradId})`}
          stroke="#FFFFFF"
          strokeWidth="1.6"
          strokeOpacity="0.7"
        />

        {/* Subtle filigree dotted ring */}
        <circle
          cx="40"
          cy="40"
          r="21.5"
          fill="none"
          stroke={palette.accent}
          strokeWidth="0.9"
          strokeDasharray="2 2.5"
          strokeOpacity="0.75"
        />

        {/* Bespoke centerpiece crest */}
        {renderCrestEmblem()}

        {/* Specular highlight glass sheen */}
        <path
          d="M17 34 C19 20 33 14 48 16 C35 19 25 27 20 40 Z"
          fill={`url(#${shineGradId})`}
        />
      </svg>
    </div>
  );
};
