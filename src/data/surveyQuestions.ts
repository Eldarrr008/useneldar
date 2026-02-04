import { Question, Survey } from "@/types/survey";

// ============================================
// PHQ-9 (Patient Health Questionnaire-9)
// Стандартизированный валидированный инструмент для скрининга депрессии
// Источник: Kroenke K, Spitzer RL, Williams JB (2001)
// ============================================
const phq9Questions: Question[] = [
  {
    id: "phq9_1",
    category: "phq9",
    text: "За последние 2 недели как часто вас беспокоила мало интереса или удовольствия от того, чем вы занимаетесь?",
    textKey: "questions.phq9.q1",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_1_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "phq9_1_1", label: "Несколько дней", labelKey: "questions.options.severalDays", value: 1 },
      { id: "phq9_1_2", label: "Более половины дней", labelKey: "questions.options.moreThanHalf", value: 2 },
      { id: "phq9_1_3", label: "Почти каждый день", labelKey: "questions.options.nearlyEveryDay", value: 3 },
    ],
  },
  {
    id: "phq9_2",
    category: "phq9",
    text: "За последние 2 недели как часто вас беспокоило подавленное настроение, чувство тоски или безнадёжности?",
    textKey: "questions.phq9.q2",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_2_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "phq9_2_1", label: "Несколько дней", labelKey: "questions.options.severalDays", value: 1 },
      { id: "phq9_2_2", label: "Более половины дней", labelKey: "questions.options.moreThanHalf", value: 2 },
      { id: "phq9_2_3", label: "Почти каждый день", labelKey: "questions.options.nearlyEveryDay", value: 3 },
    ],
  },
  {
    id: "phq9_3",
    category: "phq9",
    text: "За последние 2 недели как часто у вас были проблемы со сном: трудности с засыпанием, прерывистый сон или чрезмерный сон?",
    textKey: "questions.phq9.q3",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_3_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "phq9_3_1", label: "Несколько дней", labelKey: "questions.options.severalDays", value: 1 },
      { id: "phq9_3_2", label: "Более половины дней", labelKey: "questions.options.moreThanHalf", value: 2 },
      { id: "phq9_3_3", label: "Почти каждый день", labelKey: "questions.options.nearlyEveryDay", value: 3 },
    ],
  },
  {
    id: "phq9_4",
    category: "phq9",
    text: "За последние 2 недели как часто вы чувствовали усталость или упадок сил?",
    textKey: "questions.phq9.q4",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_4_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "phq9_4_1", label: "Несколько дней", labelKey: "questions.options.severalDays", value: 1 },
      { id: "phq9_4_2", label: "Более половины дней", labelKey: "questions.options.moreThanHalf", value: 2 },
      { id: "phq9_4_3", label: "Почти каждый день", labelKey: "questions.options.nearlyEveryDay", value: 3 },
    ],
  },
  {
    id: "phq9_5",
    category: "phq9",
    text: "За последние 2 недели как часто у вас был плохой аппетит или переедание?",
    textKey: "questions.phq9.q5",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_5_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "phq9_5_1", label: "Несколько дней", labelKey: "questions.options.severalDays", value: 1 },
      { id: "phq9_5_2", label: "Более половины дней", labelKey: "questions.options.moreThanHalf", value: 2 },
      { id: "phq9_5_3", label: "Почти каждый день", labelKey: "questions.options.nearlyEveryDay", value: 3 },
    ],
  },
  {
    id: "phq9_6",
    category: "phq9",
    text: "За последние 2 недели как часто вы плохо думали о себе, считая себя неудачником или разочаровывая себя и свою семью?",
    textKey: "questions.phq9.q6",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_6_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "phq9_6_1", label: "Несколько дней", labelKey: "questions.options.severalDays", value: 1 },
      { id: "phq9_6_2", label: "Более половины дней", labelKey: "questions.options.moreThanHalf", value: 2 },
      { id: "phq9_6_3", label: "Почти каждый день", labelKey: "questions.options.nearlyEveryDay", value: 3 },
    ],
  },
  {
    id: "phq9_7",
    category: "phq9",
    text: "За последние 2 недели как часто вам было трудно сосредоточиться, например, при чтении или просмотре телевизора?",
    textKey: "questions.phq9.q7",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_7_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "phq9_7_1", label: "Несколько дней", labelKey: "questions.options.severalDays", value: 1 },
      { id: "phq9_7_2", label: "Более половины дней", labelKey: "questions.options.moreThanHalf", value: 2 },
      { id: "phq9_7_3", label: "Почти каждый день", labelKey: "questions.options.nearlyEveryDay", value: 3 },
    ],
  },
  {
    id: "phq9_8",
    category: "phq9",
    text: "За последние 2 недели как часто вы двигались или говорили так медленно, что другие могли заметить? Или наоборот — были чрезмерно суетливы или беспокойны?",
    textKey: "questions.phq9.q8",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_8_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "phq9_8_1", label: "Несколько дней", labelKey: "questions.options.severalDays", value: 1 },
      { id: "phq9_8_2", label: "Более половины дней", labelKey: "questions.options.moreThanHalf", value: 2 },
      { id: "phq9_8_3", label: "Почти каждый день", labelKey: "questions.options.nearlyEveryDay", value: 3 },
    ],
  },
  {
    id: "phq9_9",
    category: "phq9",
    text: "За последние 2 недели как часто вас посещали мысли о том, что лучше бы вам умереть, или о причинении себе какого-либо вреда?",
    textKey: "questions.phq9.q9",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_9_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "phq9_9_1", label: "Несколько дней", labelKey: "questions.options.severalDays", value: 1 },
      { id: "phq9_9_2", label: "Более половины дней", labelKey: "questions.options.moreThanHalf", value: 2 },
      { id: "phq9_9_3", label: "Почти каждый день", labelKey: "questions.options.nearlyEveryDay", value: 3 },
    ],
  },
];

