import React, { useState } from 'react';
import { Thermometer, Snowflake, Droplets, Cloud } from 'lucide-react';

export const MatterLab: React.FC = () => {
  const [temp, setTemp] = useState(22);

  const state =
    temp <= 0 ? 'solid' : temp < 100 ? 'liquid' : 'gas';

  const stateMeta = {
    solid: {
      title: 'الحالة الصلبة (جليد)',
      note: 'عند التبريد إلى 0° أو أقل يتجمّد الماء ويصبح صلباً له شكل ثابت.',
      badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
    },
    liquid: {
      title: 'الحالة السائلة (ماء جارٍ)',
      note: 'بين 1° و 99° يكون الماء سائلاً يأخذ شكل الإناء الذي يوضع فيه.',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
    gas: {
      title: 'الحالة الغازية (بخار الماء)',
      note: 'عند درجة الغليان 100° فأكثر يتبخر الماء ويتحول إلى غاز ينتشر في الهواء.',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    },
  }[state];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-sky-700" aria-hidden="true" />
          <span className="font-semibold text-slate-900">{stateMeta.title}</span>
        </div>
        <span className="font-mono text-base font-bold text-slate-900 tabular-nums" dir="ltr">
          {temp} °C
        </span>
      </div>

      {/* Visual Beaker Stage */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center min-h-[210px] space-y-4">
        <div className="flex items-center gap-4">
          {state === 'solid' && <Snowflake className="w-16 h-16 text-sky-600" aria-hidden="true" />}
          {state === 'liquid' && <Droplets className="w-16 h-16 text-emerald-600" aria-hidden="true" />}
          {state === 'gas' && <Cloud className="w-16 h-16 text-amber-600" aria-hidden="true" />}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTemp(-8)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 cursor-pointer"
          >
            تجمّد (-8°C)
          </button>
          <button
            type="button"
            onClick={() => setTemp(22)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 cursor-pointer"
          >
            حرارة الغرفة (22°C)
          </button>
          <button
            type="button"
            onClick={() => setTemp(105)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 cursor-pointer"
          >
            غليان (105°C)
          </button>
        </div>
      </div>

      <label className="block space-y-1.5 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex justify-between text-xs font-medium text-slate-700">
          <span>تحكّم في درجة الحرارة (°C)</span>
          <span className="font-mono font-bold tabular-nums" dir="ltr">
            {temp} °C
          </span>
        </div>
        <input
          type="range"
          min={-15}
          max={115}
          value={temp}
          onChange={(e) => setTemp(Number(e.target.value))}
          className="w-full accent-sky-600 cursor-pointer"
        />
      </label>

      <div className={`p-3.5 rounded-xl border text-sm font-medium ${stateMeta.badgeBg}`}>
        {stateMeta.note}
      </div>
    </div>
  );
};
