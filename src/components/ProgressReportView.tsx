import React, { useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Cloud,
  CloudOff,
  Download,
  DownloadCloud,
  FileText,
  Flame,
  GraduationCap,
  HardDrive,
  LogIn,
  LogOut,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  TrendingUp,
  UploadCloud,
  UserCheck,
  Users,
  WifiOff,
} from 'lucide-react';
import { GRADES, LESSONS, SUBJECTS, TUNISIAN_GOVERNORATES } from '../data/tunisianCurriculum';
import { CreateProgressReportInput } from '../services/studentCloudService';
import {
  AzizAcademyDriveBackupPayload,
  connectGoogleDrive,
  downloadBackupFromGoogleDrive,
  DRIVE_BACKUP_FILENAME,
  DriveBackupMetadata,
  findExistingDriveBackup,
  getGoogleDriveConnectedEmail,
  hasDriveAccessToken,
  uploadBackupToGoogleDrive,
} from '../services/googleDriveService';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  CloudSyncStatus,
  GradeLevel,
  Lesson,
  LevelInfo,
  PeerChallengeRecord,
  SavedProgressReport,
  SavedStudentRecord,
  StudentProgress,
  SubjectId,
} from '../types/curriculum';
import { AppreciationCertificate } from './AppreciationCertificate';

interface ProgressReportViewProps {
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
  earnedBadgesCount: number;
  levelInfo: LevelInfo;
  authUser: User | null;
  savedStudents: SavedStudentRecord[];
  activeStudentId: string | null;
  savedReports: SavedProgressReport[];
  peerChallenges?: PeerChallengeRecord[];
  cloudSyncStatus: CloudSyncStatus;
  cloudError: string | null;
  hasPendingSync?: boolean;
  onFlushSyncNow?: () => Promise<void>;
  onRestoreBackup?: (
    prog: StudentProgress,
    reps?: SavedProgressReport[],
    chals?: PeerChallengeRecord[]
  ) => void;
  onSignInWithGoogle: () => Promise<void>;
  onSignOutCloud: () => Promise<void>;
  onSelectSavedStudent: (studentId: string) => Promise<void>;
  onCreateNewStudent: (
    name: string,
    grade: GradeLevel,
    governorate: string
  ) => Promise<void>;
  onDeleteSavedStudent: (studentId: string) => Promise<void>;
  onSaveProgressReport: (input: CreateProgressReportInput) => Promise<string>;
  onDeleteProgressReport: (reportId: string) => Promise<void>;
  onSelectLesson: (lesson: Lesson) => void;
  onOpenParentFollowUp?: () => void;
}

