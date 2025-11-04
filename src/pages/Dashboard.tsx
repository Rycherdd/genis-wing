import { useState, useMemo, useEffect } from "react";
import { Users, GraduationCap, Calendar, DollarSign, TrendingUp, Clock, CheckCircle, AlertTriangle, ArrowRight, BookOpen, Trophy, BarChart3, BookOpenCheck } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfessorForm } from "@/components/forms/ProfessorForm";
import { TurmaForm } from "@/components/forms/TurmaForm";
import { useProfessores } from "@/hooks/useProfessores";
import { useTurmas } from "@/hooks/useTurmas";
import { useAulas } from "@/hooks/useAulas";
import { useRecentActivities } from "@/hooks/useRecentActivities";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useUserProgress } from "@/hooks/useUserProgress";

const quickActions = [
  { label: "Cadastrar Professor", href: "/professores/novo" },
  { label: "Nova Turma", href: "/turmas/nova" },
  { label: "Agendar Aula", href: "/agenda/nova" },
  { label: "Lançar Presença", href: "/presenca" },
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
  const { user, userRole } = useAuth();
  const [turmaId, setTurmaId] = useState<string | undefined>();
  const [aulasAluno, setAulasAluno] = useState<any[]>([]);
  
  const { professores } = useProfessores();
  const { turmas } = useTurmas();
  const { aulas } = useAulas();
  const { activities: recentActivities, loading: activitiesLoading } = useRecentActivities();
  const { summary: progressSummary } = useUserProgress();

  // Buscar turma e aulas do aluno
  useEffect(() => {
    const fetchDadosAluno = async () => {
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

          // Buscar aulas da turma do aluno
          const { data: aulasData } = await supabase
            .from('aulas_agendadas')
            .select(`
              *,
              professores:professor_id(nome),
              turmas:turma_id(nome)
            `)
            .eq('turma_id', matriculaData.turma_id)
            .gte('data', new Date().toISOString().split('T')[0])
            .order('data', { ascending: true })
            .order('horario_inicio', { ascending: true })
            .limit(3);

          setAulasAluno(aulasData || []);
        }
      }
    };

    fetchDadosAluno();
  }, [user, userRole]);

  // Ações rápidas baseadas no papel do usuário
  const quickActionsForRole = useMemo(() => {
    if (userRole === 'aluno') {
      return [
        { label: "Minhas Turmas", href: "/turmas-aluno", icon: GraduationCap },
        { label: "Minhas Aulas", href: "/aulas-aluno", icon: BookOpen },
        { label: "Meu Progresso", href: "/meu-progresso", icon: BarChart3 },
        { label: "Gamificação", href: "/gamificacao", icon: Trophy },
      ];
    }
    
    // Ações para admin/professor
    return [
      { label: "Ver Turmas com Alunos", href: "/turmas-aluno", icon: GraduationCap, action: null },
      { label: "Cadastrar Professor", href: null, icon: Users, action: () => setProfessorFormOpen(true) },
      { label: "Nova Turma", href: null, icon: BookOpen, action: () => setTurmaFormOpen(true) },
      { label: "Lançar Presença", href: "/presenca", icon: CheckCircle, action: null },
    ];
  }, [userRole]);

  // Calculate real metrics with memoization
  const metrics = useMemo(() => {
    // Métricas para alunos
    if (userRole === 'aluno' && progressSummary) {
      const hoje = new Date().toDateString();
      const aulasHoje = aulasAluno.filter(a => {
        const aulaData = new Date(a.data).toDateString();
        return hoje === aulaData;
      }).length;

      return {
        aulasAssistidas: progressSummary.total_presencas || 0,
        taxaPresenca: progressSummary.media_presenca ? `${progressSummary.media_presenca.toFixed(0)}%` : '0%',
        aulasHoje,
        horasAprendizado: progressSummary.total_horas ? progressSummary.total_horas.toFixed(1) : '0',
        isAluno: true
      };
    }

    // Métricas para admin/professor
    const professorAtivos = professores.filter(p => p.status === 'ativo').length;
    const turmasAtivas = turmas.filter(t => t.status === 'ativa').length;
    const hoje = new Date().toDateString();
    const aulasHoje = aulas.filter(a => {
      const aulaData = new Date(a.data).toDateString();
      return hoje === aulaData;
    }).length;
    const professorNovos = professores.filter(p => 
      new Date(p.created_at).getMonth() === new Date().getMonth()
    ).length;
    const turmasPlanejadas = turmas.filter(t => t.status === 'planejada').length;
    const aulasAgendadas = aulas.filter(a => a.status === 'agendada').length;

    return {
      professorAtivos,
      turmasAtivas,
      aulasHoje,
      professorNovos,
      turmasPlanejadas,
      aulasAgendadas,
      totalDados: professores.length + turmas.length + aulas.length,
      isAluno: false
    };
  }, [professores, turmas, aulas, userRole, progressSummary, aulasAluno]);
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.isAluno ? (
          <>
            <MetricCard
              title="Aulas Assistidas"
              value={metrics.aulasAssistidas.toString()}
              change="Total de presenças"
              changeType="positive"
              icon={BookOpenCheck}
            />
            <MetricCard
              title="Taxa de Presença"
              value={metrics.taxaPresenca}
              change="Baseado nas aulas concluídas"
              changeType={parseInt(metrics.taxaPresenca) >= 75 ? "positive" : "neutral"}
              icon={CheckCircle}
            />
            <MetricCard
              title="Aulas Hoje"
              value={metrics.aulasHoje.toString()}
              change="Suas aulas de hoje"
              changeType="neutral"
              icon={Calendar}
            />
            <MetricCard
              title="Horas de Aprendizado"
              value={`${metrics.horasAprendizado}h`}
              change="Total de horas"
              changeType="positive"
              icon={Clock}
            />
          </>
        ) : (
          <>
            <MetricCard
              title="Professores Ativos"
              value={metrics.professorAtivos.toString()}
              change={`+${metrics.professorNovos} este mês`}
              changeType="positive"
              icon={Users}
            />
            <MetricCard
              title="Turmas em Andamento"
              value={metrics.turmasAtivas.toString()}
              change={`${metrics.turmasPlanejadas} planejadas`}
              changeType="positive"
              icon={GraduationCap}
            />
            <MetricCard
              title="Aulas Hoje"
              value={metrics.aulasHoje.toString()}
              change={`${metrics.aulasAgendadas} agendadas`}
              changeType="neutral"
              icon={Calendar}
            />
            <MetricCard
              title="Total de Dados"
              value={metrics.totalDados.toString()}
              change="Sistema funcionando"
              changeType="positive"
              icon={DollarSign}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              Acesso Rápido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActionsForRole.map((action, index) => (
              action.href ? (
                <Button 
                  key={index}
                  asChild
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Link to={action.href}>
                    <action.icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </Link>
                </Button>
              ) : (
                <Button 
                  key={index}
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={action.action || undefined}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              )
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
            {activitiesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-lg bg-muted/50 animate-pulse" />
                ))}
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        activity.type === 'presence' ? 'bg-accent' :
                        activity.type === 'aula' ? 'bg-primary' : 
                        activity.type === 'turma' ? 'bg-primary' : 'bg-secondary'
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma atividade recente.</p>
                <p className="text-sm">As atividades aparecerão aqui conforme você usar o sistema.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {userRole === 'aluno' ? 
              (aulasAluno.length > 0 ? "Minhas Próximas Aulas" : "Nenhuma Aula Agendada") :
              (aulas.length > 0 ? "Próximas Aulas" : "Nenhuma Aula Cadastrada")
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(userRole === 'aluno' ? aulasAluno : aulas).length > 0 ? (
            <div className="space-y-4">
              {(userRole === 'aluno' ? aulasAluno : aulas.slice(0, 3)).map((aula) => (
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
              <p>{userRole === 'aluno' ? 'Nenhuma aula agendada para você.' : 'Nenhuma aula cadastrada ainda.'}</p>
              <p className="text-sm">
                {userRole === 'aluno' ? 
                  'Suas próximas aulas aparecerão aqui.' : 
                  'Comece criando professores e turmas!'
                }
              </p>
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