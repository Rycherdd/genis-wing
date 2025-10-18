import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAvaliacoes } from "@/hooks/useAvaliacoes";

interface ConteudoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ConteudoForm({ open, onOpenChange, onSuccess }: ConteudoFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { avaliacoes } = useAvaliacoes();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipo: "video",
    conteudo: "",
    duracao_estimada: "",
    pontos_estudo: "20",
    pontos_revisao: "10",
    modulo: "",
    tags: "",
    avaliacao_id: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("conteudos_complementares").insert({
        titulo: formData.titulo,
        descricao: formData.descricao || null,
        tipo: formData.tipo,
        conteudo: formData.conteudo,
        duracao_estimada: formData.duracao_estimada ? parseInt(formData.duracao_estimada) : null,
        pontos_estudo: parseInt(formData.pontos_estudo),
        pontos_revisao: parseInt(formData.pontos_revisao),
        modulo: formData.modulo || null,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : null,
        avaliacao_id: formData.avaliacao_id || null,
        created_by: user!.id,
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Conteúdo criado com sucesso.",
      });

      setFormData({
        titulo: "",
        descricao: "",
        tipo: "video",
        conteudo: "",
        duracao_estimada: "",
        pontos_estudo: "20",
        pontos_revisao: "10",
        modulo: "",
        tags: "",
        avaliacao_id: "",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao criar conteúdo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o conteúdo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Conteúdo Complementar</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="tipo">Tipo de Conteúdo *</Label>
            <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Vídeo (YouTube/Vimeo)</SelectItem>
                <SelectItem value="texto">Texto/Artigo</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="link">Link Externo</SelectItem>
                <SelectItem value="slides">Slides</SelectItem>
                <SelectItem value="exercicio_video">Exercício de Gravação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conteudo">
              {formData.tipo === "video" && "URL do Vídeo (YouTube/Vimeo) *"}
              {formData.tipo === "link" && "URL do Link *"}
              {formData.tipo === "texto" && "Conteúdo do Texto *"}
              {formData.tipo === "exercicio_video" && "Instruções do Exercício *"}
              {(formData.tipo === "pdf" || formData.tipo === "slides") && "URL do Arquivo *"}
            </Label>
            {formData.tipo === "texto" || formData.tipo === "exercicio_video" ? (
              <Textarea
                id="conteudo"
                value={formData.conteudo}
                onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                rows={6}
                required
              />
            ) : (
              <Input
                id="conteudo"
                value={formData.conteudo}
                onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                placeholder="https://..."
                required
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duracao">Duração Estimada (min)</Label>
              <Input
                id="duracao"
                type="number"
                value={formData.duracao_estimada}
                onChange={(e) => setFormData({ ...formData, duracao_estimada: e.target.value })}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modulo">Módulo</Label>
              <Input
                id="modulo"
                value={formData.modulo}
                onChange={(e) => setFormData({ ...formData, modulo: e.target.value })}
                placeholder="Ex: Comunicação"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pontos_estudo">Pontos por Estudo</Label>
              <Input
                id="pontos_estudo"
                type="number"
                value={formData.pontos_estudo}
                onChange={(e) => setFormData({ ...formData, pontos_estudo: e.target.value })}
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pontos_revisao">Pontos por Revisão</Label>
              <Input
                id="pontos_revisao"
                type="number"
                value={formData.pontos_revisao}
                onChange={(e) => setFormData({ ...formData, pontos_revisao: e.target.value })}
                min="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="oratória, comunicação, técnicas"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avaliacao">Avaliação Obrigatória (Opcional)</Label>
            <Select 
              value={formData.avaliacao_id} 
              onValueChange={(value) => setFormData({ ...formData, avaliacao_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nenhuma avaliação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma avaliação</SelectItem>
                {avaliacoes.map((av) => (
                  <SelectItem key={av.id} value={av.id}>
                    {av.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Se selecionada, o aluno precisará passar na avaliação para concluir o conteúdo
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Criando..." : "Criar Conteúdo"}
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
