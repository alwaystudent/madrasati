import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { speakFrenchText, SpeechSpeed } from '../utils/frenchSpeech';

interface FrenchSpeakableTextProps {
  text: string;
  speed?: SpeechSpeed;
  className?: string;
  showSentenceButton?: boolean;
  sentenceButtonLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  language?: 'ar' | 'fr';
}

export const FrenchSpeakableText: React.FC<FrenchSpeakableTextProps> = ({
  text,
  speed = 'normal',
  className = '',
  showSentenceButton = true,
  sentenceButtonLabel,
  size = 'md',
  language = 'ar',
}) => {
  const [activeTokenIdx, setActiveTokenIdx] = useState<number | null>(null);
  const [speakingWhole, setSpeakingWhole] = useState(false);

  // Split preserving whitespace so spacing stays natural while each word is clickable
  const segments = text.split(/(\s+)/);

  const handleSpeakSentence = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakFrenchText(text, {
      speed,
      onStart: () => {
        setActiveTokenIdx(null);
        setSpeakingWhole(true);
      },
      onEnd: () => setSpeakingWhole(false),
    });
  };

  const handleSpeakWord = (e: React.MouseEvent, rawWord: string, idx: number) => {
    e.stopPropagation();
    const cleaned = rawWord.replace(/^[«»"'(]+|[.,!?;:»"')]+$/g, '');
    if (!cleaned) return;
    speakFrenchText(cleaned, {
      speed,
      onStart: () => {
        setSpeakingWhole(false);
        setActiveTokenIdx(idx);
      },
      onEnd: () => {
        setActiveTokenIdx((prev) => (prev === idx ? null : prev));
      },
    });
  };

  const sizeClass =
    size === 'lg'
      ? 'text-lg sm:text-xl leading-relaxed'
      : size === 'sm'
      ? 'text-sm leading-relaxed'
      : 'text-base leading-relaxed';

  const isFr = language === 'fr';

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} dir="ltr">
      {showSentenceButton && (
        <button
          type="button"
          onClick={handleSpeakSentence}
          title={isFr ? 'Écouter toute la phrase' : 'استمع للجملة كاملة'}
          aria-label={isFr ? `Écouter : ${text}` : `استمع إلى: ${text}`}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
            speakingWhole
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          {sentenceButtonLabel && <span>{sentenceButtonLabel}</span>}
        </button>
      )}

      <span className={`font-medium text-slate-900 select-none ${sizeClass}`}>
        {segments.map((seg, idx) => {
          if (/^\s+$/.test(seg)) {
            return <span key={idx}>{seg}</span>;
          }
          const isWordActive = activeTokenIdx === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={(e) => handleSpeakWord(e, seg, idx)}
              title={isFr ? 'Cliquer pour écouter ce mot' : 'اضغط لنطق هذه الكلمة'}
              className={`inline rounded px-0.5 py-0.5 transition-colors cursor-pointer underline decoration-dotted underline-offset-4 ${
                isWordActive
                  ? 'bg-indigo-600 text-white decoration-white'
                  : 'decoration-indigo-300 hover:bg-indigo-100 hover:text-indigo-900'
              }`}
            >
              {seg}
            </button>
          );
        })}
      </span>
    </div>
  );
};
