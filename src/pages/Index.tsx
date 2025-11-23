import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChatInterface } from "@/components/ChatInterface";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const { roles, loading, isAdmin, isPsychologist } = useUserRole();
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-lg">Загрузка...</div>
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
              AI-помощник для студентов
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button variant="outline" onClick={() => navigate("/admin")}>
                Админ панель
              </Button>
            )}
            {(isPsychologist || isAdmin) && (
              <Button variant="outline" onClick={() => navigate("/psychologist")}>
                Панель психолога
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout}>
              Выйти
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 py-8">
        <div className="mx-auto max-w-4xl">
          <Card className="overflow-hidden border-primary/20 shadow-lg">
            <ChatInterface userId={user?.id} />
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;