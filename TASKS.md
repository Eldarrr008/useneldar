# План разработки: Psychology Analysis System for Students

## 🎯 Приоритет 1: Критически важные функции (32 часа)

### 1.1 Система многошагового опроса (12 часов)
**Приоритет:** HIGH  
**Трудозатраты:** 12 часов

- [x] Создать типы данных для опросов (Survey, Question, Answer) - 1ч
- [x] Разработать компонент QuestionCard с кликабельными карточками ответов - 2ч
- [x] Имплементировать ProgressBar с процентами и номером вопроса - 1ч
- [x] Добавить навигацию Previous/Next с валидацией - 1ч
- [x] Автосохранение прогресса в localStorage - 2ч
- [x] Модальное окно подтверждения при выходе - 1ч
- [x] Финальная страница с кнопкой Submit и confirmation - 1ч
- [x] Создать surveyQuestions.ts с PHQ-9, GAD-7 и остальными вопросами - 3ч

**Файлы:**
- `src/types/survey.ts`
- `src/pages/student/Survey.tsx`
- `src/components/survey/QuestionCard.tsx`
- `src/components/survey/ProgressBar.tsx`
- `src/data/surveyQuestions.ts`

---

### 1.2 AI-анализ результатов (10 часов)
**Приоритет:** HIGH  
**Трудозатраты:** 10 часов

- [x] Создать логику подсчёта PHQ-9 score (0-27) - 2ч
- [x] Создать логику подсчёта GAD-7 score (0-21) - 2ч
- [x] Имплементировать алгоритм оценки общего риска (LOW/MEDIUM/HIGH/CRITICAL) - 2ч
- [x] Извлечение ключевых слов из открытых ответов (keyword extraction) - 2ч
- [x] Генератор персонализированных рекомендаций на основе scores - 2ч

**Файлы:**
- `src/lib/surveyLogic.ts`
- `src/lib/aiSimulator.ts`
- `src/types/analysis.ts`

---

### 1.3 Страница результатов с визуализацией (10 часов)
**Приоритет:** HIGH  
**Трудозатраты:** 10 часов

- [x] Дизайн страницы Results с цветовыми badge (LOW/MEDIUM/HIGH/CRITICAL) - 2ч
- [x] Визуализация PHQ-9 и GAD-7 scores (Recharts: bar/radial chart) - 3ч
- [x] Секция "Ключевые проблемы" с извлечёнными темами - 2ч
- [x] Список AI-рекомендаций с иконками - 2ч
- [x] Кнопки "Поговорить с ИИ" и "Записаться к психологу" - 1ч

**Файлы:**
- `src/pages/student/Results.tsx`
- `src/components/results/RiskBadge.tsx`
- `src/components/results/ScoreChart.tsx`

---

## 🔥 Приоритет 2: Важные функции (28 часов)

### 2.1 Расширенный AI-чатбот (8 часов)
**Приоритет:** MEDIUM-HIGH  
**Трудозатраты:** 8 часов

- [x] Плавающая кнопка FloatingChatButton (fixed bottom-right) - 1ч
- [x] Полноэкранный чат с стилями WhatsApp - 2ч
- [x] Детекция кризисных ключевых слов (суицид, не хочу жить и т.д.) - 2ч
- [x] Alert для психолога при обнаружении кризиса - 1ч
- [x] История сообщений с таймстампами - 1ч
- [x] Typing indicator (три точки анимация) - 1ч

**Файлы:**
- `src/components/chat/FloatingChat.tsx`
- `src/components/chat/FloatingChatButton.tsx`
- `src/lib/crisisDetection.ts`

---

### 2.2 Панель психолога (12 часов)
**Приоритет:** MEDIUM-HIGH  
**Трудозатраты:** 12 часов

- [x] Dashboard с обзорной статистикой класса (pie chart, counts) - 3ч
- [x] Таблица учеников с сортировкой и фильтрами - 3ч
- [x] Детальный профиль студента с временной линией риска - 4ч
- [x] Секция "Добавить заметку" с сохранением - 1ч
- [x] Генерация PDF-отчёта (react-to-pdf или jsPDF) - 1ч

**Файлы:**
- `src/pages/psychologist/Dashboard.tsx`
- `src/pages/psychologist/StudentProfile.tsx`
- `src/components/psychologist/StudentTable.tsx`
- `src/components/psychologist/RiskTimeline.tsx`
- `src/components/psychologist/NoteSection.tsx`
- `src/lib/pdfGenerator.ts`

