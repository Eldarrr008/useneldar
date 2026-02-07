import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Headphones,
  Video,
  Quote,
  Sparkles,
  Waves,
  TreePine,
  Cloud,
  Bird,
  Flame,
  Wind,
  ChevronLeft,
  ChevronRight,
  Heart,
  Moon,
  Sun,
  Coffee,
  X,
  Brain,
  Lightbulb,
  Leaf,
  Film,
  BookOpen
} from "lucide-react";

interface SoundItem {
  id: string;
  icon: React.ReactNode;
  labelKey: string;
  youtubeId: string;
  gradient: string;
}

interface VideoItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
  youtubeId: string;
  duration: string;
  category: "relaxation" | "motivation" | "sleep" | "films";
  language: "ru" | "en" | "multi";
}

interface QuoteItem {
  id: string;
  textKey: string;
  author: string;
  authorRoleKey: string;
  category: "philosophy" | "psychology" | "growth" | "modern";
}

const sounds: SoundItem[] = [
  { id: "rain", icon: <Cloud className="h-6 w-6" />, labelKey: "wellness.sounds.rain", youtubeId: "mPZkdNFkNps", gradient: "from-blue-500/20 to-slate-500/20" },
  { id: "ocean", icon: <Waves className="h-6 w-6" />, labelKey: "wellness.sounds.ocean", youtubeId: "WHPEKLQID4U", gradient: "from-cyan-500/20 to-blue-500/20" },
  { id: "forest", icon: <TreePine className="h-6 w-6" />, labelKey: "wellness.sounds.forest", youtubeId: "xNN7iTA57jM", gradient: "from-green-500/20 to-emerald-500/20" },
  { id: "birds", icon: <Bird className="h-6 w-6" />, labelKey: "wellness.sounds.birds", youtubeId: "Qm846KdZN_c", gradient: "from-amber-500/20 to-yellow-500/20" },
  { id: "fireplace", icon: <Flame className="h-6 w-6" />, labelKey: "wellness.sounds.fireplace", youtubeId: "L_LUpnjgPso", gradient: "from-orange-500/20 to-red-500/20" },
  { id: "wind", icon: <Wind className="h-6 w-6" />, labelKey: "wellness.sounds.wind", youtubeId: "sGkh1W5cbH4", gradient: "from-slate-500/20 to-gray-500/20" },
];

const videos: VideoItem[] = [
  // Relaxation
  { 
    id: "breathing", 
    titleKey: "wellness.videos.breathing.title",
    descriptionKey: "wellness.videos.breathing.description",
    youtubeId: "DbDoBzGY3vo", 
    duration: "5:00",
    category: "relaxation",
    language: "multi"
  },
  { 
    id: "meditation", 
    titleKey: "wellness.videos.meditation.title",
    descriptionKey: "wellness.videos.meditation.description",
    youtubeId: "O-6f5wQXSu8", 
    duration: "10:00",
    category: "relaxation",
    language: "multi"
  },
  { 
    id: "focus", 
    titleKey: "wellness.videos.focus.title",
    descriptionKey: "wellness.videos.focus.description",
    youtubeId: "XULUBg_ZcAU", 
    duration: "45:00",
    category: "relaxation",
    language: "multi"
  },
  // Sleep
  { 
    id: "sleep", 
    titleKey: "wellness.videos.sleep.title",
    descriptionKey: "wellness.videos.sleep.description",
    youtubeId: "1ZYbU82GVz4", 
    duration: "60:00",
    category: "sleep",
    language: "multi"
  },
  // Motivation - Russian
  { 
    id: "motivation_ru1", 
    titleKey: "wellness.videos.motivationRu1.title",
    descriptionKey: "wellness.videos.motivationRu1.description",
    youtubeId: "PzI0hmNqGLY", 
    duration: "8:12",
    category: "motivation",
    language: "ru"
  },
  { 
    id: "motivation_ru2", 
    titleKey: "wellness.videos.motivationRu2.title",
    descriptionKey: "wellness.videos.motivationRu2.description",
    youtubeId: "6VcXk8q3jT8", 
    duration: "5:45",
    category: "motivation",
    language: "ru"
  },
  { 
    id: "motivation_ru3", 
    titleKey: "wellness.videos.motivationRu3.title",
    descriptionKey: "wellness.videos.motivationRu3.description",
    youtubeId: "Q2uhWWFjcfs", 
    duration: "4:30",
    category: "motivation",
    language: "ru"
  },
  { 
    id: "motivation_ru4", 
    titleKey: "wellness.videos.motivationRu4.title",
    descriptionKey: "wellness.videos.motivationRu4.description",
    youtubeId: "bx-VYt0KLh0", 
    duration: "6:20",
    category: "motivation",
    language: "ru"
  },
  // Motivation - English
  { 
    id: "motivation1", 
    titleKey: "wellness.videos.motivation1.title",
    descriptionKey: "wellness.videos.motivation1.description",
    youtubeId: "UF8uR6Z6KLc", 
    duration: "15:04",
    category: "motivation",
    language: "en"
  },
  { 
    id: "motivation2", 
    titleKey: "wellness.videos.motivation2.title",
    descriptionKey: "wellness.videos.motivation2.description",
    youtubeId: "mgmVOuLgFB0", 
    duration: "4:32",
    category: "motivation",
    language: "en"
  },
  // Films & Animations
  { 
    id: "film1", 
    titleKey: "wellness.videos.film1.title",
    descriptionKey: "wellness.videos.film1.description",
    youtubeId: "9D05ej8u-gU", 
    duration: "3:40",
    category: "films",
    language: "ru"
  },
  { 
    id: "film2", 
    titleKey: "wellness.videos.film2.title",
    descriptionKey: "wellness.videos.film2.description",
    youtubeId: "QoABOdLXgdU", 
    duration: "2:30",
    category: "films",
    language: "ru"
  },
  { 
    id: "film3", 
    titleKey: "wellness.videos.film3.title",
    descriptionKey: "wellness.videos.film3.description",
    youtubeId: "k0GQSJrpVhM", 
    duration: "4:15",
    category: "films",
    language: "en"
  },
];

