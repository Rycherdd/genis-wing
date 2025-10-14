import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, FileText, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AulaDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aula: any;
}

export function AulaDetailsDialog({ open, onOpenChange, aula }: AulaDetailsDialogProps) {
  if (!aula) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'agendada': { variant: 'secondary' as const, label: 'Agendada' },
      'em-andamento': { variant: 'default' as const, label: 'Em Andamento' },
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
          <DialogTitle className="text-2xl">{aula.titulo}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <div className="mt-2">
              {getStatusBadge(aula.status)}
            </div>
          </div>

          {/* Descrição */}
          {aula.descricao && (
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Descrição
              </label>
              <p className="mt-2 text-sm">{aula.descricao}</p>
            </div>
          )}

          {/* Professor e Turma */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Professor
              </label>
              <p className="mt-2 text-sm font-medium">
                {aula.professores?.nome || "Professor não atribuído"}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Turma
              </label>
              <p className="mt-2 text-sm font-medium">
                {aula.turmas?.nome || "Turma não atribuída"}
              </p>
            </div>
          </div>

          {/* Data e Horário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data
              </label>
              <p className="mt-2 text-sm">{formatDate(aula.data)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horário
              </label>
              <p className="mt-2 text-sm">{aula.horario_inicio} - {aula.horario_fim}</p>
            </div>
          </div>

          {/* Local */}
          {aula.local && (
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Local
              </label>
              <p className="mt-2 text-sm">{aula.local}</p>
            </div>
          )}

          {/* PDF URL */}
          {aula.pdf_url && (
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Material de Apoio
              </label>
              <a 
                href={aula.pdf_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 text-sm text-primary hover:underline"
              >
                Ver PDF da Aula
              </a>
            </div>
          )}

          {/* Criação */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Criada em {formatDate(aula.created_at)}
            </p>
            {aula.updated_at && aula.updated_at !== aula.created_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Última atualização em {formatDate(aula.updated_at)}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
