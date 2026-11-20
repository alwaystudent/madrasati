import { useCallback, useEffect, useState } from 'react';
import { BADGES, LESSONS, LEVELS } from '../data/tunisianCurriculum';
import {
  ActivityEntry,
  BadgeDefinition,
  GradeLevel,
  LevelInfo,
  RewardNotification,
  StudentProgress,
  SubjectId,
} from '../types/curriculum';

const STORAGE_KEY = 'manarat_khamisa_progress_v3';

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
    isProfileConfigured:
      typeof raw.isProfileConfigured === 'boolean' ? raw.isProfileConfigured : false,
    activityLog,
  };
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

  const [rewardNotification, setRewardNotification] =
    useState<RewardNotification | null>(null);
  const [reminderDismissed, setReminderDismissed] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  const completeOnboarding = useCallback(
    (studentName: string, selectedGrade: GradeLevel, schoolGovernorate: string) => {
      setProgress((prev) => ({
        ...prev,
        studentName: studentName.trim() || 'عزيز',
        selectedGrade,
        schoolGovernorate: schoolGovernorate.trim() || prev.schoolGovernorate,
        isProfileConfigured: true,
      }));
    },
    []
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
      return nextState;
    });
    setReminderDismissed(true);
  }, []);

  const simulateAbsence = useCallback((daysAgo: number) => {
    setProgress((prev) => ({
      ...prev,
      lastActiveDate: getDaysAgoKey(daysAgo),
    }));
    setReminderDismissed(false);
  }, []);

  const markStepCompleted = useCallback((lessonId: string, stepIndex: number) => {
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

      return nextState;
    });
  }, []);

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
          activityLog: [newEntry, ...prev.activityLog].slice(0, 25),
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

        return nextState;
      });
    },
    []
  );

  const equipBadge = useCallback((badgeId: string) => {
    setProgress((prev) => {
      if (!prev.unlockedBadges[badgeId]) return prev;
      return {
        ...prev,
        equippedBadgeId: badgeId,
      };
    });
  }, []);

  const updateStudentProfile = useCallback(
    (studentName: string, schoolGovernorate: string, selectedGrade?: GradeLevel) => {
      setProgress((prev) => ({
        ...prev,
        studentName: studentName.trim() || prev.studentName,
        schoolGovernorate: schoolGovernorate.trim() || prev.schoolGovernorate,
        selectedGrade: selectedGrade ?? prev.selectedGrade,
        isProfileConfigured: true,
      }));
    },
    []
  );

  const resetProgress = useCallback(() => {
    setProgress((prev) => ({
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
      activityLog: [],
    }));
    setRewardNotification(null);
    setReminderDismissed(true);
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
