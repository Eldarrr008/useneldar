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
            content: `Ты — эмпатичный AI-помощник для студентов, который помогает справляться с учебным стрессом и эмоциональными трудностями. 
            
Твоя задача:
1. Внимательно слушать и поддерживать студента
2. Задавать уточняющие вопросы
3. Предлагать конкретные техники для снижения стресса
4. Быть эмпатичным и понимающим

ВАЖНО: Если студент выражает мысли о суициде, самоповреждении или сильный кризис, ты должен:
1. Выразить серьезную обеспокоенность
2. Настоятельно рекомендовать обратиться к психологу
3. Указать, что это серьезная ситуация требующая помощи специалиста

Отвечай коротко (2-3 предложения), по-дружески, на русском языке.`,
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

    // Crisis detection keywords
    const crisisKeywords = [
      "суицид", "убить себя", "покончить с собой", "не хочу жить",
      "смерть", "самоубийство", "умереть", "жизнь не имеет смысла",
      "хочу умереть", "самоповреждение", "порезать себя", "причинить вред"
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
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});