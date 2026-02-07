import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Loader2, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Users,
  BarChart3,
  RefreshCw
} from "lucide-react";

interface ClassroomAIAnalysisProps {
  classroomId: string;
  classroomName: string;
}

interface AnalysisResult {
  analysis: {
    summary: string;
    riskDistribution: {
      low: number;
      moderate: number;
      high: number;
      critical: number;
      noData: number;
    };
    trends: string[];
    concerns: string[];
    recommendations: string[];
    priorityStudents: string[];
  };
  classroomName: string;
  totalStudents: number;
  completedSurveys: number;
  averageScores: {
    phq9: string;
    gad7: string;
  };
}

export function ClassroomAIAnalysis({ classroomId, classroomName }: ClassroomAIAnalysisProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ variant: "destructive", title: "Требуется авторизация" });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-classroom`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ classroomId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка анализа");
      }

      const data = await response.json();
      
      if (data.error === "No students in classroom") {
        toast({ 
          variant: "destructive", 
          title: "В группе нет учащихся",
          description: "Добавьте учащихся для проведения анализа"
        });
        return;
      }

      setResult(data);
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        variant: "destructive",
        title: "Ошибка анализа",
        description: error.message || "Не удалось выполнить AI-анализ",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !result) {
      runAnalysis();
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low": return "bg-green-500";
      case "moderate": return "bg-yellow-500";
      case "high": return "bg-orange-500";
      case "critical": return "bg-red-500";
      default: return "bg-muted";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Brain className="h-4 w-4" />
          AI-анализ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-анализ класса: {classroomName}
          </DialogTitle>
          <DialogDescription>
            Автоматический анализ результатов диагностики с рекомендациями
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Анализируем данные класса...</p>
            <p className="text-xs text-muted-foreground mt-1">Это может занять несколько секунд</p>
          </div>
        ) : result ? (
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="border">
                  <CardContent className="pt-4 pb-3 text-center">
                    <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <div className="text-2xl font-bold">{result.totalStudents}</div>
                    <p className="text-xs text-muted-foreground">учащихся</p>
                  </CardContent>
                </Card>
                <Card className="border">
                  <CardContent className="pt-4 pb-3 text-center">
                    <BarChart3 className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <div className="text-2xl font-bold">{result.completedSurveys}</div>
                    <p className="text-xs text-muted-foreground">прошли тест</p>
                  </CardContent>
                </Card>
                <Card className="border">
                  <CardContent className="pt-4 pb-3 text-center">
                    <TrendingUp className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <div className="text-lg font-bold">
                      {result.averageScores.phq9}/{result.averageScores.gad7}
                    </div>
                    <p className="text-xs text-muted-foreground">PHQ/GAD сред.</p>
                  </CardContent>
                </Card>
              </div>

              {/* Risk Distribution */}
              <Card className="border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Распределение по уровню риска</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-1 h-4 rounded-full overflow-hidden bg-muted">
                    {result.analysis.riskDistribution.low > 0 && (
                      <div 
                        className={`${getRiskColor("low")} transition-all`}
                        style={{ width: `${(result.analysis.riskDistribution.low / result.totalStudents) * 100}%` }}
                      />
                    )}
                    {result.analysis.riskDistribution.moderate > 0 && (
                      <div 
                        className={`${getRiskColor("moderate")} transition-all`}
                        style={{ width: `${(result.analysis.riskDistribution.moderate / result.totalStudents) * 100}%` }}
                      />
                    )}
                    {result.analysis.riskDistribution.high > 0 && (
                      <div 
                        className={`${getRiskColor("high")} transition-all`}
                        style={{ width: `${(result.analysis.riskDistribution.high / result.totalStudents) * 100}%` }}
                      />
                    )}
                    {result.analysis.riskDistribution.critical > 0 && (
                      <div 
                        className={`${getRiskColor("critical")} transition-all`}
                        style={{ width: `${(result.analysis.riskDistribution.critical / result.totalStudents) * 100}%` }}
                      />
                    )}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Низкий: {result.analysis.riskDistribution.low}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      Умеренный: {result.analysis.riskDistribution.moderate}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      Высокий: {result.analysis.riskDistribution.high}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Критический: {result.analysis.riskDistribution.critical}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className="border bg-primary/5">
                <CardContent className="pt-4">
                  <p className="text-sm leading-relaxed">{result.analysis.summary}</p>
                </CardContent>
              </Card>

              {/* Trends */}
              {result.analysis.trends.length > 0 && (
                <Card className="border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      Выявленные тренды
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.analysis.trends.map((trend, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <Badge variant="secondary" className="mt-0.5 shrink-0">{i + 1}</Badge>
                          <span>{trend}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Concerns */}
              {result.analysis.concerns.length > 0 && (
                <Card className="border border-orange-200 dark:border-orange-800/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Области для внимания
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.analysis.concerns.map((concern, i) => (
                        <li key={i} className="text-sm flex items-start gap-2 text-orange-700 dark:text-orange-400">
                          <span>•</span>
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              <Card className="border border-green-200 dark:border-green-800/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-green-500" />
                    Рекомендации
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.analysis.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Priority Students */}
              {result.analysis.priorityStudents.length > 0 && (
                <Card className="border border-red-200 dark:border-red-800/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4 text-red-500" />
                      Приоритетное внимание
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.analysis.priorityStudents.map((student, i) => (
                        <li key={i} className="text-sm text-red-700 dark:text-red-400">
                          {student}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Refresh button */}
              <div className="flex justify-center pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={runAnalysis}
                  disabled={loading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Обновить анализ
                </Button>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Нажмите для запуска анализа</p>
            <Button onClick={runAnalysis} className="mt-4">
              Запустить AI-анализ
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
