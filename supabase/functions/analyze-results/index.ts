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
    let context = `Ты — заботливый психолог-консультант. Твоя задача — поддержать человека и помочь ему понять свои результаты.

ДАННЫЕ АНКЕТИРОВАНИЯ:

Эмоциональный фон (PHQ-9): ${phq9.score}/${phq9.maxScore} баллов
   Показатель: ${phq9.severity}
   Описание: ${phq9.description}

Уровень беспокойства (GAD-7): ${gad7.score}/${gad7.maxScore} баллов
   Показатель: ${gad7.severity}
   Описание: ${gad7.description}`;

    if (pss10) {
      context += `

Напряжённость (PSS-10): ${pss10.score}/${pss10.maxScore} баллов
   Показатель: ${pss10.severity}
   Описание: ${pss10.description}`;
    }

    if (burnout) {
      context += `

Учебная усталость: ${burnout.score}/${burnout.maxScore} баллов
   Показатель: ${burnout.severity}
   Описание: ${burnout.description}`;
    }

    context += `

Общая картина: ${overallRisk === "LOW" ? "стабильное состояние" : overallRisk === "MEDIUM" ? "есть области для внимания" : "рекомендуется поддержка"}

ТРЕБОВАНИЯ К ОТВЕТУ (строго JSON):

{
  "summary": "2-3 предложения ПРОСТЫМ языком. Фокус на позитивных аспектах и ресурсах человека. Избегай слов: диагноз, расстройство, патология, симптомы.",
  "detailedAnalysis": {
    "depression": "Опиши эмоциональный фон мягко и поддерживающе. Что показывают ответы о настроении и энергии.",
    "anxiety": "Опиши уровень беспокойства. Как это может проявляться в повседневной жизни."${pss10 ? `,
    "stress": "Опиши способность справляться с нагрузками. Какие есть сильные стороны."` : ""}${burnout ? `,
    "burnout": "Опиши отношение к учёбе. Есть ли признаки усталости от нагрузок."` : ""}
  },
  "keyFactors": [
    "На что указывают ответы (нейтрально, без драматизации)",
    "Что может влиять на текущее состояние",
    "Какие ресурсы есть у человека"
  ],
  "recommendations": [
    "Простая практическая рекомендация 1",
    "Простая практическая рекомендация 2", 
    "Простая практическая рекомендация 3",
    "Простая практическая рекомендация 4"
  ],
  "professionalHelp": ${overallRisk === "HIGH" || overallRisk === "CRITICAL" ? "true" : "false"}
}

КРИТИЧЕСКИ ВАЖНО:
- Тёплый, поддерживающий, НЕМЕДИЦИНСКИЙ язык
- НИКОГДА не используй: диагноз, расстройство, патология, симптомы, клинический, лечение
- Вместо этого используй: состояние, самочувствие, настроение, энергия, ресурсы
- Снижай тревожность пользователя своими формулировками
- Подчёркивай, что это лишь отражение текущего момента, не приговор
- Рекомендации должны быть простыми и выполнимыми
- Отвечай ТОЛЬКО валидным JSON`;

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