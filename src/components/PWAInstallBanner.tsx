import React from 'react';
import { CheckCircle2, DownloadCloud, HardDriveDownload, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  compact?: boolean;
  onOpenReports?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  compact = false,
  onOpenReports,
}) => {
  const isOnline = useOnlineStatus();
  const { canInstall, isInstalled, isOfflineReady, promptInstall } = usePWAInstall();

  if (compact) {
    return (
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-slate-800 inline-flex items-center gap-1.5">
            {!isOnline ? (
              <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
            ) : isOfflineReady ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
            ) : (
              <HardDriveDownload className="w-3.5 h-3.5 text-sky-600 shrink-0" aria-hidden="true" />
            )}
            <span>
              {!isOnline
                ? 'وضع العمل بدون إنترنت نشط'
                : isOfflineReady
                ? 'المناهج مخبّأة للعمل دون نت'
                : 'تهيئة وضع عدم الاتصال...'}
            </span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {canInstall && (
            <button
              type="button"
              onClick={() => void promptInstall()}
              className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <DownloadCloud className="w-3.5 h-3.5" aria-hidden="true" />
              تثبيت على الجهاز
            </button>
          )}
          {onOpenReports && (
            <button
              type="button"
              onClick={onOpenReports}
              className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2.5 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              نسخة Drive الاحتياطية
            </button>
          )}
        </div>

        {isInstalled && (
          <div className="text-xs text-emerald-700 font-semibold">
            مثبّت كتطبيق مستقل جاهز دائماً
          </div>
        )}
      </div>
    );
  }

  if (!isOnline || canInstall) {
    return (
      <div className="bg-sky-50 border-b border-sky-200 px-4 py-2 text-xs text-sky-950 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 font-medium">
          {!isOnline ? (
            <>
              <WifiOff className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
              <span>
                أنت تتصفّح أكاديمية عزيز الآن <strong>بدون إنترنت</strong> — جميع الدروس والأنشطة المحفّظة تعمل بشكل طبيعي، وسيُرفع تقدّمك عند عودة الاتصال.
              </span>
            </>
          ) : (
            <>
              <DownloadCloud className="w-4 h-4 text-sky-700 shrink-0" aria-hidden="true" />
              <span>
                ثبّت <strong>أكاديمية عزيز</strong> على جهازك لتعمل بسلاسة تامة حتى بدون اتصال بالإنترنت.
              </span>
            </>
          )}
        </div>

        {canInstall && (
          <button
            type="button"
            onClick={() => void promptInstall()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer shrink-0"
          >
            <DownloadCloud className="w-3.5 h-3.5" aria-hidden="true" />
            تثبيت الآن
          </button>
        )}
      </div>
    );
  }

  return null;
};
