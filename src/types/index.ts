export type TabId = "home" | "learn" | "assessment" | "stats" | "artifacts";

export type ActiveView =
  | TabId
  | "profile"
  | "quiz"
  | "results"
  | "weekend-receipt"
  | "mistakes"
  | "roadmap"
  | "preparation"
  | "agenda"
  | "kraepelin";

export type ThemeMode = "light" | "dark";

export type QuizFontSize = "sm" | "md" | "lg";

export type PrototypeCardVariant = "c-red" | "c-navy" | "c-pearl" | "c-milk" | "sf";

export type CareerGoal =
  | "CPNS"
  | "BUMN"
  | "Bank Indonesia"
  | "PPPK"
  | "Kedinasan"
  | "Beasiswa LPDP"
  | string;

export interface ExamPlan {
  examDate: string;
  examStartDate: string;
  dailyMinutesGoal: number;
  weeklyGoal: number;
  reminderTime: string; // HH:MM
  reminderEnabled: boolean;
}

export interface DailyTodo {
  id: string;
  label: string;
  meta: string;
  done: boolean;
  actionTab?: TabId;
  actionTopic?: string;
}

export interface ProfileRecord {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  avatar?: string;
  careerGoal: CareerGoal;
  target_accuracy: number;
  tier: string;
  is_premium: boolean;
  premium_expiry_date: string | null;
  education?: string;
  institution?: string;
  major?: string;
  bio?: string;
}

export interface AttemptRecord {
  id: string;
  user_id?: string;
  created_at: string;
  attempt_type: "exercise" | "assessment" | string;
  subject_category: string;
  score: number;
  total_questions: number;
  correct_answers_count: number;
  time_taken_seconds: number | null;
}

export interface OfflinePackMeta {
  downloadedAt: string;
  questionCount: number;
  topicCount: number;
  approxBytes: number;
}

export interface PendingOfflineAttempt {
  localAttemptId: string;
  userId: string;
  attempt: AttemptRecord;
  answers: { question_id: string; user_answer: string | null; is_correct: boolean }[];
}

export type WeekendTrack = "CPNS" | "BUMN" | "Bank Indonesia" | "Beasiswa LPDP";
export type StudyTrack = WeekendTrack | "PPPK" | "Kedinasan";
export type CpnsQuotaTrack = "umum" | "cumlaude_diaspora" | "disabilitas_papua";
export type SkillId = "verbal" | "numeracy" | "patterns";
export type StudySession =
  | { track: StudyTrack; kind: "diagnostic" | "tryout" }
  | { track: StudyTrack; kind: "focus"; planDate: string; day: number }
  | { track: StudyTrack; kind: "skill"; skill: SkillId };

export interface WeekendTryoutEvent {
  id: string;
  week_key: string;
  track: WeekendTrack;
  title: string;
  question_ids: string[];
  time_limit_minutes: number;
  starts_at: string;
  ends_at: string;
  results_publish_at: string;
}

export interface WeekendPercentile {
  participant_count: number | null;
  my_rank: number | null;
  my_percentile_top_pct: number | null;
  avg_score: number | null;
  my_score: number | null;
  my_official_points: number | null;
  my_passed_pg: boolean | null;
  results_published: boolean;
}

export type WeekendSubmissionStatus = "saving" | "submitted" | "unavailable" | "retry";

export interface QuestionOption {
  id: string;
  text: string;
}

export type QuestionVisual =
  | { kind: "algebra"; symbols: ("circle" | "triangle" | "square")[]; equations: { terms: number[]; result: number }[]; query: number[] }
  | { kind: "schedule"; slots: string[]; rows: { label: string; free: boolean[] }[] }
  | { kind: "table"; caption: string; headings: string[]; rows: (string | number)[][] }
  | { kind: "bars"; caption: string; unit: string; entries: { label: string; value: number }[] };

