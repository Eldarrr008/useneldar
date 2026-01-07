import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MessageCircle, AlertTriangle, CheckCircle, Info, Loader2 } from "lucide-react";
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

interface SurveyResult {
  phq9: ScaleResult;
  gad7: ScaleResult;
  pss10?: ScaleResult;
  burnout?: ScaleResult;
  overallRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendations: string[];
}

const riskColors = {
  LOW: "bg-green-100 text-green-800 border-green-300",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-300",
  HIGH: "bg-orange-100 text-orange-800 border-orange-300",
  CRITICAL: "bg-red-100 text-red-800 border-red-300",
};

const riskLabels = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
  CRITICAL: "Критический",
};

const riskIcons = {
  LOW: CheckCircle,
  MEDIUM: Info,
  HIGH: AlertTriangle,
  CRITICAL: AlertTriangle,
};

function ScaleCard({ title, result, color }: { title: string; result: ScaleResult; color: string }) {
  const percentage = (result.score / result.maxScore) * 100;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge 
            variant="outline" 
            className={riskColors[result.riskLevel]}
          >
            {riskLabels[result.riskLevel]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Баллы</span>
          <span className="font-medium">{result.score} / {result.maxScore}</span>
        </div>
        <Progress value={percentage} className={color} />
        <p className="text-sm text-muted-foreground">{result.description}</p>
      </CardContent>
    </Card>
  );
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
      const pssScore = calculatePSS10Score(answers);
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
      });

      // Auto-fetch AI analysis if available
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

      // Save to database
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Card className="max-w-md text-center p-6">
          <p className="text-muted-foreground">Результаты не найдены</p>
          <Button onClick={() => navigate("/survey")} className="mt-4">
            Пройти опрос
          </Button>
        </Card>
      </div>
    );
  }

  const RiskIcon = riskIcons[result.overallRisk];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Результаты диагностики</h1>
            <p className="text-sm text-muted-foreground">Анализ психологического состояния</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl p-4 py-8 space-y-6">
        {/* Overall Risk Card */}
        <Card className={`border-2 ${riskColors[result.overallRisk]}`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <RiskIcon className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl">
                  Общий уровень риска: {riskLabels[result.overallRisk]}
                </CardTitle>
                <CardDescription>
                  На основе стандартизированных психодиагностических методик
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Scale Results */}
        <div className="grid gap-4 md:grid-cols-2">
          <ScaleCard 
            title="Депрессия (PHQ-9)" 
            result={result.phq9} 
            color="bg-blue-500"
          />
          <ScaleCard 
            title="Тревожность (GAD-7)" 
            result={result.gad7} 
            color="bg-purple-500"
          />
          {result.pss10 && (
            <ScaleCard 
              title="Стресс (PSS-10)" 
              result={result.pss10} 
              color="bg-orange-500"
            />
          )}
          {result.burnout && (
            <ScaleCard 
              title="Учебное выгорание" 
              result={result.burnout} 
              color="bg-red-500"
            />
          )}
        </div>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Рекомендации</CardTitle>
            <CardDescription>
              На основе анализа ваших результатов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>AI-анализ</CardTitle>
                <CardDescription>
                  Персонализированные рекомендации от AI-психолога
                </CardDescription>
              </div>
              {!aiAnalysis && (
                <Button onClick={getAiAnalysis} disabled={loadingAi}>
                  {loadingAi ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Анализ...
                    </>
                  ) : (
                    "Получить AI-анализ"
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          {aiAnalysis && (
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap text-sm">{aiAnalysis}</p>
              </div>
            </CardContent>
          )}
        </Card>

        <Separator />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => navigate("/")} className="flex-1">
            <MessageCircle className="mr-2 h-4 w-4" />
            Поговорить с AI-помощником
          </Button>
          <Button variant="outline" onClick={() => navigate("/survey")} className="flex-1">
            Пройти новый опрос
          </Button>
        </div>

        {/* Disclaimer */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground text-center">
              ⚠️ Данные результаты носят информационный характер и не являются медицинским диагнозом. 
              При высоком уровне риска обязательно обратитесь к квалифицированному специалисту.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
