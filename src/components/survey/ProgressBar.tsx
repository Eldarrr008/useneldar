import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
}

export function ProgressBar({ currentQuestion, totalQuestions }: ProgressBarProps) {
  const percentage = Math.round((currentQuestion / totalQuestions) * 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">
          Вопрос {currentQuestion} из {totalQuestions}
        </span>
        <span className="font-semibold text-primary">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