export interface QuestionItem {
  id: string;
  question: string;
  imageUrl?: string;
  options: QuestionOption[];
  sourceOptionOrder?: string[];
  correct: string;
  discussion?: string;
  explanationUrl?: string;
  type: string;
  benchmarkPartnerId?: string;
  category?: string;
  question_format?: string;
  scores?: Record<string, number>;
  matrixData?: (number | string)[][];
  visual?: QuestionVisual;
  digitSymbolData?: {
    symbolMap: Record<string, string>;
    testSequence: string[];
  };
}

export interface QuizSessionConfig {
  category: string;
  title?: string;
  totalQuestions: number;
  timeLimit: number; // minutes, 0 = untimed
  source: "exercise" | "assessment";
  assessmentCategories?: string[];
  categoryQuotas?: Record<string, number>;
  customQuestions?: QuestionItem[];
  isMistakeDrill?: boolean;
  isDailySprint?: boolean;
  fromOfflinePack?: boolean;
  allowOfflinePack?: boolean;
  weekendEventId?: string;
  weekendTrack?: WeekendTrack;
  studySession?: StudySession;
  requireFreshQuestions?: boolean;
  sessionMode?: "custom" | "simulation";
  benchmarkIds?: Record<string, string[]>;
  excludeQuestionIds?: string[];
  weekendDeadline?: string;
  initialAnswers?: Record<string, string>;
  cpnsQuotaTrack?: CpnsQuotaTrack;
  cpnsSensoryNetra?: boolean;
}

export interface CategoryBreakdownItem {
  type: string;
  correct: number;
  total: number;
  score: number;
  maxScore: number;
  percentage: number;
  avgSeconds?: number;
}

export interface OfficialSubtestScore {
  label: string;
  points: number;
  maxPoints: number;
  passingPoints: number;
  passed: boolean;
  delta: number;
  questionCount: number;
}

export interface OfficialScoreSummary {
  examLabel: string;
  totalPoints: number;
  maxPoints: number;
  passed: boolean;
  scaleNote: string;
  subtests: OfficialSubtestScore[];
  tierBenchmarks?: Array<{
    label: string;
    minPoints: number;
    reached: boolean;
  }>;
}

export interface QuizResultPayload {
  score: number;
  rawPoints: number;
  maxPoints: number;
  isSJT: boolean;
  questions: QuestionItem[];
  userAnswers: (string | null)[];
  flaggedIndices: number[];
  timeTaken: number;
  totalTime: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  source: "exercise" | "assessment";
  quizName: string;
  categoryBreakdown: CategoryBreakdownItem[];
  isMistakeDrill?: boolean;
  isDailySprint?: boolean;
  graduatedCount?: number;
  questionDurationsSec?: number[];
  targetSecondsPerQuestion?: number;
  focusTopic?: string;
  officialSummary?: OfficialScoreSummary;
  weekendEventId?: string;
  weekendTrack?: WeekendTrack;
  studySession?: StudySession;
  sessionMode?: QuizSessionConfig["sessionMode"];
  cpnsQuotaTrack?: CpnsQuotaTrack;
  cpnsSensoryNetra?: boolean;
}

export type MistakeFailureReason = "wrong" | "skipped" | "suboptimal_sjt";

export interface SavedQuestionEntry {
  id: string;
  question: QuestionItem;
  isMistake: boolean;
  isBookmarked: boolean;
  lastUserAnswer: string | null;
  failureReason?: MistakeFailureReason;
  wrongCount: number;
  updatedAt: string;
  userNote?: string;
  srsStage?: 0 | 1 | 2 | 3;
  nextReviewAt?: string;
  lastReviewedAt?: string;
}

export type ExerciseDomainKey =
  | "LPDP_Scholastic"
  | "Cognitive_Aptitude"
  | "English_Proficiency"
  | "Business_Economics"
  | "Civic_Knowledge"
  | "Banking_Monetary"
  | "Psychometric"
  | "General_Knowledge";

export interface ExerciseTopic {
  type: string;
  title: string;
  desc: string;
  level: "Dasar" | "Menengah" | "Lanjut";
  defaultQuestions: number;
  defaultMinutes: number;
}

export interface ExerciseDomain {
  key: ExerciseDomainKey;
  label: string;
  shortLabel: string;
  topics: ExerciseTopic[];
}

