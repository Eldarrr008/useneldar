import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Brain, Zap, Flame, TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

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

interface Props {
  results: SurveyResult[];
}

const scaleConfig = {
  phq9: {
    key: "PHQ9",
    label: "Депрессия (PHQ-9)",
    icon: Heart,
    color: "hsl(var(--primary))",
    max: 27,
    thresholds: [
      { value: 5, label: "Минимальная", color: "hsl(142, 76%, 36%)" },
      { value: 10, label: "Лёгкая", color: "hsl(48, 96%, 53%)" },
      { value: 15, label: "Умеренная", color: "hsl(25, 95%, 53%)" },
      { value: 20, label: "Тяжёлая", color: "hsl(0, 84%, 60%)" },
    ],
  },
  gad7: {
    key: "GAD7",
    label: "Тревожность (GAD-7)",
    icon: Brain,
    color: "hsl(var(--accent))",
    max: 21,
    thresholds: [
      { value: 5, label: "Минимальная", color: "hsl(142, 76%, 36%)" },
      { value: 10, label: "Лёгкая", color: "hsl(48, 96%, 53%)" },
      { value: 15, label: "Умеренная", color: "hsl(25, 95%, 53%)" },
    ],
  },
  pss: {
    key: "PSS",
    label: "Стресс (PSS-10)",
    icon: Zap,
    color: "hsl(48, 96%, 53%)",
    max: 40,
    thresholds: [
      { value: 14, label: "Низкий", color: "hsl(142, 76%, 36%)" },
      { value: 27, label: "Умеренный", color: "hsl(48, 96%, 53%)" },
    ],
  },
  burnout: {
    key: "Burnout",
    label: "Выгорание",
    icon: Flame,
    color: "hsl(0, 84%, 60%)",
    max: 60,
    thresholds: [
      { value: 20, label: "Низкое", color: "hsl(142, 76%, 36%)" },
      { value: 40, label: "Умеренное", color: "hsl(48, 96%, 53%)" },
    ],
  },
};

function getStats(values: (number | null)[]) {
  const valid = values.filter((v): v is number => v !== null);
  if (valid.length === 0) return null;
  const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const first = valid[0];
  const last = valid[valid.length - 1];
  const trend = last < first ? "improved" : last > first ? "worsened" : "same";
  return { avg: Math.round(avg * 10) / 10, min, max, trend, count: valid.length };
}

function TrendBadge({ trend }: { trend: string }) {
  if (trend === "improved")
    return (
      <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800">
        <TrendingDown className="h-3 w-3" />
        Улучшение
      </Badge>
    );
  if (trend === "worsened")
    return (
      <Badge variant="outline" className="gap-1 bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800">
        <TrendingUp className="h-3 w-3" />
        Ухудшение
      </Badge>
    );
  return (
    <Badge variant="outline" className="gap-1">
      <Minus className="h-3 w-3" />
      Стабильно
    </Badge>
  );
}

export function StudentProgressCharts({ results }: Props) {
  const [activeTab, setActiveTab] = useState("overview");

  const chartData = results.map((r) => ({
    date: new Date(r.completed_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
    fullDate: new Date(r.completed_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }),
    PHQ9: r.phq9_score,
    GAD7: r.gad7_score,
    PSS: r.pss_score,
    Burnout: r.burnout_score,
    risk: r.overall_risk,
  }));

  const hasPss = results.some((r) => r.pss_score !== null);
  const hasBurnout = results.some((r) => r.burnout_score !== null);

  const phq9Stats = getStats(results.map((r) => r.phq9_score));
  const gad7Stats = getStats(results.map((r) => r.gad7_score));
  const pssStats = hasPss ? getStats(results.map((r) => r.pss_score)) : null;
  const burnoutStats = hasBurnout ? getStats(results.map((r) => r.burnout_score)) : null;

  const statsCards = [
    { config: scaleConfig.phq9, stats: phq9Stats },
    { config: scaleConfig.gad7, stats: gad7Stats },
    ...(pssStats ? [{ config: scaleConfig.pss, stats: pssStats }] : []),
    ...(burnoutStats ? [{ config: scaleConfig.burnout, stats: burnoutStats }] : []),
  ];

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  };

  return (
    <div className="space-y-4">
      {/* Statistics Summary */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {statsCards.map(({ config, stats }) => {
          if (!stats) return null;
          const Icon = config.icon;
          return (
            <Card key={config.key} className="border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4" style={{ color: config.color }} />
                  <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-lg font-bold">Ø {stats.avg}</span>
                  <span className="text-xs text-muted-foreground">
                    мин {stats.min} / макс {stats.max}
                  </span>
                </div>
                <TrendBadge trend={stats.trend} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${2 + (hasPss ? 1 : 0) + (hasBurnout ? 1 : 0) + 1}, 1fr)` }}>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="phq9">PHQ-9</TabsTrigger>
          <TabsTrigger value="gad7">GAD-7</TabsTrigger>
          {hasPss && <TabsTrigger value="pss">PSS-10</TabsTrigger>}
          {hasBurnout && <TabsTrigger value="burnout">Выгорание</TabsTrigger>}
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <Card className="border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Общая динамика всех шкал
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line type="monotone" dataKey="PHQ9" stroke={scaleConfig.phq9.color} strokeWidth={2} dot={{ r: 3 }} name="PHQ-9" />
                    <Line type="monotone" dataKey="GAD7" stroke={scaleConfig.gad7.color} strokeWidth={2} dot={{ r: 3 }} name="GAD-7" />
                    {hasPss && <Line type="monotone" dataKey="PSS" stroke={scaleConfig.pss.color} strokeWidth={2} dot={{ r: 3 }} name="PSS-10" />}
                    {hasBurnout && <Line type="monotone" dataKey="Burnout" stroke={scaleConfig.burnout.color} strokeWidth={2} dot={{ r: 3 }} name="Выгорание" />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Scale Charts */}
        {(["phq9", "gad7", ...(hasPss ? ["pss"] : []), ...(hasBurnout ? ["burnout"] : [])] as const).map((scale) => {
          const cfg = scaleConfig[scale];
          return (
            <TabsContent key={scale} value={scale}>
              <Card className="border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <cfg.icon className="h-4 w-4" style={{ color: cfg.color }} />
                    {cfg.label} — детальная динамика
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis domain={[0, cfg.max]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={tooltipStyle} />
                        {cfg.thresholds.map((t) => (
                          <ReferenceLine key={t.value} y={t.value} stroke={t.color} strokeDasharray="5 5" label={{ value: t.label, fontSize: 10, fill: t.color }} />
                        ))}
                        <defs>
                          <linearGradient id={`gradient-${scale}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={cfg.color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={cfg.color} stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey={cfg.key}
                          stroke={cfg.color}
                          strokeWidth={2.5}
                          fill={`url(#gradient-${scale})`}
                          dot={{ r: 4, fill: cfg.color }}
                          activeDot={{ r: 6 }}
                          name={cfg.label}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
