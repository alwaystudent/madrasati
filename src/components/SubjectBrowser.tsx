import React, { useState } from 'react';
import {
  CheckCircle2,
  Play,
  FlaskConical,
  Calculator,
  BookOpen,
  Languages,
  Search,
} from 'lucide-react';
import { GRADES, SUBJECTS } from '../data/tunisianCurriculum';
import { Lesson, StudentProgress, SubjectId } from '../types/curriculum';

interface SubjectBrowserProps {
  progress: StudentProgress;
  studentLessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
  initialSubject?: SubjectId | 'all';
}

export const SubjectBrowser: React.FC<SubjectBrowserProps> = ({
  progress,
  studentLessons,
  onSelectLesson,
  initialSubject = 'all',
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>(initialSubject);
  const [selectedTrimester, setSelectedTrimester] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeGradeMeta =
    GRADES.find((g) => g.grade === progress.selectedGrade) ?? GRADES[2];
  const totalExercises = studentLessons.reduce((acc, l) => acc + l.exercises.length, 0);

  const filteredLessons = studentLessons.filter((lesson) => {
    const matchSubject = selectedSubject === 'all' || lesson.subjectId === selectedSubject;
    const matchTrimester =
      selectedTrimester === 'all' || lesson.trimester === selectedTrimester;
    const matchSearch =
      !searchQuery.trim() ||
      lesson.title.includes(searchQuery.trim()) ||
      lesson.subtitle.includes(searchQuery.trim());
    return matchSubject && matchTrimester && matchSearch;
  });

  const subjectIcon = (id: SubjectId) => {
    switch (id) {
      case 'math':
        return <Calculator className="w-4 h-4 text-sky-700 shrink-0" aria-hidden="true" />;
      case 'science':
        return <FlaskConical className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />;
      case 'arabic':
        return <BookOpen className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />;
      case 'french':
        return <Languages className="w-4 h-4 text-indigo-700 shrink-0" aria-hidden="true" />;
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-sky-700">
              برنامج {activeGradeMeta.label} · الجمهورية التونسية 2026
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
              الدروس والمختبرات التفاعلية الخاصة بك
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              تظهر لك فقط دروس {activeGradeMeta.label} ({studentLessons.length} درساً ومختبراً · {totalExercises} نشاطاً وتمريناً).
            </p>
          </div>

          <div className="relative w-full md:w-64 shrink-0">
            <Search
              className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في دروسك..."
              aria-label="ابحث في دروسك"
              className="w-full pr-9 pl-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedSubject('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedSubject === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              جميع المواد ({studentLessons.length})
            </button>
            {(['math', 'science', 'arabic', 'french'] as SubjectId[]).map((sid) => {
              const count = studentLessons.filter((l) => l.subjectId === sid).length;
              return (
                <button
                  key={sid}
                  type="button"
                  onClick={() => setSelectedSubject(sid)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedSubject === sid
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {SUBJECTS[sid].name} ({count})
                </button>
              );
            })}
          </div>

          <select
            aria-label="تصفية حسب الثلاثي"
            value={selectedTrimester}
            onChange={(e) => setSelectedTrimester(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 cursor-pointer"
          >
            <option value="all">كل الثلاثيات</option>
            <option value="الثلاثي الأول">الثلاثي الأول</option>
            <option value="الثلاثي الثاني">الثلاثي الثاني</option>
            <option value="الثلاثي الثالث">الثلاثي الثالث</option>
          </select>
        </div>
      </div>

      {filteredLessons.length === 0 ? (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
          <p className="text-slate-600 text-sm">
            لا توجد دروس مطابقة لهذا التصفية في {activeGradeMeta.shortLabel}.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedSubject('all');
              setSelectedTrimester('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg cursor-pointer"
          >
            عرض جميع دروس {activeGradeMeta.shortLabel}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLessons.map((lesson) => {
            const subject = SUBJECTS[lesson.subjectId];
            const completion = progress.completedLessons[lesson.id];
            const stepsDone = (progress.completedSteps[lesson.id] || []).length;
            const stepPercent = Math.round((stepsDone / lesson.steps.length) * 100);

            return (
              <article
                key={lesson.id}
                className="card-interactive bg-white border border-slate-200 hover:border-sky-300 rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div className={`h-1.5 w-full ${subject.barColor}`} />

                <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-lg ${subject.accentBg} border ${subject.accentBorder} flex items-center justify-center shrink-0`}
                        >
                          {subjectIcon(lesson.subjectId)}
                        </span>
                        <span className={`font-semibold shrink-0 ${subject.accentText}`}>
                          {subject.name}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{lesson.trimester}</span>
                      </div>
                      <span className="font-mono tabular-nums shrink-0">
                        {lesson.exercises.length} تمارين
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-display font-bold text-slate-900 leading-snug">
                      {lesson.title}
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">{lesson.subtitle}</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${completion ? 'bg-emerald-500' : subject.barColor} transition-all duration-300`}
                        style={{ width: `${completion ? 100 : stepPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        {completion ? (
                          <>
                            <CheckCircle2
                              className="w-4 h-4 text-emerald-600 shrink-0"
                              aria-hidden="true"
                            />
                            <span className="text-emerald-800 font-semibold font-mono tabular-nums">
                              مكتمل ({completion.bestScore}/{completion.totalQuestions})
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-500 font-mono tabular-nums">
                            الاستكشاف: {stepsDone}/{lesson.steps.length}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectLesson(lesson)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" aria-hidden="true" />
                        {completion ? 'مراجعة الدرس' : 'ابدأ المختبر'}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
