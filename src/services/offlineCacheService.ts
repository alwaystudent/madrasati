import { registerSW } from 'virtual:pwa-register';
import { LESSONS } from '../data/tunisianCurriculum';

export const CORE_LESSON_CACHE_NAME = 'aziz-academy-core-lessons-v1';
export const CORE_MEDIA_CACHE_NAME = 'aziz-academy-media-cache';
export const LESSONS_SNAPSHOT_URL = '/offline-lessons-snapshot.json';
const CACHE_TIMESTAMP_KEY = 'aziz_offline_cache_updated_at';

export const CORE_SHELL_URLS: string[] = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
];

export const CORE_LESSON_IMAGE_URLS: string[] = [
  '/src/assets/images/hero_djerba_academy_1795260007139.jpg',
  '/src/assets/images/hero_djerba_palm_1795261535045.jpg',
  '/src/assets/images/hero_tunisian_learning_1795189781389.jpg',
  '/src/assets/images/mascot_fanak_fox_1795189779395.jpg',
  '/src/assets/images/subject_math_geometry_1795189780076.jpg',
  '/src/assets/images/subject_science_lab_1795189780009.jpg',
  '/src/assets/images/subject_social_heritage_1795260006416.jpg',
  '/src/assets/images/visual_studio_science_1795260006947.jpg',
];

export interface OfflineCacheSummary {
  supported: boolean;
  totalCachedEntries: number;
  coreLessonEntries: number;
  mediaCacheEntries: number;
  hasCurriculumSnapshot: boolean;
  swActive: boolean;
  lastCachedAt: string | null;
}

let swUpdateFn: ((reloadPage?: boolean) => Promise<void>) | null = null;
let swRegistered = false;

export function registerAppServiceWorker(): void {
  if (typeof window === 'undefined' || swRegistered) {
    return;
  }

  if (!('serviceWorker' in navigator)) {
    return;
  }

  swRegistered = true;

  try {
    swUpdateFn = registerSW({
      immediate: true,
      onNeedRefresh() {
        window.dispatchEvent(new CustomEvent('aziz-pwa-need-refresh'));
      },
      onOfflineReady() {
        window.dispatchEvent(new CustomEvent('aziz-pwa-offline-ready'));
      },
      onRegisterError() {
        // Registration may fail inside restricted embedded frames; non-fatal.
      },
    });
  } catch {
    // Non-fatal in environments without active SW support.
  }
}

export async function triggerAppSwUpdate(): Promise<void> {
  if (swUpdateFn) {
    await swUpdateFn(true);
  } else if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

export async function getOfflineCacheSummary(): Promise<OfflineCacheSummary> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return {
      supported: false,
      totalCachedEntries: 0,
      coreLessonEntries: 0,
      mediaCacheEntries: 0,
      hasCurriculumSnapshot: false,
      swActive: false,
      lastCachedAt: null,
    };
  }

  let totalCachedEntries = 0;
  let coreLessonEntries = 0;
  let mediaCacheEntries = 0;
  let hasCurriculumSnapshot = false;

  try {
    const cacheNames = await window.caches.keys();
    for (const cacheName of cacheNames) {
      const isAzizOrWorkbox =
        cacheName.startsWith('aziz-academy-') || cacheName.startsWith('workbox-');
      if (!isAzizOrWorkbox) continue;

      const cache = await window.caches.open(cacheName);
      const keys = await cache.keys();
      totalCachedEntries += keys.length;

      if (
        cacheName === CORE_LESSON_CACHE_NAME ||
        cacheName === 'aziz-academy-lessons-cache'
      ) {
        coreLessonEntries += keys.length;
      }

      if (cacheName === CORE_MEDIA_CACHE_NAME) {
        mediaCacheEntries += keys.length;
      }

      if (cacheName === CORE_LESSON_CACHE_NAME) {
        const snapshotMatch = await cache.match(LESSONS_SNAPSHOT_URL);
        if (snapshotMatch) {
          hasCurriculumSnapshot = true;
        }
      }
    }
  } catch {
    // Ignore restricted cache inspection errors
  }

  let swActive = false;
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      swActive = Boolean(reg?.active || navigator.serviceWorker.controller);
    } catch {
      swActive = false;
    }
  }

  let lastCachedAt: string | null = null;
  try {
    lastCachedAt = window.localStorage.getItem(CACHE_TIMESTAMP_KEY);
  } catch {
    lastCachedAt = null;
  }

  return {
    supported: true,
    totalCachedEntries,
    coreLessonEntries,
    mediaCacheEntries,
    hasCurriculumSnapshot,
    swActive,
    lastCachedAt,
  };
}

async function fetchAndStoreInCache(cache: Cache, url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { cache: 'no-cache' });
    if (response.ok) {
      await cache.put(url, response.clone());
      return true;
    }
  } catch {
    // Individual asset fetch may fail offline; skip gracefully
  }
  return false;
}

export async function precacheCoreLessonResources(): Promise<OfflineCacheSummary> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return getOfflineCacheSummary();
  }

  try {
    const [coreCache, mediaCache] = await Promise.all([
      window.caches.open(CORE_LESSON_CACHE_NAME),
      window.caches.open(CORE_MEDIA_CACHE_NAME),
    ]);

    const snapshotPayload = {
      platform: 'أكاديمية عزيز',
      curriculumYear: '2026',
      cachedAt: new Date().toISOString(),
      totalLessons: LESSONS.length,
      lessonsIndex: LESSONS.map((lesson) => ({
        id: lesson.id,
        grade: lesson.grade,
        subjectId: lesson.subjectId,
        trimester: lesson.trimester,
        title: lesson.title,
        durationMinutes: lesson.durationMinutes,
      })),
    };

    const snapshotResponse = new Response(JSON.stringify(snapshotPayload), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Aziz-Offline-Cache': 'true',
      },
    });
    await coreCache.put(LESSONS_SNAPSHOT_URL, snapshotResponse);

    await Promise.all([
      ...CORE_SHELL_URLS.map((url) => fetchAndStoreInCache(coreCache, url)),
      ...CORE_LESSON_IMAGE_URLS.map((url) => fetchAndStoreInCache(mediaCache, url)),
    ]);

    try {
      window.localStorage.setItem(CACHE_TIMESTAMP_KEY, snapshotPayload.cachedAt);
    } catch {
      // ignore storage quota restrictions
    }

    const summary = await getOfflineCacheSummary();
    window.dispatchEvent(new CustomEvent('aziz-pwa-cache-updated'));
    return summary;
  } catch {
    // ignore Cache Storage failure in unsupported/private modes
  }

  return getOfflineCacheSummary();
}
