export type GradeLevel = 3 | 4 | 5 | 6;

export type SubjectId = 'math' | 'science' | 'arabic' | 'french' | 'social';

export type SimulationType =
  | 'fractions'
  | 'geometry'
  | 'circuit'
  | 'photosynthesis'
  | 'heart'
  | 'sentence'
  | 'hamza'
  | 'french_verbs'
  | 'place_value'
  | 'states_of_matter'
  | 'word_types'
  | 'french_articles'
  | 'percent_ratio'
  | 'social_heritage';

export interface GradeMeta {
  grade: GradeLevel;
  label: string;
  shortLabel: string;
  subtitle: string;
}

export interface SubjectMeta {
  id: SubjectId;
  name: string;
  frenchName: string;
  description: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  barColor: string;
}

export interface DiscoveryStep {
  title: string;
  instruction: string;
  takeaway: string;
}

export interface ChoiceExercise {
  id: string;
  type: 'choice';
  prompt: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
  ltr?: boolean;
}

export interface OrderExercise {
  id: string;
  type: 'order';
  prompt: string;
  tokens: string[];
  correctOrder: string[];
  hint: string;
  explanation: string;
  ltr?: boolean;
}

export interface ClassifyItem {
  id: string;
  label: string;
  targetBin: 'A' | 'B';
}

export interface ClassifyExercise {
  id: string;
  type: 'classify';
  prompt: string;
  binALabel: string;
  binBLabel: string;
  items: ClassifyItem[];
  hint: string;
  explanation: string;
  ltr?: boolean;
}

export interface FillBlankExercise {
  id: string;
  type: 'fill_blank';
  prompt: string;
  beforeBlank: string;
  afterBlank: string;
  choices: string[];
  correctChoice: string;
  hint: string;
  explanation: string;
  ltr?: boolean;
}

export type Exercise =
  | ChoiceExercise
  | OrderExercise
  | ClassifyExercise
  | FillBlankExercise;

export interface FrenchPhrase {
  fr: string;
  ar: string;
  phoneticHint?: string;
}

export interface Lesson {
  id: string;
  grade: GradeLevel;
  subjectId: SubjectId;
  title: string;
  subtitle: string;
  trimester: 'الثلاثي الأول' | 'الثلاثي الثاني' | 'الثلاثي الثالث';
  durationMinutes: number;
  simType: SimulationType;
  simTitle: string;
  simDescription: string;
  steps: DiscoveryStep[];
  exercises: Exercise[];
  frenchPhrases?: FrenchPhrase[];
  supportTip?: string;
  easyTrack?: boolean;
}

export interface LessonCompletion {
  bestScore: number;
  totalQuestions: number;
  attempts: number;
  lastCompletedAt: string;
}

export interface ActivityEntry {
  id: string;
  lessonId: string;
  grade: GradeLevel;
  title: string;
  subjectId: SubjectId;
  score: number;
  total: number;
  pointsEarned: number;
  date: string;
  mode: 'lesson' | 'express' | 'exam' | 'french';
}

export type TrimesterType = 'الثلاثي الأول' | 'الثلاثي الثاني' | 'الثلاثي الثالث';

export interface FrenchVocabCard {
  id: string;
  trimester?: TrimesterType;
  theme: string;
  frWord: string;
  article?: string;
  arMeaning: string;
  phonetic: string;
  exampleFr: string;
  exampleAr: string;
}

export interface FrenchListeningItem {
  id: string;
  trimester?: TrimesterType;
  promptAr: string;
  audioFr: string;
  options: string[];
  correctIndex: number;
  explanationAr: string;
}

export interface FrenchReadingMiniText {
  id: string;
  titleFr: string;
  titleAr: string;
  trimester: string;
  paragraphsFr: string[];
  translationAr: string;
  questions: ChoiceExercise[];
}

export interface GradeFrenchTrainingProgram {
  grade: GradeLevel;
  levelBadge: string;
  focusSummary: string;
  vocabCards: FrenchVocabCard[];
  listeningItems: FrenchListeningItem[];
  grammarExercises: (Exercise & { trimester?: TrimesterType })[];
  readingPassages: FrenchReadingMiniText[];
}

export interface ComprehensiveExamPreset {
  id: string;
  grade: GradeLevel;
  title: string;
  trimester: 'الثلاثي الأول' | 'الثلاثي الثاني' | 'الثلاثي الثالث' | 'شامل';
  description: string;
  durationMinutes: number;
  bonusPoints: number;
  exercises: Exercise[];
}

export type BadgeIconKind =
  | 'launch'
  | 'perfect'
  | 'lightning'
  | 'science'
  | 'math'
  | 'bilingual'
  | 'treasure'
  | 'beacon';

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  requirementText: string;
  bonusPoints: number;
  icon: BadgeIconKind;
  theme: 'sky' | 'amber' | 'emerald' | 'indigo' | 'rose';
}

export interface LevelInfo {
  level: number;
  title: string;
  minPoints: number;
  nextMinPoints: number | null;
}

export interface RewardNotification {
  id: string;
  pointsEarned: number;
  reason: string;
  unlockedBadges: BadgeDefinition[];
}

export interface StudentProgress {
  studentName: string;
  selectedGrade: GradeLevel;
  schoolGovernorate: string;
  isProfileConfigured: boolean;
  points: number;
  streakDays: number;
  lastActiveDate: string;
  completedLessons: Record<string, LessonCompletion>;
  completedSteps: Record<string, number[]>;
  unlockedBadges: Record<string, string>;
  equippedBadgeId: string | null;
  expressChallengesCompleted: number;
  challengeWins?: number;
  activityLog: ActivityEntry[];
}

export type CloudSyncStatus = 'local' | 'syncing' | 'synced' | 'error';

export interface SavedStudentRecord {
  id: string;
  studentName: string;
  selectedGrade: GradeLevel;
  schoolGovernorate: string;
  points: number;
  streakDays: number;
  lastActiveDate: string;
  completedLessons: Record<string, LessonCompletion>;
  completedSteps: Record<string, number[]>;
  unlockedBadges: Record<string, string>;
  equippedBadgeId: string | null;
  expressChallengesCompleted: number;
  challengeWins?: number;
  updatedAtIso?: string;
}

export interface LeaderboardEntry {
  id: string;
  ownerId: string;
  studentId: string;
  displayName: string;
  grade: GradeLevel;
  governorate: string;
  points: number;
  completedLessonsCount: number;
  streakDays: number;
  challengeWins: number;
  equippedBadgeId: string;
  updatedAtIso?: string;
}

export interface PeerChallengeRecord {
  id: string;
  ownerId: string;
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
  createdAtIso: string;
}

export interface SavedProgressReport {
  id: string;
  studentId: string;
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
  createdAtIso: string;
}

export type ParentNotificationCadence = 'weekly' | 'biweekly' | 'monthly' | 'disabled';

export interface ParentFollowUpPreferences {
  parentEmail: string;
  cadence: ParentNotificationCadence;
  notifyOnBadge: boolean;
  notifyOnInactivity: boolean;
  includeSubjectDetails: boolean;
  consentAccepted: boolean;
  consentUpdatedAtIso: string;
  lastDigestGeneratedIso: string;
}

export interface FavoriteFrenchWord {
  id: string;
  word: string;
  article?: string;
  arMeaning: string;
  letter: string;
  grade: GradeLevel;
  savedAtIso: string;
}
