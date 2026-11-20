import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Compass,
  Sparkles,
  Flame,
  CheckCircle2,
  Award,
  GraduationCap,
  Edit3,
} from 'lucide-react';
import { BADGES, GRADES } from '../data/tunisianCurriculum';
import { GradeLevel, LevelInfo, StudentProgress } from '../types/curriculum';
import { BadgeMedallion } from './BadgeMedallion';
import { ReturnReminderBanner } from './ReturnReminderBanner';

interface HeroSectionProps {
  progress: StudentProgress;
  selectedGrade: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
  completedCount: number;
  totalLessons: number;
  earnedBadgesCount: number;
  levelInfo: LevelInfo;
  showReturnReminder: boolean;
  daysAbsent: number;
  onClaimReturnAndExpress: () => void;
  onClaimReturnAndSubjects: () => void;
  onDismissReturnReminder: () => void;
  onSaveStudentName: (name: string) => void;
  onExploreSubjects: () => void;
  onStartExpress: () => void;
  onOpenProgress: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  progress,
  selectedGrade,
  onSelectGrade,
  completedCount,
  totalLessons,
  earnedBadgesCount,
  levelInfo,
  showReturnReminder,
  daysAbsent,
  onClaimReturnAndExpress,
  onClaimReturnAndSubjects,
  onDismissReturnReminder,
  onSaveStudentName,
  onExploreSubjects,
  onStartExpress,
  onOpenProgress,
}) => {
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [mascotFailed, setMascotFailed] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(progress.studentName);

  const equippedBadge = BADGES.find((b) => b.id === progress.equippedBadgeId) ?? null;
  const activeGradeMeta = GRADES.find((g) => g.grade === selectedGrade) ?? GRADES[2];

  const levelProgressPercent =
    levelInfo.nextMinPoints === null
      ? 100
      : Math.min(
          100,
          Math.round(
            ((progress.points - levelInfo.minPoints) /
              (levelInfo.nextMinPoints - levelInfo.minPoints)) *
              100
          )
        );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-7 pb-10 space-y-7">
      {showReturnReminder && (
        <ReturnReminderBanner
          studentName={progress.studentName}
          daysAbsent={daysAbsent}
          onClaimAndStartExpress={onClaimReturnAndExpress}
          onClaimAndExploreLessons={onClaimReturnAndSubjects}
          onDismiss={onDismissReturnReminder}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6 py-1">
          <div className="space-y-4">
            <div className="text-xs font-semibold text-sky-700">
              منهج الجمهورية التونسية · السنوات من الثالثة إلى السادسة ابتدائي
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 leading-[1.25] text-balance">
              افهم دروس الابتدائي بالتجربة واللعب، واجمع النقاط والأوسمة
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              مختبرات تفاعلية في الرياضيات والإيقاظ العلمي، وألعاب لغوية في العربية والفرنسية مصممة في مهمات قصيرة من 4 دقائق تمنحك نقاطاً فورية وأوسمة افتراضية مع كل إنجاز.
            </p>

            {/* Interactive Grade Switcher (3 to 6) */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                  <GraduationCap className="w-4 h-4 text-sky-700" aria-hidden="true" />
                  اختر سنتك الدراسية:
                </span>
                <span className="text-sky-700 font-semibold">{activeGradeMeta.label}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                {GRADES.map((g) => {
                  const active = g.grade === selectedGrade;
                  return (
                    <button
                      key={g.grade}
                      type="button"
                      onClick={() => onSelectGrade(g.grade)}
                      className={`px-2.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                        active
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-white hover:text-slate-900'
                      }`}
                    >
                      {g.shortLabel}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{activeGradeMeta.subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                type="button"
                onClick={onExploreSubjects}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                استكشف دروس {activeGradeMeta.shortLabel}
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onStartExpress}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                جرّب تحدي 3 دقائق السريع
              </button>
            </div>
          </div>

          {/* Student Card + Equipped Badge */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200 overflow-hidden shrink-0 flex items-center justify-center">
                {!mascotFailed ? (
                  <img
                    src="/src/assets/images/mascot_fanak_fox_1795189779395.jpg"
                    alt="فنك الذكي"
                    referrerPolicy="no-referrer"
                    onError={() => setMascotFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Compass className="w-6 h-6 text-amber-600" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-display font-bold text-slate-900">
                      مرحباً {progress.studentName || 'عزيز'} · المستوى {levelInfo.level}:{' '}
                      {levelInfo.title}
                    </span>
                    {!editingName && (
                      <button
                        type="button"
                        onClick={() => {
                          setDraftName(progress.studentName);
                          setEditingName(true);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900 underline underline-offset-4 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" aria-hidden="true" />
                        تغيير الاسم
                      </button>
                    )}
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-700 tabular-nums">
                    {progress.points} نقطة
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {levelInfo.nextMinPoints !== null
                    ? `بقي ${levelInfo.nextMinPoints - progress.points} نقطة للوصول إلى المستوى ${
                        levelInfo.level + 1
                      }.`
                    : 'أنت في أعلى مستوى على الإطلاق! واصل جمع الأوسمة.'}
                </p>
              </div>
              {equippedBadge && <BadgeMedallion badge={equippedBadge} unlocked size="sm" />}
            </div>

            {editingName && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!draftName.trim()) return;
                  onSaveStudentName(draftName.trim());
                  setEditingName(false);
                }}
                className="flex flex-wrap items-center gap-2 pt-1"
              >
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="أدخل اسم التلميذ..."
                  aria-label="أدخل اسم التلميذ"
                  className="flex-1 min-w-[160px] px-3 py-2 text-sm border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => setEditingName(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                >
                  إلغاء
                </button>
              </form>
            )}

            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-amber-500 to-sky-500 transition-all duration-300"
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="relative h-full min-h-[300px] sm:min-h-[380px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
            {!heroImgFailed ? (
              <>
                <img
                  src="/src/assets/images/hero_tunisian_learning_1795189781389.jpg"
                  alt="مكتب تعليمي مشمس مطل على العمارة التونسية والبحر المتوسط"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgFailed(true)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-900/45 to-transparent p-5 sm:p-6 text-white">
                  <div className="text-xs font-semibold text-sky-200">
                    {activeGradeMeta.label} · 4 مواد أساسية
                  </div>
                  <div className="mt-1 text-base sm:text-lg font-display font-bold">
                    مختبرات الرياضيات والإيقاظ العلمي والعربية والفرنسية
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-sky-50 to-slate-100">
                <BookOpen className="w-12 h-12 text-sky-600 mb-3" aria-hidden="true" />
                <div className="text-lg font-display font-bold text-slate-800">
                  منصة منارة التعلّم
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  تعلّم بالمحاكاة والألعاب التفاعلية
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4-Column KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-interactive p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500">مجموع النقاط</div>
            <div className="mt-1 text-2xl font-mono font-bold text-slate-900 tabular-nums">
              {progress.points}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-600" aria-hidden="true" />
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenProgress}
          className="card-interactive p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 text-right flex items-center justify-between gap-3 cursor-pointer"
        >
          <div>
            <div className="text-xs font-semibold text-slate-500">الأوسمة الافتراضية</div>
            <div className="mt-1 text-2xl font-mono font-bold text-amber-700 tabular-nums">
              {earnedBadgesCount} / {BADGES.length}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-sky-700" aria-hidden="true" />
          </div>
        </button>

        <div className="card-interactive p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500">
              دروس {activeGradeMeta.shortLabel}
            </div>
            <div className="mt-1 text-2xl font-mono font-bold text-slate-900 tabular-nums">
              {completedCount} / {totalLessons}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          </div>
        </div>

        <div className="card-interactive p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500">أيام المواظبة</div>
            <div className="mt-1 text-2xl font-mono font-bold text-slate-900 tabular-nums">
              {progress.streakDays} أيام
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-orange-500" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
};
