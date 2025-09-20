import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AgendaEvent {
  id: string;
  title: string;
  professor: string;
  time: string;
  duration: string;
  location: string;
  type: "aula" | "reuniao" | "gravacao" | "evento";
  status: "confirmado" | "pendente" | "cancelado";
  students?: number;
}

const mockEvents: Record<string, AgendaEvent[]> = {
  "2024-01-15": [
    {
      id: "1",
      title: "Comunicação Empresarial - Turma A",
      professor: "Ana Silva Santos",
      time: "09:00",
      duration: "2h",
      location: "Sala 101 - Centro",
      type: "aula",
      status: "confirmado",
      students: 18,
    },
    {
      id: "2", 
      title: "Reunião de Planning",
      professor: "Carlos Roberto Lima",
      time: "14:00",
      duration: "1h",
      location: "Sala de Reuniões",
      type: "reuniao",
      status: "confirmado",
    },
  ],
  "2024-01-16": [
    {
      id: "3",
      title: "Oratória Avançada - Turma B", 
      professor: "Carlos Roberto Lima",
      time: "14:00",
      duration: "3h",
      location: "Online - Zoom",
      type: "aula",
      status: "pendente",
      students: 12,
    },
  ],
  "2024-01-17": [
    {
      id: "4",
      title: "Gravação de Material",
      professor: "Mariana Costa Oliveira",
      time: "10:00", 
      duration: "2h",
      location: "Estúdio A",
      type: "gravacao",
      status: "confirmado",
    },
  ],
};

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getTypeColor = (type: AgendaEvent['type']) => {
    switch (type) {
      case "aula": return "bg-primary text-primary-foreground";
      case "reuniao": return "bg-accent text-accent-foreground";
      case "gravacao": return "bg-secondary text-secondary-foreground";
      case "evento": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusBadge = (status: AgendaEvent['status']) => {
    switch (status) {
      case "confirmado":
        return <Badge className="bg-accent text-accent-foreground">Confirmado</Badge>;
      case "pendente":
        return <Badge variant="outline">Pendente</Badge>;
      case "cancelado":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const selectedDateKey = formatDateKey(selectedDate);
  const eventsForSelectedDate = mockEvents[selectedDateKey] || [];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const hasEvents = (date: Date) => {
    const dateKey = formatDateKey(date);
    return mockEvents[dateKey] && mockEvents[dateKey].length > 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todas as aulas e eventos
          </p>
        </div>
        <Button className="bg-gradient-primary shadow-medium">
          <Plus className="mr-2 h-4 w-4" />
          Nova Aula
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDays.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth(currentDate).map((date, index) => (
                <div
                  key={index}
                  className={`
                    relative p-2 h-20 border rounded-lg cursor-pointer transition-colors
                    ${date ? 'hover:bg-muted/50' : ''}
                    ${date && isToday(date) ? 'bg-primary/10 border-primary' : ''}
                    ${date && isSelected(date) ? 'bg-accent/20 border-accent' : ''}
                    ${!date ? 'opacity-0 cursor-default' : ''}
                  `}
                  onClick={() => date && setSelectedDate(date)}
                >
                  {date && (
                    <>
                      <span className={`text-sm font-medium ${isToday(date) ? 'text-primary' : ''}`}>
                        {date.getDate()}
                      </span>
                      {hasEvents(date) && (
                        <div className="absolute bottom-1 left-1 right-1">
                          <div className="h-1 bg-accent rounded-full"></div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Events for Selected Date */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {selectedDate.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {eventsForSelectedDate.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum evento agendado</p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Plus className="mr-2 h-3 w-3" />
                  Agendar
                </Button>
              </div>
            ) : (
              eventsForSelectedDate.map((event) => (
                <div key={event.id} className="space-y-3 p-4 rounded-lg border bg-card shadow-soft">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{event.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                        {getStatusBadge(event.status)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {event.time} ({event.duration})
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {event.professor}
                    </div>

                    {event.students && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{event.students} alunos</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">
                      Detalhes
                    </Button>
                    {event.status === "pendente" && (
                      <Button size="sm" className="bg-accent text-accent-foreground">
                        Confirmar
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">12</p>
              <p className="text-sm text-muted-foreground">Aulas Agendadas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">8</p>
              <p className="text-sm text-muted-foreground">Confirmadas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground">3</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">24h</p>
              <p className="text-sm text-muted-foreground">Total de Horas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}