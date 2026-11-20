import React, { useState } from 'react';
import { BookOpen, ArrowLeftRight } from 'lucide-react';

const VERB_OPTIONS = [
  { word: 'كتبَ', role: 'فعل ماضٍ مبني على الفتح' },
  { word: 'يرسمُ', role: 'فعل مضارع مرفوع بالضمة' },
  { word: 'يقرأُ', role: 'فعل مضارع مرفوع بالضمة' },
];

const SUBJECT_OPTIONS = [
  { word: 'التلميذُ', role: 'فاعل مرفوع / مبتدأ مرفوع' },
  { word: 'الصديقُ', role: 'فاعل مرفوع / مبتدأ مرفوع' },
  { word: 'المجتهدُ', role: 'فاعل مرفوع / مبتدأ مرفوع' },
];

const OBJECT_OPTIONS = [
  { word: 'الدرسَ', role: 'مفعول به منصوب بالفتحة' },
  { word: 'خريطةَ تونسَ', role: 'مفعول به منصوب بالفتحة' },
  { word: 'قصةً ممتعةً', role: 'مفعول به منصوب بالفتحة' },
];

const KHABAR_OPTIONS = [
  { word: 'مبتسمٌ', role: 'خبر مرفوع بالضمة' },
  { word: 'مواظبٌ على دروسه', role: 'خبر مرفوع بالضمة' },
  { word: 'نشيطٌ في القسم', role: 'خبر مرفوع بالضمة' },
];

export const ArabicSentenceLab: React.FC = () => {
  const [sentenceType, setSentenceType] = useState<'verbal' | 'nominal'>('verbal');
  const [verbIdx, setVerbIdx] = useState(0);
  const [subjectIdx, setSubjectIdx] = useState(0);
  const [objectIdx, setObjectIdx] = useState(0);
  const [khabarIdx, setKhabarIdx] = useState(0);

  const verb = VERB_OPTIONS[verbIdx];
  const subject = SUBJECT_OPTIONS[subjectIdx];
  const obj = OBJECT_OPTIONS[objectIdx];
  const khabar = KHABAR_OPTIONS[khabarIdx];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-700" aria-hidden="true" />
          <span className="font-semibold text-slate-900">
            النوع المختار:{' '}
            {sentenceType === 'verbal' ? 'جملة فعلية (تبدأ بفعل)' : 'جملة اسمية (تبدأ باسم)'}
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setSentenceType('verbal')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              sentenceType === 'verbal'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            جملة فعلية
          </button>
          <button
            type="button"
            onClick={() => setSentenceType('nominal')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              sentenceType === 'nominal'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            جملة اسمية
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-5">
        <div className="text-xs font-medium text-slate-500">
          الجملة المركّبة ووظيفة كل ركن:
        </div>

        <div className="flex flex-wrap items-stretch justify-center gap-3">
          {sentenceType === 'verbal' ? (
            <>
              <div className="px-4 py-3 rounded-xl bg-sky-50 border border-sky-200 min-w-[130px]">
                <div className="text-xl font-display font-bold text-sky-900">{verb.word}</div>
                <div className="mt-1 text-xs font-medium text-sky-700">{verb.role}</div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 min-w-[130px]">
                <div className="text-xl font-display font-bold text-emerald-900">{subject.word}</div>
                <div className="mt-1 text-xs font-medium text-emerald-700">فاعل مرفوع بالضمة</div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 min-w-[130px]">
                <div className="text-xl font-display font-bold text-amber-900">{obj.word}</div>
                <div className="mt-1 text-xs font-medium text-amber-800">{obj.role}</div>
              </div>
            </>
          ) : (
            <>
              <div className="px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-200 min-w-[150px]">
                <div className="text-xl font-display font-bold text-emerald-900">{subject.word}</div>
                <div className="mt-1 text-xs font-medium text-emerald-700">مبتدأ مرفوع بالضمة</div>
              </div>
              <div className="px-5 py-3 rounded-xl bg-amber-50 border border-amber-200 min-w-[170px]">
                <div className="text-xl font-display font-bold text-amber-900">{khabar.word}</div>
                <div className="mt-1 text-xs font-medium text-amber-800">{khabar.role}</div>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSentenceType((t) => (t === 'verbal' ? 'nominal' : 'verbal'))}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden="true" />
          حوّل إلى {sentenceType === 'verbal' ? 'جملة اسمية' : 'جملة فعلية'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {sentenceType === 'verbal' && (
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-semibold text-slate-700">1. اختر الفعل:</div>
            <div className="flex flex-col gap-1.5">
              {VERB_OPTIONS.map((v, i) => (
                <button
                  key={v.word}
                  type="button"
                  onClick={() => setVerbIdx(i)}
                  className={`px-3 py-1.5 text-sm rounded-lg border text-right transition-colors cursor-pointer ${
                    verbIdx === i
                      ? 'bg-sky-600 text-white border-sky-600 font-semibold'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {v.word}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
          <div className="text-xs font-semibold text-slate-700">
            {sentenceType === 'verbal' ? '2. اختر الفاعل:' : '1. اختر المبتدأ (الاسم):'}
          </div>
          <div className="flex flex-col gap-1.5">
            {SUBJECT_OPTIONS.map((s, i) => (
              <button
                key={s.word}
                type="button"
                onClick={() => setSubjectIdx(i)}
                className={`px-3 py-1.5 text-sm rounded-lg border text-right transition-colors cursor-pointer ${
                  subjectIdx === i
                    ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {s.word}
              </button>
            ))}
          </div>
        </div>

        {sentenceType === 'verbal' ? (
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-semibold text-slate-700">3. اختر المفعول به:</div>
            <div className="flex flex-col gap-1.5">
              {OBJECT_OPTIONS.map((o, i) => (
                <button
                  key={o.word}
                  type="button"
                  onClick={() => setObjectIdx(i)}
                  className={`px-3 py-1.5 text-sm rounded-lg border text-right transition-colors cursor-pointer ${
                    objectIdx === i
                      ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {o.word}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 sm:col-span-2">
            <div className="text-xs font-semibold text-slate-700">2. اختر الخبر المناسب:</div>
            <div className="flex flex-col gap-1.5">
              {KHABAR_OPTIONS.map((k, i) => (
                <button
                  key={k.word}
                  type="button"
                  onClick={() => setKhabarIdx(i)}
                  className={`px-3 py-1.5 text-sm rounded-lg border text-right transition-colors cursor-pointer ${
                    khabarIdx === i
                      ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {k.word}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
