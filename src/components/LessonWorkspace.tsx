import React, { useState } from 'react';
import {
  ArrowRight,
  Bot,
  FlaskConical,
  Gamepad2,
  CheckCircle2,
  Circle,
  ChevronLeft,
  Volume2,
} from 'lucide-react';
import { Lesson } from '../types/curriculum';
import { GRADES, SUBJECTS } from '../data/tunisianCurriculum';
import { SimulationStage } from './simulations/SimulationStage';
import { ExerciseEngine } from './ExerciseEngine';
import { LessonTutorChat } from './LessonTutorChat';
import { FrenchSpeakableText } from './FrenchSpeakableText';
import { SpeechSpeed } from '../utils/frenchSpeech';
import { speakArabicText } from '../utils/arabicSpeech';

interface LessonWorkspaceProps {
  lesson: Lesson;
  studentName?: string;
  completedStepIndices: number[];
  onStepComplete: (lessonId: string, stepIndex: number) => void;
  onLessonComplete: (score: number, total: number, pointsEarned: number) => void;
  onExit: () => void;
}

export const LessonWorkspace: React.FC<LessonWorkspaceProps> = ({
  lesson,
  studentName = 'عزيز',
  completedStepIndices,
  onStepComplete,
  onLessonComplete,
  onExit,
}) => {
  const [activeTab, setActiveTab] = useState<'lab' | 'exercises' | 'tutor'>('lab');
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [speechSpeed, setSpeechSpeed] = useState<SpeechSpeed>('normal');
  const [tutorPrefill, setTutorPrefill] = useState<string | null>(null);

  const subject = SUBJECTS[lesson.subjectId];
  const gradeMeta = GRADES.find((g) => g.grade === lesson.grade);
  const currentStep = lesson.steps[activeStepIdx];
  const isStepDone = completedStepIndices.includes(activeStepIdx);

  const handleCompleteStep = () => {
    onStepComplete(lesson.id, activeStepIdx);
    if (activeStepIdx + 1 < lesson.steps.length) {
      setActiveStepIdx(activeStepIdx + 1);
    } else {
      setActiveTab('exercises');
    }
  };

  const handleAskAboutStep = () => {
    if (!currentStep) return;
    setTutorPrefill(
      `اشرح لي هذه النقطة في الدرس بأسلوب مبسّط: «${currentStep.title}» (${currentStep.takeaway})`
    );
    setActiveTab('tutor');
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-700 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
            العودة إلى قائمة الدروس
          </button>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className={`font-semibold ${subject.accentText}`}>{subject.name}</span>
            {gradeMeta && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-slate-700">{gradeMeta.label}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{lesson.trimester}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{lesson.durationMinutes} دقائق</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 text-balance">
            {lesson.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('lab')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'lab'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-sky-600" aria-hidden="true" />
            المختبر التفاعلي
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('exercises')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'exercises'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-amber-600" aria-hidden="true" />
            تمارين التطبيق ({lesson.exercises.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tutor')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'tutor'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            اسأل المعلّم الذكي
          </button>
        </div>
      </div>

      {lesson.supportTip && (
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-sm text-emerald-950 leading-relaxed">
          <strong className="font-bold text-emerald-900">سرّ الفهم السريع لهذا الدرس: </strong>
          {lesson.supportTip}
        </div>
      )}

      {activeTab === 'lab' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
                <div>
                  <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
                    {lesson.simTitle}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    {lesson.simDescription}
                  </p>
                </div>
                <SimulationStage simType={lesson.simType} />
              </div>

              {/* French Audio Companion for ALL French Lessons */}
              {lesson.subjectId === 'french' &&
                lesson.frenchPhrases &&
                lesson.frenchPhrases.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-5 h-5 text-indigo-700" aria-hidden="true" />
                        <div>
                          <h2 className="text-base font-display font-bold text-slate-900">
                            القراءة الصوتية للكلمات والجمل الفرنسية
                          </h2>
                          <p className="text-xs text-slate-500">
                            اضغط على أي كلمة لنطقها منفردة، أو اضغط على زر السماعة لقراءة الجملة كاملة.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setSpeechSpeed('normal')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer ${
                            speechSpeed === 'normal'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600'
                          }`}
                        >
                          نطق عادي
                        </button>
                        <button
                          type="button"
                          onClick={() => setSpeechSpeed('slow')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer ${
                            speechSpeed === 'slow'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600'
                          }`}
                        >
                          نطق بطيء للمبتدئين
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {lesson.frenchPhrases.map((phrase, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2"
                        >
                          <FrenchSpeakableText
                            text={phrase.fr}
                            speed={speechSpeed}
                            sentenceButtonLabel="استمع"
                          />
                          <div className="text-sm font-medium text-slate-700">{phrase.ar}</div>
                          {phrase.phoneticHint && (
                            <div className="text-xs text-indigo-700">{phrase.phoneticHint}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <aside className="lg:col-span-5 xl:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
                  مهمات الاستكشاف السريعة
                </h2>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {completedStepIndices.length} / {lesson.steps.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {lesson.steps.map((step, idx) => {
                  const done = completedStepIndices.includes(idx);
                  const active = activeStepIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveStepIdx(idx)}
                      className={`p-3 rounded-xl border text-right transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                        active
                          ? 'bg-sky-50 border-sky-300 text-sky-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {done ? (
                          <CheckCircle2
                            className="w-4 h-4 text-emerald-600 shrink-0"
                            aria-hidden="true"
                          />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                        )}
                        <span className="text-sm font-semibold truncate">
                          {idx + 1}. {step.title}
                        </span>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-sky-700">
                    المهمة {activeStepIdx + 1}: جرّب بنفسك في المختبر
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      speakArabicText(`${currentStep.instruction}. ${currentStep.takeaway}`)
                    }
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-sky-800 bg-white hover:bg-sky-50 border border-slate-200 rounded-md cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                    استمع
                  </button>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed">{currentStep.instruction}</p>
                <div className="pt-3 border-t border-slate-200 space-y-1">
                  <div className="text-xs font-semibold text-emerald-800">القاعدة الذهبية:</div>
                  <p className="text-sm font-medium text-slate-900 leading-relaxed">
                    {currentStep.takeaway}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleCompleteStep}
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer"
                >
                  {isStepDone
                    ? activeStepIdx + 1 < lesson.steps.length
                      ? 'الانتقال للمهمة التالية'
                      : 'ابدأ التمارين الممتعة الآن'
                    : 'فهمت! اجمع 15 نقطة وانتقل للتالي'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('exercises')}
                  className="w-full py-2 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  انتقل مباشرة إلى التمارين
                </button>
                <button
                  type="button"
                  onClick={handleAskAboutStep}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5" aria-hidden="true" />
                  اسأل المعلّم الذكي عن هذه الخطوة
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}

      {activeTab === 'exercises' && (
        <div className="max-w-3xl mx-auto">
          <ExerciseEngine
            exercises={lesson.exercises}
            onComplete={onLessonComplete}
            onBackToSim={() => setActiveTab('lab')}
            modeLabel={`تمارين: ${lesson.title}`}
            supportTip={lesson.supportTip}
          />
        </div>
      )}

      {activeTab === 'tutor' && (
        <div className="max-w-4xl mx-auto">
          <LessonTutorChat
            lesson={lesson}
            studentName={studentName}
            prefillPrompt={tutorPrefill}
            onConsumePrefill={() => setTutorPrefill(null)}
          />
        </div>
      )}
    </section>
  );
};
