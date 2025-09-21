import { useState } from "react";
import { Search, Users, Calendar, Clock, MapPin, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTurmas } from "@/hooks/useTurmas";
import { useMatriculas } from "@/hooks/useMatriculas";
import { useAulas } from "@/hooks/useAulas";
import { format, parseISO, isSameDay, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TurmasAluno() {
  const [searchTerm, setSearchTerm] = useState("");
  const { turmas, loading: turmasLoading } = useTurmas();
  const { matriculas, loading: matriculasLoading } = useMatriculas();
  const { aulas, loading: aulasLoading } = useAulas();

  if (turmasLoading || matriculasLoading || aulasLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Get enrolled classes for the current user
  const enrolledTurmaIds = matriculas.map(m => m.turma_id);
  const myTurmas = turmas.filter(turma => enrolledTurmaIds.includes(turma.id));

  const filteredTurmas = myTurmas.filter(turma =>
    turma.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (turma as any).professores?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'bg-accent text-accent-foreground';
      case 'planejada':
        return 'bg-primary text-primary-foreground';
      case 'concluida':
        return 'bg-secondary text-secondary-foreground';
      case 'cancelada':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'Ativa';
      case 'planejada':
        return 'Planejada';
      case 'concluida':
        return 'Concluída';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getNextClass = (turmaId: string) => {
    const turmaAulas = aulas.filter(aula => aula.turma_id === turmaId);
    const today = new Date();
    
    const nextAula = turmaAulas
      .filter(aula => isAfter(parseISO(aula.data), today) || isSameDay(parseISO(aula.data), today))
      .sort((a, b) => parseISO(a.data).getTime() - parseISO(b.data).getTime())[0];
    
    return nextAula;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Minhas Turmas</h1>
        <p className="text-muted-foreground">
          Turmas em que você está matriculado
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar turmas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Enrolled Classes */}
      {filteredTurmas.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Users className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                {myTurmas.length === 0 
                  ? "Você não está matriculado em nenhuma turma ainda."
                  : "Nenhuma turma encontrada com os termos de busca."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredTurmas.map((turma) => {
            const nextClass = getNextClass(turma.id);
            const enrolledCount = matriculas.filter(m => m.turma_id === turma.id).length;
            
            return (
              <Card key={turma.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{turma.nome}</CardTitle>
                      <CardDescription className="text-base">
                        {turma.descricao}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(turma.status)}>
                      {getStatusText(turma.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Class Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Professor: {(turma as any).professores?.nome}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Alunos: {enrolledCount}/{turma.max_alunos}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {turma.data_inicio && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Início: {format(parseISO(turma.data_inicio), "dd/MM/yyyy")}</span>
                        </div>
                      )}
                      {turma.data_fim && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Fim: {format(parseISO(turma.data_fim), "dd/MM/yyyy")}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Next Class */}
                  {nextClass && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <h4 className="font-medium text-sm text-primary">Próxima Aula</h4>
                      <div className="space-y-1">
                        <p className="font-medium">{nextClass.titulo}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(parseISO(nextClass.data), "dd/MM/yyyy")}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {nextClass.horario_inicio} - {nextClass.horario_fim}
                          </div>
                          {nextClass.local && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {nextClass.local}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}