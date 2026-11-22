import React, { useEffect, useMemo, useState } from 'react';
import {
  BookMarked,
  BookOpen,
  Calendar,
  CheckCircle2,
  Ear,
  FileText,
  GraduationCap,
  Languages,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Trash2,
  Volume2,
  XCircle,
} from 'lucide-react';
import { TRIMESTERS } from '../data/tunisianCurriculum';
import { FRENCH_TRAINING_PROGRAMS } from '../data/frenchTrainingData';
import { FavoriteFrenchWord, GradeLevel, Lesson, TrimesterType } from '../types/curriculum';
import { FrenchGlossaryEntry } from '../utils/frenchGlossary';
import { formatTrimesterFr, getFrenchLessonDisplay } from '../utils/frenchLessonDisplay';
import { speakFrenchText, SpeechSpeed } from '../utils/frenchSpeech';
import { FrenchSpeakableText } from './FrenchSpeakableText';
import { FrenchWordGlossaryCorner } from './FrenchWordGlossaryCorner';
import { ExerciseEngine } from './ExerciseEngine';

export type FrenchStudioTab =
  | 'vocab'
  | 'listening'
  | 'grammar'
  | 'reading'
  | 'glossary'
  | 'favorites'
  | 'lessons';

interface FrenchTrainingStudioProps {
  selectedGrade: GradeLevel;
  studentName: string;
  frenchLessons?: Lesson[];
  favoriteWords: FavoriteFrenchWord[];
  isCloudSynced?: boolean;
  initialTab?: FrenchStudioTab;
  onSelectLesson?: (lesson: Lesson) => void;
  onToggleFavoriteWord: (entry: FrenchGlossaryEntry) => void;
  onRemoveFavoriteWord: (wordId: string) => void;
  onRecordFrenchTraining: (
    title: string,
    score: number,
    total: number,
    pointsEarned: number
  ) => void;
}

function extractFrenchThemeLabel(theme: string): string {
  const match = theme.match(/\(([^)]+)\)/);
  return match ? match[1] : theme;
}