const quotes: QuoteItem[] = [
  // Philosophy & Wisdom
  { id: "marcus1", textKey: "wellness.quotes.marcus1", author: "Марк Аврелий", authorRoleKey: "wellness.authors.marcusAurelius", category: "philosophy" },
  { id: "seneca1", textKey: "wellness.quotes.seneca1", author: "Сенека", authorRoleKey: "wellness.authors.seneca", category: "philosophy" },
  { id: "epictetus1", textKey: "wellness.quotes.epictetus1", author: "Эпиктет", authorRoleKey: "wellness.authors.epictetus", category: "philosophy" },
  { id: "socrates1", textKey: "wellness.quotes.socrates1", author: "Сократ", authorRoleKey: "wellness.authors.socrates", category: "philosophy" },
  { id: "confucius1", textKey: "wellness.quotes.confucius1", author: "Конфуций", authorRoleKey: "wellness.authors.confucius", category: "philosophy" },
  { id: "confucius2", textKey: "wellness.quotes.confucius2", author: "Конфуций", authorRoleKey: "wellness.authors.confucius", category: "philosophy" },
  { id: "laozi1", textKey: "wellness.quotes.laozi1", author: "Лао-цзы", authorRoleKey: "wellness.authors.laozi", category: "philosophy" },
  { id: "aristotle1", textKey: "wellness.quotes.aristotle1", author: "Аристотель", authorRoleKey: "wellness.authors.aristotle", category: "philosophy" },
  
  // Psychology & Meaning
  { id: "frankl1", textKey: "wellness.quotes.frankl1", author: "Виктор Франкл", authorRoleKey: "wellness.authors.frankl", category: "psychology" },
  { id: "frankl2", textKey: "wellness.quotes.frankl2", author: "Виктор Франкл", authorRoleKey: "wellness.authors.frankl", category: "psychology" },
  { id: "jung1", textKey: "wellness.quotes.jung1", author: "Карл Юнг", authorRoleKey: "wellness.authors.jung", category: "psychology" },
  { id: "jung2", textKey: "wellness.quotes.jung2", author: "Карл Юнг", authorRoleKey: "wellness.authors.jung", category: "psychology" },
  { id: "maslow1", textKey: "wellness.quotes.maslow1", author: "Абрахам Маслоу", authorRoleKey: "wellness.authors.maslow", category: "psychology" },
  { id: "fromm1", textKey: "wellness.quotes.fromm1", author: "Эрих Фромм", authorRoleKey: "wellness.authors.fromm", category: "psychology" },
  { id: "csikszentmihalyi1", textKey: "wellness.quotes.csikszentmihalyi1", author: "Михай Чиксентмихайи", authorRoleKey: "wellness.authors.csikszentmihalyi", category: "psychology" },
  
  // Personal Growth & Resilience
  { id: "gandhi1", textKey: "wellness.quotes.gandhi1", author: "Махатма Ганди", authorRoleKey: "wellness.authors.gandhi", category: "growth" },
  { id: "gandhi2", textKey: "wellness.quotes.gandhi2", author: "Махатма Ганди", authorRoleKey: "wellness.authors.gandhi", category: "growth" },
  { id: "mandela1", textKey: "wellness.quotes.mandela1", author: "Нельсон Мандела", authorRoleKey: "wellness.authors.mandela", category: "growth" },
  { id: "mandela2", textKey: "wellness.quotes.mandela2", author: "Нельсон Мандела", authorRoleKey: "wellness.authors.mandela", category: "growth" },
  { id: "dalailama1", textKey: "wellness.quotes.dalailama1", author: "Далай-лама XIV", authorRoleKey: "wellness.authors.dalailama", category: "growth" },
  { id: "dalailama2", textKey: "wellness.quotes.dalailama2", author: "Далай-лама XIV", authorRoleKey: "wellness.authors.dalailama", category: "growth" },
  { id: "emerson1", textKey: "wellness.quotes.emerson1", author: "Ральф Эмерсон", authorRoleKey: "wellness.authors.emerson", category: "growth" },
  
  // Modern Thinkers & Leaders
  { id: "jobs1", textKey: "wellness.quotes.jobs1", author: "Стив Джобс", authorRoleKey: "wellness.authors.jobs", category: "modern" },
  { id: "jobs2", textKey: "wellness.quotes.jobs2", author: "Стив Джобс", authorRoleKey: "wellness.authors.jobs", category: "modern" },
  { id: "einstein1", textKey: "wellness.quotes.einstein1", author: "Альберт Эйнштейн", authorRoleKey: "wellness.authors.einstein", category: "modern" },
  { id: "einstein2", textKey: "wellness.quotes.einstein2", author: "Альберт Эйнштейн", authorRoleKey: "wellness.authors.einstein", category: "modern" },
  { id: "sinek1", textKey: "wellness.quotes.sinek1", author: "Саймон Синек", authorRoleKey: "wellness.authors.sinek", category: "modern" },
  { id: "angelou1", textKey: "wellness.quotes.angelou1", author: "Майя Энджелоу", authorRoleKey: "wellness.authors.angelou", category: "modern" },
];

