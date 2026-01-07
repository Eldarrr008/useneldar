import { Survey, Question } from "@/types/survey";

const phq9Questions: Question[] = [
  {
    id: "phq9_1",
    category: "phq9",
    text: "Как часто вы испытывали слабый интерес или удовольствие от выполнения каких-либо дел за последние 2 недели?",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_1_0", label: "Совсем не испытывал", value: 0 },
      { id: "phq9_1_1", label: "Несколько дней", value: 1 },
      { id: "phq9_1_2", label: "Больше половины времени", value: 2 },
      { id: "phq9_1_3", label: "Почти каждый день", value: 3 },
    ],
  },
  {
    id: "phq9_2",
    category: "phq9",
    text: "Как часто вы чувствовали подавленность, депрессию или безнадежность?",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_2_0", label: "Совсем не испытывал", value: 0 },
      { id: "phq9_2_1", label: "Несколько дней", value: 1 },
      { id: "phq9_2_2", label: "Больше половины времени", value: 2 },
      { id: "phq9_2_3", label: "Почти каждый день", value: 3 },
    ],
  },
  {
    id: "phq9_3",
    category: "phq9",
    text: "Проблемы с засыпанием, беспокойным сном или слишком долгим сном?",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_3_0", label: "Совсем не испытывал", value: 0 },
      { id: "phq9_3_1", label: "Несколько дней", value: 1 },
      { id: "phq9_3_2", label: "Больше половины времени", value: 2 },
      { id: "phq9_3_3", label: "Почти каждый день", value: 3 },
    ],
  },
  {
    id: "phq9_4",
    category: "phq9",
    text: "Чувство усталости или отсутствие энергии?",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_4_0", label: "Совсем не испытывал", value: 0 },
      { id: "phq9_4_1", label: "Несколько дней", value: 1 },
      { id: "phq9_4_2", label: "Больше половины времени", value: 2 },
      { id: "phq9_4_3", label: "Почти каждый день", value: 3 },
    ],
  },
  {
    id: "phq9_5",
    category: "phq9",
    text: "Плохой аппетит или переедание?",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_5_0", label: "Совсем не испытывал", value: 0 },
      { id: "phq9_5_1", label: "Несколько дней", value: 1 },
      { id: "phq9_5_2", label: "Больше половины времени", value: 2 },
      { id: "phq9_5_3", label: "Почти каждый день", value: 3 },
    ],
  },
  {
    id: "phq9_6",
    category: "phq9",
    text: "Плохое мнение о себе — ощущение, что вы неудачник или подвели себя или свою семью?",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_6_0", label: "Совсем не испытывал", value: 0 },
      { id: "phq9_6_1", label: "Несколько дней", value: 1 },
      { id: "phq9_6_2", label: "Больше половины времени", value: 2 },
      { id: "phq9_6_3", label: "Почти каждый день", value: 3 },
    ],
  },
  {
    id: "phq9_7",
    category: "phq9",
    text: "Проблемы с концентрацией внимания, например, при чтении газеты или просмотре телевизора?",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_7_0", label: "Совсем не испытывал", value: 0 },
      { id: "phq9_7_1", label: "Несколько дней", value: 1 },
      { id: "phq9_7_2", label: "Больше половины времени", value: 2 },
      { id: "phq9_7_3", label: "Почти каждый день", value: 3 },
    ],
  },
  {
    id: "phq9_8",
    category: "phq9",
    text: "Движения или речь настолько медленны, что окружающие могут это заметить? Или наоборот — вы настолько беспокойны или нервозны, что двигаетесь больше обычного?",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_8_0", label: "Совсем не испытывал", value: 0 },
      { id: "phq9_8_1", label: "Несколько дней", value: 1 },
      { id: "phq9_8_2", label: "Больше половины времени", value: 2 },
      { id: "phq9_8_3", label: "Почти каждый день", value: 3 },
    ],
  },
  {
    id: "phq9_9",
    category: "phq9",
    text: "Мысли о том, что вам лучше умереть, или о причинении себе какого-либо вреда?",
    type: "single-choice",
    required: true,
    options: [
      { id: "phq9_9_0", label: "Совсем не испытывал", value: 0 },
      { id: "phq9_9_1", label: "Несколько дней", value: 1 },
      { id: "phq9_9_2", label: "Больше половины времени", value: 2 },
      { id: "phq9_9_3", label: "Почти каждый день", value: 3 },
    ],
  },
];