export const FrenchTrainingStudio: React.FC<FrenchTrainingStudioProps> = ({
  selectedGrade,
  frenchLessons = [],
  favoriteWords,
  isCloudSynced = false,
  initialTab,
  onSelectLesson,
  onToggleFavoriteWord,
  onRemoveFavoriteWord,
  onRecordFrenchTraining,
}) => {
  const [activeTab, setActiveTab] = useState<FrenchStudioTab>(initialTab ?? 'vocab');
  const [speed, setSpeed] = useState<SpeechSpeed>('normal');
  const [selectedTrimester, setSelectedTrimester] = useState<'all' | TrimesterType>('all');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');

  // Favorite words review state
  const [favQuery, setFavQuery] = useState('');
  const [favSortMode, setFavSortMode] = useState<'alpha' | 'recent'>('alpha');
  const [favQuizActive, setFavQuizActive] = useState(false);
  const [favQuizTarget, setFavQuizTarget] = useState<FavoriteFrenchWord | null>(null);
  const [favQuizOptions, setFavQuizOptions] = useState<FavoriteFrenchWord[]>([]);
  const [favQuizPickedId, setFavQuizPickedId] = useState<string | null>(null);
  const [favQuizStats, setFavQuizStats] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const favoriteWordKeys = useMemo(
    () => new Set(favoriteWords.map((w) => w.word.trim().toLowerCase())),
    [favoriteWords]
  );

  const visibleFavorites = useMemo(() => {
    const q = favQuery.trim().toLowerCase();
    const list = favoriteWords.filter(
      (w) =>
        !q ||
        w.word.toLowerCase().includes(q) ||
        (w.article && w.article.toLowerCase().includes(q))
    );
    if (favSortMode === 'recent') {
      return [...list].sort((a, b) => b.savedAtIso.localeCompare(a.savedAtIso));
    }
    return [...list].sort((a, b) =>
      a.word.localeCompare(b.word, 'fr', { sensitivity: 'base' })
    );
  }, [favoriteWords, favQuery, favSortMode]);

  const startNextFavoriteRound = (pool: FavoriteFrenchWord[]) => {
    if (pool.length < 2) {
      setFavQuizActive(false);
      return;
    }
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const target = shuffled[0];
    const distractors = shuffled.slice(1, Math.min(4, shuffled.length));
    const options = [target, ...distractors].sort(() => Math.random() - 0.5);
    setFavQuizTarget(target);
    setFavQuizOptions(options);
    setFavQuizPickedId(null);
    setFavQuizActive(true);
    speakFrenchText(
      target.article ? `${target.article.split('/')[0].trim()} ${target.word}` : target.word,
      { speed }
    );
  };

  // Listening exercise state
  const [listenIdx, setListenIdx] = useState(0);
  const [listenSelected, setListenSelected] = useState<number | null>(null);
  const [listenSubmitted, setListenSubmitted] = useState(false);
  const [listenScore, setListenScore] = useState(0);
  const [listenFinished, setListenFinished] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Reading comprehension state
  const [selectedPassageId, setSelectedPassageId] = useState<string>('');
  const [readingAnswers, setReadingAnswers] = useState<Record<string, number>>({});
  const [readingSubmitted, setReadingSubmitted] = useState(false);

  const program = FRENCH_TRAINING_PROGRAMS[selectedGrade];

  const trimesterVocab = program.vocabCards.filter(
    (c) => selectedTrimester === 'all' || !c.trimester || c.trimester === selectedTrimester
  );
  const themes = Array.from(new Set(trimesterVocab.map((c) => extractFrenchThemeLabel(c.theme))));
  const visibleVocab =
    selectedTheme === 'all'
      ? trimesterVocab
      : trimesterVocab.filter((c) => extractFrenchThemeLabel(c.theme) === selectedTheme);

  const visibleListening = program.listeningItems.filter(
    (item) =>
      selectedTrimester === 'all' || !item.trimester || item.trimester === selectedTrimester
  );
  const visibleGrammar = program.grammarExercises.filter(
    (ex) => selectedTrimester === 'all' || !ex.trimester || ex.trimester === selectedTrimester
  );
  const visiblePassages = program.readingPassages.filter(
    (p) => selectedTrimester === 'all' || p.trimester === selectedTrimester
  );

  const visibleFrenchLessons = frenchLessons.filter(
    (l) => selectedTrimester === 'all' || l.trimester === selectedTrimester
  );

  const activePassage =
    visiblePassages.find((p) => p.id === selectedPassageId) ??
    visiblePassages[0] ??
    program.readingPassages[0];

  const currentListen = visibleListening[listenIdx];

  useEffect(() => {
    setSelectedTheme('all');
    setListenIdx(0);
    setListenSelected(null);
    setListenSubmitted(false);
    setListenScore(0);
    setListenFinished(false);
    setReadingAnswers({});
    setReadingSubmitted(false);
    const firstPass = program.readingPassages.find(
      (p) => selectedTrimester === 'all' || p.trimester === selectedTrimester
    );
    if (firstPass) {
      setSelectedPassageId(firstPass.id);
    }
  }, [selectedGrade, selectedTrimester, program.readingPassages]);

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
    if (listenIdx + 1 < visibleListening.length) {
      setListenIdx((i) => i + 1);
      setListenSelected(null);
      setListenSubmitted(false);
    } else {
      const total = visibleListening.length;
      const earned = listenScore * 20 + (listenScore === total ? 40 : 15);
      setListenFinished(true);
      onRecordFrenchTraining(
        `Écoute en français (${selectedGrade}e année)`,
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
      `Lecture guidée : ${activePassage.titleFr}`,
      score,
      total,
      points
    );
  };

  return (
    <section
      dir="ltr"
      lang="fr"
      className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 text-left"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-white via-white to-indigo-50/50 border-2 border-indigo-100 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-indigo-100">
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-indigo-700">
              {program.levelBadge} · Programme officiel tunisien 2026
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
              Académie de langue française
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              {program.focusSummary}
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
                Vitesse normale (0.9×)
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
                Voix lente (0.68×)
              </button>
            </div>
          </div>
        </div>

        {/* Trimester Switcher Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-indigo-50/70 border border-indigo-100 rounded-xl">
            <span className="inline-flex items-center gap-1.5 px-2 text-xs font-bold text-indigo-800">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              Trimestre :
            </span>
            <button
              type="button"
              onClick={() => setSelectedTrimester('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                selectedTrimester === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              Toute l’année
            </button>
            {TRIMESTERS.map((tri) => (
              <button
                key={tri}
                type="button"
                onClick={() => setSelectedTrimester(tri)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                  selectedTrimester === tri
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                {formatTrimesterFr(tri)}
              </button>
            ))}
          </div>
        </div>

        {/* 7 Skill Module Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('vocab')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'vocab'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            Vocabulaire ({trimesterVocab.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('listening')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'listening'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ear className="w-4 h-4 text-sky-600" aria-hidden="true" />
            Écoute ({visibleListening.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('grammar')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'grammar'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-600" aria-hidden="true" />
            Grammaire ({visibleGrammar.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reading')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'reading'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            Lecture ({visiblePassages.length})
          </button>
          <button
            type="button"
            dir="rtl"
            onClick={() => setActiveTab('glossary')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'glossary'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookMarked className="w-4 h-4 text-rose-600" aria-hidden="true" />
            فهرس الكلمات
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Star
              className={`w-4 h-4 ${
                favoriteWords.length > 0 ? 'fill-amber-400 text-amber-500' : 'text-amber-500'
              }`}
              aria-hidden="true"
            />
            Mots favoris ({favoriteWords.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lessons')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'lessons'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Languages className="w-4 h-4 text-teal-600" aria-hidden="true" />
            Leçons ({visibleFrenchLessons.length})
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
                Tous les thèmes ({trimesterVocab.length})
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

            <button
              type="button"
              onClick={() => setActiveTab('glossary')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer whitespace-nowrap"
            >
              <BookMarked className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Traductions :</span>
              <span dir="rtl">فهرس الكلمات</span>
              <span>(A–Z)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleVocab.map((card) => (
              <article
                key={card.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-indigo-700">
                      {formatTrimesterFr(card.trimester)}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {extractFrenchThemeLabel(card.theme)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
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
                      aria-label={`Écouter ${card.frWord}`}
                      className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer shrink-0"
                    >
                      <Volume2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <FrenchSpeakableText
                    text={card.exampleFr}
                    speed={speed}
                    size="sm"
                    sentenceButtonLabel="Exemple"
                    language="fr"
                  />
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
                  Bravo ! Entraînement d’écoute terminé
                </h2>
                <p className="text-sm text-slate-600">
                  Score obtenu :{' '}
                  <strong className="font-mono text-slate-900 tabular-nums">
                    {listenScore} / {visibleListening.length}
                  </strong>{' '}
                  en compréhension orale.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRestartListening}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                Recommencer l’écoute
              </button>
            </div>
          ) : currentListen ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
                <span className="font-semibold text-indigo-700">
                  Compréhension orale · {selectedGrade}e année
                  {currentListen.trimester ? ` · ${formatTrimesterFr(currentListen.trimester)}` : ''}
                </span>
                <span className="font-mono tabular-nums">
                  Audio {listenIdx + 1} / {visibleListening.length}
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
                      Clique pour écouter la phrase en français
                    </div>
                    <div className="text-xs text-slate-600">
                      Tu peux réécouter en vitesse lente ou normale avant de choisir ta réponse.
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
                    {playingAudioId === currentListen.id ? 'Lecture en cours...' : 'Écouter'}
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
                      onClick={() => setListenSelected(idx)}
                      className={`p-4 rounded-xl border text-left text-sm sm:text-base font-medium transition-colors flex items-center justify-between gap-3 cursor-pointer ${
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
                  <div className="font-bold text-slate-900">Texte audio :</div>
                  <FrenchSpeakableText
                    text={currentListen.audioFr}
                    speed={speed}
                    sentenceButtonLabel="Réécouter"
                    language="fr"
                  />
                  <div className="text-slate-700">{currentListen.explanationAr}</div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  Score : {listenScore} / {visibleListening.length}
                </span>

                {!listenSubmitted ? (
                  <button
                    type="button"
                    disabled={listenSelected === null}
                    onClick={handleCheckListen}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-xl cursor-pointer"
                  >
                    Vérifier
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextListen}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
                  >
                    {listenIdx + 1 < visibleListening.length
                      ? 'Audio suivant'
                      : 'Terminer et enregistrer'}
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 3: Grammar & Applications Drills */}
      {activeTab === 'grammar' && (
        <div className="max-w-3xl mx-auto">
          <ExerciseEngine
            key={`french-grammar-${selectedGrade}-${selectedTrimester}`}
            exercises={visibleGrammar}
            language="fr"
            modeLabel={`Grammaire et exercices · ${selectedGrade}e année`}
            onComplete={(score, total, points) =>
              onRecordFrenchTraining(
                `Atelier de grammaire (${selectedGrade}e année)`,
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
        <div className="space-y-4">
          {visiblePassages.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 p-2 bg-white border border-slate-200 rounded-2xl">
              {visiblePassages.map((pass) => {
                const isSelected = pass.id === activePassage.id;
                return (
                  <button
                    key={pass.id}
                    type="button"
                    onClick={() => {
                      setSelectedPassageId(pass.id);
                      setReadingAnswers({});
                      setReadingSubmitted(false);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-indigo-50'
                    }`}
                  >
                    <span>{formatTrimesterFr(pass.trimester)}</span>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    <span>{pass.titleFr}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="text-xs font-semibold text-indigo-700">
                    {formatTrimesterFr(activePassage.trimester)}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">
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
                    Lire tout le texte
                  </button>
                  <button
                    type="button"
                    dir="rtl"
                    onClick={() => setActiveTab('glossary')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer whitespace-nowrap"
                  >
                    <BookMarked className="w-4 h-4" aria-hidden="true" />
                    فهرس الكلمات
                  </button>
                </div>
              </div>

              <div className="text-xs text-indigo-700 font-medium">
                Clique sur n’importe quel mot pour l’écouter, ou ouvre{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('glossary')}
                  className="underline font-bold cursor-pointer"
                  dir="rtl"
                >
                  فهرس الكلمات
                </button>{' '}
                pour consulter sa traduction :
              </div>

              <div className="space-y-4 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200">
                {activePassage.paragraphsFr.map((para, idx) => (
                  <FrenchSpeakableText
                    key={idx}
                    text={para}
                    speed={speed}
                    size="lg"
                    sentenceButtonLabel={`Paragraphe ${idx + 1}`}
                    language="fr"
                  />
                ))}
              </div>
            </div>

            <aside className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-lg font-display font-bold text-slate-900">
                  Compréhension de l’écrit
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Réponds aux questions ci-dessous pour valider ta compréhension du texte.
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
                              className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center justify-between gap-2 ${
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
                  Vérifier et valider
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
                  Recommencer
                </button>
              )}
            </aside>
          </div>
        </div>
      )}

      {/* TAB 5: Word-Only Alphabetical Glossary (فهرس الكلمات — keeps Arabic translations) */}
      {activeTab === 'glossary' && (
        <div dir="rtl" className="text-right">
          <FrenchWordGlossaryCorner
            selectedGrade={selectedGrade}
            trimester={selectedTrimester}
            speed={speed}
            favoriteWordKeys={favoriteWordKeys}
            favoriteCount={favoriteWords.length}
            onToggleFavoriteWord={onToggleFavoriteWord}
            onOpenFavoritesReview={() => setActiveTab('favorites')}
          />
        </div>
      )}

      {/* TAB 6: Student's Saved Favorite Words Review (French only; link to فهرس الكلمات for translations) */}
      {activeTab === 'favorites' && (
        <div className="bg-white border border-amber-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-amber-100">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" aria-hidden="true" />
                </div>
                <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900">
                  Mes mots favoris — Révision
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span>
                  {favoriteWords.length} {favoriteWords.length > 1 ? 'mots enregistrés' : 'mot enregistré'}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {isCloudSynced
                    ? 'Synchronisé avec votre compte élève'
                    : 'Enregistré sur cet appareil'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {favoriteWords.length >= 2 && (
                <button
                  type="button"
                  onClick={() => {
                    if (favQuizActive) {
                      setFavQuizActive(false);
                    } else {
                      setFavQuizStats({ correct: 0, total: 0 });
                      startNextFavoriteRound(favoriteWords);
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap cursor-pointer ${
                    favQuizActive
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600'
                  }`}
                >
                  <Ear className="w-3.5 h-3.5" aria-hidden="true" />
                  {favQuizActive ? 'Fermer le défi' : 'Défi d’écoute'}
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('glossary')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl whitespace-nowrap cursor-pointer"
              >
                <BookMarked className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Ajouter / Traduire :</span>
                <span dir="rtl">فهرس الكلمات</span>
              </button>
            </div>
          </div>

          {/* Interactive Audio Recall Drill on Favorite Words */}
          {favQuizActive && favQuizTarget && (
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-display font-bold text-indigo-950">
                    Écoute le mot et choisis la bonne carte
                  </div>
                  <div className="text-xs text-slate-600">
                    Progression :{' '}
                    <span className="font-mono tabular-nums">
                      {favQuizStats.correct} / {favQuizStats.total}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    speakFrenchText(
                      favQuizTarget.article
                        ? `${favQuizTarget.article.split('/')[0].trim()} ${favQuizTarget.word}`
                        : favQuizTarget.word,
                      { speed }
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer whitespace-nowrap"
                >
                  <Volume2 className="w-4 h-4" aria-hidden="true" />
                  Réécouter le mot
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {favQuizOptions.map((opt) => {
                  const isPicked = favQuizPickedId === opt.id;
                  const isTarget = opt.id === favQuizTarget.id;
                  const showResult = favQuizPickedId !== null;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={showResult}
                      onClick={() => {
                        setFavQuizPickedId(opt.id);
                        setFavQuizStats((s) => ({
                          correct: s.correct + (opt.id === favQuizTarget.id ? 1 : 0),
                          total: s.total + 1,
                        }));
                      }}
                      className={`p-3.5 rounded-xl border text-left text-base font-bold transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                        showResult && isTarget
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                          : showResult && isPicked && !isTarget
                          ? 'bg-rose-50 border-rose-400 text-rose-950'
                          : 'bg-white border-slate-200 hover:border-indigo-400 text-slate-900'
                      }`}
                    >
                      <span>
                        {opt.article ? `${opt.article} ` : ''}
                        {opt.word}
                      </span>
                      {showResult && isTarget && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                      )}
                      {showResult && isPicked && !isTarget && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>

              {favQuizPickedId !== null && (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-xs font-semibold text-slate-700">
                    {favQuizPickedId === favQuizTarget.id
                      ? 'Bravo ! Bonne réponse.'
                      : `Mot correct : ${favQuizTarget.word}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => startNextFavoriteRound(favoriteWords)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer whitespace-nowrap"
                  >
                    Mot suivant
                  </button>
                </div>
              )}
            </div>
          )}

          {favoriteWords.length === 0 ? (
            <div className="p-8 rounded-2xl bg-amber-50/40 border border-amber-200/80 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-white border border-amber-200 flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-500" aria-hidden="true" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-display font-bold text-slate-900">
                  Ta liste de mots favoris est vide
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Ouvre <span dir="rtl" className="font-bold">فهرس الكلمات</span> et clique sur l’étoile à côté de n’importe quel mot pour l’enregistrer et le réviser ici.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('glossary')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
              >
                <BookMarked className="w-4 h-4" aria-hidden="true" />
                <span>Ouvrir</span>
                <span dir="rtl">فهرس الكلمات</span>
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search
                    className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={favQuery}
                    onChange={(e) => setFavQuery(e.target.value)}
                    placeholder="Rechercher dans mes mots favoris..."
                    className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setFavSortMode('alpha')}
                    className={`px-3 py-1.5 font-semibold rounded-lg cursor-pointer whitespace-nowrap ${
                      favSortMode === 'alpha'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Ordre A → Z
                  </button>
                  <button
                    type="button"
                    onClick={() => setFavSortMode('recent')}
                    className={`px-3 py-1.5 font-semibold rounded-lg cursor-pointer whitespace-nowrap ${
                      favSortMode === 'recent'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Plus récents
                  </button>
                </div>
              </div>

              {visibleFavorites.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-sm text-slate-600">
                  Aucun mot favori ne correspond à cette recherche.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {visibleFavorites.map((item) => (
                    <article
                      key={item.id}
                      className="p-4 rounded-xl bg-amber-50/40 border border-amber-200 hover:border-amber-300 flex flex-col justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-bold shrink-0">
                            {item.letter}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              speakFrenchText(
                                item.article
                                  ? `${item.article.split('/')[0].trim()} ${item.word}`
                                  : item.word,
                                { speed }
                              )
                            }
                            className="text-left text-base sm:text-lg font-bold text-slate-900 hover:text-indigo-700 truncate cursor-pointer"
                          >
                            {item.article && (
                              <span className="text-indigo-600 font-semibold mr-1 text-xs">
                                {item.article}
                              </span>
                            )}
                            {item.word}
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              speakFrenchText(
                                item.article
                                  ? `${item.article.split('/')[0].trim()} ${item.word}`
                                  : item.word,
                                { speed }
                              )
                            }
                            aria-label={`Écouter ${item.word}`}
                            className="p-1.5 rounded-lg bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveFavoriteWord(item.id)}
                            aria-label={`Retirer ${item.word} des favoris`}
                            title="Retirer des favoris"
                            className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between gap-2 text-xs">
                        <span className="font-mono text-slate-500 tabular-nums">
                          {item.grade}e année
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('glossary')}
                          className="inline-flex items-center gap-1 font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                        >
                          <BookMarked className="w-3.5 h-3.5" aria-hidden="true" />
                          <span dir="rtl">فهرس الكلمات</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 7: Integrated Curriculum French Lessons Grouped by Trimester */}
      {activeTab === 'lessons' && (
        <div className="space-y-6">
          {TRIMESTERS.map((tri) => {
            const list = visibleFrenchLessons.filter((l) => l.trimester === tri);
            if (list.length === 0) return null;
            const trimesterLabelFr = formatTrimesterFr(tri);
            return (
              <div key={tri} className="space-y-3">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-indigo-100">
                  <h2 className="text-base sm:text-lg font-display font-bold text-indigo-950 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                    Leçons et activités — {trimesterLabelFr}
                  </h2>
                  <span className="text-xs font-mono text-indigo-700 font-bold tabular-nums">
                    {list.length} {list.length > 1 ? 'leçons' : 'leçon'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {list.map((lesson) => {
                    const { titleFr, subtitleFr } = getFrenchLessonDisplay(lesson);
                    return (
                      <article
                        key={lesson.id}
                        className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-indigo-700">
                              {trimesterLabelFr}
                            </span>
                            <span className="font-mono tabular-nums">
                              {lesson.exercises.length} exercices
                            </span>
                          </div>
                          <h3 className="text-base font-display font-bold text-slate-900 leading-snug">
                            {titleFr}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {subtitleFr}
                          </p>
                        </div>
                        {onSelectLesson && (
                          <button
                            type="button"
                            onClick={() => onSelectLesson(lesson)}
                            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5" aria-hidden="true" />
                            Ouvrir la leçon et les exercices
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
