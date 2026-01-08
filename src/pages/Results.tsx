import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  MessageCircle, 
  Loader2, 
  Brain, 
  Heart, 
  Zap, 
  Flame,
  Building2,
  FileText,
  Download
} from "lucide-react";
import { ScaleResult } from "@/types/survey";
import {
  calculatePHQ9Score,
  calculateGAD7Score,
  calculatePSS10Score,
  calculateBurnoutScore,
  interpretPHQ9,
  interpretGAD7,
  interpretPSS10,
  interpretBurnout,
  calculateOverallRisk,
  generateRecommendations,
} from "@/lib/surveyLogic";
import { Answer } from "@/types/survey";
import { ScaleChart } from "@/components/results/ScaleChart";
import { RiskIndicator } from "@/components/results/RiskIndicator";
import { RecommendationsList } from "@/components/results/RecommendationsList";

interface SurveyResult {
  phq9: ScaleResult;
  gad7: ScaleResult;
  pss10?: ScaleResult;
  burnout?: ScaleResult;
  overallRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendations: string[];
  completedAt?: string;
}

export default function Results() {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState<SurveyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const navigate = useNavigate();

  const responseId = searchParams.get("id");

  useEffect(() => {
    if (responseId) {
      fetchResults();
    } else {
      navigate("/survey");
    }
  }, [responseId]);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from("survey_responses")
        .select("*")
        .eq("id", responseId)
        .single();

      if (error) throw error;

      const answers: Answer[] = Array.isArray(data.answers) 
        ? (data.answers as unknown as Answer[])
        : Object.entries(data.answers as Record<string, number | string>).map(([questionId, value]) => ({
            questionId,
            value,
          }));

      const phq9Score = data.phq9_score ?? calculatePHQ9Score(answers);
      const gad7Score = data.gad7_score ?? calculateGAD7Score(answers);
      const pssScore = data.pss_score ?? calculatePSS10Score(answers);
      const burnoutScore = data.burnout_score ?? calculateBurnoutScore(answers);

      const phq9 = interpretPHQ9(phq9Score);
      const gad7 = interpretGAD7(gad7Score);
      const pss10 = pssScore > 0 ? interpretPSS10(pssScore) : undefined;
      const burnout = burnoutScore > 0 ? interpretBurnout(burnoutScore) : undefined;
      
      const overallRisk = calculateOverallRisk(phq9Score, gad7Score, pssScore || undefined, burnoutScore || undefined, answers);
      const recommendations = generateRecommendations(phq9, gad7, pss10, burnout, overallRisk);

      setResult({
        phq9,
        gad7,
        pss10,
        burnout,
        overallRisk,
        recommendations,
        completedAt: data.completed_at,
      });

      if (data.ai_analysis) {
        setAiAnalysis(typeof data.ai_analysis === "string" ? data.ai_analysis : JSON.stringify(data.ai_analysis));
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAiAnalysis = async () => {
    if (!result) return;
    
    setLoadingAi(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("analyze-results", {
        body: {
          phq9: result.phq9,
          gad7: result.gad7,
          pss10: result.pss10,
          burnout: result.burnout,
          overallRisk: result.overallRisk,
        },
      });

      if (response.error) throw response.error;
      
      setAiAnalysis(response.data.analysis);

      await supabase
        .from("survey_responses")
        .update({ ai_analysis: response.data.analysis })
        .eq("id", responseId);

    } catch (error) {
      console.error("Error getting AI analysis:", error);
    } finally {
      setLoadingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Загрузка результатов...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="max-w-md text-center p-6">
          <p className="text-muted-foreground">Результаты не найдены</p>
          <Button onClick={() => navigate("/survey")} className="mt-4">
            Пройти опрос
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate("/")}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Результаты диагностики</h1>
                  <p className="text-sm text-primary-foreground/80">
                    {result.completedAt && new Date(result.completedAt).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              className="gap-2 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate("/history")}
            >
              <FileText className="h-4 w-4" />
              История
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-6 py-8 space-y-6">
        {/* Overall Risk */}
        <RiskIndicator risk={result.overallRisk} />

        {/* Scale Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <ScaleChart 
            title="Депрессия (PHQ-9)" 
            result={result.phq9}
            color="hsl(var(--primary))"
            icon={<Heart className="h-4 w-4 text-primary" />}
          />
          <ScaleChart 
            title="Тревожность (GAD-7)" 
            result={result.gad7}
            color="hsl(var(--accent))"
            icon={<Brain className="h-4 w-4 text-accent" />}
          />
          {result.pss10 && (
            <ScaleChart 
              title="Стресс (PSS-10)" 
              result={result.pss10}
              color="hsl(var(--warning))"
              icon={<Zap className="h-4 w-4 text-warning" />}
            />
          )}
          {result.burnout && (
            <ScaleChart 
              title="Учебное выгорание" 
              result={result.burnout}
              color="hsl(var(--destructive))"
              icon={<Flame className="h-4 w-4 text-destructive" />}
            />
          )}
        </div>

        {/* Recommendations */}
        <RecommendationsList recommendations={result.recommendations} />

        {/* AI Analysis */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">AI-анализ</CardTitle>
                  <CardDescription className="text-xs">
                    Персонализированный анализ результатов
                  </CardDescription>
                </div>
              </div>
              {!aiAnalysis && (
                <Button size="sm" onClick={getAiAnalysis} disabled={loadingAi}>
                  {loadingAi ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Анализ...
                    </>
                  ) : (
                    "Получить анализ"
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          {aiAnalysis && (
            <CardContent className="pt-0">
              <div className="rounded-lg bg-muted/30 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{aiAnalysis}</p>
              </div>
            </CardContent>
          )}
        </Card>

        <Separator />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => navigate("/")} className="flex-1 gap-2">
            <MessageCircle className="h-4 w-4" />
            Консультация с AI-ассистентом
          </Button>
          <Button variant="outline" onClick={() => navigate("/survey")} className="flex-1">
            Новая диагностика
          </Button>
        </div>

        {/* Disclaimer */}
        <Card className="border-muted bg-muted/30">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground text-center">
              ⚠️ Данные результаты носят информационный характер и не являются медицинским диагнозом. 
              При высоком уровне риска обязательно обратитесь к квалифицированному специалисту психологической службы.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
