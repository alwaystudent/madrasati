import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export type AppView = 'home' | 'subjects' | 'express' | 'progress' | 'lesson';

interface TopBarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ activeView, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { id: AppView; label: string }[] = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'subjects', label: 'المواد والدروس' },
    { id: 'express', label: 'تحدي 3 دقائق' },
    { id: 'progress', label: 'التقدّم والأوسمة' },
  ];

  const handleNav = (view: AppView) => {
    onNavigate(view);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="text-xl font-display font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
        >
          منارة التعلّم
        </button>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          {navItems.map((item) => {
            const isActive =
              activeView === item.id ||
              (activeView === 'lesson' && item.id === 'subjects');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
                  isActive
                    ? 'text-sky-700 border-sky-600 font-semibold'
                    : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action + mobile menu toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNav('express')}
            className="hidden sm:inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            ابدأ تحدي اليوم
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item.id)}
              className={`block w-full text-right px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${
                activeView === item.id
                  ? 'bg-sky-50 text-sky-800 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleNav('express')}
            className="w-full mt-2 px-4 py-2.5 text-sm font-semibold text-white bg-sky-600 rounded-lg cursor-pointer"
          >
            ابدأ تحدي اليوم
          </button>
        </div>
      )}
    </header>
  );
};
