import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Clock, FileText, CheckCircle } from "lucide-react";

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

  // Check for classroom code in URL
  const classroomCode = searchParams.get("code");

  useEffect(() => {
    // Auto-select survey type if specified in URL
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
      // Submit survey
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

      // Convert answers to Answer format
      const answerArray: Answer[] = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
      }));

      // Calculate scores
      const phq9 = calculatePHQ9Score(answerArray);
      const gad7 = calculateGAD7Score(answerArray);
      const pss = calculatePSS10Score(answerArray);
      const burnout = calculateBurnoutScore(answerArray);
      const riskLevel = calculateOverallRisk(phq9, gad7, pss || undefined, burnout || undefined, answerArray);

      // Insert survey response
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

      // Update student data
      await supabase
        .from("student_data")
        .update({
          risk_level: riskLevel,
          last_survey_date: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      // If classroom code provided, join classroom
      if (classroomCode) {
        const { data: classroom } = await supabase
          .from("classrooms")
          .select("id")
          .eq("join_code", classroomCode.toUpperCase())
          .eq("is_active", true)
          .single();

        if (classroom) {
          await supabase.from("classroom_members").upsert({
            classroom_id: classroom.id,
            student_id: user.id,
          }, { onConflict: "classroom_id,student_id" });

          await supabase
            .from("student_data")
            .update({ classroom_id: classroom.id })
            .eq("user_id", user.id);
        }
      }

      setResponseId(data.id);
      setMode("completed");

      toast({
        title: "Опрос завершён",
        description: "Ваши ответы сохранены. Переход к результатам...",
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
  };

  // Survey Selection Screen
  if (mode === "select") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto flex items-center gap-4 px-4 py-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Психологическая диагностика</h1>
              <p className="text-sm text-muted-foreground">Выберите тип тестирования</p>
            </div>
          </div>
        </header>

        <main className="container mx-auto max-w-2xl p-4 py-8 space-y-6">
          {classroomCode && (
            <Card className="border-primary bg-primary/5">
              <CardContent className="pt-4">
                <p className="text-sm text-center">
                  🎓 Вы проходите тестирование по коду класса: <strong>{classroomCode}</strong>
                </p>
              </CardContent>
            </Card>
          )}

          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleSelectSurvey(quickSurvey)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{quickSurvey.title}</CardTitle>
                  <CardDescription className="mt-2">{quickSurvey.description}</CardDescription>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>~{quickSurvey.estimatedMinutes} мин</span>
                </div>
                <div>{quickSurvey.totalQuestions} вопросов</div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">PHQ-9</span>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">GAD-7</span>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleSelectSurvey(comprehensiveSurvey)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{comprehensiveSurvey.title}</CardTitle>
                  <CardDescription className="mt-2">{comprehensiveSurvey.description}</CardDescription>
                </div>
                <FileText className="h-8 w-8 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>~{comprehensiveSurvey.estimatedMinutes} мин</span>
                </div>
                <div>{comprehensiveSurvey.totalQuestions} вопросов</div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">PHQ-9</span>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">GAD-7</span>
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">PSS-10</span>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Выгорание</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground text-center">
                ℹ️ Все методики являются научно валидированными инструментами психодиагностики.
                Ваши ответы конфиденциальны и используются только для оценки состояния.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Completed Screen
  if (mode === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl">Тестирование завершено!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Спасибо за ваши ответы. Теперь вы можете посмотреть результаты анализа.
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => navigate(`/results?id=${responseId}`)} 
                className="w-full"
              >
                Посмотреть результаты
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/")} 
                className="w-full"
              >
                Вернуться на главную
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Survey Screen
  if (!selectedSurvey) return null;

  const currentQuestion = selectedSurvey.questions[currentQuestionIndex];
  const totalQuestions = selectedSurvey.questions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              if (currentQuestionIndex === 0) {
                setMode("select");
                setSelectedSurvey(null);
              } else {
                handlePrevious();
              }
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{selectedSurvey.title}</h1>
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

        <div className="mt-8 flex justify-between">
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
              (currentQuestion.required && answers[currentQuestion.id] === undefined) || loading
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

export default SurveyPage;
