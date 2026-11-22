import React, { useMemo, useState } from 'react';
import { BookMarked, BookmarkCheck, Search, Star, Volume2 } from 'lucide-react';
import { GradeLevel, TrimesterType } from '../types/curriculum';
import { buildFrenchWordGlossary, FrenchGlossaryEntry } from '../utils/frenchGlossary';
import { speakFrenchText, SpeechSpeed } from '../utils/frenchSpeech';

interface FrenchWordGlossaryCornerProps {
  selectedGrade: GradeLevel;
  trimester?: 'all' | TrimesterType;
  speed?: SpeechSpeed;
  compact?: boolean;
  favoriteWordKeys?: Set<string>;
  favoriteCount?: number;
  onToggleFavoriteWord?: (entry: FrenchGlossaryEntry) => void;
  onOpenFavoritesReview?: () => void;
}

export const FrenchWordGlossaryCorner: React.FC<FrenchWordGlossaryCornerProps> = ({
  selectedGrade,
  trimester = 'all',
  speed = 'normal',
  compact = false,
  favoriteWordKeys,
  favoriteCount = 0,
  onToggleFavoriteWord,
  onOpenFavoritesReview,
}) => {
  const [includeAllGrades, setIncludeAllGrades] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [letterFilter, setLetterFilter] = useState<string>('ALL');

  const { entries, availableLetters } = useMemo(
    () =>
      buildFrenchWordGlossary({
        grade: selectedGrade,
        includeAllGrades,
        trimester: includeAllGrades ? 'all' : trimester,
        query: searchQuery,
        letterFilter,
      }),
    [selectedGrade, includeAllGrades, trimester, searchQuery, letterFilter]
  );

  return (
    <section
      aria-label="فهرس الكلمات"
      className={`bg-white border border-indigo-200 rounded-2xl ${
        compact ? 'p-4 space-y-4' : 'p-5 sm:p-6 space-y-5'
      } shadow-xs`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-indigo-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
              <BookMarked className="w-4 h-4 text-indigo-700" aria-hidden="true" />
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900">
              فهرس الكلمات
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            ركن خاص بترجمة الكلمات الفرنسية فقط، مرتّبة ترتيباً هجائياً بالفرنسية (A → Z).
            {onToggleFavoriteWord &&
              ' اضغط على النجمة لحفظ أي كلمة في «كلماتي المفضلة» ومراجعتها لاحقاً.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenFavoritesReview && (
            <button
              type="button"
              onClick={onOpenFavoritesReview}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
              <span>كلماتي المفضلة</span>
              <span className="font-mono tabular-nums">({favoriteCount})</span>
            </button>
          )}

          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => {
                setIncludeAllGrades(false);
                setLetterFilter('ALL');
              }}
              className={`px-3 py-1.5 font-semibold rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                !includeAllGrades
                  ? 'bg-white text-indigo-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              كلمات السنة {selectedGrade}
            </button>
            <button
              type="button"
              onClick={() => {
                setIncludeAllGrades(true);
                setLetterFilter('ALL');
              }}
              className={`px-3 py-1.5 font-semibold rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                includeAllGrades
                  ? 'bg-white text-indigo-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              كل الفهرس ({entries.length})
            </button>
          </div>
        </div>
      </div>

      {/* Search + A-Z Alphabetical Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search
            className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن كلمة بالفرنسية أو معناها بالعربية..."
            className="w-full pr-9 pl-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div
          dir="ltr"
          className="flex flex-wrap items-center gap-1 p-1.5 bg-indigo-50/60 border border-indigo-100 rounded-xl"
        >
          <button
            type="button"
            onClick={() => setLetterFilter('ALL')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
              letterFilter === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            A–Z
          </button>
          {availableLetters.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => setLetterFilter(letter)}
              className={`w-7 h-7 inline-flex items-center justify-center text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                letterFilter === letter
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Alphabetically Sorted Word List */}
      {entries.length === 0 ? (
        <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-sm text-slate-600">
          لا توجد كلمات مطابقة للبحث الحالي داخل فهرس الكلمات.
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 ${
            compact ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
          } gap-3`}
        >
          {entries.map((entry) => {
            const isFavorite = Boolean(
              favoriteWordKeys?.has(entry.word.trim().toLowerCase())
            );
            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between gap-2.5 p-3.5 rounded-xl border transition-colors ${
                  isFavorite
                    ? 'bg-amber-50/50 border-amber-300 hover:border-amber-400'
                    : 'bg-slate-50/80 border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="min-w-0 text-right flex-1">
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {entry.arMeaning}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0" dir="ltr">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-bold">
                    {entry.letter}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      speakFrenchText(
                        entry.article
                          ? `${entry.article.split('/')[0].trim()} ${entry.word}`
                          : entry.word,
                        { speed }
                      )
                    }
                    className="text-left text-sm sm:text-base font-bold text-slate-900 hover:text-indigo-700 transition-colors cursor-pointer"
                  >
                    {entry.article && (
                      <span className="text-indigo-600 font-semibold mr-1 text-xs">
                        {entry.article}
                      </span>
                    )}
                    {entry.word}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      speakFrenchText(
                        entry.article
                          ? `${entry.article.split('/')[0].trim()} ${entry.word}`
                          : entry.word,
                        { speed }
                      )
                    }
                    aria-label={`استمع إلى ${entry.word}`}
                    className="p-1.5 rounded-lg bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  {onToggleFavoriteWord && (
                    <button
                      type="button"
                      onClick={() => onToggleFavoriteWord(entry)}
                      aria-pressed={isFavorite}
                      aria-label={
                        isFavorite
                          ? `إزالة ${entry.word} من كلماتي المفضلة`
                          : `حفظ ${entry.word} في كلماتي المفضلة`
                      }
                      title={
                        isFavorite
                          ? 'محفوظة في كلماتي المفضلة (اضغط للإزالة)'
                          : 'حفظ في كلماتي المفضلة'
                      }
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isFavorite
                          ? 'bg-amber-100 border-amber-300 text-amber-600 hover:bg-amber-200'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-300'
                      }`}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`}
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

