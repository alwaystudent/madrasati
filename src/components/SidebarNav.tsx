import React from 'react';
import {
  Award,
  BookOpen,
  Compass,
  FlaskConical,
  Languages,
  LayoutGrid,
  Sparkles,
  Timer,
  UserCog,
  X,
} from 'lucide-react';
import { BADGES, GRADES } from '../data/tunisianCurriculum';
import { LevelInfo, StudentProgress } from '../types/curriculum';
import { BadgeMedallion } from './BadgeMedallion';

export type AppView =
  | 'home'
  | 'subjects'
  | 'french_studio'
  | 'practice'
  | 'express'
  | 'progress'
  | 'lesson';

interface SidebarNavProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  progress: StudentProgress;
  levelInfo: LevelInfo;
  onChangeStudent: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeView,
  onNavigate,
  progress,
  levelInfo,
  onChangeStudent,
  mobileOpen,
  onCloseMobile,
}) => {
  const gradeMeta = GRADES.find((g) => g.grade === progress.selectedGrade) ?? GRADES[2];
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
      id: 'progress',
      label: 'التقدّم والأوسمة',
      icon: <Award className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
  ];

  const handleSelect = (view: AppView) => {
    onNavigate(view);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white border-l border-slate-200 p-4 space-y-6">
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center justify-between gap-2 px-1">
          <button
            type="button"
            onClick={() => handleSelect('home')}
            className="flex items-center gap-2.5 text-right cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Compass className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-base font-display font-extrabold text-slate-900 leading-tight">
                منارة التعلّم
              </div>
              <div className="text-xs text-slate-500">الابتدائي التونسي 2026</div>
            </div>
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="إغلاق القائمة"
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Enrolled Student Summary */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5">
            {equippedBadge ? (
              <BadgeMedallion badge={equippedBadge} unlocked size="sm" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-display font-bold flex items-center justify-center shrink-0">
                {(progress.studentName || 'عزيز').slice(0, 1)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-display font-bold text-slate-900 truncate">
                {progress.studentName || 'عزيز'}
              </div>
              <div className="text-xs font-medium text-sky-700 truncate">
                {gradeMeta.label}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/80">
            <span className="text-slate-600">المستوى {levelInfo.level}</span>
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200/80 space-y-1.5">
        <div className="text-xs font-bold text-sky-900">مخصص لقسمك فقط</div>
        <p className="text-xs text-sky-800 leading-relaxed">
          تظهر لك الآن حصرياً دروس وتمارين {gradeMeta.label} وفق المنهاج الرسمي 2026.
        </p>
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
