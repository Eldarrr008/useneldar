import { Answer } from "@/types/survey";

/**
 * Подсчёт PHQ-9 score (0-27)
 * PHQ-9: Patient Health Questionnaire-9
 * Оценка симптомов депрессии
 */
export function calculatePHQ9Score(answers: Answer[]): number {
  const phq9Answers = answers.filter((a) => a.questionId.startsWith("phq9_"));
  
  const score = phq9Answers.reduce((total, answer) => {
    const value = typeof answer.value === "number" ? answer.value : 0;
    return total + value;
  }, 0);

  return Math.min(score, 27); // Max 27
}

/**
 * Интерпретация PHQ-9 severity
 */
export function interpretPHQ9(score: number): {
  severity: "minimal" | "mild" | "moderate" | "moderately-severe" | "severe";
  description: string;
} {
  if (score >= 20) {
    return {
      severity: "severe",
      description: "Тяжёлая депрессия — требуется немедленная помощь специалиста",
    };
  } else if (score >= 15) {
    return {
      severity: "moderately-severe",
      description: "Умеренно-тяжёлая депрессия — рекомендуется консультация психолога",
    };
  } else if (score >= 10) {
    return {
      severity: "moderate",
      description: "Умеренная депрессия — стоит обратиться к специалисту",
    };
  } else if (score >= 5) {
    return {
      severity: "mild",
      description: "Лёгкая депрессия — рекомендуется наблюдение",
    };
  } else {
    return {
      severity: "minimal",
      description: "Минимальные симптомы депрессии",
    };
  }
}

/**
 * Подсчёт GAD-7 score (0-21)
 * GAD-7: Generalized Anxiety Disorder-7
 * Оценка уровня тревожности
 */
export function calculateGAD7Score(answers: Answer[]): number {
  const gad7Answers = answers.filter((a) => a.questionId.startsWith("gad7_"));
  
  const score = gad7Answers.reduce((total, answer) => {
    const value = typeof answer.value === "number" ? answer.value : 0;
    return total + value;
  }, 0);

  return Math.min(score, 21); // Max 21
}

/**
 * Интерпретация GAD-7 severity
 */
export function interpretGAD7(score: number): {
  severity: "minimal" | "mild" | "moderate" | "severe";
  description: string;
} {
  if (score >= 15) {
    return {
      severity: "severe",
      description: "Тяжёлая тревога — требуется помощь специалиста",
    };
  } else if (score >= 10) {
    return {
      severity: "moderate",
      description: "Умеренная тревога — рекомендуется консультация",
    };
  } else if (score >= 5) {
    return {
      severity: "mild",
      description: "Лёгкая тревога — можно использовать техники релаксации",
    };
  } else {
    return {
      severity: "minimal",
      description: "Минимальный уровень тревоги",
    };
  }
}

/**
 * Подсчёт burnout score
 */
export function calculateBurnoutScore(answers: Answer[]): number {
  const burnoutAnswers = answers.filter((a) => a.questionId.startsWith("burnout_"));
  
  const score = burnoutAnswers.reduce((total, answer) => {
    const value = typeof answer.value === "number" ? answer.value : 0;
    return total + value;
  }, 0);

  // Нормализация к 0-100
  const maxPossible = burnoutAnswers.length * 5;
  return Math.round((score / maxPossible) * 100);
}

/**
 * Интерпретация burnout level
 */
export function interpretBurnout(score: number): {
  level: "low" | "moderate" | "high" | "critical";
  description: string;
} {
  if (score >= 75) {
    return {
      level: "critical",
      description: "Критический уровень выгорания — срочно нужен отдых и поддержка",
    };
  } else if (score >= 50) {
    return {
      level: "high",
      description: "Высокий уровень выгорания — необходимо снизить нагрузку",
    };
  } else if (score >= 30) {
    return {
      level: "moderate",
      description: "Умеренное выгорание — обратите внимание на баланс работы и отдыха",
    };
  } else {
    return {
      level: "low",
      description: "Низкий уровень выгорания",
    };
  }
}

/**
 * Подсчёт social media dependency
 */
export function calculateSocialMediaMetrics(answers: Answer[]): {
  hoursPerDay: number;
  dependencyScore: number;
  fomoScore: number;
} {
  const socialAnswers = answers.filter((a) => a.questionId.startsWith("social_"));
  
  // Часы в день
  const hoursAnswer = socialAnswers.find((a) => a.questionId === "social_1");
  const hoursPerDay = typeof hoursAnswer?.value === "number" ? hoursAnswer.value : 1;

  // Dependency score (0-100)
  const avgScore = socialAnswers.reduce((total, answer) => {
    const value = typeof answer.value === "number" ? answer.value : 0;
    return total + value;
  }, 0) / socialAnswers.length;

  const dependencyScore = Math.round((avgScore / 5) * 100);

  // FOMO score
  const fomoAnswer = socialAnswers.find((a) => a.questionId === "social_3");
  const fomoScore = typeof fomoAnswer?.value === "number" 
    ? Math.round((fomoAnswer.value / 5) * 100) 
    : 0;

  return {
    hoursPerDay,
    dependencyScore,
    fomoScore,
  };
}

/**
 * Общая оценка риска
 */
export function calculateOverallRisk(
  phq9Score: number,
  gad7Score: number,
  burnoutScore: number
): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  // CRITICAL: Если есть суицидальные мысли (PHQ-9 вопрос 9)
  const phq9Interpretation = interpretPHQ9(phq9Score);
  if (phq9Score >= 20 || phq9Interpretation.severity === "severe") {
    return "CRITICAL";
  }

  // HIGH: Высокие показатели по нескольким шкалам
  const highScoresCount = [
    phq9Score >= 15,
    gad7Score >= 10,
    burnoutScore >= 60,
  ].filter(Boolean).length;

  if (highScoresCount >= 2) {
    return "HIGH";
  }

  // MEDIUM: Умеренные показатели
  const mediumScoresCount = [
    phq9Score >= 10,
    gad7Score >= 5,
    burnoutScore >= 40,
  ].filter(Boolean).length;

  if (mediumScoresCount >= 2 || highScoresCount === 1) {
    return "MEDIUM";
  }

  // LOW: Всё остальное
  return "LOW";
}
