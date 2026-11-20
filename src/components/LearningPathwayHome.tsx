import React, { useState } from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calculator,
  CheckCircle2,
  FileText,
  Flame,
  FlaskConical,
  Languages,
  Play,
  Sparkles,
  Target,
} from 'lucide-react';
import { BADGES, GRADES, SUBJECTS } from '../data/tunisianCurriculum';
import { Lesson, LevelInfo, StudentProgress, SubjectId } from '../types/curriculum';
import { ReturnReminderBanner } from './ReturnReminderBanner';

interface LearningPathwayHomeProps {
  progress: StudentProgress;
  studentLessons: Lesson[];
  completedCount: number;
  totalLessons: number;
  earnedBadgesCount: number;
  levelInfo: LevelInfo;
  showReturnReminder: boolean;
  daysAbsent: number;
  subjectStats: (id: SubjectId) => {
    totalLessons: number;
    completedLessons: number;
    accuracy: number;
    completionPercent: number;
  };
  onClaimReturnAndExpress: () => void;
  onClaimReturnAndSubjects: () => void;
  onDismissReturnReminder: () => void;
  onSelectLesson: (lesson: Lesson) => void;
  onOpenPractice: () => void;
  onOpenProgress: () => void;
  onOpenFrenchStudio?: () => void;
  onOpenReports?: () => void;
}

