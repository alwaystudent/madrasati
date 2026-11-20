import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  User,
} from 'firebase/auth';
import { BADGES, LESSONS, LEVELS } from '../data/tunisianCurriculum';
import { auth, googleProvider } from '../firebase';
import {
  clearAllCloudCaches,
  CreateProgressReportInput,
  createStudentProfileInCloud,
  deleteProgressReportInCloud,
  deleteStudentProfileInCloud,
  ensureUserAccount,
  fetchGradeLeaderboardOnce,
  fetchPeerChallengesOnce,
  fetchProgressReportsOnce,
  fetchStudentActivitiesOnce,
  fetchUserStudentsOnce,
  generateSafeId,
  recordPeerChallengeToCloud,
  saveProgressReportToCloud,
  saveStudentActivityToCloud,
  setActiveStudentRef,
  syncStudentProgressToCloud,
  upsertLeaderboardEntry,
} from '../services/studentCloudService';
import {
  ActivityEntry,
  BadgeDefinition,
  CloudSyncStatus,
  GradeLevel,
  LeaderboardEntry,
  LevelInfo,
  PeerChallengeRecord,
  RewardNotification,
  SavedProgressReport,
  SavedStudentRecord,
  StudentProgress,
  SubjectId,
} from '../types/curriculum';

const STORAGE_KEY = 'manarat_khamisa_progress_v3';
const LOCAL_REPORTS_KEY = 'manarat_khamisa_local_reports_v1';
const LOCAL_CHALLENGES_KEY = 'manarat_khamisa_local_challenges_v1';
const SYNC_DEBOUNCE_MS = 8500; // Batch rapid progress changes into 1 Firestore write
const LEADERBOARD_REFRESH_COOLDOWN_MS = 15000;

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const getDaysAgoKey = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
};

export function calculateDaysBetween(pastDateStr: string, currentDateStr: string): number {
  const pastMs = Date.parse(`${pastDateStr}T00:00:00Z`);
  const currMs = Date.parse(`${currentDateStr}T00:00:00Z`);
  if (Number.isNaN(pastMs) || Number.isNaN(currMs)) return 0;
  return Math.max(0, Math.floor((currMs - pastMs) / (1000 * 60 * 60 * 24)));
}

const createInitialProgress = (): StudentProgress => {
  const threeDaysAgo = getDaysAgoKey(3);
  return {
    studentName: 'عزيز',
    selectedGrade: 5,
    schoolGovernorate: 'تونس',
    isProfileConfigured: false,
    points: 115,
    streakDays: 3,
    lastActiveDate: threeDaysAgo,
    completedLessons: {
      'math-fractions': {
        bestScore: 4,
        totalQuestions: 5,
        attempts: 1,
        lastCompletedAt: threeDaysAgo,
      },
    },
    completedSteps: {
      'math-fractions': [0, 1, 2],
      'science-circuit': [0],
    },
    unlockedBadges: {
      'first-step': threeDaysAgo,
    },
    equippedBadgeId: 'first-step',
    expressChallengesCompleted: 0,
    challengeWins: 0,
    activityLog: [
      {
        id: 'seed-1',
        lessonId: 'math-fractions',
        grade: 5,
        title: 'الأعداد الكسرية والمقارنة والاختزال',
        subjectId: 'math',
        score: 4,
        total: 5,
        pointsEarned: 85,
        date: threeDaysAgo,
        mode: 'lesson',
      },
    ],
  };
};

function normalizeProgress(raw: Partial<StudentProgress>): StudentProgress {
  const fallback = createInitialProgress();
  const validGrade: GradeLevel =
    raw.selectedGrade === 3 ||
    raw.selectedGrade === 4 ||
    raw.selectedGrade === 5 ||
    raw.selectedGrade === 6
      ? raw.selectedGrade
      : 5;

  const activityLog: ActivityEntry[] = Array.isArray(raw.activityLog)
    ? raw.activityLog.map((entry) => ({
        ...entry,
        grade:
          entry.grade === 3 || entry.grade === 4 || entry.grade === 5 || entry.grade === 6
            ? entry.grade
            : 5,
      }))
    : fallback.activityLog;

  const cleanName =
    typeof raw.studentName === 'string' &&
    raw.studentName.trim() !== '' &&
    raw.studentName.trim() !== 'ياسين بن علي'
      ? raw.studentName.trim()
      : 'عزيز';

  return {
    ...fallback,
    ...raw,
    studentName: cleanName,
    selectedGrade: validGrade,
    challengeWins: typeof raw.challengeWins === 'number' ? raw.challengeWins : 0,
    isProfileConfigured:
      typeof raw.isProfileConfigured === 'boolean' ? raw.isProfileConfigured : false,
    activityLog,
  };
}

function recordToProgress(
  record: SavedStudentRecord,
  existingActivities: ActivityEntry[] = [],
  existingWins = 0
): StudentProgress {
  return {
    studentName: record.studentName,
    selectedGrade: record.selectedGrade,
    schoolGovernorate: record.schoolGovernorate,
    isProfileConfigured: true,
    points: record.points,
    streakDays: record.streakDays,
    lastActiveDate: record.lastActiveDate,
    completedLessons: record.completedLessons || {},
    completedSteps: record.completedSteps || {},
    unlockedBadges: record.unlockedBadges || {},
    equippedBadgeId: record.equippedBadgeId ?? null,
    expressChallengesCompleted: record.expressChallengesCompleted || 0,
    challengeWins: record.challengeWins ?? existingWins,
    activityLog: existingActivities,
  };
}

