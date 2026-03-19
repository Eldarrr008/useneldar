import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MessageCircle, 
  Loader2, 
  Brain, 
  Heart, 
  Zap, 
  Flame,
  Leaf,
  FileText,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Lightbulb
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
import { AffirmationCard } from "@/components/survey/AffirmationCard";

interface SurveyResult {
  phq9: ScaleResult;
  gad7: ScaleResult;
  pss10?: ScaleResult;
  burnout?: ScaleResult;
  overallRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendations: string[];
  completedAt?: string;
}

interface StructuredAnalysis {
  summary: string;
  detailedAnalysis: {
    depression: string;
    anxiety: string;
    stress?: string;
    burnout?: string;
  };
  keyFactors: string[];
  recommendations: string[];
  professionalHelp: boolean;
}

export default function Results() {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState<SurveyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [structuredAnalysis, setStructuredAnalysis] = useState<StructuredAnalysis | null>(null);
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
        const parsed = typeof data.ai_analysis === "string" 
          ? data.ai_analysis 
          : JSON.stringify(data.ai_analysis);
        setAiAnalysis(parsed);
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
      if (response.data.structured) {
        setStructuredAnalysis(response.data.structured);
      }

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
      <header className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-6 py-6">
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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/15 backdrop-blur">
                  <Leaf className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Результаты диагностики</h1>
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
        {/* AI Affirmation */}
        <AffirmationCard
          phq9Score={result.phq9.score}
          gad7Score={result.gad7.score}
          pssScore={result.pss10?.score}
          burnoutScore={result.burnout?.score}
          overallRisk={result.overallRisk}
        />

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

        {/* AI Analysis Section */}
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    AI-анализ
                    <Badge variant="secondary" className="text-xs font-normal">
                      Персонализированный
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Глубокий анализ с объяснением факторов
                  </CardDescription>
                </div>
              </div>
              {!aiAnalysis && (
                <Button 
                  size="sm" 
                  onClick={getAiAnalysis} 
                  disabled={loadingAi}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {loadingAi ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Анализирую...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-3 w-3" />
                      Получить анализ
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          
          {aiAnalysis && (
            <CardContent className="pt-4 space-y-4">
              {structuredAnalysis ? (
                <StructuredAnalysisView 
                  data={structuredAnalysis} 
                  hasPss={!!result.pss10}
                  hasBurnout={!!result.burnout}
                />
              ) : (
                <div className="rounded-xl bg-muted/30 p-5">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{aiAnalysis}</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        <Separator />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => navigate("/")} 
            className="flex-1 gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" />
            Консультация с AI-ассистентом
          </Button>
          <Button variant="outline" onClick={() => navigate("/survey")} className="flex-1">
            Новая диагностика
          </Button>
        </div>

        {/* How Results Are Formed */}
        <Card className="border-border/50 bg-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Как формируется результат?
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                Анализ основан исключительно на ваших ответах в анкете
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                Используется автоматизированная обработка данных по валидированным шкалам
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                Система не ставит диагнозов и не заменяет консультацию специалиста
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Важно</p>
                <p className="text-sm text-muted-foreground">
                  Результаты носят рекомендательный характер и не заменяют консультацию психолога. 
                  При необходимости обратитесь к специалисту психологической службы.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StructuredAnalysisView({ 
  data, 
  hasPss, 
  hasBurnout 
}: { 
  data: StructuredAnalysis;
  hasPss: boolean;
  hasBurnout: boolean;
}) {
  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">Краткий вывод</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{data.summary}</p>
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Детальный анализ
        </h4>
        
        <div className="grid gap-3 sm:grid-cols-2">
          <AnalysisCard 
            title="Депрессия" 
            content={data.detailedAnalysis.depression}
            icon={<Heart className="h-3.5 w-3.5" />}
            color="primary"
          />
          <AnalysisCard 
            title="Тревожность" 
            content={data.detailedAnalysis.anxiety}
            icon={<Brain className="h-3.5 w-3.5" />}
            color="accent"
          />
          {hasPss && data.detailedAnalysis.stress && (
            <AnalysisCard 
              title="Стресс" 
              content={data.detailedAnalysis.stress}
              icon={<Zap className="h-3.5 w-3.5" />}
              color="warning"
            />
          )}
          {hasBurnout && data.detailedAnalysis.burnout && (
            <AnalysisCard 
              title="Выгорание" 
              content={data.detailedAnalysis.burnout}
              icon={<Flame className="h-3.5 w-3.5" />}
              color="destructive"
            />
          )}
        </div>
      </div>

      {/* Key Factors */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-warning" />
          Ключевые факторы
        </h4>
        <div className="space-y-2">
          {data.keyFactors.map((factor, i) => (
            <div 
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {i + 1}
              </span>
              <p className="text-sm text-muted-foreground flex-1">{factor}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          Персонализированные рекомендации
        </h4>
        <div className="grid gap-2">
          {data.recommendations.map((rec, i) => (
            <div 
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20"
            >
              <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-sm">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Professional Help Warning */}
      {data.professionalHelp && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-destructive mb-1">
                Рекомендуется консультация специалиста
              </h4>
              <p className="text-sm text-muted-foreground">
                На основании результатов диагностики мы настоятельно рекомендуем обратиться к 
                квалифицированному психологу или психотерапевту для получения профессиональной помощи.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisCard({ 
  title, 
  content, 
  icon, 
  color 
}: { 
  title: string; 
  content: string; 
  icon: React.ReactNode;
  color: "primary" | "accent" | "warning" | "destructive";
}) {
  const colorClasses = {
    primary: "bg-primary/5 border-primary/20 text-primary",
    accent: "bg-accent/5 border-accent/20 text-accent",
    warning: "bg-warning/5 border-warning/20 text-warning",
    destructive: "bg-destructive/5 border-destructive/20 text-destructive",
  };

  return (
    <div className={`rounded-lg border p-3 ${colorClasses[color].split(' ').slice(0, 2).join(' ')}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={colorClasses[color].split(' ').slice(2).join(' ')}>{icon}</span>
        <h5 className="font-medium text-sm">{title}</h5>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{content}</p>
    </div>
  );
}