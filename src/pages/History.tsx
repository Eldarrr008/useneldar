import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  FileText, 
  Loader2, 
  Building2, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  ClipboardList
} from "lucide-react";

interface SurveyResponseItem {
  id: string;
  survey_type: string;
  phq9_score: number | null;
  gad7_score: number | null;
  pss_score: number | null;
  burnout_score: number | null;
  overall_risk: string | null;
  completed_at: string;
}

const riskConfig: Record<string, { label: string; className: string }> = {
  LOW: { label: "Низкий", className: "bg-success/10 text-success border-success/30" },
  MEDIUM: { label: "Средний", className: "bg-warning/10 text-warning border-warning/30" },
  HIGH: { label: "Высокий", className: "bg-destructive/10 text-destructive border-destructive/30" },
  CRITICAL: { label: "Критический", className: "bg-destructive text-destructive-foreground" },
};

function getTrend(current: number | null, previous: number | null) {
  if (current === null || previous === null) return null;
  if (current < previous) return "down";
  if (current > previous) return "up";
  return "same";
}

function TrendIcon({ trend }: { trend: "up" | "down" | "same" | null }) {
  if (trend === "down") return <TrendingDown className="h-3 w-3 text-success" />;
  if (trend === "up") return <TrendingUp className="h-3 w-3 text-destructive" />;
  if (trend === "same") return <Minus className="h-3 w-3 text-muted-foreground" />;
  return null;
}

const History = () => {
  const [responses, setResponses] = useState<SurveyResponseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("survey_responses")
        .select("id, survey_type, phq9_score, gad7_score, pss_score, burnout_score, overall_risk, completed_at")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Загрузка истории...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-5">
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
                <h1 className="text-lg font-bold">Архив результатов</h1>
                <p className="text-sm text-primary-foreground/80">
                  История диагностических сессий
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-6 py-8 space-y-6">
        {/* Stats Summary */}
        {responses.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{responses.length}</p>
                  <p className="text-xs text-muted-foreground">Всего тестов</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Calendar className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {new Date(responses[0]?.completed_at).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">Последний тест</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <ClipboardList className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {responses.filter(r => r.overall_risk === "LOW").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Низкий риск</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Separator />

        {/* History List */}
        {responses.length === 0 ? (
          <Card className="border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">Нет пройденных тестов</h3>
              <p className="mt-1 text-sm text-muted-foreground text-center max-w-sm">
                Пройдите первую диагностику, чтобы увидеть результаты и отслеживать динамику
              </p>
              <Button onClick={() => navigate("/survey")} className="mt-6">
                Пройти диагностику
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {responses.map((response, index) => {
              const prevResponse = responses[index + 1];
              const phq9Trend = getTrend(response.phq9_score, prevResponse?.phq9_score);
              const gad7Trend = getTrend(response.gad7_score, prevResponse?.gad7_score);
              const riskConf = riskConfig[response.overall_risk || "LOW"];

              return (
                <Card 
                  key={response.id}
                  className="group cursor-pointer border transition-all hover:border-primary hover:shadow-sm"
                  onClick={() => navigate(`/results?id=${response.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">
                              {response.survey_type === "comprehensive" 
                                ? "Комплексная диагностика" 
                                : "Экспресс-диагностика"
                              }
                            </h3>
                            {response.overall_risk && (
                              <Badge variant="outline" className={riskConf.className}>
                                {riskConf.label}
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {new Date(response.completed_at).toLocaleDateString("ru-RU", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {/* Scores with trends */}
                        <div className="hidden sm:flex items-center gap-4 text-sm">
                          {response.phq9_score !== null && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-muted-foreground">PHQ-9:</span>
                              <span className="font-medium">{response.phq9_score}</span>
                              <TrendIcon trend={phq9Trend} />
                            </div>
                          )}
                          {response.gad7_score !== null && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-muted-foreground">GAD-7:</span>
                              <span className="font-medium">{response.gad7_score}</span>
                              <TrendIcon trend={gad7Trend} />
                            </div>
                          )}
                          {response.pss_score !== null && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-muted-foreground">PSS:</span>
                              <span className="font-medium">{response.pss_score}</span>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
