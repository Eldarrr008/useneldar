import { Lightbulb, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RecommendationsListProps {
  recommendations: string[];
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <Lightbulb className="h-4 w-4 text-accent" />
          </div>
          <div>
            <CardTitle className="text-base">Рекомендации</CardTitle>
            <CardDescription className="text-xs">
              На основе анализа результатов диагностики
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-3">
          {recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
              <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
              <span className="text-sm leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
