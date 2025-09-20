import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useTurmas } from "@/hooks/useTurmas";
import { useProfessores } from "@/hooks/useProfessores";

interface TurmaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TurmaForm({ open, onOpenChange }: TurmaFormProps) {
  const { createTurma } = useTurmas();
  const { professores } = useProfessores();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    professor_id: "",
    max_alunos: 20,
    data_inicio: "",
    data_fim: "",
    status: "planejada" as "ativa" | "planejada" | "concluida" | "cancelada",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createTurma({
        nome: formData.nome,
        descricao: formData.descricao || null,
        professor_id: formData.professor_id || null,
        max_alunos: formData.max_alunos,
        data_inicio: formData.data_inicio || null,
        data_fim: formData.data_fim || null,
        status: formData.status,
      });
      
      // Reset form
      setFormData({
        nome: "",
        descricao: "",
        professor_id: "",
        max_alunos: 20,
        data_inicio: "",
        data_fim: "",
        status: "planejada" as "ativa" | "planejada" | "concluida" | "cancelada",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar turma:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Turma</DialogTitle>
          <DialogDescription>
            Cadastre uma nova turma no sistema.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Turma *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Comunicação Empresarial - Turma A"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descrição da turma..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="professor_id">Professor</Label>
            <Select 
              value={formData.professor_id} 
              onValueChange={(value) => setFormData({ ...formData, professor_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um professor" />
              </SelectTrigger>
              <SelectContent>
                {professores.map((professor) => (
                  <SelectItem key={professor.id} value={professor.id}>
                    {professor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_alunos">Máximo de Alunos</Label>
            <Input
              id="max_alunos"
              type="number"
              min="1"
              value={formData.max_alunos}
              onChange={(e) => setFormData({ ...formData, max_alunos: parseInt(e.target.value) || 20 })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data de Início</Label>
              <Input
                id="data_inicio"
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data_fim">Data de Fim</Label>
              <Input
                id="data_fim"
                type="date"
                value={formData.data_fim}
                onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => 
                setFormData({ ...formData, status: value as "ativa" | "planejada" | "concluida" | "cancelada" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planejada">Planejada</SelectItem>
                <SelectItem value="ativa">Ativa</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Turma"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}