const gad7Questions: Question[] = [
  {
    id: "gad7_1",
    category: "gad7",
    text: "Как часто вы чувствовали нервозность, тревожность или были на взводе за последние 2 недели?",
    type: "single-choice",
    required: true,
    options: [
      { id: "gad7_1_0", label: "Совсем не испытывал", value: 0 },
      { id: "gad7_1_1", label: "Несколько дней", value: 1 },
      { id: "gad7_1_2", label: "Больше половины времени", value: 2 },
      { id: "gad7_1_3", label: "Почти каждый день", value: 3 },
    ],
  },
  {
    id: "gad7_2",
    category: "gad7",
    text: "Как часто вы не могли перестать беспокоиться или контролировать свое беспокойство?",
    type: "single-choice",
    required: true,
    options: [
      { id: "gad7_2_0", label: "Совсем не испытывал", value: 0 },
      { id: "gad7_2_1", label: "Несколько дней", value: 1 },
      { id: "gad7_2_2", label: "Больше половины времени", value: 2 },
      { id: "gad7_2_3", label: "Почти каждый день", value: 3 },
    ],
  },
  {
    id: "gad7_3",
    category: "gad7",
    text: "Как часто вы слишком много беспокоились о разных вещах?",
    type: "single-choice",
    required: true,
    options: [
      { id: "gad7_3_0", label: "Совсем не испытывал", value: 0 },
      { id: "gad7_3_1", label: "Несколько дней", value: 1 },
      { id: "gad7_3_2", label: "Больше половины времени", value: 2 },
      { id: "gad7_3_3", label: "Почти каждый день", value: 3 },
    ],
  },
  {
    id: "gad7_4",
    category: "gad7",
    text: "Как часто вам было трудно расслабиться?",
    type: "single-choice",
    required: true,
    options: [
      { id: "gad7_4_0", label: "Совсем не испытывал", value: 0 },
      { id: "gad7_4_1", label: "Несколько дней", value: 1 },
      { id: "gad7_4_2", label: "Больше половины времени", value: 2 },
      { id: "gad7_4_3", label: "Почти каждый день", value: 3 },
    ],
  },
  {
    id: "gad7_5",
    category: "gad7",
    text: "Как часто вы были настолько беспокойны, что не могли усидеть на месте?",
    type: "single-choice",
    required: true,
    options: [
      { id: "gad7_5_0", label: "Совсем не испытывал", value: 0 },
      { id: "gad7_5_1", label: "Несколько дней", value: 1 },
      { id: "gad7_5_2", label: "Больше половины времени", value: 2 },
      { id: "gad7_5_3", label: "Почти каждый день", value: 3 },
    ],
  },
  {
    id: "gad7_6",
    category: "gad7",
    text: "Как часто вы становились легко раздражительным или сердитым?",
    type: "single-choice",
    required: true,
    options: [
      { id: "gad7_6_0", label: "Совсем не испытывал", value: 0 },
      { id: "gad7_6_1", label: "Несколько дней", value: 1 },
      { id: "gad7_6_2", label: "Больше половины времени", value: 2 },
      { id: "gad7_6_3", label: "Почти каждый день", value: 3 },
    ],
  },
  {
    id: "gad7_7",
    category: "gad7",
    text: "Как часто вы чувствовали страх, как будто должно произойти что-то ужасное?",
    type: "single-choice",
    required: true,
    options: [
      { id: "gad7_7_0", label: "Совсем не испытывал", value: 0 },
      { id: "gad7_7_1", label: "Несколько дней", value: 1 },
      { id: "gad7_7_2", label: "Больше половины времени", value: 2 },
      { id: "gad7_7_3", label: "Почти каждый день", value: 3 },
    ],
  },
];