export type AssessmentCategoryKey =
  | "LPDP_Scholastic"
  | "Government_BUMN"
  | "Bank_Indonesia"
  | "Cognitive_Screening"
  | "Comprehensive_Aptitude"
  | "English_Proficiency"
  | "Domain_Expertise"
  | "Psychometric_Behavioral"
  | "Applied_Reasoning"
  | "Premium_Comprehensive";

export interface AssessmentBattery {
  type: string;
  title: string;
  desc: string;
  defaultQuestions: number;
  defaultMinutes: number;
  exerciseCategories: string[];
  categoryQuotas?: Record<string, number>;
  passingScore?: number;
}

export interface AssessmentCategory {
  key: AssessmentCategoryKey;
  label: string;
  shortLabel: string;
  description: string;
  batteries: AssessmentBattery[];
}

export type ArtifactDepth = "ringan" | "analitis" | "reflektif" | string;

export type ContentBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; caption: string }
  | { type: "quote"; text: string; author: string }
  | { type: "list"; items: string[] }
  | { type: "formula"; latex: string };

export interface ArtifactItem {
  id: string | number;
  title: string;
  summary: string;
  image?: string;
  categories: string[];
  readTime: number;
  depth: ArtifactDepth;
  contentBlocks: ContentBlock[];
}

export interface SubscriptionPlanOption {
  id: "karirfy_pro_monthly" | "karirfy_pro_yearly" | "karirfy_pro_lifetime";
  title: string;
  subtitle: string;
  priceFallback: string;
  badge?: string;
  mappedTier: "Pro";
  isLifetime: boolean;
}

export type RoadmapModuleKind = "exercise" | "assessment" | "artifact";

export type RoadmapModuleStatus = "mastered" | "reinforce" | "pending";

export interface RoadmapModuleBlueprint {
  id: string;
  kind: RoadmapModuleKind;
  title: string;
  subtitle: string;
  targetCategory: string;
  matchAliases?: string[];
  artifactId?: string | number;
  defaultQuestions?: number;
  defaultMinutes?: number;
  assessmentCategories?: string[];
  categoryQuotas?: Record<string, number>;
  minAccuracy?: number;
}

export interface RoadmapPhaseBlueprint {
  phaseNumber: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  modules: RoadmapModuleBlueprint[];
}

export interface CareerRoadmapBlueprint {
  trackKey: string;
  trackTitle: string;
  trackSubtitle: string;
  phases: RoadmapPhaseBlueprint[];
}

export interface EvaluatedRoadmapModule extends RoadmapModuleBlueprint {
  phaseNumber: 1 | 2 | 3 | 4;
  status: RoadmapModuleStatus;
  attemptsCount: number;
  bestScore: number | null;
  latestScore: number | null;
  requiredAccuracy: number;
  isNextRecommended: boolean;
  isDiagnosticPriority?: boolean;
}

export interface EvaluatedRoadmapPhase {
  phaseNumber: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  modules: EvaluatedRoadmapModule[];
  masteredCount: number;
  totalCount: number;
  progressPct: number;
  isCurrentPhase: boolean;
}

export interface EvaluatedCurriculumRoadmap {
  careerGoal: string;
  trackTitle: string;
  trackSubtitle: string;
  phases: EvaluatedRoadmapPhase[];
  allModules: EvaluatedRoadmapModule[];
  nextModule: EvaluatedRoadmapModule;
  masteredModulesCount: number;
  reinforceModulesCount: number;
  totalModulesCount: number;
  overallProgressPct: number;
  activePhaseNumber: 1 | 2 | 3 | 4;
}

export type DailyMissionKind =
  | "roadmap_module"
  | "artifact_read"
  | "mistake_review";

export interface DailyProgressState {
  artifactReadToday: boolean;
  mistakeEvaluatedToday: boolean;
  manualDoneIds: string[];
}

export interface SmartDailyMission {
  id: "m1_focus" | "m2_artifact" | "m3_eval";
  kind: DailyMissionKind;
  label: string;
  meta: string;
  done: boolean;
  ctaLabel: string;
  roadmapModule?: EvaluatedRoadmapModule;
  artifactId?: string | number;
}
