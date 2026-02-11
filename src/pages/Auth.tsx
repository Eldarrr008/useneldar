import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building2, ShieldCheck, Lock, ArrowLeft, GraduationCap, UserCheck } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["app_role"];

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "student"; // "student" or "specialist"
  const isSpecialist = mode === "specialist";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLogin, setIsLogin] = useState(!searchParams.has("register"));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Validate roles match the login mode and redirect
  const validateAndRedirect = async (userId: string) => {
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    
    const roles: UserRole[] = rolesData?.map(r => r.role) || [];

    if (isSpecialist) {
      // Specialist login: only psychologist or admin allowed
      if (roles.includes("admin")) {
        navigate("/admin");
        return true;
      } else if (roles.includes("psychologist")) {
        navigate("/psychologist");
        return true;
      } else {
        // Student trying to use specialist login — reject
        await supabase.auth.signOut();
        toast({
          variant: "destructive",
          title: "Доступ запрещён",
          description: "Эта форма входа предназначена только для специалистов (психологов и администраторов).",
        });
        return false;
      }
    } else {
      // Student login: only students allowed
      if (roles.includes("admin") || roles.includes("psychologist")) {
        // Specialist trying to use student login — reject
        await supabase.auth.signOut();
        toast({
          variant: "destructive",
          title: "Доступ запрещён",
          description: "Для входа специалистов используйте форму «Вход для специалистов».",
        });
        return false;
      } else {
        navigate("/dashboard");
        return true;
      }
    }
  };

  useEffect(() => {
    // Check if user is already logged in on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        validateAndRedirect(user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          validateAndRedirect(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, isSpecialist]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Get current user and validate role
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const allowed = await validateAndRedirect(user.id);
          if (allowed) {
            toast({
              title: "Авторизация успешна",
              description: "Добро пожаловать в систему",
            });
          }
        }
      } else {
        if (isSpecialist) {
          toast({
            variant: "destructive",
            title: "Регистрация недоступна",
            description: "Регистрация специалистов осуществляется только через администратора.",
          });
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Регистрация завершена",
          description: "Учётная запись успешно создана",
        });

        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        variant: "destructive",
        title: "Ошибка авторизации",
        description: error.message || "Проверьте введённые данные",
      });
    } finally {
      setLoading(false);
    }
  };

  const titleText = isSpecialist
    ? isLogin ? "Вход для специалистов" : "Регистрация"
    : isLogin ? "Вход для студентов" : "Регистрация студента";

  const descText = isSpecialist
    ? "Для психологов и администраторов"
    : isLogin
      ? "Используйте учётные данные студента"
      : "Создание новой учётной записи студента";

  const IconComponent = isSpecialist ? UserCheck : GraduationCap;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold">ZenithMind</h1>
                <p className="text-xs text-primary-foreground/80">
                  {isSpecialist ? "Панель специалистов" : "Студенческий портал"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Login Card */}
          <Card className="border shadow-institutional-md">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <IconComponent className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{titleText}</CardTitle>
              <CardDescription>{descText}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && !isSpecialist && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">ФИО</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Введите ваше ФИО"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={!isLogin}
                      className="bg-background"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Электронная почта</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Введите электронную почту"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-background"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? "Обработка..."
                    : isLogin
                    ? "Войти"
                    : "Зарегистрироваться"}
                </Button>
              </form>

              {/* Only show register/login toggle for students */}
              {!isSpecialist && (
                <div className="mt-6 flex items-center justify-center gap-4">
                  <Button
                    type="button"
                    variant={isLogin ? "outline" : "default"}
                    size="sm"
                    onClick={() => setIsLogin(false)}
                    className={isLogin ? "" : "pointer-events-none"}
                  >
                    Регистрация
                  </Button>
                  <Button
                    type="button"
                    variant={!isLogin ? "outline" : "default"}
                    size="sm"
                    onClick={() => setIsLogin(true)}
                    className={!isLogin ? "" : "pointer-events-none"}
                  >
                    Вход
                  </Button>
                </div>
              )}

              {/* Link to switch mode */}
              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => navigate(isSpecialist ? "/auth?mode=student" : "/auth?mode=specialist")}
                >
                  {isSpecialist ? "Войти как студент →" : "Вход для специалистов →"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Защищённое соединение
              </p>
              <p className="text-xs text-muted-foreground/80">
                Все данные передаются по защищённому протоколу и соответствуют 
                требованиям безопасности персональных данных.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-xs text-muted-foreground">
              © 2024 ZenithMind. Система психологического мониторинга
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Поддержка:</span>
              <a 
                href="mailto:galymzumysbekov@gmail.com" 
                className="font-medium text-primary hover:underline"
              >
                galymzumysbekov@gmail.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Auth;
