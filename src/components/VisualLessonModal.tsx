import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  CheckCircle2,
  Clapperboard,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  XCircle,
} from 'lucide-react';
import { VisualLessonModule } from '../data/visualMediaData';
import { GradeLevel, SubjectId } from '../types/curriculum';
import { speakArabicText, stopArabicSpeech } from '../utils/arabicSpeech';
import { VisualStageCanvas } from './VisualStageCanvas';

interface VisualLessonModalProps {
  module: VisualLessonModule | null;
  onClose: () => void;
  onRecordVisualStudy?: (
    moduleId: string,
    title: string,
    grade: GradeLevel,
    subjectId: SubjectId,
    score: number,
    total: number,
    points: number
  ) => void;
}

export const VisualLessonModal: React.FC<VisualLessonModalProps> = ({
  module,
  onClose,
  onRecordVisualStudy,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [sceneIdx, setSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    if (!module) return;
    setSceneIdx(0);
    setSceneProgress(0);
    setIsPlaying(true);
    setVoiceEnabled(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    return () => stopArabicSpeech();
  }, [module?.id]);

  useEffect(() => {
    if (!module) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopArabicSpeech();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [module, onClose]);

  const currentScene = module
    ? module.scenes[sceneIdx] ?? module.scenes[0]
    : null;

  useEffect(() => {
    if (!module || !currentScene || !isPlaying) return;
    const durationMs = currentScene.durationSec * 1000;
    const intervalMs = 150;
    const step = (intervalMs / durationMs) * 100;

    const timer = window.setInterval(() => {
      setSceneProgress((prev) => {
        if (prev + step >= 100) {
          setSceneIdx((idx) => (idx + 1) % module.scenes.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [module, isPlaying, sceneIdx, currentScene]);

  useEffect(() => {
    if (!module || !currentScene) {
      stopArabicSpeech();
      return;
    }
    if (voiceEnabled && isPlaying) {
      speakArabicText(currentScene.narration, 'normal');
    } else {
      stopArabicSpeech();
    }
    return () => stopArabicSpeech();
  }, [module, voiceEnabled, isPlaying, currentScene]);

  if (!module || !currentScene) return null;

  const handleClose = () => {
    stopArabicSpeech();
    onClose();
  };

  const handleJumpScene = (idx: number) => {
    setSceneIdx(idx);
    setSceneProgress(0);
  };

  const handleSubmitQuiz = () => {
    if (quizSubmitted) return;
    setQuizSubmitted(true);
    const correctCount = module.quiz.reduce(
      (acc, q, i) => (quizAnswers[i] === q.correctIndex ? acc + 1 : acc),
      0
    );
    const pts = correctCount * 15 + 15;
    onRecordVisualStudy?.(
      module.id,
      `مقطع مرئي: ${module.title}`,
      module.grade,
      module.subjectId,
      correctCount,
      module.quiz.length,
      pts
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="visual-lesson-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-4xl bg-white border-2 border-sky-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Explicit Close Button */}
        <div className="px-5 py-4 bg-gradient-to-l from-sky-50 via-white to-amber-50/60 border-b border-sky-100 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-700">
              <Clapperboard className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {module.subjectLabel} · {module.trimester}
              </span>
            </div>
            <h2
              id="visual-lesson-modal-title"
              className="text-base sm:text-xl font-display font-bold text-slate-900 truncate mt-0.5"
            >
              {module.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setVoiceEnabled((v) => !v)}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap cursor-pointer ${
                voiceEnabled
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {voiceEnabled ? (
                <Volume2 className="w-4 h-4" aria-hidden="true" />
              ) : (
                <VolumeX className="w-4 h-4" aria-hidden="true" />
              )}
              {voiceEnabled ? 'الصوت مفعّل' : 'تشغيل الصوت'}
            </button>

            <button
              type="button"
              onClick={handleClose}
              aria-label="إغلاق نافذة الدرس المرئي"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-800 bg-white hover:bg-rose-50 hover:text-rose-700 border border-slate-300 hover:border-rose-300 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              <span>غلق</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* Mobile voice toggle */}
          <div className="sm:hidden flex justify-end">
            <button
              type="button"
              onClick={() => setVoiceEnabled((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                voiceEnabled
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              {voiceEnabled ? (
                <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {voiceEnabled ? 'الصوت المفسّر مفعّل' : 'تشغيل التعليق الصوتي'}
            </button>
          </div>

          {/* Animated SVG Stage */}
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-950">
            <VisualStageCanvas
              module={module}
              sceneIdx={sceneIdx}
              isPlaying={isPlaying}
              shouldReduceMotion={Boolean(shouldReduceMotion)}
            />
          </div>

          {/* Caption & Narration */}
          <div className="p-4 rounded-2xl bg-sky-50/75 border border-sky-200 space-y-1">
            <div className="text-xs font-bold text-sky-900">{currentScene.title}</div>
            <p className="text-sm font-medium text-slate-900 leading-relaxed">
              {currentScene.caption}
            </p>
          </div>

          {/* Controls & Scene Jumpers */}
          <div className="space-y-3">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-600 transition-all duration-150"
                style={{ width: `${Math.min(100, sceneProgress)}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-sky-700 rounded-xl transition-colors cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" aria-hidden="true" />
                      إيقاف مؤقت
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" aria-hidden="true" />
                      تشغيل العرض
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleJumpScene(
                      (sceneIdx - 1 + module.scenes.length) % module.scenes.length
                    )
                  }
                  aria-label="المشهد السابق"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <SkipForward className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => handleJumpScene((sceneIdx + 1) % module.scenes.length)}
                  aria-label="المشهد التالي"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <SkipBack className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSceneIdx(0);
                    setSceneProgress(0);
                    setIsPlaying(true);
                  }}
                  aria-label="إعادة من الأول"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {module.scenes.map((sc, i) => (
                  <button
                    key={sc.title}
                    type="button"
                    onClick={() => handleJumpScene(i)}
                    className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg border transition-colors cursor-pointer tabular-nums ${
                      sceneIdx === i
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    مشهد {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Key Rule */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-950">
            <strong>القاعدة المرئية المختصرة: </strong>
            {module.keyRule}
          </div>

          {/* Post-watch Auto-Graded Mini Quiz */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
              <h3 className="text-sm sm:text-base font-display font-bold text-slate-900">
                اختبار سريع بعد المشاهدة — تصحيح تلقائي (+15 إلى +45 نقطة)
              </h3>
            </div>

            <div className="space-y-4">
              {module.quiz.map((q, qIdx) => (
                <div key={q.prompt} className="space-y-2">
                  <div className="text-sm font-bold text-slate-900">
                    {qIdx + 1}. {q.prompt}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oIdx) => {
                      const chosen = quizAnswers[qIdx] === oIdx;
                      const isRight = quizSubmitted && oIdx === q.correctIndex;
                      const isWrong = quizSubmitted && chosen && oIdx !== q.correctIndex;
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() =>
                            setQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))
                          }
                          className={`p-3 rounded-xl border text-right text-xs sm:text-sm font-medium transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                            isRight
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                              : isWrong
                              ? 'bg-rose-50 border-rose-400 text-rose-900'
                              : chosen
                              ? 'bg-sky-50 border-sky-600 text-sky-950 font-bold'
                              : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <span>{opt}</span>
                          {isRight && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                          )}
                          {isWrong && (
                            <XCircle className="w-4 h-4 text-rose-700 shrink-0" aria-hidden="true" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {quizSubmitted && (
                    <div className="text-xs text-slate-700 bg-white border border-slate-200 p-2.5 rounded-xl">
                      <strong>التغذية الراجعة: </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {!quizSubmitted ? (
                <button
                  type="button"
                  disabled={Object.keys(quizAnswers).length < module.quiz.length}
                  onClick={handleSubmitQuiz}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 rounded-xl transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  تحقق واجمع نقاط المشاهدة
                </button>
              ) : (
                <div className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  تم التصحيح التلقائي وتسجيل النقاط في رصيدك!
                </div>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
                غلق النافذة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
