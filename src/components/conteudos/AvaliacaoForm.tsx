import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2 } from "lucide-react";

interface AvaliacaoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Questao {
  id: string;
  pergunta: string;
  opcoes: string[];
  resposta_correta: number;
  pontos: number;
}

export function AvaliacaoForm({ open, onOpenChange, onSuccess }: AvaliacaoFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    nota_minima: "60",
    tentativas_permitidas: "3",
    tempo_limite: "",
  });
  const [questoes, setQuestoes] = useState<Questao[]>([
    {
      id: crypto.randomUUID(),
      pergunta: "",
      opcoes: ["", "", "", ""],
      resposta_correta: 0,
      pontos: 10,
    },
  ]);

  const adicionarQuestao = () => {
    setQuestoes([
      ...questoes,
      {
        id: crypto.randomUUID(),
        pergunta: "",
        opcoes: ["", "", "", ""],
        resposta_correta: 0,
        pontos: 10,
      },
    ]);
  };

  const removerQuestao = (id: string) => {
    if (questoes.length > 1) {
      setQuestoes(questoes.filter((q) => q.id !== id));
    }
  };

  const atualizarQuestao = (id: string, campo: keyof Questao, valor: any) => {
    setQuestoes(
      questoes.map((q) =>
        q.id === id ? { ...q, [campo]: valor } : q
      )
    );
  };

  const atualizarOpcao = (questaoId: string, index: number, valor: string) => {
    setQuestoes(
      questoes.map((q) =>
        q.id === questaoId
          ? { ...q, opcoes: q.opcoes.map((o, i) => (i === index ? valor : o)) }
          : q
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    const questoesIncompletas = questoes.some(
      (q) => !q.pergunta || q.opcoes.some((o) => !o.trim())
    );

    if (questoesIncompletas) {
      toast({
        title: "Erro",
        description: "Preencha todas as questões e opções.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const pontos_totais = questoes.reduce((sum, q) => sum + q.pontos, 0);

      const { error } = await supabase.from("avaliacoes").insert({
        titulo: formData.titulo,
        descricao: formData.descricao || null,
        questoes: questoes as any,
        pontos_totais,
        nota_minima: parseFloat(formData.nota_minima),
        tentativas_permitidas: parseInt(formData.tentativas_permitidas),
        tempo_limite: formData.tempo_limite ? parseInt(formData.tempo_limite) : null,
        created_by: user!.id,
        ativa: true,
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Avaliação criada com sucesso.",
      });

      // Reset form
      setFormData({
        titulo: "",
        descricao: "",
        nota_minima: "60",
        tentativas_permitidas: "3",
        tempo_limite: "",
      });
      setQuestoes([
        {
          id: crypto.randomUUID(),
          pergunta: "",
          opcoes: ["", "", "", ""],
          resposta_correta: 0,
          pontos: 10,
        },
      ]);

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao criar avaliação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a avaliação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Avaliação</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações básicas */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nota_minima">Nota Mínima (%)</Label>
                <Input
                  id="nota_minima"
                  type="number"
                  value={formData.nota_minima}
                  onChange={(e) => setFormData({ ...formData, nota_minima: e.target.value })}
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tentativas">Tentativas Permitidas</Label>
                <Input
                  id="tentativas"
                  type="number"
                  value={formData.tentativas_permitidas}
                  onChange={(e) => setFormData({ ...formData, tentativas_permitidas: e.target.value })}
                  min="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempo">Tempo Limite (min)</Label>
                <Input
                  id="tempo"
                  type="number"
                  value={formData.tempo_limite}
                  onChange={(e) => setFormData({ ...formData, tempo_limite: e.target.value })}
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Questões */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Questões</h3>
              <Button type="button" variant="outline" size="sm" onClick={adicionarQuestao}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Questão
              </Button>
            </div>

            {questoes.map((questao, qIndex) => (
              <Card key={questao.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Questão {qIndex + 1}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Pontos:</Label>
                      <Input
                        type="number"
                        value={questao.pontos}
                        onChange={(e) =>
                          atualizarQuestao(questao.id, "pontos", parseInt(e.target.value))
                        }
                        className="w-20"
                        min="1"
                      />
                      {questoes.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removerQuestao(questao.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pergunta *</Label>
                    <Textarea
                      value={questao.pergunta}
                      onChange={(e) => atualizarQuestao(questao.id, "pergunta", e.target.value)}
                      rows={2}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Opções *</Label>
                    {questao.opcoes.map((opcao, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`resposta-${questao.id}`}
                          checked={questao.resposta_correta === oIndex}
                          onChange={() => atualizarQuestao(questao.id, "resposta_correta", oIndex)}
                          className="cursor-pointer"
                        />
                        <Input
                          value={opcao}
                          onChange={(e) => atualizarOpcao(questao.id, oIndex, e.target.value)}
                          placeholder={`Opção ${oIndex + 1}`}
                          required
                        />
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">
                      Selecione a opção correta marcando o círculo
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Criando..." : "Criar Avaliação"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
