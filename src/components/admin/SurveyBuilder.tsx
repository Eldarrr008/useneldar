import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  FileText,
  ListChecks,
  Type,
  SlidersHorizontal,
  Loader2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface SurveyQuestion {
  id: string;
  text: string;
  type: "single-choice" | "multiple-choice" | "scale" | "text";
  required: boolean;
  options: { id: string; label: string; value: number | string }[];
}

interface CustomSurvey {
  id?: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  is_active: boolean;
}

const questionTypeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  "single-choice": { label: "Один ответ", icon: <ListChecks className="h-4 w-4" /> },
  "multiple-choice": { label: "Несколько ответов", icon: <ListChecks className="h-4 w-4" /> },
  scale: { label: "Шкала", icon: <SlidersHorizontal className="h-4 w-4" /> },
  text: { label: "Текстовый ответ", icon: <Type className="h-4 w-4" /> },
};

function generateId() {
  return "q_" + Math.random().toString(36).substring(2, 9);
}

export function SurveyBuilder() {
  const [survey, setSurvey] = useState<CustomSurvey>({
    title: "",
    description: "",
    questions: [],
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const addQuestion = (type: SurveyQuestion["type"]) => {
    const newQ: SurveyQuestion = {
      id: generateId(),
      text: "",
      type,
      required: true,
      options:
        type === "single-choice" || type === "multiple-choice"
          ? [
              { id: generateId(), label: "Вариант 1", value: 0 },
              { id: generateId(), label: "Вариант 2", value: 1 },
            ]
          : type === "scale"
          ? [
              { id: generateId(), label: "Никогда", value: 0 },
              { id: generateId(), label: "Несколько дней", value: 1 },
              { id: generateId(), label: "Более половины дней", value: 2 },
              { id: generateId(), label: "Почти каждый день", value: 3 },
            ]
          : [],
    };
    setSurvey((prev) => ({ ...prev, questions: [...prev.questions, newQ] }));
  };

  const updateQuestion = (index: number, updates: Partial<SurveyQuestion>) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? { ...q, ...updates } : q)),
    }));
  };

  const removeQuestion = (index: number) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const moveQuestion = (from: number, to: number) => {
    if (to < 0 || to >= survey.questions.length) return;
    setSurvey((prev) => {
      const questions = [...prev.questions];
      const [moved] = questions.splice(from, 1);
      questions.splice(to, 0, moved);
      return { ...prev, questions };
    });
  };

  const addOption = (qIndex: number) => {
    const q = survey.questions[qIndex];
    updateQuestion(qIndex, {
      options: [
        ...q.options,
        { id: generateId(), label: `Вариант ${q.options.length + 1}`, value: q.options.length },
      ],
    });
  };

  const updateOption = (qIndex: number, optIndex: number, label: string) => {
    const q = survey.questions[qIndex];
    const options = q.options.map((o, i) => (i === optIndex ? { ...o, label } : o));
    updateQuestion(qIndex, { options });
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const q = survey.questions[qIndex];
    updateQuestion(qIndex, { options: q.options.filter((_, i) => i !== optIndex) });
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    moveQuestion(dragIndex, index);
    setDragIndex(index);
  }, [dragIndex, survey.questions.length]);

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const saveSurvey = async () => {
    if (!survey.title.trim()) {
      toast({ variant: "destructive", title: "Введите название опроса" });
      return;
    }
    if (survey.questions.length === 0) {
      toast({ variant: "destructive", title: "Добавьте хотя бы один вопрос" });
      return;
    }
    const emptyQ = survey.questions.find((q) => !q.text.trim());
    if (emptyQ) {
      toast({ variant: "destructive", title: "Заполните текст всех вопросов" });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("custom_surveys").insert({
        title: survey.title.trim(),
        description: survey.description.trim() || null,
        questions: JSON.parse(JSON.stringify(survey.questions)),
        created_by: user.id,
        is_active: survey.is_active,
      });

      if (error) throw error;

      toast({ title: "Опрос сохранён", description: "Пользовательский опрос успешно создан" });
      setSurvey({ title: "", description: "", questions: [], is_active: true });
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving survey:", error);
      toast({ variant: "destructive", title: "Ошибка", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Создать опрос
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Конструктор опросов
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Survey Meta */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Название опроса</Label>
              <Input
                placeholder="Например: Опрос эмоционального состояния"
                value={survey.title}
                onChange={(e) => setSurvey((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Описание (необязательно)</Label>
              <Textarea
                placeholder="Краткое описание опроса..."
                value={survey.description}
                onChange={(e) => setSurvey((prev) => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Вопросы ({survey.questions.length})
              </Label>
            </div>

            {survey.questions.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Добавьте вопросы с помощью кнопок ниже</p>
                </CardContent>
              </Card>
            )}

            {survey.questions.map((q, qIndex) => (
              <Card
                key={q.id}
                className={`border transition-all ${dragIndex === qIndex ? "opacity-50 border-primary" : ""}`}
                draggable
                onDragStart={() => handleDragStart(qIndex)}
                onDragOver={(e) => handleDragOver(e, qIndex)}
                onDragEnd={handleDragEnd}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-2">
                    <div className="cursor-grab pt-1 text-muted-foreground hover:text-foreground">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1 text-xs">
                          {questionTypeLabels[q.type]?.icon}
                          {questionTypeLabels[q.type]?.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">#{qIndex + 1}</span>
                      </div>
                      <Input
                        placeholder="Текст вопроса..."
                        value={q.text}
                        onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveQuestion(qIndex, qIndex - 1)} disabled={qIndex === 0}>
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveQuestion(qIndex, qIndex + 1)} disabled={qIndex === survey.questions.length - 1}>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeQuestion(qIndex)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {(q.type === "single-choice" || q.type === "multiple-choice" || q.type === "scale") && (
                  <CardContent className="pt-0 space-y-2">
                    {q.options.map((opt, optIndex) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-5">{optIndex + 1}.</span>
                        <Input
                          className="flex-1 h-8 text-sm"
                          value={opt.label}
                          onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                        />
                        {q.options.length > 2 && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeOption(qIndex, optIndex)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => addOption(qIndex)}>
                      <Plus className="h-3 w-3" />
                      Добавить вариант
                    </Button>
                  </CardContent>
                )}
              </Card>
            ))}

            {/* Add Question Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addQuestion("single-choice")}>
                <ListChecks className="h-3.5 w-3.5" />
                Один ответ
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addQuestion("multiple-choice")}>
                <ListChecks className="h-3.5 w-3.5" />
                Несколько ответов
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addQuestion("scale")}>
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Шкала
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addQuestion("text")}>
                <Type className="h-3.5 w-3.5" />
                Текстовый
              </Button>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={saveSurvey} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Сохранить опрос
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
