import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, Lock, Printer, Sparkles, Star } from 'lucide-react';
import { BADGES } from '../data/tunisianCurriculum';

export const CERTIFICATE_BADGE_THRESHOLD = 3;

interface AppreciationCertificateProps {
  studentName: string;
  gradeLabel: string;
  governorate: string;
  points: number;
  streakDays: number;
  overallMasteryPercent: number;
  unlockedBadges: Record<string, string>;
}

export const AppreciationCertificate: React.FC<AppreciationCertificateProps> = ({
  studentName,
  gradeLabel,
  governorate,
  points,
  streakDays,
  overallMasteryPercent,
  unlockedBadges,
}) => {
  const [customNote, setCustomNote] = useState(
    'لمواظبته المتميّزة واجتهاده الرائع في إنجاز الدروس والتدريبات التفاعلية للسنة الدراسية 2026.'
  );
  const earnedIds = Object.keys(unlockedBadges || {});
  const earnedCount = earnedIds.length;
  const isUnlocked = earnedCount >= CERTIFICATE_BADGE_THRESHOLD;
  const progressPercent = Math.min(
    100,
    Math.round((earnedCount / CERTIFICATE_BADGE_THRESHOLD) * 100)
  );
  const remaining = Math.max(0, CERTIFICATE_BADGE_THRESHOLD - earnedCount);

  const earnedBadgeDefs = BADGES.filter((b) => earnedIds.includes(b.id));
  const issueDate = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const cleanupPrint = () => {
      document.body.classList.remove('print-certificate-mode');
    };
    window.addEventListener('afterprint', cleanupPrint);
    return () => {
      window.removeEventListener('afterprint', cleanupPrint);
      document.body.classList.remove('print-certificate-mode');
    };
  }, []);

  const handlePrintCertificate = () => {
    document.body.classList.add('print-certificate-mode');
    window.setTimeout(() => {
      window.print();
    }, 60);
  };

  return (
    <div className="bg-white border-2 border-amber-200 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs">
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
            <Award className="w-4 h-4 text-amber-500" aria-hidden="true" />
            شهادة التقدير الافتراضية القابلة للطباعة
          </div>
          <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900">
            شهادة تفوّق باسم التلميذ ({earnedCount} / {CERTIFICATE_BADGE_THRESHOLD} أوسمة لفتح الشهادة)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {isUnlocked
              ? 'مبارك! حصلت على 3 أوسمة أو أكثر وأصبحت شهادتك جاهزة للطباعة أو الحفظ بصيغة PDF.'
              : `أنجز ${remaining} ${remaining === 1 ? 'وساماً إضافياً' : 'أوسمة إضافية'} من لوحة التحديات والدروس لفتح زر الطباعة النهائية باسمك.`}
          </p>
        </div>

        <button
          type="button"
          disabled={!isUnlocked}
          onClick={handlePrintCertificate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isUnlocked ? (
            <Printer className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Lock className="w-4 h-4" aria-hidden="true" />
          )}
          {isUnlocked ? 'طباعة شهادة التقدير (PDF)' : `تُفتح عند ${CERTIFICATE_BADGE_THRESHOLD} أوسمة`}
        </button>
      </div>

      {/* Unlock progress bar */}
      <div className="no-print space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>تقدّم فتح الشهادة الرسمية</span>
          <span className="font-mono tabular-nums text-amber-800">
            {Math.min(earnedCount, CERTIFICATE_BADGE_THRESHOLD)} / {CERTIFICATE_BADGE_THRESHOLD} أوسمة ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-2.5 bg-amber-50 border border-amber-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-amber-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {isUnlocked && (
          <label className="block pt-2 space-y-1">
            <span className="text-xs font-semibold text-slate-700">
              عبارة التهنئة المخصّصة من الولي أو المعلم داخل الشهادة:
            </span>
            <input
              type="text"
              maxLength={140}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500"
            />
          </label>
        )}
      </div>

      {/* Actual Printable Kid-Friendly Appreciation Certificate Card */}
      <div
        id="certificate-printable"
        className={`relative rounded-3xl p-6 sm:p-10 border-4 transition-opacity ${
          isUnlocked
            ? 'border-amber-400 bg-gradient-to-br from-amber-50/70 via-white to-sky-50/70'
            : 'border-dashed border-slate-300 bg-slate-50/70 opacity-75'
        }`}
      >
        {/* Decorative Inner Frame */}
        <div className="border-2 border-sky-300/80 rounded-2xl p-5 sm:p-8 bg-white/95 space-y-6 text-center relative">
          {/* Corner Stars */}
          <div className="flex items-center justify-between text-amber-500" aria-hidden="true">
            <Star className="w-6 h-6 fill-amber-300" />
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800 tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-500" />
              الجمهورية التونسية · أكاديمية عزيز للتعليم الابتدائي
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <Star className="w-6 h-6 fill-amber-300" />
          </div>

          {/* Official Seal & Title */}
          <div className="space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-sm border-2 border-amber-200">
              <Award className="w-9 h-9" aria-hidden="true" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
              شهادة تقدير وتشجيع
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-sky-700">
              تُمنح تقديراً للمثابرة والتفوّق في المسار التفاعلي 2026
            </p>
          </div>

          {/* Student Name Spotlight */}
          <div className="py-3 px-6 mx-auto max-w-lg rounded-2xl bg-gradient-to-l from-sky-50 via-amber-50/60 to-sky-50 border-2 border-amber-300 space-y-1">
            <div className="text-xs font-semibold text-slate-500">تُشرّف أكاديمية عزيز بمنح هذه الشهادة للتلميذ(ة) النجيب(ة):</div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-sky-900">
              {studentName || 'عزيز'}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-700">
              {gradeLabel} · ولاية {governorate || 'تونس'}
            </div>
          </div>

          {/* Custom Appreciation Message */}
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-2xl mx-auto">
            {customNote}
          </p>

          {/* Quantitative Achievement Strip */}
          <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto text-center">
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
              <div className="text-xs text-slate-600">الرصيد المحقّق</div>
              <div className="text-lg font-mono font-bold text-sky-900 tabular-nums">
                {points} نقطة
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="text-xs text-slate-600">الأوسمة المفتوحة</div>
              <div className="text-lg font-mono font-bold text-emerald-800 tabular-nums">
                {earnedCount} أوسمة
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <div className="text-xs text-slate-600">نسبة الإتقان / المواظبة</div>
              <div className="text-lg font-mono font-bold text-amber-900 tabular-nums">
                {overallMasteryPercent}% · {streakDays} ي
              </div>
            </div>
          </div>

          {/* Earned Badges Row */}
          {earnedBadgeDefs.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {earnedBadgeDefs.slice(0, 6).map((badge) => (
                <span
                  key={badge.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  {badge.title}
                </span>
              ))}
            </div>
          )}

          {/* Footer Signature & Stamp */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <div className="text-right">
              <div className="font-bold text-slate-900">تاريخ الإصدار</div>
              <div className="font-mono tabular-nums">{issueDate}</div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-sky-700 text-sky-900 font-display font-bold">
              ختم أكاديمية عزيز للتعليم الابتدائي 2026
            </div>

            <div className="text-left">
              <div className="font-bold text-slate-900">توقيع المشرف البيداغوجي</div>
              <div>أكاديمية عزيز — تونس</div>
            </div>
          </div>

          {!isUnlocked && (
            <div className="no-print text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
              هذه معاينة للشهادة؛ أكمل {remaining} {remaining === 1 ? 'وساماً واحداً' : 'أوسمة'} لتفعيل الطباعة الرسمية!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
