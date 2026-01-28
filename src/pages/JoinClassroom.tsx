import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, Loader2 } from "lucide-react";

interface Classroom {
  id: string;
  name: string;
  description: string | null;
  psychologist_id: string;
}

interface JoinClassroomResult {
  success: boolean;
  error?: string;
  classroom_id?: string;
  classroom_name?: string;
}

const JoinClassroom = () => {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [loading, setLoading] = useState(false);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const initialCode = searchParams.get("code");
    if (initialCode && initialCode.length === 6) {
      checkClassroom(initialCode);
    }
  }, [searchParams]);

  const checkClassroom = async (classroomCode: string) => {
    if (classroomCode.length !== 6) {
      setClassroom(null);
      return;
    }

    setChecking(true);
    try {
      // Use secure RPC function to check classroom without exposing all codes
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // For non-authenticated users, show generic message
        setClassroom({ id: "", name: "Класс найден", description: "Войдите для присоединения", psychologist_id: "" });
        return;
      }

      // Try to verify via the secure function (this will just check, not join)
      const { data, error } = await supabase.rpc("verify_and_join_classroom", {
        p_join_code: classroomCode.toUpperCase()
      });

      const result = data as unknown as JoinClassroomResult;

      if (error) {
        console.error("Error checking classroom:", error);
        setClassroom(null);
      } else if (result?.success) {
        setClassroom({
          id: result.classroom_id || "",
          name: result.classroom_name || "",
          description: null,
          psychologist_id: ""
        });
      } else if (result?.error === "Already a member of this classroom") {
        // Already a member - still show classroom info
        setClassroom({
          id: "",
          name: "Вы уже в этом классе",
          description: "Перейдите к опросу",
          psychologist_id: ""
        });
      } else {
        setClassroom(null);
      }
    } catch (error) {
      console.error("Error:", error);
      setClassroom(null);
    } finally {
      setChecking(false);
    }
  };

  const handleCodeChange = (value: string) => {
    const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setCode(formatted);
    
    if (formatted.length === 6) {
      checkClassroom(formatted);
    } else {
      setClassroom(null);
    }
  };

  const handleJoin = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Redirect to auth with return URL
        navigate(`/auth?redirect=/join?code=${code}`);
        return;
      }

      // Use secure RPC function to join classroom
      const { data, error } = await supabase.rpc("verify_and_join_classroom", {
        p_join_code: code.toUpperCase()
      });

      if (error) throw error;

      const result = data as unknown as JoinClassroomResult;

      if (!result?.success) {
        if (result?.error === "Already a member of this classroom") {
          toast({
            title: "Вы уже в этом классе",
            description: "Переходим к опросу...",
          });
          navigate(`/survey?code=${code}`);
          return;
        }
        throw new Error(result?.error || "Не удалось присоединиться");
      }

      toast({
        title: "Успешно!",
        description: `Вы присоединились к классу "${result.classroom_name}"`,
      });

      // Redirect to survey with classroom code
      navigate(`/survey?code=${code}`);

    } catch (error: any) {
      console.error("Error joining classroom:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось присоединиться к классу",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <CardTitle className="text-xl">Войти в класс</CardTitle>
              <CardDescription>
                Введите код, полученный от психолога
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="code">Код класса</Label>
            <Input
              id="code"
              type="text"
              placeholder="XXXXXX"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="text-center text-2xl tracking-widest font-mono"
              maxLength={6}
            />
            {checking && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Проверка кода...
              </p>
            )}
          </div>

          {classroom && (
            <Card className="bg-accent/10 border-accent">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">{classroom.name}</p>
                    {classroom.description && (
                      <p className="text-sm text-muted-foreground">{classroom.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {code.length === 6 && !classroom && !checking && (
            <p className="text-sm text-destructive text-center">
              Класс с таким кодом не найден
            </p>
          )}

          <Button
            onClick={handleJoin}
            disabled={!classroom || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Присоединение...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Присоединиться и пройти тест
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinClassroom;
