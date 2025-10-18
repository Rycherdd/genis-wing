import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Flame } from "lucide-react";
import { LeaderboardEntry } from "@/hooks/useLeaderboard";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[];
}

export function LeaderboardTable({ leaderboard }: LeaderboardTableProps) {
  const { user } = useAuth();

  const getPosicaoIcon = (posicao: number) => {
    switch (posicao) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground">#{posicao}</span>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Ranking de Alunos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Posição</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="text-center">Nível</TableHead>
              <TableHead className="text-center">Pontos</TableHead>
              <TableHead className="text-center">
                <Flame className="h-4 w-4 inline" /> Streak
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum dado disponível ainda
                </TableCell>
              </TableRow>
            ) : (
              leaderboard.map((entry) => (
                <TableRow
                  key={entry.user_id}
                  className={cn(
                    entry.user_id === user?.id && "bg-primary/5 font-semibold"
                  )}
                >
                  <TableCell className="font-medium">
                    {getPosicaoIcon(entry.posicao)}
                  </TableCell>
                  <TableCell>
                    {entry.nome}
                    {entry.user_id === user?.id && (
                      <Badge variant="secondary" className="ml-2">
                        Você
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{entry.nivel}</Badge>
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {entry.pontos_totais.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {entry.streak_atual > 0 ? (
                      <span className="flex items-center justify-center gap-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        {entry.streak_atual}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
