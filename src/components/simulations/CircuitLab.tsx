import React, { useState } from 'react';
import { Lightbulb, Power, Zap, ShieldAlert } from 'lucide-react';

interface MaterialOption {
  id: string;
  name: string;
  isConductor: boolean;
  note: string;
}

const MATERIALS: MaterialOption[] = [
  {
    id: 'copper',
    name: 'سلك نحاسي',
    isConductor: true,
    note: 'النحاس معدن ممتاز التوصيل للكهرباء، لذلك تُصنع منه الأسلاك.',
  },
  {
    id: 'wood',
    name: 'مسطرة خشبية جافة',
    isConductor: false,
    note: 'الخشب الجاف مادة عازلة تمنع مرور الإلكترونات.',
  },
  {
    id: 'iron',
    name: 'مفتاح حديدي',
    isConductor: true,
    note: 'الحديد معدن موصل يسمح للتيار بإكمال دورته.',
  },
  {
    id: 'plastic',
    name: 'قلم بلاستيكي',
    isConductor: false,
    note: 'البلاستيك عازل يحمي أيدينا عند لمس الأسلاك المغلّفة.',
  },
  {
    id: 'saltwater',
    name: 'ماء مالح',
    isConductor: true,
    note: 'الأملاح الذائبة في الماء تجعله موصلاً للتيار الكهربائي!',
  },
  {
    id: 'rubber',
    name: 'ممحاة مطاطية',
    isConductor: false,
    note: 'المطاط عازل قوي يُستخدم في أحذية وقفازات الكهربائي.',
  },
];

export const CircuitLab: React.FC = () => {
  const [switchClosed, setSwitchClosed] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('copper');

  const selectedMaterial =
    MATERIALS.find((m) => m.id === selectedMaterialId) ?? MATERIALS[0];
  const isCircuitActive = switchClosed && selectedMaterial.isConductor;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          {isCircuitActive ? (
            <Lightbulb className="w-5 h-5 text-amber-600" aria-hidden="true" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-slate-500" aria-hidden="true" />
          )}
          <span className="font-semibold text-slate-900">
            {isCircuitActive
              ? 'المصباح متوهّج · الدارة مغلقة والتيار يمر'
              : !switchClosed
              ? 'المصباح منطفئ · القاطعة مفتوحة'
              : 'المصباح منطفئ · المادة الموضوعة عازلة'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSwitchClosed((prev) => !prev)}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            switchClosed
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          <Power className="w-4 h-4" aria-hidden="true" />
          {switchClosed ? 'القاطعة: مغلقة (اضغط للفتح)' : 'القاطعة: مفتوحة (اضغط للغلق)'}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <svg
          viewBox="0 0 560 230"
          className="w-full h-auto max-h-[250px]"
          role="img"
          aria-label="رسم تفاعلي لدارة كهربائية بسيطة"
        >
          <path
            d="M 100 180 L 100 55 L 245 55 M 315 55 L 460 55 L 460 180 L 330 180 M 225 180 L 100 180"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {isCircuitActive && (
            <path
              d="M 100 180 L 100 55 L 460 55 L 460 180 L 100 180"
              fill="none"
              stroke="#0284C7"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-electron-flow"
            />
          )}

          <g transform="translate(65, 92)">
            <rect x="0" y="0" width="70" height="52" rx="8" fill="#0F172A" />
            <rect x="7" y="7" width="24" height="38" rx="4" fill="#D97706" />
            <text x="52" y="25" fill="#FFFFFF" fontSize="14" fontWeight="bold" textAnchor="middle">
              +
            </text>
            <text x="52" y="42" fill="#94A3B8" fontSize="14" fontWeight="bold" textAnchor="middle">
              -
            </text>
            <text x="35" y="68" fill="#334155" fontSize="12" fontWeight="600" textAnchor="middle">
              بطارية 4.5V
            </text>
          </g>

          <g onClick={() => setSwitchClosed((p) => !p)} className="cursor-pointer">
            <circle cx="245" cy="55" r="6" fill="#0F172A" />
            <circle cx="315" cy="55" r="6" fill="#0F172A" />
            <line
              x1="245"
              y1="55"
              x2={switchClosed ? '315' : '305'}
              y2={switchClosed ? '55' : '25'}
              stroke={switchClosed ? '#059669' : '#DC2626'}
              strokeWidth="6"
              strokeLinecap="round"
            />
            <text x="280" y="22" fill="#334155" fontSize="12" fontWeight="600" textAnchor="middle">
              القاطعة ({switchClosed ? 'مغلقة' : 'مفتوحة'})
            </text>
          </g>

          <g transform="translate(460, 118)">
            {isCircuitActive && <circle cx="0" cy="-6" r="38" fill="#FDE68A" opacity="0.65" />}
            <circle
              cx="0"
              cy="-6"
              r="22"
              fill={isCircuitActive ? '#FACC15' : '#F1F5F9'}
              stroke={isCircuitActive ? '#CA8A04' : '#64748B'}
              strokeWidth="3"
            />
            <path
              d="M -7 -2 L -3 -12 L 3 -12 L 7 -2"
              fill="none"
              stroke={isCircuitActive ? '#92400E' : '#94A3B8'}
              strokeWidth="2.5"
            />
            <rect x="-11" y="14" width="22" height="12" rx="3" fill="#475569" />
            <text x="0" y="45" fill="#334155" fontSize="12" fontWeight="600" textAnchor="middle">
              المصباح
            </text>
          </g>

          <g transform="translate(220, 160)">
            <rect
              x="0"
              y="0"
              width="120"
              height="40"
              rx="8"
              fill={selectedMaterial.isConductor ? '#E0F2FE' : '#FEF3C7'}
              stroke={selectedMaterial.isConductor ? '#0284C7' : '#D97706'}
              strokeWidth="2"
            />
            <text x="60" y="25" fill="#0F172A" fontSize="13" fontWeight="700" textAnchor="middle">
              {selectedMaterial.name}
            </text>
          </g>
        </svg>
      </div>

      <div className="space-y-2.5">
        <div className="text-xs font-semibold text-slate-700">
          اختر مادة لوضعها في نقطة الاختبار:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MATERIALS.map((mat) => {
            const active = mat.id === selectedMaterialId;
            return (
              <button
                key={mat.id}
                type="button"
                onClick={() => setSelectedMaterialId(mat.id)}
                className={`px-3 py-2.5 text-sm font-medium rounded-lg border text-right transition-colors cursor-pointer ${
                  active
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-sky-300 hover:bg-sky-50/40'
                }`}
              >
                {mat.name}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-sm ${
          selectedMaterial.isConductor
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : 'bg-amber-50 border-amber-200 text-amber-950'
        }`}
      >
        <Zap className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <strong>الاستنتاج العلمي: </strong>
          {selectedMaterial.note}
        </div>
      </div>
    </div>
  );
};
