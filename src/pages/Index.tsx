import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChatInterface } from "@/components/ChatInterface";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";
import { 
  FileText, 
  Users, 
  Settings, 
  MessageCircle, 
  ClipboardList,
  LogOut,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  History,
  ChevronRight
} from "lucide-react";
import { DashboardSkeleton } from "@/components/ui/page-skeleton";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [joinCode, setJoinCode] = useState("");
  const [showChat, setShowChat] = useState(false);
  const { roles, loading, isAdmin, isPsychologist, isStudent } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleJoinWithCode = () => {
    if (joinCode.trim().length === 6) {
      navigate(`/join?code=${joinCode.trim().toUpperCase()}`);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  // Chat view
  if (showChat) {
    return (
      <div className="min-h-screen bg-background">
        {/* University-style Header */}
        <header className="border-b bg-primary text-primary-foreground">
          <div className="container mx-auto flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowChat(false)}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                ← Назад к панели
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-medium">Конфиденциальная сессия</span>
            </div>
          </div>
        </header>
        
        <div className="border-b bg-card">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <MessageCircle className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Служба психологической поддержки</h1>
                <p className="text-sm text-muted-foreground">AI-ассистент для консультаций</p>
              </div>
            </div>
          </div>
        </div>

        <main className="container mx-auto p-6">
          <Card className="mx-auto max-w-4xl border shadow-institutional-md">
            <ChatInterface userId={user?.id} />
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* University-style Primary Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={logo} alt="ZenithMind Logo" className="h-12 w-12 object-contain" />
                <div className="absolute -inset-1 bg-primary-foreground/10 rounded-full blur-lg -z-10" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">ZenithMind</h1>
                <p className="text-sm text-primary-foreground/80">
                  Система психологического мониторинга
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/admin")}
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Администрирование
                </Button>
              )}
              {(isPsychologist || isAdmin) && (
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/psychologist")}
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Панель специалиста
                </Button>
              )}
              <Separator orientation="vertical" className="h-8 bg-primary-foreground/20" />
              <ThemeToggle />
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Выход
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Navigation */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-6 py-3">
            <Badge variant="secondary" className="gap-2 px-3 py-1.5">
              <GraduationCap className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                {user?.user_metadata?.full_name || user?.email}
              </span>
            </Badge>
            <span className="text-sm text-muted-foreground">
              Роль: {isAdmin ? "Администратор" : isPsychologist ? "Психолог" : "Студент"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Welcome Section */}
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-foreground">Рабочая панель</h2>
            <p className="text-muted-foreground">
              Выберите необходимый модуль для работы
            </p>
          </div>

          {/* Main Actions Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Survey Module */}
            <Card className="group cursor-pointer border transition-all hover:border-primary hover:shadow-institutional-md"
              onClick={() => navigate("/survey")}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <ClipboardList className="h-6 w-6 text-primary" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <CardTitle className="text-lg">Психодиагностика</CardTitle>
                  <CardDescription className="mt-1">
                    Стандартизированные методики оценки
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="text-xs">PHQ-9</Badge>
                  <Badge variant="secondary" className="text-xs">GAD-7</Badge>
                  <Badge variant="secondary" className="text-xs">PSS-10</Badge>
                  <Badge variant="secondary" className="text-xs">Burnout</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Научно валидированные инструменты для комплексной оценки психоэмоционального состояния
                </p>
              </CardContent>
            </Card>

            {/* Chat Module */}
            <Card className="group cursor-pointer border transition-all hover:border-accent hover:shadow-institutional-md"
              onClick={() => setShowChat(true)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <MessageCircle className="h-6 w-6 text-accent" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <CardTitle className="text-lg">Консультационная служба</CardTitle>
                  <CardDescription className="mt-1">
                    Психологическая поддержка онлайн
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="border-accent/30 text-xs text-accent">
                    Конфиденциально
                  </Badge>
                  <Badge variant="outline" className="border-accent/30 text-xs text-accent">
                    24/7
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Анонимное общение с AI-ассистентом для получения первичной психологической помощи
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Join Classroom Section */}
          {isStudent && (
            <Card className="border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Users className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Присоединение к группе</CardTitle>
                    <CardDescription>
                      Введите код, полученный от куратора или психолога
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="Код группы (6 символов)"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="max-w-xs font-mono text-center text-lg tracking-widest"
                  />
                  <Button 
                    onClick={handleJoinWithCode}
                    disabled={joinCode.length !== 6}
                  >
                    Присоединиться
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* History Section */}
          <Card className="border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <History className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Архив результатов</CardTitle>
                    <CardDescription>
                      История пройденных диагностических сессий
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" onClick={() => navigate("/history")}>
                  <FileText className="mr-2 h-4 w-4" />
                  Открыть архив
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Information Notice */}
          <Card className="border-muted bg-muted/30">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Информация о конфиденциальности
                  </p>
                  <p className="text-sm text-muted-foreground/80">
                    Все данные обрабатываются в соответствии с требованиями защиты персональных данных. 
                    Результаты диагностики доступны только уполномоченным специалистам психологической службы.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-muted/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <p>© 2026 ZenithMind. Система психологического мониторинга</p>
            <p>Данная система не заменяет консультацию квалифицированного специалиста</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;