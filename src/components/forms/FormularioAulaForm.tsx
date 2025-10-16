import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, GripVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Formulario, Pergunta } from "@/hooks/useFormulariosAulas";
import { useFormulariosAulas } from "@/hooks/useFormulariosAulas";
import { useAulas } from "@/hooks/useAulas";

interface FormularioAulaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formulario?: Formulario;
}

export function FormularioAulaForm({ open, onOpenChange, formulario }: FormularioAulaFormProps) {
  const { createFormulario, updateFormulario } = useFormulariosAulas();
  const { aulas } = useAulas();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    aula_id: "",
    titulo: "",
    descricao: "",
    ativo: true,
  });
  
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);

  useEffect(() => {
    if (formulario) {
      setFormData({
        aula_id: formulario.aula_id,
        titulo: formulario.titulo,
        descricao: formulario.descricao || "",
        ativo: formulario.ativo,
      });
      setPerguntas(formulario.perguntas);
    } else {
      setFormData({
        aula_id: "",
        titulo: "",
        descricao: "",
        ativo: true,
      });
      setPerguntas([]);
    }
  }, [formulario]);

  const addPergunta = () => {
    const newPergunta: Pergunta = {
      id: `pergunta-${Date.now()}`,
      texto: "",
      tipo: "texto",
      obrigatoria: false,
    };
    setPerguntas([...perguntas, newPergunta]);
  };

  const removePergunta = (id: string) => {
    setPerguntas(perguntas.filter(p => p.id !== id));
  };

  const updatePergunta = (id: string, updates: Partial<Pergunta>) => {
    setPerguntas(perguntas.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formulario) {
        await updateFormulario(formulario.id, {
          ...formData,
          perguntas,
        });
      } else {
        await createFormulario({
          ...formData,
          perguntas,
        });
      }
      
      setFormData({
        aula_id: "",
        titulo: "",
        descricao: "",
        ativo: true,
      });
      setPerguntas([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{formulario ? "Editar Formulário" : "Novo Formulário"}</DialogTitle>
          <DialogDescription>
            {formulario ? "Edite as informações do formulário." : "Crie um novo formulário de avaliação para a aula."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="aula_id">Aula *</Label>
            <Select 
              value={formData.aula_id} 
              onValueChange={(value) => setFormData({ ...formData, aula_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma aula" />
              </SelectTrigger>
              <SelectContent>
                {aulas.map((aula) => (
                  <SelectItem key={aula.id} value={aula.id}>
                    {aula.titulo} - {new Date(aula.data).toLocaleDateString('pt-BR')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titulo">Título do Formulário *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ex: Avaliação da Aula"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descrição do formulário..."
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
            />
            <Label htmlFor="ativo">Formulário ativo (visível para alunos)</Label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Perguntas</Label>
              <Button type="button" size="sm" onClick={addPergunta}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Pergunta
              </Button>
            </div>

            {perguntas.map((pergunta, index) => (
              <Card key={pergunta.id}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                    <div className="flex-1 space-y-3">
                      <Input
                        placeholder="Digite a pergunta"
                        value={pergunta.texto}
                        onChange={(e) => updatePergunta(pergunta.id, { texto: e.target.value })}
                        required
                      />
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Select
                          value={pergunta.tipo}
                          onValueChange={(value) => 
                            updatePergunta(pergunta.id, { tipo: value as Pergunta['tipo'] })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="texto">Texto</SelectItem>
                            <SelectItem value="multipla_escolha">Múltipla Escolha</SelectItem>
                            <SelectItem value="nota">Nota (1-5)</SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`obrigatoria-${pergunta.id}`}
                            checked={pergunta.obrigatoria}
                            onCheckedChange={(checked) => 
                              updatePergunta(pergunta.id, { obrigatoria: checked })
                            }
                          />
                          <Label htmlFor={`obrigatoria-${pergunta.id}`}>Obrigatória</Label>
                        </div>
                      </div>

                      {pergunta.tipo === 'multipla_escolha' && (
                        <div className="space-y-2">
                          <Label>Opções (uma por linha)</Label>
                          <Textarea
                            placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                            value={(pergunta.opcoes || []).join('\n')}
                            onChange={(e) => 
                              updatePergunta(pergunta.id, { 
                                opcoes: e.target.value.split('\n').filter(o => o.trim()) 
                              })
                            }
                            rows={3}
                          />
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePergunta(pergunta.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || perguntas.length === 0}>
              {loading ? "Salvando..." : formulario ? "Atualizar Formulário" : "Criar Formulário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}