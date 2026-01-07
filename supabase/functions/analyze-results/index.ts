import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScaleResult {
  score: number;
  maxScore: number;
  severity: string;
  riskLevel: string;
  description: string;
}

interface AnalysisRequest {
  phq9: ScaleResult;
  gad7: ScaleResult;
  pss10?: ScaleResult;
  burnout?: ScaleResult;
  overallRisk: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const { phq9, gad7, pss10, burnout, overallRisk }: AnalysisRequest = await req.json();

    // Build context for AI
    let context = `Ты — профессиональный психолог-консультант. Проанализируй результаты психодиагностического обследования подростка/студента и дай персонализированные рекомендации.

РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:

1. Депрессия (PHQ-9): ${phq9.score}/${phq9.maxScore} баллов
   - Уровень: ${phq9.severity}
   - ${phq9.description}

2. Тревожность (GAD-7): ${gad7.score}/${gad7.maxScore} баллов
   - Уровень: ${gad7.severity}
   - ${gad7.description}`;

    if (pss10) {
      context += `

3. Воспринимаемый стресс (PSS-10): ${pss10.score}/${pss10.maxScore} баллов
   - Уровень: ${pss10.severity}
   - ${pss10.description}`;
    }

    if (burnout) {
      context += `

4. Учебное выгорание: ${burnout.score}/${burnout.maxScore} баллов
   - Уровень: ${burnout.severity}
   - ${burnout.description}`;
    }

    context += `

ОБЩИЙ УРОВЕНЬ РИСКА: ${overallRisk}

ЗАДАЧА:
1. Дай краткий анализ результатов (2-3 предложения)
2. Предложи 3-4 конкретные рекомендации для улучшения состояния
3. Используй тёплый, поддерживающий тон
4. Если уровень риска высокий или критический, настоятельно рекомендуй обратиться к специалисту
5. Пиши на русском языке
6. Ответ должен быть не более 300 слов`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: context,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-results function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
