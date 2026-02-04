export type QuestionType = "single-choice" | "multiple-choice" | "scale" | "text";
export type SurveyType = "quick" | "comprehensive";

export interface QuestionOption {
  id: string;
  label: string;
  labelKey?: string; // Translation key for i18n
  value: number | string;
}

export interface Question {
  id: string;
  category: "phq9" | "gad7" | "pss" | "burnout" | "open";
  text: string;
  textKey?: string; // Translation key for i18n
  type: QuestionType;
  options?: QuestionOption[];
  required: boolean;
  placeholder?: string;
  placeholderKey?: string; // Translation key for i18n
  inverted?: boolean; // Для инвертированных вопросов в PSS-10
}

export interface Answer {
  questionId: string;
  value: number | string | string[];
}

export interface SurveyProgress {
  surveyId: string;
  currentQuestionIndex: number;
  answers: Answer[];
  startedAt: Date;
  lastUpdatedAt: Date;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  type: SurveyType;
  questions: Question[];
  estimatedMinutes: number;
  totalQuestions: number;
}

export interface SurveyResponse {
  id: string;
  studentId: string;
  surveyId: string;
  surveyType: SurveyType;
  answers: Answer[];
  completedAt: Date;
  aiAnalysis?: AnalysisResult;
}

export interface ScaleResult {
  score: number;
  maxScore: number;
  severity: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
}

export interface AnalysisResult {
  id: string;
  responseId: string;
  phq9: ScaleResult;
  gad7: ScaleResult;
  pss10?: ScaleResult;
  burnout?: ScaleResult;
  overallRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  keyThemes: string[];
  recommendations: string[];
  createdAt: Date;
}
