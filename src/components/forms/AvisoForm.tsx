import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTurmas } from "@/hooks/useTurmas";

interface AvisoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AvisoFormData) => Promise<void>;
  initialData?: AvisoFormData & { id?: string };
}

export interface AvisoFormData {
  titulo: string;
  conteudo: string;
  prioridade: 'baixa' | 'normal' | 'alta' | 'urgente';
  fixado: boolean;
  turma_id: string | null;
  data_expiracao: string | null;
}

export function AvisoForm({ open, onOpenChange, onSubmit, initialData }: AvisoFormProps) {
  const { turmas } = useTurmas();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AvisoFormData>({
    titulo: "",
    conteudo: "",
    prioridade: "normal",
    fixado: false,
    turma_id: null,
    data_expiracao: null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        titulo: "",
        conteudo: "",
        prioridade: "normal",
        fixado: false,
        turma_id: null,
        data_expiracao: null,
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar aviso:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? "Editar Aviso" : "Publicar Novo Aviso"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ex: Recesso de Fim de Ano"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conteudo">Conteúdo *</Label>
            <Textarea
              id="conteudo"
              value={formData.conteudo}
              onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
              placeholder="Descreva os detalhes do aviso..."
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
              <Label htmlFor="turma">Turma (Opcional)</Label>
              <Select
                value={formData.turma_id || "todos"}
                onValueChange={(value) => 
                  setFormData({ ...formData, turma_id: value === "todos" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as Turmas</SelectItem>
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
            <Label htmlFor="data_expiracao">Data de Expiração (Opcional)</Label>
            <Input
              id="data_expiracao"
              type="date"
              value={formData.data_expiracao || ""}
              onChange={(e) => 
                setFormData({ ...formData, data_expiracao: e.target.value || null })
              }
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="fixado"
              checked={formData.fixado}
              onCheckedChange={(checked) => setFormData({ ...formData, fixado: checked })}
            />
            <Label htmlFor="fixado" className="cursor-pointer">
              Fixar no topo da lista
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : initialData?.id ? "Atualizar" : "Publicar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
