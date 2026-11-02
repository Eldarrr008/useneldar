import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BookOpen, ExternalLink, Loader2, RefreshCw, Save, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Methodology = Database["public"]["Tables"]["methodology_catalog"]["Row"];

export function MethodologyCatalog() {
  const [items, setItems] = useState<Methodology[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Methodology | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    setFailed(false);
    const { data, error } = await supabase.from("methodology_catalog").select("*").order("title");
    if (error) setFailed(true);
    else setItems(data ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const saveNotes = async () => {
    if (!selected || saving) return;
    setSaving(true);
    const { data, error } = await supabase.from("methodology_catalog")
      .update({ review_notes: notes.trim() }).eq("id", selected.id).select("*").single();
    setSaving(false);
    if (error || !data) {
      toast({ variant: "destructive", title: "Не удалось сохранить замечания" });
      return;
    }
    setItems(previous => previous.map(item => item.id === data.id ? data : item));
    setSelected(data);
    toast({ title: "Замечания сохранены" });
  };

  const filtered = items.filter(item => (category === "all" || item.category === category)
    && `${item.title} ${item.category}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));

  return (
    <section aria-labelledby="methodology-heading" className="space-y-4 border-y py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="methodology-heading" className="flex items-center gap-2 text-lg font-semibold">
          <BookOpen className="h-5 w-5 text-primary" /> Каталог психологических методик
        </h2>
        <Badge variant="secondary">На рассмотрении · {items.length}</Badge>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input aria-label="Поиск методик" placeholder="Поиск методик" className="pl-9" value={search} onChange={event => setSearch(event.target.value)} />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger aria-label="Категория методики" className="sm:w-72"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {[...new Set(items.map(item => item.category))].map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {loading ? <div role="status" className="flex items-center gap-2 py-8 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Загрузка методик…</div>
        : failed ? <div role="alert" className="flex flex-wrap items-center gap-3 py-6"><p>Не удалось загрузить каталог.</p><Button variant="outline" onClick={() => void load()}><RefreshCw className="mr-2 h-4 w-4" />Повторить</Button></div>
        : filtered.length === 0 ? <p className="py-6 text-muted-foreground">Методики не найдены</p>
        : <div className="grid gap-3 md:grid-cols-2">
          {filtered.map(item => (
            <article key={item.id} className="flex flex-col items-start gap-3 rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">{item.category}</p>
              <h3 className="font-semibold">{item.title}</h3>
              <Badge variant="outline">Черновик · не доступен ученикам</Badge>
              <p className="text-sm text-muted-foreground">{item.evidence_notes}</p>
              <Button variant="outline" size="sm" className="mt-auto" onClick={() => { setSelected(item); setNotes(item.review_notes); }}>Рассмотреть методику</Button>
            </article>
          ))}
        </div>}
      <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open && !saving) setSelected(null); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>{selected?.category} · Черновик</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{selected?.evidence_notes}</p>
          {selected?.source_url && <Button asChild variant="outline" className="w-fit"><a href={selected.source_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Источник</a></Button>}
          <div className="space-y-2">
            <Label htmlFor="methodology-notes">Замечания к методике</Label>
            <Textarea id="methodology-notes" rows={6} maxLength={10000} value={notes} onChange={event => setNotes(event.target.value)} />
          </div>
          <Button onClick={() => void saveNotes()} disabled={saving} className="justify-self-end"><Save className="mr-2 h-4 w-4" />{saving ? "Сохранение…" : "Сохранить замечания"}</Button>
        </DialogContent>
      </Dialog>
    </section>
  );
}