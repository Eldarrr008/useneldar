import { Survey, Question } from "@/types/survey";

/**
 * PHQ-9 (Patient Health Questionnaire-9)
 * Валидированный инструмент для оценки депрессии
 * Шкала: 0-3 (0=никогда, 1=редко, 2=иногда, 3=часто)
 * Интерпретация: 0-4 минимальная, 5-9 лёгкая, 10-14 умеренная, 15-19 умеренно-тяжёлая, 20-27 тяжёлая
 */
const phq9Questions: Question[] = [
  {
    id: "phq9_1",
    category: "phq9",
    text: "За последние 2 недели как часто вас беспокоил слабый интерес или отсутствие удовольствия от занятий?",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_1_0", label: "Никогда", value: 0 },
      { id: "phq9_1_1", label: "Редко", value: 1 },
      { id: "phq9_1_2", label: "Иногда", value: 2 },
      { id: "phq9_1_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "phq9_2",
    category: "phq9",
    text: "За последние 2 недели как часто вас беспокоило чувство подавленности, тоски или безнадёжности?",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_2_0", label: "Никогда", value: 0 },
      { id: "phq9_2_1", label: "Редко", value: 1 },
      { id: "phq9_2_2", label: "Иногда", value: 2 },
      { id: "phq9_2_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "phq9_3",
    category: "phq9",
    text: "За последние 2 недели как часто вас беспокоили проблемы со сном (трудности с засыпанием, прерывистый сон или слишком долгий сон)?",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_3_0", label: "Никогда", value: 0 },
      { id: "phq9_3_1", label: "Редко", value: 1 },
      { id: "phq9_3_2", label: "Иногда", value: 2 },
      { id: "phq9_3_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "phq9_4",
    category: "phq9",
    text: "За последние 2 недели как часто вас беспокоило чувство усталости или упадка сил?",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_4_0", label: "Никогда", value: 0 },
      { id: "phq9_4_1", label: "Редко", value: 1 },
      { id: "phq9_4_2", label: "Иногда", value: 2 },
      { id: "phq9_4_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "phq9_5",
    category: "phq9",
    text: "За последние 2 недели как часто вас беспокоило снижение аппетита или переедание?",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_5_0", label: "Никогда", value: 0 },
      { id: "phq9_5_1", label: "Редко", value: 1 },
      { id: "phq9_5_2", label: "Иногда", value: 2 },
      { id: "phq9_5_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "phq9_6",
    category: "phq9",
    text: "За последние 2 недели как часто вас беспокоило плохое мнение о себе (ощущение неудачника или что подвели себя или близких)?",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_6_0", label: "Никогда", value: 0 },
      { id: "phq9_6_1", label: "Редко", value: 1 },
      { id: "phq9_6_2", label: "Иногда", value: 2 },
      { id: "phq9_6_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "phq9_7",
    category: "phq9",
    text: "За последние 2 недели как часто вас беспокоили трудности с концентрацией внимания (при чтении или просмотре)?",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_7_0", label: "Никогда", value: 0 },
      { id: "phq9_7_1", label: "Редко", value: 1 },
      { id: "phq9_7_2", label: "Иногда", value: 2 },
      { id: "phq9_7_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "phq9_8",
    category: "phq9",
    text: "За последние 2 недели как часто вас беспокоила заторможенность или чрезмерная суетливость?",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_8_0", label: "Никогда", value: 0 },
      { id: "phq9_8_1", label: "Редко", value: 1 },
      { id: "phq9_8_2", label: "Иногда", value: 2 },
      { id: "phq9_8_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "phq9_9",
    category: "phq9",
    text: "За последние 2 недели как часто вас посещали мысли, что лучше было бы умереть, или мысли о причинении себе вреда?",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_9_0", label: "Никогда", value: 0 },
      { id: "phq9_9_1", label: "Редко", value: 1 },
      { id: "phq9_9_2", label: "Иногда", value: 2 },
      { id: "phq9_9_3", label: "Часто", value: 3 },
    ],
  },
];

/**
 * GAD-7 (Generalized Anxiety Disorder-7)
 * Валидированный инструмент для оценки тревожности
 * Шкала: 0-3 (0=никогда, 1=редко, 2=иногда, 3=часто)
 * Интерпретация: 0-4 минимальная, 5-9 лёгкая, 10-14 умеренная, 15-21 тяжёлая
 */
const gad7Questions: Question[] = [
  {
    id: "gad7_1",
    category: "gad7",
    text: "За последние 2 недели как часто вас беспокоило чувство нервозности, тревоги или напряжения?",
    type: "single-choice",
    required: true,
    options: [
      { id: "gad7_1_0", label: "Никогда", value: 0 },
      { id: "gad7_1_1", label: "Редко", value: 1 },
      { id: "gad7_1_2", label: "Иногда", value: 2 },
      { id: "gad7_1_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "gad7_2",
    category: "gad7",
    text: "За последние 2 недели как часто вы не могли остановить или контролировать беспокойство?",
    type: "single-choice",
    required: true,
    options: [
      { id: "gad7_2_0", label: "Никогда", value: 0 },
      { id: "gad7_2_1", label: "Редко", value: 1 },
      { id: "gad7_2_2", label: "Иногда", value: 2 },
      { id: "gad7_2_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "gad7_3",
    category: "gad7",
    text: "За последние 2 недели как часто вы слишком много беспокоились о разных вещах?",
    type: "single-choice",
    required: true,
    options: [
      { id: "gad7_3_0", label: "Никогда", value: 0 },
      { id: "gad7_3_1", label: "Редко", value: 1 },
      { id: "gad7_3_2", label: "Иногда", value: 2 },
      { id: "gad7_3_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "gad7_4",
    category: "gad7",
    text: "За последние 2 недели как часто вам было трудно расслабиться?",
    type: "single-choice",
    required: true,
    options: [
      { id: "gad7_4_0", label: "Никогда", value: 0 },
      { id: "gad7_4_1", label: "Редко", value: 1 },
      { id: "gad7_4_2", label: "Иногда", value: 2 },
      { id: "gad7_4_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "gad7_5",
    category: "gad7",
    text: "За последние 2 недели как часто вы были настолько беспокойны, что трудно было усидеть на месте?",
    type: "single-choice",
    required: true,
    options: [
      { id: "gad7_5_0", label: "Никогда", value: 0 },
      { id: "gad7_5_1", label: "Редко", value: 1 },
      { id: "gad7_5_2", label: "Иногда", value: 2 },
      { id: "gad7_5_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "gad7_6",
    category: "gad7",
    text: "За последние 2 недели как часто вы легко раздражались или становились нетерпимы?",
    type: "single-choice",
    required: true,
    options: [
      { id: "gad7_6_0", label: "Никогда", value: 0 },
      { id: "gad7_6_1", label: "Редко", value: 1 },
      { id: "gad7_6_2", label: "Иногда", value: 2 },
      { id: "gad7_6_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "gad7_7",
    category: "gad7",
    text: "За последние 2 недели как часто вас охватывало чувство страха, будто должно произойти что-то ужасное?",
    type: "single-choice",
    required: true,
    options: [
      { id: "gad7_7_0", label: "Никогда", value: 0 },
      { id: "gad7_7_1", label: "Редко", value: 1 },
      { id: "gad7_7_2", label: "Иногда", value: 2 },
      { id: "gad7_7_3", label: "Часто", value: 3 },
    ],
  },
];

/**
 * PSS-10 (Perceived Stress Scale)
 * Валидированный инструмент для оценки воспринимаемого стресса
 * Шкала: 0-3 (0=никогда, 1=редко, 2=иногда, 3=часто)
 * Примечание: вопросы 4, 5, 7, 8 инвертируются (3-value)
 * Интерпретация: 0-13 низкий, 14-26 умеренный, 27-40 высокий
 */
const pss10Questions: Question[] = [
  {
    id: "pss_1",
    category: "pss",
    text: "За последний месяц как часто вы расстраивались из-за неожиданных событий?",
    type: "single-choice",
    required: true,
    options: [
      { id: "pss_1_0", label: "Никогда", value: 0 },
      { id: "pss_1_1", label: "Редко", value: 1 },
      { id: "pss_1_2", label: "Иногда", value: 2 },
      { id: "pss_1_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "pss_2",
    category: "pss",
    text: "За последний месяц как часто вам казалось, что вы не в состоянии контролировать важные вещи в жизни?",
    type: "single-choice",
    required: true,
    options: [
      { id: "pss_2_0", label: "Никогда", value: 0 },
      { id: "pss_2_1", label: "Редко", value: 1 },
      { id: "pss_2_2", label: "Иногда", value: 2 },
      { id: "pss_2_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "pss_3",
    category: "pss",
    text: "За последний месяц как часто вы чувствовали нервное напряжение и стресс?",
    type: "single-choice",
    required: true,
    options: [
      { id: "pss_3_0", label: "Никогда", value: 0 },
      { id: "pss_3_1", label: "Редко", value: 1 },
      { id: "pss_3_2", label: "Иногда", value: 2 },
      { id: "pss_3_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "pss_4",
    category: "pss",
    text: "За последний месяц как часто вы чувствовали уверенность в своих способностях справляться с личными проблемами?",
    type: "single-choice",
    required: true,
    inverted: true,
    options: [
      { id: "pss_4_0", label: "Никогда", value: 0 },
      { id: "pss_4_1", label: "Редко", value: 1 },
      { id: "pss_4_2", label: "Иногда", value: 2 },
      { id: "pss_4_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "pss_5",
    category: "pss",
    text: "За последний месяц как часто вам казалось, что всё идёт так, как вам хочется?",
    type: "single-choice",
    required: true,
    inverted: true,
    options: [
      { id: "pss_5_0", label: "Никогда", value: 0 },
      { id: "pss_5_1", label: "Редко", value: 1 },
      { id: "pss_5_2", label: "Иногда", value: 2 },
      { id: "pss_5_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "pss_6",
    category: "pss",
    text: "За последний месяц как часто вам казалось, что вы не справляетесь со всем, что нужно сделать?",
    type: "single-choice",
    required: true,
    options: [
      { id: "pss_6_0", label: "Никогда", value: 0 },
      { id: "pss_6_1", label: "Редко", value: 1 },
      { id: "pss_6_2", label: "Иногда", value: 2 },
      { id: "pss_6_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "pss_7",
    category: "pss",
    text: "За последний месяц как часто вы могли контролировать раздражение в своей жизни?",
    type: "single-choice",
    required: true,
    inverted: true,
    options: [
      { id: "pss_7_0", label: "Никогда", value: 0 },
      { id: "pss_7_1", label: "Редко", value: 1 },
      { id: "pss_7_2", label: "Иногда", value: 2 },
      { id: "pss_7_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "pss_8",
    category: "pss",
    text: "За последний месяц как часто вы чувствовали, что держите ситуацию под контролем?",
    type: "single-choice",
    required: true,
    inverted: true,
    options: [
      { id: "pss_8_0", label: "Никогда", value: 0 },
      { id: "pss_8_1", label: "Редко", value: 1 },
      { id: "pss_8_2", label: "Иногда", value: 2 },
      { id: "pss_8_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "pss_9",
    category: "pss",
    text: "За последний месяц как часто вы злились из-за вещей, которые были вне вашего контроля?",
    type: "single-choice",
    required: true,
    options: [
      { id: "pss_9_0", label: "Никогда", value: 0 },
      { id: "pss_9_1", label: "Редко", value: 1 },
      { id: "pss_9_2", label: "Иногда", value: 2 },
      { id: "pss_9_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "pss_10",
    category: "pss",
    text: "За последний месяц как часто вам казалось, что трудности накапливаются настолько, что вы не можете их преодолеть?",
    type: "single-choice",
    required: true,
    options: [
      { id: "pss_10_0", label: "Никогда", value: 0 },
      { id: "pss_10_1", label: "Редко", value: 1 },
      { id: "pss_10_2", label: "Иногда", value: 2 },
      { id: "pss_10_3", label: "Часто", value: 3 },
    ],
  },
];

/**
 * Шкала учебного выгорания (адаптированная для подростков и студентов)
 * Основана на MBI-SS (Maslach Burnout Inventory - Student Survey)
 * Шкала: 0-3 (0=никогда, 1=редко, 2=иногда, 3=часто)
 * Интерпретация: 0-9 низкий, 10-18 умеренный, 19-27 высокий
 */
const burnoutQuestions: Question[] = [
  {
    id: "burnout_1",
    category: "burnout",
    text: "Как часто вы чувствуете эмоциональное истощение от учёбы?",
    type: "single-choice",
    required: true,
    options: [
      { id: "burnout_1_0", label: "Никогда", value: 0 },
      { id: "burnout_1_1", label: "Редко", value: 1 },
      { id: "burnout_1_2", label: "Иногда", value: 2 },
      { id: "burnout_1_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "burnout_2",
    category: "burnout",
    text: "Как часто к концу учебного дня вы чувствуете себя полностью опустошённым?",
    type: "single-choice",
    required: true,
    options: [
      { id: "burnout_2_0", label: "Никогда", value: 0 },
      { id: "burnout_2_1", label: "Редко", value: 1 },
      { id: "burnout_2_2", label: "Иногда", value: 2 },
      { id: "burnout_2_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "burnout_3",
    category: "burnout",
    text: "Как часто вы чувствуете усталость при мысли о предстоящем учебном дне?",
    type: "single-choice",
    required: true,
    options: [
      { id: "burnout_3_0", label: "Никогда", value: 0 },
      { id: "burnout_3_1", label: "Редко", value: 1 },
      { id: "burnout_3_2", label: "Иногда", value: 2 },
      { id: "burnout_3_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "burnout_4",
    category: "burnout",
    text: "Как часто вам кажется, что учёба теряет для вас смысл?",
    type: "single-choice",
    required: true,
    options: [
      { id: "burnout_4_0", label: "Никогда", value: 0 },
      { id: "burnout_4_1", label: "Редко", value: 1 },
      { id: "burnout_4_2", label: "Иногда", value: 2 },
      { id: "burnout_4_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "burnout_5",
    category: "burnout",
    text: "Как часто вы сомневаетесь в значимости своей учёбы?",
    type: "single-choice",
    required: true,
    options: [
      { id: "burnout_5_0", label: "Никогда", value: 0 },
      { id: "burnout_5_1", label: "Редко", value: 1 },
      { id: "burnout_5_2", label: "Иногда", value: 2 },
      { id: "burnout_5_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "burnout_6",
    category: "burnout",
    text: "Как часто вам трудно сконцентрироваться на учебных задачах?",
    type: "single-choice",
    required: true,
    options: [
      { id: "burnout_6_0", label: "Никогда", value: 0 },
      { id: "burnout_6_1", label: "Редко", value: 1 },
      { id: "burnout_6_2", label: "Иногда", value: 2 },
      { id: "burnout_6_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "burnout_7",
    category: "burnout",
    text: "Как часто вы чувствуете, что не справляетесь с учебной нагрузкой?",
    type: "single-choice",
    required: true,
    options: [
      { id: "burnout_7_0", label: "Никогда", value: 0 },
      { id: "burnout_7_1", label: "Редко", value: 1 },
      { id: "burnout_7_2", label: "Иногда", value: 2 },
      { id: "burnout_7_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "burnout_8",
    category: "burnout",
    text: "Как часто вы откладываете выполнение учебных заданий?",
    type: "single-choice",
    required: true,
    options: [
      { id: "burnout_8_0", label: "Никогда", value: 0 },
      { id: "burnout_8_1", label: "Редко", value: 1 },
      { id: "burnout_8_2", label: "Иногда", value: 2 },
      { id: "burnout_8_3", label: "Часто", value: 3 },
    ],
  },
  {
    id: "burnout_9",
    category: "burnout",
    text: "Как часто вы теряете интерес к учёбе, которая раньше была вам интересна?",
    type: "single-choice",
    required: true,
    options: [
      { id: "burnout_9_0", label: "Никогда", value: 0 },
      { id: "burnout_9_1", label: "Редко", value: 1 },
      { id: "burnout_9_2", label: "Иногда", value: 2 },
      { id: "burnout_9_3", label: "Часто", value: 3 },
    ],
  },
];

/**
 * Полный психологический опросник
 * Включает все 4 валидированных шкалы
 */
export const comprehensiveSurvey: Survey = {
  id: "comprehensive-psychological-assessment",
  title: "Комплексная психологическая диагностика",
  description: "Научно валидированный опросник для оценки депрессии (PHQ-9), тревожности (GAD-7), стресса (PSS-10) и учебного выгорания",
  type: "comprehensive",
  questions: [
    ...phq9Questions,
    ...gad7Questions,
    ...pss10Questions,
    ...burnoutQuestions,
  ],
  estimatedMinutes: 15,
  totalQuestions: phq9Questions.length + gad7Questions.length + pss10Questions.length + burnoutQuestions.length,
};

/**
 * Экспресс-опросник (только PHQ-9 и GAD-7)
 */
export const quickSurvey: Survey = {
  id: "quick-screening",
  title: "Экспресс-диагностика",
  description: "Быстрая оценка депрессии и тревожности (PHQ-9, GAD-7)",
  type: "quick",
  questions: [...phq9Questions, ...gad7Questions],
  estimatedMinutes: 5,
  totalQuestions: phq9Questions.length + gad7Questions.length,
};

export { phq9Questions, gad7Questions, pss10Questions, burnoutQuestions };
