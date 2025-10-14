import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, AlertCircle, Info, AlertTriangle, Check } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNotifications } from "@/hooks/useNotifications";
import { Loader2 } from "lucide-react";

interface NotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsDialog({ open, onOpenChange }: NotificationsDialogProps) {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();

  const getPriorityIcon = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'media':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityBadge = (prioridade: string) => {
    const config = {
      'alta': { variant: 'destructive' as const, label: 'Alta' },
      'media': { variant: 'default' as const, label: 'Média' },
      'normal': { variant: 'secondary' as const, label: 'Normal' }
    };
    
    const priority = config[prioridade as keyof typeof config] || config.normal;
    return <Badge variant={priority.variant}>{priority.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : notifications.length > 0 ? (
          <>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card key={notification.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getPriorityIcon(notification.prioridade)}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold">{notification.titulo}</h3>
                          {getPriorityBadge(notification.prioridade)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {notification.conteudo}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatDate(notification.data_publicacao)}</span>
                            {notification.turma_nome && (
                              <>
                                <span>•</span>
                                <span>{notification.turma_nome}</span>
                              </>
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Marcar como lido
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={markAllAsRead}>
                Marcar todas como lidas
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma notificação recente.</p>
            <p className="text-sm mt-1">Você está em dia!</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
