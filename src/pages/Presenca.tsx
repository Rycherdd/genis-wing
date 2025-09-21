import { useState } from "react";
import { UserCheck, Search, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PresencaForm } from "@/components/forms/PresencaForm";
import { useAulas } from "@/hooks/useAulas";
import { format, parseISO, isToday, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Presenca() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAula, setSelectedAula] = useState<any>(null);
  const { aulas, loading } = useAulas();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const filteredAulas = aulas.filter(aula =>
    aula.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (aula as any).turmas?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (aula as any).professores?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort classes by date, with today's classes first
  const sortedAulas = filteredAulas.sort((a, b) => {
    const dateA = parseISO(a.data);
    const dateB = parseISO(b.data);
    
    if (isToday(dateA) && !isToday(dateB)) return -1;
    if (!isToday(dateA) && isToday(dateB)) return 1;
    
    return dateB.getTime() - dateA.getTime();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'bg-primary text-primary-foreground';
      case 'em_andamento':
        return 'bg-accent text-accent-foreground';
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
      case 'agendada':
        return 'Agendada';
      case 'em_andamento':
        return 'Em Andamento';
      case 'concluida':
        return 'Concluída';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserCheck className="h-8 w-8 text-primary" />
          Controle de Presença
        </h1>
        <p className="text-muted-foreground">
          Gerencie a presença dos alunos nas aulas
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar aulas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Classes List */}
      {sortedAulas.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                {filteredAulas.length === 0 && searchTerm
                  ? "Nenhuma aula encontrada com os termos de busca."
                  : "Não há aulas disponíveis para controle de presença."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedAulas.map((aula) => {
            const aulaDate = parseISO(aula.data);
            const isAulaToday = isToday(aulaDate);
            const isAulaPast = isPast(aulaDate);
            
            return (
              <Card 
                key={aula.id} 
                className={`${isAulaToday ? 'border-l-4 border-l-primary' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {aula.titulo}
                        {isAulaToday && (
                          <Badge variant="default" className="text-xs">
                            Hoje
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{aula.descricao}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(aula.status)}>
                      {getStatusText(aula.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(aulaDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Turma: {(aula as any).turmas?.nome}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <strong>Horário:</strong> {aula.horario_inicio} - {aula.horario_fim}
                      </div>
                      <div>
                        <strong>Professor:</strong> {(aula as any).professores?.nome}
                      </div>
                      {aula.local && (
                        <div>
                          <strong>Local:</strong> {aula.local}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setSelectedAula(aula)}
                      className="flex items-center gap-2"
                      disabled={aula.status === 'cancelada'}
                    >
                      <UserCheck className="h-4 w-4" />
                      {aula.status === 'concluida' ? 'Ver Presença' : 'Controlar Presença'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Presence Form Modal */}
      {selectedAula && (
        <PresencaForm
          open={!!selectedAula}
          onOpenChange={(open) => !open && setSelectedAula(null)}
          aula={selectedAula}
        />
      )}
    </div>
  );
}