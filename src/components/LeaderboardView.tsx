import React, { useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Crown,
  Flame,
  LogIn,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  Volume2,
  XCircle,
} from 'lucide-react';
import { BADGES, GRADES, SUBJECTS } from '../data/tunisianCurriculum';
import { PeerChallengeSubmitInput } from '../hooks/useStudentProgress';
import {
  ChoiceExercise,
  LeaderboardEntry,
  Lesson,
  PeerChallengeRecord,
  StudentProgress,
  SubjectId,
} from '../types/curriculum';
import { speakFrenchText } from '../utils/frenchSpeech';
import { BadgeMedallion } from './BadgeMedallion';

interface LeaderboardViewProps {
  progress: StudentProgress;
  studentLessons: Lesson[];
  authUser: User | null;
  activeStudentId: string | null;
  leaderboardEntries: LeaderboardEntry[];
  peerChallenges: PeerChallengeRecord[];
  leaderboardLoading: boolean;
  hasPendingSync: boolean;
  cloudError?: string | null;
  onRefreshLeaderboard: (force?: boolean) => Promise<void>;
  onSubmitChallengeResult: (
    input: PeerChallengeSubmitInput
  ) => Promise<PeerChallengeRecord | null>;
  onSignInWithGoogle: () => Promise<void>;
  onFlushSyncNow: () => Promise<void>;
}

interface DuelQuestionItem {
  exercise: ChoiceExercise;
  subjectId: SubjectId;
  lessonTitle: string;
}

interface DuelOpponent {
  ownerId: string;
  studentId: string;
  displayName: string;
  governorate: string;
  points: number;
  targetScore: number;
}

const DUEL_QUESTION_COUNT = 6;
const DUEL_DURATION_SECONDS = 90;

