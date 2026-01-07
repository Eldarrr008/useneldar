import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
  BarChart3,
  Loader2,
  ArrowLeft
} from "lucide-react";

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

const Psychologist = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [crises, setCrises] = useState<CrisisDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassDescription, setNewClassDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState({
    totalStudents: 0,
    highRiskStudents: 0,
    unreviewedCrises: 0,
    surveysToday: 0,
  });

  useEffect(() => {
    fetchData();
    
    // Subscribe to crisis updates
    const channel = supabase
      .channel("crisis_updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "crisis_detections" },
        () => {
          fetchCrises();
          toast({
            variant: "destructive",
            title: "⚠️ Новый кризис обнаружен",
            description: "Требуется ваше внимание",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (selectedClassroom) {
      fetchStudentsByClassroom(selectedClassroom);
    }
  }, [selectedClassroom]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch classrooms
      const { data: classroomsData, error: classroomsError } = await supabase
        .from("classrooms")
        .select("*")
        .eq("psychologist_id", user.id)
        .order("created_at", { ascending: false });

      if (classroomsError) throw classroomsError;

      // Get member counts
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

      // Set first classroom as selected
      if (classroomsWithCounts.length > 0 && !selectedClassroom) {
        setSelectedClassroom(classroomsWithCounts[0].id);
      }

      // Fetch crises
      await fetchCrises();

      // Calculate stats
      const totalStudents = classroomsWithCounts.reduce((sum, c) => sum + (c.member_count || 0), 0);
      setStats(prev => ({ ...prev, totalStudents }));

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить данные",
      });
    } finally {
      setLoading(false);
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

  const fetchStudentsByClassroom = async (classroomId: string) => {
    try {
      // Get student IDs from classroom_members
      const { data: members, error: membersError } = await supabase
        .from("classroom_members")
        .select("student_id")
        .eq("classroom_id", classroomId);

      if (membersError) throw membersError;

      if (members && members.length > 0) {
        const studentIds = members.map(m => m.student_id);
        
        // Get student data
        const { data: studentsData, error: studentsError } = await supabase
          .from("student_data")
          .select("*")
          .in("user_id", studentIds);

        if (studentsError) throw studentsError;

        // Get profiles separately
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", studentIds);

        // Merge data
        const mergedStudents: StudentData[] = (studentsData || []).map(student => ({
          ...student,
          profiles: profilesData?.find(p => p.id === student.user_id) || undefined,
        }));

        setStudents(mergedStudents);

        // Update high risk count
        const highRisk = mergedStudents.filter(
          s => s.risk_level === "HIGH" || s.risk_level === "CRITICAL"
        ).length;
        setStats(prev => ({ ...prev, highRiskStudents: highRisk }));
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const createClassroom = async () => {
    if (!newClassName.trim()) {
      toast({ variant: "destructive", title: "Введите название класса" });
      return;
    }

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate join code
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
        title: "Класс создан!",
        description: `Код для учеников: ${joinCode}`,
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
        title: "Ошибка",
        description: error.message || "Не удалось создать класс",
      });
    } finally {
      setCreating(false);
    }
  };

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Код скопирован!" });
  };

  const markCrisisReviewed = async (crisisId: string) => {
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
      
      toast({ title: "Отмечено как проверенное" });
      fetchCrises();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Панель психолога</h1>
              <p className="text-sm text-muted-foreground">Управление классами и мониторинг</p>
            </div>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Создать класс
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать новый класс</DialogTitle>
                <DialogDescription>
                  Создайте класс и получите код для учеников
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название класса</Label>
                  <Input
                    id="name"
                    placeholder="Например: 10А класс"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Описание (необязательно)</Label>
                  <Textarea
                    id="desc"
                    placeholder="Краткое описание класса"
                    value={newClassDescription}
                    onChange={(e) => setNewClassDescription(e.target.value)}
                  />
                </div>
                <Button onClick={createClassroom} disabled={creating} className="w-full">
                  {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Создать класс
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto p-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Всего учеников</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Классов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classrooms.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Высокий риск</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.highRiskStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Кризисы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.unreviewedCrises}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="classrooms" className="space-y-4">
          <TabsList>
            <TabsTrigger value="classrooms">
              <Users className="mr-2 h-4 w-4" />
              Классы
            </TabsTrigger>
            <TabsTrigger value="students">
              <BarChart3 className="mr-2 h-4 w-4" />
              Ученики
            </TabsTrigger>
            <TabsTrigger value="crises">
              <AlertCircle className="mr-2 h-4 w-4" />
              Кризисы
              {stats.unreviewedCrises > 0 && (
                <Badge variant="destructive" className="ml-2">{stats.unreviewedCrises}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="classrooms" className="space-y-4">
            {classrooms.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Нет созданных классов</h3>
                  <p className="text-muted-foreground mb-4">
                    Создайте класс и поделитесь кодом с учениками
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Создать первый класс
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {classrooms.map((classroom) => (
                  <Card 
                    key={classroom.id}
                    className={`cursor-pointer transition-colors ${
                      selectedClassroom === classroom.id ? "border-primary" : ""
                    }`}
                    onClick={() => setSelectedClassroom(classroom.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{classroom.name}</CardTitle>
                          {classroom.description && (
                            <CardDescription>{classroom.description}</CardDescription>
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
                          <p className="text-xs text-muted-foreground mb-1">Код для входа:</p>
                          <code className="text-lg font-mono font-bold tracking-wider">
                            {classroom.join_code}
                          </code>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyJoinCode(classroom.join_code);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Ученики класса</CardTitle>
                <CardDescription>
                  {selectedClassroom 
                    ? `${classrooms.find(c => c.id === selectedClassroom)?.name || ""}`
                    : "Выберите класс для просмотра учеников"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    В этом классе пока нет учеников
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Имя</TableHead>
                        <TableHead>Уровень риска</TableHead>
                        <TableHead>Последний тест</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.profiles?.full_name || "Ученик"}
                          </TableCell>
                          <TableCell>
                            {student.risk_level ? (
                              <Badge className={riskColors[student.risk_level]}>
                                {riskLabels[student.risk_level] || student.risk_level}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">Не пройден</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {student.last_survey_date 
                              ? new Date(student.last_survey_date).toLocaleDateString("ru-RU")
                              : "—"
                            }
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
            <Card>
              <CardHeader>
                <CardTitle>Обнаруженные кризисы</CardTitle>
                <CardDescription>Требуют вашего внимания</CardDescription>
              </CardHeader>
              <CardContent>
                {crises.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Кризисных ситуаций не обнаружено
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
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
                          <TableCell>
                            <Badge variant={crisis.severity === "critical" ? "destructive" : "secondary"}>
                              {crisis.severity === "critical" ? "Критический" : "Высокий"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {crisis.keywords?.slice(0, 3).map((kw, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{crisis.context}</TableCell>
                          <TableCell>
                            {new Date(crisis.created_at).toLocaleDateString("ru-RU")}
                          </TableCell>
                          <TableCell>
                            {crisis.reviewed ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-xs">Проверено</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-orange-500">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-xs">Ожидает</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {!crisis.reviewed && (
                              <Button size="sm" onClick={() => markCrisisReviewed(crisis.id)}>
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
      </main>
    </div>
  );
};

export default Psychologist;
