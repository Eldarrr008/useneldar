import { AlertTriangle, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RiskIndicatorProps {
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

const riskConfig = {
  LOW: {
    label: "Низкий уровень риска",
    description: "Состояние в пределах нормы. Продолжайте следить за своим психоэмоциональным здоровьем.",
    icon: CheckCircle,
    className: "border-success/30 bg-success/5",
    iconClassName: "text-success",
    labelClassName: "text-success",
  },
  MEDIUM: {
    label: "Умеренный уровень риска",
    description: "Выявлены некоторые признаки, требующие внимания. Рекомендуется консультация специалиста.",
    icon: AlertCircle,
    className: "border-warning/30 bg-warning/5",
    iconClassName: "text-warning",
    labelClassName: "text-warning",
  },
  HIGH: {
    label: "Высокий уровень риска",
    description: "Результаты указывают на значительные трудности. Настоятельно рекомендуется обратиться к психологу.",
    icon: AlertTriangle,
    className: "border-destructive/30 bg-destructive/5",
    iconClassName: "text-destructive",
    labelClassName: "text-destructive",
  },
  CRITICAL: {
    label: "Критический уровень риска",
    description: "Требуется незамедлительная помощь специалиста. Пожалуйста, обратитесь в психологическую службу.",
    icon: XCircle,
    className: "border-destructive bg-destructive/10",
    iconClassName: "text-destructive",
    labelClassName: "text-destructive font-semibold",
  },
};

export function RiskIndicator({ risk }: RiskIndicatorProps) {
  const config = riskConfig[risk];
  const Icon = config.icon;

  return (
    <Card className={cn("border-2", config.className)}>
      <CardContent className="flex items-start gap-4 p-6">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-full bg-background", config.iconClassName)}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className={cn("text-lg font-semibold", config.labelClassName)}>
            {config.label}
          </h3>
          <p className="text-sm text-muted-foreground">
            {config.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
