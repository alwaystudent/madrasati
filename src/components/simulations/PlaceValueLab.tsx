import React, { useState } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';

export const PlaceValueLab: React.FC = () => {
  const [thousands, setThousands] = useState(1);
  const [hundreds, setHundreds] = useState(3);
  const [tens, setTens] = useState(4);
  const [ones, setOnes] = useState(5);

  const total = thousands * 1000 + hundreds * 100 + tens * 10 + ones;

  const columns = [
    { label: 'الآلاف', value: thousands, set: setThousands, color: 'bg-indigo-600', unit: 1000 },
    { label: 'المئات', value: hundreds, set: setHundreds, color: 'bg-sky-600', unit: 100 },
    { label: 'العشرات', value: tens, set: setTens, color: 'bg-emerald-600', unit: 10 },
    { label: 'الآحاد', value: ones, set: setOnes, color: 'bg-amber-500', unit: 1 },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-sky-700" aria-hidden="true" />
          <span className="font-semibold text-slate-900">
            العدد المركّب:{' '}
            <span className="font-mono text-xl font-bold text-sky-700 tabular-nums">{total}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setThousands(1);
            setHundreds(3);
            setTens(4);
            setOnes(5);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          إعادة الضبط
        </button>
      </div>

      {/* Interactive Abacus Columns */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {columns.map((col) => (
          <div
            key={col.label}
            className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-between space-y-3"
          >
            <div className="text-xs font-semibold text-slate-600">{col.label}</div>

            <div className="min-h-[92px] flex flex-col-reverse items-center justify-start gap-1 w-full">
              {Array.from({ length: col.value }).map((_, idx) => (
                <div key={idx} className={`w-10 h-2 rounded-full ${col.color}`} />
              ))}
              {col.value === 0 && (
                <span className="text-xs text-slate-400 my-auto">صفر</span>
              )}
            </div>

            <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
              {col.value}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => col.set((v) => Math.max(0, v - 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 cursor-pointer"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => col.set((v) => Math.min(9, v + 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Form */}
      <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-center space-y-1">
        <div className="text-xs font-medium text-sky-800">التفكيك الجمعي للعدد:</div>
        <div dir="ltr" className="font-mono text-base sm:text-lg font-bold text-sky-950 tabular-nums">
          {total} = {thousands * 1000} + {hundreds * 100} + {tens * 10} + {ones}
        </div>
      </div>
    </div>
  );
};
