import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCheckins } from "@/hooks/useCheckins";
import { useAulas } from "@/hooks/useAulas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User, Calendar, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CheckinsGerenciar() {
  const { checkins, isLoading, removerCheckin } = useCheckins();
  const { aulas } = useAulas();

  const getAulaInfo = (aulaId: string) => {
    return aulas?.find((a) => a.id === aulaId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gerenciar Check-ins</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie os check-ins de todos os alunos
          </p>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gerenciar Check-ins</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie os check-ins de todos os alunos nas aulas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Check-ins</CardTitle>
          <CardDescription>
            Total de {checkins?.length || 0} check-ins registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {checkins && checkins.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Aula</TableHead>
                  <TableHead>Data da Aula</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Observação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkins.map((checkin) => {
                  const aula = getAulaInfo(checkin.aula_id);
                  return (
                    <TableRow key={checkin.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{checkin.alunos?.nome}</p>
                            <p className="text-xs text-muted-foreground">
                              {checkin.alunos?.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {checkin.aulas_agendadas?.titulo || "Aula não encontrada"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {aula
                          ? format(new Date(aula.data), "dd/MM/yyyy", { locale: ptBR })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="secondary">
                            {checkin.checkin_at
                              ? format(
                                  new Date(checkin.checkin_at),
                                  "dd/MM/yyyy 'às' HH:mm",
                                  { locale: ptBR }
                                )
                              : "-"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {checkin.observacao ? (
                          <p className="text-sm text-muted-foreground max-w-xs truncate">
                            {checkin.observacao}
                          </p>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removerCheckin(checkin.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum check-in registrado ainda.</p>
              <p className="text-sm mt-2">
                Os check-ins dos alunos aparecerão aqui quando forem realizados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
