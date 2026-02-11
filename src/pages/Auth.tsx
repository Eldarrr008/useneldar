import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Building2, ShieldCheck, Lock, ArrowLeft } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["app_role"];

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Helper to fetch user roles and redirect accordingly
  const fetchRolesAndRedirect = async (userId: string) => {
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    
    const roles: UserRole[] = rolesData?.map(r => r.role) || [];
    
    if (roles.includes("admin")) {
      navigate("/admin");
    } else if (roles.includes("psychologist")) {
      navigate("/psychologist");
    } else {
      navigate("/dashboard");
    }
  };

  useEffect(() => {
    // Check if user is already logged in on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        fetchRolesAndRedirect(user.id);
      }
    });

    // Listen for auth state changes to handle logout properly
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only auto-redirect on SIGNED_IN event (not initial session check)
        if (event === "SIGNED_IN" && session?.user) {
          fetchRolesAndRedirect(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

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

        toast({
          title: "Авторизация успешна",
          description: "Добро пожаловать в систему",
        });
        
        // Get current user and redirect by role
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await fetchRolesAndRedirect(user.id);
        }
      } else {
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
                <p className="text-xs text-primary-foreground/80">Система психологического мониторинга</p>
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
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">
                {isLogin ? "Вход в систему" : "Регистрация"}
              </CardTitle>
              <CardDescription>
                {isLogin
                  ? "Используйте учётные данные организации"
                  : "Создание новой учётной записи"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
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
                    placeholder="user@university.edu"
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