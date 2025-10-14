import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AulasTurmaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turmaId: string;
  turmaNome: string;
}

export function AulasTurmaDialog({ open, onOpenChange, turmaId, turmaNome }: AulasTurmaDialogProps) {
  const [aulas, setAulas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && turmaId) {
      fetchAulas();
    }
  }, [open, turmaId]);

  const fetchAulas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('aulas_agendadas')
        .select(`
          *,
          professores (nome)
        `)
        .eq('turma_id', turmaId)
        .order('data', { ascending: true })
        .order('horario_inicio', { ascending: true });

      if (error) throw error;
      setAulas(data || []);
    } catch (error) {
      console.error('Erro ao buscar aulas:', error);
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aulas da Turma: {turmaNome}</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : aulas.length > 0 ? (
          <div className="space-y-4">
            {aulas.map((aula) => (
              <Card key={aula.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{aula.titulo}</h3>
                      {aula.descricao && (
                        <p className="text-sm text-muted-foreground mt-1">{aula.descricao}</p>
                      )}
                    </div>
                    {getStatusBadge(aula.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(aula.data)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{aula.horario_inicio} - {aula.horario_fim}</span>
                    </div>

                    {aula.local && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{aula.local}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Prof. {aula.professores?.nome || "Não atribuído"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma aula agendada para esta turma ainda.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
