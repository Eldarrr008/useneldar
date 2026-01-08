import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScaleResult } from "@/types/survey";

interface ScaleChartProps {
  title: string;
  result: ScaleResult;
  color: string;
  icon: React.ReactNode;
}

const riskColors = {
  LOW: "bg-success/10 text-success border-success/30",
  MEDIUM: "bg-warning/10 text-warning border-warning/30",
  HIGH: "bg-destructive/10 text-destructive border-destructive/30",
  CRITICAL: "bg-destructive text-destructive-foreground border-destructive",
};

const riskLabels = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
  CRITICAL: "Критический",
};

export function ScaleChart({ title, result, color, icon }: ScaleChartProps) {
  const percentage = Math.round((result.score / result.maxScore) * 100);
  
  const data = [
    {
      name: title,
      value: percentage,
      fill: color,
    },
  ];

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-base font-medium">{title}</CardTitle>
          </div>
          <Badge variant="outline" className={riskColors[result.riskLevel]}>
            {riskLabels[result.riskLevel]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="100%"
                barSize={8}
                data={data}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background={{ fill: "hsl(var(--muted))" }}
                  dataKey="value"
                  cornerRadius={4}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold">{result.score}</span>
              <span className="text-xs text-muted-foreground">/{result.maxScore}</span>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            <p className="text-sm font-medium">{result.severity}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {result.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
