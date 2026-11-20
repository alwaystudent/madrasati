import React, { useEffect } from 'react';
import { Award, X, Sparkles } from 'lucide-react';
import { RewardNotification } from '../types/curriculum';
import { BadgeMedallion } from './BadgeMedallion';

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
  useEffect(() => {
    if (!notification) return;
    const timeout = window.setTimeout(
      onDismiss,
      notification.unlockedBadges.length > 0 ? 7500 : 4500
    );
    return () => window.clearTimeout(timeout);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const hasBadges = notification.unlockedBadges.length > 0;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-5 z-40 max-w-sm w-[calc(100%-2.5rem)] bg-white border border-slate-200 shadow-lg rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            {hasBadges ? (
              <Award className="w-5 h-5 text-amber-600" aria-hidden="true" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-600" aria-hidden="true" />
            )}
          </div>
          <div>
            <div className="text-sm font-display font-bold text-slate-900">
              {hasBadges ? 'وسام افتراضي جديد مفتوح!' : 'أحسنت! نقاط تشجيعية جديدة'}
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

      {hasBadges && (
        <div className="space-y-2 pt-1">
          {notification.unlockedBadges.map((badge) => (
            <div
              key={badge.id}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200"
            >
              <BadgeMedallion badge={badge} unlocked size="sm" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {badge.title}
                </div>
                <div className="text-xs font-medium text-amber-800">
                  +{badge.bonusPoints} نقطة إضافية
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              onDismiss();
              onViewBadges();
            }}
            className="w-full py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            عرض خزانة الأوسمة والنقاط
          </button>
        </div>
      )}
    </div>
  );
};
