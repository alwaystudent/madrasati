import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

const SAMPLE_SENTENCES = [
  {
    id: 0,
    words: [
      { text: 'ذهبَ', type: 'فعل', desc: 'كلمة تدل على حدث في زمن الماضي.', color: 'bg-sky-50 border-sky-300 text-sky-900' },
      { text: 'سليمٌ', type: 'اسم', desc: 'كلمة تدل على إنسان وتقبل التنوين.', color: 'bg-emerald-50 border-emerald-300 text-emerald-900' },
      { text: 'إلى', type: 'حرف', desc: 'كلمة تربط بين أجزاء الجملة ولا يظهر معناها وحدها.', color: 'bg-amber-50 border-amber-300 text-amber-900' },
      { text: 'المدرسةِ', type: 'اسم', desc: 'كلمة تبدأ بـ «الـ» وتدل على مكان.', color: 'bg-emerald-50 border-emerald-300 text-emerald-900' },
    ],
  },
  {
    id: 1,
    words: [
      { text: 'تقرأُ', type: 'فعل', desc: 'كلمة تدل على عمل يحدث الآن (المضارع).', color: 'bg-sky-50 border-sky-300 text-sky-900' },
      { text: 'سلمى', type: 'اسم', desc: 'اسم علم يدل على فتاة.', color: 'bg-emerald-50 border-emerald-300 text-emerald-900' },
      { text: 'في', type: 'حرف', desc: 'حرف جر يربط الفعل بالاسم بعده.', color: 'bg-amber-50 border-amber-300 text-amber-900' },
      { text: 'الكتابِ', type: 'اسم', desc: 'اسم جماد يقبل «الـ» التعريف.', color: 'bg-emerald-50 border-emerald-300 text-emerald-900' },
    ],
  },
];

export const WordTypesLab: React.FC = () => {
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [selectedWordIdx, setSelectedWordIdx] = useState(0);

  const sentence = SAMPLE_SENTENCES[sentenceIdx];
  const selectedWord = sentence.words[selectedWordIdx];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-700" aria-hidden="true" />
          <span className="font-semibold text-slate-900">اضغط على أي كلمة لاكتشاف نوعها</span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {SAMPLE_SENTENCES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setSentenceIdx(idx);
                setSelectedWordIdx(0);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                sentenceIdx === idx
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الجملة {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-wrap items-center justify-center gap-3">
        {sentence.words.map((w, i) => (
          <button
            key={`${w.text}-${i}`}
            type="button"
            onClick={() => setSelectedWordIdx(i)}
            className={`px-5 py-3 rounded-xl border-2 text-xl font-display font-bold transition-transform cursor-pointer ${
              selectedWordIdx === i
                ? `${w.color} scale-105`
                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
            }`}
          >
            {w.text}
          </button>
        ))}
      </div>

      <div className={`p-4 rounded-xl border ${selectedWord.color} space-y-1`}>
        <div className="text-sm font-bold">
          الكلمة «{selectedWord.text}» هي: {selectedWord.type}
        </div>
        <p className="text-sm opacity-90">{selectedWord.desc}</p>
      </div>
    </div>
  );
};
