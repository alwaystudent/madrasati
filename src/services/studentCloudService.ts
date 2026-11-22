import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  ActivityEntry,
  FavoriteFrenchWord,
  GradeLevel,
  LeaderboardEntry,
  LessonCompletion,
  ParentFollowUpPreferences,
  ParentNotificationCadence,
  PeerChallengeRecord,
  SavedProgressReport,
  SavedStudentRecord,
  StudentProgress,
  SubjectId,
} from '../types/curriculum';

const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes low-load TTL cache

interface CacheBucket<T> {
  data: T;
  fetchedAt: number;
}

const studentsCache = new Map<string, CacheBucket<SavedStudentRecord[]>>();
const activitiesCache = new Map<string, CacheBucket<ActivityEntry[]>>();
const reportsCache = new Map<string, CacheBucket<SavedProgressReport[]>>();
const leaderboardCache = new Map<GradeLevel, CacheBucket<LeaderboardEntry[]>>();
const peerChallengesCache = new Map<string, CacheBucket<PeerChallengeRecord[]>>();
const favoriteWordsCache = new Map<string, CacheBucket<FavoriteFrenchWord[]>>();

const isFresh = (fetchedAt: number) => Date.now() - fetchedAt < CACHE_TTL_MS;

export function clearAllCloudCaches() {
  studentsCache.clear();
  activitiesCache.clear();
  reportsCache.clear();
  leaderboardCache.clear();
  peerChallengesCache.clear();
  favoriteWordsCache.clear();
}

export function invalidateStudentSubCaches(uid: string, studentId: string) {
  studentsCache.delete(uid);
  activitiesCache.delete(`${uid}:${studentId}`);
  reportsCache.delete(`${uid}:${studentId}`);
  favoriteWordsCache.delete(`${uid}:${studentId}`);
}

const clampInt = (val: number, min: number, max: number): number => {
  const n = Math.round(Number(val) || 0);
  return Math.max(min, Math.min(max, n));
};

const safeString = (val: string | null | undefined, maxLen: number, fallback = ''): string => {
  const trimmed = (val ?? '').trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, maxLen);
};

const safeGovernorate = (val: string | null | undefined): string => {
  const trimmed = (val ?? '').trim();
  if (trimmed.length < 2) return 'تونس';
  return trimmed.slice(0, 50);
};

const safeDate = (val: string | undefined): string => {
  if (val && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  return new Date().toISOString().slice(0, 10);
};

const safeGrade = (g: number): GradeLevel => {
  if (g === 3 || g === 4 || g === 5 || g === 6) return g;
  return 6;
};

function sanitizeLessonsMap(
  raw: Record<string, LessonCompletion>
): Record<string, LessonCompletion> {
  const result: Record<string, LessonCompletion> = {};
  const entries = Object.entries(raw || {}).slice(0, 500);
  for (const [k, v] of entries) {
    if (!k || k.length > 80 || !v) continue;
    const total = clampInt(v.totalQuestions, 1, 500);
    const best = clampInt(v.bestScore, 0, total);
    result[k] = {
      bestScore: best,
      totalQuestions: total,
      attempts: clampInt(v.attempts, 1, 10000),
      lastCompletedAt: safeDate(v.lastCompletedAt),
    };
  }
  return result;
}

function sanitizeStepsMap(raw: Record<string, number[]>): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  const entries = Object.entries(raw || {}).slice(0, 500);
  for (const [k, v] of entries) {
    if (!k || k.length > 80 || !Array.isArray(v)) continue;
    result[k] = v.slice(0, 20).map((idx) => clampInt(idx, 0, 50));
  }
  return result;
}

function sanitizeBadgesMap(raw: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  const entries = Object.entries(raw || {}).slice(0, 30);
  for (const [k, v] of entries) {
    if (!k || k.length > 60) continue;
    result[k] = safeDate(v);
  }
  return result;
}

