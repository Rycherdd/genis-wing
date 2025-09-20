import { useState } from "react";
import { Users, GraduationCap, Calendar, DollarSign, TrendingUp, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfessorForm } from "@/components/forms/ProfessorForm";
import { TurmaForm } from "@/components/forms/TurmaForm";
import { useProfessores } from "@/hooks/useProfessores";
import { useTurmas } from "@/hooks/useTurmas";
import { useAulas } from "@/hooks/useAulas";

const quickActions = [
  { label: "Cadastrar Professor", href: "/professores/novo" },
  { label: "Nova Turma", href: "/turmas/nova" },
  { label: "Agendar Aula", href: "/agenda/nova" },
  { label: "Lançar Presença", href: "/presenca" },
];

const recentActivities = [
  {
    professor: "Ana Silva",
    action: "Confirmou presença",
    turma: "Comunicação Empresarial - Turma A",
    time: "há 2 horas",
    type: "presence" as const
  },
  {
    professor: "Carlos Santos",
    action: "Enviou material",
    turma: "Oratória Avançada - Turma B", 
    time: "há 4 horas",
    type: "material" as const
  },
  {
    professor: "Mariana Costa",
    action: "Solicitou substituição",
    turma: "Técnicas de Apresentação",
    time: "há 6 horas", 
    type: "substitution" as const
  }
];

const upcomingClasses = [
  {
    time: "09:00",
    course: "Comunicação Empresarial",
    professor: "Ana Silva",
    location: "Sala 101 - Unidade Centro",
    status: "confirmed" as const
  },
  {
    time: "14:00", 
    course: "Oratória Avançada",
    professor: "Carlos Santos",
    location: "Online - Zoom",
    status: "pending" as const
  },
  {
    time: "16:30",
    course: "Técnicas de Apresentação", 
    professor: "Em busca de substituto",
    location: "Sala 205 - Unidade Norte",
    status: "substitution" as const
  }
];

export default function Dashboard() {
  const [professorFormOpen, setProfessorFormOpen] = useState(false);
  const [turmaFormOpen, setTurmaFormOpen] = useState(false);
  
  const { professores } = useProfessores();
  const { turmas } = useTurmas();
  const { aulas } = useAulas();

  // Calculate real metrics
  const professorAtivos = professores.filter(p => p.status === 'ativo').length;
  const turmasAtivas = turmas.filter(t => t.status === 'ativa').length;
  const aulasHoje = aulas.filter(a => {
    const hoje = new Date().toDateString();
    const aulaData = new Date(a.data).toDateString();
    return hoje === aulaData;
  }).length;
  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Professores Ativos"
          value={professorAtivos.toString()}
          change={`+${professores.filter(p => 
            new Date(p.created_at).getMonth() === new Date().getMonth()
          ).length} este mês`}
          changeType="positive"
          icon={Users}
        />
        <MetricCard
          title="Turmas em Andamento"
          value={turmasAtivas.toString()}
          change={`${turmas.filter(t => t.status === 'planejada').length} planejadas`}
          changeType="positive"
          icon={GraduationCap}
        />
        <MetricCard
          title="Aulas Hoje"
          value={aulasHoje.toString()}
          change={`${aulas.filter(a => a.status === 'agendada').length} agendadas`}
          changeType="neutral"
          icon={Calendar}
        />
        <MetricCard
          title="Total de Dados"
          value={(professores.length + turmas.length + aulas.length).toString()}
          change="Sistema funcionando"
          changeType="positive"
          icon={DollarSign}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setProfessorFormOpen(true)}
            >
              Cadastrar Professor
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setTurmaFormOpen(true)}
            >
              Nova Turma
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Agendar Aula
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Lançar Presença
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${
                      activity.type === 'presence' ? 'bg-accent' :
                      activity.type === 'material' ? 'bg-primary' : 'bg-destructive'
                    }`} />
                    <div>
                      <p className="font-medium">{activity.professor}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.action} • {activity.turma}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {aulas.length > 0 ? "Próximas Aulas" : "Nenhuma Aula Cadastrada"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {aulas.length > 0 ? (
            <div className="space-y-4">
              {aulas.slice(0, 3).map((aula) => (
                <div key={aula.id} className="flex items-center justify-between p-4 rounded-lg border bg-card shadow-soft">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="font-semibold text-lg">{aula.horario_inicio}</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div>
                      <h4 className="font-semibold">{aula.titulo}</h4>
                      <p className="text-sm text-muted-foreground">
                        {(aula as any).professores?.nome || "Professor não atribuído"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {aula.local || "Local não informado"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={aula.status === 'concluida' ? 'default' : 'secondary'}>
                      {aula.status === 'concluida' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {aula.status === 'agendada' ? 'Agendada' : 
                       aula.status === 'em-andamento' ? 'Em Andamento' :
                       aula.status === 'concluida' ? 'Concluída' : 'Cancelada'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma aula cadastrada ainda.</p>
              <p className="text-sm">Comece criando professores e turmas!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forms */}
      <ProfessorForm open={professorFormOpen} onOpenChange={setProfessorFormOpen} />
      <TurmaForm open={turmaFormOpen} onOpenChange={setTurmaFormOpen} />
    </div>
  );
}