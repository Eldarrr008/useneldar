import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClassroomAnalysisRequest {
  classroomId: string;
}

interface StudentSurveyData {
  studentName: string;
  phq9Score: number | null;
  gad7Score: number | null;
  pssScore: number | null;
  burnoutScore: number | null;
  overallRisk: string | null;
  lastSurveyDate: string | null;
}

interface ClassroomAnalysisResponse {
  summary: string;
  riskDistribution: {
    low: number;
    moderate: number;
    high: number;
    critical: number;
    noData: number;
  };
  trends: string[];
  concerns: string[];
  recommendations: string[];
  priorityStudents: string[];
}

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

    const { classroomId }: ClassroomAnalysisRequest = await req.json();

    // Verify psychologist owns this classroom
    const { data: classroom, error: classroomError } = await supabase
      .from("classrooms")
      .select("id, name, psychologist_id")
      .eq("id", classroomId)
      .single();

    if (classroomError || !classroom) {
      return new Response(
        JSON.stringify({ error: "Classroom not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (classroom.psychologist_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get classroom members
    const { data: members, error: membersError } = await supabase
      .from("classroom_members")
      .select("student_id")
      .eq("classroom_id", classroomId);

    if (membersError) throw membersError;

    if (!members || members.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "No students in classroom",
          analysis: null 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const studentIds = members.map(m => m.student_id);

    // Get student profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", studentIds);

    // Get latest survey responses for each student
    const { data: surveyResponses } = await supabase
      .from("survey_responses")
      .select("user_id, phq9_score, gad7_score, pss_score, burnout_score, overall_risk, completed_at")
      .in("user_id", studentIds)
      .order("completed_at", { ascending: false });

    // Build student data with latest results
    const studentsData: StudentSurveyData[] = studentIds.map(studentId => {
      const profile = profiles?.find(p => p.id === studentId);
      const latestSurvey = surveyResponses?.find(s => s.user_id === studentId);
      
      return {
        studentName: profile?.full_name || "Без имени",
        phq9Score: latestSurvey?.phq9_score || null,
        gad7Score: latestSurvey?.gad7_score || null,
        pssScore: latestSurvey?.pss_score || null,
        burnoutScore: latestSurvey?.burnout_score || null,
        overallRisk: latestSurvey?.overall_risk || null,
        lastSurveyDate: latestSurvey?.completed_at || null,
      };
    });

    // Calculate risk distribution
    const riskDistribution = {
      low: studentsData.filter(s => s.overallRisk === "LOW").length,
      moderate: studentsData.filter(s => s.overallRisk === "MODERATE" || s.overallRisk === "MEDIUM").length,
      high: studentsData.filter(s => s.overallRisk === "HIGH").length,
      critical: studentsData.filter(s => s.overallRisk === "CRITICAL").length,
      noData: studentsData.filter(s => !s.overallRisk).length,
    };

    // Calculate averages
    const withScores = studentsData.filter(s => s.phq9Score !== null);
    const avgPHQ9 = withScores.length > 0 
      ? (withScores.reduce((sum, s) => sum + (s.phq9Score || 0), 0) / withScores.length).toFixed(1)
      : "N/A";
    const avgGAD7 = withScores.length > 0
      ? (withScores.reduce((sum, s) => sum + (s.gad7Score || 0), 0) / withScores.length).toFixed(1)
      : "N/A";

    // Build AI prompt
    const prompt = `Ты — школьный психолог-аналитик. Проанализируй данные диагностики класса "${classroom.name}" и составь профессиональный отчёт.

СТАТИСТИКА КЛАССА:
- Всего учащихся: ${studentsData.length}
- Прошли диагностику: ${withScores.length}
- Распределение по уровню риска:
  • Низкий риск: ${riskDistribution.low}
  • Умеренный: ${riskDistribution.moderate}
  • Высокий: ${riskDistribution.high}
  • Критический: ${riskDistribution.critical}
  • Без данных: ${riskDistribution.noData}

СРЕДНИЕ ПОКАЗАТЕЛИ:
- PHQ-9 (депрессия): ${avgPHQ9}/27
- GAD-7 (тревожность): ${avgGAD7}/21

ИНДИВИДУАЛЬНЫЕ ДАННЫЕ (анонимизированы):
${studentsData.map((s, i) => 
  `Ученик ${i + 1}: PHQ-9=${s.phq9Score ?? "—"}, GAD-7=${s.gad7Score ?? "—"}, Риск=${s.overallRisk || "не определён"}`
).join("\n")}

ТРЕБОВАНИЯ К ОТВЕТУ (строго JSON):
{
  "summary": "2-3 предложения общей оценки состояния класса",
  "trends": [
    "Выявленный тренд или паттерн 1",
    "Выявленный тренд или паттерн 2",
    "Выявленный тренд или паттерн 3"
  ],
  "concerns": [
    "Область для внимания 1",
    "Область для внимания 2"
  ],
  "recommendations": [
    "Конкретная рекомендация для работы с классом 1",
    "Конкретная рекомендация для работы с классом 2",
    "Конкретная рекомендация для работы с классом 3",
    "Конкретная рекомендация для работы с классом 4"
  ],
  "priorityStudents": [
    "Краткое описание учеников требующих приоритетного внимания (без имён, по номерам)"
  ]
}

ВАЖНО:
- Профессиональный, но понятный язык
- Конкретные, выполнимые рекомендации
- Фокус на групповой динамике и паттернах
- Отвечай ТОЛЬКО валидным JSON`;

    console.log("Sending classroom analysis request to AI");

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
            content: "Ты профессиональный школьный психолог. Отвечай ТОЛЬКО валидным JSON без markdown."
          },
          {
            role: "user",
            content: prompt,
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

    // Parse JSON response
    let analysis: ClassroomAnalysisResponse;
    try {
      const cleanedContent = rawContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      analysis = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return fallback analysis
      analysis = {
        summary: "Анализ класса выполнен. Рекомендуется индивидуальная работа с учащимися из группы риска.",
        riskDistribution,
        trends: ["Требуется больше данных для выявления трендов"],
        concerns: riskDistribution.high + riskDistribution.critical > 0 
          ? ["Есть учащиеся с повышенным уровнем риска"] 
          : [],
        recommendations: [
          "Провести дополнительную диагностику",
          "Организовать групповую работу по снижению стресса",
          "Установить индивидуальный контакт с учащимися из группы риска"
        ],
        priorityStudents: []
      };
    }

    // Add risk distribution to response
    analysis.riskDistribution = riskDistribution;

    return new Response(
      JSON.stringify({ 
        analysis,
        classroomName: classroom.name,
        totalStudents: studentsData.length,
        completedSurveys: withScores.length,
        averageScores: {
          phq9: avgPHQ9,
          gad7: avgGAD7
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-classroom function:", error);
    return new Response(
      JSON.stringify({ error: "Произошла ошибка при анализе. Попробуйте позже." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
