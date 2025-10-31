import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCheckins } from "@/hooks/useCheckins";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CheckinsDialogProps {
  aulaId: string;
  aulaTitulo: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheckinsDialog({
  aulaId,
  aulaTitulo,
  open,
  onOpenChange,
}: CheckinsDialogProps) {
  const { checkins, isLoading, removerCheckin } = useCheckins(aulaId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Check-ins - {aulaTitulo}</DialogTitle>
          <DialogDescription>
            Lista de alunos que fizeram check-in nesta aula
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : checkins && checkins.length > 0 ? (
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-3">
              {checkins.map((checkin) => (
                <div
                  key={checkin.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-primary/10 rounded-full p-2">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{checkin.alunos?.nome}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {checkin.alunos?.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {format(new Date(checkin.checkin_at), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </Badge>
                      </div>
                      {checkin.observacao && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          "{checkin.observacao}"
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removerCheckin(checkin.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum aluno fez check-in ainda
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