function getAppreciationLabel(percent: number, completed: number): {
  label: string;
  colorClass: string;
} {
  if (completed === 0) {
    return { label: 'لم يبدأ بعد', colorClass: 'text-slate-500 bg-slate-100 border-slate-200' };
  }
  if (percent >= 85) {
    return { label: 'متميّز', colorClass: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
  }
  if (percent >= 70) {
    return { label: 'جيد جداً', colorClass: 'text-sky-800 bg-sky-50 border-sky-200' };
  }
  if (percent >= 50) {
    return { label: 'حسن — قابل للتطوّر', colorClass: 'text-amber-800 bg-amber-50 border-amber-200' };
  }
  return { label: 'يحتاج إلى مزيد من الدعم', colorClass: 'text-rose-800 bg-rose-50 border-rose-200' };
}

export const ProgressReportView: React.FC<ProgressReportViewProps> = ({
  progress,
  studentLessons,
  completedCount,
  totalLessons,
  overallMasteryPercent,
  subjectStats,
  earnedBadgesCount,
  levelInfo,
  authUser,
  savedStudents,
  activeStudentId,
  savedReports,
  peerChallenges = [],
  cloudSyncStatus,
  cloudError,
  hasPendingSync = false,
  onFlushSyncNow,
  onRestoreBackup,
  onSignInWithGoogle,
  onSignOutCloud,
  onSelectSavedStudent,
  onCreateNewStudent,
  onDeleteSavedStudent,
  onSaveProgressReport,
  onDeleteProgressReport,
  onSelectLesson,
  onOpenParentFollowUp,
}) => {
  const isOnline = useOnlineStatus();
  const { canInstall, isInstalled, isOfflineReady, promptInstall } = usePWAInstall();

  const [periodLabel, setPeriodLabel] = useState('التقرير الشامل للمنهاج 2026');
  const [savingReport, setSavingReport] = useState(false);
  const [reportSavedBanner, setReportSavedBanner] = useState<string | null>(null);

  const [driveConnected, setDriveConnected] = useState(() => hasDriveAccessToken());
  const [driveEmail, setDriveEmail] = useState<string | null>(() =>
    getGoogleDriveConnectedEmail()
  );
  const [existingDriveFile, setExistingDriveFile] = useState<DriveBackupMetadata | null>(
    null
  );
  const [driveBusy, setDriveBusy] = useState(false);
  const [driveStatusMsg, setDriveStatusMsg] = useState<string | null>(null);
  const [driveErrorMsg, setDriveErrorMsg] = useState<string | null>(null);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState<GradeLevel>(progress.selectedGrade);
  const [newGov, setNewGov] = useState(progress.schoolGovernorate || 'تونس');
  const [creatingStudent, setCreatingStudent] = useState(false);

  const [confirmDeleteStudentId, setConfirmDeleteStudentId] = useState<string | null>(null);
  const [selectedArchiveReport, setSelectedArchiveReport] =
    useState<SavedProgressReport | null>(null);

  const activeGradeMeta =
    GRADES.find((g) => g.grade === progress.selectedGrade) ?? GRADES[3];

  const subjectIds: SubjectId[] = ['math', 'science', 'arabic', 'french', 'social'];

  const subjectSummaries = useMemo(() => {
    return subjectIds.map((sid) => ({
      id: sid,
      meta: SUBJECTS[sid],
      stats: subjectStats(sid),
    }));
  }, [studentLessons, progress.completedLessons]);

  const averageAccuracy = useMemo(() => {
    const active = subjectSummaries.filter((s) => s.stats.accuracy > 0);
    if (active.length === 0) return 0;
    const sum = active.reduce((acc, s) => acc + s.stats.accuracy, 0);
    return Math.round(sum / active.length);
  }, [subjectSummaries]);

  const trimesterStats = useMemo(() => {
    const trimesters: ('الثلاثي الأول' | 'الثلاثي الثاني' | 'الثلاثي الثالث')[] = [
      'الثلاثي الأول',
      'الثلاثي الثاني',
      'الثلاثي الثالث',
    ];
    return trimesters.map((tri) => {
      const list = studentLessons.filter((l) => l.trimester === tri);
      const done = list.filter((l) => Boolean(progress.completedLessons[l.id])).length;
      const percent = list.length > 0 ? Math.round((done / list.length) * 100) : 0;
      return { trimester: tri, total: list.length, done, percent };
    });
  }, [studentLessons, progress.completedLessons]);

  const { strengthsSummary, recommendationsSummary } = useMemo(() => {
    const withLessons = subjectSummaries.filter((s) => s.stats.completedLessons > 0);
    if (withLessons.length === 0) {
      return {
        strengthsSummary: `بدأ التلميذ ${progress.studentName} رحلته في ${activeGradeMeta.label} بمواظبة ${progress.streakDays} أيام.`,
        recommendationsSummary:
          'يُنصح بالانطلاق بأول درس تفاعلي في كل مادة لبناء قاعدة معطيات دقيقة حول الأداء.',
      };
    }

    const sortedByAcc = [...withLessons].sort((a, b) => b.stats.accuracy - a.stats.accuracy);
    const best = sortedByAcc[0];
    const weakest = [...subjectSummaries].sort(
      (a, b) =>
        a.stats.completionPercent * 0.5 +
        a.stats.accuracy * 0.5 -
        (b.stats.completionPercent * 0.5 + b.stats.accuracy * 0.5)
    )[0];

    const strengths = `أعلى أداء مسجّل في مادة ${best.meta.name} بدقة ${best.stats.accuracy}% وإنجاز ${best.stats.completedLessons}/${best.stats.totalLessons} درساً.`;
    const rec =
      weakest.stats.completedLessons === 0
        ? `يُنصح ببدء استكشاف دروس مادة ${weakest.meta.name} لتحقيق توازن بين المواد الخمس.`
        : weakest.stats.accuracy < 75
        ? `يوصى بمراجعة تمارين ${weakest.meta.name} والتدرّب في بنك التمارين لرفع الدقة الحالية (${weakest.stats.accuracy}%).`
        : `أداء متوازن وممتاز! يُنصح بخوض الامتحان التأليفي الشامل لتعزيز الجاهزية.`;

    return { strengthsSummary: strengths, recommendationsSummary: rec };
  }, [subjectSummaries, progress.studentName, progress.streakDays, activeGradeMeta.label]);

  const nextRecommendedLesson =
    studentLessons.find((l) => !progress.completedLessons[l.id]) ?? studentLessons[0];

  const handleSaveSnapshot = async () => {
    setSavingReport(true);
    setReportSavedBanner(null);
    try {
      const mathS = subjectStats('math');
      const sciS = subjectStats('science');
      const arS = subjectStats('arabic');
      const frS = subjectStats('french');
      const socS = subjectStats('social');
      await onSaveProgressReport({
        studentName: progress.studentName || 'عزيز',
        selectedGrade: progress.selectedGrade,
        schoolGovernorate: progress.schoolGovernorate || 'تونس',
        periodLabel,
        overallMasteryPercent,
        averageAccuracy,
        totalPoints: progress.points,
        streakDays: progress.streakDays,
        completedLessonsCount: completedCount,
        totalLessonsCount: Math.max(1, totalLessons),
        earnedBadgesCount,
        mathMastery: mathS.completionPercent,
        scienceMastery: sciS.completionPercent,
        arabicMastery: arS.completionPercent,
        frenchMastery: frS.completionPercent,
        socialMastery: socS.completionPercent,
        strengthsSummary,
        recommendationsSummary,
      });
      setReportSavedBanner(
        authUser
          ? 'تم حفظ تقرير التقدّم بنجاح في السحابة.'
          : 'تم حفظ نسخة من التقرير محلياً على هذا الجهاز.'
      );
    } finally {
      setSavingReport(false);
    }
  };

  const buildBackupPayload = (): AzizAcademyDriveBackupPayload => ({
    schemaVersion: 1,
    appName: 'أكاديمية عزيز',
    curriculumYear: 2026,
    exportedAtIso: new Date().toISOString(),
    studentProgress: progress,
    savedReports,
    peerChallenges,
    offlineReadyLessonsCount: LESSONS.length,
  });

  const handleConnectDrive = async () => {
    setDriveBusy(true);
    setDriveErrorMsg(null);
    setDriveStatusMsg(null);
    try {
      await connectGoogleDrive();
      setDriveConnected(true);
      setDriveEmail(getGoogleDriveConnectedEmail());
      const existing = await findExistingDriveBackup();
      setExistingDriveFile(existing);
      setDriveStatusMsg(
        existing
          ? `تم ربط Google Drive بنجاح! توجد نسخة سابقة (${existing.modifiedTime.slice(0, 10)}).`
          : 'تم ربط حساب Google Drive بنجاح وجاهز لحفظ نسخة التلميذ.'
      );
    } catch (err) {
      setDriveErrorMsg(
        err instanceof Error ? err.message : 'تعذّر ربط Google Drive. يرجى المحاولة مجدداً.'
      );
    } finally {
      setDriveBusy(false);
    }
  };

  const handleRequestDriveUpload = async () => {
    setDriveErrorMsg(null);
    setDriveStatusMsg(null);
    setDriveBusy(true);
    try {
      if (!hasDriveAccessToken()) {
        await connectGoogleDrive();
        setDriveConnected(true);
        setDriveEmail(getGoogleDriveConnectedEmail());
      }
      const existing = existingDriveFile ?? (await findExistingDriveBackup());
      setExistingDriveFile(existing);
      if (existing) {
        setShowOverwriteConfirm(true);
        setDriveBusy(false);
        return;
      }
      const uploaded = await uploadBackupToGoogleDrive(buildBackupPayload());
      setExistingDriveFile(uploaded);
      setDriveStatusMsg(
        `تم حفظ النسخة الاحتياطية (${DRIVE_BACKUP_FILENAME}) على سحابة Google Drive بنجاح!`
      );
    } catch (err) {
      setDriveErrorMsg(
        err instanceof Error ? err.message : 'تعذّر رفع النسخة الاحتياطية على Google Drive.'
      );
    } finally {
      setDriveBusy(false);
    }
  };

  const handleConfirmOverwriteDrive = async () => {
    if (!existingDriveFile) return;
    setShowOverwriteConfirm(false);
    setDriveBusy(true);
    setDriveErrorMsg(null);
    try {
      const updated = await uploadBackupToGoogleDrive(
        buildBackupPayload(),
        existingDriveFile.id
      );
      setExistingDriveFile(updated);
      setDriveStatusMsg('تم تحديث النسخة الاحتياطية على سحابة Google Drive بنجاح!');
    } catch (err) {
      setDriveErrorMsg(
        err instanceof Error ? err.message : 'تعذّر تحديث النسخة على Google Drive.'
      );
    } finally {
      setDriveBusy(false);
    }
  };

  const handleRestoreFromDrive = async () => {
    setDriveErrorMsg(null);
    setDriveStatusMsg(null);
    setDriveBusy(true);
    try {
      if (!hasDriveAccessToken()) {
        await connectGoogleDrive();
        setDriveConnected(true);
        setDriveEmail(getGoogleDriveConnectedEmail());
      }
      const target = existingDriveFile ?? (await findExistingDriveBackup());
      setExistingDriveFile(target);
      if (!target) {
        setDriveErrorMsg('لم يتم العثور على نسخة احتياطية محفوظة في Google Drive لهذا الحساب.');
        return;
      }
      const payload = await downloadBackupFromGoogleDrive(target.id);
      if (onRestoreBackup) {
        onRestoreBackup(
          payload.studentProgress,
          payload.savedReports,
          payload.peerChallenges
        );
      }
      setDriveStatusMsg(
        `تمت استعادة ملف «${payload.studentProgress.studentName}» بنجاح من Google Drive!`
      );
    } catch (err) {
      setDriveErrorMsg(
        err instanceof Error ? err.message : 'تعذّر تحميل النسخة الاحتياطية من Google Drive.'
      );
    } finally {
      setDriveBusy(false);
    }
  };

  const handleDownloadLocalJson = () => {
    const payload = buildBackupPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = DRIVE_BACKUP_FILENAME;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDriveStatusMsg('تم تنزيل نسخة احتياطية كاملة بصيغة JSON للعمل بدون نت.');
  };

  const handleImportLocalJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setDriveErrorMsg(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as AzizAcademyDriveBackupPayload;
      if (!parsed || !parsed.studentProgress || typeof parsed.studentProgress !== 'object') {
        throw new Error('ملف النسخة الاحتياطية غير صالح.');
      }
      if (onRestoreBackup) {
        onRestoreBackup(
          parsed.studentProgress,
          parsed.savedReports,
          parsed.peerChallenges
        );
      }
      setDriveStatusMsg(
        `تمت استعادة بيانات «${parsed.studentProgress.studentName}» من الملف المحلي بنجاح!`
      );
    } catch (err) {
      setDriveErrorMsg(
        err instanceof Error ? err.message : 'تعذّرت قراءة ملف النسخة الاحتياطية.'
      );
    }
  };

  const handleExportCsv = () => {
    const lines = [
      ['تقرير التقدّم التربوي — أكاديمية عزيز 2026'],
      ['التلميذ', progress.studentName, 'السنة', activeGradeMeta.label, 'الولاية', progress.schoolGovernorate],
      ['الفترة', periodLabel, 'النقاط', String(progress.points), 'نسبة الإتقان', `${overallMasteryPercent}%`],
      [],
      ['المادة', 'الدروس المكتملة', 'إجمالي الدروس', 'نسبة الإنجاز %', 'دقة الإجابات %'],
      ...subjectSummaries.map((s) => [
        s.meta.name,
        String(s.stats.completedLessons),
        String(s.stats.totalLessons),
        String(s.stats.completionPercent),
        String(s.stats.accuracy),
      ]),
      [],
      ['نقاط القوة', strengthsSummary],
      ['التوصيات', recommendationsSummary],
      [],
      ['النشاط الأخير', 'المادة', 'النتيجة', 'النقاط', 'التاريخ'],
      ...progress.activityLog.map((a) => [
        a.title,
        SUBJECTS[a.subjectId].name,
        `${a.score}/${a.total}`,
        String(a.pointsEarned),
        a.date,
      ]),
    ];

    const csvContent =
      '\uFEFF' +
      lines
        .map((row) =>
          row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_${(progress.studentName || 'تلميذ').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreatingStudent(true);
    try {
      await onCreateNewStudent(newName.trim(), newGrade, newGov);
      setNewName('');
      setShowAddStudent(false);
    } finally {
      setCreatingStudent(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Cloud Account & Multi-Student Management Panel */}
      <div className="no-print bg-white border-2 border-sky-100 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sky-100">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700">
              {authUser ? (
                <Cloud className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              ) : (
                <CloudOff className="w-4 h-4 text-slate-400" aria-hidden="true" />
              )}
              {authUser
                ? cloudSyncStatus === 'syncing'
                  ? 'جارٍ مزامنة بيانات التلاميذ مع السحابة...'
                  : 'الحفظ السحابي مفعّل — بيانات التلاميذ محفوظة عبر الأجهزة'
                : 'وضع الحفظ المحلي — سجّل الدخول لحفظ ملفات التلاميذ سحابياً'}
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
              حفظ بيانات التلاميذ وتقارير التقدّم
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              أنشئ ملفاً لكل تلميذ، احفظ درجاته ودروسه تلقائياً، وأصدر تقارير متابعة بيداغوجية مفصّلة للأولياء والمربين.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {!authUser ? (
              <button
                type="button"
                onClick={() => void onSignInWithGoogle()}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                حفظ ومزامنة بحساب Google
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg border border-slate-200">
                  {authUser.displayName || authUser.email}
                </span>
                {hasPendingSync && onFlushSyncNow && (
                  <button
                    type="button"
                    onClick={() => void onFlushSyncNow()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                  >
                    مزامنة التعديلات الآن
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowAddStudent((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  إضافة تلميذ جديد
                </button>
                <button
                  type="button"
                  onClick={() => void onSignOutCloud()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  خروج
                </button>
              </div>
            )}
          </div>
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

        {/* Add New Student Form */}
        {showAddStudent && (
          <form
            onSubmit={handleCreateStudentSubmit}
            className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
          >
            <label className="space-y-1">
              <span className="block text-xs font-semibold text-slate-700">اسم التلميذ</span>
              <input
                type="text"
                required
                maxLength={60}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="مثال: سلمى أو يوسف"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-sky-600"
              />
            </label>
            <label className="space-y-1">
              <span className="block text-xs font-semibold text-slate-700">السنة الدراسية</span>
              <select
                value={newGrade}
                onChange={(e) => setNewGrade(Number(e.target.value) as GradeLevel)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg cursor-pointer"
              >
                {GRADES.map((g) => (
                  <option key={g.grade} value={g.grade}>
                    {g.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="block text-xs font-semibold text-slate-700">الولاية</span>
              <select
                value={newGov}
                onChange={(e) => setNewGov(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg cursor-pointer"
              >
                {TUNISIAN_GOVERNORATES.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={creatingStudent}
                className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer disabled:opacity-60"
              >
                {creatingStudent ? 'جارٍ الحفظ...' : 'إنشاء وحفظ'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddStudent(false)}
                className="py-2 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}

        {/* Saved Students List (when signed in) */}
        {authUser && savedStudents.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Users className="w-4 h-4 text-sky-600" aria-hidden="true" />
              ملفات التلاميذ المحفوظة ({savedStudents.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedStudents.map((stu) => {
                const isActive = stu.id === activeStudentId;
                const stuGrade = GRADES.find((g) => g.grade === stu.selectedGrade);
                const doneLessonsCount = Object.keys(stu.completedLessons || {}).length;

                return (
                  <div
                    key={stu.id}
                    className={`p-3.5 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-sky-50 border-sky-500'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => void onSelectSavedStudent(stu.id)}
                      className="flex-1 min-w-0 text-right space-y-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-sky-600' : 'text-slate-400'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="text-sm font-display font-bold text-slate-900 truncate">
                          {stu.studentName}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-mono tabular-nums truncate">
                        {stuGrade?.shortLabel} · {stu.points} نقطة · {doneLessonsCount} درساً
                      </div>
                    </button>

                    {savedStudents.length > 1 && (
                      <div className="shrink-0">
                        {confirmDeleteStudentId === stu.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                void onDeleteSavedStudent(stu.id);
                                setConfirmDeleteStudentId(null);
                              }}
                              className="px-2 py-1 text-xs font-semibold bg-rose-600 text-white rounded-md cursor-pointer"
                            >
                              حذف
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteStudentId(null)}
                              className="px-2 py-1 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-md cursor-pointer"
                            >
                              لا
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteStudentId(stu.id)}
                            aria-label={`حذف ملف ${stu.studentName}`}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Printable & Saveable Pedagogical Progress Report Card */}
      <div className="report-printable bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-700">
              <FileText className="w-4 h-4" aria-hidden="true" />
              تقرير التقدّم البيداغوجي — المنهاج التونسي الرسمي 2026
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900">
              التلميذ: {progress.studentName || 'عزيز'} · {activeGradeMeta.label}
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 flex flex-wrap items-center gap-3">
              <span>الولاية: {progress.schoolGovernorate}</span>
              <span aria-hidden="true">·</span>
              <span>
                المستوى {levelInfo.level}: {levelInfo.title}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                تاريخ الإصدار: {new Date().toISOString().slice(0, 10)}
              </span>
            </div>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2.5">
            <select
              aria-label="فترة التقرير"
              value={periodLabel}
              onChange={(e) => setPeriodLabel(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 cursor-pointer"
            >
              <option value="التقرير الشامل للمنهاج 2026">التقرير الشامل للمنهاج 2026</option>
              <option value="تقرير الثلاثي الأول">تقرير الثلاثي الأول</option>
              <option value="تقرير الثلاثي الثاني">تقرير الثلاثي الثاني</option>
              <option value="تقرير الثلاثي الثالث">تقرير الثلاثي الثالث</option>
              <option value="متابعة أسبوعية للأولياء">متابعة أسبوعية للأولياء</option>
            </select>

            <button
              type="button"
              disabled={savingReport}
              onClick={() => void handleSaveSnapshot()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              {savingReport ? 'جارٍ الحفظ...' : 'حفظ نسخة من التقرير'}
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              تصدير CSV
            </button>

            <button
              type="button"
              onClick={() => {
                document.body.classList.remove('print-certificate-mode');
                window.print();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              طباعة التقرير / PDF
            </button>

            {onOpenParentFollowUp && (
              <button
                type="button"
                onClick={onOpenParentFollowUp}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              >
                <Users className="w-4 h-4" aria-hidden="true" />
                متابعة ولي الأمر
              </button>
            )}
          </div>
        </div>

        {reportSavedBanner && (
          <div className="no-print p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
            {reportSavedBanner}
          </div>
        )}

        {/* Executive KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-800">
              <GraduationCap className="w-4 h-4" aria-hidden="true" />
              إتقان البرنامج السنوي
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
              {overallMasteryPercent}%
            </div>
            <div className="text-xs text-slate-600 font-mono tabular-nums">
              {completedCount} من {totalLessons} درساً
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
              معدل الدقة في التمارين
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
              {averageAccuracy > 0 ? `${averageAccuracy}%` : '—'}
            </div>
            <div className="text-xs text-slate-600">متوسط النتائج المحقّقة</div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              الرصيد والأوسمة
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
              {progress.points} نقطة
            </div>
            <div className="text-xs text-slate-600 font-mono tabular-nums">
              {earnedBadgesCount} أوسمة مكتسبة
            </div>
          </div>

          <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-800">
              <Flame className="w-4 h-4" aria-hidden="true" />
              المواظبة والالتزام
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
              {progress.streakDays} أيام
            </div>
            <div className="text-xs text-slate-600 font-mono tabular-nums">
              آخر نشاط: {progress.lastActiveDate}
            </div>
          </div>
        </div>

        {/* Subject-by-Subject Diagnostic Breakdown */}
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-display font-bold text-slate-900">
            التشخيص التفصيلي حسب المادة الدراسية
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-right text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
                <tr>
                  <th className="py-3 px-4 font-semibold">المادة</th>
                  <th className="py-3 px-4 font-semibold">الدروس المنجزة</th>
                  <th className="py-3 px-4 font-semibold">نسبة الإنجاز</th>
                  <th className="py-3 px-4 font-semibold">دقة الإجابات</th>
                  <th className="py-3 px-4 font-semibold">التقدير البيداغوجي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjectSummaries.map(({ id, meta, stats }) => {
                  const appreciation = getAppreciationLabel(
                    stats.accuracy,
                    stats.completedLessons
                  );
                  return (
                    <tr key={id}>
                      <td className="py-3.5 px-4">
                        <div className={`font-display font-bold ${meta.accentText}`}>
                          {meta.name}
                        </div>
                        <div className="text-xs text-slate-500" dir="ltr">
                          {meta.frenchName}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums text-slate-800 font-semibold">
                        {stats.completedLessons} / {stats.totalLessons}
                      </td>
                      <td className="py-3.5 px-4 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${meta.barColor}`}
                              style={{ width: `${stats.completionPercent}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-800 tabular-nums">
                            {stats.completionPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 tabular-nums">
                        {stats.accuracy > 0 ? `${stats.accuracy}%` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-lg border ${appreciation.colorClass}`}
                        >
                          {appreciation.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trimester Coverage + Pedagogical Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
            <h3 className="text-sm sm:text-base font-display font-bold text-slate-900">
              التغطية حسب الثلاثيات
            </h3>
            <div className="space-y-3">
              {trimesterStats.map((t) => (
                <div key={t.trimester} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{t.trimester}</span>
                    <span className="font-mono text-slate-900 tabular-nums">
                      {t.done} / {t.total} ({t.percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white border border-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-600 transition-all duration-300"
                      style={{ width: `${t.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <h3 className="text-sm sm:text-base font-display font-bold text-slate-900">
              القراءة البيداغوجية والتوصيات التربوية
            </h3>
            <div className="space-y-3 text-sm">
              <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1">
                <div className="text-xs font-bold text-emerald-700">نقاط القوة المسجّلة</div>
                <p className="text-slate-700 leading-relaxed">{strengthsSummary}</p>
              </div>
              <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1">
                <div className="text-xs font-bold text-sky-700">توصية المرافقة التربوية</div>
                <p className="text-slate-700 leading-relaxed">{recommendationsSummary}</p>
              </div>
            </div>

            {nextRecommendedLesson && (
              <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="text-xs text-slate-600">
                  الدرس المقترح القادم:{' '}
                  <strong className="text-slate-900">{nextRecommendedLesson.title}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectLesson(nextRecommendedLesson)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer"
                >
                  افتح الدرس
                  <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Virtual Appreciation Certificate (Unlocked at 3+ Badges) */}
      <AppreciationCertificate
        studentName={progress.studentName || 'عزيز'}
        gradeLabel={activeGradeMeta.label}
        governorate={progress.schoolGovernorate || 'تونس'}
        points={progress.points}
        streakDays={progress.streakDays}
        overallMasteryPercent={overallMasteryPercent}
        unlockedBadges={progress.unlockedBadges}
      />

      {/* Offline PWA & Google Drive Cloud Backup Card */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700">
              {!isOnline ? (
                <WifiOff className="w-4 h-4 text-amber-600" aria-hidden="true" />
              ) : (
                <HardDrive className="w-4 h-4 text-teal-600" aria-hidden="true" />
              )}
              {!isOnline
                ? 'أنت الآن في وضع العمل بدون إنترنت — جميع الدروس متاحة محلياً'
                : isOfflineReady
                ? 'المنصّة مخبّأة وجاهزة للعمل بدون إنترنت على هذا الجهاز (PWA)'
                : 'العمل بدون إنترنت والنسخ الاحتياطي الشخصي على Google Drive'}
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900">
              العمل بدون إنترنت وحفظ النسخة الاحتياطية على سحابة Google Drive
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              احفظ نسخة احتياطية كاملة لتقدّمك ودروسك الـ {LESSONS.length} على حساب Google Drive الخاص بك لاسترجاعها من أي جهاز في أي وقت، أو ثبّت المنصة كتطبيق يعمل دون اتصال بالإنترنت.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {canInstall && (
              <button
                type="button"
                onClick={() => void promptInstall()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                <DownloadCloud className="w-4 h-4" aria-hidden="true" />
                تثبيت للعمل دون نت
              </button>
            )}
            {isInstalled && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                مثبّت كتطبيق دون نت
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Google Drive Actions */}
          <div className="lg:col-span-8 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-sky-700" aria-hidden="true" />
                مزامنة سحابة التلميذ الخاصة (Google Drive)
              </div>
              {driveConnected && driveEmail && (
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {driveEmail}
                </span>
              )}
            </div>

            {existingDriveFile && (
              <div className="text-xs text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200 font-mono tabular-nums">
                الملف على Drive: {existingDriveFile.name} · آخر تعديل:{' '}
                {existingDriveFile.modifiedTime.slice(0, 10)}
              </div>
            )}

            {showOverwriteConfirm && existingDriveFile && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 space-y-2.5">
                <p className="text-xs font-semibold text-amber-950">
                  توجد نسخة احتياطية سابقة على Google Drive بتاريخ{' '}
                  <span className="font-mono">{existingDriveFile.modifiedTime.slice(0, 10)}</span>. هل تريد استبدالها ببياناتك الحالية؟
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={driveBusy}
                    onClick={() => void handleConfirmOverwriteDrive()}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg cursor-pointer"
                  >
                    نعم، استبدال النسخة السابقة
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOverwriteConfirm(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2.5">
              {!driveConnected && (
                <button
                  type="button"
                  disabled={driveBusy || !isOnline}
                  onClick={() => void handleConnectDrive()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-sky-50 border border-slate-300 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  <HardDrive className="w-4 h-4 text-sky-600" aria-hidden="true" />
                  ربط حساب Google Drive
                </button>
              )}

              <button
                type="button"
                disabled={driveBusy || !isOnline}
                onClick={() => void handleRequestDriveUpload()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" aria-hidden="true" />
                {driveBusy ? 'جارٍ المعالجة...' : 'حفظ النسخة على Google Drive'}
              </button>

              <button
                type="button"
                disabled={driveBusy || !isOnline}
                onClick={() => void handleRestoreFromDrive()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-sky-900 bg-sky-100 hover:bg-sky-200 border border-sky-300 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                استعادة من Google Drive
              </button>
            </div>
          </div>

          {/* Local Offline JSON Package */}
          <div className="lg:col-span-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-sm font-display font-bold text-slate-900">
              ملف الحفظ المحلّي (بدون إنترنت)
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              نزّل ملف النسخة الشاملة على جهازك أو أعد استيراده حتى في غياب الاتصال.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadLocalJson}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                تصدير ملف JSON
              </button>

              <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl cursor-pointer">
                <UploadCloud className="w-3.5 h-3.5" aria-hidden="true" />
                استيراد ملف JSON
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => void handleImportLocalJson(e)}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        </div>

        {driveStatusMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
            {driveStatusMsg}
          </div>
        )}

        {driveErrorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800">
            {driveErrorMsg}
          </div>
        )}
      </div>

      {/* Saved Reports Archive */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-700" aria-hidden="true" />
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900">
              أرشيف تقارير التقدّم المحفوظة ({savedReports.length})
            </h2>
          </div>
          {!authUser && (
            <span className="text-xs text-slate-500">
              محفوظة محلياً · سجّل بحساب Google للمزامنة السحابية
            </span>
          )}
        </div>

        {savedReports.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500 border border-dashed border-slate-200 rounded-xl">
            لا توجد نسخ تقارير محفوظة بعد. اضغط على «حفظ نسخة من التقرير» أعلاه لتوثيق تقدّم التلميذ عبر الزمن.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedReports.map((rep) => {
              const repGrade = GRADES.find((g) => g.grade === rep.selectedGrade);
              const isExpanded = selectedArchiveReport?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-sky-700">{rep.periodLabel}</div>
                      <div className="text-sm font-display font-bold text-slate-900">
                        {rep.studentName} · {repGrade?.shortLabel}
                      </div>
                      <div className="text-xs text-slate-500 font-mono tabular-nums">
                        {rep.createdAtIso.slice(0, 10)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedArchiveReport(isExpanded ? null : rep)
                        }
                        className="px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg cursor-pointer"
                      >
                        {isExpanded ? 'إخفاء' : 'التفاصيل'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDeleteProgressReport(rep.id)}
                        aria-label="حذف التقرير المحفوظ"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <div className="text-slate-500">الإتقان</div>
                      <div className="font-mono font-bold text-slate-900 tabular-nums">
                        {rep.overallMasteryPercent}%
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <div className="text-slate-500">الدقة</div>
                      <div className="font-mono font-bold text-emerald-700 tabular-nums">
                        {rep.averageAccuracy}%
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <div className="text-slate-500">الدروس</div>
                      <div className="font-mono font-bold text-slate-900 tabular-nums">
                        {rep.completedLessonsCount}/{rep.totalLessonsCount}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <div className="text-slate-500">النقاط</div>
                      <div className="font-mono font-bold text-amber-700 tabular-nums">
                        {rep.totalPoints}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-200 space-y-2 text-xs text-slate-700">
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono tabular-nums">
                        <span>الرياضيات: {rep.mathMastery}%</span>
                        <span>الإيقاظ: {rep.scienceMastery}%</span>
                        <span>العربية: {rep.arabicMastery}%</span>
                        <span>الفرنسية: {rep.frenchMastery}%</span>
                        <span>الاجتماعيات: {rep.socialMastery ?? 0}%</span>
                      </div>
                      <p>
                        <strong>نقاط القوة:</strong> {rep.strengthsSummary}
                      </p>
                      <p>
                        <strong>التوصيات:</strong> {rep.recommendationsSummary}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
