import { useState, useEffect } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Gamificacao() {
  const { user, userRole } = useAuth();
  const [turmaId, setTurmaId] = useState<string | undefined>();
  const { gamification, badges, allBadges, historico, loading } = useGamification();
  const { leaderboard, loading: leaderboardLoading } = useLeaderboard(turmaId);

  // Buscar turma do aluno
  useEffect(() => {
    const fetchTurmaAluno = async () => {
      if (!user || userRole !== 'aluno') return;

      const { data: alunoData } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (alunoData) {
        const { data: matriculaData } = await supabase
          .from('matriculas')
          .select('turma_id')
          .eq('aluno_id', alunoData.id)
          .eq('status', 'ativa')
          .single();

        if (matriculaData) {
          setTurmaId(matriculaData.turma_id);
        }
      }
    };

    fetchTurmaAluno();
  }, [user, userRole]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-primary" />
          Gamificação
        </h1>
        <p className="text-muted-foreground mt-2">
          {gamification 
            ? "Acompanhe seu progresso, conquiste badges e compete no ranking!"
            : "Comece a participar das aulas para começar sua jornada de gamificação!"
          }
        </p>
      </div>

      {/* Cards de Estatísticas */}
      {!gamification ? (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-8 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-primary/50" />
            <h2 className="text-2xl font-bold mb-2">Comece sua Jornada!</h2>
            <p className="text-muted-foreground mb-4">
              Você ainda não tem dados de gamificação. Comece participando das aulas,
              respondendo formulários e mantendo uma sequência de presença para ganhar pontos e badges!
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-6 text-left">
              <div className="p-4 rounded-lg bg-card border">
                <p className="font-semibold">✅ Presença em Aula</p>
                <p className="text-sm text-muted-foreground">+10 pontos</p>
              </div>
              <div className="p-4 rounded-lg bg-card border">
                <p className="font-semibold">📝 Formulário Respondido</p>
                <p className="text-sm text-muted-foreground">+15 pontos</p>
              </div>
              <div className="p-4 rounded-lg bg-card border">
                <p className="font-semibold">🔥 Streak Diário</p>
                <p className="text-sm text-muted-foreground">+5 pontos (+bônus)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <GamificationCard gamification={gamification} />
      )}

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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {userRole === 'aluno' ? 'Ranking da Minha Turma' : 'Ranking Geral'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LeaderboardTable leaderboard={leaderboard} />
                </CardContent>
              </Card>
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
  );
}
