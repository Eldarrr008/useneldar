import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChatInterface } from "@/components/ChatInterface";
import { 
  FileText, 
  Users, 
  Settings, 
  MessageCircle, 
  ClipboardList,
  LogOut,
  ArrowRight
} from "lucide-react";

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  // Chat view
  if (showChat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setShowChat(false)}>
                ← Назад
              </Button>
              <div>
                <h1 className="text-xl font-bold">AI-помощник</h1>
                <p className="text-sm text-muted-foreground">Психологическая поддержка</p>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto p-4 py-8">
          <div className="mx-auto max-w-4xl">
            <Card className="overflow-hidden border-primary/20 shadow-lg">
              <ChatInterface userId={user?.id} />
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold">ZenithMind</h1>
            <p className="text-sm text-muted-foreground">
              Система психологической диагностики
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button variant="outline" onClick={() => navigate("/admin")}>
                <Settings className="mr-2 h-4 w-4" />
                Админ
              </Button>
            )}
            {(isPsychologist || isAdmin) && (
              <Button variant="outline" onClick={() => navigate("/psychologist")}>
                <Users className="mr-2 h-4 w-4" />
                Психолог
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Добро пожаловать!</h2>
            <p className="text-muted-foreground">
              Пройдите психологическую диагностику или поговорите с AI-помощником
            </p>
          </div>

          {/* Main Actions */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Survey Card */}
            <Card 
              className="cursor-pointer hover:border-primary transition-all hover:shadow-lg"
              onClick={() => navigate("/survey")}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <ClipboardList className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Пройти тестирование</CardTitle>
                    <CardDescription>PHQ-9, GAD-7, PSS-10</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Научно валидированные методики для оценки депрессии, тревожности, стресса и выгорания
                </p>
                <Button className="w-full">
                  Начать тестирование
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Chat Card */}
            <Card 
              className="cursor-pointer hover:border-accent transition-all hover:shadow-lg"
              onClick={() => setShowChat(true)}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <MessageCircle className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle>AI-помощник</CardTitle>
                    <CardDescription>Психологическая поддержка</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Поговорите с AI-психологом о своих переживаниях. Конфиденциально и анонимно.
                </p>
                <Button variant="secondary" className="w-full">
                  Начать разговор
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Join Classroom Section */}
          {isStudent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Войти в класс
                </CardTitle>
                <CardDescription>
                  Введите код, полученный от психолога или классного руководителя
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="Введите код (6 символов)"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="flex-1 text-center font-mono text-lg tracking-wider"
                  />
                  <Button 
                    onClick={handleJoinWithCode}
                    disabled={joinCode.length !== 6}
                  >
                    Войти
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Ваши результаты
              </CardTitle>
              <CardDescription>
                История пройденных тестов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => navigate("/history")}>
                Посмотреть историю
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            ⚠️ Данная система является научно-практическим проектом и не заменяет 
            консультацию квалифицированного специалиста.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
