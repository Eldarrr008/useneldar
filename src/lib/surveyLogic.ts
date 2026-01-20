import { Answer, ScaleResult } from "@/types/survey";

// ============================================
// PHQ-9 (Patient Health Questionnaire-9)
// Клинические пороги депрессии
// Источник: Kroenke K, Spitzer RL, Williams JB (2001)
// ============================================

export function calculatePHQ9Score(answers: Answer[]): number {
  const phq9Answers = answers.filter(
    (a) => a.questionId.startsWith("phq9_") && typeof a.value === "number"
  );
  return phq9Answers.reduce((sum, a) => sum + (a.value as number), 0);
}

export function interpretPHQ9(score: number): ScaleResult {
  let severity: string;
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  let description: string;

  if (score <= 4) {
    severity = "Минимальная";
    riskLevel = "LOW";
    description = "Признаки депрессии минимальны или отсутствуют. Продолжайте поддерживать здоровый образ жизни.";
  } else if (score <= 9) {
    severity = "Лёгкая";
    riskLevel = "LOW";
    description = "Лёгкие симптомы депрессии. Рекомендуется наблюдение и повторная оценка через 2-4 недели.";
  } else if (score <= 14) {
    severity = "Умеренная";
    riskLevel = "MEDIUM";
    description = "Умеренные симптомы депрессии. Рекомендуется консультация психолога и составление плана поддержки.";
  } else if (score <= 19) {
    severity = "Умеренно-тяжёлая";
    riskLevel = "HIGH";
    description = "Выраженные симптомы депрессии. Необходима консультация специалиста и активная поддержка.";
  } else {
    severity = "Тяжёлая";
    riskLevel = "CRITICAL";
    description = "Тяжёлые симптомы депрессии. Требуется срочная консультация специалиста.";
  }

  return {
    score,
    maxScore: 27,
    severity,
    riskLevel,
    description,
  };
}

// ============================================
// GAD-7 (Generalized Anxiety Disorder-7)
// Клинические пороги тревожности
// Источник: Spitzer RL, Kroenke K, Williams JBW, Löwe B (2006)
// ============================================

export function calculateGAD7Score(answers: Answer[]): number {
  const gad7Answers = answers.filter(
    (a) => a.questionId.startsWith("gad7_") && typeof a.value === "number"
  );
  return gad7Answers.reduce((sum, a) => sum + (a.value as number), 0);
}

export function interpretGAD7(score: number): ScaleResult {
  let severity: string;
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  let description: string;

  if (score <= 4) {
    severity = "Минимальная";
    riskLevel = "LOW";
    description = "Признаки тревожности минимальны или отсутствуют.";
  } else if (score <= 9) {
    severity = "Лёгкая";
    riskLevel = "LOW";
    description = "Лёгкие симптомы тревожности. Рекомендуется мониторинг.";
  } else if (score <= 14) {
    severity = "Умеренная";
    riskLevel = "MEDIUM";
    description = "Умеренные симптомы тревожности. Рекомендуется консультация психолога.";
  } else {
    severity = "Тяжёлая";
    riskLevel = "HIGH";
    description = "Выраженные симптомы тревожности. Необходима консультация специалиста.";
  }

  return {
    score,
    maxScore: 21,
    severity,
    riskLevel,
    description,
  };
}

// ============================================
// PSS-10 (Perceived Stress Scale-10)
// Шкала воспринимаемого стресса
// Источник: Cohen, S., Kamarck, T., & Mermelstein, R. (1983)
// ============================================

export function calculatePSS10Score(answers: Answer[]): number {
  const pssAnswers = answers.filter(
    (a) => a.questionId.startsWith("pss_") && typeof a.value === "number"
  );
  // Значения уже инвертированы в вопросах
  return pssAnswers.reduce((sum, a) => sum + (a.value as number), 0);
}

export function interpretPSS10(score: number): ScaleResult {
  let severity: string;
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  let description: string;

  if (score <= 13) {
    severity = "Низкий";
    riskLevel = "LOW";
    description = "Уровень воспринимаемого стресса низкий. Хорошие навыки саморегуляции.";
  } else if (score <= 26) {
    severity = "Умеренный";
    riskLevel = "MEDIUM";
    description = "Умеренный уровень стресса. Рекомендуется обратить внимание на техники релаксации.";
  } else {
    severity = "Высокий";
    riskLevel = "HIGH";
    description = "Высокий уровень воспринимаемого стресса. Рекомендуется консультация и работа над стратегиями совладания.";
  }

  return {
    score,
    maxScore: 40,
    severity,
    riskLevel,
    description,
  };
}

