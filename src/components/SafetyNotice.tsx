import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Phone, ShieldAlert } from "lucide-react";

// Official sources: https://www.gov.kz/situations/677/1457?lang=ru
// https://www.gov.kz/org/emer-shymkent/press/article/details/164919?lang=ru
export function SafetyNotice({ delivery }: { delivery?: "available" | "unassigned" | "failed" }) {
  const { t } = useTranslation();
  return (
    <Alert variant="destructive" className="border-destructive/50">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>{t("safety.title")}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{t("safety.immediate")}</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm"><a href="tel:112"><Phone className="mr-2 h-4 w-4" />112 — {t("safety.emergency")}</a></Button>
          <Button asChild variant="outline" size="sm"><a href="tel:111"><Phone className="mr-2 h-4 w-4" />111 — {t("safety.family")}</a></Button>
        </div>
        <p>{t("safety.noWaiting")}</p>
        {delivery && <p>{t(`safety.delivery.${delivery}`)}</p>}
      </AlertDescription>
    </Alert>
  );
}