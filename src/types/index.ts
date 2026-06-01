// ─── Auth ────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

// ─── Jobs ────────────────────────────────────────
export type JobStatus = 'applied' | 'interview' | 'offer' | 'rejected';

export interface Job {
  id: string;
  user_id: string;
  company: string;
  role: string;
  location: string;
  job_url?: string;
  status: JobStatus;
  salary_min?: number;
  salary_max?: number;
  ai_match_score?: number;   // 0-100, set by Claude API later
  notes?: string;
  applied_at: string;
  updated_at: string;
}

// ─── Auth Context ─────────────────────────────────
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// ─── AI Analysis ─────────────────────────────────
export interface RewrittenBullet {
  original: string;
  rewritten: string;
  section: string;
}

export interface AnalysisResult {
  matchScore: number;
  matchSummary: string;
  keywordsFound: string[];
  keywordsMissing: string[];
  rewrittenBullets: RewrittenBullet[];
  actionPlan: string[];
}

export interface AnalysePayload {
  resumeText: string;
  jobDescription: string;
}

// ─── Interview ────────────────────────────────────
export interface ScoreCard {
  communication: number;
  technicalDepth: number;
  starFormat: number;
  confidence: number;
  overall: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

// Web Speech API types (not in default TS lib)
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend:   (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare var SpeechRecognition: new () => SpeechRecognition;

interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}

// ─── Analytics ───────────────────────────────────
export interface WeeklyData {
  week: string;
  applications: number;
  responses: number;
  interviews: number;
}

export interface FunnelData {
  stage: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AnalyticsStats {
  totalApplications: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  avgMatchScore: number;
  avgDaysToResponse: number;
}