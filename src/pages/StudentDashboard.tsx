import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChatInterface } from "@/components/ChatInterface";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { 
  FileText, 
  Users, 
  Settings, 
  MessageCircle, 
  ClipboardList,
  LogOut,
  Building2,
  ShieldCheck,
  GraduationCap,
  History,
  ChevronRight
} from "lucide-react";

const StudentDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [joinCode, setJoinCode] = useState("");
  const [showChat, setShowChat] = useState(false);
  const { roles, loading, isAdmin, isPsychologist, isStudent } = useUserRole();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
    navigate("/");
  };

  const handleJoinWithCode = () => {
    if (joinCode.trim().length === 6) {
      navigate(`/join?code=${joinCode.trim().toUpperCase()}`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
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
                ← {t('common.back')}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-medium">{t('dashboard.privacyNotice.title')}</span>
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
                <h1 className="text-lg font-semibold">{t('dashboard.modules.consultation.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('chat.title')}</p>
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
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/10">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">ZenithMind</h1>
                <p className="text-sm text-primary-foreground/80">
                  {t('landing.title')}
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
                  {t('admin.title')}
                </Button>
              )}
              {(isPsychologist || isAdmin) && (
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/psychologist")}
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Users className="mr-2 h-4 w-4" />
                  {t('psychologist.title')}
                </Button>
              )}
              <Separator orientation="vertical" className="h-8 bg-primary-foreground/20" />
              <LanguageSwitcher />
              <ThemeToggle />
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t('common.logout')}
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
              {isAdmin ? t('dashboard.role.admin') : isPsychologist ? t('dashboard.role.psychologist') : t('dashboard.role.student')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Welcome Section */}
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-foreground">{t('dashboard.title')}</h2>
            <p className="text-muted-foreground">
              {t('dashboard.welcome')}
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
                  <CardTitle className="text-lg">{t('dashboard.modules.psychodiagnostics.title')}</CardTitle>
                  <CardDescription className="mt-1">
                    {t('dashboard.modules.psychodiagnostics.description')}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="text-xs">PHQ-9</Badge>
                  <Badge variant="secondary" className="text-xs">GAD-7</Badge>
                  <Badge variant="secondary" className="text-xs">PSS-10</Badge>
                  <Badge variant="secondary" className="text-xs">Burnout</Badge>
                </div>
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
                  <CardTitle className="text-lg">{t('dashboard.modules.consultation.title')}</CardTitle>
                  <CardDescription className="mt-1">
                    {t('dashboard.modules.consultation.description')}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="border-accent/30 text-xs text-accent">
                    {t('dashboard.privacyNotice.title')}
                  </Badge>
                  <Badge variant="outline" className="border-accent/30 text-xs text-accent">
                    24/7
                  </Badge>
                </div>
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
                    <CardTitle className="text-base">{t('dashboard.joinGroup.title')}</CardTitle>
                    <CardDescription>
                      {t('dashboard.joinGroup.placeholder')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder={t('dashboard.joinGroup.placeholder')}
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="max-w-xs font-mono text-center text-lg tracking-widest"
                  />
                  <Button 
                    onClick={handleJoinWithCode}
                    disabled={joinCode.length !== 6}
                  >
                    {t('dashboard.joinGroup.button')}
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
                    <CardTitle className="text-base">{t('history.title')}</CardTitle>
                    <CardDescription>
                      {t('dashboard.modules.history.description')}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" onClick={() => navigate("/history")}>
                  <FileText className="mr-2 h-4 w-4" />
                  {t('history.viewDetails')}
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
                    {t('dashboard.privacyNotice.title')}
                  </p>
                  <p className="text-sm text-muted-foreground/80">
                    {t('dashboard.privacyNotice.description')}
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
            <p>{t('landing.footer.copyright')}</p>
            <p>{t('dashboard.footer.disclaimer')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudentDashboard;
