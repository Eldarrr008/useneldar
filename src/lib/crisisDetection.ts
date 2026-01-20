// ============================================
// Модуль определения кризисных состояний
// Расширенный набор ключевых слов и паттернов
// Поддержка нескольких языков и контекстного анализа
// ============================================

// Категории ключевых слов по степени серьёзности
const criticalKeywords = [
  // Прямые высказывания о суициде
  "хочу умереть",
  "покончить с собой",
  "убить себя",
  "суицид",
  "самоубийство",
  "повеситься",
  "прыгнуть с крыши",
  "отравиться",
  "вскрыть вены",
  "порезать вены",
  "наглотаться таблеток",
  "выпить таблеток",
  "застрелиться",
  "утопиться",
  
  // Планирование
  "напишу записку",
  "прощальное письмо",
  "написал записку",
  "завещание",
  "прощаюсь",
  "попрощаться со всеми",
  
  // Англоязычные
  "kill myself",
  "end my life",
  "suicide",
  "want to die",
  "hang myself",
];

const highRiskKeywords = [
  // Желание смерти
  "не хочу жить",
  "лучше бы я умер",
  "лучше бы меня не было",
  "зачем я живу",
  "незачем жить",
  "не вижу смысла жить",
  "жизнь не имеет смысла",
  "смысла нет",
  "всем будет лучше без меня",
  "никто не заметит",
  "никому не нужен",
  "я обуза",
  "устал жить",
  "устала жить",
  "надоело жить",
  
  // Безнадёжность
  "ничего не изменится",
  "выхода нет",
  "нет выхода",
  "конец",
  "всё кончено",
  "больше не могу",
  "не выдержу",
  "сил нет",
  "нет сил",
  
  // Англоязычные
  "don't want to live",
  "no point in living",
  "better off dead",
  "no one cares",
  "everyone would be better without me",
];

const mediumRiskKeywords = [
  // Самоповреждение
  "причинить себе вред",
  "самоповреждение",
  "порезать себя",
  "режу себя",
  "царапаю себя",
  "бью себя",
  "хочу боли",
  "физическая боль",
  "селфхарм",
  "self harm",
  "self-harm",
  
  // Исчезновение
  "хочу исчезнуть",
  "хочу пропасть",
  "сбежать от всех",
  "уйти навсегда",
  "скрыться",
  
  // Отчаяние
  "в отчаянии",
  "безнадёжно",
  "безнадежно",
  "невыносимо",
  "не могу больше терпеть",
  "на грани",
  "срываюсь",
  "схожу с ума",
];

const warningKeywords = [
  // Изоляция
  "никто не понимает",
  "совсем один",
  "совсем одна",
  "одиночество",
  "изолирован",
  "отвергли",
  "все против меня",
  
  // Тяжёлое состояние
  "очень плохо",
  "ужасно себя чувствую",
  "не могу справиться",
  "не справляюсь",
  "разваливаюсь",
  "теряю контроль",
  "паника",
  "панические атаки",
  
  // Негативное самовосприятие
  "ненавижу себя",
  "я ничтожество",
  "я неудачник",
  "я ни на что не способен",
  "я бесполезен",
  "я бесполезная",
  "никчёмный",
  "никчемный",
];

export interface CrisisDetectionResult {
  isCrisis: boolean;
  detectedKeywords: string[];
  severity: "low" | "medium" | "high" | "critical";
  recommendedAction: "monitor" | "alert" | "immediate";
  categories: {
    suicidal: boolean;
    selfHarm: boolean;
    hopelessness: boolean;
    isolation: boolean;
  };
  confidenceScore: number; // 0-100
}

/**
 * Анализирует сообщение на наличие признаков кризиса
 * Использует многоуровневую систему определения риска
 */
export function detectCrisis(message: string): CrisisDetectionResult {
  const normalizedMessage = message.toLowerCase().replace(/[.,!?;:]/g, " ");
  
  const detected: string[] = [];
  let hasCritical = false;
  let hasHighRisk = false;
  let hasMediumRisk = false;
  let hasWarning = false;

  // Проверяем критические ключевые слова
  for (const keyword of criticalKeywords) {
    if (normalizedMessage.includes(keyword)) {
      detected.push(keyword);
      hasCritical = true;
    }
  }

  // Проверяем высокорисковые ключевые слова
  for (const keyword of highRiskKeywords) {
    if (normalizedMessage.includes(keyword)) {
      detected.push(keyword);
      hasHighRisk = true;
    }
  }

  // Проверяем среднерисковые ключевые слова
  for (const keyword of mediumRiskKeywords) {
    if (normalizedMessage.includes(keyword)) {
      detected.push(keyword);
      hasMediumRisk = true;
    }
  }

  // Проверяем предупреждающие ключевые слова
  for (const keyword of warningKeywords) {
    if (normalizedMessage.includes(keyword)) {
      detected.push(keyword);
      hasWarning = true;
    }
  }

  const isCrisis = detected.length > 0;

  // Определяем категории риска
  const categories = {
    suicidal: hasCritical || (hasHighRisk && detected.some(k => 
      k.includes("умереть") || k.includes("жить") || k.includes("суицид") || k.includes("самоубийство")
    )),
    selfHarm: detected.some(k => 
      k.includes("порез") || k.includes("вред") || k.includes("harm") || k.includes("режу") || k.includes("бью")
    ),
    hopelessness: detected.some(k => 
      k.includes("смысл") || k.includes("выход") || k.includes("надежд") || k.includes("конец") || k.includes("кончено")
    ),
    isolation: detected.some(k => 
      k.includes("один") || k.includes("никто") || k.includes("изолир") || k.includes("отверг")
    ),
  };

  // Определяем серьёзность и рекомендуемое действие
  let severity: CrisisDetectionResult["severity"];
  let recommendedAction: CrisisDetectionResult["recommendedAction"];
  let confidenceScore: number;

  if (hasCritical) {
    severity = "critical";
    recommendedAction = "immediate";
    confidenceScore = 95;
  } else if (hasHighRisk && detected.length >= 2) {
    severity = "critical";
    recommendedAction = "immediate";
    confidenceScore = 90;
  } else if (hasHighRisk) {
    severity = "high";
    recommendedAction = "immediate";
    confidenceScore = 85;
  } else if (hasMediumRisk && detected.length >= 2) {
    severity = "high";
    recommendedAction = "alert";
    confidenceScore = 75;
  } else if (hasMediumRisk) {
    severity = "medium";
    recommendedAction = "alert";
    confidenceScore = 65;
  } else if (hasWarning && detected.length >= 2) {
    severity = "medium";
    recommendedAction = "alert";
    confidenceScore = 55;
  } else if (hasWarning) {
    severity = "low";
    recommendedAction = "monitor";
    confidenceScore = 40;
  } else {
    severity = "low";
    recommendedAction = "monitor";
    confidenceScore = 0;
  }

  return {
    isCrisis,
    detectedKeywords: [...new Set(detected)], // Убираем дубликаты
    severity,
    recommendedAction,
    categories,
    confidenceScore,
  };
}

