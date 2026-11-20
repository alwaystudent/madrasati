import React, { useState } from 'react';
import { Sun, Droplets, Wind, Sprout } from 'lucide-react';

export const PhotosynthesisLab: React.FC = () => {
  const [sunlight, setSunlight] = useState(80);
  const [water, setWater] = useState(75);
  const [co2, setCo2] = useState(70);

  const photosynthesisRate = Math.round(Math.min(sunlight, water, co2));

  const plantStatus =
    sunlight < 15
      ? 'توقف التركيب الضوئي (ظلام — لا يتكون الغذاء)'
      : water < 15
      ? 'النبتة عطشى (تذبل الجذور لغياب الماء)'
      : co2 < 15
      ? 'نقص غاز ثاني أكسيد الكربون يبطئ النمو'
      : photosynthesisRate >= 65
      ? 'تركيب ضوئي نشيط! إنتاج وفير للسكر والأكسجين'
      : 'تركيب ضوئي متوسط — زد العوامل لنمو أفضل';

  const leafFill =
    photosynthesisRate >= 60
      ? '#16A34A'
      : photosynthesisRate >= 25
      ? '#65A30D'
      : '#CA8A04';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Sprout className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <span className="font-semibold text-slate-900">{plantStatus}</span>
        </div>
        <span className="font-mono text-sm font-bold text-emerald-700 tabular-nums">
          النشاط: {photosynthesisRate}%
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <svg
          viewBox="0 0 540 240"
          className="w-full h-auto max-h-[245px]"
          role="img"
          aria-label="محاكاة التركيب الضوئي في النبات الأخضر"
        >
          <rect
            x="0"
            y="0"
            width="540"
            height="175"
            rx="8"
            fill={sunlight > 20 ? '#F0F9FF' : '#1E293B'}
          />
          <g opacity={Math.max(0.15, sunlight / 100)}>
            <circle cx="80" cy="48" r="24" fill="#FBBF24" />
            <line
              x1="112"
              y1="68"
              x2="215"
              y2="115"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeDasharray="5 5"
            />
            <line
              x1="100"
              y1="80"
              x2="205"
              y2="135"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeDasharray="5 5"
            />
          </g>

          <rect x="0" y="175" width="540" height="65" rx="6" fill="#78350F" />
          {water > 10 && (
            <g fill="#38BDF8" opacity={water / 100}>
              <circle cx="235" cy="205" r="4" />
              <circle cx="268" cy="222" r="4.5" />
              <circle cx="295" cy="200" r="4" />
              <circle cx="310" cy="220" r="3.5" />
            </g>
          )}

          <path
            d="M 270 175 Q 255 198 230 215 M 270 175 Q 270 205 272 228 M 270 175 Q 290 198 312 214"
            fill="none"
            stroke="#D6D3D1"
            strokeWidth="4"
            strokeLinecap="round"
          />

          <path d="M 270 175 L 270 88" stroke="#15803D" strokeWidth="8" strokeLinecap="round" />

          <ellipse
            cx="232"
            cy="118"
            rx="34"
            ry="15"
            transform="rotate(-22 232 118)"
            fill={leafFill}
          />
          <ellipse
            cx="308"
            cy="110"
            rx="34"
            ry="15"
            transform="rotate(22 308 110)"
            fill={leafFill}
          />
          <ellipse
            cx="242"
            cy="78"
            rx="28"
            ry="13"
            transform="rotate(-35 242 78)"
            fill={leafFill}
          />
          <ellipse
            cx="298"
            cy="78"
            rx="28"
            ry="13"
            transform="rotate(35 298 78)"
            fill={leafFill}
          />

          <g opacity={Math.max(0.25, co2 / 100)}>
            <text
              x="430"
              y="72"
              fill={sunlight > 20 ? '#0F172A' : '#E2E8F0'}
              fontSize="13"
              fontWeight="700"
              textAnchor="middle"
            >
              يمتص CO₂
            </text>
            <path d="M 420 82 L 350 96" stroke="#64748B" strokeWidth="2.5" strokeDasharray="4 4" />
          </g>

          {photosynthesisRate >= 25 && (
            <g>
              <circle cx="345" cy="52" r="6" fill="#0EA5E9" opacity="0.85" />
              <circle cx="368" cy="36" r="8" fill="#0EA5E9" opacity="0.7" />
              <text
                x="418"
                y="42"
                fill={sunlight > 20 ? '#0369A1' : '#7DD3FC'}
                fontSize="13"
                fontWeight="700"
                textAnchor="middle"
              >
                يطرح الأكسجين O₂
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <label className="block space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-700">
            <span className="inline-flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
              ضوء الشمس
            </span>
            <span className="font-mono font-bold tabular-nums">{sunlight}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={sunlight}
            onChange={(e) => setSunlight(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </label>

        <label className="block space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-700">
            <span className="inline-flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
              الماء والأملاح
            </span>
            <span className="font-mono font-bold tabular-nums">{water}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={water}
            onChange={(e) => setWater(Number(e.target.value))}
            className="w-full accent-sky-600 cursor-pointer"
          />
        </label>

        <label className="block space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-700">
            <span className="inline-flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
              غاز CO₂
            </span>
            <span className="font-mono font-bold tabular-nums">{co2}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={co2}
            onChange={(e) => setCo2(Number(e.target.value))}
            className="w-full accent-slate-700 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};
