import React, { useState } from 'react';
import { HeartPulse, Activity } from 'lucide-react';

type ActivityState = 'rest' | 'walk' | 'run';

const ACTIVITY_STATES: Record<
  ActivityState,
  { label: string; bpm: number; breaths: number; note: string; flowSpeed: string }
> = {
  rest: {
    label: 'حالة الراحة',
    bpm: 72,
    breaths: 16,
    note: 'تحتاج العضلات إلى كمية معتدلة من الأكسجين، لذا ينبض القلب بهدوء وانتظام.',
    flowSpeed: '1.4s',
  },
  walk: {
    label: 'المشي السريع',
    bpm: 105,
    breaths: 24,
    note: 'يزداد نشاط العضلات قليلاً، فيضخ القلب الدم بسرعة أكبر لتزويدها بالغذاء والأكسجين.',
    flowSpeed: '0.9s',
  },
  run: {
    label: 'جري سريع',
    bpm: 148,
    breaths: 38,
    note: 'تستهلك العضلات طاقة كبيرة! يتسارع القلب وتتسارع الرئتان لتعويض الأكسجين وطرح CO₂.',
    flowSpeed: '0.5s',
  },
};

export const HeartLab: React.FC = () => {
  const [activity, setActivity] = useState<ActivityState>('rest');
  const current = ACTIVITY_STATES[activity];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-rose-600" aria-hidden="true" />
          <span className="font-semibold text-slate-900">
            معدل النبض:{' '}
            <span className="font-mono text-rose-700 tabular-nums">{current.bpm}</span> نبضة / دقيقة
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {(['rest', 'walk', 'run'] as ActivityState[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActivity(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activity === key
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {ACTIVITY_STATES[key].label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <svg
          viewBox="0 0 560 240"
          className="w-full h-auto max-h-[250px]"
          role="img"
          aria-label="رسم تفاعلي للدورة الدموية بين الرئتين والقلب والعضلات"
        >
          <rect
            x="210"
            y="16"
            width="140"
            height="48"
            rx="12"
            fill="#E0F2FE"
            stroke="#0284C7"
            strokeWidth="2"
          />
          <text x="280" y="38" fill="#0C4A6E" fontSize="13" fontWeight="700" textAnchor="middle">
            الرئتان (تزويد بـ O₂)
          </text>
          <text x="280" y="55" fill="#0369A1" fontSize="11" textAnchor="middle">
            {current.breaths} نفس / دقيقة
          </text>

          <rect
            x="215"
            y="96"
            width="130"
            height="52"
            rx="14"
            fill="#FFE4E6"
            stroke="#E11D48"
            strokeWidth="2.5"
          />
          <text x="280" y="120" fill="#881337" fontSize="14" fontWeight="700" textAnchor="middle">
            القلب (المضخة)
          </text>
          <text x="280" y="138" fill="#BE123C" fontSize="11" fontWeight="600" textAnchor="middle">
            {current.bpm} نبضة / دقيقة
          </text>

          <rect
            x="195"
            y="180"
            width="170"
            height="46"
            rx="12"
            fill="#FEF3C7"
            stroke="#D97706"
            strokeWidth="2"
          />
          <text x="280" y="207" fill="#78350F" fontSize="13" fontWeight="700" textAnchor="middle">
            العضلات وأعضاء الجسم
          </text>

          <path
            d="M 195 202 L 110 202 L 110 122 L 215 122"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="4"
            strokeDasharray="6 6"
            style={{ animation: `electronFlow ${current.flowSpeed} linear infinite` }}
          />
          <path
            d="M 245 96 L 245 64"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="4"
            strokeDasharray="6 6"
            style={{ animation: `electronFlow ${current.flowSpeed} linear infinite` }}
          />
          <text x="64" y="160" fill="#1D4ED8" fontSize="11" fontWeight="700" textAnchor="middle">
            دم محمّل بـ CO₂
          </text>

          <path
            d="M 315 64 L 315 96"
            fill="none"
            stroke="#EF4444"
            strokeWidth="4"
            strokeDasharray="6 6"
            style={{ animation: `electronFlow ${current.flowSpeed} linear infinite` }}
          />
          <path
            d="M 345 122 L 450 122 L 450 202 L 365 202"
            fill="none"
            stroke="#EF4444"
            strokeWidth="4"
            strokeDasharray="6 6"
            style={{ animation: `electronFlow ${current.flowSpeed} linear infinite` }}
          />
          <text x="495" y="160" fill="#B91C1C" fontSize="11" fontWeight="700" textAnchor="middle">
            دم غني بـ O₂
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
          <span className="text-sm font-medium text-rose-900">سرعة النبض</span>
          <span className="font-mono text-lg font-bold text-rose-800 tabular-nums">
            {current.bpm} BPM
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between">
          <span className="text-sm font-medium text-sky-900">معدل التنفس</span>
          <span className="font-mono text-lg font-bold text-sky-800 tabular-nums">
            {current.breaths} / دق
          </span>
        </div>
      </div>

      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-800">
        <Activity className="w-4 h-4 mt-0.5 text-rose-600 shrink-0" aria-hidden="true" />
        <span>{current.note}</span>
      </div>
    </div>
  );
};
