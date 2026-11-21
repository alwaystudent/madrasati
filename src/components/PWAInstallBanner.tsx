import React from 'react';
import {
  CheckCircle2,
  Database,
  DownloadCloud,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useConnectivityState } from '../hooks/useOnlineStatus';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  compact?: boolean;
  onOpenReports?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  compact = false,
  onOpenReports,
}) => {
  const { isOnline, justReconnected } = useConnectivityState();
  const {
    canInstall,
    isInstalled,
    isOfflineReady,
    needRefresh,
    applySwUpdate,
    cacheSummary,
    isPrecaching,
    precacheLessonsNow,
    promptInstall,
  } = usePWAInstall();

  const cachedCount = cacheSummary.totalCachedEntries;
  const hasManualPack = cacheSummary.hasCurriculumSnapshot;
  const hasRuntimeOrManual =
    hasManualPack || cachedCount > 0 || isOfflineReady;

  if (compact) {
    return (
      <div
        className={`p-3 rounded-xl border space-y-2.5 text-xs ${
          !isOnline
            ? 'bg-amber-50/90 border-amber-200 text-amber-950'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}
      >
        {/* Explicit Online / Offline Status */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold inline-flex items-center gap-1.5">
            {!isOnline ? (
              <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
            )}
            <span>{!isOnline ? 'غير متصل بالإنترنت' : 'متصل بالإنترنت'}</span>
          </span>
          <span
            className={`text-[11px] font-semibold ${
              !isOnline
                ? 'text-amber-800'
                : hasManualPack
                ? 'text-emerald-700'
                : 'text-sky-700'
            }`}
          >
            {!isOnline
              ? 'وضع دون نت'
              : hasManualPack
              ? 'محمّل بالكامل'
              : 'أثناء التصفح'}
          </span>
        </div>

        {/* Two-mode Cache Storage Summary */}
        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-600 bg-white/80 border border-slate-200/80 rounded-lg px-2.5 py-1.5">
          <span className="inline-flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-sky-600 shrink-0" aria-hidden="true" />
            <span>
              {hasManualPack ? 'حزمة الدروس اليدوية' : 'تخزين التصفح (Runtime)'}
            </span>
          </span>
          <span className="font-mono font-bold text-slate-800">
            {cachedCount > 0 ? `${cachedCount} مورداً` : hasRuntimeOrManual ? 'نشط' : '0'}
          </span>
        </div>

        {/* Manual Download / Update Button */}
        <div className="flex flex-wrap items-center gap-1.5">
          {isOnline && (
            <button
              type="button"
              disabled={isPrecaching}
              onClick={() => void precacheLessonsNow()}
              className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2.5 text-[11px] font-semibold text-sky-900 bg-sky-100/80 hover:bg-sky-200/80 disabled:opacity-60 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              {hasManualPack ? (
                <RefreshCw
                  className={`w-3 h-3 ${isPrecaching ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
              ) : (
                <DownloadCloud className="w-3 h-3" aria-hidden="true" />
              )}
              {isPrecaching
                ? 'جارٍ التحميل...'
                : hasManualPack
                ? 'تحديث موارد الدروس'
                : 'تحميل موارد الدروس'}
            </button>
          )}

          {needRefresh && isOnline && (
            <button
              type="button"
              onClick={() => void applySwUpdate()}
              className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2.5 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3 h-3" aria-hidden="true" />
              تحديث المنصة
            </button>
          )}

          {canInstall && (
            <button
              type="button"
              onClick={() => void promptInstall()}
              className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2.5 text-[11px] font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <DownloadCloud className="w-3.5 h-3.5" aria-hidden="true" />
              تثبيت التطبيق
            </button>
          )}

          {onOpenReports && (
            <button
              type="button"
              onClick={onOpenReports}
              className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-2.5 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              نسخة Drive الاحتياطية وتقارير التقدّم
            </button>
          )}
        </div>

        {isInstalled && (
          <div className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>مثبّت كتطبيق مستقل جاهز دائماً</span>
          </div>
        )}
      </div>
    );
  }

  // Top workspace explicit connection & two-mode Cache Storage bar
  return (
    <div
      role="status"
      aria-live="polite"
      className={`border-b px-4 sm:px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-2 transition-colors ${
        !isOnline
          ? 'bg-amber-50 border-amber-200 text-amber-950'
          : justReconnected
          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
          : 'bg-sky-50/80 border-sky-100 text-sky-950'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 font-medium">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
            <span>
              <strong>غير متصل بالإنترنت:</strong> يتم تشغيل الدروس التي تم حفظها في{' '}
              <span className="font-mono font-semibold">Cache Storage</span> (
              {cachedCount > 0 ? `${cachedCount} مورداً متاحاً` : 'وضع دون نت نشط'}) وستُرفع إنجازاتك عند عودة الاتصال.
            </span>
          </>
        ) : justReconnected ? (
          <>
            <Wifi className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>
              <strong>عاد الاتصال بالإنترنت:</strong> تم استئناف المزامنة السحابية والتخزين الذكي أثناء التصفح.
            </span>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>
              <strong>متصل بالإنترنت</strong>
              {hasManualPack
                ? ` — حزمة الدروس محمّلة يدوياً (${cachedCount} مورداً في Cache Storage) مع تحديث تلقائي أثناء التصفح.`
                : ` — تخزين تلقائي أثناء التصفح فقط لتوفير الإنترنت (${cachedCount} مورداً مخبّأً)؛ ويمكنك التحميل اليدوي الكامل بزر التحميل.`}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {needRefresh && isOnline && (
          <button
            type="button"
            onClick={() => void applySwUpdate()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            تحديث النسخة المخبّأة
          </button>
        )}

        {isOnline && (
          <button
            type="button"
            disabled={isPrecaching}
            onClick={() => void precacheLessonsNow()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-900 bg-white hover:bg-sky-100 border border-sky-200 disabled:opacity-60 rounded-lg cursor-pointer"
          >
            {hasManualPack ? (
              <RefreshCw
                className={`w-3.5 h-3.5 text-sky-600 ${isPrecaching ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
            ) : (
              <Database className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
            )}
            {isPrecaching
              ? 'جارٍ التحميل...'
              : hasManualPack
              ? 'تحديث موارد الدروس'
              : 'تحميل موارد الدروس'}
          </button>
        )}

        {canInstall && (
          <button
            type="button"
            onClick={() => void promptInstall()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer"
          >
            <DownloadCloud className="w-3.5 h-3.5" aria-hidden="true" />
            تثبيت التطبيق
          </button>
        )}
      </div>
    </div>
  );
};
