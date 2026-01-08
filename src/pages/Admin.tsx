import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Users, 
  MessageCircle, 
  AlertTriangle, 
  Shield,
  Building2,
  Loader2,
  UserCheck,
  FileText
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["app_role"];

interface Profile {
  id: string;
  full_name: string;
  created_at: string;
}

interface UserWithRoles extends Profile {
  roles: UserRole[];
}

const roleLabels: Record<UserRole, string> = {
  admin: "Администратор",
  psychologist: "Психолог",
  student: "Студент",
};

const roleBadgeStyles: Record<UserRole, string> = {
  admin: "bg-primary/10 text-primary border-primary/30",
  psychologist: "bg-accent/10 text-accent border-accent/30",
  student: "bg-muted text-muted-foreground",
};

const CHART_COLORS = [
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--destructive))",
];

const Admin = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalPsychologists: 0,
    totalConversations: 0,
    totalSurveys: 0,
    activeCrises: 0,
  });
  const [riskDistribution, setRiskDistribution] = useState<{ name: string; value: number }[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch profiles with roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for each user
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      const usersWithRoles = profiles.map(profile => ({
        ...profile,
        roles: rolesData
          .filter(r => r.user_id === profile.id)
          .map(r => r.role),
      }));

      setUsers(usersWithRoles);

      // Fetch stats
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: conversationsCount } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true });

      const { count: surveysCount } = await supabase
        .from("survey_responses")
        .select("*", { count: "exact", head: true });

      const { count: crisesCount } = await supabase
        .from("crisis_detections")
        .select("*", { count: "exact", head: true })
        .eq("reviewed", false);

      // Calculate role distribution
      const studentCount = rolesData.filter(r => r.role === "student").length;
      const psychCount = rolesData.filter(r => r.role === "psychologist").length;

      // Fetch risk distribution
      const { data: riskData } = await supabase
        .from("survey_responses")
        .select("overall_risk");

      const riskCounts = {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        CRITICAL: 0,
      };
      riskData?.forEach(item => {
        if (item.overall_risk && riskCounts.hasOwnProperty(item.overall_risk)) {
          riskCounts[item.overall_risk as keyof typeof riskCounts]++;
        }
      });

      setRiskDistribution([
        { name: "Низкий", value: riskCounts.LOW },
        { name: "Средний", value: riskCounts.MEDIUM },
        { name: "Высокий", value: riskCounts.HIGH },
        { name: "Критический", value: riskCounts.CRITICAL },
      ]);

      setStats({
        totalUsers: usersCount || 0,
        totalStudents: studentCount,
        totalPsychologists: psychCount,
        totalConversations: conversationsCount || 0,
        totalSurveys: surveysCount || 0,
        activeCrises: crisesCount || 0,
      });
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

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: newRole });

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Роль пользователя обновлена",
      });

      fetchData();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить роль",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Загрузка панели...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
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
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Панель администратора</h1>
                  <p className="text-sm text-primary-foreground/80">
                    Управление системой ZenithMind
                  </p>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">
              <Building2 className="mr-1.5 h-3 w-3" />
              Администратор
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Пользователей</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <UserCheck className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPsychologists}</p>
                <p className="text-sm text-muted-foreground">Психологов</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <FileText className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSurveys}</p>
                <p className="text-sm text-muted-foreground">Опросов</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{stats.activeCrises}</p>
                <p className="text-sm text-muted-foreground">Кризисов</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Risk Distribution */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-base">Распределение рисков</CardTitle>
              <CardDescription>По результатам всех диагностик</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {riskDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* User Distribution */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-base">Структура пользователей</CardTitle>
              <CardDescription>Распределение по ролям</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Студенты", value: stats.totalStudents },
                        { name: "Психологи", value: stats.totalPsychologists },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      <Cell fill="hsl(var(--primary))" />
                      <Cell fill="hsl(var(--accent))" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Users Table */}
        <Card className="border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Управление пользователями</CardTitle>
                <CardDescription>
                  Просмотр и изменение ролей пользователей системы
                </CardDescription>
              </div>
              <Badge variant="secondary">{users.length} пользователей</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-medium">Имя пользователя</TableHead>
                    <TableHead className="font-medium">Текущая роль</TableHead>
                    <TableHead className="font-medium">Дата регистрации</TableHead>
                    <TableHead className="font-medium text-right">Изменить роль</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>
                        <div className="flex gap-1.5">
                          {user.roles.map((role) => (
                            <Badge key={role} variant="outline" className={roleBadgeStyles[role]}>
                              {roleLabels[role]}
                            </Badge>
                          ))}
                          {user.roles.length === 0 && (
                            <Badge variant="outline" className="text-muted-foreground">
                              Нет роли
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          defaultValue={user.roles[0]}
                          onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                        >
                          <SelectTrigger className="w-40 ml-auto">
                            <SelectValue placeholder="Выбрать роль" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Студент</SelectItem>
                            <SelectItem value="psychologist">Психолог</SelectItem>
                            <SelectItem value="admin">Администратор</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
