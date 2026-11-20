import React from 'react';
import {
  Rocket,
  Crown,
  Zap,
  FlaskConical,
  Compass,
  BookOpen,
  Gem,
  Award,
  Lock,
} from 'lucide-react';
import { BadgeDefinition } from '../types/curriculum';

interface BadgeMedallionProps {
  badge: BadgeDefinition;
  unlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const THEME_CLASSES: Record<
  BadgeDefinition['theme'],
  { bg: string; ring: string; icon: string }
> = {
  sky: {
    bg: 'bg-sky-50',
    ring: 'border-sky-300',
    icon: 'text-sky-700',
  },
  amber: {
    bg: 'bg-amber-50',
    ring: 'border-amber-300',
    icon: 'text-amber-700',
  },
  emerald: {
    bg: 'bg-emerald-50',
    ring: 'border-emerald-300',
    icon: 'text-emerald-700',
  },
  indigo: {
    bg: 'bg-indigo-50',
    ring: 'border-indigo-300',
    icon: 'text-indigo-700',
  },
  rose: {
    bg: 'bg-rose-50',
    ring: 'border-rose-300',
    icon: 'text-rose-700',
  },
};

export const BadgeMedallion: React.FC<BadgeMedallionProps> = ({
  badge,
  unlocked,
  size = 'md',
}) => {
  const sizeClass =
    size === 'sm'
      ? 'w-10 h-10'
      : size === 'lg'
      ? 'w-16 h-16'
      : 'w-12 h-12';

  const iconSizeClass =
    size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  const theme = THEME_CLASSES[badge.theme];

  const renderIcon = () => {
    if (!unlocked) {
      return <Lock className={`${iconSizeClass} text-slate-400`} aria-hidden="true" />;
    }
    switch (badge.icon) {
      case 'launch':
        return <Rocket className={`${iconSizeClass} ${theme.icon}`} aria-hidden="true" />;
      case 'perfect':
        return <Crown className={`${iconSizeClass} ${theme.icon}`} aria-hidden="true" />;
      case 'lightning':
        return <Zap className={`${iconSizeClass} ${theme.icon}`} aria-hidden="true" />;
      case 'science':
        return <FlaskConical className={`${iconSizeClass} ${theme.icon}`} aria-hidden="true" />;
      case 'math':
        return <Compass className={`${iconSizeClass} ${theme.icon}`} aria-hidden="true" />;
      case 'bilingual':
        return <BookOpen className={`${iconSizeClass} ${theme.icon}`} aria-hidden="true" />;
      case 'treasure':
        return <Gem className={`${iconSizeClass} ${theme.icon}`} aria-hidden="true" />;
      case 'beacon':
        return <Award className={`${iconSizeClass} ${theme.icon}`} aria-hidden="true" />;
    }
  };

  return (
    <div
      className={`${sizeClass} rounded-2xl border-2 flex items-center justify-center shrink-0 transition-transform ${
        unlocked
          ? `${theme.bg} ${theme.ring}`
          : 'bg-slate-100 border-slate-200 border-dashed'
      }`}
    >
      {renderIcon()}
    </div>
  );
};
