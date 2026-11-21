import React, { useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Flame,
  Lock,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { GRADES, SUBJECTS } from '../data/tunisianCurriculum';
import {
  Lesson,
  ParentFollowUpPreferences,
  ParentNotificationCadence,
  SavedStudentRecord,
  StudentProgress,
  SubjectId,
} from '../types/curriculum';

interface ParentFollowUpViewProps {
  progress: StudentProgress;
  studentLessons: Lesson[];
  savedStudents: SavedStudentRecord[];
  activeStudentId: string | null;
  authUser: User | null;
  subjectStats: (id: SubjectId) => {
    totalLessons: number;
    completedLessons: number;
    accuracy: number;
    completionPercent: number;
  };
  overallMasteryPercent: number;
  completedCount: number;
  totalLessons: number;
  earnedBadgesCount: number;
  parentPrefs: ParentFollowUpPreferences;
  onSaveParentPrefs: (prefs: ParentFollowUpPreferences) => Promise<void>;
  onClearParentPrefs: () => Promise<void>;
  onSelectSavedStudent: (studentId: string) => Promise<void>;
  onSelectLesson: (lesson: Lesson) => void;
  onOpenReports: () => void;
}

interface DigestResponsePayload {
  ok: boolean;
  deliveryMode: 'webhook_dispatched' | 'generated_eml';
  subject: string;
  textBody: string;
  emlContent: string;
  generatedAtIso: string;
}

const CADENCE_OPTIONS: { id: ParentNotificationCadence; label: string; hint: string }[] = [
  { id: 'weekly', label: 'تقرير أسبوعي', hint: 'كل نهاية أسبوع دراسي' },
  { id: 'biweekly', label: 'كل أسبوعين', hint: 'متابعة نصف شهرية متوازنة' },
  { id: 'monthly', label: 'تقرير شهري', hint: 'حصيلة شهرية شاملة' },
  { id: 'disabled', label: 'إيقاف الإشعارات الدورية', hint: 'الاحتفاظ بالإعدادات عند الطلب فقط' },
];

export const ParentFollowUpView: React.FC<ParentFollowUpViewProps> = ({
  progress,
  studentLessons,
  savedStudents,
  activeStudentId,
  authUser,
  subjectStats,
  overallMasteryPercent,
  completedCount,
  totalLessons,
  earnedBadgesCount,
  parentPrefs,
  onSaveParentPrefs,
  onClearParentPrefs,
  onSelectSavedStudent,
  onSelectLesson,
  onOpenReports,
}) => {
  const [email, setEmail] = useState(parentPrefs.parentEmail);
  const [cadence, setCadence] = useState<ParentNotificationCadence>(parentPrefs.cadence);
  const [notifyOnBadge, setNotifyOnBadge] = useState(parentPrefs.notifyOnBadge);
  const [notifyOnInactivity, setNotifyOnInactivity] = useState(
    parentPrefs.notifyOnInactivity
  );
  const [includeSubjectDetails, setIncludeSubjectDetails] = useState(
    parentPrefs.includeSubjectDetails
  );
  const [consentAccepted, setConsentAccepted] = useState(parentPrefs.consentAccepted);

  useEffect(() => {
    setEmail(parentPrefs.parentEmail);
    setCadence(parentPrefs.cadence);
    setNotifyOnBadge(parentPrefs.notifyOnBadge);
    setNotifyOnInactivity(parentPrefs.notifyOnInactivity);
    setIncludeSubjectDetails(parentPrefs.includeSubjectDetails);
    setConsentAccepted(parentPrefs.consentAccepted);
  }, [parentPrefs]);

  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsBanner, setPrefsBanner] = useState<string | null>(null);
  const [prefsError, setPrefsError] = useState<string | null>(null);

  const [generatingDigest, setGeneratingDigest] = useState(false);
  const [digestResult, setDigestResult] = useState<DigestResponsePayload | null>(null);
  const [digestError, setDigestError] = useState<string | null>(null);
  const [copiedDigest, setCopiedDigest] = useState(false);

  const gradeMeta = GRADES.find((g) => g.grade === progress.selectedGrade) ?? GRADES[3];
  const subjectIds: SubjectId[] = ['math', 'science', 'arabic', 'french', 'social'];

  const subjectSummaries = useMemo(
    () =>
      subjectIds.map((sid) => ({
        id: sid,
        meta: SUBJECTS[sid],
        stats: subjectStats(sid),
      })),
    [studentLessons, progress.completedLessons]
  );

  const averageAccuracy = useMemo(() => {
    const active = subjectSummaries.filter((s) => s.stats.accuracy > 0);
    if (active.length === 0) return 0;
    return Math.round(active.reduce((a, b) => a + b.stats.accuracy, 0) / active.length);
  }, [subjectSummaries]);

  const trimesterBreakdown = useMemo(() => {
    const trimesters = ['الثلاثي الأول', 'الثلاثي الثاني', 'الثلاثي الثالث'] as const;
    return trimesters.map((tri) => {
      const list = studentLessons.filter((l) => l.trimester === tri);
      const done = list.filter((l) => Boolean(progress.completedLessons[l.id])).length;
      const percent = list.length > 0 ? Math.round((done / list.length) * 100) : 0;
      return { tri, total: list.length, done, percent };
    });
  }, [studentLessons, progress.completedLessons]);

  const focusGuidance = useMemo(() => {
    const sortedWeak = [...subjectSummaries].sort(
      (a, b) =>
        a.stats.completionPercent * 0.6 +
        a.stats.accuracy * 0.4 -
        (b.stats.completionPercent * 0.6 + b.stats.accuracy * 0.4)
    );
    const weakest = sortedWeak[0];
    const nextLessonForWeakest =
      studentLessons.find(
        (l) => l.subjectId === weakest.id && !progress.completedLessons[l.id]
      ) ??
      studentLessons.find((l) => l.subjectId === weakest.id) ??
      studentLessons[0];
    return { weakest, nextLessonForWeakest };
  }, [subjectSummaries, studentLessons, progress.completedLessons]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrefsError(null);
    setPrefsBanner(null);

    const trimmedEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!consentAccepted) {
      setPrefsError('يرجى الموافقة الصريحة على إقرار خصوصية بيانات الطفل قبل حفظ البريد.');
      return;
    }
    if (!emailPattern.test(trimmedEmail)) {
      setPrefsError('يرجى إدخال عنوان بريد إلكتروني صحيح لولي الأمر.');
      return;
    }

    setSavingPrefs(true);
    try {
      await onSaveParentPrefs({
        parentEmail: trimmedEmail,
        cadence,
        notifyOnBadge,
        notifyOnInactivity,
        includeSubjectDetails,
        consentAccepted: true,
        consentUpdatedAtIso: new Date().toISOString(),
        lastDigestGeneratedIso: parentPrefs.lastDigestGeneratedIso || '',
      });
      setPrefsBanner(
        authUser
          ? 'تم حفظ تفضيلات متابعة ولي الأمر بموثوقية وخصوصية تامّة داخل حسابك السحابي.'
          : 'تم حفظ تفضيلات ولي الأمر محلياً على هذا الجهاز بخصوصية كاملة.'
      );
    } catch (err) {
      setPrefsError(
        err instanceof Error ? err.message : 'تعذّر حفظ إعدادات ولي الأمر حالياً.'
      );
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleClearData = async () => {
    setPrefsError(null);
    setPrefsBanner(null);
    setDigestResult(null);
    await onClearParentPrefs();
    setEmail('');
    setCadence('weekly');
    setConsentAccepted(false);
    setPrefsBanner('تم حذف البريد الإلكتروني وتفضيلات الإشعار نهائياً احترامًا لخصوصيتك.');
  };

  const handleGenerateDigest = async () => {
    setDigestError(null);
    const targetEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!consentAccepted || !emailPattern.test(targetEmail)) {
      setDigestError('تأكّد من إدخال بريد إلكتروني صحيح وتفعيل الموافقة على الخصوصية أولاً.');
      return;
    }

    setGeneratingDigest(true);
    try {
      const response = await fetch('/api/parent-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentEmail: targetEmail,
          studentName: progress.studentName || 'عزيز',
          gradeLabel: gradeMeta.label,
          governorate: progress.schoolGovernorate || 'تونس',
          cadence,
          masteryPercent: overallMasteryPercent,
          accuracyPercent: averageAccuracy,
          points: progress.points,
          streakDays: progress.streakDays,
          completedLessonsCount: completedCount,
          totalLessonsCount: totalLessons,
          earnedBadgesCount,
          includeSubjectDetails,
          consentAccepted: true,
          subjects: subjectSummaries.map((s) => ({
            name: s.meta.name,
            completedLessons: s.stats.completedLessons,
            totalLessons: s.stats.totalLessons,
            completionPercent: s.stats.completionPercent,
            accuracy: s.stats.accuracy,
          })),
        }),
      });

      const data = (await response.json()) as Partial<DigestResponsePayload> & {
        error?: string;
      };
      if (!response.ok || !data.ok || !data.textBody || !data.emlContent) {
        throw new Error(data.error || 'تعذّر إنشاء رسالة المتابعة الدورية.');
      }

      const fullPayload: DigestResponsePayload = {
        ok: true,
        deliveryMode: data.deliveryMode || 'generated_eml',
        subject: data.subject || 'تقرير متابعة ولي الأمر — أكاديمية عزيز',
        textBody: data.textBody,
        emlContent: data.emlContent,
        generatedAtIso: data.generatedAtIso || new Date().toISOString(),
      };
      setDigestResult(fullPayload);

      await onSaveParentPrefs({
        parentEmail: targetEmail,
        cadence,
        notifyOnBadge,
        notifyOnInactivity,
        includeSubjectDetails,
        consentAccepted: true,
        consentUpdatedAtIso: parentPrefs.consentUpdatedAtIso || new Date().toISOString(),
        lastDigestGeneratedIso: fullPayload.generatedAtIso,
      });
    } catch (err) {
      setDigestError(
        err instanceof Error ? err.message : 'حدث خطأ أثناء تحضير التقرير البريدي.'
      );
    } finally {
      setGeneratingDigest(false);
    }
  };

  const handleDownloadEml = () => {
    if (!digestResult) return;
    const blob = new Blob([digestResult.emlContent], {
      type: 'message/rfc822;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_ولي_الأمر_${(progress.studentName || 'عزيز').replace(/\s+/g, '_')}.eml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyDigest = async () => {
    if (!digestResult) return;
    try {
      await navigator.clipboard.writeText(digestResult.textBody);
      setCopiedDigest(true);
      window.setTimeout(() => setCopiedDigest(false), 2000);
    } catch {
      // Ignore clipboard permission failure
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header + Strict Privacy Notice */}
      <div className="bg-gradient-to-l from-white via-white to-indigo-50/50 border-2 border-indigo-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              بوابة متابعة ولي الأمر · حماية وخصوصية معطيات الطفل التونسي
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
              لوحة متابعة الولي وإشعارات البريد الإلكتروني
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              اطّلع على مستوى التقدّم الدقيق لطفلك حسب المواد والثلاثيات، وحدّد دورية إشعارات البريد الإلكتروني مع عزل كامل للبيانات الشخصية.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenReports}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            شهادة التقدير والتقرير القابل للطباعة
          </button>
        </div>

        {/* Privacy Pledge Bar */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-950">
          <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="leading-relaxed">
            <strong>التزام الخصوصية:</strong> يُحفظ البريد الإلكتروني لولي الأمر في نطاق خاص ومشفر لصاحب الحساب فقط، ولا يظهر إطلاقاً في لوحة الصدارة أو للزوار الآخرين، ويمكنك حذفه بنقرة واحدة في أي وقت.
          </div>
        </div>

        {/* Multi-child switcher if logged in with >1 child */}
        {authUser && savedStudents.length > 1 && (
          <div className="pt-2 border-t border-indigo-100 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Users className="w-4 h-4 text-indigo-600" aria-hidden="true" />
              التبديل السريع بين ملفات الأبناء:
            </div>
            <div className="flex flex-wrap gap-2">
              {savedStudents.map((stu) => {
                const isActive = stu.id === activeStudentId;
                const stuGrade = GRADES.find((g) => g.grade === stu.selectedGrade);
                return (
                  <button
                    key={stu.id}
                    type="button"
                    onClick={() => void onSelectSavedStudent(stu.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    {stu.studentName} ({stuGrade?.shortLabel})
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Child Performance KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
          <div className="text-xs font-semibold text-slate-500">تقدّم المنهاج ({gradeMeta.shortLabel})</div>
          <div className="text-2xl font-mono font-bold text-sky-900 tabular-nums">
            {overallMasteryPercent}%
          </div>
          <div className="text-xs text-slate-600 font-mono tabular-nums">
            {completedCount} من {totalLessons} درساً
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
          <div className="text-xs font-semibold text-slate-500">متوسّط الدقة في التمارين</div>
          <div className="text-2xl font-mono font-bold text-emerald-700 tabular-nums">
            {averageAccuracy > 0 ? `${averageAccuracy}%` : '—'}
          </div>
          <div className="text-xs text-slate-600 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            مؤشّر الفهم والاستيعاب
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
          <div className="text-xs font-semibold text-slate-500">النقاط والأوسمة</div>
          <div className="text-2xl font-mono font-bold text-amber-700 tabular-nums">
            {progress.points} نقطة
          </div>
          <div className="text-xs text-slate-600 flex items-center gap-1 font-mono tabular-nums">
            <Award className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
            {earnedBadgesCount} أوسمة مكتسبة
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
          <div className="text-xs font-semibold text-slate-500">المواظبة اليومية</div>
          <div className="text-2xl font-mono font-bold text-orange-600 tabular-nums flex items-center gap-1.5">
            <Flame className="w-5 h-5" aria-hidden="true" />
            {progress.streakDays} أيام
          </div>
          <div className="text-xs text-slate-600 font-mono tabular-nums">
            آخر دخول: {progress.lastActiveDate}
          </div>
        </div>
      </div>

      {/* Main Split: Subject & Trimester Report + Email Settings & Digest */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Detailed Performance & Weak-Spot Guidance */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
              ملخّص الأداء التربوي حسب المواد الخمس
            </h2>

            <div className="space-y-3.5">
              {subjectSummaries.map(({ id, meta, stats }) => (
                <div key={id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className={`font-bold ${meta.accentText}`}>{meta.name}</span>
                    <span className="font-mono text-slate-700 tabular-nums">
                      {stats.completedLessons}/{stats.totalLessons} ({stats.completionPercent}%) · دقة{' '}
                      {stats.accuracy > 0 ? `${stats.accuracy}%` : '—'}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${meta.barColor} transition-all duration-300`}
                      style={{ width: `${stats.completionPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="text-xs font-bold text-slate-700">تقدّم الثلاثيات الثلاثة</div>
              <div className="grid grid-cols-3 gap-2.5 text-center">
                {trimesterBreakdown.map((t) => (
                  <div key={t.tri} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs font-semibold text-slate-700">{t.tri}</div>
                    <div className="text-sm font-mono font-bold text-sky-900 tabular-nums mt-0.5">
                      {t.percent}%
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                      {t.done}/{t.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parent Actionable Guidance */}
            {focusGuidance.nextLessonForWeakest && (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" aria-hidden="true" />
                  توصية مرافقة لولي الأمر
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  تحتاج مادة <strong>{focusGuidance.weakest.meta.name}</strong> إلى دعم بسيط هذا الأسبوع (نسبة الإنجاز الحالية {focusGuidance.weakest.stats.completionPercent}%). يُقترح تشجيع {progress.studentName || 'عزيز'} على إتمام درس «{focusGuidance.nextLessonForWeakest.title}».
                </p>
                <button
                  type="button"
                  onClick={() => onSelectLesson(focusGuidance.nextLessonForWeakest)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg cursor-pointer"
                >
                  فتح الدرس المقترح الآن
                  <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Parent Periodic Email Settings & Instant Digest */}
        <div className="lg:col-span-6 space-y-5">
          <form
            onSubmit={(e) => void handleSavePreferences(e)}
            className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
                  إعدادات الإشعارات البريدية الدورية
                </h2>
              </div>
              {parentPrefs.parentEmail && (
                <button
                  type="button"
                  onClick={() => void handleClearData()}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  حذف البريد والبيانات
                </button>
              )}
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">
                البريد الإلكتروني لولي الأمر
              </span>
              <input
                type="email"
                dir="ltr"
                required
                maxLength={160}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 text-left"
              />
            </label>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">
                وتيرة إرسال التقارير البريدية
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CADENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCadence(opt.id)}
                    className={`p-3 rounded-xl border text-right transition-colors cursor-pointer ${
                      cadence === opt.id
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-950'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <div className="text-xs font-bold">{opt.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{opt.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-1 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSubjectDetails}
                  onChange={(e) => setIncludeSubjectDetails(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <span>تضمين نسب الإتقان التفصيلية لكل مادة داخل الملخّص البريدي</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnBadge}
                  onChange={(e) => setNotifyOnBadge(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <span>تنبيه عند فتح وسام جديد أو شهادة التقدير</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnInactivity}
                  onChange={(e) => setNotifyOnInactivity(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <span>تذكير لطيف عند انقطاع التلميذ لأكثر من 3 أيام متواصلة</span>
              </label>

              <label className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600"
                />
                <span className="leading-relaxed">
                  أوافق كوليّ أمر على استخدام هذا البريد الإلكتروني حصرياً لإصدار تقارير متابعة طفلي ضمن معايير الخصوصية المحمية دون مشاركته مع أي طرف ثالث.
                </span>
              </label>
            </div>

            {prefsError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                {prefsError}
              </div>
            )}

            {prefsBanner && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                {prefsBanner}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="submit"
                disabled={savingPrefs}
                className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
              >
                {savingPrefs ? 'جارٍ الحفظ الآمن...' : 'حفظ تفضيلات الإشعارات'}
              </button>

              <button
                type="button"
                disabled={generatingDigest}
                onClick={() => void handleGenerateDigest()}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs sm:text-sm font-semibold text-sky-900 bg-sky-100 hover:bg-sky-200 border border-sky-300 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                {generatingDigest ? 'جارٍ التحضير...' : 'توليد وإرسال ملخّص الآن'}
              </button>
            </div>
          </form>

          {digestError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800">
              {digestError}
            </div>
          )}

          {digestResult && (
            <div className="bg-white border-2 border-emerald-200 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  {digestResult.deliveryMode === 'webhook_dispatched'
                    ? 'تم إرسال ملخّص المتابعة بنجاح!'
                    : 'رسالة المتابعة الدورية جاهزة للإرسال أو التنزيل (.eml)'}
                </div>
                <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                  {digestResult.generatedAtIso.slice(0, 10)}
                </span>
              </div>

              <div className="text-xs font-bold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                الموضوع: {digestResult.subject}
              </div>

              <pre className="whitespace-pre-wrap text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed max-h-60 overflow-y-auto font-sans">
                {digestResult.textBody}
              </pre>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadEml}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  تنزيل رسالة بريد (.eml)
                </button>

                <a
                  href={`mailto:${encodeURIComponent(email.trim())}?subject=${encodeURIComponent(
                    digestResult.subject
                  )}&body=${encodeURIComponent(digestResult.textBody)}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl"
                >
                  <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                  فتح في تطبيق البريد
                </a>

                <button
                  type="button"
                  onClick={() => void handleCopyDigest()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  {copiedDigest ? 'تم النسخ!' : 'نسخ النص'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
