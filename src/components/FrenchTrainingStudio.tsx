import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Ear,
  FileText,
  GraduationCap,
  Languages,
  RotateCcw,
  Sparkles,
  Volume2,
  XCircle,
} from 'lucide-react';
import { GRADES } from '../data/tunisianCurriculum';
import { FRENCH_TRAINING_PROGRAMS } from '../data/frenchTrainingData';
import { GradeLevel } from '../types/curriculum';
import { speakFrenchText, SpeechSpeed } from '../utils/frenchSpeech';
import { FrenchSpeakableText } from './FrenchSpeakableText';
import { ExerciseEngine } from './ExerciseEngine';

interface FrenchTrainingStudioProps {
  selectedGrade: GradeLevel;
  studentName: string;
  onRecordFrenchTraining: (
    title: string,
    score: number,
    total: number,
    pointsEarned: number
  ) => void;
}

type StudioTab = 'vocab' | 'listening' | 'grammar' | 'reading';

export const FrenchTrainingStudio: React.FC<FrenchTrainingStudioProps> = ({
  selectedGrade,
  studentName,
  onRecordFrenchTraining,
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('vocab');
  const [speed, setSpeed] = useState<SpeechSpeed>('normal');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');

  // Listening exercise state
  const [listenIdx, setListenIdx] = useState(0);
  const [listenSelected, setListenSelected] = useState<number | null>(null);
  const [listenSubmitted, setListenSubmitted] = useState(false);
  const [listenScore, setListenScore] = useState(0);
  const [listenFinished, setListenFinished] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Reading comprehension state
  const [showArabicTranslation, setShowArabicTranslation] = useState(false);
  const [readingAnswers, setReadingAnswers] = useState<Record<string, number>>({});
  const [readingSubmitted, setReadingSubmitted] = useState(false);

  const program = FRENCH_TRAINING_PROGRAMS[selectedGrade];
  const gradeMeta = GRADES.find((g) => g.grade === selectedGrade) ?? GRADES[2];
  const themes = Array.from(new Set(program.vocabCards.map((c) => c.theme)));

  const visibleVocab =
    selectedTheme === 'all'
      ? program.vocabCards
      : program.vocabCards.filter((c) => c.theme === selectedTheme);

  const currentListen = program.listeningItems[listenIdx];

  const handlePlayListeningAudio = (id: string, text: string) => {
    speakFrenchText(text, {
      speed,
      onStart: () => setPlayingAudioId(id),
      onEnd: () => setPlayingAudioId((prev) => (prev === id ? null : prev)),
    });
  };

  const handleCheckListen = () => {
    if (!currentListen || listenSelected === null || listenSubmitted) return;
    setListenSubmitted(true);
    if (listenSelected === currentListen.correctIndex) {
      setListenScore((s) => s + 1);
    }
  };

  const handleNextListen = () => {
    if (listenIdx + 1 < program.listeningItems.length) {
      setListenIdx((i) => i + 1);
      setListenSelected(null);
      setListenSubmitted(false);
    } else {
      const total = program.listeningItems.length;
      const earned = listenScore * 20 + (listenScore === total ? 40 : 15);
      setListenFinished(true);
      onRecordFrenchTraining(
        `تدريب الاستماع بالفرنسية (${gradeMeta.shortLabel})`,
        listenScore,
        total,
        earned
      );
    }
  };

  const handleRestartListening = () => {
    setListenIdx(0);
    setListenSelected(null);
    setListenSubmitted(false);
    setListenScore(0);
    setListenFinished(false);
  };

  const activePassage = program.readingPassages[0];

  const handleCheckReading = () => {
    if (!activePassage || readingSubmitted) return;
    const total = activePassage.questions.length;
    const score = activePassage.questions.reduce(
      (acc, q) => acc + (readingAnswers[q.id] === q.correctIndex ? 1 : 0),
      0
    );
    setReadingSubmitted(true);
    const points = score * 20 + 25;
    onRecordFrenchTraining(
      `القراءة الجهرية: ${activePassage.titleAr}`,
      score,
      total,
      points
    );
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-indigo-700">
              {program.levelBadge} · المنهاج الرسمي للجمهورية التونسية 2026
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
              أكاديمية اللغة الفرنسية التفاعلية
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              {program.focusSummary} اضغط على أي كلمة أو جملة فرنسية لسماع نطقها الصحيح، وتدرّب على الاستماع والقراءة والقواعد.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setSpeed('normal')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  speed === 'normal'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                سرعة عادية (0.9×)
              </button>
              <button
                type="button"
                onClick={() => setSpeed('slow')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  speed === 'slow'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                نطق بطيء (0.68×)
              </button>
            </div>
          </div>
        </div>

        {/* 4 Skill Module Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('vocab')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'vocab'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            المعجم والنطق ({program.vocabCards.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('listening')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'listening'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ear className="w-4 h-4 text-sky-600" aria-hidden="true" />
            الاستماع والفهم ({program.listeningItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('grammar')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'grammar'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-600" aria-hidden="true" />
            القواعد والجمل ({program.grammarExercises.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reading')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'reading'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            القراءة الجهرية الموجهة
          </button>
        </div>
      </div>

      {/* TAB 1: Vocabulary & Interactive Pronunciation */}
      {activeTab === 'vocab' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedTheme('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap ${
                  selectedTheme === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                جميع المحاور ({program.vocabCards.length})
              </button>
              {themes.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setSelectedTheme(theme)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap ${
                    selectedTheme === theme
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500">
              اضغط على الكلمة أو الجملة للاستماع للنطق الفرنسي مباشرة
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleVocab.map((card) => (
              <article
                key={card.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-indigo-700">{card.theme}</span>
                    <span>{card.phonetic}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      dir="ltr"
                      onClick={() =>
                        speakFrenchText(
                          card.article ? `${card.article.split('/')[0].trim()} ${card.frWord}` : card.frWord,
                          { speed }
                        )
                      }
                      className="text-left text-xl font-bold text-slate-900 hover:text-indigo-700 transition-colors cursor-pointer"
                    >
                      {card.article && (
                        <span className="text-indigo-600 font-semibold mr-1.5">
                          {card.article}
                        </span>
                      )}
                      {card.frWord}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        speakFrenchText(
                          card.article ? `${card.article.split('/')[0].trim()} ${card.frWord}` : card.frWord,
                          { speed }
                        )
                      }
                      aria-label={`استمع لنطق ${card.frWord}`}
                      className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer shrink-0"
                    >
                      <Volume2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="text-sm font-semibold text-slate-800">{card.arMeaning}</div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <FrenchSpeakableText
                    text={card.exampleFr}
                    speed={speed}
                    size="sm"
                    sentenceButtonLabel="المثال"
                  />
                  <p className="text-xs text-slate-600 leading-relaxed">{card.exampleAr}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Listening & Comprehension */}
      {activeTab === 'listening' && (
        <div className="max-w-3xl mx-auto">
          {listenFinished ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-indigo-600" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-2xl font-display font-bold text-slate-900">
                  أحسنت يا {studentName || 'عزيز'}! أتممت تدريب الاستماع
                </h2>
                <p className="text-sm text-slate-600">
                  حقّقت{' '}
                  <strong className="font-mono text-slate-900 tabular-nums">
                    {listenScore} / {program.listeningItems.length}
                  </strong>{' '}
                  في الفهم السماعي للغة الفرنسية.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRestartListening}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                أعد تدريب الاستماع
              </button>
            </div>
          ) : currentListen ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
                <span className="font-semibold text-indigo-700">
                  تدريب الفهم السماعي · {gradeMeta.shortLabel}
                </span>
                <span className="font-mono tabular-nums">
                  التسجيل {listenIdx + 1} من {program.listeningItems.length}
                </span>
              </div>

              <h2 className="text-lg font-display font-bold text-slate-900">
                {currentListen.promptAr}
              </h2>

              <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Ear className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-slate-900">
                      اضغط للاستماع إلى الجملة الفرنسية
                    </div>
                    <div className="text-xs text-slate-600">
                      يمكنك إعادة الاستماع بالسرعة البطيئة أو العادية قبل اختيار الإجابة.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      handlePlayListeningAudio(currentListen.id, currentListen.audioFr)
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                    {playingAudioId === currentListen.id ? 'جاري النطق...' : 'استمع الآن'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {currentListen.options.map((opt, idx) => {
                  const selected = listenSelected === idx;
                  const right = listenSubmitted && idx === currentListen.correctIndex;
                  const wrong = listenSubmitted && selected && !right;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={listenSubmitted}
                      dir={/[a-zA-ZÀ-ÿ]/.test(opt) && !/[\u0600-\u06FF]/.test(opt) ? 'ltr' : 'rtl'}
                      onClick={() => setListenSelected(idx)}
                      className={`p-4 rounded-xl border text-sm sm:text-base font-medium transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                        right
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                          : wrong
                          ? 'bg-rose-50 border-rose-400 text-rose-950'
                          : selected
                          ? 'bg-sky-50 border-sky-600 text-sky-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <span>{opt}</span>
                      {right && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                      )}
                      {wrong && (
                        <XCircle className="w-4 h-4 text-rose-700 shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>

              {listenSubmitted && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-sm">
                  <div className="font-bold text-slate-900">النص الكامل للتسجيل:</div>
                  <FrenchSpeakableText
                    text={currentListen.audioFr}
                    speed={speed}
                    sentenceButtonLabel="استمع مجدداً"
                  />
                  <div className="text-slate-700">{currentListen.explanationAr}</div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  النتيجة: {listenScore} / {program.listeningItems.length}
                </span>

                {!listenSubmitted ? (
                  <button
                    type="button"
                    disabled={listenSelected === null}
                    onClick={handleCheckListen}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-xl cursor-pointer"
                  >
                    تحقّق من الإجابة
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextListen}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
                  >
                    {listenIdx + 1 < program.listeningItems.length
                      ? 'التسجيل التالي'
                      : 'إنهاء وجمع النقاط'}
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 3: Grammar & Sentence Building Drills */}
      {activeTab === 'grammar' && (
        <div className="max-w-3xl mx-auto">
          <ExerciseEngine
            key={`french-grammar-${selectedGrade}`}
            exercises={program.grammarExercises}
            modeLabel={`قواعد الفرنسية وتراكيبها · ${gradeMeta.shortLabel}`}
            onComplete={(score, total, points) =>
              onRecordFrenchTraining(
                `ورشة القواعد الفرنسية (${gradeMeta.shortLabel})`,
                score,
                total,
                points
              )
            }
          />
        </div>
      )}

      {/* TAB 4: Expressive Guided Reading */}
      {activeTab === 'reading' && activePassage && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="text-xs font-semibold text-indigo-700">
                  {activePassage.trimester} · {activePassage.titleAr}
                </div>
                <h2 dir="ltr" className="text-xl font-bold text-slate-900 mt-0.5">
                  {activePassage.titleFr}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    speakFrenchText(activePassage.paragraphsFr.join(' '), { speed })
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer whitespace-nowrap"
                >
                  <Volume2 className="w-4 h-4" aria-hidden="true" />
                  اقرأ النص كاملاً
                </button>
                <button
                  type="button"
                  onClick={() => setShowArabicTranslation((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap"
                >
                  <Languages className="w-4 h-4" aria-hidden="true" />
                  {showArabicTranslation ? 'إخفاء الترجمة' : 'ترجمة عربية مساعدة'}
                </button>
              </div>
            </div>

            <div className="text-xs text-indigo-700 font-medium">
              اضغط على أي كلمة داخل الفقرة للاستماع إلى نطقها منفردة:
            </div>

            <div className="space-y-4 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200">
              {activePassage.paragraphsFr.map((para, idx) => (
                <FrenchSpeakableText
                  key={idx}
                  text={para}
                  speed={speed}
                  size="lg"
                  sentenceButtonLabel={`فقرة ${idx + 1}`}
                />
              ))}
            </div>

            {showArabicTranslation && (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                <div className="text-xs font-bold text-amber-900">المعنى العام بالعربية:</div>
                <p className="text-sm text-slate-800 leading-relaxed">
                  {activePassage.translationAr}
                </p>
              </div>
            )}
          </div>

          <aside className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-lg font-display font-bold text-slate-900">
                أسئلة فهم المقروء
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                أجب عن أسئلة النص لتثبيت الفهم وجمع نقاط التميّز في الفرنسية.
              </p>
            </div>

            <div className="space-y-5">
              {activePassage.questions.map((q, qIdx) => {
                const chosen = readingAnswers[q.id];
                return (
                  <div key={q.id} className="space-y-2.5">
                    <div className="text-sm font-bold text-slate-900">
                      {qIdx + 1}. {q.prompt}
                    </div>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = chosen === optIdx;
                        const isRight = readingSubmitted && optIdx === q.correctIndex;
                        const isWrong = readingSubmitted && isSelected && !isRight;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={readingSubmitted}
                            onClick={() =>
                              setReadingAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                            }
                            className={`w-full p-3 rounded-xl border text-right text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                              isRight
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                                : isWrong
                                ? 'bg-rose-50 border-rose-400 text-rose-950'
                                : isSelected
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
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
                    {readingSubmitted && (
                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!readingSubmitted ? (
              <button
                type="button"
                disabled={
                  Object.keys(readingAnswers).length < activePassage.questions.length
                }
                onClick={handleCheckReading}
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-xl cursor-pointer"
              >
                تحقّق واجمع النقاط
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setReadingAnswers({});
                  setReadingSubmitted(false);
                }}
                className="w-full py-2.5 px-4 text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                إعادة المحاولة
              </button>
            )}
          </aside>
        </div>
      )}
    </section>
  );
};
