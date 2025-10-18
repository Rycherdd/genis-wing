import { Layout } from "@/components/layout/Layout";
import { useGamification } from "@/hooks/useGamification";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { GamificationCard } from "@/components/gamification/GamificationCard";
import { BadgeGrid } from "@/components/gamification/BadgeGrid";
import { LeaderboardTable } from "@/components/gamification/LeaderboardTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Award, BarChart3, History } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Gamificacao() {
  const { gamification, badges, allBadges, historico, loading } = useGamification();
  const { leaderboard, loading: leaderboardLoading } = useLeaderboard();

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            Gamificação
          </h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe seu progresso, conquiste badges e compete no ranking!
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <GamificationCard gamification={gamification} />

        {/* Tabs */}
        <Tabs defaultValue="badges" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Conquistas
            </TabsTrigger>
            <TabsTrigger value="ranking" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Ranking
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Badges */}
          <TabsContent value="badges" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Minhas Conquistas ({badges.length}/{allBadges.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BadgeGrid userBadges={badges} allBadges={allBadges} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ranking */}
          <TabsContent value="ranking" className="space-y-4">
            {leaderboardLoading ? (
              <Skeleton className="h-96" />
            ) : (
              <LeaderboardTable leaderboard={leaderboard} />
            )}
          </TabsContent>

          {/* Histórico */}
          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Histórico de Pontos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {historico.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum histórico ainda. Comece participando das aulas!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {historico.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                      >
                        <div>
                          <p className="font-medium">{item.motivo}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                        <div
                          className={`text-lg font-bold ${
                            item.pontos > 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {item.pontos > 0 ? "+" : ""}
                          {item.pontos}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
