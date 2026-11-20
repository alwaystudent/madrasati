import React, { useState } from 'react';
import { Grid, Square } from 'lucide-react';

export const GeometryLab: React.FC = () => {
  const [length, setLength] = useState(5);
  const [width, setWidth] = useState(3);
  const [highlightMode, setHighlightMode] = useState<'both' | 'perimeter' | 'area'>('both');

  const perimeter = (length + width) * 2;
  const area = length * width;
  const isSquare = length === width;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          {isSquare ? (
            <Square className="w-5 h-5 text-sky-700" aria-hidden="true" />
          ) : (
            <Grid className="w-5 h-5 text-sky-700" aria-hidden="true" />
          )}
          <span className="font-semibold text-slate-900">
            {isSquare ? 'الشكل الآن: مربع متساوي الأضلاع' : 'الشكل الآن: مستطيل'}
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setHighlightMode('both')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              highlightMode === 'both'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الاثنان معاً
          </button>
          <button
            type="button"
            onClick={() => setHighlightMode('perimeter')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              highlightMode === 'perimeter'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            السياج (المحيط)
          </button>
          <button
            type="button"
            onClick={() => setHighlightMode('area')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              highlightMode === 'area'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            البلاط (المساحة)
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center min-h-[240px]">
        <div className="text-xs text-slate-500 mb-3 font-medium">
          كل مربع صغير يمثل <span className="font-mono font-bold text-slate-700">1 صم × 1 صم</span>
        </div>
        <div
          className={`grid gap-1 p-1.5 rounded-lg transition-all duration-150 ${
            highlightMode === 'area'
              ? 'border-2 border-dashed border-slate-300 bg-slate-50'
              : 'border-4 border-sky-600 bg-sky-50/40'
          }`}
          style={{
            gridTemplateColumns: `repeat(${length}, 34px)`,
          }}
        >
          {Array.from({ length: length * width }).map((_, idx) => (
            <div
              key={idx}
              className={`w-[34px] h-[34px] rounded-sm flex items-center justify-center text-[11px] font-mono tabular-nums transition-colors duration-150 ${
                highlightMode === 'perimeter'
                  ? 'bg-slate-100 text-slate-400 border border-slate-200'
                  : 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
              }`}
            >
              {idx + 1}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
          <span>
            الطول: <strong className="font-mono text-slate-900 tabular-nums">{length} صم</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            العرض: <strong className="font-mono text-slate-900 tabular-nums">{width} صم</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <label className="block space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-slate-700">
            <span>الطول (صم)</span>
            <span className="font-mono font-bold text-sky-700 tabular-nums">{length} صم</span>
          </div>
          <input
            type="range"
            min={2}
            max={8}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-sky-600 cursor-pointer"
          />
        </label>
        <label className="block space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-slate-700">
            <span>العرض (صم)</span>
            <span className="font-mono font-bold text-sky-700 tabular-nums">{width} صم</span>
          </div>
          <input
            type="range"
            min={2}
            max={6}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="w-full accent-sky-600 cursor-pointer"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200">
          <div className="text-xs font-medium text-sky-800">المحيط (السياج الأزرق)</div>
          <div className="mt-1 font-mono text-lg font-bold text-sky-950 tabular-nums">
            {perimeter} صم
          </div>
          <div className="mt-1 text-xs text-sky-700 font-mono tabular-nums">
            ({length} + {width}) × 2 = {perimeter}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
          <div className="text-xs font-medium text-amber-800">المساحة (مجموع البلاطات)</div>
          <div className="mt-1 font-mono text-lg font-bold text-amber-950 tabular-nums">
            {area} صم²
          </div>
          <div className="mt-1 text-xs text-amber-800 font-mono tabular-nums">
            {length} × {width} = {area}
          </div>
        </div>
      </div>
    </div>
  );
};
