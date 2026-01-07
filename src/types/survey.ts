export type QuestionType = "single-choice" | "multiple-choice" | "scale" | "text";
export type SurveyType = "quick" | "comprehensive";

export interface QuestionOption {
  id: string;
  label: string;
  value: number | string;
}

export interface Question {
  id: string;
  category: "phq9" | "gad7" | "burnout" | "social_media" | "exam_stress" | "career" | "family" | "open";
  text: string;
  type: QuestionType;
  options?: QuestionOption[];
  required: boolean;
  placeholder?: string;
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
  studentId: number;
  surveyId: string;
  surveyType: SurveyType;
  answers: Answer[];
  completedAt: Date;
  aiAnalysis?: AnalysisResult;
}

export interface AnalysisResult {
  id: string;
  responseId: string;
  depression: {
    phq9Score: number;
    severity: "minimal" | "mild" | "moderate" | "moderately-severe" | "severe";
    confidence: number;
  };
  anxiety: {
    gad7Score: number;
    severity: "minimal" | "mild" | "moderate" | "severe";
    confidence: number;
  };
  burnout: {
    score: number;
    level: "low" | "moderate" | "high" | "critical";
  };
  socialMedia: {
    dependencyScore: number;
    fomoScore: number;
    hoursPerDay: number;
  };
  overallRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  keyThemes: string[];
  recommendations: string[];
  createdAt: Date;
}