function pickDuelQuestions(lessons: Lesson[]): DuelQuestionItem[] {
  const pool: DuelQuestionItem[] = [];
  for (const lesson of lessons) {
    for (const ex of lesson.exercises) {
      if (ex.type === 'choice') {
        pool.push({
          exercise: ex,
          subjectId: lesson.subjectId,
          lessonTitle: lesson.title,
        });
      }
    }
  }
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, DUEL_QUESTION_COUNT);
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  progress,
  studentLessons,
  authUser,
  activeStudentId,
  leaderboardEntries,
  peerChallenges,
  leaderboardLoading,
  hasPendingSync,
  cloudError,
  onRefreshLeaderboard,
  onSubmitChallengeResult,
  onSignInWithGoogle,
  onFlushSyncNow,
}) => {
  const [duelOpponent, setDuelOpponent] = useState<DuelOpponent | null>(null);
  const [duelQuestions, setDuelQuestions] = useState<DuelQuestionItem[]>([]);
  const [duelIdx, setDuelIdx] = useState(0);
  const [duelScore, setDuelScore] = useState(0);
  const [duelSelectedIdx, setDuelSelectedIdx] = useState<number | null>(null);
  const [duelSubmitted, setDuelSubmitted] = useState(false);
  const [duelSecondsLeft, setDuelSecondsLeft] = useState(DUEL_DURATION_SECONDS);
  const [duelFinished, setDuelFinished] = useState(false);
  const [duelPointsAwarded, setDuelPointsAwarded] = useState(0);
  const [refreshCooldownNotice, setRefreshCooldownNotice] = useState<string | null>(null);

  const gradeMeta =
    GRADES.find((g) => g.grade === progress.selectedGrade) ?? GRADES[3];

  useEffect(() => {
    if (authUser && authUser.emailVerified) {
      void onRefreshLeaderboard(false);
    }
  }, [authUser, progress.selectedGrade, onRefreshLeaderboard]);

  // Live countdown when quick duel is active
  useEffect(() => {
    if (!duelOpponent || duelFinished) return;
    if (duelSecondsLeft <= 0) {
      finishDuel(duelScore);
      return;
    }
    const timer = window.setInterval(() => {
      setDuelSecondsLeft((s) => s - 1);
    }, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duelOpponent, duelFinished, duelSecondsLeft]);

  const finishDuel = (finalScore: number) => {
    if (!duelOpponent || duelFinished) return;
    const total = Math.max(1, duelQuestions.length);
    const won = finalScore > duelOpponent.targetScore;
    const pointsEarned = won ? finalScore * 15 + 35 : finalScore * 15 + 15;
    setDuelPointsAwarded(pointsEarned);
    setDuelFinished(true);
    void onSubmitChallengeResult({
      opponentOwnerId: duelOpponent.ownerId,
      opponentStudentId: duelOpponent.studentId,
      opponentName: duelOpponent.displayName,
      opponentTargetScore: duelOpponent.targetScore,
      challengerScore: finalScore,
      totalQuestions: total,
      pointsEarned,
    });
  };

  const startPeerDuel = (opponent: DuelOpponent) => {
    const picked = pickDuelQuestions(studentLessons);
    if (picked.length === 0) return;
    setDuelOpponent(opponent);
    setDuelQuestions(picked);
    setDuelIdx(0);
    setDuelScore(0);
    setDuelSelectedIdx(null);
    setDuelSubmitted(false);
    setDuelSecondsLeft(DUEL_DURATION_SECONDS);
    setDuelFinished(false);
    setDuelPointsAwarded(0);
  };

  const handleDuelSelect = (optionIdx: number) => {
    if (duelSubmitted || duelFinished) return;
    const current = duelQuestions[duelIdx];
    if (!current) return;
    setDuelSelectedIdx(optionIdx);
    setDuelSubmitted(true);
    if (optionIdx === current.exercise.correctIndex) {
      setDuelScore((s) => s + 1);
    }
  };

  const handleDuelNext = () => {
    if (duelIdx + 1 < duelQuestions.length) {
      setDuelIdx((i) => i + 1);
      setDuelSelectedIdx(null);
      setDuelSubmitted(false);
    } else {
      finishDuel(duelScore);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshCooldownNotice(null);
    await onRefreshLeaderboard(true);
    setRefreshCooldownNotice(
      'تم التحقق من الترتيب مع تطبيق التخزين المؤقت (3 دقائق) لتقليل الضغط على الخوادم.'
    );
  };

  // Merge self entry cleanly if signed in but cache doesn't contain it yet, or if signed out
  const displayedRows = useMemo(() => {
    const selfCompleted = Object.keys(progress.completedLessons || {}).length;
    const selfRow: LeaderboardEntry = {
      id: activeStudentId || 'local_self',
      ownerId: authUser?.uid || 'local',
      studentId: activeStudentId || 'local_self',
      displayName: progress.studentName || 'عزيز',
      grade: progress.selectedGrade,
      governorate: progress.schoolGovernorate || 'تونس',
      points: progress.points,
      completedLessonsCount: selfCompleted,
      streakDays: progress.streakDays,
      challengeWins: progress.challengeWins ?? 0,
      equippedBadgeId: progress.equippedBadgeId || '',
    };

    if (!authUser || leaderboardEntries.length === 0) {
      return [selfRow];
    }

    const exists = leaderboardEntries.some((e) => e.studentId === selfRow.studentId);
    const merged = exists
      ? leaderboardEntries.map((e) => (e.studentId === selfRow.studentId ? selfRow : e))
      : [...leaderboardEntries, selfRow];

    return [...merged].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.completedLessonsCount !== a.completedLessonsCount) {
        return b.completedLessonsCount - a.completedLessonsCount;
      }
      return b.challengeWins - a.challengeWins;
    });
  }, [authUser, activeStudentId, leaderboardEntries, progress]);

  const myRank =
    displayedRows.findIndex(
      (r) => r.studentId === (activeStudentId || 'local_self')
    ) + 1;

  // Compute an appropriate peer target score (between 3 and 5 out of 6)
  const computeTargetScore = (entry: LeaderboardEntry) => {
    if (entry.points >= 600) return 5;
    if (entry.points >= 250) return 4;
    return 3;
  };

  // Pick a default opponent for Quick Duel CTA button
  const defaultOpponent: DuelOpponent = useMemo(() => {
    const otherPeer = displayedRows.find(
      (r) => r.studentId !== (activeStudentId || 'local_self')
    );
    if (otherPeer) {
      return {
        ownerId: otherPeer.ownerId,
        studentId: otherPeer.studentId,
        displayName: otherPeer.displayName,
        governorate: otherPeer.governorate,
        points: otherPeer.points,
        targetScore: computeTargetScore(otherPeer),
      };
    }
    return {
      ownerId: authUser?.uid || 'grade_benchmark',
      studentId: `benchmark_g${progress.selectedGrade}`,
      displayName: `تحدّي معيار ${gradeMeta.shortLabel}`,
      governorate: progress.schoolGovernorate || 'تونس',
      points: progress.points + 50,
      targetScore: 4,
    };
  }, [displayedRows, activeStudentId, authUser, progress, gradeMeta.shortLabel]);

  // Active Quick Peer Duel Screen
  if (duelOpponent) {
    const currentQ = duelQuestions[duelIdx];
    const totalQ = duelQuestions.length;
    const duelWon = duelScore > duelOpponent.targetScore;
    const duelDraw = duelScore === duelOpponent.targetScore;

    if (duelFinished) {
      return (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xs">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center">
              <Trophy
                className={`w-8 h-8 ${duelWon ? 'text-amber-500' : 'text-sky-600'}`}
                aria-hidden="true"
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-sky-700">
                نتيجة التحدّي السريع · {gradeMeta.shortLabel}
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                {duelWon
                  ? `تفوّقتَ على ${duelOpponent.displayName}!`
                  : duelDraw
                  ? `تعادل مشرّف مع ${duelOpponent.displayName}`
                  : `جولة رائعة ومنافسة شريفة مع ${duelOpponent.displayName}`}
              </h2>
              <p className="text-sm text-slate-600">
                حصلتَ على{' '}
                <strong className="font-mono text-amber-700 tabular-nums">
                  +{duelPointsAwarded} نقطة
                </strong>{' '}
                أُضيفت مباشرة إلى رصيدك في {gradeMeta.shortLabel}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200">
                <div className="text-xs font-semibold text-sky-800 truncate">
                  {progress.studentName || 'أنت'}
                </div>
                <div className="mt-1 text-2xl font-mono font-bold text-slate-900 tabular-nums">
                  {duelScore} / {totalQ}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-600 truncate">
                  {duelOpponent.displayName}
                </div>
                <div className="mt-1 text-2xl font-mono font-bold text-slate-800 tabular-nums">
                  {duelOpponent.targetScore} / {totalQ}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => startPeerDuel(duelOpponent)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors cursor-pointer"
              >
                <Swords className="w-4 h-4" aria-hidden="true" />
                جولة تحدّي جديدة
              </button>
              <button
                type="button"
                onClick={() => setDuelOpponent(null)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                العودة إلى لوحة الصدارة
              </button>
            </div>
          </div>
        </section>
      );
    }

    if (!currentQ) return null;
    const subjMeta = SUBJECTS[currentQ.subjectId];

    return (
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
              <Swords className="w-5 h-5 text-sky-700" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-semibold text-sky-700">
                مبارزة معرفية سريعة ({gradeMeta.shortLabel})
              </div>
              <div className="text-sm font-display font-bold text-slate-900">
                {progress.studentName} ضد {duelOpponent.displayName} (الهدف:{' '}
                <span className="font-mono tabular-nums">{duelOpponent.targetScore}</span>/{totalQ})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold tabular-nums ${
                duelSecondsLeft <= 20
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" aria-hidden="true" />
              {duelSecondsLeft}ث
            </div>
            <button
              type="button"
              onClick={() => setDuelOpponent(null)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              انسحاب
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-5">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className={`font-bold ${subjMeta.accentText}`}>
              {subjMeta.name} — {currentQ.lessonTitle}
            </span>
            <span className="font-mono tabular-nums font-semibold">
              السؤال {duelIdx + 1} من {totalQ} · نقاطك الحالية: {duelScore}
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-600 transition-all duration-200"
              style={{ width: `${((duelIdx + (duelSubmitted ? 1 : 0)) / totalQ) * 100}%` }}
            />
          </div>

          <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900 leading-snug">
            {currentQ.exercise.prompt}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.exercise.options.map((opt, idx) => {
              const isSelected = duelSelectedIdx === idx;
              const isRight = duelSubmitted && idx === currentQ.exercise.correctIndex;
              const isWrong = duelSubmitted && isSelected && !isRight;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border transition-colors flex items-center justify-between gap-2 ${
                    isRight
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                      : isWrong
                      ? 'bg-rose-50 border-rose-400 text-rose-950'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-sky-50 hover:border-sky-300'
                  }`}
                >
                  <button
                    type="button"
                    disabled={duelSubmitted}
                    dir={currentQ.exercise.ltr ? 'ltr' : 'rtl'}
                    onClick={() => handleDuelSelect(idx)}
                    className={`flex-1 p-4 text-sm sm:text-base font-medium cursor-pointer flex items-center justify-between gap-2 ${
                      currentQ.exercise.ltr ? 'text-left' : 'text-right'
                    }`}
                  >
                    <span>{opt}</span>
                    {isRight && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                    )}
                    {isWrong && (
                      <XCircle className="w-4 h-4 text-rose-700 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                  {currentQ.exercise.ltr && /[a-zA-ZÀ-ÿ]/.test(opt) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakFrenchText(opt);
                      }}
                      aria-label={`استمع إلى ${opt}`}
                      className="p-2.5 ml-2 rounded-lg text-indigo-700 hover:bg-indigo-100 cursor-pointer shrink-0"
                    >
                      <Volume2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {duelSubmitted && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                <strong className="text-slate-900">التوضيح: </strong>
                {currentQ.exercise.explanation}
              </div>
              <button
                type="button"
                onClick={handleDuelNext}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
              >
                {duelIdx + 1 < totalQ ? 'السؤال التالي' : 'عرض النتيجة النهائية'}
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header & Student Personal Standing */}
      <div className="bg-white border-2 border-sky-100 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sky-100">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700">
              <Trophy className="w-4 h-4 text-amber-500" aria-hidden="true" />
              ترتيب قسم {gradeMeta.label} · منافسة تربوية آمنة
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
              لوحة الصدارة وتحدّي الزملاء
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              قارن تقدّمك بأقرانك في نفس مستواك الدراسي فقط دون عرض أي بيانات شخصية حساسة، وادخل تحدياً سريعاً من 6 أسئلة لتعزيز نقاطك.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {hasPendingSync && authUser && (
              <button
                type="button"
                onClick={() => void onFlushSyncNow()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              >
                مزامنة النقاط الآن
              </button>
            )}
            {authUser && (
              <button
                type="button"
                disabled={leaderboardLoading}
                onClick={() => void handleManualRefresh()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${leaderboardLoading ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                تحديث الترتيب
              </button>
            )}
            <button
              type="button"
              onClick={() => startPeerDuel(defaultOpponent)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <Swords className="w-4 h-4" aria-hidden="true" />
              تحدّي سريع الآن
            </button>
          </div>
        </div>

        {refreshCooldownNotice && (
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900">
            {refreshCooldownNotice}
          </div>
        )}

        {/* Quick Standing KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-1">
            <div className="text-xs font-semibold text-sky-800">ترتيبك الحالي</div>
            <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
              #{myRank > 0 ? myRank : 1}
            </div>
            <div className="text-xs text-slate-600">
              من أصل {displayedRows.length} في {gradeMeta.shortLabel}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
            <div className="text-xs font-semibold text-amber-800">مجموع النقاط</div>
            <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
              {progress.points} نقطة
            </div>
            <div className="text-xs text-slate-600 font-mono tabular-nums">
              {Object.keys(progress.completedLessons).length} دروس مكتملة
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <div className="text-xs font-semibold text-emerald-800">انتصارات التحدّيات</div>
            <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
              {progress.challengeWins ?? 0}
            </div>
            <div className="text-xs text-slate-600">مبارزات معرفية ناجحة</div>
          </div>

          <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 space-y-1">
            <div className="text-xs font-semibold text-orange-800">سلسلة المواظبة</div>
            <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
              {progress.streakDays} أيام
            </div>
            <div className="text-xs text-slate-600">الولاية: {progress.schoolGovernorate}</div>
          </div>
        </div>

        {/* Prompt to Sign In if Guest */}
        {!authUser && (
          <div className="space-y-2.5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  أنت تتصفّح حالياً بالوضع المحلي. سجّل الدخول بحساب Google لنشر ترتيبك في قائمة{' '}
                  <strong>{gradeMeta.label}</strong> ومنافسة زملائك من مختلف الولايات التونسية.
                </div>
              </div>
              <button
                type="button"
                onClick={() => void onSignInWithGoogle()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                دخول Google للانضمام
              </button>
            </div>
            {cloudError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 space-y-1.5">
                <p>{cloudError}</p>
                <a
                  href={typeof window !== 'undefined' ? window.location.href : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-semibold text-sky-800 hover:underline"
                >
                  فتح المنصة في نافذة متصفّح مستقلة لتسجيل الدخول
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grade-Scoped Ranking Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" aria-hidden="true" />
            <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
              ترتيب المتفوّقين — {gradeMeta.label}
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            أعلى {displayedRows.length} متنافسين
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
              <tr>
                <th className="py-3 px-4 font-semibold">الرتبة</th>
                <th className="py-3 px-4 font-semibold">التلميذ</th>
                <th className="py-3 px-4 font-semibold">الولاية</th>
                <th className="py-3 px-4 font-semibold">الدروس</th>
                <th className="py-3 px-4 font-semibold">المواظبة</th>
                <th className="py-3 px-4 font-semibold">النقاط</th>
                <th className="py-3 px-4 font-semibold text-left">منافسة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedRows.map((row, idx) => {
                const rank = idx + 1;
                const isSelf = row.studentId === (activeStudentId || 'local_self');
                const badge = BADGES.find((b) => b.id === row.equippedBadgeId) ?? null;
                return (
                  <tr
                    key={row.studentId}
                    className={isSelf ? 'bg-sky-50/70' : 'hover:bg-slate-50/60'}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold tabular-nums">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs border ${
                          rank === 1
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : rank === 2
                            ? 'bg-slate-100 border-slate-300 text-slate-800'
                            : rank === 3
                            ? 'bg-orange-50 border-orange-200 text-orange-800'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        {rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        {badge ? (
                          <BadgeMedallion badge={badge} unlocked size="sm" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {row.displayName.slice(0, 1)}
                          </div>
                        )}
                        <div>
                          <div className="font-display font-bold text-slate-900">
                            {row.displayName}{' '}
                            {isSelf && (
                              <span className="text-xs font-semibold text-sky-700">(أنت)</span>
                            )}
                          </div>
                          {badge && (
                            <div className="text-xs text-slate-500">{badge.title}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                      {row.governorate}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-800 tabular-nums">
                      {row.completedLessonsCount} درساً
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-orange-700 tabular-nums">
                        <Flame className="w-3.5 h-3.5 text-orange-500" aria-hidden="true" />
                        {row.streakDays} يوم
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-700 tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                        {row.points}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-left">
                      {isSelf ? (
                        <button
                          type="button"
                          onClick={() => startPeerDuel(defaultOpponent)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-white border border-sky-200 hover:bg-sky-50 rounded-lg cursor-pointer whitespace-nowrap"
                        >
                          <Swords className="w-3.5 h-3.5" aria-hidden="true" />
                          تحدّي المعيار
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            startPeerDuel({
                              ownerId: row.ownerId,
                              studentId: row.studentId,
                              displayName: row.displayName,
                              governorate: row.governorate,
                              points: row.points,
                              targetScore: computeTargetScore(row),
                            })
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer whitespace-nowrap"
                        >
                          <Swords className="w-3.5 h-3.5" aria-hidden="true" />
                          تحدّي الزميل
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Peer Challenges History */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-sky-700" aria-hidden="true" />
            <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
              سجلّ التحدّيات الأخيرة ({peerChallenges.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">مبارزات 6 أسئلة في 90 ثانية</span>
        </div>

        {peerChallenges.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-500 border border-dashed border-slate-200 rounded-xl">
            لم تخض أي تحدٍّ سريع بعد. اضغط على «تحدّي سريع الآن» لبدء أول جولة منافسة شريفة!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {peerChallenges.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="text-sm font-display font-bold text-slate-900 truncate">
                    {c.challengerName} ضد {c.opponentName}
                  </div>
                  <div className="text-xs text-slate-500 font-mono tabular-nums">
                    {c.createdAtIso.slice(0, 10)} · النتيجة: {c.challengerScore}/{c.totalQuestions} مقابل{' '}
                    {c.opponentTargetScore}/{c.totalQuestions}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border shrink-0 ${
                    c.challengerWon
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  {c.challengerWon ? 'تفوّق' : 'مشاركة'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
