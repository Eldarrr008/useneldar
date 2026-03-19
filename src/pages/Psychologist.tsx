import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Users, 
  Copy, 
  Loader2,
  ArrowLeft,
  FolderOpen,
  AlertTriangle,
  UserCheck,
  LogOut,
  RefreshCw,
  GraduationCap,
  Shield,
  Eye,
  BarChart3
} from "lucide-react";
import { StudentResultsDialog } from "@/components/psychologist/StudentResultsDialog";
import { ClassroomAIAnalysis } from "@/components/psychologist/ClassroomAIAnalysis";
import { AlertsSection } from "@/components/psychologist/AlertsSection";
import { PsychologistSkeleton } from "@/components/ui/page-skeleton";

interface Classroom {
  id: string;
  name: string;
  description: string | null;
  join_code: string;
  is_active: boolean;
  created_at: string;
  member_count?: number;
}

interface StudentData {
  id: string;
  user_id: string;
  risk_level: string | null;
  last_survey_date: string | null;
  classroom_id: string | null;
  profiles?: {
    full_name: string;
  };
}

interface CrisisDetection {
  id: string;
  severity: string;
  keywords: string[];
  context: string;
  reviewed: boolean;
  created_at: string;
}

interface AlertData {
  id: string;
  student_id: string;
  type: string;
  message: string;
  resolved: boolean | null;
  created_at: string;
  studentName?: string;
}

const riskColors: Record<string, string> = {
  LOW: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800",
  MODERATE: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400 dark:border-yellow-800",
  HIGH: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800",
  CRITICAL: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
};

const riskLabels: Record<string, string> = {
  LOW: "Низкий",
  MODERATE: "Умеренный",
  HIGH: "Высокий",
  CRITICAL: "Критический",
};