// ============================================
// MBI-SS (Maslach Burnout Inventory - Student Survey)
// Шкала академического выгорания
// Источник: Schaufeli, W.B. et al. (2002)
// Расчёт: средний балл по всем пунктам × 15 для нормализации к 0-90
// ============================================

export function calculateBurnoutScore(answers: Answer[]): number {
  const burnoutAnswers = answers.filter(
    (a) => a.questionId.startsWith("mbi_") && typeof a.value === "number"
  );
  if (burnoutAnswers.length === 0) return 0;
  
  const total = burnoutAnswers.reduce((sum, a) => sum + (a.value as number), 0);
  // Нормализуем к шкале 0-90 (15 вопросов × 6 макс = 90)
  return total;
}

export function interpretBurnout(score: number): ScaleResult {
  let severity: string;
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  let description: string;

  // Пороги для 15 вопросов (макс 90)
  if (score <= 22) {
    severity = "Низкий";
    riskLevel = "LOW";
    description = "Признаки выгорания минимальны. Хороший уровень вовлечённости в учёбу.";
  } else if (score <= 45) {
    severity = "Умеренный";
    riskLevel = "MEDIUM";
    description = "Умеренные признаки выгорания. Рекомендуется обратить внимание на баланс нагрузки и отдыха.";
  } else if (score <= 67) {
    severity = "Высокий";
    riskLevel = "HIGH";
    description = "Высокий уровень выгорания. Необходимо пересмотреть нагрузку и обратиться за поддержкой.";
  } else {
    severity = "Критический";
    riskLevel = "CRITICAL";
    description = "Критический уровень выгорания. Требуется срочная консультация и снижение нагрузки.";
  }

  return {
    score,
    maxScore: 90,
    severity,
    riskLevel,
    description,
  };
}

// ============================================
// C-SSRS (Columbia-Suicide Severity Rating Scale)
// Мировой стандарт оценки суицидального риска
// Источник: Posner, K. et al. (2011) Columbia University
// ============================================

export interface CSSRSResult {
  score: number;
  ideationType: "none" | "passive" | "active_no_plan" | "active_with_plan" | "active_with_intent" | "active_with_preparation";
  hasHistory: boolean;
  recentHistory: boolean;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  requiresImmediateAction: boolean;
  description: string;
}

export function calculateCSSRSResult(answers: Answer[]): CSSRSResult {
  const cssrs1 = answers.find(a => a.questionId === "cssrs_1");
  const cssrs2 = answers.find(a => a.questionId === "cssrs_2");
  const cssrs3 = answers.find(a => a.questionId === "cssrs_3");
  const cssrs4 = answers.find(a => a.questionId === "cssrs_4");
  const cssrs5 = answers.find(a => a.questionId === "cssrs_5");
  const cssrs6 = answers.find(a => a.questionId === "cssrs_6");

  const val1 = (cssrs1?.value as number) || 0;
  const val2 = (cssrs2?.value as number) || 0;
  const val3 = (cssrs3?.value as number) || 0;
  const val4 = (cssrs4?.value as number) || 0;
  const val5 = (cssrs5?.value as number) || 0;
  const val6 = (cssrs6?.value as number) || 0;

  const score = val1 + val2 + val3 + val4 + val5 + val6;
  
  // Определяем тип идеации
  let ideationType: CSSRSResult["ideationType"] = "none";
  if (val5 > 0) ideationType = "active_with_preparation";
  else if (val4 > 0) ideationType = "active_with_intent";
  else if (val3 > 0) ideationType = "active_with_plan";
  else if (val2 > 0) ideationType = "active_no_plan";
  else if (val1 > 0) ideationType = "passive";

  const hasHistory = val6 > 0;
  const recentHistory = val6 >= 6;

  // Определяем уровень риска по протоколу C-SSRS
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  let requiresImmediateAction = false;
  let description: string;

  if (ideationType === "active_with_preparation" || recentHistory) {
    riskLevel = "CRITICAL";
    requiresImmediateAction = true;
    description = "⚠️ КРИТИЧЕСКИЙ РИСК: Выявлены активные суицидальные идеи с подготовкой или недавняя попытка. ТРЕБУЕТСЯ НЕМЕДЛЕННОЕ ВМЕШАТЕЛЬСТВО.";
  } else if (ideationType === "active_with_intent" || (hasHistory && ideationType !== "none")) {
    riskLevel = "CRITICAL";
    requiresImmediateAction = true;
    description = "⚠️ КРИТИЧЕСКИЙ РИСК: Выявлены активные суицидальные намерения. ТРЕБУЕТСЯ СРОЧНАЯ КОНСУЛЬТАЦИЯ СПЕЦИАЛИСТА.";
  } else if (ideationType === "active_with_plan") {
    riskLevel = "HIGH";
    requiresImmediateAction = true;
    description = "ВЫСОКИЙ РИСК: Выявлены суицидальные мысли с элементами планирования. Необходима срочная консультация.";
  } else if (ideationType === "active_no_plan") {
    riskLevel = "HIGH";
    description = "ВЫСОКИЙ РИСК: Выявлены активные суицидальные мысли. Рекомендуется консультация специалиста.";
  } else if (ideationType === "passive" || hasHistory) {
    riskLevel = "MEDIUM";
    description = "УМЕРЕННЫЙ РИСК: Выявлены пассивные суицидальные мысли. Рекомендуется наблюдение и консультация.";
  } else {
    riskLevel = "LOW";
    description = "Суицидальные мысли и поведение не выявлены.";
  }

  return {
    score,
    ideationType,
    hasHistory,
    recentHistory,
    riskLevel,
    requiresImmediateAction,
    description,
  };
}

