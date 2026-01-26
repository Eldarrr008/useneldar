import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { 
  Building2, 
  ShieldCheck, 
  Brain, 
  Heart, 
  ChevronRight,
  ClipboardList,
  MessageCircle,
  BarChart3,
  Lock,
  GraduationCap,
  UserCheck
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold">ZenithMind</h1>
                <p className="text-xs text-primary-foreground/80">
                  {t('landing.subtitle').slice(0, 50)}...
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
              <Button 
                variant="ghost" 
                onClick={() => navigate("/auth")}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Lock className="mr-2 h-4 w-4" />
                {t('common.login')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <Badge variant="secondary" className="gap-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t('landing.features.title')}
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              {t('landing.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('landing.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => navigate("/auth")} className="gap-2">
                <GraduationCap className="h-5 w-5" />
                {t('landing.loginAsStudent')}
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                <UserCheck className="mr-2 h-5 w-5" />
                {t('landing.loginAsSpecialist')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 border-t">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-2">{t('landing.features.title')}</h3>
            <p className="text-muted-foreground">
              {t('landing.subtitle')}
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <Card className="border">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-2">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{t('landing.features.psychodiagnostics.title')}</CardTitle>
                <CardDescription>
                  {t('landing.features.psychodiagnostics.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    PHQ-9 — Depression
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    GAD-7 — Anxiety
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    PSS-10 — Stress
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    MBI-SS — Burnout
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 mb-2">
                  <MessageCircle className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-lg">{t('landing.features.aiConsultation.title')}</CardTitle>
                <CardDescription>
                  {t('landing.features.aiConsultation.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    24/7
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {t('dashboard.privacyNotice.title')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {t('landing.aiSection.earlyDetection')}
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary mb-2">
                  <BarChart3 className="h-6 w-6 text-secondary-foreground" />
                </div>
                <CardTitle className="text-lg">{t('landing.features.analytics.title')}</CardTitle>
                <CardDescription>
                  {t('landing.features.analytics.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary-foreground" />
                    {t('history.title')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary-foreground" />
                    {t('analytics.trends')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary-foreground" />
                    {t('analytics.comparison')}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-16 bg-muted/30 border-t">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="gap-2 mb-4">
              <Brain className="h-3.5 w-3.5" />
              {t('landing.aiSection.title')}
            </Badge>
            <h3 className="text-2xl font-bold mb-2">{t('landing.aiSection.title')}</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('landing.subtitle')}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {/* AI Analysis */}
            <Card className="border bg-card">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 mb-2">
                  <Brain className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-lg">{t('landing.aiSection.intelligentAnalysis')}</CardTitle>
                <CardDescription>
                  {t('results.recommendations.aiAnalysis')}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* AI Chat */}
            <Card className="border bg-card relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-xs">24/7</Badge>
              </div>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/60 mb-2">
                  <MessageCircle className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-lg">{t('landing.aiSection.aiAssistant')}</CardTitle>
                <CardDescription>
                  {t('chat.title')}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* AI Detection */}
            <Card className="border bg-card">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-destructive to-destructive/60 mb-2">
                  <ShieldCheck className="h-6 w-6 text-destructive-foreground" />
                </div>
                <CardTitle className="text-lg">{t('landing.aiSection.earlyDetection')}</CardTitle>
                <CardDescription>
                  {t('psychologist.crises.title')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* AI Tech Stack */}
          <div className="mt-12 text-center">
            <div className="flex flex-wrap justify-center gap-3">
              <Badge variant="outline" className="px-4 py-2">
                🧠 NLP
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                📊 ML
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                💬 LLM
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                🔒 Secure AI
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 border-t">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-2">{t('landing.howItWorks.title')}</h3>
          </div>

          <div className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto">
            <div className="flex-1 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
                1
              </div>
              <h4 className="font-semibold mb-2">{t('landing.howItWorks.step1.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('landing.howItWorks.step1.description')}
              </p>
            </div>
            <div className="flex-1 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
                2
              </div>
              <h4 className="font-semibold mb-2">{t('landing.howItWorks.step2.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('landing.howItWorks.step2.description')}
              </p>
            </div>
            <div className="flex-1 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
                3
              </div>
              <h4 className="font-semibold mb-2">{t('landing.howItWorks.step3.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('landing.howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            {t('landing.cta.title')}
          </h3>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            {t('landing.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate("/auth")}
            >
              {t('common.register')}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/auth")}
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              {t('common.login')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t('landing.footer.copyright')}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {t('landing.footer.mentalHealth')}
              </span>
              <span className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
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