// ============================================
// GAD-7 (Generalized Anxiety Disorder 7-item)
// Стандартизированный инструмент для скрининга тревожности
// Источник: Spitzer RL, Kroenke K, Williams JBW, Löwe B (2006)
// ============================================
const gad7Questions: Question[] = [
  {
    id: "gad7_1",
    category: "gad7",
    text: "За последние 2 недели как часто вас беспокоило чувство нервозности, тревоги или нахождения «на взводе»?",
    textKey: "questions.gad7.q1",
    type: "single-choice",
    required: true,
    options: [
      { id: "gad7_1_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "gad7_1_1", label: "Несколько дней", labelKey: "questions.options.severalDays", value: 1 },
      { id: "gad7_1_2", label: "Более половины дней", labelKey: "questions.options.moreThanHalf", value: 2 },
      { id: "gad7_1_3", label: "Почти каждый день", labelKey: "questions.options.nearlyEveryDay", value: 3 },
    ],
  },
  {
    id: "gad7_2",
    category: "gad7",
    text: "За последние 2 недели как часто вы не могли перестать беспокоиться или контролировать беспокойство?",
    textKey: "questions.gad7.q2",
    type: "single-choice",
    required: true,
    options: [
      { id: "gad7_2_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "gad7_2_1", label: "Несколько дней", labelKey: "questions.options.severalDays", value: 1 },
      { id: "gad7_2_2", label: "Более половины дней", labelKey: "questions.options.moreThanHalf", value: 2 },
      { id: "gad7_2_3", label: "Почти каждый день", labelKey: "questions.options.nearlyEveryDay", value: 3 },
    ],
  },
  {
    id: "gad7_3",
    category: "gad7",
    text: "За последние 2 недели как часто вы чрезмерно беспокоились о разных вещах?",
    textKey: "questions.gad7.q3",
    type: "single-choice",
    required: true,
    options: [
      { id: "gad7_3_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "gad7_3_1", label: "Несколько дней", labelKey: "questions.options.severalDays", value: 1 },
      { id: "gad7_3_2", label: "Более половины дней", labelKey: "questions.options.moreThanHalf", value: 2 },
      { id: "gad7_3_3", label: "Почти каждый день", labelKey: "questions.options.nearlyEveryDay", value: 3 },
    ],
  },
  {
    id: "gad7_4",
    category: "gad7",
    text: "За последние 2 недели как часто вам было трудно расслабиться?",
    textKey: "questions.gad7.q4",
    type: "single-choice",
    required: true,
    options: [
      { id: "gad7_4_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "gad7_4_1", label: "Несколько дней", labelKey: "questions.options.severalDays", value: 1 },
      { id: "gad7_4_2", label: "Более половины дней", labelKey: "questions.options.moreThanHalf", value: 2 },
      { id: "gad7_4_3", label: "Почти каждый день", labelKey: "questions.options.nearlyEveryDay", value: 3 },
    ],
  },
  {
    id: "gad7_5",
    category: "gad7",
    text: "За последние 2 недели как часто вы были настолько беспокойны, что не могли усидеть на месте?",
    textKey: "questions.gad7.q5",
    type: "single-choice",
    required: true,
    options: [
      { id: "gad7_5_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "gad7_5_1", label: "Несколько дней", labelKey: "questions.options.severalDays", value: 1 },
      { id: "gad7_5_2", label: "Более половины дней", labelKey: "questions.options.moreThanHalf", value: 2 },
      { id: "gad7_5_3", label: "Почти каждый день", labelKey: "questions.options.nearlyEveryDay", value: 3 },
    ],
  },
  {
    id: "gad7_6",
    category: "gad7",
    text: "За последние 2 недели как часто вы легко раздражались или становились нетерпеливы?",
    textKey: "questions.gad7.q6",
    type: "single-choice",
    required: true,
    options: [
      { id: "gad7_6_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "gad7_6_1", label: "Несколько дней", labelKey: "questions.options.severalDays", value: 1 },
      { id: "gad7_6_2", label: "Более половины дней", labelKey: "questions.options.moreThanHalf", value: 2 },
      { id: "gad7_6_3", label: "Почти каждый день", labelKey: "questions.options.nearlyEveryDay", value: 3 },
    ],
  },
  {
    id: "gad7_7",
    category: "gad7",
    text: "За последние 2 недели как часто вас охватывало чувство страха, будто может произойти что-то ужасное?",
    textKey: "questions.gad7.q7",
    type: "single-choice",
    required: true,
    options: [
      { id: "gad7_7_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "gad7_7_1", label: "Несколько дней", labelKey: "questions.options.severalDays", value: 1 },
      { id: "gad7_7_2", label: "Более половины дней", labelKey: "questions.options.moreThanHalf", value: 2 },
      { id: "gad7_7_3", label: "Почти каждый день", labelKey: "questions.options.nearlyEveryDay", value: 3 },
    ],
  },
];

// ============================================
// PSS-10 (Perceived Stress Scale-10)
// Шкала воспринимаемого стресса
// Источник: Cohen, S., Kamarck, T., & Mermelstein, R. (1983)
// Вопросы 4, 5, 7, 8 — позитивные (инвертированная шкала)
// ============================================
const pss10Questions: Question[] = [
  {
    id: "pss_1",
    category: "pss",
    text: "За последний месяц как часто вы расстраивались из-за того, что произошло что-то неожиданное?",
    textKey: "questions.pss.q1",
    type: "single-choice",
    required: true,
    options: [
      { id: "pss_1_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "pss_1_1", label: "Почти никогда", labelKey: "questions.options.almostNever", value: 1 },
      { id: "pss_1_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 2 },
      { id: "pss_1_3", label: "Довольно часто", labelKey: "questions.options.fairlyOften", value: 3 },
      { id: "pss_1_4", label: "Очень часто", labelKey: "questions.options.veryOften", value: 4 },
    ],
  },
  {
    id: "pss_2",
    category: "pss",
    text: "За последний месяц как часто вы чувствовали, что не можете контролировать важные вещи в своей жизни?",
    textKey: "questions.pss.q2",
    type: "single-choice",
    required: true,
    options: [
      { id: "pss_2_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "pss_2_1", label: "Почти никогда", labelKey: "questions.options.almostNever", value: 1 },
      { id: "pss_2_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 2 },
      { id: "pss_2_3", label: "Довольно часто", labelKey: "questions.options.fairlyOften", value: 3 },
      { id: "pss_2_4", label: "Очень часто", labelKey: "questions.options.veryOften", value: 4 },
    ],
  },
  {
    id: "pss_3",
    category: "pss",
    text: "За последний месяц как часто вы чувствовали нервозность и «стресс»?",
    textKey: "questions.pss.q3",
    type: "single-choice",
    required: true,
    options: [
      { id: "pss_3_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "pss_3_1", label: "Почти никогда", labelKey: "questions.options.almostNever", value: 1 },
      { id: "pss_3_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 2 },
      { id: "pss_3_3", label: "Довольно часто", labelKey: "questions.options.fairlyOften", value: 3 },
      { id: "pss_3_4", label: "Очень часто", labelKey: "questions.options.veryOften", value: 4 },
    ],
  },
  {
    id: "pss_4",
    category: "pss",
    text: "За последний месяц как часто вы чувствовали уверенность в своей способности справляться с личными проблемами?",
    textKey: "questions.pss.q4",
    type: "single-choice",
    required: true,
    inverted: true,
    options: [
      { id: "pss_4_0", label: "Никогда", labelKey: "questions.options.never", value: 4 },
      { id: "pss_4_1", label: "Почти никогда", labelKey: "questions.options.almostNever", value: 3 },
      { id: "pss_4_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 2 },
      { id: "pss_4_3", label: "Довольно часто", labelKey: "questions.options.fairlyOften", value: 1 },
      { id: "pss_4_4", label: "Очень часто", labelKey: "questions.options.veryOften", value: 0 },
    ],
  },
  {
    id: "pss_5",
    category: "pss",
    text: "За последний месяц как часто вы чувствовали, что всё идёт так, как вы хотите?",
    textKey: "questions.pss.q5",
    type: "single-choice",
    required: true,
    inverted: true,
    options: [
      { id: "pss_5_0", label: "Никогда", labelKey: "questions.options.never", value: 4 },
      { id: "pss_5_1", label: "Почти никогда", labelKey: "questions.options.almostNever", value: 3 },
      { id: "pss_5_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 2 },
      { id: "pss_5_3", label: "Довольно часто", labelKey: "questions.options.fairlyOften", value: 1 },
      { id: "pss_5_4", label: "Очень часто", labelKey: "questions.options.veryOften", value: 0 },
    ],
  },
  {
    id: "pss_6",
    category: "pss",
    text: "За последний месяц как часто вы обнаруживали, что не справляетесь со всем, что вам нужно сделать?",
    textKey: "questions.pss.q6",
    type: "single-choice",
    required: true,
    options: [
      { id: "pss_6_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "pss_6_1", label: "Почти никогда", labelKey: "questions.options.almostNever", value: 1 },
      { id: "pss_6_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 2 },
      { id: "pss_6_3", label: "Довольно часто", labelKey: "questions.options.fairlyOften", value: 3 },
      { id: "pss_6_4", label: "Очень часто", labelKey: "questions.options.veryOften", value: 4 },
    ],
  },
  {
    id: "pss_7",
    category: "pss",
    text: "За последний месяц как часто вы могли контролировать раздражение в своей жизни?",
    textKey: "questions.pss.q7",
    type: "single-choice",
    required: true,
    inverted: true,
    options: [
      { id: "pss_7_0", label: "Никогда", labelKey: "questions.options.never", value: 4 },
      { id: "pss_7_1", label: "Почти никогда", labelKey: "questions.options.almostNever", value: 3 },
      { id: "pss_7_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 2 },
      { id: "pss_7_3", label: "Довольно часто", labelKey: "questions.options.fairlyOften", value: 1 },
      { id: "pss_7_4", label: "Очень часто", labelKey: "questions.options.veryOften", value: 0 },
    ],
  },
  {
    id: "pss_8",
    category: "pss",
    text: "За последний месяц как часто вы чувствовали, что контролируете ситуацию?",
    textKey: "questions.pss.q8",
    type: "single-choice",
    required: true,
    inverted: true,
    options: [
      { id: "pss_8_0", label: "Никогда", labelKey: "questions.options.never", value: 4 },
      { id: "pss_8_1", label: "Почти никогда", labelKey: "questions.options.almostNever", value: 3 },
      { id: "pss_8_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 2 },
      { id: "pss_8_3", label: "Довольно часто", labelKey: "questions.options.fairlyOften", value: 1 },
      { id: "pss_8_4", label: "Очень часто", labelKey: "questions.options.veryOften", value: 0 },
    ],
  },
  {
    id: "pss_9",
    category: "pss",
    text: "За последний месяц как часто вы злились из-за вещей, которые были вне вашего контроля?",
    textKey: "questions.pss.q9",
    type: "single-choice",
    required: true,
    options: [
      { id: "pss_9_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "pss_9_1", label: "Почти никогда", labelKey: "questions.options.almostNever", value: 1 },
      { id: "pss_9_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 2 },
      { id: "pss_9_3", label: "Довольно часто", labelKey: "questions.options.fairlyOften", value: 3 },
      { id: "pss_9_4", label: "Очень часто", labelKey: "questions.options.veryOften", value: 4 },
    ],
  },
  {
    id: "pss_10",
    category: "pss",
    text: "За последний месяц как часто вы чувствовали, что трудности накапливаются настолько, что вы не можете их преодолеть?",
    textKey: "questions.pss.q10",
    type: "single-choice",
    required: true,
    options: [
      { id: "pss_10_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "pss_10_1", label: "Почти никогда", labelKey: "questions.options.almostNever", value: 1 },
      { id: "pss_10_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 2 },
      { id: "pss_10_3", label: "Довольно часто", labelKey: "questions.options.fairlyOften", value: 3 },
      { id: "pss_10_4", label: "Очень часто", labelKey: "questions.options.veryOften", value: 4 },
    ],
  },
];

// ============================================
// C-SSRS (Columbia-Suicide Severity Rating Scale) — Скрининговая версия
// Мировой стандарт для оценки суицидального риска
// Источник: Posner, K. et al. (2011) Columbia University
// ============================================
const cssrsQuestions: Question[] = [
  {
    id: "cssrs_1",
    category: "phq9", // используем phq9 для совместимости с системой
    text: "За последний месяц у вас были мысли о том, что лучше бы вы умерли или желание заснуть и не проснуться?",
    textKey: "questions.cssrs.q1",
    type: "single-choice",
    required: true,
    options: [
      { id: "cssrs_1_0", label: "Нет", labelKey: "questions.options.no", value: 0 },
      { id: "cssrs_1_1", label: "Да", labelKey: "questions.options.yes", value: 1 },
    ],
  },
  {
    id: "cssrs_2",
    category: "phq9",
    text: "За последний месяц у вас были какие-либо мысли о том, чтобы покончить с жизнью?",
    textKey: "questions.cssrs.q2",
    type: "single-choice",
    required: true,
    options: [
      { id: "cssrs_2_0", label: "Нет", labelKey: "questions.options.no", value: 0 },
      { id: "cssrs_2_1", label: "Да", labelKey: "questions.options.yes", value: 2 },
    ],
  },
  {
    id: "cssrs_3",
    category: "phq9",
    text: "Вы думали о том, КАК вы могли бы это сделать (способ, план)?",
    textKey: "questions.cssrs.q3",
    type: "single-choice",
    required: true,
    options: [
      { id: "cssrs_3_0", label: "Нет", labelKey: "questions.options.no", value: 0 },
      { id: "cssrs_3_1", label: "Да", labelKey: "questions.options.yes", value: 3 },
    ],
  },
  {
    id: "cssrs_4",
    category: "phq9",
    text: "У вас было намерение действовать в соответствии с этими мыслями?",
    textKey: "questions.cssrs.q4",
    type: "single-choice",
    required: true,
    options: [
      { id: "cssrs_4_0", label: "Нет", labelKey: "questions.options.no", value: 0 },
      { id: "cssrs_4_1", label: "Да", labelKey: "questions.options.yes", value: 4 },
    ],
  },
  {
    id: "cssrs_5",
    category: "phq9",
    text: "Вы начали разрабатывать или продумывать детали того, как это сделать? Есть ли у вас доступ к средствам для реализации?",
    textKey: "questions.cssrs.q5",
    type: "single-choice",
    required: true,
    options: [
      { id: "cssrs_5_0", label: "Нет", labelKey: "questions.options.no", value: 0 },
      { id: "cssrs_5_1", label: "Да", labelKey: "questions.options.yes", value: 5 },
    ],
  },
  {
    id: "cssrs_6",
    category: "phq9",
    text: "Вы когда-нибудь делали что-то, начинали что-то делать или готовились что-то сделать, чтобы покончить с жизнью?",
    textKey: "questions.cssrs.q6",
    type: "single-choice",
    required: true,
    options: [
      { id: "cssrs_6_0", label: "Никогда", labelKey: "questions.options.neverDid", value: 0 },
      { id: "cssrs_6_1", label: "Да, более 3 месяцев назад", labelKey: "questions.options.yesOver3Months", value: 3 },
      { id: "cssrs_6_2", label: "Да, за последние 3 месяца", labelKey: "questions.options.yesLast3Months", value: 6 },
    ],
  },
];

// ============================================
// MBI-SS (Maslach Burnout Inventory - Student Survey)
// Адаптированная версия для учащихся
// Источник: Schaufeli, W.B. et al. (2002)
// Субшкалы: Истощение (EX), Цинизм (CY), Эффективность (EF - инвертирована)
// ============================================
const burnoutQuestions: Question[] = [
  // Эмоциональное истощение (Exhaustion)
  {
    id: "mbi_ex1",
    category: "burnout",
    text: "Я чувствую себя эмоционально истощённым из-за учёбы.",
    textKey: "questions.burnout.ex1",
    type: "single-choice",
    required: true,
    options: [
      { id: "mbi_ex1_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "mbi_ex1_1", label: "Редко", labelKey: "questions.options.rarely", value: 1 },
      { id: "mbi_ex1_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 2 },
      { id: "mbi_ex1_3", label: "Регулярно", labelKey: "questions.options.regularly", value: 3 },
      { id: "mbi_ex1_4", label: "Часто", labelKey: "questions.options.often", value: 4 },
      { id: "mbi_ex1_5", label: "Очень часто", labelKey: "questions.options.veryOften", value: 5 },
      { id: "mbi_ex1_6", label: "Каждый день", labelKey: "questions.options.everyDay", value: 6 },
    ],
  },
  {
    id: "mbi_ex2",
    category: "burnout",
    text: "К концу учебного дня я чувствую себя полностью измотанным.",
    textKey: "questions.burnout.ex2",
    type: "single-choice",
    required: true,
    options: [
      { id: "mbi_ex2_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "mbi_ex2_1", label: "Редко", labelKey: "questions.options.rarely", value: 1 },
      { id: "mbi_ex2_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 2 },
      { id: "mbi_ex2_3", label: "Регулярно", labelKey: "questions.options.regularly", value: 3 },
      { id: "mbi_ex2_4", label: "Часто", labelKey: "questions.options.often", value: 4 },
      { id: "mbi_ex2_5", label: "Очень часто", labelKey: "questions.options.veryOften", value: 5 },
      { id: "mbi_ex2_6", label: "Каждый день", labelKey: "questions.options.everyDay", value: 6 },
    ],
  },
  {
    id: "mbi_ex3",
    category: "burnout",
    text: "Я чувствую усталость, когда просыпаюсь утром и думаю о предстоящем учебном дне.",
    textKey: "questions.burnout.ex3",
    type: "single-choice",
    required: true,
    options: [
      { id: "mbi_ex3_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "mbi_ex3_1", label: "Редко", labelKey: "questions.options.rarely", value: 1 },
      { id: "mbi_ex3_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 2 },
      { id: "mbi_ex3_3", label: "Регулярно", labelKey: "questions.options.regularly", value: 3 },
      { id: "mbi_ex3_4", label: "Часто", labelKey: "questions.options.often", value: 4 },
      { id: "mbi_ex3_5", label: "Очень часто", labelKey: "questions.options.veryOften", value: 5 },
      { id: "mbi_ex3_6", label: "Каждый день", labelKey: "questions.options.everyDay", value: 6 },
    ],
  },
  {
    id: "mbi_ex4",
    category: "burnout",
    text: "Учёба весь день требует от меня напряжённых усилий.",
    textKey: "questions.burnout.ex4",
    type: "single-choice",
    required: true,
    options: [
      { id: "mbi_ex4_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "mbi_ex4_1", label: "Редко", labelKey: "questions.options.rarely", value: 1 },
      { id: "mbi_ex4_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 2 },
      { id: "mbi_ex4_3", label: "Регулярно", labelKey: "questions.options.regularly", value: 3 },
      { id: "mbi_ex4_4", label: "Часто", labelKey: "questions.options.often", value: 4 },
      { id: "mbi_ex4_5", label: "Очень часто", labelKey: "questions.options.veryOften", value: 5 },
      { id: "mbi_ex4_6", label: "Каждый день", labelKey: "questions.options.everyDay", value: 6 },
    ],
  },
  {
    id: "mbi_ex5",
    category: "burnout",
    text: "Я чувствую себя полностью вымотанным из-за учёбы.",
    textKey: "questions.burnout.ex5",
    type: "single-choice",
    required: true,
    options: [
      { id: "mbi_ex5_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "mbi_ex5_1", label: "Редко", labelKey: "questions.options.rarely", value: 1 },
      { id: "mbi_ex5_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 2 },
      { id: "mbi_ex5_3", label: "Регулярно", labelKey: "questions.options.regularly", value: 3 },
      { id: "mbi_ex5_4", label: "Часто", labelKey: "questions.options.often", value: 4 },
      { id: "mbi_ex5_5", label: "Очень часто", labelKey: "questions.options.veryOften", value: 5 },
      { id: "mbi_ex5_6", label: "Каждый день", labelKey: "questions.options.everyDay", value: 6 },
    ],
  },
  // Цинизм (Cynicism)
  {
    id: "mbi_cy1",
    category: "burnout",
    text: "Я стал менее заинтересован в учёбе с момента поступления.",
    textKey: "questions.burnout.cy1",
    type: "single-choice",
    required: true,
    options: [
      { id: "mbi_cy1_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "mbi_cy1_1", label: "Редко", labelKey: "questions.options.rarely", value: 1 },
      { id: "mbi_cy1_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 2 },
      { id: "mbi_cy1_3", label: "Регулярно", labelKey: "questions.options.regularly", value: 3 },
      { id: "mbi_cy1_4", label: "Часто", labelKey: "questions.options.often", value: 4 },
      { id: "mbi_cy1_5", label: "Очень часто", labelKey: "questions.options.veryOften", value: 5 },
      { id: "mbi_cy1_6", label: "Каждый день", labelKey: "questions.options.everyDay", value: 6 },
    ],
  },
  {
    id: "mbi_cy2",
    category: "burnout",
    text: "Я стал менее увлечён своей учёбой.",
    textKey: "questions.burnout.cy2",
    type: "single-choice",
    required: true,
    options: [
      { id: "mbi_cy2_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "mbi_cy2_1", label: "Редко", labelKey: "questions.options.rarely", value: 1 },
      { id: "mbi_cy2_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 2 },
      { id: "mbi_cy2_3", label: "Регулярно", labelKey: "questions.options.regularly", value: 3 },
      { id: "mbi_cy2_4", label: "Часто", labelKey: "questions.options.often", value: 4 },
      { id: "mbi_cy2_5", label: "Очень часто", labelKey: "questions.options.veryOften", value: 5 },
      { id: "mbi_cy2_6", label: "Каждый день", labelKey: "questions.options.everyDay", value: 6 },
    ],
  },
  {
    id: "mbi_cy3",
    category: "burnout",
    text: "Я стал циничен относительно того, может ли моя учёба быть полезной.",
    textKey: "questions.burnout.cy3",
    type: "single-choice",
    required: true,
    options: [
      { id: "mbi_cy3_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "mbi_cy3_1", label: "Редко", labelKey: "questions.options.rarely", value: 1 },
      { id: "mbi_cy3_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 2 },
      { id: "mbi_cy3_3", label: "Регулярно", labelKey: "questions.options.regularly", value: 3 },
      { id: "mbi_cy3_4", label: "Часто", labelKey: "questions.options.often", value: 4 },
      { id: "mbi_cy3_5", label: "Очень часто", labelKey: "questions.options.veryOften", value: 5 },
      { id: "mbi_cy3_6", label: "Каждый день", labelKey: "questions.options.everyDay", value: 6 },
    ],
  },
  {
    id: "mbi_cy4",
    category: "burnout",
    text: "Я сомневаюсь в значимости своей учёбы.",
    textKey: "questions.burnout.cy4",
    type: "single-choice",
    required: true,
    options: [
      { id: "mbi_cy4_0", label: "Никогда", labelKey: "questions.options.never", value: 0 },
      { id: "mbi_cy4_1", label: "Редко", labelKey: "questions.options.rarely", value: 1 },
      { id: "mbi_cy4_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 2 },
      { id: "mbi_cy4_3", label: "Регулярно", labelKey: "questions.options.regularly", value: 3 },
      { id: "mbi_cy4_4", label: "Часто", labelKey: "questions.options.often", value: 4 },
      { id: "mbi_cy4_5", label: "Очень часто", labelKey: "questions.options.veryOften", value: 5 },
      { id: "mbi_cy4_6", label: "Каждый день", labelKey: "questions.options.everyDay", value: 6 },
    ],
  },
  // Академическая эффективность (Professional Efficacy) — инвертированные
  {
    id: "mbi_ef1",
    category: "burnout",
    text: "Я могу эффективно решать проблемы, которые возникают в моей учёбе.",
    textKey: "questions.burnout.ef1",
    type: "single-choice",
    required: true,
    inverted: true,
    options: [
      { id: "mbi_ef1_0", label: "Никогда", labelKey: "questions.options.never", value: 6 },
      { id: "mbi_ef1_1", label: "Редко", labelKey: "questions.options.rarely", value: 5 },
      { id: "mbi_ef1_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 4 },
      { id: "mbi_ef1_3", label: "Регулярно", labelKey: "questions.options.regularly", value: 3 },
      { id: "mbi_ef1_4", label: "Часто", labelKey: "questions.options.often", value: 2 },
      { id: "mbi_ef1_5", label: "Очень часто", labelKey: "questions.options.veryOften", value: 1 },
      { id: "mbi_ef1_6", label: "Каждый день", labelKey: "questions.options.everyDay", value: 0 },
    ],
  },
  {
    id: "mbi_ef2",
    category: "burnout",
    text: "Я верю, что вношу эффективный вклад в занятия, которые посещаю.",
    textKey: "questions.burnout.ef2",
    type: "single-choice",
    required: true,
    inverted: true,
    options: [
      { id: "mbi_ef2_0", label: "Никогда", labelKey: "questions.options.never", value: 6 },
      { id: "mbi_ef2_1", label: "Редко", labelKey: "questions.options.rarely", value: 5 },
      { id: "mbi_ef2_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 4 },
      { id: "mbi_ef2_3", label: "Регулярно", labelKey: "questions.options.regularly", value: 3 },
      { id: "mbi_ef2_4", label: "Часто", labelKey: "questions.options.often", value: 2 },
      { id: "mbi_ef2_5", label: "Очень часто", labelKey: "questions.options.veryOften", value: 1 },
      { id: "mbi_ef2_6", label: "Каждый день", labelKey: "questions.options.everyDay", value: 0 },
    ],
  },
  {
    id: "mbi_ef3",
    category: "burnout",
    text: "На мой взгляд, я хороший ученик/студент.",
    textKey: "questions.burnout.ef3",
    type: "single-choice",
    required: true,
    inverted: true,
    options: [
      { id: "mbi_ef3_0", label: "Никогда", labelKey: "questions.options.never", value: 6 },
      { id: "mbi_ef3_1", label: "Редко", labelKey: "questions.options.rarely", value: 5 },
      { id: "mbi_ef3_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 4 },
      { id: "mbi_ef3_3", label: "Регулярно", labelKey: "questions.options.regularly", value: 3 },
      { id: "mbi_ef3_4", label: "Часто", labelKey: "questions.options.often", value: 2 },
      { id: "mbi_ef3_5", label: "Очень часто", labelKey: "questions.options.veryOften", value: 1 },
      { id: "mbi_ef3_6", label: "Каждый день", labelKey: "questions.options.everyDay", value: 0 },
    ],
  },
  {
    id: "mbi_ef4",
    category: "burnout",
    text: "Я чувствую воодушевление, когда достигаю своих учебных целей.",
    textKey: "questions.burnout.ef4",
    type: "single-choice",
    required: true,
    inverted: true,
    options: [
      { id: "mbi_ef4_0", label: "Никогда", labelKey: "questions.options.never", value: 6 },
      { id: "mbi_ef4_1", label: "Редко", labelKey: "questions.options.rarely", value: 5 },
      { id: "mbi_ef4_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 4 },
      { id: "mbi_ef4_3", label: "Регулярно", labelKey: "questions.options.regularly", value: 3 },
      { id: "mbi_ef4_4", label: "Часто", labelKey: "questions.options.often", value: 2 },
      { id: "mbi_ef4_5", label: "Очень часто", labelKey: "questions.options.veryOften", value: 1 },
      { id: "mbi_ef4_6", label: "Каждый день", labelKey: "questions.options.everyDay", value: 0 },
    ],
  },
  {
    id: "mbi_ef5",
    category: "burnout",
    text: "Я научился многим интересным вещам в ходе своей учёбы.",
    textKey: "questions.burnout.ef5",
    type: "single-choice",
    required: true,
    inverted: true,
    options: [
      { id: "mbi_ef5_0", label: "Никогда", labelKey: "questions.options.never", value: 6 },
      { id: "mbi_ef5_1", label: "Редко", labelKey: "questions.options.rarely", value: 5 },
      { id: "mbi_ef5_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 4 },
      { id: "mbi_ef5_3", label: "Регулярно", labelKey: "questions.options.regularly", value: 3 },
      { id: "mbi_ef5_4", label: "Часто", labelKey: "questions.options.often", value: 2 },
      { id: "mbi_ef5_5", label: "Очень часто", labelKey: "questions.options.veryOften", value: 1 },
      { id: "mbi_ef5_6", label: "Каждый день", labelKey: "questions.options.everyDay", value: 0 },
    ],
  },
  {
    id: "mbi_ef6",
    category: "burnout",
    text: "Во время занятий я уверен в своей эффективности.",
    textKey: "questions.burnout.ef6",
    type: "single-choice",
    required: true,
    inverted: true,
    options: [
      { id: "mbi_ef6_0", label: "Никогда", labelKey: "questions.options.never", value: 6 },
      { id: "mbi_ef6_1", label: "Редко", labelKey: "questions.options.rarely", value: 5 },
      { id: "mbi_ef6_2", label: "Иногда", labelKey: "questions.options.sometimes", value: 4 },
      { id: "mbi_ef6_3", label: "Регулярно", labelKey: "questions.options.regularly", value: 3 },
      { id: "mbi_ef6_4", label: "Часто", labelKey: "questions.options.often", value: 2 },
      { id: "mbi_ef6_5", label: "Очень часто", labelKey: "questions.options.veryOften", value: 1 },
      { id: "mbi_ef6_6", label: "Каждый день", labelKey: "questions.options.everyDay", value: 0 },
    ],
  },
];

// ============================================
// Комплексный опросник (все шкалы)
// PHQ-9 + GAD-7 + PSS-10 + MBI-SS + C-SSRS
// ============================================
export const comprehensiveSurvey: Survey = {
  id: "comprehensive",
  title: "Комплексная диагностика психологического состояния",
  description: "Полное обследование включает оценку депрессии (PHQ-9), тревожности (GAD-7), уровня стресса (PSS-10), академического выгорания (MBI-SS) и скрининг суицидального риска (C-SSRS). Все инструменты валидированы международным научным сообществом.",
  type: "comprehensive",
  questions: [...phq9Questions, ...gad7Questions, ...pss10Questions, ...burnoutQuestions, ...cssrsQuestions],
  estimatedMinutes: 20,
  totalQuestions: phq9Questions.length + gad7Questions.length + pss10Questions.length + burnoutQuestions.length + cssrsQuestions.length,
};

// ============================================
// Быстрый скрининг (PHQ-9 + GAD-7 + C-SSRS)
// Для экспресс-диагностики с оценкой суицидального риска
// ============================================
export const quickSurvey: Survey = {
  id: "quick",
  title: "Экспресс-скрининг",
  description: "Быстрая оценка депрессии (PHQ-9), тревожности (GAD-7) и скрининг суицидального риска (C-SSRS). Рекомендуется для первичной диагностики.",
  type: "quick",
  questions: [...phq9Questions, ...gad7Questions, ...cssrsQuestions],
  estimatedMinutes: 10,
  totalQuestions: phq9Questions.length + gad7Questions.length + cssrsQuestions.length,
};

// Экспорт отдельных шкал для использования в других модулях
export { phq9Questions, gad7Questions, pss10Questions, burnoutQuestions, cssrsQuestions };