const burnoutQuestions: Question[] = [
  {
    id: "burnout_1",
    category: "burnout",
    text: "Как часто вы чувствуете эмоциональное истощение от учёбы?",
    type: "single-choice",
    required: true,
    options: [
      { id: "burnout_1_1", label: "Никогда", value: 1 },
      { id: "burnout_1_2", label: "Редко", value: 2 },
      { id: "burnout_1_3", label: "Иногда", value: 3 },
      { id: "burnout_1_4", label: "Часто", value: 4 },
      { id: "burnout_1_5", label: "Всегда", value: 5 },
    ],
  },
  {
    id: "burnout_2",
    category: "burnout",
    text: "Чувствуете ли вы, что учёба потеряла для вас смысл?",
    type: "single-choice",
    required: true,
    options: [
      { id: "burnout_2_1", label: "Нет, всё в порядке", value: 1 },
      { id: "burnout_2_2", label: "Иногда возникают сомнения", value: 2 },
      { id: "burnout_2_3", label: "Часто задумываюсь об этом", value: 3 },
      { id: "burnout_2_4", label: "Почти не вижу смысла", value: 4 },
      { id: "burnout_2_5", label: "Полностью потерял мотивацию", value: 5 },
    ],
  },
  {
    id: "burnout_3",
    category: "burnout",
    text: "Как часто у вас бывает ощущение, что сил совсем не осталось?",
    type: "single-choice",
    required: true,
    options: [
      { id: "burnout_3_1", label: "Никогда", value: 1 },
      { id: "burnout_3_2", label: "Редко", value: 2 },
      { id: "burnout_3_3", label: "Иногда", value: 3 },
      { id: "burnout_3_4", label: "Часто", value: 4 },
      { id: "burnout_3_5", label: "Постоянно", value: 5 },
    ],
  },
];

const socialMediaQuestions: Question[] = [
  {
    id: "social_1",
    category: "social_media",
    text: "Сколько часов в день вы проводите в социальных сетях?",
    type: "single-choice",
    required: true,
    options: [
      { id: "social_1_1", label: "Меньше 1 часа", value: 1 },
      { id: "social_1_2", label: "1-2 часа", value: 2 },
      { id: "social_1_3", label: "3-4 часа", value: 3 },
      { id: "social_1_4", label: "5-6 часов", value: 4 },
      { id: "social_1_5", label: "Больше 6 часов", value: 5 },
    ],
  },
  {
    id: "social_2",
    category: "social_media",
    text: "Как часто вы сравниваете свою жизнь с жизнью других людей в соцсетях?",
    type: "single-choice",
    required: true,
    options: [
      { id: "social_2_1", label: "Никогда", value: 1 },
      { id: "social_2_2", label: "Редко", value: 2 },
      { id: "social_2_3", label: "Иногда", value: 3 },
      { id: "social_2_4", label: "Часто", value: 4 },
      { id: "social_2_5", label: "Постоянно", value: 5 },
    ],
  },
  {
    id: "social_3",
    category: "social_media",
    text: "Испытываете ли вы FOMO (страх упустить что-то важное), когда не проверяете соцсети?",
    type: "single-choice",
    required: true,
    options: [
      { id: "social_3_1", label: "Нет, совсем не испытываю", value: 1 },
      { id: "social_3_2", label: "Иногда немного беспокоюсь", value: 2 },
      { id: "social_3_3", label: "Да, часто беспокоюсь", value: 3 },
      { id: "social_3_4", label: "Очень сильно беспокоюсь", value: 4 },
      { id: "social_3_5", label: "Не могу без соцсетей", value: 5 },
    ],
  },
];

const examStressQuestions: Question[] = [
  {
    id: "exam_1",
    category: "exam_stress",
    text: "Насколько сильный стресс вы испытываете в связи с подготовкой к ЕНТ/экзаменам?",
    type: "single-choice",
    required: true,
    options: [
      { id: "exam_1_1", label: "Минимальный", value: 1 },
      { id: "exam_1_2", label: "Умеренный", value: 2 },
      { id: "exam_1_3", label: "Значительный", value: 3 },
      { id: "exam_1_4", label: "Очень высокий", value: 4 },
      { id: "exam_1_5", label: "Критический", value: 5 },
    ],
  },
  {
    id: "exam_2",
    category: "exam_stress",
    text: "Как часто у вас бывают проблемы со сном из-за мыслей об экзаменах?",
    type: "single-choice",
    required: true,
    options: [
      { id: "exam_2_1", label: "Никогда", value: 1 },
      { id: "exam_2_2", label: "Редко", value: 2 },
      { id: "exam_2_3", label: "Иногда", value: 3 },
      { id: "exam_2_4", label: "Часто", value: 4 },
      { id: "exam_2_5", label: "Почти каждую ночь", value: 5 },
    ],
  },
];

