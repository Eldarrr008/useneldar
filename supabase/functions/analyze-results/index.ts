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

interface AnswerDetail {
  questionId: string;
  questionText: string;
  value: number | string;
  category: string;
}

interface AnalysisRequest {
  phq9: ScaleResult;
  gad7: ScaleResult;
  pss10?: ScaleResult;
  burnout?: ScaleResult;
  overallRisk: string;
  answers?: AnswerDetail[];
}

interface StructuredAnalysis {
  summary: string;
  detailedAnalysis: {
    depression: string;
    anxiety: string;
    stress?: string;
    burnout?: string;
  };
  keyFactors: string[];
  recommendations: string[];
  professionalHelp: boolean;
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

    const { phq9, gad7, pss10, burnout, overallRisk, answers }: AnalysisRequest = await req.json();

    // Build detailed context for AI with structured output instructions
    let context = `Ты — опытный психолог-консультант. Проведи глубокий анализ результатов психодиагностики подростка/студента.

РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:

📊 ДЕПРЕССИЯ (PHQ-9): ${phq9.score}/${phq9.maxScore} баллов
   Уровень: ${phq9.severity}
   Интерпретация: ${phq9.description}

📊 ТРЕВОЖНОСТЬ (GAD-7): ${gad7.score}/${gad7.maxScore} баллов
   Уровень: ${gad7.severity}
   Интерпретация: ${gad7.description}`;

    if (pss10) {
      context += `

📊 СТРЕСС (PSS-10): ${pss10.score}/${pss10.maxScore} баллов
   Уровень: ${pss10.severity}
   Интерпретация: ${pss10.description}`;
    }

    if (burnout) {
      context += `

📊 УЧЕБНОЕ ВЫГОРАНИЕ: ${burnout.score}/${burnout.maxScore} баллов
   Уровень: ${burnout.severity}
   Интерпретация: ${burnout.description}`;
    }

    context += `

🎯 ОБЩИЙ УРОВЕНЬ РИСКА: ${overallRisk}

ТВОЯ ЗАДАЧА — ответить в СТРОГО СТРУКТУРИРОВАННОМ формате JSON:

{
  "summary": "Краткий вывод 2-3 предложения о текущем состоянии",
  "detailedAnalysis": {
    "depression": "Анализ показателей депрессии, что это значит для человека",
    "anxiety": "Анализ показателей тревожности, её влияние на повседневную жизнь"${pss10 ? `,
    "stress": "Анализ уровня стресса и способности справляться с нагрузками"` : ""}${burnout ? `,
    "burnout": "Анализ учебного выгорания и его проявлений"` : ""}
  },
  "keyFactors": [
    "Фактор 1: что больше всего влияет на результат",
    "Фактор 2: вторичный фактор",
    "Фактор 3: дополнительный фактор"
  ],
  "recommendations": [
    "Конкретная рекомендация 1",
    "Конкретная рекомендация 2", 
    "Конкретная рекомендация 3",
    "Конкретная рекомендация 4"
  ],
  "professionalHelp": ${overallRisk === "HIGH" || overallRisk === "CRITICAL" ? "true" : "false"}
}

ВАЖНО:
- Используй тёплый, поддерживающий тон
- Давай конкретные, выполнимые рекомендации
- Объясняй простым языком без медицинских терминов
- Если риск высокий — настоятельно рекомендуй обратиться к специалисту
- Отвечай ТОЛЬКО валидным JSON, без дополнительного текста`;

    console.log("Sending request to AI with context length:", context.length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "Ты профессиональный психолог. Отвечай ТОЛЬКО валидным JSON без markdown форматирования."
          },
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
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Слишком много запросов. Попробуйте позже." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Превышен лимит AI-запросов." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content;
    
    console.log("Raw AI response:", rawContent);

    // Try to parse as structured JSON
    let structuredAnalysis: StructuredAnalysis | null = null;
    let analysis: string;

    try {
      // Clean up potential markdown formatting
      const cleanedContent = rawContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      structuredAnalysis = JSON.parse(cleanedContent) as StructuredAnalysis;
      
      // Format as readable text for backward compatibility
      analysis = formatStructuredAnalysis(structuredAnalysis, pss10 !== undefined, burnout !== undefined);
    } catch (parseError) {
      console.log("Could not parse as JSON, using raw text:", parseError);
      analysis = rawContent;
    }

    return new Response(
      JSON.stringify({ 
        analysis,
        structured: structuredAnalysis 
      }),
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

function formatStructuredAnalysis(
  data: StructuredAnalysis, 
  hasStress: boolean, 
  hasBurnout: boolean
): string {
  let result = `📋 КРАТКИЙ ВЫВОД\n${data.summary}\n\n`;
  
  result += `📊 ДЕТАЛЬНЫЙ АНАЛИЗ\n\n`;
  result += `💙 Депрессия:\n${data.detailedAnalysis.depression}\n\n`;
  result += `💜 Тревожность:\n${data.detailedAnalysis.anxiety}\n\n`;
  
  if (hasStress && data.detailedAnalysis.stress) {
    result += `⚡ Стресс:\n${data.detailedAnalysis.stress}\n\n`;
  }
  
  if (hasBurnout && data.detailedAnalysis.burnout) {
    result += `🔥 Выгорание:\n${data.detailedAnalysis.burnout}\n\n`;
  }
  
  result += `🔑 КЛЮЧЕВЫЕ ФАКТОРЫ\n`;
  data.keyFactors.forEach((factor, i) => {
    result += `${i + 1}. ${factor}\n`;
  });
  
  result += `\n✨ РЕКОМЕНДАЦИИ\n`;
  data.recommendations.forEach((rec, i) => {
    result += `${i + 1}. ${rec}\n`;
  });
  
  if (data.professionalHelp) {
    result += `\n⚠️ ВАЖНО: Рекомендуется консультация специалиста`;
  }
  
  return result;
}