function timestampToIso(ts: unknown): string {
  if (ts instanceof Timestamp) {
    return ts.toDate().toISOString();
  }
  if (ts && typeof (ts as { toDate?: () => Date }).toDate === 'function') {
    return (ts as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

export function generateSafeId(prefix: string): string {
  const cleanPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '');
  const rand = Math.random().toString(36).slice(2, 8);
  return `${cleanPrefix}_${Date.now()}_${rand}`.slice(0, 64);
}

export async function ensureUserAccount(uid: string): Promise<string> {
  const path = `users/${uid}`;
  const ref = doc(db, 'users', uid);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        ownerId: uid,
        activeStudentId: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return '';
    }
    const data = snap.data() as { activeStudentId?: string };
    return typeof data.activeStudentId === 'string' ? data.activeStudentId : '';
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function setActiveStudentRef(uid: string, studentId: string): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      activeStudentId: safeString(studentId, 64),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createStudentProfileInCloud(
  uid: string,
  studentId: string,
  progress: StudentProgress
): Promise<void> {
  const path = `users/${uid}/students/${studentId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'students', studentId), {
      ownerId: uid,
      studentName: safeString(progress.studentName, 60, 'عزيز'),
      selectedGrade: safeGrade(progress.selectedGrade),
      schoolGovernorate: safeGovernorate(progress.schoolGovernorate),
      points: clampInt(progress.points, 0, 10000000),
      streakDays: clampInt(progress.streakDays, 0, 36500),
      lastActiveDate: safeDate(progress.lastActiveDate),
      completedLessons: sanitizeLessonsMap(progress.completedLessons),
      completedSteps: sanitizeStepsMap(progress.completedSteps),
      unlockedBadges: sanitizeBadgesMap(progress.unlockedBadges),
      equippedBadgeId: safeString(progress.equippedBadgeId, 60, ''),
      expressChallengesCompleted: clampInt(progress.expressChallengesCompleted, 0, 100000),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await setActiveStudentRef(uid, studentId);
    studentsCache.delete(uid);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function syncStudentProgressToCloud(
  uid: string,
  studentId: string,
  progress: StudentProgress
): Promise<void> {
  const path = `users/${uid}/students/${studentId}`;
  try {
    await updateDoc(doc(db, 'users', uid, 'students', studentId), {
      studentName: safeString(progress.studentName, 60, 'عزيز'),
      selectedGrade: safeGrade(progress.selectedGrade),
      schoolGovernorate: safeGovernorate(progress.schoolGovernorate),
      points: clampInt(progress.points, 0, 10000000),
      streakDays: clampInt(progress.streakDays, 0, 36500),
      lastActiveDate: safeDate(progress.lastActiveDate),
      completedLessons: sanitizeLessonsMap(progress.completedLessons),
      completedSteps: sanitizeStepsMap(progress.completedSteps),
      unlockedBadges: sanitizeBadgesMap(progress.unlockedBadges),
      equippedBadgeId: safeString(progress.equippedBadgeId, 60, ''),
      expressChallengesCompleted: clampInt(progress.expressChallengesCompleted, 0, 100000),
      updatedAt: serverTimestamp(),
    });
    studentsCache.delete(uid);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteStudentProfileInCloud(
  uid: string,
  studentId: string
): Promise<void> {
  const path = `users/${uid}/students/${studentId}`;
  try {
    const actSnap = await getDocs(
      query(
        collection(db, 'users', uid, 'students', studentId, 'activities'),
        where('ownerId', '==', uid),
        limit(100)
      )
    );
    await Promise.all(actSnap.docs.map((d) => deleteDoc(d.ref)));

    const repSnap = await getDocs(
      query(
        collection(db, 'users', uid, 'students', studentId, 'progressReports'),
        where('ownerId', '==', uid),
        limit(100)
      )
    );
    await Promise.all(repSnap.docs.map((d) => deleteDoc(d.ref)));

    const favSnap = await getDocs(
      query(
        collection(db, 'users', uid, 'students', studentId, 'favoriteWords'),
        where('ownerId', '==', uid),
        limit(250)
      )
    );
    await Promise.all(favSnap.docs.map((d) => deleteDoc(d.ref)));

    // Best-effort cleanup of public grade leaderboard entry for this student
    try {
      await deleteDoc(doc(db, 'leaderboard', studentId));
    } catch {
      // Ignore if entry didn't exist
    }

    await deleteDoc(doc(db, 'users', uid, 'students', studentId));
    invalidateStudentSubCaches(uid, studentId);
    leaderboardCache.clear();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

function mapStudentDoc(id: string, data: Record<string, unknown>): SavedStudentRecord {
  return {
    id,
    studentName: typeof data.studentName === 'string' ? data.studentName : 'عزيز',
    selectedGrade: safeGrade(Number(data.selectedGrade)),
    schoolGovernorate:
      typeof data.schoolGovernorate === 'string' ? data.schoolGovernorate : 'تونس',
    points: clampInt(Number(data.points), 0, 10000000),
    streakDays: clampInt(Number(data.streakDays), 0, 36500),
    lastActiveDate: safeDate(typeof data.lastActiveDate === 'string' ? data.lastActiveDate : undefined),
    completedLessons: (data.completedLessons as Record<string, LessonCompletion>) || {},
    completedSteps: (data.completedSteps as Record<string, number[]>) || {},
    unlockedBadges: (data.unlockedBadges as Record<string, string>) || {},
    equippedBadgeId:
      typeof data.equippedBadgeId === 'string' && data.equippedBadgeId.trim() !== ''
        ? data.equippedBadgeId
        : null,
    expressChallengesCompleted: clampInt(Number(data.expressChallengesCompleted), 0, 100000),
    updatedAtIso: timestampToIso(data.updatedAt),
  };
}

export async function fetchUserStudentsOnce(
  uid: string,
  forceRefresh = false
): Promise<SavedStudentRecord[]> {
  const cached = studentsCache.get(uid);
  if (!forceRefresh && cached && isFresh(cached.fetchedAt)) {
    return cached.data;
  }
  const path = `users/${uid}/students`;
  try {
    const q = query(collection(db, 'users', uid, 'students'), where('ownerId', '==', uid), limit(25));
    const snap = await getDocs(q);
    const records = snap.docs.map((d) => mapStudentDoc(d.id, d.data()));
    records.sort((a, b) => (b.updatedAtIso ?? '').localeCompare(a.updatedAtIso ?? ''));
    studentsCache.set(uid, { data: records, fetchedAt: Date.now() });
    return records;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveStudentActivityToCloud(
  uid: string,
  studentId: string,
  entry: ActivityEntry
): Promise<void> {
  const activityId = generateSafeId('act');
  const path = `users/${uid}/students/${studentId}/activities/${activityId}`;
  try {
    const total = clampInt(entry.total, 1, 500);
    const score = clampInt(entry.score, 0, total);
    await setDoc(doc(db, 'users', uid, 'students', studentId, 'activities', activityId), {
      ownerId: uid,
      studentId,
      lessonId: safeString(entry.lessonId, 80, 'lesson'),
      grade: safeGrade(entry.grade),
      title: safeString(entry.title, 160, 'نشاط تعلّمي'),
      subjectId: entry.subjectId as SubjectId,
      score,
      total,
      pointsEarned: clampInt(entry.pointsEarned, 0, 10000),
      date: safeDate(entry.date),
      mode: entry.mode,
      createdAt: serverTimestamp(),
    });
    activitiesCache.delete(`${uid}:${studentId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchStudentActivitiesOnce(
  uid: string,
  studentId: string,
  forceRefresh = false
): Promise<ActivityEntry[]> {
  const cacheKey = `${uid}:${studentId}`;
  const cached = activitiesCache.get(cacheKey);
  if (!forceRefresh && cached && isFresh(cached.fetchedAt)) {
    return cached.data;
  }
  const path = `users/${uid}/students/${studentId}/activities`;
  try {
    const q = query(
      collection(db, 'users', uid, 'students', studentId, 'activities'),
      where('ownerId', '==', uid),
      limit(35)
    );
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        lessonId: String(data.lessonId ?? ''),
        grade: safeGrade(Number(data.grade)),
        title: String(data.title ?? ''),
        subjectId: (data.subjectId as SubjectId) ?? 'math',
        score: clampInt(Number(data.score), 0, 500),
        total: clampInt(Number(data.total), 1, 500),
        pointsEarned: clampInt(Number(data.pointsEarned), 0, 10000),
        date: safeDate(typeof data.date === 'string' ? data.date : undefined),
        mode: (data.mode as ActivityEntry['mode']) ?? 'lesson',
        _createdIso: timestampToIso(data.createdAt),
      };
    });
    items.sort((a, b) => b._createdIso.localeCompare(a._createdIso));
    const trimmed = items.slice(0, 30).map(({ _createdIso: _, ...rest }) => rest);
    activitiesCache.set(cacheKey, { data: trimmed, fetchedAt: Date.now() });
    return trimmed;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export interface CreateProgressReportInput {
  studentName: string;
  selectedGrade: GradeLevel;
  schoolGovernorate: string;
  periodLabel: string;
  overallMasteryPercent: number;
  averageAccuracy: number;
  totalPoints: number;
  streakDays: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  earnedBadgesCount: number;
  mathMastery: number;
  scienceMastery: number;
  arabicMastery: number;
  frenchMastery: number;
  socialMastery?: number;
  strengthsSummary: string;
  recommendationsSummary: string;
}

export async function saveProgressReportToCloud(
  uid: string,
  studentId: string,
  input: CreateProgressReportInput
): Promise<SavedProgressReport> {
  const reportId = generateSafeId('rep');
  const path = `users/${uid}/students/${studentId}/progressReports/${reportId}`;
  try {
    const cleanPayload = {
      ownerId: uid,
      studentId,
      studentName: safeString(input.studentName, 60, 'عزيز'),
      selectedGrade: safeGrade(input.selectedGrade),
      schoolGovernorate: safeGovernorate(input.schoolGovernorate),
      periodLabel: safeString(input.periodLabel, 80, 'تقرير متابعة دوري'),
      overallMasteryPercent: clampInt(input.overallMasteryPercent, 0, 100),
      averageAccuracy: clampInt(input.averageAccuracy, 0, 100),
      totalPoints: clampInt(input.totalPoints, 0, 10000000),
      streakDays: clampInt(input.streakDays, 0, 36500),
      completedLessonsCount: clampInt(input.completedLessonsCount, 0, 500),
      totalLessonsCount: clampInt(input.totalLessonsCount, 1, 500),
      earnedBadgesCount: clampInt(input.earnedBadgesCount, 0, 50),
      mathMastery: clampInt(input.mathMastery, 0, 100),
      scienceMastery: clampInt(input.scienceMastery, 0, 100),
      arabicMastery: clampInt(input.arabicMastery, 0, 100),
      frenchMastery: clampInt(input.frenchMastery, 0, 100),
      socialMastery: clampInt(input.socialMastery ?? 0, 0, 100),
      strengthsSummary: safeString(input.strengthsSummary, 400, 'مواظبة طيبة وتقدّم متوازن.'),
      recommendationsSummary: safeString(
        input.recommendationsSummary,
        500,
        'مواصلة التدريب المنتظم على التمارين التفاعلية.'
      ),
      createdAt: serverTimestamp(),
    };
    await setDoc(
      doc(db, 'users', uid, 'students', studentId, 'progressReports', reportId),
      cleanPayload
    );
    reportsCache.delete(`${uid}:${studentId}`);
    return {
      id: reportId,
      studentId,
      studentName: cleanPayload.studentName,
      selectedGrade: cleanPayload.selectedGrade,
      schoolGovernorate: cleanPayload.schoolGovernorate,
      periodLabel: cleanPayload.periodLabel,
      overallMasteryPercent: cleanPayload.overallMasteryPercent,
      averageAccuracy: cleanPayload.averageAccuracy,
      totalPoints: cleanPayload.totalPoints,
      streakDays: cleanPayload.streakDays,
      completedLessonsCount: cleanPayload.completedLessonsCount,
      totalLessonsCount: cleanPayload.totalLessonsCount,
      earnedBadgesCount: cleanPayload.earnedBadgesCount,
      mathMastery: cleanPayload.mathMastery,
      scienceMastery: cleanPayload.scienceMastery,
      arabicMastery: cleanPayload.arabicMastery,
      frenchMastery: cleanPayload.frenchMastery,
      socialMastery: cleanPayload.socialMastery,
      strengthsSummary: cleanPayload.strengthsSummary,
      recommendationsSummary: cleanPayload.recommendationsSummary,
      createdAtIso: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteProgressReportInCloud(
  uid: string,
  studentId: string,
  reportId: string
): Promise<void> {
  const path = `users/${uid}/students/${studentId}/progressReports/${reportId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'students', studentId, 'progressReports', reportId));
    reportsCache.delete(`${uid}:${studentId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchProgressReportsOnce(
  uid: string,
  studentId: string,
  forceRefresh = false
): Promise<SavedProgressReport[]> {
  const cacheKey = `${uid}:${studentId}`;
  const cached = reportsCache.get(cacheKey);
  if (!forceRefresh && cached && isFresh(cached.fetchedAt)) {
    return cached.data;
  }
  const path = `users/${uid}/students/${studentId}/progressReports`;
  try {
    const q = query(
      collection(db, 'users', uid, 'students', studentId, 'progressReports'),
      where('ownerId', '==', uid),
      limit(25)
    );
    const snapshot = await getDocs(q);
    const items: SavedProgressReport[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        studentId: String(data.studentId ?? studentId),
        studentName: String(data.studentName ?? 'عزيز'),
        selectedGrade: safeGrade(Number(data.selectedGrade)),
        schoolGovernorate: String(data.schoolGovernorate ?? 'تونس'),
        periodLabel: String(data.periodLabel ?? 'تقرير متابعة'),
        overallMasteryPercent: clampInt(Number(data.overallMasteryPercent), 0, 100),
        averageAccuracy: clampInt(Number(data.averageAccuracy), 0, 100),
        totalPoints: clampInt(Number(data.totalPoints), 0, 10000000),
        streakDays: clampInt(Number(data.streakDays), 0, 36500),
        completedLessonsCount: clampInt(Number(data.completedLessonsCount), 0, 500),
        totalLessonsCount: clampInt(Number(data.totalLessonsCount), 1, 500),
        earnedBadgesCount: clampInt(Number(data.earnedBadgesCount), 0, 50),
        mathMastery: clampInt(Number(data.mathMastery), 0, 100),
        scienceMastery: clampInt(Number(data.scienceMastery), 0, 100),
        arabicMastery: clampInt(Number(data.arabicMastery), 0, 100),
        frenchMastery: clampInt(Number(data.frenchMastery), 0, 100),
        socialMastery: clampInt(Number(data.socialMastery ?? 0), 0, 100),
        strengthsSummary: String(data.strengthsSummary ?? ''),
        recommendationsSummary: String(data.recommendationsSummary ?? ''),
        createdAtIso: timestampToIso(data.createdAt),
      };
    });
    items.sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
    reportsCache.set(cacheKey, { data: items, fetchedAt: Date.now() });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function upsertLeaderboardEntry(
  uid: string,
  studentId: string,
  progress: StudentProgress,
  challengeWins: number
): Promise<void> {
  const path = `leaderboard/${studentId}`;
  const ref = doc(db, 'leaderboard', studentId);
  const completedLessonsCount = clampInt(
    Object.keys(progress.completedLessons || {}).length,
    0,
    500
  );
  const grade = safeGrade(progress.selectedGrade);
  const mutableFields = {
    displayName: safeString(progress.studentName, 40, 'عزيز'),
    grade,
    governorate: safeGovernorate(progress.schoolGovernorate),
    points: clampInt(progress.points, 0, 10000000),
    completedLessonsCount,
    streakDays: clampInt(progress.streakDays, 0, 36500),
    challengeWins: clampInt(challengeWins, 0, 100000),
    equippedBadgeId: safeString(progress.equippedBadgeId, 60, ''),
    updatedAt: serverTimestamp(),
  };

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        ownerId: uid,
        studentId,
        ...mutableFields,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, mutableFields);
    }
    leaderboardCache.delete(grade);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchGradeLeaderboardOnce(
  grade: GradeLevel,
  forceRefresh = false
): Promise<LeaderboardEntry[]> {
  const sessionKey = `leaderboard_cache_g${grade}`;
  const memCached = leaderboardCache.get(grade);
  if (!forceRefresh && memCached && isFresh(memCached.fetchedAt)) {
    return memCached.data;
  }

  if (!forceRefresh) {
    try {
      const raw = sessionStorage.getItem(sessionKey);
      if (raw) {
        const parsed = JSON.parse(raw) as CacheBucket<LeaderboardEntry[]>;
        if (parsed && Array.isArray(parsed.data) && isFresh(parsed.fetchedAt)) {
          leaderboardCache.set(grade, parsed);
          return parsed.data;
        }
      }
    } catch {
      // ignore storage errors
    }
  }

  const path = 'leaderboard';
  try {
    const q = query(
      collection(db, 'leaderboard'),
      where('grade', '==', safeGrade(grade)),
      limit(25)
    );
    const snap = await getDocs(q);
    const entries: LeaderboardEntry[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ownerId: String(data.ownerId ?? ''),
        studentId: String(data.studentId ?? d.id),
        displayName: String(data.displayName ?? 'تلميذ'),
        grade: safeGrade(Number(data.grade)),
        governorate: String(data.governorate ?? 'تونس'),
        points: clampInt(Number(data.points), 0, 10000000),
        completedLessonsCount: clampInt(Number(data.completedLessonsCount), 0, 500),
        streakDays: clampInt(Number(data.streakDays), 0, 36500),
        challengeWins: clampInt(Number(data.challengeWins), 0, 100000),
        equippedBadgeId: typeof data.equippedBadgeId === 'string' ? data.equippedBadgeId : '',
        updatedAtIso: timestampToIso(data.updatedAt),
      };
    });

    entries.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.completedLessonsCount !== a.completedLessonsCount) {
        return b.completedLessonsCount - a.completedLessonsCount;
      }
      return b.challengeWins - a.challengeWins;
    });

    const bucket: CacheBucket<LeaderboardEntry[]> = {
      data: entries,
      fetchedAt: Date.now(),
    };
    leaderboardCache.set(grade, bucket);
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify(bucket));
    } catch {
      // ignore storage quota errors
    }
    return entries;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export interface CreatePeerChallengeInput {
  challengerStudentId: string;
  challengerName: string;
  opponentOwnerId: string;
  opponentStudentId: string;
  opponentName: string;
  grade: GradeLevel;
  challengerScore: number;
  opponentTargetScore: number;
  totalQuestions: number;
  challengerWon: boolean;
}

export async function recordPeerChallengeToCloud(
  uid: string,
  input: CreatePeerChallengeInput
): Promise<PeerChallengeRecord> {
  const challengeId = generateSafeId('chal');
  const path = `peerChallenges/${challengeId}`;
  const totalQuestions = clampInt(input.totalQuestions, 1, 20);
  const challengerScore = clampInt(input.challengerScore, 0, totalQuestions);
  const opponentTargetScore = clampInt(input.opponentTargetScore, 0, totalQuestions);

  const payload = {
    ownerId: uid,
    challengerStudentId: safeString(input.challengerStudentId, 64, 'stu_local'),
    challengerName: safeString(input.challengerName, 40, 'عزيز'),
    opponentOwnerId: safeString(input.opponentOwnerId, 128, uid),
    opponentStudentId: safeString(input.opponentStudentId, 64, 'stu_peer'),
    opponentName: safeString(input.opponentName, 40, 'زميل'),
    grade: safeGrade(input.grade),
    challengerScore,
    opponentTargetScore,
    totalQuestions,
    challengerWon: Boolean(input.challengerWon),
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'peerChallenges', challengeId), payload);
    peerChallengesCache.delete(uid);
    return {
      id: challengeId,
      ownerId: payload.ownerId,
      challengerStudentId: payload.challengerStudentId,
      challengerName: payload.challengerName,
      opponentOwnerId: payload.opponentOwnerId,
      opponentStudentId: payload.opponentStudentId,
      opponentName: payload.opponentName,
      grade: payload.grade,
      challengerScore: payload.challengerScore,
      opponentTargetScore: payload.opponentTargetScore,
      totalQuestions: payload.totalQuestions,
      challengerWon: payload.challengerWon,
      createdAtIso: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchPeerChallengesOnce(
  uid: string,
  forceRefresh = false
): Promise<PeerChallengeRecord[]> {
  const cached = peerChallengesCache.get(uid);
  if (!forceRefresh && cached && isFresh(cached.fetchedAt)) {
    return cached.data;
  }
  const path = 'peerChallenges';
  try {
    const q = query(
      collection(db, 'peerChallenges'),
      where('ownerId', '==', uid),
      limit(15)
    );
    const snap = await getDocs(q);
    const list: PeerChallengeRecord[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ownerId: String(data.ownerId ?? ''),
        challengerStudentId: String(data.challengerStudentId ?? ''),
        challengerName: String(data.challengerName ?? 'عزيز'),
        opponentOwnerId: String(data.opponentOwnerId ?? ''),
        opponentStudentId: String(data.opponentStudentId ?? ''),
        opponentName: String(data.opponentName ?? 'زميل'),
        grade: safeGrade(Number(data.grade)),
        challengerScore: clampInt(Number(data.challengerScore), 0, 20),
        opponentTargetScore: clampInt(Number(data.opponentTargetScore), 0, 20),
        totalQuestions: clampInt(Number(data.totalQuestions), 1, 20),
        challengerWon: Boolean(data.challengerWon),
        createdAtIso: timestampToIso(data.createdAt),
      };
    });
    list.sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
    peerChallengesCache.set(uid, { data: list, fetchedAt: Date.now() });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

const PARENT_PREF_DOC_ID = 'default';

const safeCadence = (val: unknown): ParentNotificationCadence => {
  if (val === 'weekly' || val === 'biweekly' || val === 'monthly' || val === 'disabled') {
    return val;
  }
  return 'weekly';
};

export async function fetchParentPreferencesOnce(
  uid: string
): Promise<ParentFollowUpPreferences | null> {
  const path = `users/${uid}/parentPreferences/${PARENT_PREF_DOC_ID}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'parentPreferences', PARENT_PREF_DOC_ID));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      parentEmail: safeString(typeof data.parentEmail === 'string' ? data.parentEmail : '', 120),
      cadence: safeCadence(data.cadence),
      notifyOnBadge: Boolean(data.notifyOnBadge),
      notifyOnInactivity: Boolean(data.notifyOnInactivity),
      includeSubjectDetails: Boolean(data.includeSubjectDetails),
      consentAccepted: Boolean(data.consentAccepted),
      consentUpdatedAtIso: safeString(
        typeof data.consentUpdatedAtIso === 'string' ? data.consentUpdatedAtIso : '',
        40
      ),
      lastDigestGeneratedIso: safeString(
        typeof data.lastDigestGeneratedIso === 'string' ? data.lastDigestGeneratedIso : '',
        40
      ),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveParentPreferencesToCloud(
  uid: string,
  prefs: ParentFollowUpPreferences
): Promise<void> {
  const path = `users/${uid}/parentPreferences/${PARENT_PREF_DOC_ID}`;
  const ref = doc(db, 'users', uid, 'parentPreferences', PARENT_PREF_DOC_ID);
  const mutableFields = {
    parentEmail: safeString(prefs.parentEmail, 120),
    cadence: safeCadence(prefs.cadence),
    notifyOnBadge: Boolean(prefs.notifyOnBadge),
    notifyOnInactivity: Boolean(prefs.notifyOnInactivity),
    includeSubjectDetails: Boolean(prefs.includeSubjectDetails),
    consentAccepted: Boolean(prefs.consentAccepted),
    consentUpdatedAtIso: safeString(prefs.consentUpdatedAtIso, 40),
    lastDigestGeneratedIso: safeString(prefs.lastDigestGeneratedIso, 40),
    updatedAt: serverTimestamp(),
  };

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        ownerId: uid,
        ...mutableFields,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, mutableFields);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteParentPreferencesInCloud(uid: string): Promise<void> {
  const path = `users/${uid}/parentPreferences/${PARENT_PREF_DOC_ID}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'parentPreferences', PARENT_PREF_DOC_ID));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function toSafeFavoriteWordId(word: string): string {
  const normalized = word.trim().toLowerCase();
  const asciiSlug = normalized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32);

  let hash = 2166136261;
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return `w_${asciiSlug || 'mot'}_${hex}`.slice(0, 64);
}

export async function fetchFavoriteWordsOnce(
  uid: string,
  studentId: string,
  forceRefresh = false
): Promise<FavoriteFrenchWord[]> {
  const cacheKey = `${uid}:${studentId}`;
  const cached = favoriteWordsCache.get(cacheKey);
  if (!forceRefresh && cached && isFresh(cached.fetchedAt)) {
    return cached.data;
  }
  const path = `users/${uid}/students/${studentId}/favoriteWords`;
  try {
    const q = query(
      collection(db, 'users', uid, 'students', studentId, 'favoriteWords'),
      where('ownerId', '==', uid),
      limit(250)
    );
    const snapshot = await getDocs(q);
    const items: FavoriteFrenchWord[] = snapshot.docs.map((d) => {
      const data = d.data();
      const word = safeString(typeof data.word === 'string' ? data.word : '', 60, 'mot');
      const letter = safeString(typeof data.letter === 'string' ? data.letter : '', 2, word.charAt(0).toUpperCase() || 'A');
      return {
        id: d.id,
        word,
        article: safeString(typeof data.article === 'string' ? data.article : '', 20) || undefined,
        arMeaning: safeString(typeof data.arMeaning === 'string' ? data.arMeaning : '', 120, 'كلمة'),
        letter,
        grade: safeGrade(Number(data.grade)),
        savedAtIso: safeString(typeof data.savedAtIso === 'string' ? data.savedAtIso : '', 40, new Date().toISOString()),
      };
    });
    items.sort((a, b) => a.word.localeCompare(b.word, 'fr', { sensitivity: 'base' }));
    favoriteWordsCache.set(cacheKey, { data: items, fetchedAt: Date.now() });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveFavoriteWordToCloud(
  uid: string,
  studentId: string,
  entry: FavoriteFrenchWord
): Promise<FavoriteFrenchWord> {
  const wordId = toSafeFavoriteWordId(entry.word);
  const path = `users/${uid}/students/${studentId}/favoriteWords/${wordId}`;
  const cleanWord = safeString(entry.word, 60, 'mot');
  const cleanArticle = safeString(entry.article, 20, '');
  const cleanMeaning = safeString(entry.arMeaning, 120, 'كلمة');
  const cleanLetter = safeString(entry.letter, 2, cleanWord.charAt(0).toUpperCase() || 'A');
  const cleanGrade = safeGrade(Number(entry.grade));
  const cleanSavedAt = safeString(entry.savedAtIso, 40, new Date().toISOString());

  try {
    await setDoc(doc(db, 'users', uid, 'students', studentId, 'favoriteWords', wordId), {
      ownerId: uid,
      studentId,
      word: cleanWord,
      article: cleanArticle,
      arMeaning: cleanMeaning,
      letter: cleanLetter,
      grade: cleanGrade,
      savedAtIso: cleanSavedAt,
      createdAt: serverTimestamp(),
    });
    favoriteWordsCache.delete(`${uid}:${studentId}`);
    return {
      id: wordId,
      word: cleanWord,
      article: cleanArticle || undefined,
      arMeaning: cleanMeaning,
      letter: cleanLetter,
      grade: cleanGrade,
      savedAtIso: cleanSavedAt,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function removeFavoriteWordInCloud(
  uid: string,
  studentId: string,
  wordId: string
): Promise<void> {
  const path = `users/${uid}/students/${studentId}/favoriteWords/${wordId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'students', studentId, 'favoriteWords', wordId));
    favoriteWordsCache.delete(`${uid}:${studentId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
