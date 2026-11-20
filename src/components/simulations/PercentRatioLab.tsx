import React, { useState } from 'react';
import { Percent } from 'lucide-react';

export const PercentRatioLab: React.FC = () => {
  const [originalPrice, setOriginalPrice] = useState(80);
  const [discountPercent, setDiscountPercent] = useState(25);

  const discountAmount = Math.round(((originalPrice * discountPercent) / 100) * 100) / 100;
  const finalPrice = Math.round((originalPrice - discountAmount) * 100) / 100;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Percent className="w-5 h-5 text-sky-700" aria-hidden="true" />
          <span className="font-semibold text-slate-900">
            حاسبة النسبة المئوية والتخفيض (منهج السادسة)
          </span>
        </div>
        <span className="font-mono text-sm font-bold text-sky-700 tabular-nums">
          التخفيض: {discountPercent}%
        </span>
      </div>

      {/* Visual Proportional Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex justify-between text-xs font-semibold text-slate-600">
          <span>الثمن الجديد المدفوع ({100 - discountPercent}%)</span>
          <span>قيمة التخفيض ({discountPercent}%)</span>
        </div>
        <div className="w-full h-10 rounded-lg overflow-hidden flex border border-slate-200">
          <div
            className="bg-sky-600 text-white text-xs font-mono font-bold flex items-center justify-center transition-all duration-200 tabular-nums"
            style={{ width: `${100 - discountPercent}%` }}
          >
            {finalPrice} د
          </div>
          <div
            className="bg-amber-400 text-amber-950 text-xs font-mono font-bold flex items-center justify-center transition-all duration-200 tabular-nums"
            style={{ width: `${discountPercent}%` }}
          >
            {discountPercent >= 12 ? `-${discountAmount} د` : ''}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-center">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500">الثمن الأصلي</div>
            <div className="font-mono text-lg font-bold text-slate-900 tabular-nums">
              {originalPrice} د
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <div className="text-xs text-amber-800">مبلغ التخفيض</div>
            <div className="font-mono text-lg font-bold text-amber-950 tabular-nums">
              {discountAmount} د
            </div>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
            <div className="text-xs text-sky-800">الثمن بعد التخفيض</div>
            <div className="font-mono text-lg font-bold text-sky-950 tabular-nums">
              {finalPrice} د
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <label className="block space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-slate-700">
            <span>الثمن الأصلي (بالدينار التونسي)</span>
            <span className="font-mono font-bold tabular-nums">{originalPrice} د</span>
          </div>
          <input
            type="range"
            min={20}
            max={200}
            step={10}
            value={originalPrice}
            onChange={(e) => setOriginalPrice(Number(e.target.value))}
            className="w-full accent-sky-600 cursor-pointer"
          />
        </label>
        <label className="block space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-slate-700">
            <span>نسبة التخفيض (%)</span>
            <span className="font-mono font-bold tabular-nums">{discountPercent}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={50}
            step={5}
            value={discountPercent}
            onChange={(e) => setDiscountPercent(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </label>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs sm:text-sm font-mono text-slate-800 text-center tabular-nums" dir="ltr">
        {originalPrice} × {discountPercent} ÷ 100 = {discountAmount} د  |  {originalPrice} - {discountAmount} = {finalPrice} د
      </div>
    </div>
  );
};
