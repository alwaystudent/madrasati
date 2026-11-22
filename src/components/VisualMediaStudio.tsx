import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Calculator,
  Clapperboard,
  FlaskConical,
  Landmark,
  Languages,
  Play,
  Sparkles,
} from 'lucide-react';
import { GRADES, SUBJECTS } from '../data/tunisianCurriculum';
import { VISUAL_MODULES, VisualLessonModule } from '../data/visualMediaData';
import { GradeLevel, SubjectId } from '../types/curriculum';
import { VisualLessonModal } from './VisualLessonModal';

interface VisualMediaStudioProps {
  selectedGrade: GradeLevel;
  studentName: string;
  onOpenVisualModule?: (mod: VisualLessonModule) => void;
  onRecordVisualStudy: (
    moduleId: string,
    title: string,
    grade: GradeLevel,
    subjectId: SubjectId,
    score: number,
    total: number,
    points: number
  ) => void;
}

export const VisualMediaStudio: React.FC<VisualMediaStudioProps> = ({
  selectedGrade,
  studentName,
  onOpenVisualModule,
  onRecordVisualStudy,
}) => {
  const [gradeFilter, setGradeFilter] = useState<GradeLevel>(selectedGrade);
  const [subjectFilter, setSubjectFilter] = useState<'all' | SubjectId>('all');
  const [heroImgError, setHeroImgError] = useState(false);
  const [localModalModule, setLocalModalModule] = useState<VisualLessonModule | null>(null);

  useEffect(() => {
    setGradeFilter(selectedGrade);
    setSubjectFilter('all');
  }, [selectedGrade]);

  const gradeModules = VISUAL_MODULES.filter((m) => m.grade === gradeFilter);
  const filteredModules = gradeModules.filter(
    (m) => subjectFilter === 'all' || m.subjectId === subjectFilter
  );

  const activeGradeMeta =
    GRADES.find((g) => g.grade === gradeFilter) ?? GRADES[3];

  const handleOpenModule = (mod: VisualLessonModule) => {
    if (onOpenVisualModule) {
      onOpenVisualModule(mod);
    } else {
      setLocalModalModule(mod);
    }
  };

  const subjectIcon = (sid: SubjectId) => {
    switch (sid) {
      case 'science':
        return <FlaskConical className="w-4 h-4 text-emerald-700" aria-hidden="true" />;
      case 'math':
        return <Calculator className="w-4 h-4 text-sky-700" aria-hidden="true" />;
      case 'french':
        return <Languages className="w-4 h-4 text-indigo-700" aria-hidden="true" />;
      case 'social':
        return <Landmark className="w-4 h-4 text-teal-700" aria-hidden="true" />;
      default:
        return <BookOpen className="w-4 h-4 text-amber-700" aria-hidden="true" />;
    }
  };

  const subjectTabs: ('all' | SubjectId)[] = ['all', 'science', 'math', 'arabic', 'french', 'social'];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Studio Banner */}
      <div className="bg-gradient-to-l from-white via-white to-sky-50/60 border-2 border-sky-200 rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-xs">
        <div className="lg:col-span-8 p-5 sm:p-6 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700">
            <Clapperboard className="w-4 h-4" aria-hidden="true" />
            قسم المحتوى المرئي والرسوم المتحركة · سنوات الثالثة إلى السادسة ابتدائي 2026
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 leading-snug">
            استوديو الشرح المرئي المبسّط، {studentName || 'عزيز'} ({activeGradeMeta.shortLabel})
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
            اضغط على أي رابط درس مرئي بالأسفل لفتحه في نافذة تفاعلية منبثقة بالرسوم المتحركة والتعليق الصوتي العربي والاختبار التلقائي.
          </p>

          {/* Grade Switcher */}
          <div className="flex flex-wrap items-center gap-1.5">
            {GRADES.map((g) => {
              const count = VISUAL_MODULES.filter((m) => m.grade === g.grade).length;
              const isSelected = gradeFilter === g.grade;
              return (
                <button
                  key={g.grade}
                  type="button"
                  onClick={() => {
                    setGradeFilter(g.grade);
                    setSubjectFilter('all');
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  {g.shortLabel} ({count})
                </button>
              );
            })}
          </div>

          {/* Subject Filter */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {subjectTabs.map((sid) => {
              const count =
                sid === 'all'
                  ? gradeModules.length
                  : gradeModules.filter((m) => m.subjectId === sid).length;
              if (sid !== 'all' && count === 0) return null;
              const label = sid === 'all' ? 'كل المواد' : SUBJECTS[sid].name;
              return (
                <button
                  key={sid}
                  type="button"
                  onClick={() => setSubjectFilter(sid)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                    subjectFilter === sid
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 min-h-[180px] bg-slate-900 border-t lg:border-t-0 lg:border-r border-slate-200 relative">
          {!heroImgError ? (
            <img
              src="/src/assets/images/visual_studio_science_1795260006947.jpg"
              alt="غرفة استوديو العلوم والرياضيات المبسطة في أكاديمية عزيز"
              referrerPolicy="no-referrer"
              onError={() => setHeroImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sky-400">
              <Clapperboard className="w-12 h-12" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>

      {/* Visual Lesson Links Grid (Opens in Popup Modal) */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-sky-100">
          <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
            قائمة الدروس المرئية لـ {activeGradeMeta.shortLabel} ({filteredModules.length})
          </h2>
          <span className="text-xs font-medium text-slate-500">
            اضغط على أي درس لفتحه في نافذة منبثقة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredModules.map((mod) => {
            const subj = SUBJECTS[mod.subjectId];
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => handleOpenModule(mod)}
                className="group card-interactive bg-white border-2 border-slate-200 hover:border-sky-400 rounded-3xl p-5 text-right flex flex-col justify-between gap-4 transition-all cursor-pointer shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <span
                        className={`w-7 h-7 rounded-lg ${subj.accentBg} border ${subj.accentBorder} flex items-center justify-center shrink-0`}
                      >
                        {subjectIcon(mod.subjectId)}
                      </span>
                      <span className={subj.accentText}>{subj.name}</span>
                      <span aria-hidden="true">·</span>
                      <span>{mod.trimester}</span>
                    </span>
                    <span className="font-mono tabular-nums shrink-0">
                      {mod.scenes.length} مشاهد
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-display font-bold text-slate-900 leading-snug group-hover:text-sky-800 transition-colors">
                    {mod.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {mod.subtitle}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                    اختبار تثبيت الفهم
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-600 group-hover:bg-sky-700 rounded-xl transition-colors whitespace-nowrap">
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                    فتح الدرس المرئي
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {!onOpenVisualModule && (
        <VisualLessonModal
          module={localModalModule}
          onClose={() => setLocalModalModule(null)}
          onRecordVisualStudy={onRecordVisualStudy}
        />
      )}
    </section>
  );
};
