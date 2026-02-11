import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  Users, 
  AlertTriangle, 
  Shield,
  Building2,
  Loader2,
  UserCheck,
  FileText,
  LogOut,
  RefreshCw,
  GraduationCap,
  Trash2,
  Search
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
  email?: string;
}

const roleLabels: Record<UserRole, string> = {
  admin: "Администратор",
  psychologist: "Психолог",
  student: "Студент",
};

const roleBadgeStyles: Record<UserRole, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/30",
  psychologist: "bg-primary/10 text-primary border-primary/30",
  student: "bg-muted text-muted-foreground",
};

const CHART_COLORS = [
  "hsl(142, 76%, 36%)",
  "hsl(48, 96%, 53%)",
  "hsl(25, 95%, 53%)",
  "hsl(0, 84%, 60%)",
];

const Admin = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalPsychologists: 0,
    totalAdmins: 0,
    totalSurveys: 0,
    totalClassrooms: 0,
    activeCrises: 0,
  });
  const [riskDistribution, setRiskDistribution] = useState<{ name: string; value: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

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

      // Fetch emails from edge function
      let emailMap: Record<string, string> = {};
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/list-user-emails`,
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              },
            }
          );
          if (response.ok) {
            const result = await response.json();
            for (const u of result.users) {
              emailMap[u.id] = u.email;
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch emails:", e);
      }

      const usersWithRoles = profiles.map(profile => ({
        ...profile,
        roles: rolesData
          .filter(r => r.user_id === profile.id)
          .map(r => r.role),
        email: emailMap[profile.id] || "",
      }));

      setUsers(usersWithRoles);

      // Fetch all stats
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: surveysCount } = await supabase
        .from("survey_responses")
        .select("*", { count: "exact", head: true });

      const { count: classroomsCount } = await supabase
        .from("classrooms")
        .select("*", { count: "exact", head: true });

      const { count: crisesCount } = await supabase
        .from("crisis_detections")
        .select("*", { count: "exact", head: true })
        .eq("reviewed", false);

      // Calculate role distribution
      const studentCount = rolesData.filter(r => r.role === "student").length;
      const psychCount = rolesData.filter(r => r.role === "psychologist").length;
      const adminCount = rolesData.filter(r => r.role === "admin").length;

      // Fetch risk distribution
      const { data: riskData } = await supabase
        .from("survey_responses")
        .select("overall_risk");

      const riskCounts: Record<string, number> = {
        LOW: 0,
        MODERATE: 0,
        HIGH: 0,
        CRITICAL: 0,
      };
      riskData?.forEach(item => {
        if (item.overall_risk && item.overall_risk in riskCounts) {
          riskCounts[item.overall_risk]++;
        }
      });

      setRiskDistribution([
        { name: "Низкий", value: riskCounts.LOW },
        { name: "Умеренный", value: riskCounts.MODERATE },
        { name: "Высокий", value: riskCounts.HIGH },
        { name: "Критический", value: riskCounts.CRITICAL },
      ]);

      setStats({
        totalUsers: usersCount || 0,
        totalStudents: studentCount,
        totalPsychologists: psychCount,
        totalAdmins: adminCount,
        totalSurveys: surveysCount || 0,
        totalClassrooms: classroomsCount || 0,
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
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
        title: "Роль изменена",
        description: `Роль пользователя успешно изменена на "${roleLabels[newRole]}"`,
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

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to delete user");

      toast({
        title: "Пользователь удалён",
        description: `${userName} был полностью удалён из системы`,
      });
      fetchData();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Ошибка удаления",
        description: error.message,
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Загрузка панели администратора...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-destructive text-destructive-foreground">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive-foreground/10">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Панель администратора</h1>
                <p className="text-sm text-destructive-foreground/80">
                  Управление системой ZenithMind
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-destructive-foreground hover:bg-destructive-foreground/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Выйти
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/psychologist")}
                className="text-destructive-foreground hover:bg-destructive-foreground/10"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Панель психолога
              </Button>
              <Separator orientation="vertical" className="h-8 bg-destructive-foreground/20" />
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
              <Badge variant="destructive" className="gap-2 px-3 py-1.5">
                <Shield className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Администратор</span>
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Обновить данные
            </Button>
          </div>
        </div>
      </div>

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
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <GraduationCap className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-sm text-muted-foreground">Студентов</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPsychologists}</p>
                <p className="text-sm text-muted-foreground">Психологов</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/50">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.activeCrises}</p>
                <p className="text-sm text-muted-foreground">Активных кризисов</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.totalSurveys}</p>
                <p className="text-sm text-muted-foreground">Пройдено тестов</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.totalClassrooms}</p>
                <p className="text-sm text-muted-foreground">Учебных групп</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.totalAdmins}</p>
                <p className="text-sm text-muted-foreground">Администраторов</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Risk Distribution */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-base">Распределение уровней риска</CardTitle>
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
                        { name: "Админы", value: stats.totalAdmins },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => value > 0 ? `${name}: ${value}` : ""}
                    >
                      <Cell fill="hsl(var(--primary))" />
                      <Cell fill="hsl(142, 76%, 36%)" />
                      <Cell fill="hsl(0, 84%, 60%)" />
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
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Управление пользователями</CardTitle>
                  <CardDescription>
                    Просмотр и изменение ролей пользователей системы
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary">
                {(() => {
                  const filtered = users.filter(user => {
                    const q = searchQuery.toLowerCase();
                    const matchesSearch = !q || user.full_name.toLowerCase().includes(q) || (user.email || "").toLowerCase().includes(q);
                    const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter as UserRole) || (roleFilter === "none" && user.roles.length === 0);
                    return matchesSearch && matchesRole;
                  });
                  return `${filtered.length} из ${users.length}`;
                })()} пользователей
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по имени или почте..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Фильтр по роли" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все роли</SelectItem>
                  <SelectItem value="student">Студенты</SelectItem>
                  <SelectItem value="psychologist">Психологи</SelectItem>
                  <SelectItem value="admin">Администраторы</SelectItem>
                  <SelectItem value="none">Без роли</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-medium">Имя пользователя</TableHead>
                    <TableHead className="font-medium">Эл. почта</TableHead>
                    <TableHead className="font-medium">Текущая роль</TableHead>
                    <TableHead className="font-medium">Дата регистрации</TableHead>
                    <TableHead className="font-medium">Изменить роль</TableHead>
                    <TableHead className="font-medium text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const q = searchQuery.toLowerCase();
                    const filtered = users.filter(user => {
                      const matchesSearch = !q || user.full_name.toLowerCase().includes(q) || (user.email || "").toLowerCase().includes(q);
                      const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter as UserRole) || (roleFilter === "none" && user.roles.length === 0);
                      return matchesSearch && matchesRole;
                    });
                    if (filtered.length === 0) {
                      return (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            {users.length === 0 ? "Пользователи не найдены" : "Нет результатов по вашему запросу"}
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return filtered.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{user.email || "—"}</TableCell>
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
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Вы уверены, что хотите удалить <strong>{user.full_name}</strong>? 
                                  Это действие необратимо. Все данные пользователя (тесты, сообщения, членство в группах) будут удалены навсегда.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteUser(user.id, user.full_name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Удалить
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ));
                  })()}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Info Notice */}
        <Card className="border-muted bg-muted/30">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Административные функции
                </p>
                <p className="text-sm text-muted-foreground/80">
                  Изменения ролей вступают в силу немедленно. Будьте осторожны при назначении 
                  административных привилегий. Все действия записываются в журнал системы.
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
            <p>© 2026 ZenithMind. Панель администратора</p>
            <p>Версия системы: 1.0.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Admin;
