import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Sparkles, X } from 'lucide-react';
import { RewardNotification } from '../types/curriculum';
import { playPointsChime } from '../utils/celebrationSound';
import { BadgeChestModal } from './BadgeChestModal';

interface RewardToastProps {
  notification: RewardNotification | null;
  onDismiss: () => void;
  onViewBadges: () => void;
}

export const RewardToast: React.FC<RewardToastProps> = ({
  notification,
  onDismiss,
  onViewBadges,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const hasBadges = Boolean(notification && notification.unlockedBadges.length > 0);

  useEffect(() => {
    if (!notification || hasBadges) return;
    void playPointsChime();
    const timeout = window.setTimeout(onDismiss, 4500);
    return () => window.clearTimeout(timeout);
  }, [notification, hasBadges, onDismiss]);

  if (!notification) return null;

  if (hasBadges) {
    return (
      <BadgeChestModal
        badges={notification.unlockedBadges}
        pointsEarned={notification.pointsEarned}
        reason={notification.reason}
        onClose={onDismiss}
        onViewCabinet={onViewBadges}
      />
    );
  }

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-5 left-5 z-40 max-w-sm w-[calc(100%-2.5rem)] bg-white border border-slate-200 shadow-lg rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-600" aria-hidden="true" />
          </div>
          <div>
            <div className="text-sm font-display font-bold text-slate-900">
              أحسنت! نقاط تشجيعية جديدة
            </div>
            <div className="text-xs text-slate-600">{notification.reason}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="إغلاق الإشعار"
          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-sky-50 border border-sky-200 text-xs">
        <span className="font-medium text-sky-900">المكافأة المضافة لرصيدك</span>
        <span className="font-mono font-bold text-sky-800 tabular-nums">
          +{notification.pointsEarned} نقطة
        </span>
      </div>
    </motion.div>
  );
};
