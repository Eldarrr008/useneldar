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
  Wind
} from "lucide-react";

interface SoundItem {
  id: string;
  icon: React.ReactNode;
  labelKey: string;
  youtubeId: string;
}

interface VideoItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
  youtubeId: string;
  duration: string;
  category: "relaxation" | "motivation";
}

interface QuoteItem {
  id: string;
  textKey: string;
  author: string;
}

const sounds: SoundItem[] = [
  { id: "rain", icon: <Cloud className="h-5 w-5" />, labelKey: "wellness.sounds.rain", youtubeId: "mPZkdNFkNps" },
  { id: "ocean", icon: <Waves className="h-5 w-5" />, labelKey: "wellness.sounds.ocean", youtubeId: "WHPEKLQID4U" },
  { id: "forest", icon: <TreePine className="h-5 w-5" />, labelKey: "wellness.sounds.forest", youtubeId: "xNN7iTA57jM" },
  { id: "birds", icon: <Bird className="h-5 w-5" />, labelKey: "wellness.sounds.birds", youtubeId: "Qm846KdZN_c" },
  { id: "fireplace", icon: <Flame className="h-5 w-5" />, labelKey: "wellness.sounds.fireplace", youtubeId: "L_LUpnjgPso" },
  { id: "wind", icon: <Wind className="h-5 w-5" />, labelKey: "wellness.sounds.wind", youtubeId: "sGkh1W5cbH4" },
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
];

const quotes: QuoteItem[] = [
  { id: "1", textKey: "wellness.quotes.q1", author: "Steve Jobs" },
  { id: "2", textKey: "wellness.quotes.q2", author: "Albert Einstein" },
  { id: "3", textKey: "wellness.quotes.q3", author: "Nelson Mandela" },
  { id: "4", textKey: "wellness.quotes.q4", author: "Confucius" },
  { id: "5", textKey: "wellness.quotes.q5", author: "Mahatma Gandhi" },
];

export function WellnessCenter() {
  const { t } = useTranslation();
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const handleSoundToggle = (soundId: string) => {
    if (activeSound === soundId) {
      setActiveSound(null);
    } else {
      setActiveSound(soundId);
    }
  };

  const nextQuote = () => {
    setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
  };

  return (
    <Card className="border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
            <Sparkles className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <CardTitle className="text-base">{t('wellness.title')}</CardTitle>
            <CardDescription>{t('wellness.description')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="sounds" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sounds" className="gap-2">
              <Headphones className="h-4 w-4" />
              <span className="hidden sm:inline">{t('wellness.tabs.sounds')}</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">{t('wellness.tabs.videos')}</span>
            </TabsTrigger>
            <TabsTrigger value="quotes" className="gap-2">
              <Quote className="h-4 w-4" />
              <span className="hidden sm:inline">{t('wellness.tabs.quotes')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Sounds Tab */}
          <TabsContent value="sounds" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">{t('wellness.sounds.description')}</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {sounds.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => handleSoundToggle(sound.id)}
                  className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-all ${
                    activeSound === sound.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  {sound.icon}
                  <span className="text-xs font-medium">{t(sound.labelKey)}</span>
                  {activeSound === sound.id && (
                    <div className="flex items-center gap-1">
                      <div className="h-1 w-1 animate-pulse rounded-full bg-current" />
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-current delay-75" />
                      <div className="h-1 w-1 animate-pulse rounded-full bg-current delay-150" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {activeSound && (
              <div className="rounded-lg bg-muted/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      {t(sounds.find(s => s.id === activeSound)?.labelKey || '')}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveSound(null)}
                  >
                    <VolumeX className="h-4 w-4 mr-1" />
                    {t('wellness.stop')}
                  </Button>
                </div>
                <div className="aspect-video rounded-lg overflow-hidden">
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
          <TabsContent value="videos" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">{t('wellness.videos.description')}</p>
            
            {selectedVideo ? (
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedVideo(null)}
                >
                  ← {t('common.back')}
                </Button>
                <div className="aspect-video rounded-lg overflow-hidden">
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
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-4 pb-4">
                  {videos.map((video) => (
                    <Card 
                      key={video.id}
                      className="w-[280px] shrink-0 cursor-pointer border transition-all hover:border-primary hover:shadow-md"
                      onClick={() => setSelectedVideo(video.youtubeId)}
                    >
                      <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                        <img 
                          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                          alt={t(video.titleKey)}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
                            <Play className="h-5 w-5 text-primary ml-0.5" />
                          </div>
                        </div>
                        <Badge 
                          variant={video.category === "relaxation" ? "secondary" : "default"}
                          className="absolute top-2 left-2"
                        >
                          {video.category === "relaxation" 
                            ? t('wellness.categories.relaxation') 
                            : t('wellness.categories.motivation')
                          }
                        </Badge>
                        <Badge variant="outline" className="absolute bottom-2 right-2 bg-black/60 text-white border-none">
                          {video.duration}
                        </Badge>
                      </div>
                      <CardContent className="p-3">
                        <h4 className="font-medium text-sm line-clamp-1">{t(video.titleKey)}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 whitespace-normal">
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
          <TabsContent value="quotes" className="mt-4">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-6 sm:p-8">
              <Quote className="absolute top-4 left-4 h-8 w-8 text-primary/20" />
              <Quote className="absolute bottom-4 right-4 h-8 w-8 text-primary/20 rotate-180" />
              
              <div className="relative z-10 text-center space-y-4">
                <p className="text-lg sm:text-xl font-medium leading-relaxed italic">
                  "{t(quotes[currentQuoteIndex].textKey)}"
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  — {quotes[currentQuoteIndex].author}
                </p>
                
                <div className="flex items-center justify-center gap-2 pt-2">
                  {quotes.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuoteIndex(index)}
                      className={`h-2 w-2 rounded-full transition-all ${
                        index === currentQuoteIndex 
                          ? "bg-primary w-4" 
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                    />
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={nextQuote}
                  className="mt-4"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t('wellness.nextQuote')}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