const categoryIcons = {
  relaxation: <Heart className="h-3.5 w-3.5" />,
  motivation: <Sun className="h-3.5 w-3.5" />,
  sleep: <Moon className="h-3.5 w-3.5" />,
  films: <Film className="h-3.5 w-3.5" />,
};

const quoteCategoryIcons = {
  philosophy: <BookOpen className="h-4 w-4" />,
  psychology: <Brain className="h-4 w-4" />,
  growth: <Leaf className="h-4 w-4" />,
  modern: <Lightbulb className="h-4 w-4" />,
};

export function WellnessCenter() {
  const { t } = useTranslation();
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [videoFilter, setVideoFilter] = useState<"all" | "relaxation" | "motivation" | "sleep" | "films">("all");
  const [quoteFilter, setQuoteFilter] = useState<"all" | "philosophy" | "psychology" | "growth" | "modern">("all");

  const handleSoundToggle = (soundId: string) => {
    setActiveSound(activeSound === soundId ? null : soundId);
  };

  const filteredQuotes = quoteFilter === "all" 
    ? quotes 
    : quotes.filter(q => q.category === quoteFilter);

  const nextQuote = () => {
    setCurrentQuoteIndex((prev) => (prev + 1) % filteredQuotes.length);
  };

  const prevQuote = () => {
    setCurrentQuoteIndex((prev) => (prev - 1 + filteredQuotes.length) % filteredQuotes.length);
  };

  const randomQuote = () => {
    const newIndex = Math.floor(Math.random() * filteredQuotes.length);
    setCurrentQuoteIndex(newIndex);
  };

  const filteredVideos = videoFilter === "all" 
    ? videos 
    : videos.filter(v => v.category === videoFilter);

  const activeCategory = (cat: string) => videoFilter === cat 
    ? "bg-primary text-primary-foreground" 
    : "bg-muted/50 hover:bg-muted";

  const activeQuoteCategory = (cat: string) => quoteFilter === cat 
    ? "bg-primary text-primary-foreground" 
    : "bg-muted/50 hover:bg-muted";

  // Reset quote index when filter changes
  const handleQuoteFilterChange = (cat: "all" | "philosophy" | "psychology" | "growth" | "modern") => {
    setQuoteFilter(cat);
    setCurrentQuoteIndex(0);
  };

  const currentQuote = filteredQuotes[currentQuoteIndex] || filteredQuotes[0];

  return (
    <Card className="border overflow-hidden">
      {/* Header with gradient accent */}
      <CardHeader className="relative pb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-soft-green/10 pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-sm">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {t('wellness.title')}
              <Badge variant="secondary" className="font-normal text-xs">
                <Coffee className="h-3 w-3 mr-1" />
                {t('wellness.badge')}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-0.5">{t('wellness.description')}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pb-6">
        <Tabs defaultValue="sounds" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/50">
            <TabsTrigger value="sounds" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
              <Headphones className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">{t('wellness.tabs.sounds')}</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">{t('wellness.tabs.videos')}</span>
            </TabsTrigger>
            <TabsTrigger value="quotes" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
              <Quote className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">{t('wellness.tabs.quotes')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Sounds Tab */}
          <TabsContent value="sounds" className="mt-5 space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">{t('wellness.sounds.description')}</p>
            
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {sounds.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => handleSoundToggle(sound.id)}
                  className={`group relative flex flex-col items-center gap-3 rounded-2xl p-5 transition-all duration-300 ${
                    activeSound === sound.id
                      ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                      : `bg-gradient-to-br ${sound.gradient} hover:shadow-md hover:scale-[1.02]`
                  }`}
                >
                  <div className={`transition-transform duration-300 ${activeSound === sound.id ? "scale-110" : "group-hover:scale-110"}`}>
                    {sound.icon}
                  </div>
                  <span className="text-xs font-medium text-center">{t(sound.labelKey)}</span>
                  
                  {activeSound === sound.id && (
                    <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background shadow-sm">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {activeSound && (
              <div className="rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 p-5 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Volume2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold block">
                        {t(sounds.find(s => s.id === activeSound)?.labelKey || '')}
                      </span>
                      <span className="text-xs text-muted-foreground">{t('wellness.nowPlaying')}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveSound(null)}
                    className="gap-2 rounded-xl"
                  >
                    <X className="h-4 w-4" />
                    {t('wellness.stop')}
                  </Button>
                </div>
                <div className="aspect-video rounded-xl overflow-hidden shadow-lg ring-1 ring-border">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${sounds.find(s => s.id === activeSound)?.youtubeId}?autoplay=1&loop=1`}
                    title="Relaxation Sound"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="mt-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{t('wellness.videos.description')}</p>
              
              {!selectedVideo && (
                <div className="flex gap-2 flex-wrap">
                  <button 
                    onClick={() => setVideoFilter("all")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${activeCategory("all")}`}
                  >
                    {t('wellness.filters.all')}
                  </button>
                  <button 
                    onClick={() => setVideoFilter("relaxation")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${activeCategory("relaxation")}`}
                  >
                    <Heart className="h-3 w-3" />
                    {t('wellness.categories.relaxation')}
                  </button>
                  <button 
                    onClick={() => setVideoFilter("motivation")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${activeCategory("motivation")}`}
                  >
                    <Sun className="h-3 w-3" />
                    {t('wellness.categories.motivation')}
                  </button>
                  <button 
                    onClick={() => setVideoFilter("sleep")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${activeCategory("sleep")}`}
                  >
                    <Moon className="h-3 w-3" />
                    {t('wellness.categories.sleep')}
                  </button>
                  <button 
                    onClick={() => setVideoFilter("films")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${activeCategory("films")}`}
                  >
                    <Film className="h-3 w-3" />
                    {t('wellness.categories.films')}
                  </button>
                </div>
              )}
            </div>
            
            {selectedVideo ? (
              <div className="space-y-4 animate-fade-in">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedVideo(null)}
                  className="gap-2 rounded-xl"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('common.back')}
                </Button>
                <div className="aspect-video rounded-2xl overflow-hidden shadow-xl ring-1 ring-border">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                    title="Wellness Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : (
              <ScrollArea className="w-full">
                <div className="flex gap-4 pb-4">
                  {filteredVideos.map((video, index) => (
                    <Card 
                      key={video.id}
                      className="w-[300px] shrink-0 cursor-pointer border overflow-hidden group transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50"
                      onClick={() => setSelectedVideo(video.youtubeId)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="relative aspect-video bg-muted overflow-hidden">
                        <img 
                          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                          alt={t(video.titleKey)}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-xl transition-transform duration-300 group-hover:scale-110">
                            <Play className="h-6 w-6 text-primary ml-1" />
                          </div>
                        </div>
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge 
                            className={`gap-1.5 ${
                              video.category === "relaxation" 
                                ? "bg-soft-green/90 text-soft-green-foreground" 
                                : video.category === "sleep"
                                ? "bg-gentle-lavender/90 text-gentle-lavender-foreground"
                                : video.category === "films"
                                ? "bg-amber-500/90 text-white"
                                : "bg-primary/90 text-primary-foreground"
                            }`}
                          >
                            {categoryIcons[video.category]}
                            {t(`wellness.categories.${video.category}`)}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] uppercase font-bold ${
                              video.language === "ru" 
                                ? "bg-blue-600/90 text-white border-none" 
                                : video.language === "en"
                                ? "bg-red-600/90 text-white border-none"
                                : "bg-gray-600/90 text-white border-none"
                            }`}
                          >
                            {video.language === "multi" ? "🌐" : video.language.toUpperCase()}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="absolute bottom-3 right-3 bg-black/70 text-white border-none backdrop-blur-sm">
                          {video.duration}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          {t(video.titleKey)}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 whitespace-normal leading-relaxed">
                          {t(video.descriptionKey)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes" className="mt-5 space-y-4">
            {/* Quote Category Filter */}
            <div className="flex gap-2 flex-wrap justify-center">
              <button 
                onClick={() => handleQuoteFilterChange("all")}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${activeQuoteCategory("all")}`}
              >
                {t('wellness.filters.all')}
              </button>
              <button 
                onClick={() => handleQuoteFilterChange("philosophy")}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${activeQuoteCategory("philosophy")}`}
              >
                <BookOpen className="h-3 w-3" />
                {t('wellness.quoteCategories.philosophy')}
              </button>
              <button 
                onClick={() => handleQuoteFilterChange("psychology")}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${activeQuoteCategory("psychology")}`}
              >
                <Brain className="h-3 w-3" />
                {t('wellness.quoteCategories.psychology')}
              </button>
              <button 
                onClick={() => handleQuoteFilterChange("growth")}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${activeQuoteCategory("growth")}`}
              >
                <Leaf className="h-3 w-3" />
                {t('wellness.quoteCategories.growth')}
              </button>
              <button 
                onClick={() => handleQuoteFilterChange("modern")}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${activeQuoteCategory("modern")}`}
              >
                <Lightbulb className="h-3 w-3" />
                {t('wellness.quoteCategories.modern')}
              </button>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-gentle-lavender/20 p-8 sm:p-10">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-accent/10 to-transparent rounded-full blur-3xl" />
              
              <Quote className="absolute top-6 left-6 h-10 w-10 text-primary/15" />
              <Quote className="absolute bottom-6 right-6 h-10 w-10 text-primary/15 rotate-180" />
              
              {currentQuote && (
                <div className="relative z-10 text-center space-y-6 max-w-2xl mx-auto">
                  {/* Category Badge */}
                  <Badge variant="secondary" className="gap-1.5">
                    {quoteCategoryIcons[currentQuote.category]}
                    {t(`wellness.quoteCategories.${currentQuote.category}`)}
                  </Badge>

                  <p className="text-xl sm:text-2xl font-medium leading-relaxed italic text-foreground/90">
                    "{t(currentQuote.textKey)}"
                  </p>
                  
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-base font-semibold text-foreground">
                      {currentQuote.author}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {t(currentQuote.authorRoleKey)}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={prevQuote}
                      className="h-10 w-10 rounded-full"
                      disabled={filteredQuotes.length <= 1}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>{currentQuoteIndex + 1}</span>
                      <span>/</span>
                      <span>{filteredQuotes.length}</span>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={nextQuote}
                      className="h-10 w-10 rounded-full"
                      disabled={filteredQuotes.length <= 1}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={randomQuote}
                    className="mt-2 gap-2 rounded-full px-6"
                    disabled={filteredQuotes.length <= 1}
                  >
                    <Sparkles className="h-4 w-4" />
                    {t('wellness.randomQuote')}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
