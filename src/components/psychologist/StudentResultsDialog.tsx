import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Brain, Heart, Zap, Flame, TrendingUp, TrendingDown, Minus, Calendar, FileText, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { generateStudentPDF, calculateTrends } from "@/lib/pdfGenerator";
import { toast } from "@/hooks/use-toast";

interface StudentResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
}

interface SurveyResult {
  id: string;
  completed_at: string;
  survey_type: string;
  phq9_score: number | null;
  gad7_score: number | null;
  pss_score: number | null;
  burnout_score: number | null;
  overall_risk: string | null;
}

const riskColors: Record<string, string> = {
  LOW: "bg-green-100 text-green-700 border-green-200",
  MODERATE: "bg-yellow-100 text-yellow-700 border-yellow-200",
  HIGH: "bg-orange-100 text-orange-700 border-orange-200",
  CRITICAL: "bg-red-100 text-red-700 border-red-200",
};

const riskLabels: Record<string, string> = {
  LOW: "Низкий",
  MODERATE: "Умеренный",
  HIGH: "Высокий",
  CRITICAL: "Критический",
};

export function StudentResultsDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
}: StudentResultsDialogProps) {
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [classroomName, setClassroomName] = useState("");
  const [psychologistName, setPsychologistName] = useState("");

  useEffect(() => {
    if (open && studentId) {
      fetchResults();
      fetchAdditionalInfo();
    }
  }, [open, studentId]);

  const fetchAdditionalInfo = async () => {
    try {
      // Get classroom name
      const { data: studentData } = await supabase
        .from("student_data")
        .select("classroom_id")
        .eq("user_id", studentId)
        .maybeSingle();

      if (studentData?.classroom_id) {
        const { data: classroom } = await supabase
          .from("classrooms")
          .select("name")
          .eq("id", studentData.classroom_id)
          .maybeSingle();
        
        if (classroom) {
          setClassroomName(classroom.name);
        }
      }

      // Get psychologist name
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();
        
        if (profile) {
          setPsychologistName(profile.full_name);
        }
      }
    } catch (error) {
      console.error("Error fetching additional info:", error);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("survey_responses")
        .select("id, completed_at, survey_type, phq9_score, gad7_score, pss_score, burnout_score, overall_risk")
        .eq("user_id", studentId)
        .order("completed_at", { ascending: true });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = results.map((r) => ({
    date: new Date(r.completed_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
    PHQ9: r.phq9_score,
    GAD7: r.gad7_score,
    PSS: r.pss_score,
    Burnout: r.burnout_score,
  }));

  const latestResult = results[results.length - 1];
  const previousResult = results[results.length - 2];

  const getTrend = (current: number | null, previous: number | null) => {
    if (current === null || previous === null) return null;
    if (current < previous) return "improved";
    if (current > previous) return "worsened";
    return "same";
  };

  const renderTrendIcon = (trend: string | null) => {
    if (trend === "improved") return <TrendingDown className="h-4 w-4 text-green-600" />;
    if (trend === "worsened") return <TrendingUp className="h-4 w-4 text-red-600" />;
    if (trend === "same") return <Minus className="h-4 w-4 text-muted-foreground" />;
    return null;
  };

  const handleDownloadPDF = () => {
    if (results.length === 0) {
      toast({
        title: "Нет данных",
        description: "Нет результатов диагностик для генерации отчёта",
        variant: "destructive",
      });
      return;
    }

    try {
      const surveyData = results.map((r) => ({
        date: new Date(r.completed_at).toLocaleDateString("ru-RU"),
        type: r.survey_type,
        phq9: r.phq9_score,
        gad7: r.gad7_score,
        pss: r.pss_score,
        burnout: r.burnout_score,
        risk: r.overall_risk,
      }));

      const trends = calculateTrends(surveyData);

      generateStudentPDF({
        studentName,
        studentId,
        classroomName: classroomName || "Не указана",
        generatedDate: new Date().toLocaleDateString("ru-RU"),
        psychologistName: psychologistName || "Психолог",
        results: surveyData,
        latestRisk: latestResult?.overall_risk || "LOW",
        trends,
      });

      toast({
        title: "PDF сохранён",
        description: `Отчёт по студенту ${studentName} успешно сгенерирован`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сгенерировать PDF-отчёт",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Результаты: {studentName}
          </DialogTitle>
          <DialogDescription>
            История диагностик и динамика показателей
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Нет пройденных диагностик</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Latest Result Summary */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <Heart className="h-3 w-3 text-primary" />
                    Депрессия (PHQ-9)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{latestResult?.phq9_score ?? "—"}</span>
                    {previousResult && renderTrendIcon(getTrend(latestResult?.phq9_score, previousResult?.phq9_score))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Макс: 27</p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <Brain className="h-3 w-3 text-accent" />
                    Тревожность (GAD-7)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{latestResult?.gad7_score ?? "—"}</span>
                    {previousResult && renderTrendIcon(getTrend(latestResult?.gad7_score, previousResult?.gad7_score))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Макс: 21</p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <Zap className="h-3 w-3 text-yellow-600" />
                    Стресс (PSS-10)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{latestResult?.pss_score ?? "—"}</span>
                    {previousResult && renderTrendIcon(getTrend(latestResult?.pss_score, previousResult?.pss_score))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Макс: 40</p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <Flame className="h-3 w-3 text-destructive" />
                    Выгорание
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{latestResult?.burnout_score ?? "—"}</span>
                    {previousResult && renderTrendIcon(getTrend(latestResult?.burnout_score, previousResult?.burnout_score))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Макс: 60</p>
                </CardContent>
              </Card>
            </div>

            {/* Overall Risk */}
            {latestResult?.overall_risk && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Общий уровень риска:</span>
                <Badge variant="outline" className={riskColors[latestResult.overall_risk]}>
                  {riskLabels[latestResult.overall_risk]}
                </Badge>
              </div>
            )}

            <Separator />

            {/* Chart */}
            {results.length > 1 && (
              <div>
                <h4 className="font-medium mb-4">Динамика показателей</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }} 
                        stroke="hsl(var(--muted-foreground))" 
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        stroke="hsl(var(--muted-foreground))" 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="PHQ9" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                        name="PHQ-9"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="GAD7" 
                        stroke="hsl(var(--accent))" 
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--accent))" }}
                        name="GAD-7"
                      />
                      {chartData.some(d => d.PSS !== null) && (
                        <Line 
                          type="monotone" 
                          dataKey="PSS" 
                          stroke="hsl(48, 96%, 53%)" 
                          strokeWidth={2}
                          dot={{ fill: "hsl(48, 96%, 53%)" }}
                          name="PSS-10"
                        />
                      )}
                      {chartData.some(d => d.Burnout !== null) && (
                        <Line 
                          type="monotone" 
                          dataKey="Burnout" 
                          stroke="hsl(var(--destructive))" 
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--destructive))" }}
                          name="Выгорание"
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <Separator />

            {/* History Table */}
            <div>
              <h4 className="font-medium mb-4">История диагностик ({results.length})</h4>
              <div className="space-y-2">
                {[...results].reverse().map((result) => (
                  <div 
                    key={result.id} 
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="font-medium">
                          {new Date(result.completed_at).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          {result.survey_type === "comprehensive" ? "Комплексный" : "Экспресс"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>PHQ-9: <strong>{result.phq9_score}</strong></span>
                      <span>GAD-7: <strong>{result.gad7_score}</strong></span>
                      {result.pss_score && <span>PSS: <strong>{result.pss_score}</strong></span>}
                      {result.burnout_score && <span>Burnout: <strong>{result.burnout_score}</strong></span>}
                      {result.overall_risk && (
                        <Badge variant="outline" className={riskColors[result.overall_risk]}>
                          {riskLabels[result.overall_risk]}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button 
            variant="default" 
            onClick={handleDownloadPDF}
            disabled={results.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Скачать PDF
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
