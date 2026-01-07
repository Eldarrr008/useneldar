import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/survey/ProgressBar";
import { QuestionCard } from "@/components/survey/QuestionCard";
import { quickSurvey } from "@/data/surveyQuestions";
import { 
  calculatePHQ9Score, 
  calculateGAD7Score, 
  calculateBurnoutScore, 
  calculateOverallRisk 
} from "@/lib/surveyLogic";
import { Answer } from "@/types/survey";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle } from "lucide-react";

const Survey = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const questions = quickSurvey.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleAnswer = (value: number | string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = async () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Submit survey
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Convert answers to Answer format for scoring
        const answerArray: Answer[] = Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          value,
        }));

        const phq9 = calculatePHQ9Score(answerArray);
        const gad7 = calculateGAD7Score(answerArray);
        const burnout = calculateBurnoutScore(answerArray);
        const riskLevel = calculateOverallRisk(phq9, gad7, burnout);

        const { error } = await supabase.from("survey_responses").insert({
          user_id: user.id,
          survey_id: `survey_${Date.now()}`,
          survey_type: "quick",
          answers: answers,
          phq9_score: phq9,
          gad7_score: gad7,
          burnout_score: burnout,
          overall_risk: riskLevel,
        });

        if (error) throw error;

        // Update student data
        await supabase
          .from("student_data")
          .update({
            risk_level: riskLevel,
            last_survey_date: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        setIsCompleted(true);
        toast({
          title: "Опрос завершён",
          description: "Спасибо за ваши ответы!",
        });
      } catch (error: any) {
        console.error("Error submitting survey:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: error.message || "Не удалось сохранить ответы",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl">Спасибо!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Ваши ответы сохранены. Наш AI-ассистент и психологи используют эту информацию для лучшей поддержки.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Вернуться к чату
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Опрос о самочувствии</h1>
            <p className="text-sm text-muted-foreground">
              Вопрос {currentQuestionIndex + 1} из {totalQuestions}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl p-4 py-8">
        <ProgressBar 
          currentQuestion={currentQuestionIndex + 1} 
          totalQuestions={totalQuestions} 
        />

        <div className="mt-8">
          <QuestionCard
            question={currentQuestion}
            selectedValue={answers[currentQuestion.id]}
            onAnswer={handleAnswer}
          />
        </div>

        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Назад
          </Button>
          <Button
            onClick={handleNext}
            disabled={
              currentQuestion.required && answers[currentQuestion.id] === undefined || loading
            }
          >
            {loading
              ? "Сохранение..."
              : currentQuestionIndex === totalQuestions - 1
              ? "Завершить"
              : "Далее"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Survey;