const Psychologist = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [crises, setCrises] = useState<CrisisDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassDescription, setNewClassDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [alertsData, setAlertsData] = useState<AlertData[]>([]);
  
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState({
    totalStudents: 0,
    highRiskStudents: 0,
    unreviewedCrises: 0,
    unresolvedAlerts: 0,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
    
    const channel = supabase
      .channel("crisis_and_alerts_updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "crisis_detections" },
        () => {
          fetchCrises();
          toast({
            variant: "destructive",
            title: "Новое кризисное оповещение",
            description: "Требуется рассмотрение специалиста",
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts" },
        () => {
          fetchAlerts();
          toast({
            variant: "destructive",
            title: "Новый срочный алерт",
            description: "Требуется внимание специалиста",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (selectedClassroom) {
      fetchStudentsByClassroom(selectedClassroom);
    }
  }, [selectedClassroom]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      const { data: classroomsData, error: classroomsError } = await supabase
        .from("classrooms")
        .select("*")
        .eq("psychologist_id", user.id)
        .order("created_at", { ascending: false });

      if (classroomsError) throw classroomsError;

      const classroomsWithCounts = await Promise.all(
        (classroomsData || []).map(async (classroom) => {
          const { count } = await supabase
            .from("classroom_members")
            .select("*", { count: "exact", head: true })
            .eq("classroom_id", classroom.id);
          return { ...classroom, member_count: count || 0 };
        })
      );

      setClassrooms(classroomsWithCounts);

      if (classroomsWithCounts.length > 0 && !selectedClassroom) {
        setSelectedClassroom(classroomsWithCounts[0].id);
      }

      await Promise.all([fetchCrises(), fetchAlerts()]);

      const totalStudents = classroomsWithCounts.reduce((sum, c) => sum + (c.member_count || 0), 0);
      setStats(prev => ({ ...prev, totalStudents }));

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
        description: "Не удалось получить данные",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCrises = async () => {
    const { data, error } = await supabase
      .from("crisis_detections")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setCrises(data);
      const unreviewed = data.filter(c => !c.reviewed).length;
      setStats(prev => ({ ...prev, unreviewedCrises: unreviewed }));
    }
  };

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) {
      // Fetch student names for alerts
      const studentIds = [...new Set(data.map(a => a.student_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", studentIds);

      const alertsWithNames: AlertData[] = data.map(alert => ({
        ...alert,
        studentName: profiles?.find(p => p.id === alert.student_id)?.full_name,
      }));

      setAlertsData(alertsWithNames);
      const unresolved = data.filter(a => !a.resolved).length;
      setStats(prev => ({ ...prev, unresolvedAlerts: unresolved }));
    }
  };

  const fetchStudentsByClassroom = async (classroomId: string) => {
    try {
      const { data: members, error: membersError } = await supabase
        .from("classroom_members")
        .select("student_id")
        .eq("classroom_id", classroomId);

      if (membersError) throw membersError;

      if (members && members.length > 0) {
        const studentIds = members.map(m => m.student_id);
        
        const { data: studentsData, error: studentsError } = await supabase
          .from("student_data")
          .select("*")
          .in("user_id", studentIds);

        if (studentsError) throw studentsError;

        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", studentIds);

        const mergedStudents: StudentData[] = (studentsData || []).map(student => ({
          ...student,
          profiles: profilesData?.find(p => p.id === student.user_id) || undefined,
        }));

        setStudents(mergedStudents);

        const highRisk = mergedStudents.filter(
          s => s.risk_level === "HIGH" || s.risk_level === "CRITICAL"
        ).length;
        setStats(prev => ({ ...prev, highRiskStudents: highRisk }));
      } else {
        setStudents([]);
        setStats(prev => ({ ...prev, highRiskStudents: 0 }));
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
    if (selectedClassroom) {
      fetchStudentsByClassroom(selectedClassroom);
    }
  };

  const createClassroom = async () => {
    if (!newClassName.trim()) {
      toast({ variant: "destructive", title: "Введите название группы" });
      return;
    }

    setCreating(true);
    try {
      if (!user) throw new Error("Not authenticated");

      const { data: codeData } = await supabase.rpc("generate_classroom_code");
      const joinCode = codeData || Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data, error } = await supabase
        .from("classrooms")
        .insert({
          name: newClassName.trim(),
          description: newClassDescription.trim() || null,
          join_code: joinCode,
          psychologist_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Группа создана",
        description: `Код доступа: ${joinCode}`,
      });

      setClassrooms(prev => [{ ...data, member_count: 0 }, ...prev]);
      setNewClassName("");
      setNewClassDescription("");
      setCreateDialogOpen(false);
      setSelectedClassroom(data.id);
    } catch (error: any) {
      console.error("Error creating classroom:", error);
      toast({
        variant: "destructive",
        title: "Ошибка создания",
        description: error.message || "Не удалось создать группу",
      });
    } finally {
      setCreating(false);
    }
  };

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Код скопирован в буфер обмена" });
  };

  const markCrisisReviewed = async (crisisId: string) => {
    try {
      const { error } = await supabase
        .from("crisis_detections")
        .update({
          reviewed: true,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", crisisId);

      if (error) throw error;
      
      toast({ title: "Статус обновлён" });
      fetchCrises();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return <PsychologistSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/10">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Панель психолога</h1>
                <p className="text-sm text-primary-foreground/80">
                  Мониторинг и сопровождение студентов
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Выйти
              </Button>
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/admin")}
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Администрирование
                </Button>
              )}
              <Separator orientation="vertical" className="h-8 bg-primary-foreground/20" />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Badge variant="default" className="gap-2 px-3 py-1.5">
                <UserCheck className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">
                  {user?.user_metadata?.full_name || "Психолог"}
                </span>
              </Badge>
              {stats.unreviewedCrises > 0 && (
                <Badge variant="destructive" className="gap-2">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {stats.unreviewedCrises} кризис{stats.unreviewedCrises === 1 ? "" : stats.unreviewedCrises < 5 ? "а" : "ов"}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/analytics")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Аналитика
              </Button>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Создать группу
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Создание новой группы</DialogTitle>
                    <DialogDescription>
                      Заполните данные для создания учебной группы
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Название группы</Label>
                      <Input
                        id="name"
                        placeholder="Например: 10-А класс"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="desc">Описание (опционально)</Label>
                      <Textarea
                        id="desc"
                        placeholder="Краткое описание группы"
                        value={newClassDescription}
                        onChange={(e) => setNewClassDescription(e.target.value)}
                      />
                    </div>
                    <Button onClick={createClassroom} disabled={creating} className="w-full">
                      {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Создать группу
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Обновить
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Users className="h-4 w-4" />
                Всего учащихся
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>
          <Card className="border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <FolderOpen className="h-4 w-4" />
                Учебных групп
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{classrooms.length}</div>
            </CardContent>
          </Card>
          <Card className="border border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-400">
                <AlertTriangle className="h-4 w-4" />
                Высокий риск
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.highRiskStudents}</div>
            </CardContent>
          </Card>
          <Card className={`border ${stats.unreviewedCrises > 0 ? "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20" : ""}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`flex items-center gap-2 text-sm font-medium ${stats.unreviewedCrises > 0 ? "text-red-700 dark:text-red-400" : "text-muted-foreground"}`}>
                <AlertCircle className="h-4 w-4" />
                Кризисные сигналы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stats.unreviewedCrises > 0 ? "text-red-600" : ""}`}>
                {stats.unreviewedCrises}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="classrooms" className="space-y-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="classrooms" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              Группы
            </TabsTrigger>
            <TabsTrigger value="students" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Учащиеся
            </TabsTrigger>
            <TabsTrigger value="crises" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Кризисы
              {stats.unreviewedCrises > 0 && (
                <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
                  {stats.unreviewedCrises}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="classrooms" className="space-y-4">
            {classrooms.length === 0 ? (
              <Card className="border border-dashed text-center py-12">
                <CardContent>
                  <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Группы не созданы</h3>
                  <p className="text-muted-foreground mb-4">
                    Создайте группу и передайте код учащимся
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Создать первую группу
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {classrooms.map((classroom) => (
                  <Card 
                    key={classroom.id}
                    className={`cursor-pointer border transition-all hover:shadow-md ${
                      selectedClassroom === classroom.id ? "border-primary ring-1 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedClassroom(classroom.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{classroom.name}</CardTitle>
                          {classroom.description && (
                            <CardDescription className="mt-1">{classroom.description}</CardDescription>
                          )}
                        </div>
                        <Badge variant="secondary">
                          {classroom.member_count} уч.
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Код доступа:</p>
                          <code className="text-lg font-mono font-bold tracking-widest text-primary">
                            {classroom.join_code}
                          </code>
                        </div>
                        <div className="flex items-center gap-2">
                          <div onClick={(e) => e.stopPropagation()}>
                            <ClassroomAIAnalysis 
                              classroomId={classroom.id} 
                              classroomName={classroom.name} 
                            />
                          </div>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyJoinCode(classroom.join_code);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="students">
            <Card className="border">
              <CardHeader>
                <CardTitle className="text-lg">Список учащихся</CardTitle>
                <CardDescription>
                  {selectedClassroom 
                    ? `Группа: ${classrooms.find(c => c.id === selectedClassroom)?.name || ""}`
                    : "Выберите группу для отображения списка"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedClassroom ? (
                  <div className="text-center text-muted-foreground py-12">
                    <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>Выберите группу во вкладке "Группы"</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>В данной группе пока нет учащихся</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold">ФИО</TableHead>
                        <TableHead className="font-semibold">Уровень риска</TableHead>
                        <TableHead className="font-semibold">Последняя диагностика</TableHead>
                        <TableHead className="font-semibold">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.profiles?.full_name || "Учащийся"}
                          </TableCell>
                          <TableCell>
                            {student.risk_level ? (
                              <Badge variant="outline" className={riskColors[student.risk_level]}>
                                {riskLabels[student.risk_level] || student.risk_level}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">Не определён</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {student.last_survey_date 
                              ? new Date(student.last_survey_date).toLocaleDateString("ru-RU")
                              : "—"
                            }
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedStudent({
                                  id: student.user_id,
                                  name: student.profiles?.full_name || "Учащийся"
                                });
                                setResultsDialogOpen(true);
                              }}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              Результаты
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crises">
            <Card className="border">
              <CardHeader>
                <CardTitle className="text-lg">Журнал кризисных ситуаций</CardTitle>
                <CardDescription>Требуют рассмотрения специалиста</CardDescription>
              </CardHeader>
              <CardContent>
                {crises.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-green-500 opacity-70" />
                    <p>Кризисных ситуаций не зарегистрировано</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold">Уровень</TableHead>
                        <TableHead className="font-semibold">Триггеры</TableHead>
                        <TableHead className="font-semibold">Контекст</TableHead>
                        <TableHead className="font-semibold">Дата</TableHead>
                        <TableHead className="font-semibold">Статус</TableHead>
                        <TableHead className="font-semibold">Действие</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {crises.map((crisis) => (
                        <TableRow key={crisis.id}>
                          <TableCell>
                            <Badge variant={crisis.severity === "critical" ? "destructive" : "outline"} 
                                   className={crisis.severity !== "critical" ? "bg-orange-100 text-orange-700 border-orange-200" : ""}>
                              {crisis.severity === "critical" ? "Критический" : "Высокий"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {crisis.keywords?.slice(0, 3).map((kw, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-muted-foreground">
                            {crisis.context}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(crisis.created_at).toLocaleDateString("ru-RU")}
                          </TableCell>
                          <TableCell>
                            {crisis.reviewed ? (
                              <div className="flex items-center gap-1.5 text-green-600">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-xs font-medium">Рассмотрено</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-orange-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-xs font-medium">Ожидает</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {!crisis.reviewed && (
                              <Button size="sm" variant="outline" onClick={() => markCrisisReviewed(crisis.id)}>
                                Отметить
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Notice */}
        <Card className="border-muted bg-muted/30">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <UserCheck className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Информация о конфиденциальности
                </p>
                <p className="text-sm text-muted-foreground/80">
                  Все данные учащихся являются конфиденциальными и защищены в соответствии с требованиями 
                  законодательства о персональных данных. Доступ к информации имеют только уполномоченные специалисты.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-muted/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <p>© 2026 ZenithMind. Панель психолога</p>
            <p>Все данные конфиденциальны и защищены</p>
          </div>
        </div>
      </footer>
      {/* Student Results Dialog */}
      {selectedStudent && (
        <StudentResultsDialog
          open={resultsDialogOpen}
          onOpenChange={setResultsDialogOpen}
          studentId={selectedStudent.id}
          studentName={selectedStudent.name}
        />
      )}
    </div>
  );
};

export default Psychologist;
