import { useState, useEffect } from "react";
import { Check, X, MessageSquare, Users, Calendar, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePresenca } from "@/hooks/usePresenca";
import { useMatriculas } from "@/hooks/useMatriculas";
import { useAlunos } from "@/hooks/useAlunos";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PresencaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aula: {
    id: string;
    titulo: string;
    data: string;
    horario_inicio: string;
    horario_fim: string;
    turma_id: string;
    turmas?: { nome: string };
  };
}

interface AlunoPresenca {
  aluno_id: string;
  nome: string;
  email: string;
  presente: boolean;
  observacoes: string;
}

export function PresencaForm({ open, onOpenChange, aula }: PresencaFormProps) {
  const [alunosPresenca, setAlunosPresenca] = useState<AlunoPresenca[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { marcarPresencaLote, getPresencasByAula } = usePresenca();
  const { matriculas } = useMatriculas();
  const { alunos } = useAlunos();

  const loadAlunosAndPresenca = async () => {
    if (!open || !aula) return;

    setLoading(true);
    try {
      // Get students enrolled in this class
      const turmaMatriculas = matriculas.filter(m => m.turma_id === aula.turma_id);
      const alunosDaTurma = alunos.filter(aluno => 
        turmaMatriculas.some(m => m.aluno_id === aluno.id)
      );

      // Get existing presence records for this class
      const presencasExistentes = await getPresencasByAula(aula.id);

      // Create initial state
      const alunosComPresenca: AlunoPresenca[] = alunosDaTurma.map(aluno => {
        const presencaExistente = presencasExistentes.find(p => p.aluno_id === aluno.id);
        return {
          aluno_id: aluno.id,
          nome: aluno.nome,
          email: aluno.email,
          presente: presencaExistente?.presente || false,
          observacoes: presencaExistente?.observacoes || '',
        };
      });

      setAlunosPresenca(alunosComPresenca);
    } catch (error) {
      console.error('Erro ao carregar alunos e presença:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlunosAndPresenca();
  }, [open, aula, matriculas, alunos]);

  const handlePresencaChange = (alunoId: string, presente: boolean) => {
    setAlunosPresenca(prev =>
      prev.map(aluno =>
        aluno.aluno_id === alunoId ? { ...aluno, presente } : aluno
      )
    );
  };

  const handleObservacaoChange = (alunoId: string, observacoes: string) => {
    setAlunosPresenca(prev =>
      prev.map(aluno =>
        aluno.aluno_id === alunoId ? { ...aluno, observacoes } : aluno
      )
    );
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const presencasToSave = alunosPresenca.map(aluno => ({
        aulaId: aula.id,
        alunoId: aluno.aluno_id,
        presente: aluno.presente,
        observacoes: aluno.observacoes,
      }));

      await marcarPresencaLote(presencasToSave);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar presenças:', error);
    } finally {
      setSaving(false);
    }
  };

  const marcarTodosPresentes = () => {
    setAlunosPresenca(prev =>
      prev.map(aluno => ({ ...aluno, presente: true }))
    );
  };

  const marcarTodosFaltosos = () => {
    setAlunosPresenca(prev =>
      prev.map(aluno => ({ ...aluno, presente: false }))
    );
  };

  const presentesCount = alunosPresenca.filter(a => a.presente).length;
  const totalAlunos = alunosPresenca.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Controle de Presença
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(parseISO(aula.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {aula.horario_inicio} - {aula.horario_fim}
              </div>
            </div>
            <div>
              <strong>{aula.titulo}</strong> - {aula.turmas?.nome}
            </div>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary and Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Resumo da Presença
                  </CardTitle>
                  <Badge variant={presentesCount === totalAlunos ? "default" : "secondary"}>
                    {presentesCount}/{totalAlunos} presentes
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={marcarTodosPresentes}
                    className="flex items-center gap-1"
                  >
                    <Check className="h-4 w-4" />
                    Marcar Todos Presentes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={marcarTodosFaltosos}
                    className="flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Marcar Todos Ausentes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Students List */}
            {alunosPresenca.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center space-y-3">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">
                      Nenhum aluno matriculado nesta turma.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                <h3 className="font-medium">Lista de Alunos</h3>
                {alunosPresenca.map((aluno) => (
                  <Card key={aluno.aluno_id} className={`border-l-4 ${aluno.presente ? 'border-l-accent' : 'border-l-muted'}`}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{aluno.nome}</p>
                            <p className="text-sm text-muted-foreground">{aluno.email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`presente-${aluno.aluno_id}`}
                              checked={aluno.presente}
                              onCheckedChange={(checked) =>
                                handlePresencaChange(aluno.aluno_id, checked as boolean)
                              }
                            />
                            <label
                              htmlFor={`presente-${aluno.aluno_id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {aluno.presente ? (
                                <span className="text-accent flex items-center gap-1">
                                  <Check className="h-4 w-4" />
                                  Presente
                                </span>
                              ) : (
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <X className="h-4 w-4" />
                                  Ausente
                                </span>
                              )}
                            </label>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            Observações
                          </label>
                          <Textarea
                            placeholder="Observações sobre a presença do aluno..."
                            value={aluno.observacoes}
                            onChange={(e) =>
                              handleObservacaoChange(aluno.aluno_id, e.target.value)
                            }
                            className="min-h-[60px]"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving || alunosPresenca.length === 0}
              >
                {saving ? "Salvando..." : "Salvar Presenças"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}