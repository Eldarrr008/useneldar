import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3,
  Users,
  FileDown,
  Calendar,
  PieChart as PieChartIcon,
  Activity,
  AlertTriangle
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { generateClassroomPDF, calculateTrends } from "@/lib/pdfGenerator";

interface Classroom {
  id: string;
  name: string;
  member_count?: number;
}

interface StudentScore {
  user_id: string;
  full_name: string;
  phq9: number | null;
  gad7: number | null;
  pss: number | null;
  burnout: number | null;
  risk: string | null;
  date: string;
}

interface ClassroomStats {
  totalStudents: number;
  riskDistribution: Record<string, number>;
  averages: {
    phq9: number;
    gad7: number;
    pss: number;
    burnout: number;
  };
  trendData: Array<{
    date: string;
    avgPHQ9: number;
    avgGAD7: number;
    avgPSS: number;
    avgBurnout: number;
  }>;
  studentsAtRisk: Array<{
    name: string;
    risk: string;
    lastSurvey: string;
  }>;
}

const RISK_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MODERATE: "#eab308",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

const riskLabels: Record<string, string> = {
  LOW: "Низкий",
  MODERATE: "Умеренный",
  HIGH: "Высокий",
  CRITICAL: "Критический",
};

export default function Analytics() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string | "all">("all");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ClassroomStats | null>(null);
  const [user, setUser] = useState<any>(null);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchClassrooms(user.id);
      }
    });
  }, []);

  useEffect(() => {
    if (user && classrooms.length > 0) {
      fetchStats();
    }
  }, [selectedClassroom, dateRange, classrooms]);

  const fetchClassrooms = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("classrooms")
        .select("id, name")
        .eq("psychologist_id", userId)
        .order("name");

      if (error) throw error;

      const classroomsWithCounts = await Promise.all(
        (data || []).map(async (classroom) => {
          const { count } = await supabase
            .from("classroom_members")
            .select("*", { count: "exact", head: true })
            .eq("classroom_id", classroom.id);
          return { ...classroom, member_count: count || 0 };
        })
      );

      setClassrooms(classroomsWithCounts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      let studentIds: string[] = [];
      
      if (selectedClassroom === "all") {
        // Get all students from all classrooms
        const classroomIds = classrooms.map(c => c.id);
        if (classroomIds.length === 0) {
          setStats(null);
          return;
        }
        
        const { data: members } = await supabase
          .from("classroom_members")
          .select("student_id")
          .in("classroom_id", classroomIds);
        
        studentIds = members?.map(m => m.student_id) || [];
      } else {
        const { data: members } = await supabase
          .from("classroom_members")
          .select("student_id")
          .eq("classroom_id", selectedClassroom);
        
        studentIds = members?.map(m => m.student_id) || [];
      }

      if (studentIds.length === 0) {
        setStats({
          totalStudents: 0,
          riskDistribution: {},
          averages: { phq9: 0, gad7: 0, pss: 0, burnout: 0 },
          trendData: [],
          studentsAtRisk: [],
        });
        return;
      }

      // Calculate date filter
      let dateFilter = new Date();
      switch (dateRange) {
        case "7d":
          dateFilter.setDate(dateFilter.getDate() - 7);
          break;
        case "30d":
          dateFilter.setDate(dateFilter.getDate() - 30);
          break;
        case "90d":
          dateFilter.setDate(dateFilter.getDate() - 90);
          break;
        case "all":
          dateFilter = new Date(0);
          break;
      }

      // Fetch survey responses
      const { data: responses, error } = await supabase
        .from("survey_responses")
        .select("*")
        .in("user_id", studentIds)
        .gte("completed_at", dateFilter.toISOString())
        .order("completed_at", { ascending: true });

      if (error) throw error;

      // Fetch profiles for names
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", studentIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      // Calculate statistics
      const riskDistribution: Record<string, number> = {
        LOW: 0,
        MODERATE: 0,
        HIGH: 0,
        CRITICAL: 0,
      };

      const latestByStudent = new Map<string, typeof responses[0]>();
      responses?.forEach(r => {
        const existing = latestByStudent.get(r.user_id);
        if (!existing || new Date(r.completed_at) > new Date(existing.completed_at)) {
          latestByStudent.set(r.user_id, r);
        }
      });

      let totalPHQ9 = 0, totalGAD7 = 0, totalPSS = 0, totalBurnout = 0;
      let countPHQ9 = 0, countGAD7 = 0, countPSS = 0, countBurnout = 0;

      const studentsAtRisk: Array<{ name: string; risk: string; lastSurvey: string }> = [];

      latestByStudent.forEach((r, userId) => {
        if (r.overall_risk) {
          riskDistribution[r.overall_risk] = (riskDistribution[r.overall_risk] || 0) + 1;
          
          if (r.overall_risk === "HIGH" || r.overall_risk === "CRITICAL") {
            studentsAtRisk.push({
              name: profileMap.get(userId) || "Неизвестный",
              risk: r.overall_risk,
              lastSurvey: new Date(r.completed_at).toLocaleDateString("ru-RU"),
            });
          }
        }

        if (r.phq9_score !== null) { totalPHQ9 += r.phq9_score; countPHQ9++; }
        if (r.gad7_score !== null) { totalGAD7 += r.gad7_score; countGAD7++; }
        if (r.pss_score !== null) { totalPSS += r.pss_score; countPSS++; }
        if (r.burnout_score !== null) { totalBurnout += r.burnout_score; countBurnout++; }
      });

      // Calculate trend data (group by week)
      const weeklyData = new Map<string, { 
        phq9: number[], gad7: number[], pss: number[], burnout: number[] 
      }>();

      responses?.forEach(r => {
        const date = new Date(r.completed_at);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split("T")[0];

        if (!weeklyData.has(weekKey)) {
          weeklyData.set(weekKey, { phq9: [], gad7: [], pss: [], burnout: [] });
        }

        const week = weeklyData.get(weekKey)!;
        if (r.phq9_score !== null) week.phq9.push(r.phq9_score);
        if (r.gad7_score !== null) week.gad7.push(r.gad7_score);
        if (r.pss_score !== null) week.pss.push(r.pss_score);
        if (r.burnout_score !== null) week.burnout.push(r.burnout_score);
      });

      const trendData = Array.from(weeklyData.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({
          date: new Date(date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
          avgPHQ9: data.phq9.length > 0 ? data.phq9.reduce((a, b) => a + b, 0) / data.phq9.length : 0,
          avgGAD7: data.gad7.length > 0 ? data.gad7.reduce((a, b) => a + b, 0) / data.gad7.length : 0,
          avgPSS: data.pss.length > 0 ? data.pss.reduce((a, b) => a + b, 0) / data.pss.length : 0,
          avgBurnout: data.burnout.length > 0 ? data.burnout.reduce((a, b) => a + b, 0) / data.burnout.length : 0,
        }));

      setStats({
        totalStudents: studentIds.length,
        riskDistribution,
        averages: {
          phq9: countPHQ9 > 0 ? totalPHQ9 / countPHQ9 : 0,
          gad7: countGAD7 > 0 ? totalGAD7 / countGAD7 : 0,
          pss: countPSS > 0 ? totalPSS / countPSS : 0,
          burnout: countBurnout > 0 ? totalBurnout / countBurnout : 0,
        },
        trendData,
        studentsAtRisk,
      });

    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
        description: "Не удалось загрузить статистику",
      });
    }
  };

  const handleExportPDF = () => {
    if (!stats || !user) return;

    const classroomName = selectedClassroom === "all" 
      ? "Все группы" 
      : classrooms.find(c => c.id === selectedClassroom)?.name || "Группа";

    generateClassroomPDF({
      classroomName,
      psychologistName: user.user_metadata?.full_name || "Психолог",
      generatedDate: new Date().toLocaleDateString("ru-RU"),
      totalStudents: stats.totalStudents,
      riskDistribution: stats.riskDistribution,
      averageScores: stats.averages,
      studentsAtRisk: stats.studentsAtRisk,
    });

    toast({
      title: "PDF создан",
      description: "Отчёт успешно скачан",
    });
  };

  const pieData = stats ? Object.entries(stats.riskDistribution)
    .filter(([_, count]) => count > 0)
    .map(([risk, count]) => ({
      name: riskLabels[risk],
      value: count,
      color: RISK_COLORS[risk],
    })) : [];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Загрузка аналитики...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate("/psychologist")}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Аналитика и отчёты</h1>
                  <p className="text-sm text-primary-foreground/80">
                    Статистика по группам и динамика показателей
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportPDF}
                disabled={!stats || stats.totalStudents === 0}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Скачать PDF
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedClassroom} onValueChange={(v) => setSelectedClassroom(v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Выберите группу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все группы</SelectItem>
                  {classrooms.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.member_count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 дней</SelectItem>
                  <SelectItem value="30d">30 дней</SelectItem>
                  <SelectItem value="90d">90 дней</SelectItem>
                  <SelectItem value="all">Всё время</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-6 space-y-6">
        {!stats || stats.totalStudents === 0 ? (
          <Card className="border">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Нет данных для отображения</p>
              <p className="text-sm text-muted-foreground mt-1">
                Выберите группу с учащимися, прошедшими диагностику
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Всего студентов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalStudents}</div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Средний PHQ-9
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.averages.phq9.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">из 27</p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Средний GAD-7
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.averages.gad7.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">из 21</p>
                </CardContent>
              </Card>

              <Card className="border border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Требуют внимания
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">
                    {stats.studentsAtRisk.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="trends" className="space-y-4">
              <TabsList>
                <TabsTrigger value="trends" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Динамика
                </TabsTrigger>
                <TabsTrigger value="distribution" className="gap-2">
                  <PieChartIcon className="h-4 w-4" />
                  Распределение
                </TabsTrigger>
                <TabsTrigger value="comparison" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Сравнение
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trends">
                <Card className="border">
                  <CardHeader>
                    <CardTitle>Динамика показателей</CardTitle>
                    <CardDescription>
                      Средние значения по группе за выбранный период
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.trendData.length > 1 ? (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats.trendData}>
                            <defs>
                              <linearGradient id="colorPHQ9" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorGAD7" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: "hsl(var(--card))", 
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px"
                              }} 
                            />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="avgPHQ9" 
                              stroke="hsl(var(--primary))" 
                              fill="url(#colorPHQ9)"
                              name="PHQ-9"
                            />
                            <Area 
                              type="monotone" 
                              dataKey="avgGAD7" 
                              stroke="hsl(var(--accent))" 
                              fill="url(#colorGAD7)"
                              name="GAD-7"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Недостаточно данных для построения графика</p>
                        <p className="text-sm">Нужно минимум 2 периода с данными</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="distribution">
                <Card className="border">
                  <CardHeader>
                    <CardTitle>Распределение по уровням риска</CardTitle>
                    <CardDescription>
                      Текущее распределение студентов по категориям риска
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pieData.length > 0 ? (
                      <div className="h-80 flex items-center justify-center gap-8">
                        <ResponsiveContainer width="50%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-3">
                          {pieData.map((item) => (
                            <div key={item.name} className="flex items-center gap-3">
                              <div 
                                className="h-4 w-4 rounded-full" 
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-sm">
                                {item.name}: <strong>{item.value}</strong> (
                                {Math.round((item.value / stats.totalStudents) * 100)}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Нет данных о рисках</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comparison">
                <Card className="border">
                  <CardHeader>
                    <CardTitle>Сравнение показателей</CardTitle>
                    <CardDescription>
                      Средние значения по всем шкалам (нормализованные)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={[
                            { name: "PHQ-9", value: (stats.averages.phq9 / 27) * 100, maxScore: 27, actual: stats.averages.phq9 },
                            { name: "GAD-7", value: (stats.averages.gad7 / 21) * 100, maxScore: 21, actual: stats.averages.gad7 },
                            { name: "PSS-10", value: (stats.averages.pss / 40) * 100, maxScore: 40, actual: stats.averages.pss },
                            { name: "Burnout", value: (stats.averages.burnout / 60) * 100, maxScore: 60, actual: stats.averages.burnout },
                          ]}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                          <Tooltip 
                            formatter={(value: number, name: string, props: any) => [
                              `${props.payload.actual.toFixed(1)} / ${props.payload.maxScore}`,
                              "Значение"
                            ]}
                            contentStyle={{ 
                              backgroundColor: "hsl(var(--card))", 
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px"
                            }} 
                          />
                          <Bar 
                            dataKey="value" 
                            fill="hsl(var(--primary))"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Students At Risk */}
            {stats.studentsAtRisk.length > 0 && (
              <Card className="border border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                    <AlertTriangle className="h-5 w-5" />
                    Студенты, требующие внимания
                  </CardTitle>
                  <CardDescription>
                    Учащиеся с высоким или критическим уровнем риска
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.studentsAtRisk.map((student, i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <span className="font-medium">{student.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {student.lastSurvey}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={
                              student.risk === "CRITICAL" 
                                ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400" 
                                : "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400"
                            }
                          >
                            {riskLabels[student.risk]}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
