import { useCallback, useEffect, useState } from 'react';
import {
  getOfflineCacheSummary,
  OfflineCacheSummary,
  precacheCoreLessonResources,
  triggerAppSwUpdate,
} from '../services/offlineCacheService';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DEFAULT_CACHE_SUMMARY: OfflineCacheSummary = {
  supported: typeof window !== 'undefined' && 'caches' in window,
  totalCachedEntries: 0,
  coreLessonEntries: 0,
  mediaCacheEntries: 0,
  hasCurriculumSnapshot: false,
  swActive: false,
  lastCachedAt: null,
};

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
    );
  });
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [isPrecaching, setIsPrecaching] = useState(false);
  const [cacheSummary, setCacheSummary] =
    useState<OfflineCacheSummary>(DEFAULT_CACHE_SUMMARY);

  const refreshCacheSummary = useCallback(async () => {
    const summary = await getOfflineCacheSummary();
    setCacheSummary(summary);
    if (summary.swActive || summary.hasCurriculumSnapshot || summary.totalCachedEntries > 0) {
      setIsOfflineReady(true);
    }
    return summary;
  }, []);

  const precacheLessonsNow = useCallback(async () => {
    setIsPrecaching(true);
    try {
      const summary = await precacheCoreLessonResources();
      setCacheSummary(summary);
      if (summary.hasCurriculumSnapshot || summary.totalCachedEntries > 0) {
        setIsOfflineReady(true);
      }
      return summary;
    } finally {
      setIsPrecaching(false);
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const handleSwOfflineReady = () => {
      setIsOfflineReady(true);
      void refreshCacheSummary();
    };

    const handleSwNeedRefresh = () => {
      setNeedRefresh(true);
    };

    const handleCacheUpdated = () => {
      void refreshCacheSummary();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    window.addEventListener('aziz-pwa-offline-ready', handleSwOfflineReady);
    window.addEventListener('aziz-pwa-need-refresh', handleSwNeedRefresh);
    window.addEventListener('aziz-pwa-cache-updated', handleCacheUpdated);

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      void navigator.serviceWorker.ready
        .then(() => {
          setIsOfflineReady(true);
          return refreshCacheSummary();
        })
        .catch(() => {
          // ignore sw check errors
        });
    }

    // Inspect existing Cache Storage entries without downloading extra files automatically.
    void refreshCacheSummary();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
      window.removeEventListener('aziz-pwa-offline-ready', handleSwOfflineReady);
      window.removeEventListener('aziz-pwa-need-refresh', handleSwNeedRefresh);
      window.removeEventListener('aziz-pwa-cache-updated', handleCacheUpdated);
    };
  }, [refreshCacheSummary]);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  const applySwUpdate = useCallback(async () => {
    setNeedRefresh(false);
    await triggerAppSwUpdate();
  }, []);

  return {
    canInstall: Boolean(deferredPrompt) && !isInstalled,
    isInstalled,
    isOfflineReady,
    needRefresh,
    applySwUpdate,
    cacheSummary,
    isPrecaching,
    precacheLessonsNow,
    refreshCacheSummary,
    promptInstall,
  };
}