/**
 * Генерирует сообщение для пользователя в кризисной ситуации
 * Адаптировано под уровень серьёзности
 */
export function generateCrisisMessage(severity: CrisisDetectionResult["severity"] = "critical"): string {
  if (severity === "critical") {
    return `⚠️ **Мне очень важно то, чем ты делишься. Твоя жизнь ценна.**

📞 **Позвони прямо сейчас:**
• **8-800-2000-122** — бесплатная горячая линия для детей и подростков (круглосуточно)
• **051** или **112** — экстренная психологическая помощь

💬 Школьный психолог уже уведомлён и скоро свяжется с тобой.

**Ты не один. Есть люди, которые хотят помочь тебе прямо сейчас.** ❤️

Если ты в непосредственной опасности, пожалуйста, обратись к взрослому рядом с тобой или позвони по номеру экстренной помощи.`;
  }

  if (severity === "high") {
    return `💙 **Я вижу, что тебе сейчас очень тяжело.**

Важно поговорить с кем-то, кто может помочь:
• 📞 **8-800-2000-122** — бесплатная линия поддержки (круглосуточно)
• 👨‍⚕️ Школьный психолог получит уведомление

**Ты заслуживаешь поддержки.** Расскажи мне больше о том, что происходит, или обратись к специалисту. ❤️`;
  }

  if (severity === "medium") {
    return `💚 **Я слышу тебя и понимаю, что сейчас непросто.**

Если хочешь поговорить:
• 📞 **8-800-2000-122** — линия психологической поддержки
• 💬 Школьный психолог всегда готов выслушать

Расскажи мне подробнее о своих переживаниях. Я здесь, чтобы поддержать. 🌟`;
  }

  return `💛 Я заметил, что тебе может быть непросто. Если хочешь поговорить о своих чувствах — я здесь. 

Помни, что всегда можно обратиться к школьному психологу или позвонить на линию поддержки: **8-800-2000-122** 🌈`;
}

/**
 * Создаёт структурированный отчёт для психолога
 */
export function generateCrisisReport(
  result: CrisisDetectionResult,
  messageContent: string,
  userId?: string
): {
  priority: "urgent" | "high" | "medium" | "low";
  summary: string;
  details: string;
  suggestedActions: string[];
} {
  const priority = result.severity === "critical" ? "urgent" : result.severity;
  
  const categoryLabels: string[] = [];
  if (result.categories.suicidal) categoryLabels.push("суицидальные мысли");
  if (result.categories.selfHarm) categoryLabels.push("самоповреждение");
  if (result.categories.hopelessness) categoryLabels.push("безнадёжность");
  if (result.categories.isolation) categoryLabels.push("изоляция");

  const summary = `Обнаружен кризис (${result.severity}): ${categoryLabels.join(", ") || "общее тревожное состояние"}`;

  const details = `
Уровень серьёзности: ${result.severity.toUpperCase()}
Уверенность: ${result.confidenceScore}%
Ключевые слова: ${result.detectedKeywords.join(", ")}
Категории риска: ${categoryLabels.join(", ") || "не определены"}

Фрагмент сообщения: "${messageContent.substring(0, 200)}${messageContent.length > 200 ? "..." : ""}"
`.trim();

  const suggestedActions: string[] = [];
  
  if (result.severity === "critical") {
    suggestedActions.push("НЕМЕДЛЕННО связаться с учеником");
    suggestedActions.push("Уведомить родителей/опекунов");
    suggestedActions.push("Оценить необходимость экстренной помощи");
    suggestedActions.push("Составить план безопасности");
  } else if (result.severity === "high") {
    suggestedActions.push("Связаться с учеником в течение дня");
    suggestedActions.push("Провести оценку суицидального риска");
    suggestedActions.push("Рассмотреть необходимость уведомления родителей");
  } else if (result.severity === "medium") {
    suggestedActions.push("Запланировать встречу с учеником");
    suggestedActions.push("Провести беседу о текущем состоянии");
  } else {
    suggestedActions.push("Продолжить мониторинг");
    suggestedActions.push("Отметить для наблюдения");
  }

  return {
    priority: priority as "urgent" | "high" | "medium" | "low",
    summary,
    details,
    suggestedActions,
  };
}
