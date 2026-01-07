/**
 * Crisis Detection System
 * Detects crisis keywords in messages and returns severity assessment
 */

const crisisKeywords = [
  "не хочу жить",
  "суицид",
  "покончить с собой",
  "умереть",
  "самоубийство",
  "повеситься",
  "убить себя",
  "хочу умереть",
  "жизнь не имеет смысла",
  "лучше бы я умер",
  "не вижу смысла",
  "хочу исчезнуть",
  "причинить себе вред",
  "самоповреждение",
  "порезать себя",
];

export interface CrisisDetectionResult {
  isCrisis: boolean;
  detectedKeywords: string[];
  severity: "low" | "medium" | "high" | "critical";
  recommendedAction: "monitor" | "alert" | "immediate";
}

/**
 * Detects crisis-related keywords in a message
 */
export function detectCrisis(message: string): CrisisDetectionResult {
  const lowercaseMessage = message.toLowerCase();
  const detected: string[] = [];

  for (const keyword of crisisKeywords) {
    if (lowercaseMessage.includes(keyword)) {
      detected.push(keyword);
    }
  }

  const isCrisis = detected.length > 0;
  
  let severity: CrisisDetectionResult["severity"] = "low";
  let recommendedAction: CrisisDetectionResult["recommendedAction"] = "monitor";

  if (detected.length >= 3) {
    severity = "critical";
    recommendedAction = "immediate";
  } else if (detected.length >= 2) {
    severity = "high";
    recommendedAction = "immediate";
  } else if (detected.length === 1) {
    const criticalKeywords = ["суицид", "покончить с собой", "убить себя", "повеситься"];
    if (criticalKeywords.some(k => detected.includes(k))) {
      severity = "critical";
      recommendedAction = "immediate";
    } else {
      severity = "medium";
      recommendedAction = "alert";
    }
  }

  return {
    isCrisis,
    detectedKeywords: detected,
    severity,
    recommendedAction,
  };
}

/**
 * Generates a crisis response message
 */
export function generateCrisisMessage(): string {
  return `⚠️ Мне очень важно то, что ты поделился этим. Твоя жизнь имеет огромную ценность.

📞 **Немедленно обратись за помощью:**
• Кризисная линия: **150** (круглосуточно, бесплатно)
• Школьный психолог уведомлен

Ты не один. Есть люди, которые хотят помочь тебе прямо сейчас. ❤️`;
}

/**
 * Creates an alert message for psychologists
 */
export function createPsychologistAlert(
  studentId: number,
  message: string,
  detectedKeywords: string[]
): string {
  return `🚨 КРИЗИСНАЯ СИТУАЦИЯ
Студент ID: ${studentId}
Обнаружены: ${detectedKeywords.join(", ")}
Сообщение: "${message.substring(0, 100)}..."
Требуется немедленная реакция.`;
}
