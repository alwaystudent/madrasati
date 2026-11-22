import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  Volume2,
  HeartHandshake,
} from 'lucide-react';
import { Exercise } from '../types/curriculum';
import { speakFrenchText } from '../utils/frenchSpeech';
import { speakArabicText, stopArabicSpeech } from '../utils/arabicSpeech';

interface ExerciseEngineProps {
  exercises: Exercise[];
  onComplete: (score: number, total: number, pointsEarned: number) => void;
  onBackToSim?: () => void;
  onOpenPostLessonQuiz?: () => void;
  modeLabel?: string;
  supportTip?: string;
}

export const ExerciseEngine: React.FC<ExerciseEngineProps> = ({
  exercises,
  onComplete,
  onBackToSim,
  onOpenPostLessonQuiz,
  modeLabel = 'تمارين تفاعلية متنوعة',
  supportTip,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [comboBonusTotal, setComboBonusTotal] = useState(0);
  const [easyMode, setEasyMode] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [finished, setFinished] = useState(false);
  const [finalPointsEarned, setFinalPointsEarned] = useState(0);
  const [mascotFailed, setMascotFailed] = useState(false);

  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);
  const [selectedBlankChoice, setSelectedBlankChoice] = useState<string | null>(null);
  const [orderedTokens, setOrderedTokens] = useState<string[]>([]);
  const [classifiedBins, setClassifiedBins] = useState<Record<string, 'A' | 'B'>>({});

  const exercise = exercises[currentIdx];

  const resetCurrentInputs = () => {
    stopArabicSpeech();
    setSubmitted(false);
    setIsCorrect(false);
    setShowHint(easyMode);
    setSelectedChoiceIdx(null);
    setSelectedBlankChoice(null);
    setOrderedTokens([]);
    setClassifiedBins({});
  };

  const canCheck = (() => {
    if (!exercise || submitted) return false;
    switch (exercise.type) {
      case 'choice':
        return selectedChoiceIdx !== null;
      case 'fill_blank':
        return selectedBlankChoice !== null;
      case 'order':
        return orderedTokens.length === exercise.tokens.length;
      case 'classify':
        return Object.keys(classifiedBins).length === exercise.items.length;
    }
  })();

  const handleCheck = () => {
    if (!exercise || submitted) return;
    let right = false;

    switch (exercise.type) {
      case 'choice':
        right = selectedChoiceIdx === exercise.correctIndex;
        break;
      case 'fill_blank':
        right = selectedBlankChoice === exercise.correctChoice;
        break;
      case 'order':
        right =
          orderedTokens.length === exercise.correctOrder.length &&
          orderedTokens.every((tok, idx) => tok === exercise.correctOrder[idx]);
        break;
      case 'classify':
        right = exercise.items.every((item) => classifiedBins[item.id] === item.targetBin);
        break;
    }

    setSubmitted(true);
    setIsCorrect(right);
    if (right) {
      const nextStreak = streak + 1;
      setScore((s) => s + 1);
      setStreak(nextStreak);
      if (nextStreak >= 2) {
        setComboBonusTotal((b) => b + 10);
      }
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < exercises.length) {
      setCurrentIdx((i) => i + 1);
      resetCurrentInputs();
    } else {
      const basePoints = score * 20;
      const completionBonus =
        score === exercises.length ? 80 : score >= Math.ceil(exercises.length * 0.5) ? 50 : 20;
      const totalPoints = basePoints + comboBonusTotal + completionBonus;
      setFinalPointsEarned(totalPoints);
      setFinished(true);
      onComplete(score, exercises.length, totalPoints);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setComboBonusTotal(0);
    setFinished(false);
    setFinalPointsEarned(0);
    resetCurrentInputs();
  };

  if (finished) {
    const percent = Math.round((score / exercises.length) * 100);
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-6">
        <div className="w-24 h-24 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center overflow-hidden">
          {!mascotFailed ? (
            <img
              src="/src/assets/images/mascot_fanak_fox_1795189779395.jpg"
              alt="فنك الذكي يهنئك"
              referrerPolicy="no-referrer"
              onError={() => setMascotFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <Award className="w-10 h-10 text-amber-600" aria-hidden="true" />
          )}
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-2xl font-display font-bold text-slate-900">
            {percent === 100
              ? 'علامة كاملة! أداء استثنائي'
              : percent >= 75
              ? 'أحسنت يا بطل! إنجاز رائع'
              : 'بداية موفقة! خطوة بخطوة ستتقنها'}
          </h3>
          <p className="text-sm text-slate-600">
            أجبتَ عن <strong className="font-mono text-slate-900 tabular-nums">{score}</strong> من أصل{' '}
            <strong className="font-mono text-slate-900 tabular-nums">{exercises.length}</strong> تمارين، وحصلت على{' '}
            <strong className="font-mono text-amber-700 tabular-nums">+{finalPointsEarned} نقطة</strong> في رصيدك.
          </p>
        </div>

        <div className="max-w-sm mx-auto grid grid-cols-3 gap-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div>
            <div className="text-slate-500">نقاط الإجابات</div>
            <div className="font-mono font-bold text-slate-900 mt-0.5 tabular-nums">
              +{score * 20}
            </div>
          </div>
          <div>
            <div className="text-slate-500">مكافأة التتابع</div>
            <div className="font-mono font-bold text-amber-700 mt-0.5 tabular-nums">
              +{comboBonusTotal}
            </div>
          </div>
          <div>
            <div className="text-slate-500">مكافأة الإتمام</div>
            <div className="font-mono font-bold text-emerald-700 mt-0.5 tabular-nums">
              +{finalPointsEarned - score * 20 - comboBonusTotal}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onOpenPostLessonQuiz && (
            <button
              type="button"
              onClick={onOpenPostLessonQuiz}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" aria-hidden="true" />
              ابدأ الاختبار القصير للدرس (تصحيح تلقائي)
            </button>
          )}
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            أعد التمارين لتحسين النتيجة
          </button>
          {onBackToSim && (
            <button
              type="button"
              onClick={onBackToSim}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer"
            >
              العودة إلى المختبر التفاعلي
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!exercise) return null;

  const toggleToken = (token: string) => {
    if (submitted) return;
    if (orderedTokens.includes(token)) {
      setOrderedTokens((prev) => prev.filter((t) => t !== token));
    } else {
      setOrderedTokens((prev) => [...prev, token]);
    }
  };

  const toggleBin = (itemId: string, bin: 'A' | 'B') => {
    if (submitted) return;
    setClassifiedBins((prev) => ({ ...prev, [itemId]: bin }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="text-slate-900 font-semibold">{modeLabel}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">
            السؤال {currentIdx + 1} من {exercises.length}
          </span>
          {streak >= 2 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-amber-700 font-semibold inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                سلسلة متتالية ({streak}) +10 نقاط
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              const next = !easyMode;
              setEasyMode(next);
              if (next) setShowHint(true);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
              easyMode
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" aria-hidden="true" />
            {easyMode ? 'الوضع المبسّط مفعل' : 'الوضع المبسّط'}
          </button>

          <button
            type="button"
            onClick={() => setShowHint((h) => !h)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
            {showHint ? 'إخفاء التلميح' : 'تلميح ذكي'}
          </button>
        </div>
      </div>

      {supportTip && easyMode && (
        <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs sm:text-sm text-emerald-950 leading-relaxed">
          <strong>مساعدة سريعة: </strong>
          {supportTip}
        </div>
      )}

      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-sky-600 transition-all duration-200"
          style={{ width: `${((currentIdx + (submitted ? 1 : 0)) / exercises.length) * 100}%` }}
        />
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-medium text-sky-700">
            {exercise.type === 'choice' && 'اختيار من متعدد · +20 نقطة'}
            {exercise.type === 'order' && 'رتّب البطاقات بالضغط عليها بالتسلسل الصحيح · +20 نقطة'}
            {exercise.type === 'classify' && 'صنّف كل عنصر في المجموعة المناسبة · +20 نقطة'}
            {exercise.type === 'fill_blank' && 'أكمل الفراغ بالكلمة أو العدد المناسب · +20 نقطة'}
          </div>
          <button
            type="button"
            onClick={() =>
              exercise.ltr
                ? speakFrenchText(exercise.prompt, { speed: easyMode ? 'slow' : 'normal' })
                : speakArabicText(exercise.prompt, easyMode ? 'slow' : 'normal')
            }
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
            استمع للسؤال
          </button>
        </div>
        <h3
          className={`font-display font-bold text-slate-900 leading-snug ${
            easyMode ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
          }`}
        >
          {exercise.prompt}
        </h3>
      </div>

      {(showHint || easyMode) && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-950">
          <Lightbulb className="w-4 h-4 mt-0.5 text-amber-700 shrink-0" aria-hidden="true" />
          <div>
            <strong>تلميح مساعد: </strong>
            {exercise.hint}
          </div>
        </div>
      )}

      {exercise.type === 'choice' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {exercise.options.map((opt, idx) => {
            const isSelected = selectedChoiceIdx === idx;
            const isRightOption = submitted && idx === exercise.correctIndex;
            const isWrongSelection = submitted && isSelected && !isRightOption;

            return (
              <div
                key={idx}
                className={`rounded-xl border transition-colors flex items-center justify-between gap-2 ${
                  isRightOption
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                    : isWrongSelection
                    ? 'bg-rose-50 border-rose-400 text-rose-950'
                    : isSelected
                    ? 'bg-sky-50 border-sky-600 text-sky-950 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  disabled={submitted}
                  dir={exercise.ltr ? 'ltr' : 'rtl'}
                  onClick={() => setSelectedChoiceIdx(idx)}
                  className={`flex-1 p-4 text-sm sm:text-base font-medium cursor-pointer flex items-center justify-between gap-2 ${
                    exercise.ltr ? 'text-left' : 'text-right'
                  }`}
                >
                  <span>{opt}</span>
                  {isRightOption && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                  )}
                  {isWrongSelection && (
                    <XCircle className="w-4 h-4 text-rose-700 shrink-0" aria-hidden="true" />
                  )}
                </button>
                {exercise.ltr && /[a-zA-ZÀ-ÿ]/.test(opt) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakFrenchText(opt);
                    }}
                    title="استمع لنطق هذا الخيار"
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
      )}

      {exercise.type === 'fill_blank' && (
        <div className="space-y-4">
          <div
            dir={exercise.ltr ? 'ltr' : 'rtl'}
            className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-base sm:text-lg font-medium text-slate-900 leading-relaxed flex flex-wrap items-center justify-between gap-3"
          >
            <div>
              <span>{exercise.beforeBlank}</span>
              <span
                className={`inline-block min-w-[80px] text-center mx-1.5 px-3 py-1 rounded-lg border font-bold ${
                  submitted
                    ? isCorrect
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                      : 'bg-rose-100 border-rose-400 text-rose-900'
                    : selectedBlankChoice
                    ? 'bg-sky-100 border-sky-500 text-sky-900'
                    : 'bg-white border-dashed border-slate-400 text-slate-400'
                }`}
              >
                {selectedBlankChoice ?? '.....'}
              </span>
              <span>{exercise.afterBlank}</span>
            </div>

            {exercise.ltr &&
              /[a-zA-ZÀ-ÿ]/.test(`${exercise.beforeBlank} ${exercise.afterBlank}`) && (
                <button
                  type="button"
                  onClick={() =>
                    speakFrenchText(
                      `${exercise.beforeBlank}${selectedBlankChoice ?? exercise.correctChoice}${exercise.afterBlank}`
                    )
                  }
                  title="استمع لنطق الجملة"
                  aria-label="استمع للجملة بالفرنسية"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer shrink-0"
                >
                  <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                  استمع
                </button>
              )}
          </div>

          <div className="flex flex-wrap gap-2.5">
            {exercise.choices.map((ch) => {
              const active = selectedBlankChoice === ch;
              return (
                <button
                  key={ch}
                  type="button"
                  disabled={submitted}
                  dir={exercise.ltr ? 'ltr' : 'rtl'}
                  onClick={() => {
                    setSelectedBlankChoice(ch);
                    if (exercise.ltr && /[a-zA-ZÀ-ÿ]/.test(ch)) {
                      speakFrenchText(ch);
                    }
                  }}
                  className={`px-4 py-2.5 rounded-lg border text-sm font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-sky-300 hover:bg-sky-50'
                  }`}
                >
                  {ch}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {exercise.type === 'order' && (
        <div className="space-y-4">
          <div
            dir={exercise.ltr ? 'ltr' : 'rtl'}
            className="min-h-[68px] p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2"
          >
            <div className="flex flex-wrap items-center gap-2">
              {orderedTokens.length === 0 ? (
                <span className="text-xs text-slate-400">
                  اضغط على البطاقات بالأسفل لترتيبها هنا...
                </span>
              ) : (
                orderedTokens.map((tok, i) => (
                  <button
                    key={`${tok}-${i}`}
                    type="button"
                    disabled={submitted}
                    onClick={() => toggleToken(tok)}
                    className="px-3.5 py-2 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition-colors cursor-pointer"
                  >
                    <span className="font-mono text-xs opacity-75 ml-1.5 tabular-nums">
                      {i + 1}.
                    </span>
                    {tok}
                  </button>
                ))
              )}
            </div>

            {exercise.ltr && orderedTokens.length > 0 && (
              <button
                type="button"
                onClick={() => speakFrenchText(orderedTokens.join(' '))}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                نطق
              </button>
            )}
          </div>

          <div dir={exercise.ltr ? 'ltr' : 'rtl'} className="flex flex-wrap gap-2">
            {exercise.tokens.map((tok) => {
              const used = orderedTokens.includes(tok);
              return (
                <button
                  key={tok}
                  type="button"
                  disabled={submitted || used}
                  onClick={() => {
                    toggleToken(tok);
                    if (exercise.ltr && !used && /[a-zA-ZÀ-ÿ]/.test(tok)) {
                      speakFrenchText(tok);
                    }
                  }}
                  className={`px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    used
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-sky-500 hover:bg-sky-50 cursor-pointer'
                  }`}
                >
                  {tok}
                </button>
              );
            })}
          </div>

          {submitted && !isCorrect && (
            <div className="text-xs text-slate-600 bg-slate-100 p-3 rounded-lg">
              <strong>الترتيب الصحيح: </strong>
              <span dir={exercise.ltr ? 'ltr' : 'rtl'} className="font-semibold text-slate-900">
                {exercise.correctOrder.join(' ← ')}
              </span>
            </div>
          )}
        </div>
      )}

      {exercise.type === 'classify' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2.5">
            {exercise.items.map((item) => {
              const chosen = classifiedBins[item.id];
              const itemRight = submitted && chosen === item.targetBin;
              const itemWrong = submitted && chosen !== item.targetBin;
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    itemRight
                      ? 'bg-emerald-50 border-emerald-300'
                      : itemWrong
                      ? 'bg-rose-50 border-rose-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {exercise.ltr && /[a-zA-ZÀ-ÿ]/.test(item.label) && (
                      <button
                        type="button"
                        onClick={() => speakFrenchText(item.label)}
                        aria-label={`استمع إلى ${item.label}`}
                        className="p-1.5 rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer shrink-0"
                      >
                        <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                    <span
                      dir={exercise.ltr ? 'ltr' : 'rtl'}
                      className="text-sm font-semibold text-slate-900"
                    >
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={submitted}
                      onClick={() => toggleBin(item.id, 'A')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                        chosen === 'A'
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {exercise.binALabel}
                    </button>
                    <button
                      type="button"
                      disabled={submitted}
                      onClick={() => toggleBin(item.id, 'B')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                        chosen === 'B'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {exercise.binBLabel}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {submitted && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
            isCorrect
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          {isCorrect ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <div className="space-y-1">
            <div className="font-bold">
              {isCorrect
                ? `إجابة صحيحة! (+20 نقطة${streak >= 2 ? ' +10 للتتابع' : ''})`
                : 'ليست دقيقة هذه المرة، إليك التفسير:'}
            </div>
            <p className="text-slate-800">{exercise.explanation}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-500 font-mono tabular-nums">
          النتيجة الحالية: {score} / {exercises.length}
        </span>

        {!submitted ? (
          <button
            type="button"
            disabled={!canCheck}
            onClick={handleCheck}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              canCheck
                ? 'bg-sky-600 hover:bg-sky-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            تحقّق من الإجابة
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            {currentIdx + 1 < exercises.length ? 'التمرين التالي' : 'إنهاء وجمع النقاط والأوسمة'}
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};
