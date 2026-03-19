import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

interface Props {
  phq9Score: number;
  gad7Score: number;
  pssScore?: number | null;
  burnoutScore?: number | null;
  overallRisk: string;
}

interface Affirmation {
  affirmation: string;
  message: string;
  emoji: string;
}

export function AffirmationCard({ phq9Score, gad7Score, pssScore, burnoutScore, overallRisk }: Props) {
  const [data, setData] = useState<Affirmation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateAffirmation();
  }, []);

  const generateAffirmation = async () => {
    try {
      const { data: result, error } = await supabase.functions.invoke("generate-affirmation", {
        body: { phq9Score, gad7Score, pssScore, burnoutScore, overallRisk },
      });

      if (error) throw error;
      setData(result);
    } catch (e) {
      console.error("Affirmation error:", e);
      setData({
        affirmation: "Ты молодец, что заботишься о себе! 💪",
        message: "Каждый шаг к пониманию себя — это важно. Продолжай слушать своё сердце.",
        emoji: "🌟",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="py-6 flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Генерирую поддержку для тебя...</span>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 overflow-hidden">
      <CardContent className="py-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-2xl">
            {data.emoji}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary">AI-поддержка</span>
            </div>
            <p className="font-semibold text-foreground">{data.affirmation}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{data.message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
