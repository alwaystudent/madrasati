import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FlaskConical,
  RotateCcw,
  Sparkles,
  Volume2,
  XCircle,
} from 'lucide-react';
import { Lesson } from '../types/curriculum';
import { buildPostLessonQuiz, PostLessonQuizQuestion } from '../utils/lessonQuizGenerator';
import { speakArabicText, stopArabicSpeech } from '../utils/arabicSpeech';
import { speakFrenchText } from '../utils/frenchSpeech';

interface PostLessonQuizProps {
  lesson: Lesson;
  studentName?: string;
  previousBest?: { score: number; total: number } | null;
  onQuizComplete: (score: number, total: number, pointsEarned: number) => void;
  onBackToLab: () => void;
  onExitLesson?: () => void;
}

interface GradedAnswerRecord {
  question: PostLessonQuizQuestion;
  selectedIndex: number;
  isCorrect: boolean;
}

export const PostLessonQuiz: React.FC<PostLessonQuizProps> = ({
  lesson,
  studentName = 'عزيز',
  previousBest = null,
  onQuizComplete,
  onBackToLab,
  onExitLesson,
}) => {
  const questions = useMemo(() => buildPostLessonQuiz(lesson), [lesson]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [records, setRecords] = useState<GradedAnswerRecord[]>([]);
  const [finished, setFinished] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);

  useEffect(() => {
    setCurrentIdx(0);
    setSelectedIdx(null);
    setRecords([]);
    setFinished(false);
    setPointsAwarded(0);
    return () => stopArabicSpeech();
  }, [lesson.id]);

  const currentQuestion = questions[currentIdx];
  const isQuestionGraded = selectedIdx !== null;
  const isCurrentCorrect =
    isQuestionGraded && currentQuestion && selectedIdx === currentQuestion.correctIndex;
  const correctSoFar = records.filter((r) => r.isCorrect).length;

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestion || isQuestionGraded) return;
    const isRight = optionIndex === currentQuestion.correctIndex;
    setSelectedIdx(optionIndex);
    setRecords((prev) => [
      ...prev,
      {
        question: currentQuestion,
        selectedIndex: optionIndex,
        isCorrect: isRight,
      },
    ]);
  };

  const handleNext = () => {
    stopArabicSpeech();
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((i) => i + 1);
      setSelectedIdx(null);
      return;
    }

    const totalCorrect = records.filter((r) => r.isCorrect).length;
    const basePts = totalCorrect * 25;
    const masteryBonus =
      totalCorrect === questions.length
        ? 40
        : totalCorrect >= Math.ceil(questions.length * 0.5)
        ? 20
        : 10;
    const earned = basePts + masteryBonus;
    setPointsAwarded(earned);
    setFinished(true);
    onQuizComplete(totalCorrect, questions.length, earned);
  };

  const handleRestart = () => {
    stopArabicSpeech();
    setCurrentIdx(0);
    setSelectedIdx(null);
    setRecords([]);
    setFinished(false);
    setPointsAwarded(0);
  };

  if (questions.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-3">
        <p className="text-sm text-slate-600">لا توجد أسئلة متاحة لهذا الاختبار حالياً.</p>
        <button
          type="button"
          onClick={onBackToLab}
          className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg cursor-pointer"
        >
          العودة إلى الدرس
        </button>
      </div>
    );
  }

  if (finished) {
    const finalScore = records.filter((r) => r.isCorrect).length;
    const percent = Math.round((finalScore / questions.length) * 100);
    const missedRecords = records.filter((r) => !r.isCorrect);

    return (
      <div className="bg-white border-2 border-sky-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center shrink-0 ${
                percent >= 75
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : percent >= 50
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-sky-50 border-sky-300 text-sky-700'
              }`}
            >
              <Award className="w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-semibold text-sky-700">
                نتيجة التصحيح التلقائي · الاختبار القصير للدرس
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                {percent === 100
                  ? `إتقان تام يا ${studentName}!`
                  : percent >= 75
                  ? `أحسنت يا ${studentName}! فهم ممتاز للدرس`
                  : percent >= 50
                  ? `عمل جيّد يا ${studentName}! تحتاج لتعزيز بسيط`
                  : `محاولة شجاعة يا ${studentName}! لنراجع القواعد معاً`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 shrink-0">
            <div className="text-center">
              <div className="text-xs text-slate-500">العلامة</div>
              <div className="text-xl font-mono font-bold text-slate-900 tabular-nums">
                {finalScore} / {questions.length}
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200" aria-hidden="true" />
            <div className="text-center">
              <div className="text-xs text-slate-500">النسبة</div>
              <div
                className={`text-xl font-mono font-bold tabular-nums ${
                  percent >= 75
                    ? 'text-emerald-700'
                    : percent >= 50
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {percent}%
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200" aria-hidden="true" />
            <div className="text-center">
              <div className="text-xs text-slate-500">النقاط</div>
              <div className="text-xl font-mono font-bold text-amber-700 tabular-nums">
                +{pointsAwarded}
              </div>
            </div>
          </div>
        </div>

        {/* Immediate Pedagogical Summary & Remediation */}
        {missedRecords.length > 0 ? (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2 text-sm text-amber-950">
            <div className="font-bold flex items-center gap-2 text-amber-900">
              <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
              توصية فورية لتعزيز فهمك:
            </div>
            <p className="text-xs sm:text-sm leading-relaxed">
              ننصحك بمراجعة المحاور التالية من الدرس ثم إعادة الاختبار القصير لتحقيق علامة كاملة:
              {' '}
              <strong className="font-bold">
                {Array.from(new Set(missedRecords.map((m) => m.question.relatedStepTitle))).join('، ')}
              </strong>
              .
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-950 flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
            <span>
              أجبتَ عن جميع أسئلة الاختبار القصير بنجاح! استوعبت المفاهيم الأساسية لدرس «{lesson.title}».
            </span>
          </div>
        )}

        {/* Question-by-question auto-graded breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-display font-bold text-slate-900">
            تفاصيل التصحيح التلقائي والتغذية الراجعة لكل سؤال
          </h3>
          <div className="space-y-2.5">
            {records.map((rec, i) => (
              <div
                key={rec.question.id}
                className={`p-4 rounded-2xl border space-y-2 ${
                  rec.isCorrect
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-rose-50/50 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    {rec.isCorrect ? (
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-700 shrink-0 mt-1"
                        aria-hidden="true"
                      />
                    ) : (
                      <XCircle
                        className="w-4 h-4 text-rose-700 shrink-0 mt-1"
                        aria-hidden="true"
                      />
                    )}
                    <div className="space-y-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900">
                        {i + 1}. {rec.question.prompt}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        <span className={rec.isCorrect ? 'text-emerald-800 font-semibold' : 'text-rose-800 font-semibold'}>
                          إجابتك:{' '}
                          <span dir={rec.question.ltr ? 'ltr' : 'rtl'}>
                            {rec.question.options[rec.selectedIndex]}
                          </span>
                        </span>
                        {!rec.isCorrect && (
                          <span className="text-emerald-800 font-bold">
                            الإجابة الصحيحة:{' '}
                            <span dir={rec.question.ltr ? 'ltr' : 'rtl'}>
                              {rec.question.options[rec.question.correctIndex]}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed pr-6">
                  {rec.question.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              إعادة الاختبار القصير
            </button>
            <button
              type="button"
              onClick={onBackToLab}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <FlaskConical className="w-4 h-4" aria-hidden="true" />
              مراجعة المختبر التفاعلي
            </button>
          </div>

          {onExitLesson && (
            <button
              type="button"
              onClick={onExitLesson}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              العودة إلى قائمة الدروس
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-indigo-200 rounded-3xl p-5 sm:p-7 space-y-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-indigo-700">
            <ClipboardCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>الاختبار القصير لتعزيز الفهم · تصحيح تلقائي فوري</span>
            {previousBest && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-emerald-700 tabular-nums">
                  أفضل نتيجة سابقة: {previousBest.score}/{previousBest.total}
                </span>
              </>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900">
            اختبار درس: {lesson.title}
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono font-bold tabular-nums">
          <span className="text-slate-700">
            السؤال {currentIdx + 1} / {questions.length}
          </span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span className="text-emerald-700">صحيح: {correctSoFar}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-200"
          style={{
            width: `${((currentIdx + (isQuestionGraded ? 1 : 0)) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question Prompt */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-500">
            اختر الإجابة الصحيحة ليظهر التصحيح والتغذية الراجعة فوراً:
          </span>
          <button
            type="button"
            onClick={() =>
              currentQuestion.ltr
                ? speakFrenchText(currentQuestion.prompt)
                : speakArabicText(currentQuestion.prompt)
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
            استمع للسؤال
          </button>
        </div>

        <h3 className="text-base sm:text-lg font-display font-bold text-slate-900 leading-relaxed">
          {currentQuestion.prompt}
        </h3>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQuestion.options.map((opt, oIdx) => {
          const isChosen = selectedIdx === oIdx;
          const isRightOption = isQuestionGraded && oIdx === currentQuestion.correctIndex;
          const isWrongSelection = isQuestionGraded && isChosen && !isRightOption;

          return (
            <div
              key={`${currentQuestion.id}-opt-${oIdx}`}
              className={`rounded-2xl border transition-colors flex items-center justify-between gap-2 ${
                isRightOption
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                  : isWrongSelection
                  ? 'bg-rose-50 border-rose-400 text-rose-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-sky-50 hover:border-sky-300'
              }`}
            >
              <button
                type="button"
                disabled={isQuestionGraded}
                dir={currentQuestion.ltr ? 'ltr' : 'rtl'}
                onClick={() => handleSelectOption(oIdx)}
                className={`flex-1 p-4 text-sm sm:text-base font-medium flex items-center justify-between gap-2 cursor-pointer disabled:cursor-default ${
                  currentQuestion.ltr ? 'text-left' : 'text-right'
                }`}
              >
                <span>{opt}</span>
                {isRightOption && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
                )}
                {isWrongSelection && (
                  <XCircle className="w-5 h-5 text-rose-700 shrink-0" aria-hidden="true" />
                )}
              </button>

              {currentQuestion.ltr && /[a-zA-ZÀ-ÿ]/.test(opt) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakFrenchText(opt);
                  }}
                  aria-label={`استمع إلى ${opt}`}
                  className="p-2.5 ml-2 rounded-lg text-indigo-700 hover:bg-indigo-100 transition-colors shrink-0 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Instant Auto-Graded Feedback Card */}
      {isQuestionGraded && (
        <div
          role="status"
          aria-live="polite"
          className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
            isCurrentCorrect
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
              {isCurrentCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
                  <span>تصحيح تلقائي: إجابة صحيحة! (+25 نقطة)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-700 shrink-0" aria-hidden="true" />
                  <span>تصحيح تلقائي: ليست دقيقة هذه المرة — إليك التغذية الراجعة</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => speakArabicText(currentQuestion.explanation)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white/90 text-slate-800 border border-slate-200 rounded-lg hover:bg-white cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
              اسمع التفسير
            </button>
          </div>

          <p className="text-sm leading-relaxed text-slate-900">{currentQuestion.explanation}</p>

          {lesson.subjectId !== 'french' && (
            <div className="pt-2.5 border-t border-slate-300/60 text-xs text-slate-800 space-y-1">
              <div className="font-bold text-sky-900">
                تعزيز الفهم من الدرس ({currentQuestion.relatedStepTitle}):
              </div>
              <p className="leading-relaxed">{currentQuestion.relatedTakeaway}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBackToLab}
          className="text-xs font-semibold text-slate-600 hover:text-sky-700 cursor-pointer"
        >
          العودة للمختبر التفاعلي
        </button>

        {isQuestionGraded && (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
          >
            {currentIdx + 1 < questions.length
              ? 'السؤال التالي'
              : 'عرض التصحيح الشامل والنتيجة'}
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};
