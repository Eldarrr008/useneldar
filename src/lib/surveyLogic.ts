import { Answer, ScaleResult } from "@/types/survey";
import { pss10Questions, burnoutQuestions } from "@/data/surveyQuestions";

/**
 * Подсчёт PHQ-9 (Patient Health Questionnaire-9)
 * Шкала: 0-27
 * Интерпретация по стандартным пороговым значениям:
 * 0-4: минимальная депрессия
 * 5-9: лёгкая депрессия
 * 10-14: умеренная депрессия
 * 15-19: умеренно-тяжёлая депрессия
 * 20-27: тяжёлая депрессия
 */
export function calculatePHQ9Score(answers: Answer[]): number {
  const phq9Answers = answers.filter((a) => a.questionId.startsWith("phq9_"));
  return phq9Answers.reduce((total, answer) => {
    const value = typeof answer.value === "number" ? answer.value : 0;
    return total + value;
  }, 0);
}

export function interpretPHQ9(score: number): ScaleResult {
  let severity: string;
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  let description: string;

  if (score >= 20) {
    severity = "severe";
    riskLevel = "CRITICAL";
    description = "Тяжёлая депрессия — требуется немедленная консультация специалиста";
  } else if (score >= 15) {
    severity = "moderately-severe";
    riskLevel = "HIGH";
    description = "Умеренно-тяжёлая депрессия — рекомендуется консультация психолога";
  } else if (score >= 10) {
    severity = "moderate";
    riskLevel = "MEDIUM";
    description = "Умеренная депрессия — рекомендуется наблюдение и возможная консультация";
  } else if (score >= 5) {
    severity = "mild";
    riskLevel = "LOW";
    description = "Лёгкая депрессия — рекомендуется самонаблюдение";
  } else {
    severity = "minimal";
    riskLevel = "LOW";
    description = "Минимальные симптомы — норма";
  }

  return { score, maxScore: 27, severity, riskLevel, description };
}

/**
 * Подсчёт GAD-7 (Generalized Anxiety Disorder-7)
 * Шкала: 0-21
 * Интерпретация:
 * 0-4: минимальная тревожность
 * 5-9: лёгкая тревожность
 * 10-14: умеренная тревожность
 * 15-21: тяжёлая тревожность
 */
export function calculateGAD7Score(answers: Answer[]): number {
  const gad7Answers = answers.filter((a) => a.questionId.startsWith("gad7_"));
  return gad7Answers.reduce((total, answer) => {
    const value = typeof answer.value === "number" ? answer.value : 0;
    return total + value;
  }, 0);
}

export function interpretGAD7(score: number): ScaleResult {
  let severity: string;
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  let description: string;

  if (score >= 15) {
    severity = "severe";
    riskLevel = "HIGH";
    description = "Тяжёлая тревожность — требуется консультация специалиста";
  } else if (score >= 10) {
    severity = "moderate";
    riskLevel = "MEDIUM";
    description = "Умеренная тревожность — рекомендуется консультация";
  } else if (score >= 5) {
    severity = "mild";
    riskLevel = "LOW";
    description = "Лёгкая тревожность — рекомендуются техники релаксации";
  } else {
    severity = "minimal";
    riskLevel = "LOW";
    description = "Минимальный уровень тревоги — норма";
  }

  return { score, maxScore: 21, severity, riskLevel, description };
}

/**
 * Подсчёт PSS-10 (Perceived Stress Scale)
 * Шкала: 0-40
 * Вопросы 4, 5, 7, 8 инвертируются (3 - value)
 * Интерпретация:
 * 0-13: низкий стресс
 * 14-26: умеренный стресс
 * 27-40: высокий стресс
 */
export function calculatePSS10Score(answers: Answer[]): number {
  const pssAnswers = answers.filter((a) => a.questionId.startsWith("pss_"));
  const invertedQuestions = ["pss_4", "pss_5", "pss_7", "pss_8"];
  
  return pssAnswers.reduce((total, answer) => {
    const value = typeof answer.value === "number" ? answer.value : 0;
    const isInverted = invertedQuestions.includes(answer.questionId);
    return total + (isInverted ? 3 - value : value);
  }, 0);
}

export function interpretPSS10(score: number): ScaleResult {
  let severity: string;
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  let description: string;

  if (score >= 27) {
    severity = "high";
    riskLevel = "HIGH";
    description = "Высокий уровень стресса — требуются меры по снижению";
  } else if (score >= 14) {
    severity = "moderate";
    riskLevel = "MEDIUM";
    description = "Умеренный уровень стресса — рекомендуется внимание к самочувствию";
  } else {
    severity = "low";
    riskLevel = "LOW";
    description = "Низкий уровень стресса — норма";
  }

  return { score, maxScore: 40, severity, riskLevel, description };
}

/**
 * Подсчёт шкалы учебного выгорания
 * Шкала: 0-27 (9 вопросов × 0-3)
 * Интерпретация:
 * 0-9: низкий уровень выгорания
 * 10-18: умеренный уровень выгорания
 * 19-27: высокий уровень выгорания
 */
export function calculateBurnoutScore(answers: Answer[]): number {
  const burnoutAnswers = answers.filter((a) => a.questionId.startsWith("burnout_"));
  return burnoutAnswers.reduce((total, answer) => {
    const value = typeof answer.value === "number" ? answer.value : 0;
    return total + value;
  }, 0);
}

