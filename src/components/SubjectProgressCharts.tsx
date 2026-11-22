import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  LineChart as LineChartIcon,
  Target,
  TrendingUp,
} from 'lucide-react';
import { SUBJECTS, TRIMESTERS } from '../data/tunisianCurriculum';
import { Lesson, StudentProgress, SubjectId } from '../types/curriculum';

const SUBJECT_ORDER: SubjectId[] = ['math', 'science', 'arabic', 'french', 'social'];

const SUBJECT_CHART_THEME: Record<
  SubjectId,
  {
    hex: string;
    secondaryHex: string;
    softBg: string;
    border: string;
    text: string;
    shortName: string;
  }
> = {
  math: {
    hex: '#0284c7',
    secondaryHex: '#38bdf8',
    softBg: 'bg-sky-50',
    border: 'border-sky-300',
    text: 'text-sky-800',
    shortName: 'الرياضيات',
  },
  science: {
    hex: '#059669',
    secondaryHex: '#34d399',
    softBg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-800',
    shortName: 'الإيقاظ العلمي',
  },
  arabic: {
    hex: '#d97706',
    secondaryHex: '#fbbf24',
    softBg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-800',
    shortName: 'العربية',
  },
  french: {
    hex: '#4f46e5',
    secondaryHex: '#818cf8',
    softBg: 'bg-indigo-50',
    border: 'border-indigo-300',
    text: 'text-indigo-800',
    shortName: 'الفرنسية',
  },
  social: {
    hex: '#0d9488',
    secondaryHex: '#2dd4bf',
    softBg: 'bg-teal-50',
    border: 'border-teal-300',
    text: 'text-teal-800',
    shortName: 'الاجتماعيات',
  },
};

const TRIMESTER_SHORT: Record<string, string> = {
  'الثلاثي الأول': 'ث 1',
  'الثلاثي الثاني': 'ث 2',
  'الثلاثي الثالث': 'ث 3',
};

interface TimelinePoint {
  stepLabel: string;
  title: string;
  accuracy: number;
  scoreText: string;
  pointsEarned: number;
  date: string;
  modeLabel: string;
}

interface TrimesterPoint {
  name: string;
  fullName: string;
  completionPercent: number;
  accuracy: number;
  completedLessons: number;
  totalLessons: number;
}

interface OverviewPoint {
  subjectId: SubjectId;
  name: string;
  shortName: string;
  completionPercent: number;
  accuracy: number;
  completedLessons: number;
  totalLessons: number;
  color: string;
}

interface SubjectProgressChartsProps {
  progress: StudentProgress;
  studentLessons: Lesson[];
  selectedSubject: SubjectId;
  onChangeSubject: (subjectId: SubjectId) => void;
  subjectStats: (id: SubjectId) => {
    totalLessons: number;
    completedLessons: number;
    accuracy: number;
    completionPercent: number;
  };
  onSelectLesson: (lesson: Lesson) => void;
}

