import { Answer } from "@/types/survey";

/**
 * Извлечение ключевых слов и тем из открытых ответов
 */
export function extractKeyThemes(answers: Answer[]): string[] {
  const openAnswers = answers.filter((a) => a.questionId.startsWith("open_"));
  
  const themes: string[] = [];
  const keywordMap: { [key: string]: string } = {
    "экзамен": "Экзаменационный стресс",
    "ент": "Экзаменационный стресс",
    "учеба": "Учёба и нагрузка",
    "учёба": "Учёба и нагрузка",
    "родител": "Отношения с родителями",
    "семья": "Семейные отношения",
    "друг": "Дружба и социальные связи",
    "одиночеств": "Чувство одиночества",
    "буллинг": "Буллинг",
    "травля": "Буллинг",
    "соцсет": "Влияние соцсетей",
    "инстаграм": "Влияние соцсетей",
    "тикток": "Влияние соцсетей",
    "сравн": "Сравнение с другими",
    "карьер": "Выбор профессии",
    "профессия": "Выбор профессии",
    "будущее": "Беспокойство о будущем",
    "деньг": "Финансовые переживания",
    "сон": "Проблемы со сном",
    "устал": "Усталость и выгорание",
    "стресс": "Общий стресс",
    "тревог": "Тревожность",
    "депресс": "Депрессивные симптомы",
    "грустн": "Подавленное настроение",
  };

  openAnswers.forEach((answer) => {
    if (typeof answer.value === "string" && answer.value.trim()) {
      const text = answer.value.toLowerCase();
      
      Object.entries(keywordMap).forEach(([keyword, theme]) => {
        if (text.includes(keyword) && !themes.includes(theme)) {
          themes.push(theme);
        }
      });
    }
  });

  // Если ничего не нашли, добавляем общую тему
  if (themes.length === 0) {
    themes.push("Общее психологическое состояние");
  }

  return themes;
}

/**
 * Генерация персонализированных рекомендаций
 */
export function generateRecommendations(
  phq9Score: number,
  gad7Score: number,
  burnoutScore: number,
  socialMediaHours: number,
  keyThemes: string[]
): string[] {
  const recommendations: string[] = [];

  // Рекомендации по депрессии
  if (phq9Score >= 15) {
    recommendations.push("📞 Запишитесь на консультацию к школьному психологу");
    recommendations.push("💬 Поделитесь своими переживаниями с близким человеком");
  } else if (phq9Score >= 10) {
    recommendations.push("🧘 Попробуйте техники релаксации: дыхание 4-7-8, медитация");
    recommendations.push("📝 Ведите дневник благодарности: записывайте 3 хорошие вещи каждый день");
  }

  // Рекомендации по тревоге
  if (gad7Score >= 10) {
    recommendations.push("🎯 Попробуйте технику заземления 5-4-3-2-1 при приступе тревоги");
    recommendations.push("🏃 Регулярная физическая активность снижает уровень тревоги");
  } else if (gad7Score >= 5) {
    recommendations.push("⏰ Структурируйте день: чёткий распорядок снижает беспокойство");
  }

  // Рекомендации по выгоранию
  if (burnoutScore >= 60) {
    recommendations.push("🔋 Срочно нужен отдых: выделите минимум 1 день на полное восстановление");
    recommendations.push("❌ Научитесь говорить 'нет' лишним обязательствам");
  } else if (burnoutScore >= 40) {
    recommendations.push("⚖️ Балансируйте нагрузку: 25 минут учёбы → 5 минут отдыха (Pomodoro)");
  }

  // Рекомендации по соцсетям
  if (socialMediaHours >= 4) {
    recommendations.push("📱 Сократите время в соцсетях до 2-3 часов в день");
    recommendations.push("🔕 Отключите уведомления после 21:00 для качественного сна");
  }

  // Тематические рекомендации
  if (keyThemes.includes("Экзаменационный стресс")) {
    recommendations.push("📚 Разбейте подготовку к ЕНТ на маленькие шаги — это снизит стресс");
  }

  if (keyThemes.includes("Проблемы со сном")) {
    recommendations.push("💤 Соблюдайте гигиену сна: ложитесь в одно время, не используйте гаджеты за час до сна");
  }

  if (keyThemes.includes("Сравнение с другими") || keyThemes.includes("Влияние соцсетей")) {
    recommendations.push("🌟 Помните: соцсети показывают только лучшие моменты. У всех есть трудности");
  }

  if (keyThemes.includes("Чувство одиночества")) {
    recommendations.push("🤝 Присоединитесь к школьному кружку или секции — это поможет найти друзей");
  }

  // Универсальные рекомендации
  if (recommendations.length < 3) {
    recommendations.push("🧠 Практикуйте майндфулнесс: 10 минут осознанного дыхания в день");
    recommendations.push("🌿 Проводите время на природе: 20-30 минут прогулки улучшают настроение");
  }

  return recommendations.slice(0, 7); // Максимум 7 рекомендаций
}

/**
 * Определение confidence score для анализа
 */
export function calculateConfidence(totalAnswered: number, totalQuestions: number): number {
  const completionRate = totalAnswered / totalQuestions;
  
  // Базовая уверенность: 70-95%
  const baseConfidence = 70 + (completionRate * 25);
  
  return Math.round(baseConfidence * 10) / 10; // Округление до 1 знака
}
