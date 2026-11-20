import React, { useState } from 'react';
import { Scale } from 'lucide-react';

type Haraka = 'kasra' | 'damma' | 'fatha' | 'sukun';

const HARAKAT: Record<
  Haraka,
  { name: string; mark: string; strength: number; seat: string; seatName: string }
> = {
  kasra: { name: 'الكسرة ( ِ )', mark: 'ِ', strength: 4, seat: 'ئ', seatName: 'النبرة (ئ)' },
  damma: { name: 'الضمة ( ُ )', mark: 'ُ', strength: 3, seat: 'ؤ', seatName: 'الواو (ؤ)' },
  fatha: { name: 'الفتحة ( َ )', mark: 'َ', strength: 2, seat: 'أ', seatName: 'الألف (أ)' },
  sukun: { name: 'السكون ( ْ )', mark: 'ْ', strength: 1, seat: 'أ', seatName: 'الحركة الأخرى' },
};

const EXAMPLES: Record<string, string> = {
  'kasra-sukun': 'بِئْرٌ',
  'kasra-fatha': 'مِئْذَنَة / فِئَةٌ',
  'kasra-damma': 'مُبْتَدِئُونَ',
  'kasra-kasra': 'مُتَّكِئِينَ',
  'damma-kasra': 'سُئِلَ',
  'fatha-kasra': 'يَئِسَ',
  'sukun-kasra': 'أَسْئِلَةٌ / سَائِلٌ',
  'damma-sukun': 'مُؤْمِنٌ',
  'damma-fatha': 'سُؤَالٌ',
  'damma-damma': 'شُؤُونٌ',
  'fatha-damma': 'رَؤُوفٌ',
  'sukun-damma': 'مَسْؤُولٌ',
  'fatha-fatha': 'سَأَلَ',
  'fatha-sukun': 'فَأْسٌ',
  'sukun-fatha': 'يَسْأَلُ',
  'sukun-sukun': 'حالة نادرة (تستلزم حركة)',
};

export const HamzaLab: React.FC = () => {
  const [prevHaraka, setPrevHaraka] = useState<Haraka>('kasra');
  const [hamzaHaraka, setHamzaHaraka] = useState<Haraka>('sukun');

  const prevInfo = HARAKAT[prevHaraka];
  const hamzaInfo = HARAKAT[hamzaHaraka];

  const winner = prevInfo.strength >= hamzaInfo.strength ? prevInfo : hamzaInfo;
  const exampleWord = EXAMPLES[`${prevHaraka}-${hamzaHaraka}`] ?? 'مِثَالٌ تَوْضِيحِيّ';

  const tiltDeg =
    prevInfo.strength > hamzaInfo.strength
      ? -6
      : prevInfo.strength < hamzaInfo.strength
      ? 6
      : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-700" aria-hidden="true" />
          <span className="font-semibold text-slate-900">
            الحركة الفائزة: <strong className="text-sky-800">{winner.name}</strong> ← تُكتب على{' '}
            {winner.seatName}
          </span>
        </div>
        <span className="text-xs font-medium text-slate-600">
          الترتيب: الكسرة &gt; الضمة &gt; الفتحة &gt; السكون
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center space-y-5">
        <div className="flex items-center justify-center gap-6 w-full max-w-md">
          <div className="flex-1 text-center p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500">حركة الحرف السابق</div>
            <div className="mt-1 text-base font-bold text-slate-900">{prevInfo.name}</div>
            <div className="text-xs font-mono text-sky-700 tabular-nums">
              القوة: {prevInfo.strength}/4
            </div>
          </div>

          <div
            className="w-16 h-16 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-3xl font-display font-bold shadow-xs transition-transform duration-200"
            style={{ transform: `rotate(${tiltDeg}deg)` }}
          >
            {winner.seat}
          </div>

          <div className="flex-1 text-center p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500">حركة الهمزة نفسها</div>
            <div className="mt-1 text-base font-bold text-slate-900">{hamzaInfo.name}</div>
            <div className="text-xs font-mono text-amber-700 tabular-nums">
              القوة: {hamzaInfo.strength}/4
            </div>
          </div>
        </div>

        <div className="px-6 py-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
          <div className="text-xs text-amber-800">مثال تطبيقي من المعجم المدرسي</div>
          <div className="mt-1 text-2xl font-display font-bold text-amber-950">{exampleWord}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="text-xs font-semibold text-slate-700">1. حركة الحرف الذي قبل الهمزة:</div>
          <div className="grid grid-cols-2 gap-2">
            {(['kasra', 'damma', 'fatha', 'sukun'] as Haraka[]).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setPrevHaraka(h)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  prevHaraka === h
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {HARAKAT[h].name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="text-xs font-semibold text-slate-700">2. حركة الهمزة نفسها:</div>
          <div className="grid grid-cols-2 gap-2">
            {(['kasra', 'damma', 'fatha', 'sukun'] as Haraka[]).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHamzaHaraka(h)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  hamzaHaraka === h
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {HARAKAT[h].name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
