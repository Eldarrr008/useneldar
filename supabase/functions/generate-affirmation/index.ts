import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const { phq9Score, gad7Score, pssScore, burnoutScore, overallRisk } = await req.json();

    const riskDescription = overallRisk === "LOW" ? "низкий" 
      : overallRisk === "MEDIUM" || overallRisk === "MODERATE" ? "умеренный" 
      : overallRisk === "HIGH" ? "высокий" 
      : "критический";

    const prompt = `Ты — тёплый и поддерживающий психолог-наставник для школьника.

Результаты диагностики ученика:
- Эмоциональный фон (PHQ-9): ${phq9Score}/27
- Тревожность (GAD-7): ${gad7Score}/21
${pssScore ? `- Стресс (PSS-10): ${pssScore}/40` : ""}
${burnoutScore ? `- Учебное выгорание: ${burnoutScore}/60` : ""}
- Общий уровень: ${riskDescription}

Сгенерируй персонализированную аффирмацию и поддерживающее сообщение.

ТРЕБОВАНИЯ (ответ ТОЛЬКО в JSON):
{
  "affirmation": "Короткая мотивирующая фраза (1 предложение, тёплая и ободряющая)",
  "message": "Поддерживающее сообщение 2-3 предложения. Подчёркивает сильные стороны ученика и даёт простой совет на день.",
  "emoji": "Один подходящий эмодзи"
}

ВАЖНО:
- Тёплый, дружелюбный тон для подростка
- Без медицинских терминов
- Фокус на ресурсах и возможностях
- Если результаты хорошие — похвали
- Если есть сложности — поддержи и ободри`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "Отвечай ТОЛЬКО валидным JSON без markdown." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content;

    let result;
    try {
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(cleaned);
    } catch {
      result = {
        affirmation: "Ты справляешься лучше, чем думаешь! 💪",
        message: "Каждый шаг вперёд — это уже победа. Ты молодец, что заботишься о своём состоянии.",
        emoji: "🌟"
      };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        affirmation: "Ты на правильном пути! 💫",
        message: "Забота о своём внутреннем мире — это важный и смелый шаг.",
        emoji: "✨"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
