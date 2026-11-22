import React, { useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  RotateCcw,
  Sparkles,
  Flame,
  TrendingUp,
  ArrowLeft,
  Award,
  CalendarHeart,
  FileText,
  Gift,
} from 'lucide-react';
import {
  BADGES,
  GRADES,
  LEVELS,
  SUBJECTS,
  TUNISIAN_GOVERNORATES,
} from '../data/tunisianCurriculum';
import {
  BadgeDefinition,
  GradeLevel,
  Lesson,
  LevelInfo,
  StudentProgress,
  SubjectId,
} from '../types/curriculum';
import { BadgeMedallion } from './BadgeMedallion';
import { BadgeChestModal } from './BadgeChestModal';
import {
  SubjectMiniSparkline,
  SubjectProgressCharts,
} from './SubjectProgressCharts';

interface ProgressDashboardProps {
  progress: StudentProgress;
  studentLessons: Lesson[];
  completedCount: number;
  totalLessons: number;
  overallMasteryPercent: number;
  subjectStats: (id: SubjectId) => {
    totalLessons: number;
    completedLessons: number;
    accuracy: number;
    completionPercent: number;
  };
  earnedBadges: string[];
  levelInfo: LevelInfo;
  onEquipBadge: (badgeId: string) => void;
  onUpdateProfile: (name: string, governorate: string, grade: GradeLevel) => void;
  onResetProgress: () => void;
  onSimulateAbsence: () => void;
  onSelectLesson: (lesson: Lesson) => void;
  onOpenReports?: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  progress,
  studentLessons,
  completedCount,
  totalLessons,
  overallMasteryPercent,
  subjectStats,
  earnedBadges,
  levelInfo,
  onEquipBadge,
  onUpdateProfile,
  onResetProgress,
  onSimulateAbsence,
  onSelectLesson,
  onOpenReports,
}) => {
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState(progress.studentName);
  const [govInput, setGovInput] = useState(progress.schoolGovernorate);
  const [gradeInput, setGradeInput] = useState<GradeLevel>(progress.selectedGrade);
  const [confirmReset, setConfirmReset] = useState(false);
  const [chestPreviewBadge, setChestPreviewBadge] = useState<BadgeDefinition | null>(null);
  const [selectedChartSubject, setSelectedChartSubject] = useState<SubjectId>('math');

  const activeGradeMeta =
    GRADES.find((g) => g.grade === progress.selectedGrade) ?? GRADES[3];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    onUpdateProfile(nameInput, govInput, gradeInput);
    setEditingProfile(false);
  };

  const nextRecommendedLesson =
    studentLessons.find((l) => !progress.completedLessons[l.id]) ?? studentLessons[0];

  const equippedBadge = BADGES.find((b) => b.id === progress.equippedBadgeId) ?? null;

  const levelPercent =
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
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Student Profile Card */}
      <div className="bg-gradient-to-l from-white via-white to-sky-50/50 border-2 border-sky-100 rounded-3xl p-6 space-y-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {equippedBadge ? (
              <BadgeMedallion badge={equippedBadge} unlocked size="lg" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-sky-50 border-2 border-sky-200 flex items-center justify-center shrink-0">
                <Award className="w-8 h-8 text-sky-500" aria-hidden="true" />
              </div>
            )}

            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-sky-700">
                بطاقة التلميذ · المتابعة والتحفيز للتلميذ والوليّ
              </div>

              {!editingProfile ? (
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                      {progress.studentName.trim() || 'عزيز'}
                    </h1>
                    <button
                      type="button"
                      onClick={() => {
                        setNameInput(progress.studentName);
                        setGovInput(progress.schoolGovernorate);
                        setGradeInput(progress.selectedGrade);
                        setEditingProfile(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900 underline underline-offset-4 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                      تعديل الاسم والسنة
                    </button>
                  </div>
                  <div className="text-sm text-slate-600">
                    {progress.schoolGovernorate} · {activeGradeMeta.label} · المستوى {levelInfo.level}:{' '}
                    <strong className="text-slate-900">{levelInfo.title}</strong>
                    {equippedBadge && (
                      <>
                        {' · '}
                        <span className="text-amber-700 font-medium">
                          الوسام المعروض: {equippedBadge.title}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="flex flex-wrap items-end gap-3 pt-1">
                  <label className="space-y-1">
                    <span className="block text-xs font-semibold text-slate-600">اسم التلميذ</span>
                    <input
                      type="text"
                      required
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-sky-500"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="block text-xs font-semibold text-slate-600">الولاية</span>
                    <select
                      value={govInput}
                      onChange={(e) => setGovInput(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-slate-50 cursor-pointer"
                    >
                      {TUNISIAN_GOVERNORATES.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="block text-xs font-semibold text-slate-600">السنة الدراسية</span>
                    <select
                      value={gradeInput}
                      onChange={(e) => setGradeInput(Number(e.target.value) as GradeLevel)}
                      className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-slate-50 cursor-pointer"
                    >
                      {GRADES.map((g) => (
                        <option key={g.grade} value={g.grade}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-700 cursor-pointer"
                  >
                    حفظ التغييرات
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProfile(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
                  >
                    إلغاء
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <div>
              <div className="text-xs font-medium text-slate-500">مجموع النقاط</div>
              <div className="mt-1 flex items-center gap-1.5 text-xl font-mono font-bold text-slate-900 tabular-nums">
                <Sparkles className="w-5 h-5 text-amber-500" aria-hidden="true" />
                {progress.points}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">الأوسمة المفتوحة</div>
              <div className="mt-1 text-xl font-mono font-bold text-amber-700 tabular-nums">
                {earnedBadges.length} / {BADGES.length}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">
                دروس {activeGradeMeta.shortLabel}
              </div>
              <div className="mt-1 text-xl font-mono font-bold text-slate-900 tabular-nums">
                {completedCount} / {totalLessons}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">سلسلة المواظبة</div>
              <div className="mt-1 flex items-center gap-1.5 text-xl font-mono font-bold text-slate-900 tabular-nums">
                <Flame className="w-5 h-5 text-orange-500" aria-hidden="true" />
                {progress.streakDays} أيام
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-800">
              مسار التقدّم نحو المستويات الأعلى ({levelInfo.title})
            </span>
            <span className="font-mono text-slate-600 tabular-nums">
              {levelInfo.nextMinPoints !== null
                ? `${progress.points} / ${levelInfo.nextMinPoints} نقطة للمستوى ${
                    levelInfo.level + 1
                  }`
                : `${progress.points} نقطة · القمة!`}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-amber-500 to-sky-500 transition-all duration-300"
              style={{ width: `${levelPercent}%` }}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            {LEVELS.map((lvl) => {
              const reached = progress.points >= lvl.minPoints;
              return (
                <div
                  key={lvl.level}
                  className={`text-xs font-medium truncate ${
                    reached ? 'text-slate-900 font-semibold' : 'text-slate-400'
                  }`}
                >
                  <span className="font-mono tabular-nums">{lvl.level}.</span> {lvl.title}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subject Mastery strictly for the student's grade */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900">
            تقدّم {progress.studentName || 'عزيز'} في مواد {activeGradeMeta.label}
          </h2>
          <span className="text-xs font-mono font-bold text-sky-700 tabular-nums">
            إتقان القسم: {overallMasteryPercent}%
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {(['math', 'science', 'arabic', 'french', 'social'] as SubjectId[]).map((sid) => {
            const meta = SUBJECTS[sid];
            const stats = subjectStats(sid);
            const isChartActive = selectedChartSubject === sid;
            return (
              <button
                key={sid}
                type="button"
                onClick={() => setSelectedChartSubject(sid)}
                aria-pressed={isChartActive}
                className={`card-interactive text-right bg-white rounded-3xl p-5 space-y-3 cursor-pointer transition-all ${
                  isChartActive
                    ? `border-2 ${meta.accentBorder} ring-2 ring-sky-200 shadow-sm`
                    : 'border-2 border-slate-200/90 hover:border-sky-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className={`text-base font-display font-bold ${meta.accentText}`}>
                      {meta.name}
                    </div>
                    <div className="text-xs text-slate-500" dir="ltr">
                      {meta.frenchName}
                    </div>
                  </div>
                  <span className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                    {stats.completionPercent}%
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${meta.barColor} transition-all duration-300`}
                    style={{ width: `${stats.completionPercent}%` }}
                  />
                </div>

                <SubjectMiniSparkline
                  subjectId={sid}
                  progress={progress}
                  studentLessons={studentLessons}
                />

                <div className="flex items-center justify-between text-xs text-slate-600 font-mono tabular-nums pt-1 border-t border-slate-100">
                  <span>
                    الدروس: {stats.completedLessons}/{stats.totalLessons}
                  </span>
                  <span>الدقة: {stats.accuracy > 0 ? `${stats.accuracy}%` : '—'}</span>
                </div>
              </button>
            );
          })}
        </div>

        <SubjectProgressCharts
          progress={progress}
          studentLessons={studentLessons}
          selectedSubject={selectedChartSubject}
          onChangeSubject={setSelectedChartSubject}
          subjectStats={subjectStats}
          onSelectLesson={onSelectLesson}
        />
      </div>

      {/* Badges Cabinet */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900">
              خزانة الأوسمة الافتراضية ({earnedBadges.length} من {BADGES.length})
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mt-1">
              يُفتح كل وسام تلقائياً داخل صندوق الأوسمة التفاعلي عند إتمام الدروس والتمارين بنجاح! اختر وسامك المفضّل لعرضه في بطاقتك.
            </p>
          </div>
          {(equippedBadge || earnedBadges.length > 0) && (
            <button
              type="button"
              onClick={() => {
                const target =
                  equippedBadge ?? BADGES.find((b) => Boolean(progress.unlockedBadges[b.id])) ?? BADGES[0];
                setChestPreviewBadge(target);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Gift className="w-4 h-4" aria-hidden="true" />
              افتح صندوق الأوسمة بالصوت والمؤثّرات
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BADGES.map((badge) => {
            const unlockedDate = progress.unlockedBadges[badge.id];
            const unlocked = Boolean(unlockedDate);
            const isEquipped = progress.equippedBadgeId === badge.id;

            return (
              <div
                key={badge.id}
                className={`card-interactive rounded-2xl border p-4 flex flex-col justify-between space-y-4 ${
                  unlocked
                    ? isEquipped
                      ? 'bg-amber-50/60 border-amber-400'
                      : 'bg-white border-slate-200'
                    : 'bg-slate-50 border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    disabled={!unlocked}
                    onClick={() => unlocked && setChestPreviewBadge(badge)}
                    title={unlocked ? 'اضغط لفتح صندوق هذا الوسام' : undefined}
                    className={unlocked ? 'cursor-pointer transition-transform hover:scale-105 shrink-0' : 'shrink-0'}
                  >
                    <BadgeMedallion badge={badge} unlocked={unlocked} size="md" />
                  </button>
                  <div className="min-w-0 space-y-1">
                    <div className="text-sm font-display font-bold text-slate-900">
                      {badge.title}
                    </div>
                    <div className="text-xs font-mono font-semibold text-amber-700 tabular-nums">
                      +{badge.bonusPoints} نقطة مكافأة
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {unlocked ? badge.description : `شرط الفتح: ${badge.requirementText}`}
                </p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  {unlocked ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setChestPreviewBadge(badge)}
                        className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900 font-semibold cursor-pointer whitespace-nowrap"
                      >
                        <Gift className="w-3.5 h-3.5" aria-hidden="true" />
                        فتح الصندوق
                      </button>
                      <button
                        type="button"
                        onClick={() => onEquipBadge(badge.id)}
                        disabled={isEquipped}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          isEquipped
                            ? 'bg-amber-600 text-white cursor-default'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {isEquipped ? 'معروض بجانبك' : 'اعرضه بجانبي'}
                      </button>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 opacity-40" aria-hidden="true" />
                      مقفل — واصل التقدّم
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Parent Report & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sky-700" aria-hidden="true" />
            <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
              ملخص المتابعة التربوية للأولياء
            </h2>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            جمع التلميذ{' '}
            <strong>{progress.studentName.trim() || 'عزيز'}</strong> ({activeGradeMeta.shortLabel}) حتى الآن{' '}
            <strong className="font-mono tabular-nums">{progress.points}</strong> نقطة وفتح{' '}
            <strong className="font-mono tabular-nums">{earnedBadges.length}</strong> أوسمة افتراضية.
            آخر دخول مسجّل:{' '}
            <strong className="font-mono tabular-nums">{progress.lastActiveDate}</strong>.
          </p>

          {nextRecommendedLesson && (
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-sky-800">الخطوة التالية المقترحة</div>
                <div className="text-sm font-bold text-slate-900">
                  {SUBJECTS[nextRecommendedLesson.subjectId].name}: {nextRecommendedLesson.title}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectLesson(nextRecommendedLesson)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                ابدأ الآن
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          )}

          {onOpenReports && (
            <button
              type="button"
              onClick={onOpenReports}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-sky-600" aria-hidden="true" />
              افتح تقارير التقدّم المفصّلة وحفظ ملفات التلاميذ
            </button>
          )}
        </div>

        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
              سجل النقاط والأنشطة الأخيرة
            </h2>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onSimulateAbsence}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors cursor-pointer"
              >
                <CalendarHeart className="w-3.5 h-3.5" aria-hidden="true" />
                معاينة تذكير الغياب (+3 أيام)
              </button>

              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  إعادة ضبط السجل
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-rose-700 font-semibold">تأكيد مسح التقدم؟</span>
                  <button
                    type="button"
                    onClick={() => {
                      onResetProgress();
                      setConfirmReset(false);
                    }}
                    className="px-3 py-1 bg-rose-600 text-white font-semibold rounded-md cursor-pointer"
                  >
                    نعم، امسح
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1 bg-slate-100 text-slate-700 font-semibold rounded-md cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              )}
            </div>
          </div>

          {progress.activityLog.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              لم تُسجّل أنشطة بعد. ابدأ بأي مختبر أو تحدي 3 دقائق لجمع النقاط وفتح الأوسمة!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="py-2.5 font-semibold">النشاط / الدرس</th>
                    <th className="py-2.5 font-semibold">السنة والمادة</th>
                    <th className="py-2.5 font-semibold">النتيجة</th>
                    <th className="py-2.5 font-semibold">النقاط</th>
                    <th className="py-2.5 font-semibold">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {progress.activityLog.map((entry) => {
                    const entryGrade = GRADES.find((g) => g.grade === entry.grade);
                    return (
                      <tr key={entry.id}>
                        <td className="py-3 font-medium text-slate-900">{entry.title}</td>
                        <td className="py-3 text-slate-600">
                          {entryGrade ? `${entryGrade.shortLabel} · ` : ''}
                          {entry.mode === 'express' || entry.mode === 'exam'
                            ? 'شامل'
                            : SUBJECTS[entry.subjectId].name}
                        </td>
                        <td className="py-3 font-mono font-semibold text-slate-900 tabular-nums">
                          {entry.score} / {entry.total}
                        </td>
                        <td className="py-3 font-mono font-semibold text-amber-700 tabular-nums">
                          +{entry.pointsEarned}
                        </td>
                        <td className="py-3 font-mono text-xs text-slate-500 tabular-nums">
                          {entry.date}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {chestPreviewBadge && (
        <BadgeChestModal
          badges={[chestPreviewBadge]}
          pointsEarned={chestPreviewBadge.bonusPoints}
          reason="معاينة وتكريم وسامك المكتسب"
          onClose={() => setChestPreviewBadge(null)}
        />
      )}
    </section>
  );
};