function computeSyncHash(p: StudentProgress): string {
  return JSON.stringify({
    n: p.studentName,
    g: p.selectedGrade,
    gov: p.schoolGovernorate,
    pts: p.points,
    st: p.streakDays,
    la: p.lastActiveDate,
    cl: p.completedLessons,
    cs: p.completedSteps,
    ub: p.unlockedBadges,
    eb: p.equippedBadgeId ?? '',
    ex: p.expressChallengesCompleted,
    cw: p.challengeWins ?? 0,
  });
}

function computeLeaderboardHash(p: StudentProgress): string {
  return JSON.stringify({
    n: p.studentName,
    g: p.selectedGrade,
    gov: p.schoolGovernorate,
    pts: p.points,
    clc: Object.keys(p.completedLessons || {}).length,
    st: p.streakDays,
    cw: p.challengeWins ?? 0,
    eb: p.equippedBadgeId ?? '',
  });
}

function evaluateNewBadges(candidate: StudentProgress): BadgeDefinition[] {
  const completedCount = Object.keys(candidate.completedLessons).length;
  const newlyUnlocked: BadgeDefinition[] = [];

  for (const badge of BADGES) {
    if (candidate.unlockedBadges[badge.id]) continue;

    let meets = false;
    switch (badge.id) {
      case 'first-step':
        meets = completedCount >= 1;
        break;
      case 'perfect-score':
        meets = Object.values(candidate.completedLessons).some(
          (c) => c.totalQuestions > 0 && c.bestScore >= c.totalQuestions
        );
        break;
      case 'lazy-breaker':
        meets = candidate.expressChallengesCompleted >= 1;
        break;
      case 'science-explorer':
        meets =
          LESSONS.filter(
            (l) => l.subjectId === 'science' && candidate.completedLessons[l.id]
          ).length >= 2;
        break;
      case 'math-knight':
        meets =
          LESSONS.filter(
            (l) => l.subjectId === 'math' && candidate.completedLessons[l.id]
          ).length >= 2;
        break;
      case 'bilingual-star': {
        const hasAr = LESSONS.some(
          (l) => l.subjectId === 'arabic' && candidate.completedLessons[l.id]
        );
        const hasFr = LESSONS.some(
          (l) => l.subjectId === 'french' && candidate.completedLessons[l.id]
        );
        meets = hasAr && hasFr;
        break;
      }
      case 'points-250':
        meets = candidate.points >= 250;
        break;
      case 'master-500':
        meets = candidate.points >= 500;
        break;
    }

    if (meets) {
      newlyUnlocked.push(badge);
    }
  }

  return newlyUnlocked;
}

export function getLevelInfo(points: number): LevelInfo {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (points >= lvl.minPoints) {
      current = lvl;
    }
  }
  return current;
}

function formatGoogleAuthError(err: unknown, inIframe = false): string {
  const code = (err as { code?: string })?.code ?? '';
  const msg = err instanceof Error ? err.message : '';
  const host = typeof window !== 'undefined' ? window.location.hostname : '';

  if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
    return `النطاق الحالي (${host}) غير مضاف ضمن النطاقات المصرّح بها في إعدادات Firebase Authentication (Authorized Domains). أضِف النطاق من لوحة Firebase ثم أعد المحاولة.`;
  }
  if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
    return inIframe
      ? 'حظر المتصفّح النافذة المنبثقة داخل نافذة المعاينة المدمجة. يُرجى السماح بالنوافذ المنبثقة أو فتح المنصة في تبويب مستقل.'
      : 'حظر المتصفّح النافذة المنبثقة لتسجيل الدخول. يُرجى السماح بالنوافذ المنبثقة لهذا الموقع ثم المحاولة مجدداً.';
  }
  if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
    return 'خيار تسجيل الدخول بحساب Google غير مفعّل في مشروع Firebase الحالي. فعّله من تبويب Sign-in method.';
  }
  if (code === 'auth/network-request-failed' || msg.includes('network-request-failed')) {
    return 'تعذّر الاتصال بخادم المصادقة. تأكّد من اتصالك بالإنترنت أو من عدم حظر نطاقات Google وإعادة المحاولة.';
  }
  if (code === 'auth/internal-error' || msg.includes('internal-error')) {
    return inIframe
      ? 'تعذّرت المصادقة داخل الإطار المدمج (قد تكون ملفات الارتباط الخارجية أو النوافذ المنبثقة محظورة). افتح المنصة في تبويب متصفح مستقل للمتابعة.'
      : 'حدث خطأ تقني مؤقّت في خدمة المصادقة. تأكّد من تفعيل ملفات الارتباط (Cookies) وحاول مجدداً.';
  }

  return `تعذّر تسجيل الدخول بحساب Google${code ? ` (${code})` : ''}. يُرجى السماح بالنوافذ المنبثقة أو فتح المنصة في تبويب مستقل والمحاولة مجدداً.`;
}

export interface PeerChallengeSubmitInput {
  opponentOwnerId: string;
  opponentStudentId: string;
  opponentName: string;
  opponentTargetScore: number;
  challengerScore: number;
  totalQuestions: number;
  pointsEarned: number;
}

