import { Users, GraduationCap, Calendar, DollarSign, TrendingUp, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Professores Ativos"
          value="127"
          change="+8 este mês"
          changeType="positive"
          icon={Users}
        />
        <MetricCard
          title="Turmas em Andamento"
          value="45"
          change="+3 novas turmas"
          changeType="positive"
          icon={GraduationCap}
        />
        <MetricCard
          title="Aulas Hoje"
          value="18"
          change="3 pendentes de confirmação"
          changeType="neutral"
          icon={Calendar}
        />
        <MetricCard
          title="Receita do Mês"
          value="R$ 89.4K"
          change="+12% vs mês anterior"
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
            {quickActions.map((action, index) => (
              <Button key={index} variant="outline" className="w-full justify-start">
                {action.label}
              </Button>
            ))}
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
            Próximas Aulas - Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingClasses.map((classItem, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card shadow-soft">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="font-semibold text-lg">{classItem.time}</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div>
                    <h4 className="font-semibold">{classItem.course}</h4>
                    <p className="text-sm text-muted-foreground">{classItem.professor}</p>
                    <p className="text-xs text-muted-foreground mt-1">{classItem.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    classItem.status === 'confirmed' ? 'default' :
                    classItem.status === 'pending' ? 'secondary' : 'destructive'
                  }>
                    {classItem.status === 'confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {classItem.status === 'substitution' && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {classItem.status === 'confirmed' ? 'Confirmada' :
                     classItem.status === 'pending' ? 'Pendente' : 'Substituição'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}