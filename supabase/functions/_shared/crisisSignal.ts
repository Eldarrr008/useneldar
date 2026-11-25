// Conservative signal routing, not a diagnosis or a replacement for professional review.
const critical = [
  "убить себя", "покончить с собой", "хочу умереть", "планирую самоубийство",
  "kill myself", "end my life", "want to die", "planning suicide",
  "өзімді өлтіру", "өзімді өлтіргім", "өлгім келеді", "өзіме қол жұмса",
];
const high = [
  "не хочу жить", "жизнь не имеет смысла", "самоповреждение", "порезать себя", "причинить себе вред",
  "don't want to live", "do not want to live", "self-harm", "self harm", "cut myself", "hurt myself", "better off dead",
  "өмір сүргім келмейді", "өмірдің мәні жоқ", "өзіме зиян", "өзімді жарақат", "өмірден шаршадым",
];

export function detectChatSignal(content: string) {
  const text = content.normalize("NFKC").toLowerCase().replace(/[’‘]/g, "'");
  const criticalMatches = critical.filter(term => text.includes(term));
  const highMatches = high.filter(term => text.includes(term));
  return {
    severity: criticalMatches.length ? "critical" as const : highMatches.length ? "high" as const : "none" as const,
    keywords: [...criticalMatches, ...highMatches],
  };
}

export type SafetyLanguage = "ru" | "kk" | "en";

export function safetyLanguage(content: string, requested?: unknown): SafetyLanguage {
  if (requested === "ru" || requested === "kk" || requested === "en") return requested;
  if (/[әғқңөұүһі]/i.test(content)) return "kk";
  return /[а-яё]/i.test(content) ? "ru" : "en";
}

export function emergencySupport(language: SafetyLanguage): string {
  return {
    ru: "Если сейчас есть угроза жизни или ты можешь навредить себе, позвони 112 в Казахстане. Для поддержки по вопросам семьи и детей — 111. Не оставайся один: обратись к взрослому, которому доверяешь. Не жди ответа на сайте.",
    kk: "Қазір өміріңе қауіп төнсе немесе өзіңе зиян келтіруің мүмкін болса, Қазақстанда 112 нөміріне қоңырау шал. Отбасы мен балалар мәселелері бойынша қолдау — 111. Жалғыз қалма: сенетін ересек адамға хабарлас. Сайттағы жауапты күтпе.",
    en: "If your life is in danger or you may hurt yourself, call 112 in Kazakhstan. For support with family and children's issues, call 111. Stay with a trusted adult. Do not wait for a reply on this website.",
  }[language];
}