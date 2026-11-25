export { detectChatSignal } from "../../supabase/functions/_shared/crisisSignal";

export function needsUrgentSupport(risk: string, requiresImmediateAction = false) {
  return requiresImmediateAction || risk === "HIGH" || risk === "CRITICAL";
}