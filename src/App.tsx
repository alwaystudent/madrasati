import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Menu, Timer } from 'lucide-react';
import { SidebarNav, AppView } from './components/SidebarNav';
import { MainLandingPortal } from './components/MainLandingPortal';
import { LearningPathwayHome } from './components/LearningPathwayHome';
import { SubjectBrowser } from './components/SubjectBrowser';
import { LessonWorkspace } from './components/LessonWorkspace';
import { FrenchTrainingStudio } from './components/FrenchTrainingStudio';
import { PracticeBankView } from './components/PracticeBankView';
import { ExpressChallenge } from './components/ExpressChallenge';
import { LeaderboardView } from './components/LeaderboardView';
import { ProgressDashboard } from './components/ProgressDashboard';
import { ProgressReportView } from './components/ProgressReportView';
import { LegalPolicyView } from './components/LegalPolicyView';
import { RewardToast } from './components/RewardToast';
import { GRADES } from './data/tunisianCurriculum';
import { useStudentProgress } from './hooks/useStudentProgress';
import { Lesson } from './types/curriculum';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('home');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalLegalTab, setPortalLegalTab] = useState<'privacy' | 'terms' | null>(null);
  const [legalInitialTab, setLegalInitialTab] = useState<'privacy' | 'terms'>('privacy');
  const shouldReduceMotion = useReducedMotion();

  const {
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
  } = useStudentProgress();

  const activeGradeMeta =
    GRADES.find((g) => g.grade === progress.selectedGrade) ?? GRADES[2];

  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setActiveView('lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: AppView) => {
    setActiveView(view);
    if (view !== 'lesson') {
      setActiveLesson(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewTitleMap: Record<AppView, string> = {
    home: 'مسار التعلّم الشخصي',
    subjects: 'الدروس والمختبرات التفاعلية',
    french_studio: 'أكاديمية اللغة الفرنسية التفاعلية',
    practice: 'بنك التمارين والاختبارات 2026',
    express: 'تحدي 3 دقائق السريع',
    leaderboard: 'لوحة الصدارة وتحدّي الزملاء',
    progress: 'بطاقة التلميذ والأوسمة',
    reports: 'حفظ بيانات التلاميذ وتقارير التقدّم',
    legal: 'سياسة الخصوصية وشروط الاستخدام',
    lesson: activeLesson ? activeLesson.title : 'الدرس التفاعلي',
  };

  if (!progress.isProfileConfigured) {
    if (portalLegalTab) {
      return (
        <div className="min-h-screen bg-slate-50">
          <LegalPolicyView
            initialTab={portalLegalTab}
            onBack={() => setPortalLegalTab(null)}
          />
        </div>
      );
    }

    return (
      <MainLandingPortal
        initialName={progress.studentName}
        initialGrade={progress.selectedGrade}
        initialGovernorate={progress.schoolGovernorate}
        authUser={authUser}
        savedStudents={savedStudents}
        cloudSyncStatus={cloudSyncStatus}
        cloudError={cloudError}
        onSignInWithGoogle={signInWithGoogle}
        onSignOutCloud={signOutCloud}
        onSelectSavedStudent={async (sid) => {
          await selectSavedStudent(sid);
          setActiveView('home');
          setActiveLesson(null);
        }}
        onCreateNewStudent={async (name, grade, governorate) => {
          await createNewStudentProfile(name, grade, governorate);
          setActiveView('home');
          setActiveLesson(null);
        }}
        onCompleteDirectLogin={(name, grade, governorate) => {
          completeOnboarding(name, grade, governorate);
          setActiveView('home');
          setActiveLesson(null);
        }}
        onOpenLegal={(tab) => {
          setPortalLegalTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex text-slate-900 bg-slate-50/70">
      <SidebarNav
        activeView={activeView}
        onNavigate={handleNavigate}
        progress={progress}
        levelInfo={levelInfo}
        authUser={authUser}
        cloudSyncStatus={cloudSyncStatus}
        cloudError={cloudError}
        hasPendingSync={hasPendingSync}
        onFlushSyncNow={flushCloudSyncNow}
        onSignInWithGoogle={signInWithGoogle}
        onChangeStudent={() => reopenOnboarding()}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Contextual Workspace Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="فتح القائمة الجانبية"
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
              <span className="font-semibold text-sky-700 shrink-0">
                {activeGradeMeta.shortLabel}
              </span>
              <span className="text-slate-300" aria-hidden="true">
                /
              </span>
              <span className="font-display font-bold text-slate-900 truncate">
                {viewTitleMap[activeView]}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleNavigate('express')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Timer className="w-3.5 h-3.5" aria-hidden="true" />
            ابدأ تحدي اليوم
          </button>
        </header>

        <main className="flex-1">
          <motion.div
            key={activeView === 'lesson' ? `lesson-${activeLesson?.id}` : activeView}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeView === 'home' && (
              <LearningPathwayHome
                progress={progress}
                studentLessons={studentLessons}
                completedCount={completedCount}
                totalLessons={totalLessons}
                earnedBadgesCount={earnedBadges.length}
                levelInfo={levelInfo}
                showReturnReminder={showReturnReminder}
                daysAbsent={daysAbsent}
                subjectStats={subjectStats}
                onClaimReturnAndExpress={() => {
                  claimReturnBonus();
                  handleNavigate('express');
                }}
                onClaimReturnAndSubjects={() => {
                  claimReturnBonus();
                  handleNavigate('subjects');
                }}
                onDismissReturnReminder={dismissReturnReminder}
                onSelectLesson={handleSelectLesson}
                onOpenPractice={() => handleNavigate('practice')}
                onOpenProgress={() => handleNavigate('progress')}
                onOpenFrenchStudio={() => handleNavigate('french_studio')}
                onOpenReports={() => handleNavigate('reports')}
              />
            )}

            {activeView === 'subjects' && (
              <SubjectBrowser
                progress={progress}
                studentLessons={studentLessons}
                onSelectLesson={handleSelectLesson}
              />
            )}

            {activeView === 'french_studio' && (
              <FrenchTrainingStudio
                selectedGrade={progress.selectedGrade}
                studentName={progress.studentName}
                onRecordFrenchTraining={(title, score, total, points) =>
                  recordLessonResult(
                    `french-studio-g${progress.selectedGrade}`,
                    title,
                    'french',
                    progress.selectedGrade,
                    score,
                    total,
                    points,
                    'french'
                  )
                }
              />
            )}

            {activeView === 'practice' && (
              <PracticeBankView
                selectedGrade={progress.selectedGrade}
                studentLessons={studentLessons}
                onRecordPracticeResult={(title, subjectId, score, total, points, mode) =>
                  recordLessonResult(
                    `practice-${progress.selectedGrade}-${subjectId}`,
                    title,
                    subjectId,
                    progress.selectedGrade,
                    score,
                    total,
                    points,
                    mode
                  )
                }
              />
            )}

            {activeView === 'lesson' && activeLesson && (
              <LessonWorkspace
                lesson={activeLesson}
                studentName={progress.studentName}
                completedStepIndices={progress.completedSteps[activeLesson.id] || []}
                onStepComplete={markStepCompleted}
                onLessonComplete={(score, total, points) =>
                  recordLessonResult(
                    activeLesson.id,
                    activeLesson.title,
                    activeLesson.subjectId,
                    activeLesson.grade,
                    score,
                    total,
                    points,
                    'lesson'
                  )
                }
                onExit={() => handleNavigate('subjects')}
              />
            )}

            {activeView === 'express' && (
              <ExpressChallenge
                studentName={progress.studentName}
                selectedGrade={progress.selectedGrade}
                studentLessons={studentLessons}
                onComplete={(score, total, points) =>
                  recordLessonResult(
                    `express-challenge-g${progress.selectedGrade}`,
                    `تحدي 3 دقائق الشامل (${activeGradeMeta.shortLabel})`,
                    'math',
                    progress.selectedGrade,
                    score,
                    total,
                    points,
                    'express'
                  )
                }
                onExit={() => handleNavigate('home')}
              />
            )}

            {activeView === 'leaderboard' && (
              <LeaderboardView
                progress={progress}
                studentLessons={studentLessons}
                authUser={authUser}
                activeStudentId={activeStudentId}
                leaderboardEntries={leaderboardEntries}
                peerChallenges={peerChallenges}
                leaderboardLoading={leaderboardLoading}
                hasPendingSync={hasPendingSync}
                cloudError={cloudError}
                onRefreshLeaderboard={refreshLeaderboard}
                onSubmitChallengeResult={submitPeerChallengeResult}
                onSignInWithGoogle={signInWithGoogle}
                onFlushSyncNow={flushCloudSyncNow}
              />
            )}

            {activeView === 'progress' && (
              <ProgressDashboard
                progress={progress}
                studentLessons={studentLessons}
                completedCount={completedCount}
                totalLessons={totalLessons}
                overallMasteryPercent={overallMasteryPercent}
                subjectStats={subjectStats}
                earnedBadges={earnedBadges}
                levelInfo={levelInfo}
                onEquipBadge={equipBadge}
                onUpdateProfile={updateStudentProfile}
                onResetProgress={resetProgress}
                onSimulateAbsence={() => {
                  simulateAbsence(3);
                  handleNavigate('home');
                }}
                onSelectLesson={handleSelectLesson}
                onOpenReports={() => handleNavigate('reports')}
              />
            )}

            {activeView === 'reports' && (
              <ProgressReportView
                progress={progress}
                studentLessons={studentLessons}
                completedCount={completedCount}
                totalLessons={totalLessons}
                overallMasteryPercent={overallMasteryPercent}
                subjectStats={subjectStats}
                earnedBadgesCount={earnedBadges.length}
                levelInfo={levelInfo}
                authUser={authUser}
                savedStudents={savedStudents}
                activeStudentId={activeStudentId}
                savedReports={savedReports}
                cloudSyncStatus={cloudSyncStatus}
                cloudError={cloudError}
                hasPendingSync={hasPendingSync}
                onFlushSyncNow={flushCloudSyncNow}
                onSignInWithGoogle={signInWithGoogle}
                onSignOutCloud={signOutCloud}
                onSelectSavedStudent={selectSavedStudent}
                onCreateNewStudent={createNewStudentProfile}
                onDeleteSavedStudent={deleteSavedStudent}
                onSaveProgressReport={saveProgressReportSnapshot}
                onDeleteProgressReport={removeProgressReportSnapshot}
                onSelectLesson={handleSelectLesson}
              />
            )}

            {activeView === 'legal' && (
              <LegalPolicyView
                initialTab={legalInitialTab}
                onBack={() => handleNavigate('home')}
              />
            )}
          </motion.div>
        </main>

        <footer className="mt-10 border-t border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              منارة التعلّم — منصة تفاعلية وفق برنامج التعليم الابتدائي بالجمهورية التونسية 2026 ({activeGradeMeta.label})
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => handleNavigate('subjects')}
                className="hover:text-slate-900 cursor-pointer"
              >
                الدروس
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('leaderboard')}
                className="hover:text-slate-900 cursor-pointer"
              >
                لوحة الصدارة
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('reports')}
                className="hover:text-slate-900 cursor-pointer"
              >
                تقارير التقدّم
              </button>
              <button
                type="button"
                onClick={() => {
                  setLegalInitialTab('privacy');
                  handleNavigate('legal');
                }}
                className="hover:text-slate-900 cursor-pointer"
              >
                الخصوصية
              </button>
              <button
                type="button"
                onClick={() => {
                  setLegalInitialTab('terms');
                  handleNavigate('legal');
                }}
                className="hover:text-slate-900 cursor-pointer"
              >
                شروط الاستخدام
              </button>
            </div>
          </div>
        </footer>
      </div>

      <RewardToast
        notification={rewardNotification}
        onDismiss={dismissRewardNotification}
        onViewBadges={() => handleNavigate('progress')}
      />
    </div>
  );
}
