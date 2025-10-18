import { useEffect, useState } from "react";
import { Loader2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Formulario } from "@/hooks/useFormulariosAulas";
import { supabase } from "@/integrations/supabase/client";

interface VerRespostasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formulario: Formulario | null;
}

interface RespostaComAluno {
  id: string;
  aluno_id: string;
  respostas: Record<string, any>;
  created_at: string;
  aluno: {
    nome: string;
    email: string;
  };
}

export function VerRespostasDialog({ open, onOpenChange, formulario }: VerRespostasDialogProps) {
  const [respostas, setRespostas] = useState<RespostaComAluno[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && formulario) {
      fetchRespostas();
    }
  }, [open, formulario?.id]);

  const fetchRespostas = async () => {
    if (!formulario) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('respostas_formularios')
        .select(`
          *,
          aluno:alunos(nome, email)
        `)
        .eq('formulario_id', formulario.id);

      if (error) throw error;
      setRespostas((data || []) as any);
    } catch (error) {
      console.error('Erro ao buscar respostas:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderResposta = (pergunta: any, valor: any) => {
    if (pergunta.tipo === 'nota') {
      return (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((nota) => (
            <div 
              key={nota} 
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                valor === nota 
                  ? 'bg-primary text-primary-foreground font-bold' 
                  : 'bg-muted'
              }`}
            >
              {nota}
            </div>
          ))}
        </div>
      );
    }

    if (pergunta.tipo === 'multipla_escolha') {
      return <p className="font-medium">{valor || 'Sem resposta'}</p>;
    }

    return <p className="whitespace-pre-wrap">{valor || 'Sem resposta'}</p>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Respostas - {formulario?.titulo}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : respostas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma resposta ainda.</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{respostas.length} resposta(s)</Badge>
              </div>

              {respostas.map((resposta) => (
                <Card key={resposta.id}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {resposta.aluno.nome}
                      <span className="text-sm text-muted-foreground font-normal">
                        ({resposta.aluno.email})
                      </span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Respondido em {new Date(resposta.created_at).toLocaleString('pt-BR')}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formulario?.perguntas.map((pergunta, index) => (
                      <div key={pergunta.id} className="space-y-2">
                        <p className="font-medium text-sm">
                          {index + 1}. {pergunta.texto}
                        </p>
                        <div className="pl-4">
                          {renderResposta(pergunta, resposta.respostas[pergunta.id])}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
