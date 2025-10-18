import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProgress } from "@/hooks/useUserProgress";
import { Progress } from "@/components/ui/progress";
import { Award, BookOpen, Calendar, Clock, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";

export default function MeuProgresso() {
  const { progress, summary, loading } = useUserProgress();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando seu progresso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meu Progresso</h1>
          <p className="text-muted-foreground">
            Acompanhe seu desempenho e evolução
          </p>
        </div>

        {/* Métricas Gerais */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Taxa de Presença"
            value={`${summary.media_presenca.toFixed(1)}%`}
            icon={TrendingUp}
            change={summary.media_presenca >= 75 ? "Ótimo desempenho!" : "Continue se dedicando"}
            changeType={summary.media_presenca >= 75 ? "positive" : "neutral"}
          />
          <MetricCard
            title="Aulas Assistidas"
            value={summary.total_presencas.toString()}
            icon={BookOpen}
            change={`${summary.turmas_ativas} turma${summary.turmas_ativas !== 1 ? "s" : ""} ativa${summary.turmas_ativas !== 1 ? "s" : ""}`}
            changeType="neutral"
          />
          <MetricCard
            title="Formulários"
            value={summary.total_formularios.toString()}
            icon={Award}
            change="Respostas enviadas"
            changeType="neutral"
          />
          <MetricCard
            title="Horas de Estudo"
            value={`${summary.total_horas.toFixed(1)}h`}
            icon={Clock}
            change="Tempo total"
            changeType="neutral"
          />
        </div>

        {/* Progresso por Turma */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Progresso por Turma</h2>
          
          {progress.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Você ainda não está matriculado em nenhuma turma.
                </p>
              </CardContent>
            </Card>
          ) : (
            progress.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-card">
                  <CardTitle>{item.turma_nome}</CardTitle>
                  <CardDescription>
                    Última atividade: {new Date(item.ultima_atividade).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Taxa de Presença */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Taxa de Presença</span>
                      <span className="text-sm font-bold text-primary">
                        {parseFloat(item.taxa_presenca.toString()).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={parseFloat(item.taxa_presenca.toString())} />
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {item.aulas_assistidas}
                      </div>
                      <div className="text-xs text-muted-foreground">Aulas</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {item.formularios_respondidos}
                      </div>
                      <div className="text-xs text-muted-foreground">Formulários</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {parseFloat(item.horas_aprendizado.toString()).toFixed(1)}h
                      </div>
                      <div className="text-xs text-muted-foreground">Horas</div>
                    </div>
                  </div>

                  {/* Badge de Desempenho */}
                  <div className="flex items-center justify-center gap-2 p-4 bg-primary/10 rounded-lg">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="font-medium text-primary">
                      {parseFloat(item.taxa_presenca.toString()) >= 90
                        ? "🏆 Desempenho Excelente!"
                        : parseFloat(item.taxa_presenca.toString()) >= 75
                        ? "⭐ Bom Desempenho"
                        : parseFloat(item.taxa_presenca.toString()) >= 50
                        ? "📈 Continue Melhorando"
                        : "💪 Vamos Acelerar?"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
  );
}
