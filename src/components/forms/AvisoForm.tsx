import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAvisos } from "@/hooks/useAvisos";
import { useTurmas } from "@/hooks/useTurmas";

interface AvisoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AvisoForm({ open, onOpenChange }: AvisoFormProps) {
  const { createAviso } = useAvisos();
  const { turmas } = useTurmas();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: "",
    conteudo: "",
    prioridade: "normal" as "baixa" | "normal" | "alta" | "urgente",
    fixado: false,
    turma_id: "",
    data_expiracao: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createAviso({
        titulo: formData.titulo,
        conteudo: formData.conteudo,
        prioridade: formData.prioridade,
        fixado: formData.fixado,
        turma_id: formData.turma_id || null,
        data_expiracao: formData.data_expiracao || null,
      });

      setFormData({
        titulo: "",
        conteudo: "",
        prioridade: "normal",
        fixado: false,
        turma_id: "",
        data_expiracao: "",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao criar aviso:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Publicar Novo Aviso</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Digite o título do aviso"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conteudo">Conteúdo *</Label>
            <Textarea
              id="conteudo"
              value={formData.conteudo}
              onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
              placeholder="Digite o conteúdo do aviso"
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select
                value={formData.prioridade}
                onValueChange={(value: any) => setFormData({ ...formData, prioridade: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="turma">Turma (opcional)</Label>
              <Select
                value={formData.turma_id}
                onValueChange={(value) => setFormData({ ...formData, turma_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as turmas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as turmas</SelectItem>
                  {turmas.map((turma) => (
                    <SelectItem key={turma.id} value={turma.id}>
                      {turma.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_expiracao">Data de Expiração (opcional)</Label>
            <Input
              id="data_expiracao"
              type="date"
              value={formData.data_expiracao}
              onChange={(e) => setFormData({ ...formData, data_expiracao: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="fixado"
              checked={formData.fixado}
              onCheckedChange={(checked) => setFormData({ ...formData, fixado: checked })}
            />
            <Label htmlFor="fixado" className="cursor-pointer">
              Fixar no topo
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Publicando..." : "Publicar Aviso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
