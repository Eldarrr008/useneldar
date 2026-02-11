import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/survey/ProgressBar";
import { QuestionCard } from "@/components/survey/QuestionCard";
import { quickSurvey, comprehensiveSurvey } from "@/data/surveyQuestions";
import {
  calculatePHQ9Score,
  calculateGAD7Score,
  calculatePSS10Score,
  calculateBurnoutScore,
  calculateOverallRisk,
} from "@/lib/surveyLogic";
import { Answer, Survey } from "@/types/survey";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Clock, 
  FileText, 
  CheckCircle, 
  Building2, 
  ClipboardList,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

type SurveyMode = "select" | "survey" | "completed";

const SurveyPage = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<SurveyMode>("select");
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [loading, setLoading] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const classroomCode = searchParams.get("code");

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "quick") {
      handleSelectSurvey(quickSurvey);
    } else if (type === "comprehensive") {
      handleSelectSurvey(comprehensiveSurvey);
    }
  }, [searchParams]);

  const handleSelectSurvey = (survey: Survey) => {
    setSelectedSurvey(survey);
    setMode("survey");
  };

  const handleAnswer = (value: number | string) => {
    if (!selectedSurvey) return;
    
    const currentQuestion = selectedSurvey.questions[currentQuestionIndex];
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = async () => {
    if (!selectedSurvey) return;

    if (currentQuestionIndex < selectedSurvey.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      await submitSurvey();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const submitSurvey = async () => {
    if (!selectedSurvey) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const answerArray: Answer[] = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
      }));

      const phq9 = calculatePHQ9Score(answerArray);
      const gad7 = calculateGAD7Score(answerArray);
      const pss = calculatePSS10Score(answerArray);
      const burnout = calculateBurnoutScore(answerArray);
      const riskLevel = calculateOverallRisk(phq9, gad7, pss || undefined, burnout || undefined, answerArray);

      const { data, error } = await supabase.from("survey_responses").insert({
        user_id: user.id,
        survey_id: selectedSurvey.id,
        survey_type: selectedSurvey.type,
        answers: JSON.parse(JSON.stringify(answerArray)),
        phq9_score: phq9,
        gad7_score: gad7,
        pss_score: pss > 0 ? pss : null,
        burnout_score: burnout > 0 ? burnout : null,
        overall_risk: riskLevel,
      }).select().single();

      if (error) throw error;

      await supabase
        .from("student_data")
        .update({
          risk_level: riskLevel,
          last_survey_date: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (classroomCode) {
        // Use secure RPC function instead of direct query to avoid RLS recursion
        await supabase.rpc("verify_and_join_classroom", {
          p_join_code: classroomCode.toUpperCase()
        });
      }

      setResponseId(data.id);
      setMode("completed");

      toast({
        title: "Диагностика завершена",
        description: "Результаты сохранены в системе",
      });

    } catch (error: any) {
      console.error("Error submitting survey:", error);
      toast({
        variant: "destructive",
        title: "Ошибка сохранения",
        description: error.message || "Не удалось сохранить результаты",
      });
    } finally {
      setLoading(false);
    }
  };

  // Survey Selection Screen
  if (mode === "select") {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-primary text-primary-foreground">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold">ZenithMind</h1>
                <p className="text-xs text-primary-foreground/80">Модуль психодиагностики</p>
              </div>
            </div>
          </div>
        </header>

        {/* Secondary Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад к панели
              </Button>
            </div>
          </div>
        </div>

        <main className="container mx-auto max-w-3xl px-6 py-8 space-y-6">
          {/* Title */}
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Выбор методики</h2>
            <p className="text-muted-foreground">
              Выберите диагностический инструмент для прохождения
            </p>
          </div>

          {classroomCode && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-3">
                <div className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Тестирование по коду группы: <strong className="font-mono">{classroomCode}</strong></span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Survey Options */}
          <div className="space-y-4">
            <Card 
              className="group cursor-pointer border transition-all hover:border-primary hover:shadow-institutional-md"
              onClick={() => handleSelectSurvey(quickSurvey)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <ClipboardList className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{quickSurvey.title}</CardTitle>
                      <CardDescription className="mt-1">{quickSurvey.description}</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>~{quickSurvey.estimatedMinutes} мин</span>
                    </div>
                    <span>{quickSurvey.totalQuestions} вопросов</span>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge variant="secondary">PHQ-9</Badge>
                    <Badge variant="secondary">GAD-7</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer border transition-all hover:border-accent hover:shadow-institutional-md"
              onClick={() => handleSelectSurvey(comprehensiveSurvey)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                      <FileText className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{comprehensiveSurvey.title}</CardTitle>
                      <CardDescription className="mt-1">{comprehensiveSurvey.description}</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>~{comprehensiveSurvey.estimatedMinutes} мин</span>
                    </div>
                    <span>{comprehensiveSurvey.totalQuestions} вопросов</span>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge variant="secondary">PHQ-9</Badge>
                    <Badge variant="secondary">GAD-7</Badge>
                    <Badge variant="secondary">PSS-10</Badge>
                    <Badge variant="secondary">Burnout</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Notice */}
          <Card className="border-muted bg-muted/30">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Все методики являются научно валидированными инструментами психодиагностики.
                    Результаты конфиденциальны и доступны только уполномоченным специалистам.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Completed Screen
  if (mode === "completed") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-primary text-primary-foreground">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold">ZenithMind</h1>
                <p className="text-xs text-primary-foreground/80">Результаты диагностики</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center p-6">
          <Card className="max-w-md w-full border shadow-institutional-md text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-xl">Диагностика завершена</CardTitle>
              <CardDescription>
                Результаты успешно сохранены в системе
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => navigate(`/results?id=${responseId}`)} 
                  className="w-full"
                >
                  Просмотреть результаты
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/dashboard")} 
                  className="w-full"
                >
                  Вернуться на главную
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Survey Screen
  if (!selectedSurvey) return null;

  const currentQuestion = selectedSurvey.questions[currentQuestionIndex];
  const totalQuestions = selectedSurvey.questions.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">{selectedSurvey.title}</h1>
              <p className="text-xs text-primary-foreground/80">
                Вопрос {currentQuestionIndex + 1} из {totalQuestions}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-3">
          <ProgressBar
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={totalQuestions}
          />
        </div>
      </div>

      <main className="container mx-auto max-w-2xl px-6 py-8">
        <div className="space-y-8">
          <QuestionCard
            question={currentQuestion}
            selectedValue={answers[currentQuestion.id]}
            onAnswer={handleAnswer}
          />

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (currentQuestionIndex === 0) {
                  setMode("select");
                  setSelectedSurvey(null);
                } else {
                  handlePrevious();
                }
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {currentQuestionIndex === 0 ? "К выбору теста" : "Назад"}
            </Button>
            <Button
              onClick={handleNext}
              disabled={
                (currentQuestion.required && answers[currentQuestion.id] === undefined) || loading
              }
            >
              {loading
                ? "Сохранение..."
                : currentQuestionIndex === totalQuestions - 1
                ? "Завершить тест"
                : "Далее"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SurveyPage;