---

### 2.3 Alerts система для психолога (8 часов)
**Приоритет:** MEDIUM  
**Трудозатраты:** 8 часов

- [ ] Секция "Срочные случаи" на дашборде психолога - 2ч
- [ ] Красные/жёлтые алерты с уровнем риска - 2ч
- [ ] Уведомления при новом кризисном сообщении - 2ч
- [ ] Quick action buttons (позвонить, записать на встречу) - 2ч

**Файлы:**
- `src/components/psychologist/AlertsSection.tsx`
- `src/components/psychologist/AlertCard.tsx`

---

## ⭐ Приоритет 3: Дополнительные функции (24 часа)

### 3.1 Админ-панель (12 часов)
**Приоритет:** MEDIUM  
**Трудозатраты:** 12 часов

- [ ] Dashboard с системной статистикой - 2ч
- [ ] User management (CRUD таблица) - 3ч
- [ ] Drag-and-drop конструктор опросов (react-beautiful-dnd) - 5ч
- [ ] Настройки системы (Settings page) - 2ч

**Файлы:**
- `src/pages/admin/Dashboard.tsx`
- `src/pages/admin/UserManagement.tsx`
- `src/pages/admin/SurveyBuilder.tsx`
- `src/pages/admin/Settings.tsx`
- `src/components/admin/UserTable.tsx`

---

### 3.2 Email верификация (mock) (6 часов)
**Приоритет:** LOW-MEDIUM  
**Трудозатраты:** 6 часов

- [ ] Mock flow: отправка письма при регистрации - 2ч
- [ ] Страница верификации с токеном - 2ч
- [ ] Повторная отправка письма - 1ч
- [ ] Toast уведомления об успехе/ошибке - 1ч

**Файлы:**
- `src/pages/VerifyEmail.tsx`
- `src/lib/emailService.ts` (mock)

---

### 3.3 Улучшения UI/UX (6 часов)
**Приоритет:** LOW  
**Трудозатраты:** 6 часов

- [ ] Анимации переходов между вопросами (framer-motion) - 2ч
- [ ] Skeleton loaders для загрузки данных - 1ч
- [ ] Dark mode toggle - 1ч
- [ ] Адаптация под мобильные (mobile-first refinement) - 2ч

---

## 🧪 Тестирование и качество (12 часов)

### 4.1 Unit тесты (8 часов)
**Приоритет:** MEDIUM  
**Трудозатраты:** 8 часов

- [x] Тесты для surveyLogic (PHQ-9, GAD-7 scoring) - 3ч
- [x] Тесты для aiSimulator (keyword extraction, recommendations) - 3ч
- [ ] Тесты для crisisDetection - 2ч

**Файлы:**
- `src/__tests__/surveyLogic.test.ts`
- `src/__tests__/aiSimulator.test.ts`
- `src/__tests__/crisisDetection.test.ts`

---

### 4.2 Integration тесты (4 часа)
**Приоритет:** LOW  
**Трудозатраты:** 4 часа

- [ ] Тесты для Survey flow (начало → завершение) - 2ч
- [ ] Тесты для Auth flow - 2ч

---

## 📊 Итоговая оценка

**Всего:** ~96 часов  
**Приоритет 1 (критично):** 32 часа  
**Приоритет 2 (важно):** 28 часов  
**Приоритет 3 (дополнительно):** 24 часа  
**Тестирование:** 12 часов

---

## 🚀 Рекомендуемая последовательность разработки

**Спринт 1 (неделя 1):** Приоритет 1.1 + 1.2 (система опросов + AI-анализ)  
**Спринт 2 (неделя 2):** Приоритет 1.3 + 2.1 (результаты + чатбот)  
**Спринт 3 (неделя 3):** Приоритет 2.2 (панель психолога)  
**Спринт 4 (неделя 4):** Приоритет 2.3 + 3.1 (alerts + админка)  
**Спринт 5 (неделя 5):** Приоритет 3.2, 3.3 + тестирование

---

## 📝 Примечания

- Используйте Mock API на начальном этапе (mockServer.ts)
- Все тексты интерфейса на русском языке
- Следуйте дизайн-системе (Tailwind semantic tokens)
- Mobile-first подход обязателен
- Придерживайтесь TypeScript strict mode
