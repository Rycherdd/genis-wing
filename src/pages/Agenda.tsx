import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarIcon, Clock, MapPin, GraduationCap, User } from "lucide-react";
import { useAgenda } from "@/hooks/useAgenda";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function Agenda() {
  const { eventos, loading, diasComEventos, getEventosPorData } = useAgenda();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const eventosDoDia = selectedDate ? getEventosPorData(selectedDate) : [];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'agendada':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'realizada':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelada':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'agendada':
        return 'Agendada';
      case 'realizada':
        return 'Realizada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">
            Visualize seus compromissos e horários
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agenda</h1>
        <p className="text-muted-foreground">
          Visualize seus compromissos e horários
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Calendário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendário
            </CardTitle>
            <CardDescription>
              Selecione uma data para ver os eventos
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border pointer-events-auto"
              modifiers={{
                hasEvent: diasComEventos,
              }}
              modifiersClassNames={{
                hasEvent: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full",
              }}
              locale={ptBR}
            />
          </CardContent>
        </Card>

        {/* Eventos do Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Eventos do Dia
            </CardTitle>
            <CardDescription>
              {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione uma data'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventosDoDia.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
                  Nenhum evento
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Não há eventos programados para esta data.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {eventosDoDia.map((evento) => (
                  <Card key={evento.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold">{evento.titulo}</h4>
                          {evento.status && (
                            <Badge variant="outline" className={cn("shrink-0", getStatusColor(evento.status))}>
                              {getStatusText(evento.status)}
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                              {evento.horario_inicio} - {evento.horario_fim}
                            </span>
                          </div>

                          {evento.local && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{evento.local}</span>
                            </div>
                          )}

                          {evento.turma_nome && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <GraduationCap className="h-4 w-4" />
                              <span>{evento.turma_nome}</span>
                            </div>
                          )}

                          {evento.professor_nome && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span>{evento.professor_nome}</span>
                            </div>
                          )}
                        </div>

                        {evento.descricao && (
                          <p className="text-sm text-muted-foreground border-t pt-3">
                            {evento.descricao}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Eventos</CardTitle>
          <CardDescription>
            Todos os seus compromissos futuros
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eventos.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
                Nenhum evento programado
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Você não tem eventos programados no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {eventos.filter(e => e.data >= new Date()).slice(0, 5).map((evento) => (
                <div
                  key={evento.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedDate(evento.data)}
                >
                  <div className="space-y-1">
                    <p className="font-medium">{evento.titulo}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {format(evento.data, "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {evento.horario_inicio}
                      </span>
                      {evento.turma_nome && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          {evento.turma_nome}
                        </span>
                      )}
                    </div>
                  </div>
                  {evento.status && (
                    <Badge variant="outline" className={getStatusColor(evento.status)}>
                      {getStatusText(evento.status)}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}