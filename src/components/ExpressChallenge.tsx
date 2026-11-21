import React, { useEffect, useMemo, useState } from 'react';
import { Timer, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { GRADES } from '../data/tunisianCurriculum';
import { Exercise, GradeLevel, Lesson, SubjectId } from '../types/curriculum';
import { ExerciseEngine } from './ExerciseEngine';

interface ExpressChallengeProps {
  studentName: string;
  selectedGrade: GradeLevel;
  studentLessons: Lesson[];
  onComplete: (score: number, total: number, pointsEarned: number) => void;
  onExit: () => void;
}

export const ExpressChallenge: React.FC<ExpressChallengeProps> = ({
  studentName,
  selectedGrade,
  studentLessons,
  onComplete,
  onExit,
}) => {
  const [relaxedMode, setRelaxedMode] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(180);
  const [sessionKey, setSessionKey] = useState(0);
  const [mascotFailed, setMascotFailed] = useState(false);

  const activeGradeMeta = GRADES.find((g) => g.grade === selectedGrade) ?? GRADES[3];

  const challengeExercises: Exercise[] = useMemo(() => {
    const subjects: SubjectId[] = ['math', 'science', 'arabic', 'french', 'social'];
    const picked: Exercise[] = [];

    for (const sid of subjects) {
      const pool = studentLessons
        .filter((l) => l.subjectId === sid)
        .flatMap((l) => l.exercises);
      if (pool.length > 0) {
        picked.push(pool[sessionKey % pool.length]);
      }
    }

    return picked;
  }, [studentLessons, sessionKey]);

  useEffect(() => {
    if (relaxedMode || secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [relaxedMode, secondsLeft]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="space-y-1">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-700 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
            العودة إلى مسار التعلّم
          </button>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
            تحدي 3 دقائق السريع ({activeGradeMeta.label})
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            5 أسئلة من برنامج {activeGradeMeta.shortLabel} (الرياضيات، الإيقاظ العلمي، العربية، الفرنسية، المواد الاجتماعية) تمنحك نقاطاً ووسام قاهر الكسل!
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!relaxedMode && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-600 text-white font-mono text-sm font-bold tabular-nums">
              <Timer className="w-4 h-4 text-amber-300" aria-hidden="true" />
              {formattedTime}
            </div>
          )}
          <button
            type="button"
            onClick={() => setRelaxedMode((r) => !r)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            {relaxedMode ? 'تفعيل المؤقت' : 'وضع مريح بدون مؤقت'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 rounded-3xl bg-gradient-to-l from-sky-50 via-white to-amber-50/70 border-2 border-sky-200">
        <div className="w-14 h-14 rounded-xl bg-white border border-sky-200 overflow-hidden shrink-0 flex items-center justify-center">
          {!mascotFailed ? (
            <img
              src="/src/assets/images/mascot_fanak_fox_1795189779395.jpg"
              alt="فنك الذكي يشجعك"
              referrerPolicy="no-referrer"
              onError={() => setMascotFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <Zap className="w-6 h-6 text-sky-600" aria-hidden="true" />
          )}
        </div>
        <div className="text-sm text-sky-950 space-y-0.5">
          <div className="font-bold">
            هيا يا {studentName || 'عزيز'}! ({activeGradeMeta.shortLabel})
          </div>
          <p className="text-sky-900">
            أنهِ هذه التمارين الأربعة القصيرة لتحصل على نقاط إضافية وتفتح <strong>وسام قاهر الكسل</strong> الافتراضي!
          </p>
        </div>
      </div>

      <ExerciseEngine
        key={`${selectedGrade}-${sessionKey}`}
        exercises={challengeExercises}
        modeLabel={`تحدي 3 دقائق (${activeGradeMeta.shortLabel})`}
        onComplete={(score, total, points) => {
          onComplete(score, total, points + 20);
        }}
        onBackToSim={() => {
          setSecondsLeft(180);
          setSessionKey((k) => k + 1);
        }}
      />
    </section>
  );
};
