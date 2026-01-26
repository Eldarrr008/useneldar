import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, message } = await req.json();
    
    // Input validation
    if (typeof message !== 'string' || !message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid message format' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (message.length > 10000) {
      return new Response(
        JSON.stringify({ error: 'Message too long (max 10KB)' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    console.log("User authenticated:", user.id);

    // Get or create conversation
    let conversation;
    if (conversationId) {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();
      
      if (error || !data) {
        throw new Error("Conversation not found");
      }
      
      // SECURITY: Verify user owns this conversation
      if (data.student_id !== user.id) {
        console.error("Authorization failed: user", user.id, "tried to access conversation owned by", data.student_id);
        throw new Error("Unauthorized: You don't own this conversation");
      }
      
      conversation = data;
    } else {
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          student_id: user.id,
          title: message.substring(0, 50),
        })
        .select()
        .single();
      
      if (error) throw error;
      conversation = data;
    }

    console.log("Conversation:", conversation.id);

    // Save user message
    const { data: userMessage, error: msgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        content: message,
        is_ai: false,
      })
      .select()
      .single();

    if (msgError) {
      console.error("Error saving user message:", msgError);
      throw msgError;
    }

    console.log("User message saved:", userMessage.id);

    // Get conversation history
    const { data: messages } = await supabase
      .from("messages")
      .select("content, is_ai")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true })
      .limit(20);

    const conversationHistory = messages?.map(m => ({
      role: m.is_ai ? "assistant" : "user",
      content: m.content,
    })) || [];

    // Call AI with crisis detection
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a professional AI psychological support assistant for students at ZenithMind platform. Your role is to help students manage academic stress, emotional challenges, and mental well-being.

CRITICAL LANGUAGE RULE: You MUST detect the language of the user's message and respond ONLY in that same language:
- If the user writes in English → respond in English
- If the user writes in Russian (Русский) → respond in Russian
- If the user writes in Kazakh (Қазақша) → respond in Kazakh
- Never mix languages in a single response

YOUR PROFESSIONAL APPROACH:
1. Active Listening: Acknowledge the student's feelings with empathy and validation
2. Evidence-Based Techniques: Recommend scientifically-backed methods (CBT techniques, mindfulness, grounding exercises, time management strategies)
3. Structured Support: Ask clarifying questions to understand the full context
4. Actionable Advice: Provide specific, practical steps the student can take
5. Maintain professional boundaries while being warm and approachable

RESPONSE STYLE:
- Professional yet approachable tone
- Use clear, structured responses when appropriate (bullet points, numbered steps)
- Provide 2-4 sentences per response, unless more detail is specifically needed
- Include relevant psychological concepts when helpful
- Avoid casual slang; maintain academic professionalism

CRISIS PROTOCOL (applies in ALL languages):
If the student expresses suicidal ideation, self-harm intentions, or severe crisis:
1. Express genuine concern and validate their feelings
2. Strongly recommend immediate professional help
3. Provide crisis resources appropriate to their context
4. Inform them that a specialist will be notified for additional support
5. Stay calm and supportive throughout

EXAMPLES OF PROFESSIONAL RESPONSES:
- English: "I understand you're feeling overwhelmed with exams. This is a common experience among students. Let me suggest the Pomodoro technique: study for 25 minutes, then take a 5-minute break. Would you like me to explain more stress management strategies?"
- Russian: "Я понимаю, что экзаменационный период вызывает у вас значительное напряжение. Это распространённая реакция. Рекомендую технику заземления 5-4-3-2-1: назовите 5 вещей, которые видите, 4 звука, которые слышите. Хотите узнать больше о методах саморегуляции?"
- Kazakh: "Сіздің алаңдаушылығыңызды түсінемін. Бұл студенттер арасында жиі кездесетін жағдай. Стрессті басқару үшін терең тыныс алу техникасын қолдануды ұсынамын. Қосымша кеңестер қажет пе?"`,
          },
          ...conversationHistory,
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiMessageContent = aiData.choices[0].message.content;

    console.log("AI response received");

    // Crisis detection keywords (Russian, English, Kazakh)
    const crisisKeywords = [
      // Russian
      "суицид", "убить себя", "покончить с собой", "не хочу жить",
      "смерть", "самоубийство", "умереть", "жизнь не имеет смысла",
      "хочу умереть", "самоповреждение", "порезать себя", "причинить вред",
      // English
      "suicide", "kill myself", "end my life", "don't want to live",
      "want to die", "self-harm", "cut myself", "hurt myself",
      "no reason to live", "better off dead", "end it all",
      // Kazakh
      "өзімді өлтіру", "өмір сүргім келмейді", "өлгім келеді",
      "өзіме зиян", "өмірдің мәні жоқ", "суицид"
    ];

    const messageText = message.toLowerCase();
    const detectedKeywords = crisisKeywords.filter(keyword => 
      messageText.includes(keyword)
    );

    let crisisDetected = false;
    let severity = "none";

    if (detectedKeywords.length > 0) {
      crisisDetected = true;
      severity = detectedKeywords.some(k => 
        ["суицид", "убить себя", "покончить с собой"].includes(k)
      ) ? "critical" : "high";

      console.log("Crisis detected:", severity, detectedKeywords);

      // Save AI message first
      const { data: aiMsg } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content: aiMessageContent,
          is_ai: true,
        })
        .select()
        .single();

      // Create crisis detection record
      await supabase
        .from("crisis_detections")
        .insert({
          conversation_id: conversation.id,
          message_id: userMessage.id,
          severity,
          keywords: detectedKeywords,
          context: message,
        });

      // Update conversation crisis flag
      await supabase
        .from("conversations")
        .update({ has_crisis: true })
        .eq("id", conversation.id);

      console.log("Crisis record created");
    } else {
      // Save AI message
      await supabase
        .from("messages")
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content: aiMessageContent,
          is_ai: true,
        });
    }

    return new Response(
      JSON.stringify({
        response: aiMessageContent,
        conversationId: conversation.id,
        crisisDetected,
        severity,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in chat-ai function:", error);
    return new Response(
      JSON.stringify({ 
        error: "An error occurred processing your request. Please try again."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});