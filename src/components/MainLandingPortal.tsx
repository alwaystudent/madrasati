import React, { useMemo, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calculator,
  CheckCircle2,
  Compass,
  FileText,
  FlaskConical,
  GraduationCap,
  Landmark,
  Languages,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Plus,
  Sparkles,
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import {
  GRADES,
  LESSONS,
  SUBJECTS,
  TUNISIAN_GOVERNORATES,
} from '../data/tunisianCurriculum';
import {
  CloudSyncStatus,
  GradeLevel,
  SavedStudentRecord,
  SubjectId,
} from '../types/curriculum';

interface MainLandingPortalProps {
  initialName: string;
  initialGrade: GradeLevel;
  initialGovernorate: string;
  authUser: FirebaseUser | null;
  savedStudents: SavedStudentRecord[];
  cloudSyncStatus: CloudSyncStatus;
  cloudError: string | null;
  onSignInWithGoogle: () => Promise<void>;
  onSignOutCloud: () => Promise<void>;
  onSelectSavedStudent: (studentId: string) => Promise<void>;
  onCreateNewStudent: (
    name: string,
    grade: GradeLevel,
    governorate: string
  ) => Promise<void>;
  onCompleteDirectLogin: (
    name: string,
    grade: GradeLevel,
    governorate: string
  ) => void;
  onOpenLegal?: (tab: 'privacy' | 'terms') => void;
}

export const MainLandingPortal: React.FC<MainLandingPortalProps> = ({
  initialName,
  initialGrade,
  initialGovernorate,
  authUser,
  savedStudents,
  cloudSyncStatus,
  cloudError,
  onSignInWithGoogle,
  onSignOutCloud,
  onSelectSavedStudent,
  onCreateNewStudent,
  onCompleteDirectLogin,
  onOpenLegal,
}) => {
  const [name, setName] = useState(initialName || 'عزيز');
  const [grade, setGrade] = useState<GradeLevel>(initialGrade);
  const [governorate, setGovernorate] = useState(initialGovernorate || 'تونس');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showNewCloudStudentForm, setShowNewCloudStudentForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [scienceImgFailed, setScienceImgFailed] = useState(false);
  const [mathImgFailed, setMathImgFailed] = useState(false);
  const [mascotImgFailed, setMascotImgFailed] = useState(false);

  const selectedGradeMeta = GRADES.find((g) => g.grade === grade) ?? GRADES[3];

  const gradeStats = useMemo(() => {
    const list = LESSONS.filter((l) => l.grade === grade);
    const exercisesCount = list.reduce((sum, l) => sum + l.exercises.length, 0);
    return {
      lessonsCount: list.length,
      exercisesCount,
    };
  }, [grade]);

  const subjectCards = useMemo(() => {
    const ids: SubjectId[] = ['math', 'science', 'arabic', 'french', 'social'];
    return ids.map((sid) => {
      const allForSubj = LESSONS.filter((l) => l.subjectId === sid);
      const gradeForSubj = allForSubj.filter((l) => l.grade === grade);
      const exercisesTotal = allForSubj.reduce((s, l) => s + l.exercises.length, 0);
      return {
        id: sid,
        meta: SUBJECTS[sid],
        totalLessons: allForSubj.length,
        gradeLessons: gradeForSubj.length,
        totalExercises: exercisesTotal,
      };
    });
  }, [grade]);

  const totalPlatformLessons = LESSONS.length;
  const totalPlatformExercises = useMemo(
    () => LESSONS.reduce((s, l) => s + l.exercises.length, 0),
    []
  );

  const scrollToSection = (id: string) => {
    setMobileNavOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim() || 'عزيز';
    if (authUser && showNewCloudStudentForm) {
      setSubmitting(true);
      try {
        await onCreateNewStudent(cleanName, grade, governorate);
      } finally {
        setSubmitting(false);
      }
      return;
    }
    onCompleteDirectLogin(cleanName, grade, governorate);
  };

  const subjectIcon = (id: SubjectId) => {
    switch (id) {
      case 'math':
        return <Calculator className="w-5 h-5 text-sky-700 shrink-0" aria-hidden="true" />;
      case 'science':
        return <FlaskConical className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />;
      case 'arabic':
        return <BookOpen className="w-5 h-5 text-amber-700 shrink-0" aria-hidden="true" />;
      case 'french':
        return <Languages className="w-5 h-5 text-indigo-700 shrink-0" aria-hidden="true" />;
      case 'social':
        return <Landmark className="w-5 h-5 text-teal-700 shrink-0" aria-hidden="true" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-800 bg-[#f4faff]">
      {/* Strict 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b-2 border-sky-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Logo & Wordmark */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="shrink-0 cursor-pointer"
          >
            <BrandLogo size="sm" />
          </button>

          {/* Zone 2: 4 Concise Single-Line Nav Links */}
          <nav
            aria-label="التنقل الرئيسي"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
          >
            <button
              type="button"
              onClick={() => scrollToSection('curriculum')}
              className="py-1 hover:text-slate-900 hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              المواد والمناهج
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="py-1 hover:text-slate-900 hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              المختبرات والفرنسية
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('grades')}
              className="py-1 hover:text-slate-900 hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              السنوات الدراسية
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('reports')}
              className="py-1 hover:text-slate-900 hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              تقارير التقدّم
            </button>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => scrollToSection('student-login')}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              دخول التلميذ
            </button>

            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-label={mobileNavOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
            <button
              type="button"
              onClick={() => scrollToSection('curriculum')}
              className="block w-full text-right px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              المواد والمناهج
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="block w-full text-right px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              المختبرات والفرنسية
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('grades')}
              className="block w-full text-right px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              السنوات الدراسية
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('reports')}
              className="block w-full text-right px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              تقارير التقدّم
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('student-login')}
              className="w-full mt-1 px-4 py-2.5 text-sm font-semibold text-white bg-sky-600 rounded-lg cursor-pointer"
            >
              دخول التلميذ
            </button>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Split + Dedicated Student Login Area */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-7 pb-10 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
            {/* Right Column (7 cols): Proposition & Visual Anchor */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="text-sm font-semibold text-sky-700">
                  أكاديمية عزيز · التعليم الابتدائي التونسي · السنوات 3 إلى 6 · 2026
                </div>
                <h1 className="text-2xl sm:text-[1.85rem] lg:text-[2.05rem] font-display font-bold text-slate-900 leading-snug text-balance">
                  بوابة التعلّم الممتع بأصالة جربة لنجاح كل تلميذ
                </h1>
                <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed max-w-2xl">
                  عالم تفاعلي مشرق يجمع المواد الخمس بمختبرات الألعاب العلمية والرياضية، المواد الاجتماعية، استوديو الرسوم المتحركة للسنوات 3 إلى 6، متابعة الأولياء، وحفظ على Google Drive للعمل بدون نت.
                </p>
              </div>

              {/* Clean Hero Visual Container */}
              <div className="relative min-h-[260px] sm:min-h-[330px] flex-1 rounded-3xl overflow-hidden border-2 border-sky-200 bg-sky-50 shadow-xs">
                {!heroImgFailed ? (
                  <>
                    <img
                      src="/src/assets/images/hero_djerba_palm_1795261535045.jpg"
                      alt="فضاء تعلّم مشرق بنخلة خضراء ومعمار جزيرة جربة وكراسات التلاميذ"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgFailed(true)}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-sky-950/80 via-sky-950/35 to-transparent p-5 sm:p-6 text-white space-y-1">
                      <div className="text-xs sm:text-sm font-semibold text-amber-200">
                        {selectedGradeMeta.label} · {gradeStats.lessonsCount} درساً ·{' '}
                        {gradeStats.exercisesCount} نشاطاً وتمريناً
                      </div>
                      <div className="text-base sm:text-lg font-display font-bold leading-snug">
                        {selectedGradeMeta.subtitle}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-white bg-sky-700">
                    <BookOpen className="w-12 h-12 text-amber-200 mb-3" aria-hidden="true" />
                    <div className="text-xl font-display font-bold">أكاديمية عزيز</div>
                    <p className="text-sm text-sky-100 mt-1 max-w-md">
                      {selectedGradeMeta.label} — {gradeStats.lessonsCount} درساً تفاعلياً
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Left Column (5 cols): Dedicated Student Login Zone */}
            <div
              id="student-login"
              className="lg:col-span-5 bg-gradient-to-b from-white via-white to-amber-50/40 border-2 border-sky-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-xs"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-sky-100">
                  <div className="space-y-1">
                    <div className="text-xs sm:text-sm font-semibold text-amber-700">
                      أهلاً بصديقنا النجيب!
                    </div>
                    <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900">
                      منطقة دخول التلميذ
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                      سجّل دخولك لحفظ نقاطك وأوسمتك، أو ادخل مباشرة باسمك وسنتك الدراسية.
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-300 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                    {!mascotImgFailed ? (
                      <img
                        src="/src/assets/images/mascot_fanak_fox_1795189779395.jpg"
                        alt="فنك الذكي صديق التلاميذ"
                        referrerPolicy="no-referrer"
                        onError={() => setMascotImgFailed(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Compass className="w-7 h-7 text-amber-600" aria-hidden="true" />
                    )}
                  </div>
                </div>

                {/* Cloud Google Auth Block */}
                {!authUser ? (
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => void onSignInWithGoogle()}
                      disabled={cloudSyncStatus === 'syncing'}
                      className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3 text-sm font-semibold text-slate-900 bg-slate-50 hover:bg-sky-50 border border-slate-300 hover:border-sky-400 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <LogIn className="w-4 h-4 text-sky-600 shrink-0" aria-hidden="true" />
                      <span>
                        {cloudSyncStatus === 'syncing'
                          ? 'جارٍ التحقق من الحساب...'
                          : 'تسجيل الدخول بحساب Google لحفظ البيانات'}
                      </span>
                    </button>
                    {cloudError && (
                      <div className="text-xs font-medium text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5 space-y-2">
                        <p>{cloudError}</p>
                        <a
                          href={typeof window !== 'undefined' ? window.location.href : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-sky-800 hover:underline"
                        >
                          فتح المنصة في نافذة متصفّح مستقلة لتسجيل الدخول
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <div className="font-bold text-sky-900 truncate">
                          حساب متّصل: {authUser.displayName || authUser.email}
                        </div>
                        <div className="text-sky-700">ملفات التلاميذ محفوظة سحابياً</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => void onSignOutCloud()}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 shrink-0 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                        خروج
                      </button>
                    </div>

                    {savedStudents.length > 0 && !showNewCloudStudentForm && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <Users className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                          اختر ملف التلميذ للدخول الفوري:
                        </div>
                        <div className="space-y-2 max-h-44 overflow-y-auto pl-1">
                          {savedStudents.map((stu) => {
                            const sGrade = GRADES.find((g) => g.grade === stu.selectedGrade);
                            const doneCount = Object.keys(stu.completedLessons || {}).length;
                            return (
                              <button
                                key={stu.id}
                                type="button"
                                onClick={() => void onSelectSavedStudent(stu.id)}
                                className="w-full p-2.5 rounded-xl bg-white hover:bg-sky-100/60 border border-sky-200 text-right flex items-center justify-between gap-3 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <UserCheck
                                    className="w-4 h-4 text-sky-600 shrink-0"
                                    aria-hidden="true"
                                  />
                                  <div className="min-w-0">
                                    <div className="text-sm font-display font-bold text-slate-900 truncate">
                                      {stu.studentName}
                                    </div>
                                    <div className="text-xs text-slate-500 font-mono tabular-nums">
                                      {sGrade?.shortLabel} · {stu.points} نقطة · {doneCount} درساً
                                    </div>
                                  </div>
                                </div>
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 shrink-0">
                                  دخول
                                  <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setName('');
                            setShowNewCloudStudentForm(true);
                          }}
                          className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-sky-800 bg-white hover:bg-sky-50 border border-dashed border-sky-300 rounded-xl cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          تسجيل تلميذ جديد في هذا الحساب
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Direct Student Form (Shown for Guest OR when creating a new student in Cloud Account) */}
                {(!authUser || savedStudents.length === 0 || showNewCloudStudentForm) && (
                  <form onSubmit={handleDirectSubmit} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">
                        {authUser && showNewCloudStudentForm
                          ? 'بيانات التلميذ الجديد'
                          : 'أو الدخول المباشر ببيانات التلميذ'}
                      </span>
                      {authUser && showNewCloudStudentForm && savedStudents.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowNewCloudStudentForm(false)}
                          className="text-xs font-semibold text-sky-700 hover:underline cursor-pointer"
                        >
                          العودة للقائمة
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="block space-y-1">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <User className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                          اسم التلميذ
                        </span>
                        <input
                          type="text"
                          required
                          maxLength={60}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="مثال: عزيز"
                          className="w-full px-3 py-2.5 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-sky-600"
                        />
                      </label>

                      <label className="block space-y-1">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                          الولاية
                        </span>
                        <select
                          value={governorate}
                          onChange={(e) => setGovernorate(e.target.value)}
                          className="w-full px-3 py-2.5 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-sky-600 cursor-pointer"
                        >
                          {TUNISIAN_GOVERNORATES.map((gov) => (
                            <option key={gov} value={gov}>
                              {gov}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="space-y-1.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <GraduationCap className="w-4 h-4 text-sky-600" aria-hidden="true" />
                        اختر السنة الدراسية
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {GRADES.map((g) => {
                          const selected = g.grade === grade;
                          return (
                            <button
                              key={g.grade}
                              type="button"
                              onClick={() => setGrade(g.grade)}
                              className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center justify-between gap-2 ${
                                selected
                                  ? 'bg-sky-50 border-sky-600 text-sky-950'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-sky-300'
                              }`}
                            >
                              <span>{g.shortLabel}</span>
                              {selected && (
                                <CheckCircle2
                                  className="w-4 h-4 text-sky-600 shrink-0"
                                  aria-hidden="true"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
                    >
                      <span>
                        {submitting
                          ? 'جارٍ إنشاء الملف...'
                          : `ابدأ الدراسة في ${selectedGradeMeta.shortLabel}`}
                      </span>
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </form>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between gap-2">
                <span>مخصّص حسب سنتك الدراسية</span>
                <span className="font-mono tabular-nums text-slate-700 font-semibold">
                  منهاج 2026
                </span>
              </div>
            </div>
          </div>

          {/* 4-Column Quantitative Proof Strip Below Hero */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-interactive p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-white border-2 border-sky-200">
              <div className="text-xs sm:text-sm font-semibold text-sky-800">الدروس والأنشطة 2026</div>
              <div className="mt-1 text-xl sm:text-2xl font-mono font-bold text-slate-900 tabular-nums">
                {totalPlatformLessons} درساً
              </div>
              <div className="mt-0.5 text-xs font-medium text-slate-600">تشمل 104 أنشطة إضافية ومبسّطة</div>
            </div>
            <div className="card-interactive p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200">
              <div className="text-xs sm:text-sm font-semibold text-amber-800">بنك الأنشطة والتمارين</div>
              <div className="mt-1 text-xl sm:text-2xl font-mono font-bold text-amber-800 tabular-nums">
                {totalPlatformExercises} نشاطاً
              </div>
              <div className="mt-0.5 text-xs font-medium text-slate-600">في 5 مواد مع مسار الدعم الميسّر</div>
            </div>
            <div className="card-interactive p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-200">
              <div className="text-xs sm:text-sm font-semibold text-indigo-800">المحتوى المرئي والسنوات</div>
              <div className="mt-1 text-xl sm:text-2xl font-mono font-bold text-slate-900 tabular-nums">
                3 إلى 6 ابتدائي
              </div>
              <div className="mt-0.5 text-xs font-medium text-slate-600">استوديو رسوم متحركة لجميع الأقسام</div>
            </div>
            <div className="card-interactive p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200">
              <div className="text-xs sm:text-sm font-semibold text-emerald-800">العمل بدون نت والسحابة</div>
              <div className="mt-1 text-xl sm:text-2xl font-mono font-bold text-emerald-800 tabular-nums">
                PWA + Drive
              </div>
              <div className="mt-0.5 text-xs font-medium text-slate-600">يعمل دون إنترنت مع Google Drive</div>
            </div>
          </div>
        </section>

        {/* Section 1: 5 Core Curriculum Subjects */}
        <section id="curriculum" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs sm:text-sm font-semibold text-sky-700">01. المواد الأساسية الخمس</div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                محتوى شامل يغطّي الثلاثيات الثلاث والمواد الاجتماعية 2026
              </h2>
            </div>
            <p className="text-sm font-medium text-slate-600 max-w-md">
              تمارين تفاعلية مبسّطة مع صوت ناطق ومساعد ودود لمرافقة التلاميذ في كل خطوة.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {subjectCards.map(({ id, meta, totalLessons, gradeLessons, totalExercises }) => (
              <div
                key={id}
                className={`card-interactive bg-white border-2 ${meta.accentBorder} rounded-2xl p-5 flex flex-col justify-between space-y-4`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`w-11 h-11 rounded-2xl ${meta.accentBg} border ${meta.accentBorder} flex items-center justify-center shrink-0`}
                    >
                      {subjectIcon(id)}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-600 tabular-nums">
                      {gradeLessons} دروس في {selectedGradeMeta.shortLabel}
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-base sm:text-lg font-display font-bold ${meta.accentText}`}>
                      {meta.name}
                    </h3>
                    <div className="text-xs font-medium text-slate-500" dir="ltr">
                      {meta.frenchName}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">{meta.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono font-semibold text-slate-700 tabular-nums">
                  <span>{totalLessons} درساً كلياً</span>
                  <span>{totalExercises} تمريناً</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Interactive Visual Studio & Social Heritage Showcase */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="space-y-1">
            <div className="text-xs sm:text-sm font-semibold text-sky-700">02. المحتوى المرئي، الاجتماعيات والعمل دون نت</div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
              استوديو الرسوم المتحركة لجميع الأقسام والتراث الجغرافي التونسي
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white border-2 border-sky-200 rounded-3xl overflow-hidden grid grid-cols-1 sm:grid-cols-2 shadow-xs">
              <div className="p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900">
                    قسم المحتوى المرئي والرسوم المتحركة (س3–س6)
                  </h3>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    مقاطع تفاعلية متحركة مع تعليق صوتي مبسّط لكل قسم: من حالات المادة والإنبات إلى الدورة الدموية والدارة والنسب المئوية لمناظرة السيزيام.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => scrollToSection('student-login')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-900 cursor-pointer"
                >
                  افتح الاستوديو والمختبرات بعد الدخول
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <div className="min-h-[220px] bg-sky-50 border-t sm:border-t-0 sm:border-r border-sky-100">
                {!scienceImgFailed ? (
                  <img
                    src="/src/assets/images/visual_studio_science_1795260006947.jpg"
                    alt="استوديو المحتوى المرئي والعلوم في أكاديمية عزيز"
                    referrerPolicy="no-referrer"
                    onError={() => setScienceImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-6">
                    <FlaskConical className="w-10 h-10 text-emerald-600" aria-hidden="true" />
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white border-2 border-teal-200 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xs">
              <div className="h-44 bg-teal-50 border-b border-teal-100">
                {!mathImgFailed ? (
                  <img
                    src="/src/assets/images/subject_social_heritage_1795260006416.jpg"
                    alt="المواد الاجتماعية والتاريخ والجغرافيا التونسية"
                    referrerPolicy="no-referrer"
                    onError={() => setMathImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-6">
                    <Landmark className="w-10 h-10 text-teal-600" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-lg font-display font-bold text-slate-900">
                  المواد الاجتماعية والعمل بدون نت + Google Drive
                </h3>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                  رحلات تفاعلية في التاريخ والجغرافيا والتربية المدنية التونسية، مع تثبيت التطبيق بدون إنترنت وحفظ نسخة احتياطية آمنة على Google Drive الخاص بك.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Grade Selection Overview + Reports & Motivation */}
        <section id="grades" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-7">
          <div className="space-y-1">
            <div className="text-xs sm:text-sm font-semibold text-sky-700">03. مسارات حسب السنة الدراسية</div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
              اضبط سنتك الدراسية لتظهر لك دروسك فقط
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GRADES.map((g) => {
              const gLessons = LESSONS.filter((l) => l.grade === g.grade);
              const gEx = gLessons.reduce((s, l) => s + l.exercises.length, 0);
              const isSelected = g.grade === grade;
              return (
                <button
                  key={g.grade}
                  type="button"
                  onClick={() => {
                    setGrade(g.grade);
                    scrollToSection('student-login');
                  }}
                  className={`p-5 rounded-2xl border text-right transition-colors cursor-pointer flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'bg-sky-50/70 border-sky-500'
                      : 'bg-white border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-sky-700">{g.shortLabel}</div>
                    <h3 className="text-base font-display font-bold text-slate-900">{g.label}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{g.subtitle}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-700 tabular-nums">
                    <span>{gLessons.length} درساً</span>
                    <span>{gEx} تمريناً</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div
            id="reports"
            className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
          >
            <div className="lg:col-span-8 space-y-3">
              <div className="text-xs font-semibold text-sky-700">04. التحفيز وتقارير التقدّم</div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                حفظ سحابي لملفات التلاميذ وتقارير متابعة دقيقة للأولياء
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                يحصل التلميذ على نقاط وأوسمة افتراضية مع كل إنجاز، ويستقبل تذكيراً لطيفاً عند الغياب لأكثر من يومين، مع تقارير بيداغوجية مفصّلة قابلة للحفظ والطباعة.
              </p>
              <div className="flex flex-wrap items-center gap-6 pt-1 text-xs font-semibold text-slate-700">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
                  نظام نقاط وأوسمة تحفيزية
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-sky-600" aria-hidden="true" />
                  تبديل سهل بين ملفات الإخوة
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  تقارير PDF وCSV محفوظة
                </span>
              </div>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <button
                type="button"
                onClick={() => scrollToSection('student-login')}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                انتقل إلى منطقة الدخول
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="font-semibold text-slate-800">
            أكاديمية عزيز — منصة التعليم الابتدائي التفاعلية (الجمهورية التونسية 2026)
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => scrollToSection('curriculum')}
              className="hover:text-slate-900 cursor-pointer"
            >
              المواد والمناهج
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="hover:text-slate-900 cursor-pointer"
            >
              المختبرات
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('reports')}
              className="hover:text-slate-900 cursor-pointer"
            >
              تقارير التقدّم
            </button>
            {onOpenLegal && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  سياسة الخصوصية
                </button>
                <button
                  type="button"
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  شروط الاستخدام
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => scrollToSection('student-login')}
              className="text-sky-700 font-semibold hover:text-sky-900 cursor-pointer"
            >
              دخول التلميذ
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
