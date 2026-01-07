import { Question, QuestionOption } from "@/types/survey";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  selectedValue?: number | string | string[];
  onAnswer: (value: number | string) => void;
}

export function QuestionCard({ question, selectedValue, onAnswer }: QuestionCardProps) {
  const isSelected = (optionValue: number | string) => {
    if (Array.isArray(selectedValue)) {
      return selectedValue.includes(String(optionValue));
    }
    return selectedValue === optionValue;
  };

  if (question.type === "text") {
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed">
          {question.text}
        </h2>
        <Textarea
          placeholder={question.placeholder || "Введите ваш ответ..."}
          value={(selectedValue as string) || ""}
          onChange={(e) => onAnswer(e.target.value)}
          className="min-h-[150px] text-base resize-none"
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground text-right">
          {question.required ? "Обязательный вопрос" : "Необязательный вопрос"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed">
        {question.text}
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
              <span className="text-base text-foreground">{option.label}</span>
            </div>
          </Card>
        ))}
      </div>

      {question.required && (
        <p className="text-xs text-muted-foreground">* Обязательный вопрос</p>
      )}
    </div>
  );
}
