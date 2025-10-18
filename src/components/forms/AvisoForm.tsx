import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAvisos } from "@/hooks/useAvisos";
import { useTurmas } from "@/hooks/useTurmas";
import { Bell, AlertCircle, Info, AlertTriangle, Pin, Users, Calendar } from "lucide-react";

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

  const getPrioridadeIcon = (prioridade: string) => {
    const icons = {
      baixa: Info,
      normal: Bell,
      alta: AlertCircle,
      urgente: AlertTriangle,
    };
    return icons[prioridade as keyof typeof icons] || Bell;
  };

  const PrioridadeIcon = getPrioridadeIcon(formData.prioridade);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Publicar Novo Aviso</DialogTitle>
              <DialogDescription className="mt-1">
                Compartilhe informações importantes com alunos e professores
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-3">
            <Label htmlFor="titulo" className="text-base font-semibold flex items-center gap-2">
              Título do Aviso *
            </Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ex: Alteração no horário das aulas"
              className="h-11 text-base"
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="conteudo" className="text-base font-semibold">
              Conteúdo *
            </Label>
            <Textarea
              id="conteudo"
              value={formData.conteudo}
              onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
              placeholder="Descreva o aviso com detalhes..."
              rows={6}
              className="text-base resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              Forneça informações claras e completas para melhor compreensão
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="prioridade" className="text-base font-semibold flex items-center gap-2">
                <PrioridadeIcon className="h-4 w-4" />
                Prioridade
              </Label>
              <Select
                value={formData.prioridade}
                onValueChange={(value: any) => setFormData({ ...formData, prioridade: value })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      <span>Baixa Prioridade</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="normal">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span>Normal</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="alta">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>Alta Prioridade</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="urgente">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Urgente</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="turma" className="text-base font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Turma (opcional)
              </Label>
              <Select
                value={formData.turma_id || "all"}
                onValueChange={(value) => setFormData({ ...formData, turma_id: value === "all" ? "" : value })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Todas as turmas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as turmas</SelectItem>
                  {turmas.map((turma) => (
                    <SelectItem key={turma.id} value={turma.id}>
                      {turma.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="data_expiracao" className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data de Expiração (opcional)
            </Label>
            <Input
              id="data_expiracao"
              type="date"
              value={formData.data_expiracao}
              onChange={(e) => setFormData({ ...formData, data_expiracao: e.target.value })}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Defina quando este aviso deixará de ser exibido
            </p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              <Pin className="h-5 w-5 text-primary" />
              <div>
                <Label htmlFor="fixado" className="text-base font-semibold cursor-pointer">
                  Fixar aviso no topo
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Avisos fixados aparecem em destaque
                </p>
              </div>
            </div>
            <Switch
              id="fixado"
              checked={formData.fixado}
              onCheckedChange={(checked) => setFormData({ ...formData, fixado: checked })}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} size="lg">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} size="lg" className="min-w-[140px]">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Publicando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Publicar Aviso
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
