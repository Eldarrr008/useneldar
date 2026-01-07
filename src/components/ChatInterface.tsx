import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, AlertTriangle, Bot, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Message {
  id: string;
  content: string;
  is_ai: boolean;
  created_at: string;
}

interface ChatInterfaceProps {
  userId: string;
}

export const ChatInterface = ({ userId }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [crisisWarning, setCrisisWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (conversationId) {
      loadMessages();

      const channel = supabase
        .channel(`messages:${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);
    setCrisisWarning(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await supabase.functions.invoke("chat-ai", {
        body: {
          conversationId,
          message: userMessage,
        },
      });

      if (response.error) {
        throw response.error;
      }

      const { conversationId: newConvId, crisisDetected, severity } = response.data;

      if (!conversationId && newConvId) {
        setConversationId(newConvId);
      }

      if (crisisDetected) {
        setCrisisWarning(true);
        toast({
          variant: "destructive",
          title: "Обнаружена кризисная ситуация",
          description: `Уровень: ${severity === "critical" ? "Критический" : "Высокий"}. Специалист будет уведомлён.`,
        });
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Ошибка отправки",
        description: error.message || "Не удалось отправить сообщение",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[600px] flex-col bg-background">
      {/* Crisis Warning */}
      {crisisWarning && (
        <Alert variant="destructive" className="m-4 mb-0 border-destructive/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Обнаружены признаки кризисной ситуации. Специалист психологической службы будет уведомлён. 
            При необходимости обратитесь за помощью.
          </AlertDescription>
        </Alert>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <Bot className="h-8 w-8 text-accent" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">Служба психологической поддержки</p>
                <p className="text-sm text-muted-foreground max-w-md">
                  Здравствуйте. Я AI-ассистент психологической службы. Расскажите о том, 
                  что вас беспокоит. Все сообщения конфиденциальны.
                </p>
              </div>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.is_ai ? "justify-start" : "justify-end"
              }`}
            >
              {message.is_ai && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <Bot className="h-4 w-4 text-accent" />
                </div>
              )}
              <Card
                className={`max-w-[75%] px-4 py-3 shadow-sm ${
                  message.is_ai
                    ? "bg-muted border-muted"
                    : "bg-primary text-primary-foreground border-primary"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                <p className={`mt-2 text-xs ${message.is_ai ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
                  {new Date(message.created_at).toLocaleTimeString("ru-RU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </Card>
              {!message.is_ai && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-card p-4">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите сообщение..."
            disabled={loading}
            className="flex-1 bg-background"
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground text-center">
          Данные передаются по защищённому каналу
        </p>
      </div>
    </div>
  );
};