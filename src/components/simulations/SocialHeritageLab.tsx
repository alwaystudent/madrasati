import React, { useState } from 'react';
import { Compass, Landmark, MapPin, ShieldCheck } from 'lucide-react';

type ExplorerTab = 'geography' | 'history' | 'civics';

interface RegionItem {
  id: string;
  name: string;
  tag: string;
  climate: string;
  highlight: string;
  landmark: string;
}

const REGIONS: RegionItem[] = [
  {
    id: 'north',
    name: 'الشمال التونسي (تونس، بنزرت، طبرقة)',
    tag: 'مناخ متوسطي رطب',
    climate: 'شتاء ممطر وغابات فلين وجبال خضراء ووادي مجردة.',
    highlight: 'زراعة الحبوب والخضر وصيد الأسماك والموانئ الكبرى.',
    landmark: 'قرطاج الأثرية ومدينة تونس العتيقة',
  },
  {
    id: 'center',
    name: 'الوسط والساحل (القيروان، سوسة، صفاقس)',
    tag: 'مناخ شبه جاف',
    climate: 'سهول واسعة ومناخ معتدل على الساحل وحار صيفاً بالداخل.',
    highlight: 'غابات الزيتون الكبرى، الصناعات الغذائية، والسياحة الساحلية.',
    landmark: 'جامع عقبة بن نافع وقصر الجم',
  },
  {
    id: 'south',
    name: 'الجنوب وجزيرة جربة (مدنين، توزر، تطاوين)',
    tag: 'مناخ صحراوي وواحي',
    climate: 'واحات نخيل وجزيرة جربة المعتدلة ذات العمارة المنزليّة البيضاء.',
    highlight: 'إنتاج التمور (دقلة النور)، الفخار التقليدي، والسياحة البيئية.',
    landmark: 'أقواس جزيرة جربة وقصور تطاوين وواحة توزر',
  },
];

const TIMELINE_EVENTS = [
  { year: '814 ق.م', title: 'تأسيس قرطاج', detail: 'أسّستها عليسة فصارت مركزاً تجارياً وبحرياً عظيماً في البحر المتوسط.' },
  { year: '670 م / 50 هـ', title: 'تأسيس القيروان', detail: 'بناها عقبة بن نافع لتكون أول مدينة إسلامية ومنارة للعلم في إفريقية.' },
  { year: '916 م', title: 'تأسيس المهدية', detail: 'مدينة ساحلية محصّنة ازدهرت فيها الملاحة والتجارة المتوسطية.' },
  { year: '1956 - 1957', title: 'الاستقلال والجمهورية', detail: 'بناء الدولة التونسية الحديثة وتعميم التعليم المجاني للجميع.' },
];

const CIVICS_PILLARS = [
  { title: 'الحق في التعلّم والرعاية', tip: 'لكل طفل في تونس الحق في المدرسة، اللعب، والرعاية الصحية.' },
  { title: 'المواطنة والبيئة', tip: 'أحافظ على نظافة مدرستي، أرشد استهلاك الماء، وأغرس الأشجار.' },
  { title: 'التضامن واحترام الآخر', tip: 'أساعد زملائي وأحترم الاختلاف وألتزم بقواعد المرور والسلامة.' },
];

export const SocialHeritageLab: React.FC = () => {
  const [tab, setTab] = useState<ExplorerTab>('geography');
  const [selectedRegion, setSelectedRegion] = useState<string>('south');
  const [selectedEraIdx, setSelectedEraIdx] = useState<number>(0);

  const activeRegion = REGIONS.find((r) => r.id === selectedRegion) ?? REGIONS[2];
  const activeEra = TIMELINE_EVENTS[selectedEraIdx] ?? TIMELINE_EVENTS[0];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
      {/* Mode Switcher */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab('geography')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
            tab === 'geography'
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Compass className="w-4 h-4" aria-hidden="true" />
          خريطة أقاليم تونس
        </button>
        <button
          type="button"
          onClick={() => setTab('history')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
            tab === 'history'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Landmark className="w-4 h-4" aria-hidden="true" />
          الخط الزمني لتاريخ تونس
        </button>
        <button
          type="button"
          onClick={() => setTab('civics')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
            tab === 'civics'
              ? 'bg-sky-600 text-white border-sky-600'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" aria-hidden="true" />
          ميثاق التلميذ المواطن
        </button>
      </div>

      {tab === 'geography' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
          <div className="md:col-span-5 space-y-2">
            {REGIONS.map((region) => {
              const isSelected = region.id === selectedRegion;
              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => setSelectedRegion(region.id)}
                  className={`w-full p-3 rounded-xl border text-right transition-colors cursor-pointer space-y-1 ${
                    isSelected
                      ? 'bg-teal-50 border-teal-500 text-teal-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold">{region.name}</span>
                    <MapPin
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? 'text-teal-600' : 'text-slate-400'
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="text-xs font-semibold text-teal-700">{region.tag}</div>
                </button>
              );
            })}
          </div>

          <div className="md:col-span-7 p-4 rounded-xl bg-teal-50/50 border border-teal-200 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-teal-700">{activeRegion.tag}</div>
              <h3 className="text-base font-display font-bold text-slate-900">
                {activeRegion.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                <strong>المناخ والتضاريس:</strong> {activeRegion.climate}
              </p>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                <strong>أبرز الأنشطة:</strong> {activeRegion.highlight}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-teal-200 text-xs font-semibold text-teal-900">
              مَعلم بارز: {activeRegion.landmark}
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TIMELINE_EVENTS.map((ev, idx) => {
              const active = idx === selectedEraIdx;
              return (
                <button
                  key={ev.year}
                  type="button"
                  onClick={() => setSelectedEraIdx(idx)}
                  className={`p-3 rounded-xl border text-right transition-colors cursor-pointer ${
                    active
                      ? 'bg-amber-50 border-amber-500 text-amber-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  <div className="font-mono text-xs font-bold text-amber-700 tabular-nums">
                    {ev.year}
                  </div>
                  <div className="text-xs font-bold mt-1">{ev.title}</div>
                </button>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1.5">
            <div className="font-mono text-xs font-bold text-amber-800 tabular-nums">
              الحقبة المختارة: {activeEra.year}
            </div>
            <h3 className="text-base font-display font-bold text-slate-900">{activeEra.title}</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{activeEra.detail}</p>
          </div>
        </div>
      )}

      {tab === 'civics' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CIVICS_PILLARS.map((item, idx) => (
            <div
              key={item.title}
              className="p-4 rounded-xl bg-sky-50/60 border border-sky-200 space-y-1.5"
            >
              <div className="font-mono text-xs font-bold text-sky-700 tabular-nums">
                0{idx + 1}
              </div>
              <h3 className="text-sm font-display font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-700 leading-relaxed">{item.tip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
