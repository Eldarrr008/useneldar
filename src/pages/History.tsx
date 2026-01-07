import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";

interface SurveyResponseItem {
  id: string;
  survey_type: string;
  phq9_score: number | null;
  gad7_score: number | null;
  burnout_score: number | null;
  overall_risk: string | null;
  completed_at: string;
}

const riskColors: Record<string, string> = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

const riskLabels: Record<string, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
  CRITICAL: "Критический",
};

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
        .select("id, survey_type, phq9_score, gad7_score, burnout_score, overall_risk, completed_at")
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Loader2 className="h-8 w-8 animate-spin" />
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
            <h1 className="text-xl font-bold">История тестирований</h1>
            <p className="text-sm text-muted-foreground">
              Все пройденные вами тесты
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl p-4 py-8 space-y-4">
        {responses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Нет пройденных тестов</h3>
              <p className="text-muted-foreground mb-4">
                Пройдите первый тест, чтобы увидеть результаты
              </p>
              <Button onClick={() => navigate("/survey")}>
                Пройти тестирование
              </Button>
            </CardContent>
          </Card>
        ) : (
          responses.map((response) => (
            <Card 
              key={response.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => navigate(`/results?id=${response.id}`)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {response.survey_type === "comprehensive" 
                        ? "Комплексная диагностика" 
                        : "Экспресс-диагностика"
                      }
                    </CardTitle>
                    <CardDescription>
                      {new Date(response.completed_at).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardDescription>
                  </div>
                  {response.overall_risk && (
                    <Badge className={riskColors[response.overall_risk]}>
                      {riskLabels[response.overall_risk]}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm">
                  {response.phq9_score !== null && (
                    <div>
                      <span className="text-muted-foreground">PHQ-9: </span>
                      <span className="font-medium">{response.phq9_score}/27</span>
                    </div>
                  )}
                  {response.gad7_score !== null && (
                    <div>
                      <span className="text-muted-foreground">GAD-7: </span>
                      <span className="font-medium">{response.gad7_score}/21</span>
                    </div>
                  )}
                  {response.burnout_score !== null && (
                    <div>
                      <span className="text-muted-foreground">Выгорание: </span>
                      <span className="font-medium">{response.burnout_score}/27</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
};

export default History;