// ============================================
// Общий расчёт риска с учётом всех шкал и C-SSRS
// ============================================

export function calculateOverallRisk(
  phq9Score: number,
  gad7Score: number,
  pssScore?: number,
  burnoutScore?: number,
  answers?: Answer[]
): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  // 1. КРИТИЧЕСКИЙ ПРИОРИТЕТ: Проверка C-SSRS (суицидальный риск)
  if (answers) {
    const cssrsResult = calculateCSSRSResult(answers);
    if (cssrsResult.riskLevel === "CRITICAL") {
      return "CRITICAL";
    }
    if (cssrsResult.riskLevel === "HIGH") {
      return "HIGH";
    }
    
    // Также проверяем PHQ-9 вопрос 9 (мысли о смерти)
    const suicideQuestion = answers.find((a) => a.questionId === "phq9_9");
    if (suicideQuestion && typeof suicideQuestion.value === "number") {
      if (suicideQuestion.value >= 2) {
        return "CRITICAL"; // "Более половины дней" или "Почти каждый день"
      }
      if (suicideQuestion.value === 1) {
        return "HIGH"; // "Несколько дней"
      }
    }
  }

  // 2. Проверка тяжёлой депрессии
  if (phq9Score >= 20) {
    return "CRITICAL";
  }

  // 3. Проверка критического выгорания
  if (burnoutScore !== undefined && burnoutScore >= 68) {
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

  const criticalCount = riskLevels.filter((r) => r === "CRITICAL").length;
  const highCount = riskLevels.filter((r) => r === "HIGH").length;
  const mediumCount = riskLevels.filter((r) => r === "MEDIUM").length;

  // Множественные высокие риски = критический
  if (highCount >= 3 || criticalCount >= 1) {
    return "CRITICAL";
  }

  if (highCount >= 2 || phq9Score >= 15 || gad7Score >= 15) {
    return "HIGH";
  }

  if (mediumCount >= 2 || highCount >= 1) {
    return "MEDIUM";
  }

  return "LOW";
}

// ============================================
// Генерация рекомендаций с учётом суицидального риска
// ============================================

