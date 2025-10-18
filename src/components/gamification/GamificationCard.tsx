import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Flame, TrendingUp } from "lucide-react";
import { UserGamification } from "@/hooks/useGamification";

interface GamificationCardProps {
  gamification: UserGamification | null;
}

export function GamificationCard({ gamification }: GamificationCardProps) {
  if (!gamification) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Comece a ganhar pontos participando das aulas e respondendo formulários!
          </p>
        </CardContent>
      </Card>
    );
  }

  const progressoNivel = (gamification.xp_atual / gamification.xp_proximo_nivel) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Nível e XP */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            Nível
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{gamification.nivel}</div>
          <Progress value={progressoNivel} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {gamification.xp_atual} / {gamification.xp_proximo_nivel} XP
          </p>
        </CardContent>
      </Card>

      {/* Pontos Totais */}
      <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4 text-accent" />
            Pontos Totais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{gamification.pontos_totais.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Ganhe mais fazendo presença
          </p>
        </CardContent>
      </Card>

      {/* Streak Atual */}
      <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Sequência Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{gamification.streak_atual} dias</div>
          <p className="text-xs text-muted-foreground mt-1">
            Melhor: {gamification.melhor_streak} dias
          </p>
        </CardContent>
      </Card>

      {/* Melhor Streak */}
      <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Recorde
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{gamification.melhor_streak} dias</div>
          <p className="text-xs text-muted-foreground mt-1">
            Continue comparecendo!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
