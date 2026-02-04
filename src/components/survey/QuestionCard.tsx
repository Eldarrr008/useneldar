import { Question, QuestionOption } from "@/types/survey";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface QuestionCardProps {
  question: Question;
  selectedValue?: number | string | string[];
  onAnswer: (value: number | string) => void;
}

export function QuestionCard({ question, selectedValue, onAnswer }: QuestionCardProps) {
  const { t } = useTranslation();
  
  const isSelected = (optionValue: number | string) => {
    if (Array.isArray(selectedValue)) {
      return selectedValue.includes(String(optionValue));
    }
    return selectedValue === optionValue;
  };

  // Get translated text - use textKey if available, fallback to text
  const getQuestionText = () => {
    if (question.textKey) {
      const translated = t(question.textKey);
      // If translation key returns the key itself, fallback to text
      if (translated !== question.textKey) {
        return translated;
      }
    }
    return question.text;
  };

  // Get translated option label - use labelKey if available, fallback to label
  const getOptionLabel = (option: QuestionOption) => {
    if (option.labelKey) {
      const translated = t(option.labelKey);
      // If translation key returns the key itself, fallback to label
      if (translated !== option.labelKey) {
        return translated;
      }
    }
    return option.label;
  };

  // Get translated placeholder
  const getPlaceholder = () => {
    if (question.placeholderKey) {
      const translated = t(question.placeholderKey);
      if (translated !== question.placeholderKey) {
        return translated;
      }
    }
    return question.placeholder || t("questions.enterAnswer", "Введите ваш ответ...");
  };

  if (question.type === "text") {
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed">
          {getQuestionText()}
        </h2>
        <Textarea
          placeholder={getPlaceholder()}
          value={(selectedValue as string) || ""}
          onChange={(e) => onAnswer(e.target.value)}
          className="min-h-[150px] text-base resize-none"
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground text-right">
          {question.required 
            ? t("questions.required", "Обязательный вопрос") 
            : t("questions.optional", "Необязательный вопрос")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed">
        {getQuestionText()}
      </h2>

      <div className="grid gap-3">
        {question.options?.map((option: QuestionOption) => (
          <Card
            key={option.id}
            className={cn(
              "p-4 cursor-pointer transition-all duration-300 hover:shadow-md border-2",
              isSelected(option.value)
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-primary/50"
            )}
            onClick={() => onAnswer(option.value)}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all",
                  isSelected(option.value)
                    ? "border-primary bg-primary"
                    : "border-muted-foreground"
                )}
              >
                {isSelected(option.value) && (
                  <div className="w-full h-full rounded-full bg-primary-foreground scale-50" />
                )}
              </div>
              <span className="text-base text-foreground">{getOptionLabel(option)}</span>
            </div>
          </Card>
        ))}
      </div>

      {question.required && (
        <p className="text-xs text-muted-foreground">* {t("questions.required", "Обязательный вопрос")}</p>
      )}
    </div>
  );
}
