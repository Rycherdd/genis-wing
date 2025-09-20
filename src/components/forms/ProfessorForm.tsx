import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
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
import { useProfessores } from "@/hooks/useProfessores";

interface ProfessorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfessorForm({ open, onOpenChange }: ProfessorFormProps) {
  const { createProfessor } = useProfessores();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "", 
    telefone: "",
    status: "ativo" as "ativo" | "inativo" | "pendente",
  });
  const [especializacoes, setEspecializacoes] = useState<string[]>([]);
  const [novaEspecializacao, setNovaEspecializacao] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createProfessor({
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone || null,
        especializacao: especializacoes.length > 0 ? especializacoes : null,
        status: formData.status,
      });
      
      // Reset form
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        status: "ativo" as "ativo" | "inativo" | "pendente",
      });
      setEspecializacoes([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar professor:', error);
    } finally {
      setLoading(false);
    }
  };

  const adicionarEspecializacao = () => {
    if (novaEspecializacao.trim() && !especializacoes.includes(novaEspecializacao.trim())) {
      setEspecializacoes([...especializacoes, novaEspecializacao.trim()]);
      setNovaEspecializacao("");
    }
  };

  const removerEspecializacao = (especializacao: string) => {
    setEspecializacoes(especializacoes.filter(e => e !== especializacao));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Professor</DialogTitle>
          <DialogDescription>
            Cadastre um novo professor no sistema.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Digite o nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="professor@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => 
                setFormData({ ...formData, status: value as "ativo" | "inativo" | "pendente" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Especializações</Label>
            <div className="flex gap-2">
              <Input
                value={novaEspecializacao}
                onChange={(e) => setNovaEspecializacao(e.target.value)}
                placeholder="Ex: Oratória, Comunicação Empresarial"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarEspecializacao())}
              />
              <Button type="button" onClick={adicionarEspecializacao} size="icon" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {especializacoes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {especializacoes.map((esp, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {esp}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removerEspecializacao(esp)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Professor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}