function buildSubjectAnalytics(
  subjectId: SubjectId,
  progress: StudentProgress,
  studentLessons: Lesson[]
): {
  timeline: TimelinePoint[];
  trimesters: TrimesterPoint[];
  bestAccuracy: number;
  latestAccuracy: number;
  deltaAccuracy: number | null;
} {
  const subjectLessons = studentLessons.filter((l) => l.subjectId === subjectId);

  const trimesters: TrimesterPoint[] = TRIMESTERS.map((tri) => {
    const triLessons = subjectLessons.filter((l) => l.trimester === tri);
    const completed = triLessons.filter((l) => Boolean(progress.completedLessons[l.id]));
    const completionPercent =
      triLessons.length > 0 ? Math.round((completed.length / triLessons.length) * 100) : 0;

    let totalRatio = 0;
    completed.forEach((l) => {
      const rec = progress.completedLessons[l.id];
      if (rec && rec.totalQuestions > 0) {
        totalRatio += rec.bestScore / rec.totalQuestions;
      }
    });
    const accuracy =
      completed.length > 0 ? Math.round((totalRatio / completed.length) * 100) : 0;

    return {
      name: TRIMESTER_SHORT[tri] ?? tri,
      fullName: tri,
      completionPercent,
      accuracy,
      completedLessons: completed.length,
      totalLessons: triLessons.length,
    };
  });

  // Collect chronological activity entries for this subject & current grade
  const logEntries = progress.activityLog
    .filter((entry) => entry.subjectId === subjectId && entry.grade === progress.selectedGrade)
    .slice()
    .reverse(); // oldest -> newest

  const seenLessonIds = new Set(logEntries.map((e) => e.lessonId));

  // Backfill any completed lessons not present in the recent 30-item activityLog
  const olderCompleted = subjectLessons
    .filter((l) => progress.completedLessons[l.id] && !seenLessonIds.has(l.id))
    .map((l) => ({
      lesson: l,
      rec: progress.completedLessons[l.id],
    }))
    .sort((a, b) => a.rec.lastCompletedAt.localeCompare(b.rec.lastCompletedAt));

  const timeline: TimelinePoint[] = [];

  olderCompleted.forEach(({ lesson, rec }) => {
    const acc =
      rec.totalQuestions > 0 ? Math.round((rec.bestScore / rec.totalQuestions) * 100) : 0;
    timeline.push({
      stepLabel: `#${timeline.length + 1}`,
      title: lesson.title,
      accuracy: acc,
      scoreText: `${rec.bestScore} / ${rec.totalQuestions}`,
      pointsEarned: 0,
      date: rec.lastCompletedAt,
      modeLabel: 'إتمام درس',
    });
  });

  logEntries.forEach((entry) => {
    const acc = entry.total > 0 ? Math.round((entry.score / entry.total) * 100) : 0;
    const modeLabel =
      entry.mode === 'french'
        ? 'أكاديمية الفرنسية'
        : entry.mode === 'express'
        ? 'تحدي سريع'
        : entry.mode === 'exam'
        ? 'امتحان تجريبي'
        : 'نشاط درس';
    timeline.push({
      stepLabel: `#${timeline.length + 1}`,
      title: entry.title,
      accuracy: acc,
      scoreText: `${entry.score} / ${entry.total}`,
      pointsEarned: entry.pointsEarned,
      date: entry.date,
      modeLabel,
    });
  });

  const bestAccuracy =
    timeline.length > 0 ? Math.max(...timeline.map((p) => p.accuracy)) : 0;
  const latestAccuracy =
    timeline.length > 0 ? timeline[timeline.length - 1].accuracy : 0;
  const deltaAccuracy =
    timeline.length >= 2 ? latestAccuracy - timeline[0].accuracy : null;

  return {
    timeline,
    trimesters,
    bestAccuracy,
    latestAccuracy,
    deltaAccuracy,
  };
}

