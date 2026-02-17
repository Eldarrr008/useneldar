import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header skeleton */}
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg bg-primary-foreground/10" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32 bg-primary-foreground/10" />
                <Skeleton className="h-3 w-48 bg-primary-foreground/10" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20 rounded-md bg-primary-foreground/10" />
              <Skeleton className="h-9 w-9 rounded-md bg-primary-foreground/10" />
            </div>
          </div>
        </div>
      </header>

      {/* Secondary nav skeleton */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-7 w-36 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <main className="container mx-auto px-6 py-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="border">
                <CardHeader className="pb-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-56" />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}

export function PsychologistSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg bg-primary-foreground/10" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40 bg-primary-foreground/10" />
                <Skeleton className="h-3 w-56 bg-primary-foreground/10" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-36 rounded-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-28 rounded-md" />
              <Skeleton className="h-8 w-32 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export function HistorySkeleton() {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-md bg-primary-foreground/10" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg bg-primary-foreground/10" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-36 bg-primary-foreground/10" />
                <Skeleton className="h-3 w-48 bg-primary-foreground/10" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-6 py-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border">
              <CardContent className="flex items-center gap-3 p-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-6 w-10" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Skeleton className="h-px w-full" />

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
