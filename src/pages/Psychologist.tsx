import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface CrisisDetection {
  id: string;
  conversation_id: string;
  severity: string;
  keywords: string[];
  context: string;
  reviewed: boolean;
  created_at: string;
  conversations: {
    student_id: string;
    profiles: {
      full_name: string;
    };
  };
}

const Psychologist = () => {
  const [crises, setCrises] = useState<CrisisDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCrises: 0,
    unreviewedCrises: 0,
    criticalCrises: 0,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchCrises();

    // Subscribe to new crises
    const channel = supabase
      .channel("crisis_detections")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "crisis_detections",
        },
        () => {
          fetchCrises();
          toast({
            title: "Новый кризис обнаружен",
            description: "Требуется ваше внимание",
            variant: "destructive",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCrises = async () => {
    try {
      const { data, error } = await supabase
        .from("crisis_detections")
        .select(`
          *,
          conversations (
            student_id,
            profiles:student_id (
              full_name
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCrises(data as any);

      // Calculate stats
      const total = data.length;
      const unreviewed = data.filter((c) => !c.reviewed).length;
      const critical = data.filter((c) => c.severity === "critical").length;

      setStats({
        totalCrises: total,
        unreviewedCrises: unreviewed,
        criticalCrises: critical,
      });
    } catch (error) {
      console.error("Error fetching crises:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить данные",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsReviewed = async (crisisId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("crisis_detections")
        .update({
          reviewed: true,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", crisisId);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Кризис отмечен как проверенный",
      });

      fetchCrises();
    } catch (error) {
      console.error("Error marking as reviewed:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить статус",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Панель психолога</h1>
            <p className="text-muted-foreground">
              Мониторинг кризисных ситуаций
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              На главную
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Выйти
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Всего кризисов</CardTitle>
              <CardDescription>За всё время</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCrises}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Непроверенные</CardTitle>
              <CardDescription>Требуют внимания</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {stats.unreviewedCrises}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Критические</CardTitle>
              <CardDescription>Высокий приоритет</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {stats.criticalCrises}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Crises Table */}
        <Card>
          <CardHeader>
            <CardTitle>Обнаруженные кризисы</CardTitle>
            <CardDescription>
              Список всех обнаруженных кризисных ситуаций
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Студент</TableHead>
                  <TableHead>Уровень</TableHead>
                  <TableHead>Ключевые слова</TableHead>
                  <TableHead>Контекст</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crises.map((crisis) => (
                  <TableRow key={crisis.id}>
                    <TableCell className="font-medium">
                      {crisis.conversations?.profiles?.full_name || "Неизвестно"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          crisis.severity === "critical"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {crisis.severity === "critical" ? "Критический" : "Высокий"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {crisis.keywords?.map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {crisis.context}
                    </TableCell>
                    <TableCell>
                      {new Date(crisis.created_at).toLocaleDateString("ru-RU")}
                    </TableCell>
                    <TableCell>
                      {crisis.reviewed ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-sm">Проверено</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-orange-500">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">Не проверено</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {!crisis.reviewed && (
                        <Button
                          size="sm"
                          onClick={() => markAsReviewed(crisis.id)}
                        >
                          Отметить
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Psychologist;