export function generateRecommendations(
  phq9: ScaleResult,
  gad7: ScaleResult,
  pss10?: ScaleResult,
  burnout?: ScaleResult,
  overallRisk?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  cssrsResult?: CSSRSResult
): string[] {
  const recommendations: string[] = [];

  // КРИТИЧЕСКИЙ: Суицидальный риск — приоритет №1
  if (cssrsResult?.requiresImmediateAction) {
    recommendations.push("🆘 СРОЧНО: Обратитесь за немедленной помощью!");
    recommendations.push("📞 Телефон доверия: 8-800-2000-122 (бесплатно, круглосуточно)");
    recommendations.push("📞 Экстренная психологическая помощь: 051 (с мобильного) или 112");
    recommendations.push("🏥 При острых состояниях — обратитесь в ближайшее отделение скорой помощи");
    recommendations.push("👨‍⚕️ Школьный психолог НЕМЕДЛЕННО уведомлён о вашем состоянии");
  } else if (cssrsResult?.riskLevel === "HIGH") {
    recommendations.push("⚠️ ВАЖНО: Рекомендуется срочная консультация с психологом или психотерапевтом");
    recommendations.push("📞 Горячая линия психологической помощи: 8-800-2000-122 (бесплатно)");
    recommendations.push("💬 Школьный психолог уведомлён и свяжется с вами");
  } else if (cssrsResult?.riskLevel === "MEDIUM") {
    recommendations.push("💭 Рекомендуется обсудить свои переживания с психологом");
    recommendations.push("📅 Запишитесь на консультацию к школьному психологу");
  }

  // Критический уровень (не суицидальный)
  if (overallRisk === "CRITICAL" && !cssrsResult?.requiresImmediateAction) {
    recommendations.push("⚠️ Рекомендуется срочная консультация с психологом или психотерапевтом");
    recommendations.push("📞 Горячая линия психологической помощи: 8-800-2000-122 (бесплатно)");
  }

  // Высокий уровень риска
  if (overallRisk === "HIGH" && !cssrsResult?.riskLevel || cssrsResult?.riskLevel === "LOW") {
    recommendations.push("🔔 Рекомендуется обратиться к школьному психологу в ближайшее время");
  }

  // Депрессия (PHQ-9)
  if (phq9.riskLevel === "HIGH" || phq9.riskLevel === "CRITICAL") {
    recommendations.push("💭 Важно не оставаться с переживаниями наедине — поговорите с близкими или специалистом");
    recommendations.push("☀️ Старайтесь поддерживать режим дня и находить время для приятных занятий");
    recommendations.push("🏃 Физическая активность доказанно улучшает настроение — даже короткие прогулки помогают");
  } else if (phq9.riskLevel === "MEDIUM") {
    recommendations.push("🌿 Обратите внимание на качество сна и режим дня");
    recommendations.push("🎯 Ставьте небольшие достижимые цели на каждый день");
  }

  // Тревожность (GAD-7)
  if (gad7.riskLevel === "HIGH") {
    recommendations.push("🧘 Освойте техники релаксации: глубокое дыхание 4-7-8, прогрессивная мышечная релаксация");
    recommendations.push("📋 Ведите дневник беспокойств — записывайте тревожные мысли и анализируйте их");
    recommendations.push("⏰ Выделите «время для беспокойств» — 15 минут в день, в остальное время переключайтесь");
  } else if (gad7.riskLevel === "MEDIUM") {
    recommendations.push("🌬️ Практикуйте дыхательные упражнения при появлении тревоги");
    recommendations.push("📱 Ограничьте время в социальных сетях и новостях");
  }

  // Стресс (PSS-10)
  if (pss10 && pss10.riskLevel === "HIGH") {
    recommendations.push("⏰ Используйте технику тайм-боксинга: планируйте задачи с конкретными временными рамками");
    recommendations.push("🎯 Разбивайте большие задачи на маленькие шаги (техника «Помидора»)");
    recommendations.push("🛑 Научитесь говорить «нет» дополнительным обязательствам");
  } else if (pss10 && pss10.riskLevel === "MEDIUM") {
    recommendations.push("📋 Ведите список приоритетов и фокусируйтесь на важном");
  }

  // Выгорание (MBI-SS)
  if (burnout && (burnout.riskLevel === "HIGH" || burnout.riskLevel === "CRITICAL")) {
    recommendations.push("🛌 Необходим полноценный отдых — выделите минимум 1 день в неделю без учёбы");
    recommendations.push("📚 Обсудите учебную нагрузку с преподавателями или родителями");
    recommendations.push("🎨 Найдите хобби или занятие, не связанное с учёбой");
    recommendations.push("👥 Не изолируйтесь — поддерживайте социальные связи");
  } else if (burnout && burnout.riskLevel === "MEDIUM") {
    recommendations.push("⚖️ Следите за балансом учёбы и отдыха");
    recommendations.push("🌳 Проводите время на природе — это снижает уровень стресса");
  }

  // Общие рекомендации для низкого риска
  if (overallRisk === "LOW" && recommendations.length === 0) {
    recommendations.push("✨ Ваше психологическое состояние в норме");
    recommendations.push("💪 Продолжайте поддерживать здоровый образ жизни");
    recommendations.push("🧘 Регулярная практика осознанности поможет сохранить благополучие");
    recommendations.push("👥 Поддерживайте связь с друзьями и близкими");
  }

  return recommendations;
}
