import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, useReducedMotion } from 'motion/react';
import {
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { BadgeDefinition } from '../types/curriculum';
import {
  isCelebrationSoundMuted,
  playBadgeChestFanfare,
  setCelebrationSoundMuted,
} from '../utils/celebrationSound';
import { BadgeMedallion } from './BadgeMedallion';

interface BadgeChestModalProps {
  badges: BadgeDefinition[];
  pointsEarned?: number;
  reason?: string;
  onClose: () => void;
  onViewCabinet?: () => void;
}

export const BadgeChestModal: React.FC<BadgeChestModalProps> = ({
  badges,
  pointsEarned,
  reason,
  onClose,
  onViewCabinet,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [chestOpen, setChestOpen] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [muted, setMuted] = useState(() => isCelebrationSoundMuted());

  const triggerCelebration = () => {
    setChestOpen(false);
    const openTimer = window.setTimeout(() => {
      setChestOpen(true);
      void playBadgeChestFanfare();
      if (!shouldReduceMotion) {
        try {
          void confetti({
            particleCount: 70,
            spread: 68,
            origin: { y: 0.56 },
            colors: ['#0284C7', '#F59E0B', '#10B981', '#6366F1', '#FDE047'],
          });
        } catch {
          // ignore confetti errors in non-canvas environments
        }
      }
    }, shouldReduceMotion ? 20 : 220);

    return openTimer;
  };

  useEffect(() => {
    if (badges.length === 0) return;
    const timer = triggerCelebration();
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayKey, badges.length]);

  if (badges.length === 0) return null;

  const primaryBadge = badges[0];

  const handleToggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    setCelebrationSoundMuted(nextMuted);
    if (!nextMuted) {
      void playBadgeChestFanfare();
    }
  };

  const handleReplay = () => {
    setReplayKey((k) => k + 1);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="badge-chest-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
    >
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Top Control Bar */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleMute}
              aria-label={muted ? 'تفعيل الصوت التشجيعي' : 'كتم الصوت'}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              {muted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  صوت مكتوم
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-sky-700" aria-hidden="true" />
                  صوت التهنئة
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReplay}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              إعادة الفتح
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق صندوق الأوسمة"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Animated Treasure Chest + Medallion Reveal Stage */}
        <div className="relative px-6 pt-3 pb-6 text-center space-y-5">
          {/* Radiant Backlight Stage */}
          <div className="relative mx-auto w-full max-w-xs h-56 flex flex-col items-center justify-end select-none">
            {/* Golden Sunburst Rays when chest opens */}
            <motion.div
              initial={false}
              animate={
                chestOpen
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.7 }
              }
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-none absolute inset-x-0 top-0 bottom-10 flex items-center justify-center"
              aria-hidden="true"
            >
              <div className="w-48 h-48 rounded-full bg-gradient-to-t from-amber-200/70 via-sky-100/45 to-transparent blur-md" />
            </motion.div>

            {/* Medallion Emerging from Chest */}
            <motion.div
              key={`medal-${replayKey}`}
              initial={
                shouldReduceMotion
                  ? { opacity: 1, y: -12, scale: 1 }
                  : { opacity: 0, y: 42, scale: 0.35, rotate: -14 }
              }
              animate={
                chestOpen
                  ? { opacity: 1, y: -16, scale: 1, rotate: 0 }
                  : { opacity: 0, y: 42, scale: 0.35, rotate: -14 }
              }
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 18,
                delay: 0.08,
              }}
              className="relative z-20 flex flex-col items-center"
            >
              <BadgeMedallion badge={primaryBadge} unlocked size="xl" />
            </motion.div>

            {/* Animated Vector Chest */}
            <div className="relative z-10 w-44 h-24 -mt-4">
              <svg viewBox="0 0 180 110" className="w-full h-full overflow-visible" aria-hidden="true">
                <defs>
                  <linearGradient id="chestWood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284C7" />
                    <stop offset="100%" stopColor="#0C4A6E" />
                  </linearGradient>
                  <linearGradient id="chestGold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FDE68A" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#B45309" />
                  </linearGradient>
                </defs>

                {/* Inner cavity glow */}
                <ellipse
                  cx="90"
                  cy="44"
                  rx="64"
                  ry="12"
                  fill={chestOpen ? '#FEF08A' : '#0F172A'}
                  fillOpacity={chestOpen ? 0.9 : 0.4}
                />

                {/* Animated Chest Lid */}
                <motion.g
                  initial={false}
                  animate={
                    chestOpen
                      ? { y: -18, rotate: -16, opacity: 0.92 }
                      : { y: 0, rotate: 0, opacity: 1 }
                  }
                  transition={{ type: 'spring', stiffness: 220, damping: 17 }}
                  style={{ transformOrigin: '24px 44px' }}
                >
                  <path
                    d="M20 44 C20 18 45 10 90 10 C135 10 160 18 160 44 Z"
                    fill="url(#chestWood)"
                    stroke="url(#chestGold)"
                    strokeWidth="4"
                  />
                  {/* Lid brass straps */}
                  <rect x="46" y="12" width="10" height="32" rx="2" fill="url(#chestGold)" />
                  <rect x="124" y="12" width="10" height="32" rx="2" fill="url(#chestGold)" />
                </motion.g>

                {/* Chest Lower Box */}
                <rect
                  x="22"
                  y="44"
                  width="136"
                  height="56"
                  rx="8"
                  fill="url(#chestWood)"
                  stroke="url(#chestGold)"
                  strokeWidth="4"
                />
                {/* Vertical brass trims */}
                <rect x="46" y="46" width="10" height="52" fill="url(#chestGold)" />
                <rect x="124" y="46" width="10" height="52" fill="url(#chestGold)" />
                {/* Horizontal upper rim */}
                <rect x="18" y="41" width="144" height="8" rx="3" fill="url(#chestGold)" />
                {/* Center Star Clasp */}
                <rect
                  x="79"
                  y="42"
                  width="22"
                  height="22"
                  rx="5"
                  fill="#FFFBEB"
                  stroke="#B45309"
                  strokeWidth="2.5"
                />
                <circle cx="90" cy="53" r="4" fill="#B45309" />
              </svg>
            </div>
          </div>

          {/* Copy & Rewards Details */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-amber-700">
              صندوق الأوسمة الجديد مفتوح!
            </div>
            <h2
              id="badge-chest-title"
              className="text-2xl font-display font-extrabold text-slate-900"
            >
              {primaryBadge.title}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              {primaryBadge.description}
            </p>
            {reason && (
              <div className="text-xs text-slate-500 pt-0.5">{reason}</div>
            )}
          </div>

          {/* Bonus Summary Box */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-950">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
              مكافأة الوسام {pointsEarned ? 'والإنجاز' : ''}
            </span>
            <span className="font-mono font-bold text-amber-800 tabular-nums">
              +{pointsEarned ?? primaryBadge.bonusPoints} نقطة
            </span>
          </div>

          {/* Additional simultaneously unlocked badges if more than 1 */}
          {badges.length > 1 && (
            <div className="space-y-2 text-right">
              <div className="text-xs font-semibold text-slate-600">
                أوسمة إضافية فُتحت في نفس الوقت:
              </div>
              <div className="grid grid-cols-1 gap-2">
                {badges.slice(1).map((extra) => (
                  <div
                    key={extra.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <BadgeMedallion badge={extra} unlocked size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {extra.title}
                      </div>
                      <div className="text-xs font-mono text-amber-700 tabular-nums">
                        +{extra.bonusPoints} نقطة إضافية
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {onViewCabinet && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewCabinet();
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              >
                عرض خزانة الأوسمة
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              متابعة التعلّم
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
