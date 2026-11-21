import React from 'react';
import {
  Award,
  BookOpen,
  Clapperboard,
  Cloud,
  FileText,
  FlaskConical,
  Languages,
  LayoutGrid,
  LogIn,
  ShieldCheck,
  Sparkles,
  Timer,
  Trophy,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { BADGES, GRADES } from '../data/tunisianCurriculum';
import { CloudSyncStatus, LevelInfo, StudentProgress } from '../types/curriculum';
import { BadgeMedallion } from './BadgeMedallion';
import { BrandLogo } from './BrandLogo';
import { PWAInstallBanner } from './PWAInstallBanner';

export type AppView =
  | 'home'
  | 'subjects'
  | 'visual_studio'
  | 'french_studio'
  | 'practice'
  | 'express'
  | 'leaderboard'
  | 'progress'
  | 'reports'
  | 'parent_followup'
  | 'legal'
  | 'lesson';

interface SidebarNavProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  progress: StudentProgress;
  levelInfo: LevelInfo;
  authUser: User | null;
  cloudSyncStatus: CloudSyncStatus;
  cloudError?: string | null;
  hasPendingSync?: boolean;
  onFlushSyncNow?: () => Promise<void>;
  onSignInWithGoogle: () => Promise<void>;
  onChangeStudent: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeView,
  onNavigate,
  progress,
  levelInfo,
  authUser,
  cloudSyncStatus,
  cloudError,
  hasPendingSync = false,
  onFlushSyncNow,
  onSignInWithGoogle,
  onChangeStudent,
  mobileOpen,
  onCloseMobile,
}) => {
  const gradeMeta = GRADES.find((g) => g.grade === progress.selectedGrade) ?? GRADES[3];
  const equippedBadge = BADGES.find((b) => b.id === progress.equippedBadgeId) ?? null;

  const navItems: { id: AppView; label: string; icon: React.ReactNode }[] = [
    {
      id: 'home',
      label: 'مسار التعلّم',
      icon: <LayoutGrid className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
    {
      id: 'subjects',
      label: 'الدروس والمختبرات',
      icon: <FlaskConical className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
    {
      id: 'visual_studio',
      label: 'المحتوى المرئي والرسوم',
      icon: <Clapperboard className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
    {
      id: 'french_studio',
      label: 'أكاديمية الفرنسية',
      icon: <Languages className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
    {
      id: 'practice',
      label: 'بنك التمارين 2026',
      icon: <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
    {
      id: 'express',
      label: 'التحديات والاختبار',
      icon: <Timer className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
    {
      id: 'leaderboard',
      label: 'لوحة الصدارة والتحدّي',
      icon: <Trophy className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
    {
      id: 'progress',
      label: 'التقدّم والأوسمة',
      icon: <Award className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
    {
      id: 'reports',
      label: 'تقارير التقدّم والحفظ',
      icon: <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
    {
      id: 'parent_followup',
      label: 'متابعة ولي الأمر',
      icon: <Users className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
  ];

  const handleSelect = (view: AppView) => {
    onNavigate(view);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white border-l-2 border-sky-100 p-4 space-y-5 overflow-y-auto">
      <div className="space-y-5">
        {/* Brand Logo */}
        <div className="flex items-center justify-between gap-2 px-1">
          <button
            type="button"
            onClick={() => handleSelect('home')}
            className="text-right cursor-pointer"
          >
            <BrandLogo size="sm" showTagline />
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="إغلاق القائمة"
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-sky-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Enrolled Student Summary */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-50/80 via-white to-amber-50/70 border-2 border-sky-200 space-y-3">
          <div className="flex items-center gap-2.5">
            {equippedBadge ? (
              <BadgeMedallion badge={equippedBadge} unlocked size="sm" />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-amber-100 border-2 border-amber-300 overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src="/src/assets/images/mascot_fanak_fox_1795189779395.jpg"
                  alt="صديق التلميذ فنك"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-display font-bold text-slate-900 truncate">
                {progress.studentName || 'عزيز'}
              </div>
              <div className="text-xs font-semibold text-sky-700 truncate">
                {gradeMeta.label}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-sky-200/70">
            <span className="text-slate-700">المستوى {levelInfo.level}</span>
            <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-700 tabular-nums">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
              {progress.points} نقطة
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onCloseMobile();
              onChangeStudent();
            }}
            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <UserCog className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            تغيير التلميذ أو السنة
          </button>

          {authUser ? (
            <div className="flex items-center justify-between gap-2 text-xs font-semibold text-emerald-700 pt-0.5">
              <span className="inline-flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>
                  {cloudSyncStatus === 'syncing'
                    ? 'جارٍ الحفظ السحابي...'
                    : hasPendingSync
                    ? 'حفظ مجمّع قيد الانتظار'
                    : 'محفوظ في السحابة'}
                </span>
              </span>
              {hasPendingSync && onFlushSyncNow && (
                <button
                  type="button"
                  onClick={() => void onFlushSyncNow()}
                  className="text-sky-700 hover:underline cursor-pointer shrink-0"
                >
                  حفظ الآن
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => void onSignInWithGoogle()}
                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                حفظ سحابي بحساب Google
              </button>
              {cloudError && (
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                  <p>{cloudError}</p>
                  <a
                    href={typeof window !== 'undefined' ? window.location.href : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block font-semibold text-sky-800 hover:underline"
                  >
                    فتح في تبويب مستقل
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Primary Workspace Links */}
        <nav aria-label="التنقل الرئيسي" className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              activeView === item.id ||
              (activeView === 'lesson' && item.id === 'subjects');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-sky-50 hover:text-sky-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2.5">
        <PWAInstallBanner compact onOpenReports={() => handleSelect('reports')} />

        <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200/80 space-y-1.5">
          <div className="text-xs font-bold text-sky-900">مخصص لقسمك فقط</div>
          <p className="text-xs text-sky-800 leading-relaxed">
            تظهر لك الآن حصرياً دروس وتمارين {gradeMeta.label} وفق المنهاج الرسمي 2026.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSelect('legal')}
          className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
            activeView === 'legal'
              ? 'bg-sky-50 text-sky-900 border-sky-300'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          سياسة الخصوصية وشروط الاستخدام
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-[264px] shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 w-[272px] max-w-[85vw] h-full shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
