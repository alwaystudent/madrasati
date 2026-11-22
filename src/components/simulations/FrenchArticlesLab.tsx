import React, { useState } from 'react';
import { Volume2, Languages } from 'lucide-react';
import { FrenchSpeakableText } from '../FrenchSpeakableText';
import { speakFrenchText, SpeechSpeed } from '../../utils/frenchSpeech';

const NOUNS = [
  { word: 'cartable', gender: 'm', articleIndef: 'un', articleDef: 'le', arabic: 'محفظة (مذكر بالفرنسية)', sentence: 'Je porte un cartable bleu.' },
  { word: 'trousse', gender: 'f', articleIndef: 'une', articleDef: 'la', arabic: 'مقلمة (مؤنث بالفرنسية)', sentence: 'La trousse est sur le bureau.' },
  { word: 'livre', gender: 'm', articleIndef: 'un', articleDef: 'le', arabic: 'كتاب (مذكر بالفرنسية)', sentence: 'Aziz lit un livre intéressant.' },
  { word: 'règle', gender: 'f', articleIndef: 'une', articleDef: 'la', arabic: 'مسطرة (مؤنث بالفرنسية)', sentence: 'Il trace un trait avec la règle.' },
];

export const FrenchArticlesLab: React.FC = () => {
  const [nounIdx, setNounIdx] = useState(0);
  const [articleMode, setArticleMode] = useState<'indef' | 'def'>('indef');
  const [speed, setSpeed] = useState<SpeechSpeed>('normal');
  const [speaking, setSpeaking] = useState(false);

  const item = NOUNS[nounIdx];
  const article = articleMode === 'indef' ? item.articleIndef : item.articleDef;
  const phrase = `${article} ${item.word}`;

  const speak = (textToSpeak = phrase) => {
    speakFrenchText(textToSpeak, {
      speed,
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-indigo-700" aria-hidden="true" />
          <span className="font-semibold text-slate-900">
            أدوات التعريف والتنكير (<span dir="ltr">un / une / le / la</span>)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setSpeed('normal')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer ${
                speed === 'normal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              عادي
            </button>
            <button
              type="button"
              onClick={() => setSpeed('slow')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer ${
                speed === 'slow' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              بطيء
            </button>
          </div>

          <button
            type="button"
            onClick={() => speak(phrase)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer"
          >
            <Volume2 className="w-4 h-4" aria-hidden="true" />
            {speaking ? 'جاري النطق...' : 'استمع'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setArticleMode('indef')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
            articleMode === 'indef' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          نكرة (un / une)
        </button>
        <button
          type="button"
          onClick={() => setArticleMode('def')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
            articleMode === 'def' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          معرفة (le / la)
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {NOUNS.map((n, idx) => (
          <button
            key={n.word}
            type="button"
            dir="ltr"
            onClick={() => {
              setNounIdx(idx);
              const nextArticle = articleMode === 'indef' ? n.articleIndef : n.articleDef;
              speak(`${nextArticle} ${n.word}`);
            }}
            className={`px-3 py-2.5 rounded-lg border text-sm font-semibold cursor-pointer ${
              nounIdx === idx
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {n.word}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-3">
        <button
          type="button"
          dir="ltr"
          onClick={() => speak(phrase)}
          className="text-3xl font-bold text-slate-900 hover:text-indigo-700 transition-colors cursor-pointer"
        >
          <span className={item.gender === 'm' ? 'text-sky-600' : 'text-rose-600'}>{article}</span>{' '}
          <span>{item.word}</span>
        </button>
        <div className="text-sm font-medium text-indigo-700" dir="ltr">
          {item.gender === 'm' ? 'Nom masculin (un / le)' : 'Nom féminin (une / la)'}
        </div>
        <div className="pt-2 border-t border-slate-100 flex justify-center">
          <FrenchSpeakableText
            text={item.sentence}
            speed={speed}
            sentenceButtonLabel="Écouter"
          />
        </div>
      </div>
    </div>
  );
};
