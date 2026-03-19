import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  CalendarPlus,
  ShieldAlert,
  Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  student_id: string;
  type: string;
  message: string;
  resolved: boolean | null;
  created_at: string;
  studentName?: string;
}

interface AlertsSectionProps {
  alerts: Alert[];
  onAlertResolved: () => void;
  userId: string;
}

const typeConfig: Record<string, { label: string; color: string; icon: typeof AlertCircle }> = {
  crisis: {
    label: "Кризис",
    color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
    icon: ShieldAlert,
  },
  high_risk: {
    label: "Высокий риск",
    color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800",
    icon: AlertTriangle,
  },
  survey_critical: {
    label: "Критический опрос",
    color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
    icon: AlertCircle,
  },
  survey_high: {
    label: "Высокий риск (опрос)",
    color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800",
    icon: AlertTriangle,
  },
};

const getTypeConfig = (type: string) =>
  typeConfig[type] || { label: type, color: "bg-muted text-muted-foreground", icon: AlertCircle };

export const AlertsSection = ({ alerts, onAlertResolved, userId }: AlertsSectionProps) => {
  const [filter, setFilter] = useState<"all" | "unresolved" | "resolved">("unresolved");
  const [resolving, setResolving] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredAlerts = alerts.filter((a) => {
    if (filter === "unresolved") return !a.resolved;
    if (filter === "resolved") return a.resolved;
    return true;
  });

  const unresolvedCount = alerts.filter((a) => !a.resolved).length;

  const resolveAlert = async (alertId: string) => {
    setResolving(alertId);
    try {
      const { error } = await supabase
        .from("alerts")
        .update({ resolved: true })
        .eq("id", alertId);

      if (error) throw error;

      toast({ title: "Алерт отмечен как рассмотренный" });
      onAlertResolved();
    } catch (error) {
      console.error("Error resolving alert:", error);
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось обновить статус" });
    } finally {
      setResolving(null);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} мин назад`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч назад`;
    const days = Math.floor(hours / 24);
    return `${days} дн назад`;
  };

  return (
    <div className="space-y-4">
      {/* Urgent Banner */}
      {unresolvedCount > 0 && (
        <Card className="border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                  {unresolvedCount} нерассмотренн{unresolvedCount === 1 ? "ый" : unresolvedCount < 5 ? "ых" : "ых"} алерт{unresolvedCount === 1 ? "" : unresolvedCount < 5 ? "а" : "ов"}
                </p>
                <p className="text-xs text-red-600/80 dark:text-red-400/70">
                  Требуется внимание специалиста
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Срочные случаи</CardTitle>
              <CardDescription>Уведомления о критических ситуациях учащихся</CardDescription>
            </div>
            <div className="flex items-center gap-1 rounded-lg border bg-muted p-1">
              <Button
                variant={filter === "unresolved" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setFilter("unresolved")}
              >
                Активные
                {unresolvedCount > 0 && (
                  <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-[10px]">
                    {unresolvedCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant={filter === "resolved" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setFilter("resolved")}
              >
                Рассмотренные
              </Button>
              <Button
                variant={filter === "all" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setFilter("all")}
              >
                Все
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-green-500 opacity-70" />
              <p>
                {filter === "unresolved"
                  ? "Нет активных алертов — всё спокойно"
                  : filter === "resolved"
                  ? "Нет рассмотренных алертов"
                  : "Алертов не зарегистрировано"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => {
                const config = getTypeConfig(alert.type);
                const Icon = config.icon;

                return (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                      !alert.resolved
                        ? "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
                        : "border-border bg-card"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        !alert.resolved
                          ? "bg-red-100 dark:bg-red-900/50"
                          : "bg-muted"
                      }`}
                    >
                      <Icon
                        className={`h-4.5 w-4.5 ${
                          !alert.resolved
                            ? "text-red-600 dark:text-red-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={config.color}>
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(alert.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{alert.message}</p>
                      {alert.studentName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Учащийся: {alert.studentName}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {!alert.resolved && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => resolveAlert(alert.id)}
                            disabled={resolving === alert.id}
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Рассмотрено
                          </Button>
                        </>
                      )}
                      {alert.resolved && (
                        <Badge variant="secondary" className="gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Рассмотрено
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
