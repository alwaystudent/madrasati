import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CalendarHeart, ArrowLeft, X, Sparkles } from 'lucide-react';

interface ReturnReminderBannerProps {
  studentName: string;
  daysAbsent: number;
  onClaimAndStartExpress: () => void;
  onClaimAndExploreLessons: () => void;
  onDismiss: () => void;
}

export const ReturnReminderBanner: React.FC<ReturnReminderBannerProps> = ({
  studentName,
  daysAbsent,
  onClaimAndStartExpress,
  onClaimAndExploreLessons,
  onDismiss,
}) => {
  const [mascotFailed, setMascotFailed] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      role="region"
      aria-label="تذكير لطيف للعودة إلى المنصة"
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-l from-amber-50/90 via-white to-sky-50/90 p-5 sm:p-6 shadow-xs"
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="إغلاق التذكير"
        className="absolute top-3.5 left-3.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pl-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white border border-amber-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
            {!mascotFailed ? (
              <img
                src="/src/assets/images/mascot_fanak_fox_1795189779395.jpg"
                alt="فنك الذكي يرحب بعودتك"
                referrerPolicy="no-referrer"
                onError={() => setMascotFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <CalendarHeart className="w-7 h-7 text-amber-600" aria-hidden="true" />
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-800">
              <CalendarHeart className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
              <span>رسالة ترحيب من فنك الذكي</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                غياب {daysAbsent} أيام عن المنارة
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 leading-snug">
              اشتقنا لك يا {studentName.trim() || 'عزيز'}! مكانك ما زال ينتظرك بحماس
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
              لا تشغل بالك بما فات؛ خطوة قصيرة واحدة تكفي اليوم لتستعيد نشاطك. ابدأ بتمرين خفيف واحصل فوراً على{' '}
              <strong className="font-mono text-amber-800 tabular-nums">+25 نقطة</strong> ترحيب بعودتك.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClaimAndStartExpress}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            عدتُ بحماس! (+25 نقطة)
          </button>
          <button
            type="button"
            onClick={onClaimAndExploreLessons}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            افتح الدروس
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
