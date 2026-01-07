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
      const { data, error } = await supabase
        .from("classrooms")
        .select("id, name, description, psychologist_id")
        .eq("join_code", classroomCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (error) {
        setClassroom(null);
        if (error.code !== "PGRST116") { // Not found is expected
          console.error("Error checking classroom:", error);
        }
      } else {
        setClassroom(data);
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
    if (!classroom) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Redirect to auth with return URL
        navigate(`/auth?redirect=/join?code=${code}`);
        return;
      }

      // Add student to classroom
      const { error: memberError } = await supabase
        .from("classroom_members")
        .upsert({
          classroom_id: classroom.id,
          student_id: user.id,
        }, { onConflict: "classroom_id,student_id" });

      if (memberError) throw memberError;

      // Update student data with classroom
      await supabase
        .from("student_data")
        .update({ classroom_id: classroom.id })
        .eq("user_id", user.id);

      toast({
        title: "Успешно!",
        description: `Вы присоединились к классу "${classroom.name}"`,
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