export const LearningPathwayHome: React.FC<LearningPathwayHomeProps> = ({
  progress,
  studentLessons,
  completedCount,
  totalLessons,
  earnedBadgesCount,
  levelInfo,
  showReturnReminder,
  daysAbsent,
  subjectStats,
  onClaimReturnAndExpress,
  onClaimReturnAndSubjects,
  onDismissReturnReminder,
  onSelectLesson,
  onOpenPractice,
  onOpenProgress,
  onOpenFrenchStudio,
  onOpenReports,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');

  const gradeMeta = GRADES.find((g) => g.grade === progress.selectedGrade) ?? GRADES[2];

  const nextLesson =
    studentLessons.find((l) => !progress.completedLessons[l.id]) ?? studentLessons[0];

  const pathwayLessons = studentLessons.filter(
    (l) => selectedSubject === 'all' || l.subjectId === selectedSubject
  );

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

  const subjectIcon = (id: SubjectId) => {
    switch (id) {
      case 'math':
        return <Calculator className="w-4 h-4 text-sky-700 shrink-0" aria-hidden="true" />;
      case 'science':
        return <FlaskConical className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />;
      case 'arabic':
        return <BookOpen className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />;
      case 'french':
        return <Languages className="w-4 h-4 text-indigo-700 shrink-0" aria-hidden="true" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {showReturnReminder && (
        <ReturnReminderBanner
          studentName={progress.studentName}
          daysAbsent={daysAbsent}
          onClaimAndStartExpress={onClaimReturnAndExpress}
          onClaimAndExploreLessons={onClaimReturnAndSubjects}
          onDismiss={onDismissReturnReminder}
        />
      )}

      {/* Welcome & Next Step Hero Card (Examido Pathway Banner) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-semibold text-sky-700">
            مسار التعلّم الشخصي · {gradeMeta.label} · برنامج 2026
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 leading-snug text-balance">
            مرحباً {progress.studentName || 'عزيز'}! واصل رحلة التفوّق في {gradeMeta.shortLabel}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
            {gradeMeta.subtitle}. أكمل خطوات المختبر وحل التمارين لتجمع النقاط وترتقي إلى المستوى التالي.
          </p>

          <div className="pt-1 space-y-1.5 max-w-md">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">
                المستوى {levelInfo.level}: {levelInfo.title}
              </span>
              <span className="font-mono text-amber-700 tabular-nums">
                {levelInfo.nextMinPoints !== null
                  ? `${progress.points} / ${levelInfo.nextMinPoints} نقطة`
                  : `${progress.points} نقطة · القمة`}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-amber-500 to-sky-600 transition-all duration-300"
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
            {onOpenReports && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onOpenReports}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 hover:underline underline-offset-4 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                  عرض تقرير التقدّم وحفظ البيانات
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Next Recommended Step Box */}
        {nextLesson && (
          <div className="lg:col-span-5 p-5 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-800">
              <Target className="w-4 h-4 text-sky-600" aria-hidden="true" />
              الخطوة القادمة في مسارك
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-600">
                {SUBJECTS[nextLesson.subjectId].name} · {nextLesson.trimester}
              </div>
              <div className="text-base sm:text-lg font-display font-bold text-slate-900 leading-snug">
                {nextLesson.title}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => onSelectLesson(nextLesson)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              >
                ابدأ الدرس الآن
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onOpenPractice}
                className="px-4 py-2.5 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              >
                تدرّب في بنك التمارين
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4-Column Compact KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-interactive p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500">مجموع النقاط</div>
            <div className="mt-1 text-2xl font-mono font-bold text-slate-900 tabular-nums">
              {progress.points}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-600" aria-hidden="true" />
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenProgress}
          className="card-interactive p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 text-right flex items-center justify-between gap-3 cursor-pointer"
        >
          <div>
            <div className="text-xs font-semibold text-slate-500">الأوسمة الافتراضية</div>
            <div className="mt-1 text-2xl font-mono font-bold text-amber-700 tabular-nums">
              {earnedBadgesCount} / {BADGES.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-sky-700" aria-hidden="true" />
          </div>
        </button>

        <div className="card-interactive p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500">
              دروس {gradeMeta.shortLabel}
            </div>
            <div className="mt-1 text-2xl font-mono font-bold text-slate-900 tabular-nums">
              {completedCount} / {totalLessons}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          </div>
        </div>

        <div className="card-interactive p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500">أيام المواظبة</div>
            <div className="mt-1 text-2xl font-mono font-bold text-slate-900 tabular-nums">
              {progress.streakDays} أيام
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-orange-500" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Examido-Style Visual Learning Pathway */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
              مسار المحطات التفاعلية ({gradeMeta.label})
            </h2>
            <p className="text-sm text-slate-600">
              تقدّم محطة بمحطة؛ كل محطة تتضمن مختبراً تفاعلياً وتمارين متدرّجة من المنهاج الرسمي.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedSubject('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedSubject === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              كل المواد ({studentLessons.length})
            </button>
            {(['math', 'science', 'arabic', 'french'] as SubjectId[]).map((sid) => {
              const count = studentLessons.filter((l) => l.subjectId === sid).length;
              return (
                <button
                  key={sid}
                  type="button"
                  onClick={() => setSelectedSubject(sid)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    selectedSubject === sid
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {SUBJECTS[sid].name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {pathwayLessons.map((lesson, idx) => {
            const subject = SUBJECTS[lesson.subjectId];
            const completion = progress.completedLessons[lesson.id];
            const stepsDone = (progress.completedSteps[lesson.id] || []).length;

            return (
              <div
                key={lesson.id}
                className={`p-4 rounded-xl border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  completion
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-50/70 border-slate-200 hover:border-sky-300 hover:bg-white'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl font-mono text-sm font-bold flex items-center justify-center shrink-0 tabular-nums ${
                      completion
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    {completion ? (
                      <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      String(idx + 1).padStart(2, '0')
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                        {subjectIcon(lesson.subjectId)}
                        <span className={subject.accentText}>{subject.name}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{lesson.trimester}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {lesson.exercises.length} تمارين
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-display font-bold text-slate-900 leading-snug">
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{lesson.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/70">
                  <div className="text-xs font-mono tabular-nums text-slate-600">
                    {completion ? (
                      <span className="text-emerald-800 font-semibold">
                        أفضل نتيجة: {completion.bestScore}/{completion.totalQuestions}
                      </span>
                    ) : (
                      <span>
                        الاستكشاف: {stepsDone}/{lesson.steps.length}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectLesson(lesson)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      completion
                        ? 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
                        : 'bg-sky-600 text-white hover:bg-sky-700'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                    {completion ? 'مراجعة' : 'ابدأ الدرس'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject Mastery Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(['math', 'science', 'arabic', 'french'] as SubjectId[]).map((sid) => {
          const meta = SUBJECTS[sid];
          const stats = subjectStats(sid);
          const subjectExercises = studentLessons
            .filter((l) => l.subjectId === sid)
            .reduce((sum, l) => sum + l.exercises.length, 0);
          return (
            <div
              key={sid}
              className="card-interactive bg-white border border-slate-200 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-8 h-8 rounded-lg ${meta.accentBg} border ${meta.accentBorder} flex items-center justify-center shrink-0`}
                  >
                    {subjectIcon(sid)}
                  </span>
                  <div>
                    <div className={`text-sm font-display font-bold ${meta.accentText}`}>
                      {meta.name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono tabular-nums">
                      {stats.completedLessons}/{stats.totalLessons} دروس · {subjectExercises} نشاطاً
                    </div>
                  </div>
                </div>
                <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
                  {stats.completionPercent}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${meta.barColor} transition-all duration-300`}
                  style={{ width: `${stats.completionPercent}%` }}
                />
              </div>
              {sid === 'french' && onOpenFrenchStudio && (
                <button
                  type="button"
                  onClick={onOpenFrenchStudio}
                  className="w-full py-1.5 px-3 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                >
                  افتح أكاديمية النطق والتدريب
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
