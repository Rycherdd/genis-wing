import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, MapPin, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TurmaDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turma: any;
}

export function TurmaDetailsDialog({ open, onOpenChange, turma }: TurmaDetailsDialogProps) {
  if (!turma) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Não definido";
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'ativa': { variant: 'default' as const, label: 'Ativa' },
      'planejada': { variant: 'secondary' as const, label: 'Planejada' },
      'concluida': { variant: 'outline' as const, label: 'Concluída' },
      'cancelada': { variant: 'destructive' as const, label: 'Cancelada' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{turma.nome}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <div className="mt-2">
              {getStatusBadge(turma.status)}
            </div>
          </div>

          {/* Descrição */}
          {turma.descricao && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Descrição</label>
              <p className="mt-2 text-sm">{turma.descricao}</p>
            </div>
          )}

          {/* Professor */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Professor Responsável
            </label>
            <p className="mt-2 text-sm font-medium">
              {turma.professores?.nome || "Professor não atribuído"}
            </p>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Início
              </label>
              <p className="mt-2 text-sm">{formatDate(turma.data_inicio)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Término
              </label>
              <p className="mt-2 text-sm">{formatDate(turma.data_fim)}</p>
            </div>
          </div>

          {/* Capacidade */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Capacidade
            </label>
            <p className="mt-2 text-sm">Máximo de {turma.max_alunos} alunos</p>
          </div>

          {/* Criação */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Criada em {formatDate(turma.created_at)}
            </p>
            {turma.updated_at && turma.updated_at !== turma.created_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Última atualização em {formatDate(turma.updated_at)}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
