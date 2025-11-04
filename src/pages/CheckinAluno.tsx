import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAulas } from "@/hooks/useAulas";
import { useCheckins } from "@/hooks/useCheckins";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, MapPin, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function CheckinAluno() {
  const { aulas, loading: isLoadingAulas } = useAulas();
  const { checkins, fazerCheckin, isFazendoCheckin } = useCheckins();
  const [observacao, setObservacao] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [aluno, setAluno] = useState<any>(null);

  useEffect(() => {
    const fetchUserAndAluno = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Buscar dados do aluno logado
        const { data: alunoData } = await supabase
          .from('alunos')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        setAluno(alunoData);
      }
    };
    
    fetchUserAndAluno();
  }, []);

  // Filtrar apenas aulas futuras ou do dia atual
  const aulasFuturas = aulas?.filter((aula) => {
    const dataAula = new Date(aula.data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return dataAula >= hoje;
  });

  const verificarCheckin = (aulaId: string) => {
    return checkins?.some((c) => c.aula_id === aulaId && c.aluno_id === aluno?.id);
  };

  const handleCheckin = (aulaId: string) => {
    if (!aluno) return;
    fazerCheckin({ aulaId, alunoId: aluno.id, observacao: observacao || undefined });
    setObservacao("");
  };

  if (isLoadingAulas) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando aulas...</p>
        </div>
      </div>
    );
  }

  // Verificar se aluno está cadastrado
  if (!aluno) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Check-in nas Aulas</h1>
          <p className="text-muted-foreground">
            Faça check-in nas próximas aulas para confirmar sua presença
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Você ainda não está cadastrado como aluno no sistema. 
              Entre em contato com o administrador.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Check-in nas Aulas</h1>
        <p className="text-muted-foreground">
          Confirme sua participação nas próximas aulas fazendo check-in
        </p>
      </div>

      {aulasFuturas && aulasFuturas.length > 0 ? (
        <div className="grid gap-4">
          {aulasFuturas.map((aula) => {
            const jaFezCheckin = verificarCheckin(aula.id);
            
            return (
              <Card key={aula.id} className={jaFezCheckin ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {aula.titulo}
                        {jaFezCheckin && (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Check-in feito
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {aula.turmas?.nome}
                      </CardDescription>
                    </div>
                    {aula.status && (
                      <Badge variant={aula.status === "agendada" ? "secondary" : "outline"}>
                        {aula.status}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <div>
                        <p className="font-medium text-foreground">
                          {format(new Date(aula.data), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                        <p>
                          {aula.horario_inicio} - {aula.horario_fim}
                        </p>
                      </div>
                    </div>
                    {aula.local && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{aula.local}</span>
                      </div>
                    )}
                  </div>

                  {aula.descricao && (
                    <p className="text-sm text-muted-foreground">{aula.descricao}</p>
                  )}

                  {!jaFezCheckin && (
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Observação (opcional)"
                        value={observacao}
                        onChange={(e) => setObservacao(e.target.value)}
                        rows={2}
                      />
                      <Button
                        onClick={() => handleCheckin(aula.id)}
                        disabled={isFazendoCheckin || !aluno}
                        className="w-full"
                      >
                        <Circle className="h-4 w-4 mr-2" />
                        Fazer Check-in
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma aula disponível para check-in no momento.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Certifique-se de que você está matriculado em uma turma com aulas agendadas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