export const SubjectMiniSparkline: React.FC<{
  subjectId: SubjectId;
  progress: StudentProgress;
  studentLessons: Lesson[];
}> = ({ subjectId, progress, studentLessons }) => {
  const theme = SUBJECT_CHART_THEME[subjectId];
  const { trimesters } = useMemo(
    () => buildSubjectAnalytics(subjectId, progress, studentLessons),
    [subjectId, progress, studentLessons]
  );

  return (
    <div className="w-full h-[68px]" dir="ltr">
      <ResponsiveContainer width="100%" height={68} minWidth={0}>
        <AreaChart data={trimesters} margin={{ top: 6, right: 6, left: 6, bottom: 0 }}>
          <defs>
            <linearGradient id={`mini-grad-${subjectId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.hex} stopOpacity={0.28} />
              <stop offset="95%" stopColor={theme.hex} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis domain={[0, 100]} hide />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0].payload as TrimesterPoint;
              return (
                <div
                  dir="rtl"
                  className="bg-slate-900 text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-md space-y-0.5"
                >
                  <div className="font-bold">{item.fullName}</div>
                  <div className="font-mono tabular-nums">
                    الإنجاز: {item.completionPercent}% ({item.completedLessons}/{item.totalLessons})
                  </div>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="completionPercent"
            stroke={theme.hex}
            strokeWidth={2}
            fill={`url(#mini-grad-${subjectId})`}
            dot={{ r: 2.5, fill: theme.hex, strokeWidth: 0 }}
            activeDot={{ r: 4, fill: theme.hex }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SubjectProgressCharts: React.FC<SubjectProgressChartsProps> = ({
  progress,
  studentLessons,
  selectedSubject,
  onChangeSubject,
  subjectStats,
  onSelectLesson,
}) => {
  const activeMeta = SUBJECTS[selectedSubject];
  const activeTheme = SUBJECT_CHART_THEME[selectedSubject];
  const activeStats = subjectStats(selectedSubject);

  const overviewData: OverviewPoint[] = useMemo(
    () =>
      SUBJECT_ORDER.map((sid) => {
        const stats = subjectStats(sid);
        return {
          subjectId: sid,
          name: SUBJECTS[sid].name,
          shortName: SUBJECT_CHART_THEME[sid].shortName,
          completionPercent: stats.completionPercent,
          accuracy: stats.accuracy,
          completedLessons: stats.completedLessons,
          totalLessons: stats.totalLessons,
          color: SUBJECT_CHART_THEME[sid].hex,
        };
      }),
    [subjectStats]
  );

  const subjectAnalytics = useMemo(
    () => buildSubjectAnalytics(selectedSubject, progress, studentLessons),
    [selectedSubject, progress, studentLessons]
  );

  const nextSubjectLesson = useMemo(
    () =>
      studentLessons.find(
        (l) => l.subjectId === selectedSubject && !progress.completedLessons[l.id]
      ) ?? studentLessons.find((l) => l.subjectId === selectedSubject),
    [studentLessons, selectedSubject, progress.completedLessons]
  );

  return (
    <div className="space-y-6">
      {/* Interactive Per-Subject Deep Dive */}
      <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-700">
              <LineChartIcon className="w-4 h-4" aria-hidden="true" />
              <span>رسوم بيانية تفاعلية لتطوّر المستوى في كل مادة</span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900">
              تحليل التطوّر الدراسي لمادة {activeMeta.name}
            </h2>
          </div>

          {/* 5-Subject Interactive Switcher */}
          <div
            role="tablist"
            aria-label="اختر المادة لعرض تطور المستوى"
            className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 border border-slate-200 rounded-2xl"
          >
            {SUBJECT_ORDER.map((sid) => {
              const isSelected = sid === selectedSubject;
              const stats = subjectStats(sid);
              const theme = SUBJECT_CHART_THEME[sid];
              return (
                <button
                  key={sid}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onChangeSubject(sid)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: theme.hex }}
                    aria-hidden="true"
                  />
                  <span>{theme.shortName}</span>
                  <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                    {stats.completionPercent}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Subject KPI Summary Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className={`rounded-2xl border p-3.5 ${activeTheme.softBg} ${activeTheme.border}`}>
            <div className="text-xs font-medium text-slate-600">تقدّم الدروس</div>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <span className={`text-xl font-mono font-bold tabular-nums ${activeTheme.text}`}>
                {activeStats.completionPercent}%
              </span>
              <span className="text-xs font-mono text-slate-600 tabular-nums">
                {activeStats.completedLessons} / {activeStats.totalLessons}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
            <div className="text-xs font-medium text-slate-600">متوسط الدقة</div>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <span className="text-xl font-mono font-bold text-slate-900 tabular-nums">
                {activeStats.accuracy > 0 ? `${activeStats.accuracy}%` : '—'}
              </span>
              <span className="text-xs text-slate-500">في التمارين</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
            <div className="text-xs font-medium text-slate-600">أعلى نتيجة مسجّلة</div>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <span className="text-xl font-mono font-bold text-slate-900 tabular-nums">
                {subjectAnalytics.timeline.length > 0
                  ? `${subjectAnalytics.bestAccuracy}%`
                  : '—'}
              </span>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {subjectAnalytics.timeline.length} نشاط
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
            <div className="text-xs font-medium text-slate-600">مؤشّر تطوّر المستوى</div>
            <div className="mt-1 flex items-center gap-1.5">
              <TrendingUp
                className="w-4 h-4 shrink-0"
                style={{ color: activeTheme.hex }}
                aria-hidden="true"
              />
              <span className="text-base sm:text-lg font-mono font-bold text-slate-900 tabular-nums">
                {subjectAnalytics.deltaAccuracy === null
                  ? subjectAnalytics.timeline.length === 1
                    ? `${subjectAnalytics.latestAccuracy}%`
                    : 'بانتظار التمرين'
                  : subjectAnalytics.deltaAccuracy > 0
                  ? `+${subjectAnalytics.deltaAccuracy}% تحسّن`
                  : subjectAnalytics.deltaAccuracy === 0
                  ? 'أداء مستقر'
                  : `${subjectAnalytics.deltaAccuracy}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Two Side-by-Side Interactive Recharts Panels for the Selected Subject */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Chart A: Chronological Score Trajectory (AreaChart) */}
          <div className="lg:col-span-7 bg-slate-50/60 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-display font-bold text-slate-900">
                  منحنى تطوّر النتائج عبر المحاولات ({activeMeta.name})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  مرّر المؤشر على أي نقطة لعرض تفاصيل الدرس والنتيجة والتاريخ
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                <Target className="w-3.5 h-3.5" aria-hidden="true" />
                هدف الإتقان: 80%
              </span>
            </div>

            {subjectAnalytics.timeline.length === 0 ? (
              <div className="h-[240px] rounded-xl border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-center p-5 space-y-3">
                <div className="text-sm font-bold text-slate-800">
                  لا توجد محاولات مسجّلة في {activeMeta.name} بعد
                </div>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  أكمل أول درس أو اختبار في هذه المادة ليبدأ الرسم البياني برسم منحنى تطوّر درجاتك تلقائياً.
                </p>
                {nextSubjectLesson && (
                  <button
                    type="button"
                    onClick={() => onSelectLesson(nextSubjectLesson)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl transition-opacity hover:opacity-95 cursor-pointer"
                    style={{ backgroundColor: activeTheme.hex }}
                  >
                    ابدأ: {nextSubjectLesson.title}
                    <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            ) : (
              <div className="w-full h-[240px]" dir="ltr">
                <ResponsiveContainer width="100%" height={240} minWidth={0}>
                  <AreaChart
                    data={subjectAnalytics.timeline}
                    margin={{ top: 12, right: 16, left: -12, bottom: 4 }}
                  >
                    <defs>
                      <linearGradient id="active-subject-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={activeTheme.hex} stopOpacity={0.32} />
                        <stop offset="95%" stopColor={activeTheme.hex} stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="stepLabel"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ReferenceLine
                      y={80}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const pt = payload[0].payload as TimelinePoint;
                        return (
                          <div
                            dir="rtl"
                            className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-right max-w-[230px] space-y-1"
                          >
                            <div className="text-[11px] font-semibold text-slate-500">
                              {pt.modeLabel} · {pt.date}
                            </div>
                            <div className="text-xs font-bold text-slate-900 leading-snug">
                              {pt.title}
                            </div>
                            <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs font-mono tabular-nums">
                              <span className="font-bold" style={{ color: activeTheme.hex }}>
                                الدقة: {pt.accuracy}%
                              </span>
                              <span className="text-slate-600">{pt.scoreText}</span>
                            </div>
                            {pt.pointsEarned > 0 && (
                              <div className="text-[11px] font-mono font-semibold text-amber-700 tabular-nums">
                                +{pt.pointsEarned} نقطة مكتسبة
                              </div>
                            )}
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      name="الدقة %"
                      stroke={activeTheme.hex}
                      strokeWidth={2.5}
                      fill="url(#active-subject-area)"
                      dot={{ r: 4, fill: '#ffffff', stroke: activeTheme.hex, strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: activeTheme.hex, stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart B: Trimester Mastery & Accuracy Breakdown (BarChart) */}
          <div className="lg:col-span-5 bg-slate-50/60 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-display font-bold text-slate-900">
                التقدّم حسب الثلاثيات ({activeMeta.name})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                مقارنة نسبة إنجاز الدروس ودقة الإجابات في كل ثلاثي
              </p>
            </div>

            <div className="w-full h-[240px]" dir="ltr">
              <ResponsiveContainer width="100%" height={240} minWidth={0}>
                <BarChart
                  data={subjectAnalytics.trimesters}
                  margin={{ top: 12, right: 12, left: -14, bottom: 4 }}
                  barGap={6}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const item = payload[0].payload as TrimesterPoint;
                      return (
                        <div
                          dir="rtl"
                          className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-right space-y-1.5"
                        >
                          <div className="text-xs font-bold text-slate-900">{item.fullName}</div>
                          <div className="text-xs font-mono tabular-nums text-slate-700">
                            الإنجاز: <strong>{item.completionPercent}%</strong> ({item.completedLessons} من {item.totalLessons} دروس)
                          </div>
                          <div className="text-xs font-mono tabular-nums text-slate-700">
                            الدقة: <strong>{item.accuracy > 0 ? `${item.accuracy}%` : '—'}</strong>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs font-semibold text-slate-700 px-1">{value}</span>
                    )}
                  />
                  <Bar
                    dataKey="completionPercent"
                    name="الإنجاز %"
                    fill={activeTheme.hex}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="accuracy"
                    name="الدقة %"
                    fill={activeTheme.secondaryHex}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* All-5-Subjects Side-by-Side Comparison Chart */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
              <BarChart3 className="w-4 h-4 text-sky-600" aria-hidden="true" />
              <span>مقارنة تفاعلية بين المواد الخمس</span>
            </div>
            <h3 className="text-base sm:text-lg font-display font-bold text-slate-900">
              نسبة الإنجاز ودقة الإجابات حسب كل مادة (اضغط على أي مادة لتفاصيلها)
            </h3>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>المادة المحددة حالياً: {activeMeta.name}</span>
          </div>
        </div>

        <div className="w-full h-[250px]" dir="ltr">
          <ResponsiveContainer width="100%" height={250} minWidth={0}>
            <BarChart
              data={overviewData}
              margin={{ top: 10, right: 16, left: -12, bottom: 4 }}
              barGap={6}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="shortName"
                tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0].payload as OverviewPoint;
                  return (
                    <div
                      dir="rtl"
                      className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-right space-y-1"
                    >
                      <div className="text-xs font-bold text-slate-900">{item.name}</div>
                      <div className="text-xs font-mono tabular-nums text-slate-700">
                        نسبة الإنجاز: <strong>{item.completionPercent}%</strong> ({item.completedLessons}/{item.totalLessons})
                      </div>
                      <div className="text-xs font-mono tabular-nums text-slate-700">
                        دقة الإجابات: <strong>{item.accuracy > 0 ? `${item.accuracy}%` : '—'}</strong>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                formatter={(value) => (
                  <span className="text-xs font-semibold text-slate-700 px-1">{value}</span>
                )}
              />
              <Bar
                dataKey="completionPercent"
                name="نسبة الإنجاز %"
                radius={[6, 6, 0, 0]}
                maxBarSize={30}
                className="cursor-pointer"
                onClick={(entry) => {
                  const sid = (entry as unknown as OverviewPoint | undefined)?.subjectId;
                  if (sid) onChangeSubject(sid);
                }}
              >
                {overviewData.map((entry) => (
                  <Cell
                    key={entry.subjectId}
                    fill={entry.color}
                    fillOpacity={entry.subjectId === selectedSubject ? 1 : 0.72}
                  />
                ))}
              </Bar>
              <Bar
                dataKey="accuracy"
                name="دقة التمارين %"
                fill="#94a3b8"
                radius={[6, 6, 0, 0]}
                maxBarSize={30}
                className="cursor-pointer"
                onClick={(entry) => {
                  const sid = (entry as unknown as OverviewPoint | undefined)?.subjectId;
                  if (sid) onChangeSubject(sid);
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