export function useStudentProgress() {
  const [progress, setProgress] = useState<StudentProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return normalizeProgress(JSON.parse(saved) as Partial<StudentProgress>);
      }
    } catch {
      // Fallback to initial state
    }
    return createInitialProgress();
  });

  const [localReports, setLocalReports] = useState<SavedProgressReport[]>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as SavedProgressReport[];
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [localChallenges, setLocalChallenges] = useState<PeerChallengeRecord[]>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_CHALLENGES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as PeerChallengeRecord[];
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [savedStudents, setSavedStudents] = useState<SavedStudentRecord[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [cloudReports, setCloudReports] = useState<SavedProgressReport[]>([]);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('local');
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [hasPendingSync, setHasPendingSync] = useState(false);

  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [cloudChallenges, setCloudChallenges] = useState<PeerChallengeRecord[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const [rewardNotification, setRewardNotification] =
    useState<RewardNotification | null>(null);
  const [reminderDismissed, setReminderDismissed] = useState(false);

  const progressRef = useRef(progress);
  progressRef.current = progress;
  const authUserRef = useRef<User | null>(authUser);
  authUserRef.current = authUser;
  const activeStudentIdRef = useRef<string | null>(activeStudentId);
  activeStudentIdRef.current = activeStudentId;

  // Batching / Dirty-check refs to minimize Firestore writes
  const syncTimerRef = useRef<number | null>(null);
  const pendingProgressRef = useRef<StudentProgress | null>(null);
  const lastSyncedHashRef = useRef<string>('');
  const lastLeaderboardHashRef = useRef<string>('');
  const lastLeaderboardFetchRef = useRef<number>(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(localReports));
    } catch {
      // Ignore storage quota errors
    }
  }, [localReports]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_CHALLENGES_KEY, JSON.stringify(localChallenges));
    } catch {
      // Ignore storage quota errors
    }
  }, [localChallenges]);

  const flushCloudSyncNow = useCallback(async () => {
    if (syncTimerRef.current !== null) {
      window.clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }

    const user = authUserRef.current;
    const sid = activeStudentIdRef.current;
    const target = pendingProgressRef.current;
    if (!user || !user.emailVerified || !sid || !target) {
      setHasPendingSync(false);
      return;
    }

    const targetHash = computeSyncHash(target);
    if (targetHash === lastSyncedHashRef.current) {
      pendingProgressRef.current = null;
      setHasPendingSync(false);
      return;
    }

    setCloudSyncStatus('syncing');
    try {
      await syncStudentProgressToCloud(user.uid, sid, target);

      const lbHash = computeLeaderboardHash(target);
      if (lbHash !== lastLeaderboardHashRef.current) {
        await upsertLeaderboardEntry(user.uid, sid, target, target.challengeWins ?? 0);
        lastLeaderboardHashRef.current = lbHash;
      }

      lastSyncedHashRef.current = targetHash;
      pendingProgressRef.current = null;
      setHasPendingSync(false);
      setCloudSyncStatus('synced');
      setCloudError(null);

      // Update savedStudents cache in React state locally without extra reads
      setSavedStudents((prev) =>
        prev.map((s) =>
          s.id === sid
            ? {
                ...s,
                studentName: target.studentName,
                selectedGrade: target.selectedGrade,
                schoolGovernorate: target.schoolGovernorate,
                points: target.points,
                streakDays: target.streakDays,
                lastActiveDate: target.lastActiveDate,
                completedLessons: target.completedLessons,
                completedSteps: target.completedSteps,
                unlockedBadges: target.unlockedBadges,
                equippedBadgeId: target.equippedBadgeId,
                expressChallengesCompleted: target.expressChallengesCompleted,
                challengeWins: target.challengeWins,
                updatedAtIso: new Date().toISOString(),
              }
            : s
        )
      );
    } catch (err) {
      setCloudSyncStatus('error');
      setCloudError(err instanceof Error ? err.message : 'تعذّر الحفظ السحابي');
    }
  }, []);

  const scheduleCloudSync = useCallback(
    (nextState: StudentProgress, immediate = false) => {
      const user = authUserRef.current;
      const sid = activeStudentIdRef.current;
      if (!user || !user.emailVerified || !sid) return;

      const nextHash = computeSyncHash(nextState);
      if (nextHash === lastSyncedHashRef.current) return;

      pendingProgressRef.current = nextState;
      setHasPendingSync(true);

      if (syncTimerRef.current !== null) {
        window.clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }

      if (immediate) {
        void flushCloudSyncNow();
      } else {
        syncTimerRef.current = window.setTimeout(() => {
          void flushCloudSyncNow();
        }, SYNC_DEBOUNCE_MS);
      }
    },
    [flushCloudSyncNow]
  );

  // Flush pending batched progress on tab hide / unload so data is never lost
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && pendingProgressRef.current) {
        void flushCloudSyncNow();
      }
    };
    const handlePageHide = () => {
      if (pendingProgressRef.current) {
        void flushCloudSyncNow();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handlePageHide);
      if (syncTimerRef.current !== null) {
        window.clearTimeout(syncTimerRef.current);
      }
    };
  }, [flushCloudSyncNow]);

  // Check if returning from a redirect-based Google sign-in flow
  useEffect(() => {
    void getRedirectResult(auth).catch((err) => {
      const code = (err as { code?: string })?.code ?? '';
      if (code && !code.includes('no-auth-event')) {
        setCloudSyncStatus('error');
        setCloudError(formatGoogleAuthError(err));
      }
    });
  }, []);

  // Listen to Firebase Auth state and load students via bounded one-shot cached reads (zero permanent listeners)
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      setAuthReady(true);

      if (!user || !user.emailVerified) {
        setSavedStudents([]);
        setActiveStudentId(null);
        setCloudReports([]);
        setLeaderboardEntries([]);
        setCloudChallenges([]);
        pendingProgressRef.current = null;
        setHasPendingSync(false);
        setCloudSyncStatus('local');
        clearAllCloudCaches();
        return;
      }

      setCloudSyncStatus('syncing');
      setCloudError(null);

      try {
        const preferredStudentId = await ensureUserAccount(user.uid);
        const existingStudents = await fetchUserStudentsOnce(user.uid);

        if (existingStudents.length === 0) {
          const newId = generateSafeId('stu');
          const initialLocal = progressRef.current;
          await createStudentProfileInCloud(user.uid, newId, initialLocal);
          await upsertLeaderboardEntry(
            user.uid,
            newId,
            initialLocal,
            initialLocal.challengeWins ?? 0
          );
          for (const entry of initialLocal.activityLog.slice(0, 8)) {
            await saveStudentActivityToCloud(user.uid, newId, entry);
          }
          const createdRecord: SavedStudentRecord = {
            id: newId,
            studentName: initialLocal.studentName,
            selectedGrade: initialLocal.selectedGrade,
            schoolGovernorate: initialLocal.schoolGovernorate,
            points: initialLocal.points,
            streakDays: initialLocal.streakDays,
            lastActiveDate: initialLocal.lastActiveDate,
            completedLessons: initialLocal.completedLessons,
            completedSteps: initialLocal.completedSteps,
            unlockedBadges: initialLocal.unlockedBadges,
            equippedBadgeId: initialLocal.equippedBadgeId,
            expressChallengesCompleted: initialLocal.expressChallengesCompleted,
            challengeWins: initialLocal.challengeWins ?? 0,
            updatedAtIso: new Date().toISOString(),
          };
          setSavedStudents([createdRecord]);
          setActiveStudentId(newId);
          const nextState = { ...initialLocal, isProfileConfigured: true };
          setProgress(nextState);
          lastSyncedHashRef.current = computeSyncHash(nextState);
          lastLeaderboardHashRef.current = computeLeaderboardHash(nextState);
        } else {
          setSavedStudents(existingStudents);
          const chosen =
            existingStudents.find((s) => s.id === preferredStudentId) ?? existingStudents[0];
          setActiveStudentId(chosen.id);
          const hydrated = recordToProgress(chosen, progressRef.current.activityLog);
          setProgress(hydrated);
          lastSyncedHashRef.current = computeSyncHash(hydrated);
          lastLeaderboardHashRef.current = '';
        }

        setCloudSyncStatus('synced');
      } catch (err) {
        setCloudSyncStatus('error');
        setCloudError(err instanceof Error ? err.message : 'تعذّر الاتصال بقاعدة البيانات');
      }
    });

    return () => {
      unsubAuth();
    };
  }, []);

  // Load activities and reports once (cached) when active student changes
  useEffect(() => {
    if (!authUser || !authUser.emailVerified || !activeStudentId) {
      return;
    }

    let cancelled = false;
    const loadStudentSubCollections = async () => {
      try {
        const [activities, reports] = await Promise.all([
          fetchStudentActivitiesOnce(authUser.uid, activeStudentId),
          fetchProgressReportsOnce(authUser.uid, activeStudentId),
        ]);
        if (cancelled) return;
        setProgress((prev) => ({
          ...prev,
          activityLog: activities,
        }));
        setCloudReports(reports);
      } catch {
        // Non-fatal: keep existing local view if sub-fetch fails
      }
    };

    void loadStudentSubCollections();
    return () => {
      cancelled = true;
    };
  }, [authUser, activeStudentId]);

  const refreshLeaderboard = useCallback(
    async (force = false) => {
      const user = authUserRef.current;
      const sid = activeStudentIdRef.current;
      const grade = progressRef.current.selectedGrade;

      if (!user || !user.emailVerified) {
        setLeaderboardEntries([]);
        return;
      }

      const now = Date.now();
      const canForce = force && now - lastLeaderboardFetchRef.current >= LEADERBOARD_REFRESH_COOLDOWN_MS;
      setLeaderboardLoading(true);

      try {
        // Flush any dirty local progress so student's own score is up to date before fetching rank
        if (pendingProgressRef.current) {
          await flushCloudSyncNow();
        } else if (sid) {
          const currentLbHash = computeLeaderboardHash(progressRef.current);
          if (currentLbHash !== lastLeaderboardHashRef.current) {
            await upsertLeaderboardEntry(
              user.uid,
              sid,
              progressRef.current,
              progressRef.current.challengeWins ?? 0
            );
            lastLeaderboardHashRef.current = currentLbHash;
          }
        }

        const [entries, challenges] = await Promise.all([
          fetchGradeLeaderboardOnce(grade, canForce),
          fetchPeerChallengesOnce(user.uid, canForce),
        ]);

        if (canForce || lastLeaderboardFetchRef.current === 0) {
          lastLeaderboardFetchRef.current = now;
        }

        setLeaderboardEntries(entries);
        setCloudChallenges(challenges);

        // Sync challengeWins from authoritative leaderboard record if available
        if (sid) {
          const selfRow = entries.find((e) => e.studentId === sid);
          if (selfRow && selfRow.challengeWins > (progressRef.current.challengeWins ?? 0)) {
            setProgress((prev) => ({
              ...prev,
              challengeWins: selfRow.challengeWins,
            }));
          }
        }
      } catch (err) {
        setCloudError(err instanceof Error ? err.message : 'تعذّر تحميل لوحة الصدارة');
      } finally {
        setLeaderboardLoading(false);
      }
    },
    [flushCloudSyncNow]
  );

  const signInWithGoogle = useCallback(async () => {
    setCloudError(null);
    setCloudSyncStatus('syncing');
    const inIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const code = (err as { code?: string })?.code ?? '';
      const msg = err instanceof Error ? err.message : '';

      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        msg.includes('popup-closed-by-user') ||
        msg.includes('cancelled-popup-request')
      ) {
        setCloudSyncStatus('local');
        return;
      }

      // If browser blocked the popup and we are in a top-level tab (e.g. Vercel / mobile),
      // seamlessly fall back to redirect sign-in.
      if (
        (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) &&
        !inIframe
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          setCloudSyncStatus('error');
          setCloudError(formatGoogleAuthError(redirectErr));
          return;
        }
      }

      console.error('Google Sign-In Error:', code || msg, err);
      setCloudSyncStatus('error');
      setCloudError(formatGoogleAuthError(err, inIframe));
    }
  }, []);

  const signOutCloud = useCallback(async () => {
    try {
      if (pendingProgressRef.current) {
        await flushCloudSyncNow();
      }
      await signOut(auth);
      setActiveStudentId(null);
      setSavedStudents([]);
      setCloudReports([]);
      setLeaderboardEntries([]);
      setCloudChallenges([]);
      setCloudSyncStatus('local');
      clearAllCloudCaches();
    } catch {
      setCloudError('تعذّر تسجيل الخروج حالياً.');
    }
  }, [flushCloudSyncNow]);

  const selectSavedStudent = useCallback(
    async (studentId: string) => {
      if (pendingProgressRef.current) {
        await flushCloudSyncNow();
      }
      const target = savedStudents.find((s) => s.id === studentId);
      if (!target) return;
      setActiveStudentId(studentId);
      const nextProgress = recordToProgress(target, []);
      setProgress(nextProgress);
      lastSyncedHashRef.current = computeSyncHash(nextProgress);
      lastLeaderboardHashRef.current = '';
      setReminderDismissed(false);

      if (authUserRef.current && authUserRef.current.emailVerified) {
        try {
          await setActiveStudentRef(authUserRef.current.uid, studentId);
        } catch {
          // non-fatal
        }
      }
    },
    [savedStudents, flushCloudSyncNow]
  );

  const createNewStudentProfile = useCallback(
    async (studentName: string, selectedGrade: GradeLevel, schoolGovernorate: string) => {
      if (pendingProgressRef.current) {
        await flushCloudSyncNow();
      }
      const today = getTodayKey();
      const fresh: StudentProgress = {
        studentName: studentName.trim() || 'تلميذ جديد',
        selectedGrade,
        schoolGovernorate: schoolGovernorate.trim() || 'تونس',
        isProfileConfigured: true,
        points: 0,
        streakDays: 1,
        lastActiveDate: today,
        completedLessons: {},
        completedSteps: {},
        unlockedBadges: {},
        equippedBadgeId: null,
        expressChallengesCompleted: 0,
        challengeWins: 0,
        activityLog: [],
      };

      setProgress(fresh);
      setReminderDismissed(true);

      const user = authUserRef.current;
      if (user && user.emailVerified) {
        setCloudSyncStatus('syncing');
        const newId = generateSafeId('stu');
        await createStudentProfileInCloud(user.uid, newId, fresh);
        await upsertLeaderboardEntry(user.uid, newId, fresh, 0);
        const newRecord: SavedStudentRecord = {
          id: newId,
          studentName: fresh.studentName,
          selectedGrade: fresh.selectedGrade,
          schoolGovernorate: fresh.schoolGovernorate,
          points: 0,
          streakDays: 1,
          lastActiveDate: today,
          completedLessons: {},
          completedSteps: {},
          unlockedBadges: {},
          equippedBadgeId: null,
          expressChallengesCompleted: 0,
          challengeWins: 0,
          updatedAtIso: new Date().toISOString(),
        };
        setSavedStudents((prev) => [newRecord, ...prev]);
        setActiveStudentId(newId);
        lastSyncedHashRef.current = computeSyncHash(fresh);
        lastLeaderboardHashRef.current = computeLeaderboardHash(fresh);
        setCloudSyncStatus('synced');
      }
    },
    [flushCloudSyncNow]
  );

  const deleteSavedStudent = useCallback(
    async (studentId: string) => {
      const user = authUserRef.current;
      if (!user || !user.emailVerified) return;
      const remaining = savedStudents.filter((s) => s.id !== studentId);
      if (remaining.length === 0) return;

      setCloudSyncStatus('syncing');
      await deleteStudentProfileInCloud(user.uid, studentId);
      setSavedStudents(remaining);
      if (activeStudentIdRef.current === studentId) {
        const nextStudent = remaining[0];
        setActiveStudentId(nextStudent.id);
        const nextProg = recordToProgress(nextStudent, []);
        setProgress(nextProg);
        lastSyncedHashRef.current = computeSyncHash(nextProg);
        await setActiveStudentRef(user.uid, nextStudent.id);
      }
      setCloudSyncStatus('synced');
    },
    [savedStudents]
  );

  const completeOnboarding = useCallback(
    (studentName: string, selectedGrade: GradeLevel, schoolGovernorate: string) => {
      setProgress((prev) => {
        const nextState: StudentProgress = {
          ...prev,
          studentName: studentName.trim() || 'عزيز',
          selectedGrade,
          schoolGovernorate: schoolGovernorate.trim() || prev.schoolGovernorate,
          isProfileConfigured: true,
        };
        scheduleCloudSync(nextState, true);
        return nextState;
      });
    },
    [scheduleCloudSync]
  );

  const reopenOnboarding = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      isProfileConfigured: false,
    }));
  }, []);

  const dismissRewardNotification = useCallback(() => {
    setRewardNotification(null);
  }, []);

  const dismissReturnReminder = useCallback(() => {
    setReminderDismissed(true);
  }, []);

  const claimReturnBonus = useCallback(() => {
    const today = getTodayKey();
    setProgress((prev) => {
      const bonus = 25;
      let nextState: StudentProgress = {
        ...prev,
        points: prev.points + bonus,
        lastActiveDate: today,
      };
      const unlockedNow = evaluateNewBadges(nextState);
      let badgeBonus = 0;
      if (unlockedNow.length > 0) {
        const nextUnlocked = { ...nextState.unlockedBadges };
        for (const b of unlockedNow) {
          nextUnlocked[b.id] = today;
          badgeBonus += b.bonusPoints;
        }
        nextState = {
          ...nextState,
          points: nextState.points + badgeBonus,
          unlockedBadges: nextUnlocked,
          equippedBadgeId: nextState.equippedBadgeId ?? unlockedNow[0].id,
        };
      }
      setRewardNotification({
        id: `${Date.now()}`,
        pointsEarned: bonus + badgeBonus,
        reason: 'مكافأة العودة النشيطة إلى المنارة',
        unlockedBadges: unlockedNow,
      });
      scheduleCloudSync(nextState, false);
      return nextState;
    });
    setReminderDismissed(true);
  }, [scheduleCloudSync]);

  const simulateAbsence = useCallback((daysAgo: number) => {
    setProgress((prev) => ({
      ...prev,
      lastActiveDate: getDaysAgoKey(daysAgo),
    }));
    setReminderDismissed(false);
  }, []);

  const markStepCompleted = useCallback(
    (lessonId: string, stepIndex: number) => {
      setProgress((prev) => {
        const existing = prev.completedSteps[lessonId] || [];
        if (existing.includes(stepIndex)) return prev;

        const today = getTodayKey();
        const basePoints = 15;
        let nextState: StudentProgress = {
          ...prev,
          points: prev.points + basePoints,
          lastActiveDate: today,
          completedSteps: {
            ...prev.completedSteps,
            [lessonId]: [...existing, stepIndex],
          },
        };

        const unlockedNow = evaluateNewBadges(nextState);
        let bonusSum = 0;
        if (unlockedNow.length > 0) {
          const nextUnlocked = { ...nextState.unlockedBadges };
          for (const b of unlockedNow) {
            nextUnlocked[b.id] = today;
            bonusSum += b.bonusPoints;
          }
          nextState = {
            ...nextState,
            points: nextState.points + bonusSum,
            unlockedBadges: nextUnlocked,
            equippedBadgeId: nextState.equippedBadgeId ?? unlockedNow[0].id,
          };
        }

        setRewardNotification({
          id: `${Date.now()}`,
          pointsEarned: basePoints + bonusSum,
          reason: 'إتمام خطوة استكشاف في المختبر التفاعلي',
          unlockedBadges: unlockedNow,
        });

        // Debounce step completions (8.5s) to avoid hammering Firestore on multi-step exploration
        scheduleCloudSync(nextState, false);
        return nextState;
      });
    },
    [scheduleCloudSync]
  );

  const recordLessonResult = useCallback(
    (
      lessonId: string,
      title: string,
      subjectId: SubjectId,
      grade: GradeLevel,
      score: number,
      total: number,
      pointsFromExercises: number,
      mode: 'lesson' | 'express' | 'exam' | 'french' = 'lesson'
    ) => {
      const today = getTodayKey();
      setProgress((prev) => {
        const daysGap = calculateDaysBetween(prev.lastActiveDate, today);
        const isNewDay = prev.lastActiveDate !== today;
        const prevLesson = prev.completedLessons[lessonId];

        const updatedLessons =
          mode === 'lesson'
            ? {
                ...prev.completedLessons,
                [lessonId]: {
                  bestScore: Math.max(prevLesson?.bestScore ?? 0, score),
                  totalQuestions: total,
                  attempts: (prevLesson?.attempts ?? 0) + 1,
                  lastCompletedAt: today,
                },
              }
            : prev.completedLessons;

        let nextState: StudentProgress = {
          ...prev,
          points: prev.points + pointsFromExercises,
          streakDays:
            daysGap > 2 ? 1 : isNewDay ? prev.streakDays + 1 : prev.streakDays,
          lastActiveDate: today,
          completedLessons: updatedLessons,
          expressChallengesCompleted:
            mode === 'express' || mode === 'exam'
              ? prev.expressChallengesCompleted + 1
              : prev.expressChallengesCompleted,
        };

        const unlockedNow = evaluateNewBadges(nextState);
        let badgeBonusTotal = 0;
        if (unlockedNow.length > 0) {
          const nextUnlocked = { ...nextState.unlockedBadges };
          for (const b of unlockedNow) {
            nextUnlocked[b.id] = today;
            badgeBonusTotal += b.bonusPoints;
          }
          nextState = {
            ...nextState,
            points: nextState.points + badgeBonusTotal,
            unlockedBadges: nextUnlocked,
            equippedBadgeId: nextState.equippedBadgeId ?? unlockedNow[0].id,
          };
          const extraUnlocked = evaluateNewBadges(nextState);
          if (extraUnlocked.length > 0) {
            for (const eb of extraUnlocked) {
              nextState.unlockedBadges[eb.id] = today;
              badgeBonusTotal += eb.bonusPoints;
              nextState.points += eb.bonusPoints;
              unlockedNow.push(eb);
            }
          }
        }

        const totalAwarded = pointsFromExercises + badgeBonusTotal;
        const newEntry: ActivityEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          lessonId,
          grade,
          title,
          subjectId,
          score,
          total,
          pointsEarned: totalAwarded,
          date: today,
          mode,
        };

        nextState = {
          ...nextState,
          activityLog: [newEntry, ...prev.activityLog].slice(0, 30),
        };

        setRewardNotification({
          id: `${Date.now()}`,
          pointsEarned: totalAwarded,
          reason:
            mode === 'express'
              ? `إتمام التحدي السريع (${score}/${total})`
              : mode === 'exam'
              ? `إتمام الاختبار التجريبي (${score}/${total})`
              : mode === 'french'
              ? `إتمام تدريب الفرنسية (${score}/${total})`
              : `إتمام تمارين «${title}» (${score}/${total})`,
          unlockedBadges: unlockedNow,
        });

        scheduleCloudSync(nextState, true);
        if (
          authUserRef.current &&
          authUserRef.current.emailVerified &&
          activeStudentIdRef.current
        ) {
          void saveStudentActivityToCloud(
            authUserRef.current.uid,
            activeStudentIdRef.current,
            newEntry
          );
        }

        return nextState;
      });
    },
    [scheduleCloudSync]
  );

  const submitPeerChallengeResult = useCallback(
    async (input: PeerChallengeSubmitInput): Promise<PeerChallengeRecord | null> => {
      const today = getTodayKey();
      const challengerWon = input.challengerScore > input.opponentTargetScore;
      let createdChallenge: PeerChallengeRecord | null = null;

      setProgress((prev) => {
        const nextWins = (prev.challengeWins ?? 0) + (challengerWon ? 1 : 0);
        let nextState: StudentProgress = {
          ...prev,
          points: prev.points + input.pointsEarned,
          lastActiveDate: today,
          expressChallengesCompleted: prev.expressChallengesCompleted + 1,
          challengeWins: nextWins,
        };

        const unlockedNow = evaluateNewBadges(nextState);
        let badgeBonusTotal = 0;
        if (unlockedNow.length > 0) {
          const nextUnlocked = { ...nextState.unlockedBadges };
          for (const b of unlockedNow) {
            nextUnlocked[b.id] = today;
            badgeBonusTotal += b.bonusPoints;
          }
          nextState = {
            ...nextState,
            points: nextState.points + badgeBonusTotal,
            unlockedBadges: nextUnlocked,
            equippedBadgeId: nextState.equippedBadgeId ?? unlockedNow[0].id,
          };
        }

        const totalAwarded = input.pointsEarned + badgeBonusTotal;
        const newEntry: ActivityEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          lessonId: `peer-duel-${input.opponentStudentId}`,
          grade: prev.selectedGrade,
          title: `مبارزة معرفية ضد ${input.opponentName}`,
          subjectId: 'math',
          score: input.challengerScore,
          total: input.totalQuestions,
          pointsEarned: totalAwarded,
          date: today,
          mode: 'express',
        };

        nextState = {
          ...nextState,
          activityLog: [newEntry, ...prev.activityLog].slice(0, 30),
        };

        setRewardNotification({
          id: `${Date.now()}`,
          pointsEarned: totalAwarded,
          reason: challengerWon
            ? `تفوّق في تحدّي الزميل ${input.opponentName} (${input.challengerScore}/${input.totalQuestions})`
            : `مشاركة مشرّفة ضد ${input.opponentName} (${input.challengerScore}/${input.totalQuestions})`,
          unlockedBadges: unlockedNow,
        });

        scheduleCloudSync(nextState, true);
        return nextState;
      });

      const user = authUserRef.current;
      const sid = activeStudentIdRef.current;
      const currProg = progressRef.current;

      if (user && user.emailVerified && sid) {
        try {
          createdChallenge = await recordPeerChallengeToCloud(user.uid, {
            challengerStudentId: sid,
            challengerName: currProg.studentName || 'عزيز',
            opponentOwnerId: input.opponentOwnerId || user.uid,
            opponentStudentId: input.opponentStudentId,
            opponentName: input.opponentName,
            grade: currProg.selectedGrade,
            challengerScore: input.challengerScore,
            opponentTargetScore: input.opponentTargetScore,
            totalQuestions: input.totalQuestions,
            challengerWon,
          });
          setCloudChallenges((prev) => [createdChallenge!, ...prev].slice(0, 15));
        } catch {
          // Non-fatal
        }
      } else {
        createdChallenge = {
          id: `local_chal_${Date.now()}`,
          ownerId: 'local',
          challengerStudentId: 'local',
          challengerName: currProg.studentName || 'عزيز',
          opponentOwnerId: input.opponentOwnerId || 'practice',
          opponentStudentId: input.opponentStudentId,
          opponentName: input.opponentName,
          grade: currProg.selectedGrade,
          challengerScore: input.challengerScore,
          opponentTargetScore: input.opponentTargetScore,
          totalQuestions: input.totalQuestions,
          challengerWon,
          createdAtIso: new Date().toISOString(),
        };
        setLocalChallenges((prev) => [createdChallenge!, ...prev].slice(0, 15));
      }

      return createdChallenge;
    },
    [scheduleCloudSync]
  );

  const equipBadge = useCallback(
    (badgeId: string) => {
      setProgress((prev) => {
        if (!prev.unlockedBadges[badgeId]) return prev;
        const nextState = {
          ...prev,
          equippedBadgeId: badgeId,
        };
        scheduleCloudSync(nextState, false);
        return nextState;
      });
    },
    [scheduleCloudSync]
  );

  const updateStudentProfile = useCallback(
    (studentName: string, schoolGovernorate: string, selectedGrade?: GradeLevel) => {
      setProgress((prev) => {
        const nextState: StudentProgress = {
          ...prev,
          studentName: studentName.trim() || prev.studentName,
          schoolGovernorate: schoolGovernorate.trim() || prev.schoolGovernorate,
          selectedGrade: selectedGrade ?? prev.selectedGrade,
          isProfileConfigured: true,
        };
        scheduleCloudSync(nextState, true);
        return nextState;
      });
    },
    [scheduleCloudSync]
  );

  const resetProgress = useCallback(() => {
    setProgress((prev) => {
      const nextState: StudentProgress = {
        studentName: prev.studentName,
        selectedGrade: prev.selectedGrade,
        schoolGovernorate: prev.schoolGovernorate,
        isProfileConfigured: prev.isProfileConfigured,
        points: 0,
        streakDays: 1,
        lastActiveDate: getTodayKey(),
        completedLessons: {},
        completedSteps: {},
        unlockedBadges: {},
        equippedBadgeId: null,
        expressChallengesCompleted: 0,
        challengeWins: 0,
        activityLog: [],
      };
      scheduleCloudSync(nextState, true);
      return nextState;
    });
    setRewardNotification(null);
    setReminderDismissed(true);
  }, [scheduleCloudSync]);

  const saveProgressReportSnapshot = useCallback(
    async (input: CreateProgressReportInput): Promise<string> => {
      const user = authUserRef.current;
      const sid = activeStudentIdRef.current;
      if (user && user.emailVerified && sid) {
        setCloudSyncStatus('syncing');
        const created = await saveProgressReportToCloud(user.uid, sid, input);
        setCloudReports((prev) => [created, ...prev].slice(0, 25));
        setCloudSyncStatus('synced');
        return created.id;
      }

      const localId = `local_rep_${Date.now()}`;
      const newReport: SavedProgressReport = {
        id: localId,
        studentId: 'local',
        ...input,
        createdAtIso: new Date().toISOString(),
      };
      setLocalReports((prev) => [newReport, ...prev].slice(0, 25));
      return localId;
    },
    []
  );

  const removeProgressReportSnapshot = useCallback(async (reportId: string) => {
    const user = authUserRef.current;
    const sid = activeStudentIdRef.current;
    if (user && user.emailVerified && sid) {
      await deleteProgressReportInCloud(user.uid, sid, reportId);
      setCloudReports((prev) => prev.filter((r) => r.id !== reportId));
      return;
    }
    setLocalReports((prev) => prev.filter((r) => r.id !== reportId));
  }, []);

  const today = getTodayKey();
  const daysAbsent = calculateDaysBetween(progress.lastActiveDate, today);
  const showReturnReminder = daysAbsent > 2 && !reminderDismissed;

  // Strictly scoped to the student's enrolled grade
  const studentLessons = LESSONS.filter((l) => l.grade === progress.selectedGrade);
  const completedCount = studentLessons.filter(
    (l) => Boolean(progress.completedLessons[l.id])
  ).length;
  const totalLessons = studentLessons.length;
  const overallMasteryPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const levelInfo = getLevelInfo(progress.points);
  const earnedBadges = Object.keys(progress.unlockedBadges);

  const subjectStats = (subjectId: SubjectId) => {
    const subjectLessons = studentLessons.filter((l) => l.subjectId === subjectId);
    const doneLessons = subjectLessons.filter((l) => progress.completedLessons[l.id]);
    const totalQuestions = doneLessons.reduce(
      (acc, l) => acc + (progress.completedLessons[l.id]?.totalQuestions ?? 0),
      0
    );
    const totalScore = doneLessons.reduce(
      (acc, l) => acc + (progress.completedLessons[l.id]?.bestScore ?? 0),
      0
    );
    const accuracy =
      totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
    const completionPercent =
      subjectLessons.length > 0
        ? Math.round((doneLessons.length / subjectLessons.length) * 100)
        : 0;
    return {
      totalLessons: subjectLessons.length,
      completedLessons: doneLessons.length,
      accuracy,
      completionPercent,
    };
  };

  const savedReports =
    authUser && authUser.emailVerified && activeStudentId ? cloudReports : localReports;

  const peerChallenges =
    authUser && authUser.emailVerified && activeStudentId ? cloudChallenges : localChallenges;

  return {
    progress,
    studentLessons,
    daysAbsent,
    showReturnReminder,
    completedCount,
    totalLessons,
    overallMasteryPercent,
    subjectStats,
    earnedBadges,
    levelInfo,
    rewardNotification,
    authUser,
    authReady,
    savedStudents,
    activeStudentId,
    savedReports,
    cloudSyncStatus,
    cloudError,
    hasPendingSync,
    leaderboardEntries,
    peerChallenges,
    leaderboardLoading,
    refreshLeaderboard,
    submitPeerChallengeResult,
    flushCloudSyncNow,
    signInWithGoogle,
    signOutCloud,
    selectSavedStudent,
    createNewStudentProfile,
    deleteSavedStudent,
    saveProgressReportSnapshot,
    removeProgressReportSnapshot,
    completeOnboarding,
    reopenOnboarding,
    dismissRewardNotification,
    dismissReturnReminder,
    claimReturnBonus,
    simulateAbsence,
    markStepCompleted,
    recordLessonResult,
    equipBadge,
    updateStudentProfile,
    resetProgress,
  };
}
