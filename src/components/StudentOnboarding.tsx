import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Compass,
  GraduationCap,
  MapPin,
  Sparkles,
  User,
} from 'lucide-react';
import { GRADES, LESSONS, TUNISIAN_GOVERNORATES } from '../data/tunisianCurriculum';
import { GradeLevel } from '../types/curriculum';

interface StudentOnboardingProps {
  initialName: string;
  initialGrade: GradeLevel;
  initialGovernorate: string;
  onComplete: (name: string, grade: GradeLevel, governorate: string) => void;
}

export const StudentOnboarding: React.FC<StudentOnboardingProps> = ({
  initialName,
  initialGrade,
  initialGovernorate,
  onComplete,
}) => {
  const [name, setName] = useState(initialName || 'عزيز');
  const [grade, setGrade] = useState<GradeLevel>(initialGrade);
  const [governorate, setGovernorate] = useState(initialGovernorate || 'تونس');
  const [mascotFailed, setMascotFailed] = useState(false);

  const selectedGradeMeta = GRADES.find((g) => g.grade === grade) ?? GRADES[2];
  const gradeLessonsCount = LESSONS.filter((l) => l.grade === grade).length;
  const gradeExercisesCount = LESSONS.filter((l) => l.grade === grade).reduce(
    (sum, l) => sum + l.exercises.length,
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(name.trim() || 'عزيز', grade, governorate);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6"
        >
          <div className="space-y-2">
            <div className="text-xs font-semibold text-sky-700">
              منصة التعليم الابتدائي بالجمهورية التونسية · منهاج 2026
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 leading-snug">
              مرحباً بك في منارة التعلّم! سجّل بياناتك لنخصّص لك دروسك
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              أدخل اسمك واختر السنة الدراسية التي تدرس فيها، وستظهر لك فقط الدروس والمختبرات والتمارين المبرمجة لقسمك.
            </p>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <User className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                  اسم التلميذ
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسمك هنا (مثال: عزيز)"
                  className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-sky-600"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                  الولاية
                </span>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-sky-600 cursor-pointer"
                >
                  {TUNISIAN_GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <GraduationCap className="w-4 h-4 text-sky-600" aria-hidden="true" />
                السنة الدراسية التي تدرس فيها
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GRADES.map((g) => {
                  const selected = g.grade === grade;
                  return (
                    <button
                      key={g.grade}
                      type="button"
                      onClick={() => setGrade(g.grade)}
                      className={`p-3.5 rounded-xl border text-right transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                        selected
                          ? 'bg-sky-50 border-sky-600 text-sky-950'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-sky-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-display font-bold">{g.label}</div>
                        <div className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {g.subtitle}
                        </div>
                      </div>
                      {selected && (
                        <CheckCircle2
                          className="w-5 h-5 text-sky-600 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              يمكنك تعديل الاسم أو تغيير السنة الدراسية في أي وقت من لوحة التحكم.
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              ابدأ مساري في {selectedGradeMeta.shortLabel}
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </form>

        {/* Preview Summary Panel */}
        <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 overflow-hidden shrink-0 flex items-center justify-center">
                {!mascotFailed ? (
                  <img
                    src="/src/assets/images/mascot_fanak_fox_1795189779395.jpg"
                    alt="فنك الذكي"
                    referrerPolicy="no-referrer"
                    onError={() => setMascotFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Compass className="w-7 h-7 text-amber-600" aria-hidden="true" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-sky-300">رفيقك الذكي في الدراسة</div>
                <div className="text-lg font-display font-bold">
                  أهلاً {name.trim() || 'عزيز'}!
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="text-xs font-semibold text-amber-300">
                برنامج {selectedGradeMeta.label} — 2026
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {selectedGradeMeta.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
                  الدروس التفاعلية
                </div>
                <div className="mt-1 text-2xl font-mono font-bold tabular-nums">
                  {gradeLessonsCount} دروس
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                  بنك التمارين
                </div>
                <div className="mt-1 text-2xl font-mono font-bold tabular-nums">
                  {gradeExercisesCount} تمريناً
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>مسار تعلّم متدرج خطوة بخطوة في المواد الأساسية الأربع</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>تحديات سريعة وبنك اختبارات ثلاثية لمتابعة التقدّم</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>نقاط فورية وأوسمة افتراضية تشجّع التلميذ يومياً</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
