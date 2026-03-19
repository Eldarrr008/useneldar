import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import brainLogo from "@/assets/brain-logo.png";

const NeuralSphere = lazy(() => import("@/components/three/NeuralSphere"));
import { 
  ShieldCheck, 
  Brain, 
  Heart, 
  ChevronRight,
  ClipboardList,
  MessageCircle,
  BarChart3,
  Lock,
  GraduationCap,
  UserCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Users,
  TrendingUp
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={brainLogo} alt="ZenithMind Logo" className="h-10 w-10 object-contain" />
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-lg -z-10" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ZenithMind
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {t('landing.subtitle').slice(0, 35)}...
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
              <Button 
                variant="ghost" 
                onClick={() => navigate("/auth?mode=student")}
                className="hidden sm:flex"
              >
                <Lock className="mr-2 h-4 w-4" />
                {t('common.login')}
              </Button>
              <Button onClick={() => navigate("/auth?mode=student&register=true")} className="gap-2">
                {t('common.register')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-stagger-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Mental Wellness</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight animate-stagger-2">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                {t('landing.title')}
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-stagger-3">
              {t('landing.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-stagger-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth?mode=student")} 
                className="gap-3 h-14 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                <GraduationCap className="h-5 w-5" />
                {t('landing.loginAsStudent')}
                <ChevronRight className="h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/auth?mode=specialist")}
                className="h-14 px-8 text-base border-2 hover:bg-secondary/50"
              >
                <UserCheck className="mr-2 h-5 w-5" />
                {t('landing.loginAsSpecialist')}
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 animate-stagger-5">
              {[
                { icon: Users, value: "1000+", label: t('landing.stats.students') || "Студентов" },
                { icon: Shield, value: "100%", label: t('landing.stats.confidential') || "Конфиденциально" },
                { icon: Zap, value: "24/7", label: t('landing.stats.available') || "Доступность" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="gap-2 mb-4">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t('landing.features.title')}
            </Badge>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.features.title')}</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('landing.subtitle')}
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <CardHeader>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 mb-4">
                  <ClipboardList className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{t('landing.features.psychodiagnostics.title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('landing.features.psychodiagnostics.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {["PHQ-9 — Depression", "GAD-7 — Anxiety", "PSS-10 — Stress", "MBI-SS — Burnout"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute top-4 right-4">
                <Badge className="bg-accent text-accent-foreground">24/7</Badge>
              </div>
              <CardHeader>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent/80 shadow-lg shadow-accent/25 mb-4">
                  <MessageCircle className="h-7 w-7 text-accent-foreground" />
                </div>
                <CardTitle className="text-xl">{t('landing.features.aiConsultation.title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('landing.features.aiConsultation.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    { text: "24/7", icon: Zap },
                    { text: t('dashboard.privacyNotice.title'), icon: Shield },
                    { text: t('landing.aiSection.earlyDetection'), icon: TrendingUp },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <item.icon className="h-4 w-4 text-accent flex-shrink-0" />
                      <span className="text-muted-foreground">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 md:col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/30 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <CardHeader>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 shadow-lg mb-4">
                  <BarChart3 className="h-7 w-7 text-secondary-foreground" />
                </div>
                <CardTitle className="text-xl">{t('landing.features.analytics.title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('landing.features.analytics.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[t('history.title'), t('analytics.trends'), t('analytics.comparison')].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-secondary-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-16">
            <Badge className="gap-2 mb-4 bg-gradient-to-r from-primary to-accent text-white border-0">
              <Brain className="h-3.5 w-3.5" />
              {t('landing.aiSection.title')}
            </Badge>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.aiSection.title')}</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('landing.subtitle')}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                icon: Brain,
                title: t('landing.aiSection.intelligentAnalysis'),
                description: t('results.recommendations.aiAnalysis'),
                gradient: "from-primary to-primary/60",
              },
              {
                icon: MessageCircle,
                title: t('landing.aiSection.aiAssistant'),
                description: t('chat.title'),
                gradient: "from-accent to-accent/60",
                badge: "24/7",
              },
              {
                icon: ShieldCheck,
                title: t('landing.aiSection.earlyDetection'),
                description: t('psychologist.crises.title'),
                gradient: "from-destructive to-destructive/60",
              },
            ].map((item, i) => (
              <Card key={i} className="group relative overflow-hidden border-0 bg-card/80 backdrop-blur shadow-lg hover:shadow-xl transition-all duration-300">
                {item.badge && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary">{item.badge}</Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* AI Tech Stack */}
          <div className="mt-12 text-center">
            <div className="flex flex-wrap justify-center gap-3">
              {["🧠 NLP", "📊 ML", "💬 LLM", "🔒 Secure AI"].map((tech, i) => (
                <Badge key={i} variant="outline" className="px-4 py-2 text-sm bg-background/50 backdrop-blur">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.howItWorks.title')}</h3>
          </div>

          <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
            {[
              { step: 1, ...{ title: t('landing.howItWorks.step1.title'), description: t('landing.howItWorks.step1.description') } },
              { step: 2, ...{ title: t('landing.howItWorks.step2.title'), description: t('landing.howItWorks.step2.description') } },
              { step: 3, ...{ title: t('landing.howItWorks.step3.title'), description: t('landing.howItWorks.step3.description') } },
            ].map((item, i) => (
              <div key={i} className="flex-1 relative">
                <div className="text-center p-6 rounded-2xl bg-card shadow-lg">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white font-bold text-xl mb-4 shadow-lg">
                    {item.step}
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                    <ArrowRight className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container mx-auto px-6 text-center relative">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold mb-6 text-primary-foreground">
              {t('landing.cta.title')}
            </h3>
            <p className="text-primary-foreground/80 mb-10 text-lg max-w-xl mx-auto">
              {t('landing.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate("/auth")}
                className="h-14 px-8 text-base shadow-lg hover:shadow-xl transition-all"
              >
                {t('common.register')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/auth")}
                className="h-14 px-8 text-base border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur"
              >
                {t('common.login')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="ZenithMind" className="h-8 w-8 object-contain" />
              <span className="font-semibold">ZenithMind</span>
              <span className="text-sm text-muted-foreground">
                {t('landing.footer.copyright')}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-destructive" />
                {t('landing.footer.mentalHealth')}
              </span>
              <span className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                {t('landing.footer.aiPowered')}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;