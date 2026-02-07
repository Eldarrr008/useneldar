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
  X
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
  category: "relaxation" | "motivation" | "sleep";
}

interface QuoteItem {
  id: string;
  textKey: string;
  author: string;
  authorRole?: string;
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
  { 
    id: "breathing", 
    titleKey: "wellness.videos.breathing.title",
    descriptionKey: "wellness.videos.breathing.description",
    youtubeId: "DbDoBzGY3vo", 
    duration: "5:00",
    category: "relaxation"
  },
  { 
    id: "meditation", 
    titleKey: "wellness.videos.meditation.title",
    descriptionKey: "wellness.videos.meditation.description",
    youtubeId: "O-6f5wQXSu8", 
    duration: "10:00",
    category: "relaxation"
  },
  { 
    id: "sleep", 
    titleKey: "wellness.videos.sleep.title",
    descriptionKey: "wellness.videos.sleep.description",
    youtubeId: "1ZYbU82GVz4", 
    duration: "60:00",
    category: "sleep"
  },
  { 
    id: "motivation1", 
    titleKey: "wellness.videos.motivation1.title",
    descriptionKey: "wellness.videos.motivation1.description",
    youtubeId: "mgmVOuLgFB0", 
    duration: "4:32",
    category: "motivation"
  },
  { 
    id: "motivation2", 
    titleKey: "wellness.videos.motivation2.title",
    descriptionKey: "wellness.videos.motivation2.description",
    youtubeId: "g-jwWYX7Jlo", 
    duration: "3:15",
    category: "motivation"
  },
  { 
    id: "focus", 
    titleKey: "wellness.videos.focus.title",
    descriptionKey: "wellness.videos.focus.description",
    youtubeId: "XULUBg_ZcAU", 
    duration: "45:00",
    category: "relaxation"
  },
];

const quotes: QuoteItem[] = [
  { id: "1", textKey: "wellness.quotes.q1", author: "Steve Jobs", authorRole: "Apple" },
  { id: "2", textKey: "wellness.quotes.q2", author: "Albert Einstein", authorRole: "Physicist" },
  { id: "3", textKey: "wellness.quotes.q3", author: "Nelson Mandela", authorRole: "Leader" },
  { id: "4", textKey: "wellness.quotes.q4", author: "Confucius", authorRole: "Philosopher" },
  { id: "5", textKey: "wellness.quotes.q5", author: "Mahatma Gandhi", authorRole: "Leader" },
  { id: "6", textKey: "wellness.quotes.q6", author: "Maya Angelou", authorRole: "Writer" },
  { id: "7", textKey: "wellness.quotes.q7", author: "Dalai Lama", authorRole: "Spiritual Leader" },
];

const categoryIcons = {
  relaxation: <Heart className="h-3.5 w-3.5" />,
  motivation: <Sun className="h-3.5 w-3.5" />,
  sleep: <Moon className="h-3.5 w-3.5" />,
};

export function WellnessCenter() {
  const { t } = useTranslation();
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [videoFilter, setVideoFilter] = useState<"all" | "relaxation" | "motivation" | "sleep">("all");

  const handleSoundToggle = (soundId: string) => {
    setActiveSound(activeSound === soundId ? null : soundId);
  };

  const nextQuote = () => {
    setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
  };

  const prevQuote = () => {
    setCurrentQuoteIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
  };

  const filteredVideos = videoFilter === "all" 
    ? videos 
    : videos.filter(v => v.category === videoFilter);

  const activeCategory = (cat: string) => videoFilter === cat 
    ? "bg-primary text-primary-foreground" 
    : "bg-muted/50 hover:bg-muted";

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
                        <Badge 
                          className={`absolute top-3 left-3 gap-1.5 ${
                            video.category === "relaxation" 
                              ? "bg-soft-green/90 text-soft-green-foreground" 
                              : video.category === "sleep"
                              ? "bg-gentle-lavender/90 text-gentle-lavender-foreground"
                              : "bg-primary/90 text-primary-foreground"
                          }`}
                        >
                          {categoryIcons[video.category]}
                          {t(`wellness.categories.${video.category}`)}
                        </Badge>
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
          <TabsContent value="quotes" className="mt-5">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-gentle-lavender/20 p-8 sm:p-10">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-accent/10 to-transparent rounded-full blur-3xl" />
              
              <Quote className="absolute top-6 left-6 h-10 w-10 text-primary/15" />
              <Quote className="absolute bottom-6 right-6 h-10 w-10 text-primary/15 rotate-180" />
              
              <div className="relative z-10 text-center space-y-6 max-w-2xl mx-auto">
                <p className="text-xl sm:text-2xl font-medium leading-relaxed italic text-foreground/90">
                  "{t(quotes[currentQuoteIndex].textKey)}"
                </p>
                
                <div className="flex flex-col items-center gap-1">
                  <p className="text-base font-semibold text-foreground">
                    {quotes[currentQuoteIndex].author}
                  </p>
                  {quotes[currentQuoteIndex].authorRole && (
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {quotes[currentQuoteIndex].authorRole}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevQuote}
                    className="h-10 w-10 rounded-full"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {quotes.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuoteIndex(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentQuoteIndex 
                            ? "bg-primary w-6" 
                            : "bg-muted-foreground/25 w-2 hover:bg-muted-foreground/50"
                        }`}
                      />
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextQuote}
                    className="h-10 w-10 rounded-full"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
                
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={nextQuote}
                  className="mt-2 gap-2 rounded-full px-6"
                >
                  <Sparkles className="h-4 w-4" />
                  {t('wellness.randomQuote')}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
