import React, { useState } from 'react';
import { CheckCircle2, Scale, RotateCcw } from 'lucide-react';

export const FractionLab: React.FC = () => {
  const [numA, setNumA] = useState(1);
  const [denA, setDenA] = useState(2);
  const [numB, setNumB] = useState(2);
  const [denB, setDenB] = useState(4);

  const valA = numA / denA;
  const valB = numB / denB;
  const isEqual = Math.abs(valA - valB) < 0.0001;

  const handleDenAChange = (nextDen: number) => {
    setDenA(nextDen);
    if (numA > nextDen) setNumA(nextDen);
  };

  const handleDenBChange = (nextDen: number) => {
    setDenB(nextDen);
    if (numB > nextDen) setNumB(nextDen);
  };

  const resetValues = () => {
    setNumA(1);
    setDenA(2);
    setNumB(2);
    setDenB(4);
  };

  const renderFractionBar = (
    num: number,
    den: number,
    colorClass: string,
    onSliceClick: (idx: number) => void
  ) => (
    <div
      className="grid gap-1.5 w-full h-14 bg-slate-100 p-1.5 rounded-lg border border-slate-200"
      style={{ gridTemplateColumns: `repeat(${den}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: den }).map((_, i) => {
        const filled = i < num;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSliceClick(i + 1)}
            title={`اضغط لاختيار ${i + 1} من ${den}`}
            className={`rounded-md border transition-all duration-150 cursor-pointer flex items-center justify-center text-xs font-mono font-bold tabular-nums ${
              filled
                ? `${colorClass} text-white border-transparent shadow-xs`
                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
            }`}
          >
            {filled ? `1/${den}` : ''}
          </button>
        );
      })}
    </div>
  );

  const comparisonLabel = isEqual
    ? 'الكسران متساويان تماماً (=)'
    : valA > valB
    ? 'الكسر الأول أكبر من الثاني (>)'
    : 'الكسر الثاني أكبر من الأول (<)';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <Scale className="w-5 h-5 text-sky-700" aria-hidden="true" />
          <span className="font-semibold text-slate-900 text-base">
            {comparisonLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={resetValues}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          إعادة الضبط
        </button>
      </div>

      <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800">
            الكسر الأول (اضغط على القطع لتلوينها)
          </span>
          <span className="font-mono text-lg font-bold text-sky-700 tabular-nums" dir="ltr">
            {numA} / {denA}
          </span>
        </div>
        {renderFractionBar(numA, denA, 'bg-sky-600 hover:bg-sky-700', (count) =>
          setNumA(count)
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <label className="block space-y-1">
            <div className="flex justify-between text-xs text-slate-600">
              <span>البسط (الأجزاء الملوّنة)</span>
              <span className="font-mono font-semibold tabular-nums">{numA}</span>
            </div>
            <input
              type="range"
              min={0}
              max={denA}
              value={numA}
              onChange={(e) => setNumA(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
          </label>
          <label className="block space-y-1">
            <div className="flex justify-between text-xs text-slate-600">
              <span>المقام (مجموع الأجزاء)</span>
              <span className="font-mono font-semibold tabular-nums">{denA}</span>
            </div>
            <input
              type="range"
              min={2}
              max={10}
              value={denA}
              onChange={(e) => handleDenAChange(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
          </label>
        </div>
      </div>

      <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800">الكسر الثاني</span>
          <span className="font-mono text-lg font-bold text-amber-700 tabular-nums" dir="ltr">
            {numB} / {denB}
          </span>
        </div>
        {renderFractionBar(numB, denB, 'bg-amber-500 hover:bg-amber-600', (count) =>
          setNumB(count)
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <label className="block space-y-1">
            <div className="flex justify-between text-xs text-slate-600">
              <span>البسط (الأجزاء الملوّنة)</span>
              <span className="font-mono font-semibold tabular-nums">{numB}</span>
            </div>
            <input
              type="range"
              min={0}
              max={denB}
              value={numB}
              onChange={(e) => setNumB(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </label>
          <label className="block space-y-1">
            <div className="flex justify-between text-xs text-slate-600">
              <span>المقام (مجموع الأجزاء)</span>
              <span className="font-mono font-semibold tabular-nums">{denB}</span>
            </div>
            <input
              type="range"
              min={2}
              max={10}
              value={denB}
              onChange={(e) => handleDenBChange(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </label>
        </div>
      </div>

      <div
        className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border ${
          isEqual
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-slate-100 border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          {isEqual && (
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
          )}
          <span>
            {isEqual
              ? `ملاحظة ذكية: رغم اختلاف الأرقام، المساحة الملوّنة متطابقة (${Math.round(
                  valA * 100
                )}%).`
              : `النسبة الملوّنة: الأول ${Math.round(valA * 100)}% مقابل الثاني ${Math.round(
                  valB * 100
                )}%.`}
          </span>
        </div>
        <span className="font-mono text-sm font-bold tabular-nums shrink-0" dir="ltr">
          {numA}/{denA} {isEqual ? '=' : valA > valB ? '>' : '<'} {numB}/{denB}
        </span>
      </div>
    </div>
  );
};
