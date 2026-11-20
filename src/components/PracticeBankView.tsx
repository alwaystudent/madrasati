import React, { useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  FileCheck2,
  Play,
  ShieldCheck,
  Sparkles,
  Timer,
} from 'lucide-react';
import { GRADES, SUBJECTS } from '../data/tunisianCurriculum';
import { getComprehensiveExams } from '../data/comprehensiveExams';
import {
  ComprehensiveExamPreset,
  Exercise,
  GradeLevel,
  Lesson,
  SubjectId,
} from '../types/curriculum';
import { ExerciseEngine } from './ExerciseEngine';

interface PracticeBankViewProps {
  selectedGrade: GradeLevel;
  studentLessons: Lesson[];
  onRecordPracticeResult: (
    title: string,
    subjectId: SubjectId,
    score: number,
    total: number,
    pointsEarned: number,
    mode: 'express' | 'exam'
  ) => void;
}

export const PracticeBankView: React.FC<PracticeBankViewProps> = ({
  selectedGrade,
  studentLessons,
  onRecordPracticeResult,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [selectedTrimester, setSelectedTrimester] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(8);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [isExamMode, setIsExamMode] = useState(false);
  const [activePresetExam, setActivePresetExam] =
    useState<ComprehensiveExamPreset | null>(null);

  const gradeMeta = GRADES.find((g) => g.grade === selectedGrade) ?? GRADES[2];
  const comprehensiveExams = useMemo(
    () => getComprehensiveExams(selectedGrade),
    [selectedGrade]
  );

  const matchingExercises: Exercise[] = useMemo(() => {
    const filteredLessons = studentLessons.filter((l) => {
      const matchSubj = selectedSubject === 'all' || l.subjectId === selectedSubject;
      const matchTrim =
        selectedTrimester === 'all' || l.trimester === selectedTrimester;
      return matchSubj && matchTrim;
    });
    return filteredLessons.flatMap((l) => l.exercises);
  }, [studentLessons, selectedSubject, selectedTrimester]);

  const customSessionExercises: Exercise[] = useMemo(() => {
    if (matchingExercises.length === 0) return [];
    const rotated = [
      ...matchingExercises.slice((sessionKey * 3) % matchingExercises.length),
      ...matchingExercises.slice(0, (sessionKey * 3) % matchingExercises.length),
    ];
    return rotated.slice(0, Math.min(questionCount, rotated.length));
  }, [matchingExercises, questionCount, sessionKey]);

  const startCustomSession = (exam: boolean) => {
    setActivePresetExam(null);
    setIsExamMode(exam);
    setSessionKey((k) => k + 1);
    setSessionActive(true);
  };

  const startPresetExam = (preset: ComprehensiveExamPreset) => {
    setActivePresetExam(preset);
    setIsExamMode(true);
    setSessionKey((k) => k + 1);
    setSessionActive(true);
  };

  const activeExercises = activePresetExam
    ? activePresetExam.exercises
    : customSessionExercises;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header & Custom Builder */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-sky-700">
              بنك التمارين والاختبارات التأليفية الشاملة · منهاج 2026
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
              تدريبات واختبارات {gradeMeta.label}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              اختر اختباراً تأليفياً جاهزاً لكامل الثلاثي أو أنشئ جلسة تدريب مخصّصة حسب المادة وعدد الأسئلة.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-center shrink-0">
            <div className="text-xs font-medium text-sky-800">الرصيد المتاح لقسمك</div>
            <div className="text-xl font-mono font-bold text-sky-900 tabular-nums mt-0.5">
              {matchingExercises.length} تمريناً
            </div>
          </div>
        </div>

        {/* Configuration Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-700">المادة الدراسية</span>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value as SubjectId | 'all');
                setSessionActive(false);
                setActivePresetExam(null);
              }}
              className="w-full px-3 py-2.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-900 cursor-pointer"
            >
              <option value="all">جميع المواد الأساسية (4 مواد)</option>
              {(['math', 'science', 'arabic', 'french'] as SubjectId[]).map((sid) => (
                <option key={sid} value={sid}>
                  {SUBJECTS[sid].name}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-700">الثلاثي الدراسي</span>
            <select
              value={selectedTrimester}
              onChange={(e) => {
                setSelectedTrimester(e.target.value);
                setSessionActive(false);
                setActivePresetExam(null);
              }}
              className="w-full px-3 py-2.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-900 cursor-pointer"
            >
              <option value="all">كل الثلاثيات</option>
              <option value="الثلاثي الأول">الثلاثي الأول</option>
              <option value="الثلاثي الثاني">الثلاثي الثاني</option>
              <option value="الثلاثي الثالث">الثلاثي الثالث</option>
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-700">عدد التمارين في الجلسة</span>
            <select
              value={questionCount}
              onChange={(e) => {
                setQuestionCount(Number(e.target.value));
                setSessionActive(false);
                setActivePresetExam(null);
              }}
              className="w-full px-3 py-2.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-900 cursor-pointer"
            >
              <option value={5}>جلسة خفيفة (5 تمارين)</option>
              <option value={8}>تدريب متوسّط (8 تمارين)</option>
              <option value={12}>اختبار تأليفي شامل (12 تمريناً)</option>
              <option value={20}>ماراثون التحدي الكامل (20 تمريناً)</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            disabled={matchingExercises.length === 0}
            onClick={() => startCustomSession(false)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <Play className="w-4 h-4" aria-hidden="true" />
            ابدأ جلسة التدريب المخصّصة
          </button>

          <button
            type="button"
            disabled={matchingExercises.length === 0}
            onClick={() => startCustomSession(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 disabled:opacity-50 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <Timer className="w-4 h-4 text-amber-700" aria-hidden="true" />
            اختبار سريع بالاختيار الحالي (+30 نقطة)
          </button>
        </div>
      </div>

      {/* Active Session or Comprehensive Exams Showcase */}
      {sessionActive && activeExercises.length > 0 ? (
        <div className="max-w-3xl mx-auto">
          <ExerciseEngine
            key={`${selectedGrade}-${selectedSubject}-${selectedTrimester}-${activePresetExam?.id ?? 'custom'}-${sessionKey}`}
            exercises={activeExercises}
            modeLabel={
              activePresetExam
                ? `${activePresetExam.title} · ${gradeMeta.shortLabel}`
                : isExamMode
                ? `اختبار تأليفي · ${gradeMeta.shortLabel}`
                : `تدريب ${
                    selectedSubject === 'all'
                      ? 'شامل'
                      : SUBJECTS[selectedSubject].name
                  } · ${gradeMeta.shortLabel}`
            }
            onComplete={(score, total, points) => {
              const subj: SubjectId =
                selectedSubject === 'all' ? 'math' : selectedSubject;
              const title = activePresetExam
                ? activePresetExam.title
                : isExamMode
                ? `اختبار تأليفي (${
                    selectedSubject === 'all' ? 'شامل' : SUBJECTS[selectedSubject].name
                  })`
                : `تدريب بنك التمارين (${
                    selectedSubject === 'all' ? 'شامل' : SUBJECTS[selectedSubject].name
                  })`;
              const extraBonus = activePresetExam
                ? activePresetExam.bonusPoints
                : isExamMode
                ? 30
                : 15;
              onRecordPracticeResult(
                title,
                subj,
                score,
                total,
                points + extraBonus,
                isExamMode ? 'exam' : 'express'
              );
            }}
            onBackToSim={() => {
              setSessionActive(false);
              setActivePresetExam(null);
            }}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Official Comprehensive Practice Tests */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900">
                  الاختبارات التأليفية الرسمية الشاملة ({gradeMeta.shortLabel})
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  امتحانات شاملة لكامل المنهج تجمع المواد الأربع في اختبار واحد مع مكافأة نقاط مضاعفة.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                <Award className="w-4 h-4 text-amber-600" aria-hidden="true" />
                4 اختبارات تأليفية شاملة
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comprehensiveExams.map((exam) => (
                <article
                  key={exam.id}
                  className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-sky-300 hover:bg-white transition-colors flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-sky-800">{exam.trimester}</span>
                      <span className="font-mono tabular-nums">
                        {exam.exercises.length} سؤالاً · {exam.durationMinutes} دق
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-display font-bold text-slate-900">
                      {exam.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{exam.description}</p>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200/80">
                    <span className="text-xs font-mono font-bold text-amber-700 tabular-nums">
                      مكافأة التفوّق: +{exam.bonusPoints} نقطة
                    </span>
                    <button
                      type="button"
                      onClick={() => startPresetExam(exam)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <FileCheck2 className="w-4 h-4" aria-hidden="true" />
                      ابدأ الاختبار الشامل
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {matchingExercises.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
              <p className="text-sm text-slate-600">
                لا توجد تمارين مطابقة للثلاثي والمادة المختارة حالياً. اختر «كل الثلاثيات» لعرض كامل بنك التمارين.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-sm font-display font-bold text-slate-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                  تغطية كاملة لبرنامج 2026
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  أكثر من 80 تمريناً تفاعلياً لكل سنة دراسية بين الاختيار من متعدد، وإكمال الفراغ، والترتيب، والتصنيف الذكي لتغطية مهارات {gradeMeta.label}.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-sm font-display font-bold text-slate-900">
                  <Sparkles className="w-5 h-5 text-amber-500" aria-hidden="true" />
                  تلميحات فورية وتصحيح ذكي
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  كل سؤال يتضمن تلميحاً اختيارياً وشرحاً مبسّطاً بعد الإجابة مع دعم النطق الصوتي لتمارين اللغة الفرنسية.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