export function interpretBurnout(score: number): ScaleResult {
  let severity: string;
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  let description: string;

  if (score >= 19) {
    severity = "high";
    riskLevel = "HIGH";
    description = "Высокий уровень выгорания — требуется отдых и поддержка";
  } else if (score >= 10) {
    severity = "moderate";
    riskLevel = "MEDIUM";
    description = "Умеренное выгорание — рекомендуется баланс нагрузки и отдыха";
  } else {
    severity = "low";
    riskLevel = "LOW";
    description = "Низкий уровень выгорания — норма";
  }

  return { score, maxScore: 27, severity, riskLevel, description };
}

/**
 * Расчёт общего уровня риска на основе всех шкал
 * Правила rule-based анализа:
 * - CRITICAL: PHQ-9 ≥ 20 ИЛИ ответ на вопрос о суициде ≠ 0
 * - HIGH: 2+ шкалы с HIGH ИЛИ PHQ-9 ≥ 15 ИЛИ GAD-7 ≥ 15
 * - MEDIUM: 2+ шкалы с MEDIUM ИЛИ любая шкала с HIGH
 * - LOW: всё остальное
 */
export function calculateOverallRisk(
  phq9Score: number,
  gad7Score: number,
  pssScore?: number,
  burnoutScore?: number,
  answers?: Answer[]
): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  // Проверка критического вопроса PHQ-9 о суициде
  if (answers) {
    const suicideQuestion = answers.find((a) => a.questionId === "phq9_9");
    if (suicideQuestion && typeof suicideQuestion.value === "number" && suicideQuestion.value > 0) {
      return "CRITICAL";
    }
  }

  // CRITICAL: тяжёлая депрессия
  if (phq9Score >= 20) {
    return "CRITICAL";
  }

  const phq9Result = interpretPHQ9(phq9Score);
  const gad7Result = interpretGAD7(gad7Score);
  
  const riskLevels: ("LOW" | "MEDIUM" | "HIGH" | "CRITICAL")[] = [
    phq9Result.riskLevel,
    gad7Result.riskLevel,
  ];

  if (pssScore !== undefined) {
    riskLevels.push(interpretPSS10(pssScore).riskLevel);
  }

  if (burnoutScore !== undefined) {
    riskLevels.push(interpretBurnout(burnoutScore).riskLevel);
  }

  const highCount = riskLevels.filter((r) => r === "HIGH" || r === "CRITICAL").length;
  const mediumCount = riskLevels.filter((r) => r === "MEDIUM").length;

  if (highCount >= 2 || phq9Score >= 15 || gad7Score >= 15) {
    return "HIGH";
  }

  if (mediumCount >= 2 || highCount >= 1) {
    return "MEDIUM";
  }

  return "LOW";
}

/**
 * Генерация рекомендаций на основе результатов (rule-based)
 */
export function generateRecommendations(
  phq9: ScaleResult,
  gad7: ScaleResult,
  pss10?: ScaleResult,
  burnout?: ScaleResult,
  overallRisk?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
): string[] {
  const recommendations: string[] = [];

  // Критический уровень
  if (overallRisk === "CRITICAL") {
    recommendations.push("⚠️ Рекомендуется срочная консультация с психологом или психотерапевтом");
    recommendations.push("📞 Горячая линия психологической помощи: 8-800-2000-122 (бесплатно)");
  }

  // Высокий уровень риска
  if (overallRisk === "HIGH") {
    recommendations.push("🔔 Рекомендуется обратиться к школьному психологу в ближайшее время");
  }

  // Депрессия
  if (phq9.riskLevel === "HIGH" || phq9.riskLevel === "CRITICAL") {
    recommendations.push("💭 Важно не оставаться с переживаниями наедине — поговорите с близкими или специалистом");
    recommendations.push("☀️ Старайтесь поддерживать режим дня и находить время для приятных занятий");
  } else if (phq9.riskLevel === "MEDIUM") {
    recommendations.push("🌿 Обратите внимание на режим сна и физическую активность");
  }

  // Тревожность
  if (gad7.riskLevel === "HIGH") {
    recommendations.push("🧘 Рекомендуются техники релаксации: глубокое дыхание, медитация");
    recommendations.push("📋 Составьте список беспокойств и обсудите их с доверенным человеком");
  } else if (gad7.riskLevel === "MEDIUM") {
    recommendations.push("🌬️ Практикуйте дыхательные упражнения при тревоге");
  }

  // Стресс (PSS-10)
  if (pss10 && pss10.riskLevel === "HIGH") {
    recommendations.push("⏰ Планируйте время и распределяйте задачи равномерно");
    recommendations.push("🎯 Разбивайте большие задачи на маленькие шаги");
  }

  // Выгорание
  if (burnout && burnout.riskLevel === "HIGH") {
    recommendations.push("🛌 Необходим полноценный отдых — выделите время для восстановления");
    recommendations.push("📚 Пересмотрите учебную нагрузку с преподавателями или родителями");
  } else if (burnout && burnout.riskLevel === "MEDIUM") {
    recommendations.push("⚖️ Следите за балансом учёбы и отдыха");
  }

  // Общие рекомендации для низкого риска
  if (overallRisk === "LOW") {
    recommendations.push("✅ Ваши показатели в норме. Продолжайте поддерживать здоровый образ жизни");
    recommendations.push("💪 Регулярная физическая активность помогает поддерживать психическое здоровье");
  }

  return recommendations;
}