const careerQuestions: Question[] = [
  {
    id: "career_1",
    category: "career",
    text: "Выбрали ли вы будущую профессию?",
    type: "single-choice",
    required: true,
    options: [
      { id: "career_1_1", label: "Да, полностью уверен", value: 1 },
      { id: "career_1_2", label: "Да, но есть сомнения", value: 2 },
      { id: "career_1_3", label: "Есть несколько вариантов", value: 3 },
      { id: "career_1_4", label: "Пока не определился", value: 4 },
      { id: "career_1_5", label: "Совсем не знаю", value: 5 },
    ],
  },
  {
    id: "career_2",
    category: "career",
    text: "Насколько вы чувствуете давление со стороны семьи в выборе профессии?",
    type: "single-choice",
    required: true,
    options: [
      { id: "career_2_1", label: "Совсем не чувствую", value: 1 },
      { id: "career_2_2", label: "Немного", value: 2 },
      { id: "career_2_3", label: "Умеренно", value: 3 },
      { id: "career_2_4", label: "Сильно", value: 4 },
      { id: "career_2_5", label: "Очень сильное давление", value: 5 },
    ],
  },
];

const familyQuestions: Question[] = [
  {
    id: "family_1",
    category: "family",
    text: "Как бы вы оценили отношения с родителями?",
    type: "single-choice",
    required: true,
    options: [
      { id: "family_1_1", label: "Отличные", value: 1 },
      { id: "family_1_2", label: "Хорошие", value: 2 },
      { id: "family_1_3", label: "Нормальные", value: 3 },
      { id: "family_1_4", label: "Напряжённые", value: 4 },
      { id: "family_1_5", label: "Очень плохие", value: 5 },
    ],
  },
  {
    id: "family_2",
    category: "family",
    text: "Чувствуете ли вы поддержку от семьи?",
    type: "single-choice",
    required: true,
    options: [
      { id: "family_2_1", label: "Да, всегда", value: 1 },
      { id: "family_2_2", label: "Чаще да", value: 2 },
      { id: "family_2_3", label: "Иногда", value: 3 },
      { id: "family_2_4", label: "Редко", value: 4 },
      { id: "family_2_5", label: "Нет, совсем не чувствую", value: 5 },
    ],
  },
];

const openQuestions: Question[] = [
  {
    id: "open_1",
    category: "open",
    text: "Что больше всего беспокоит вас в жизни прямо сейчас?",
    type: "text",
    required: false,
    placeholder: "Напишите здесь...",
  },
  {
    id: "open_2",
    category: "open",
    text: "Есть ли у вас хобби или занятия, которые помогают вам расслабиться?",
    type: "text",
    required: false,
    placeholder: "Напишите здесь...",
  },
  {
    id: "open_3",
    category: "open",
    text: "Что бы вы хотели изменить в своей жизни?",
    type: "text",
    required: false,
    placeholder: "Напишите здесь...",
  },
];

export const comprehensiveSurvey: Survey = {
  id: "comprehensive",
  title: "Комплексный психологический опрос",
  description: "Подробная оценка вашего психологического состояния, включая PHQ-9, GAD-7 и другие шкалы",
  type: "comprehensive",
  estimatedMinutes: 25,
  totalQuestions: 35,
  questions: [
    ...phq9Questions,
    ...gad7Questions,
    ...burnoutQuestions,
    ...socialMediaQuestions,
    ...examStressQuestions,
    ...careerQuestions,
    ...familyQuestions,
    ...openQuestions,
  ],
};

export const quickSurvey: Survey = {
  id: "quick",
  title: "Быстрая проверка самочувствия",
  description: "Краткий опрос для оценки текущего состояния",
  type: "quick",
  estimatedMinutes: 5,
  totalQuestions: 10,
  questions: [
    phq9Questions[0],
    phq9Questions[1],
    gad7Questions[0],
    gad7Questions[1],
    burnoutQuestions[0],
    socialMediaQuestions[0],
    examStressQuestions[0],
    familyQuestions[0],
    openQuestions[0],
    openQuestions[2],
  ],
};

export const allSurveys: Survey[] = [quickSurvey, comprehensiveSurvey];
