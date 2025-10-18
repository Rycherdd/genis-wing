import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAvisos } from "@/hooks/useAvisos";
import { useAuth } from "@/contexts/AuthContext";
import { AvisoForm } from "@/components/forms/AvisoForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, MoreVertical, Pin, Trash2, Calendar, Users, Bell, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

export default function Avisos() {
  const { avisos, loading, deleteAviso } = useAvisos();
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [avisoToDelete, setAvisoToDelete] = useState<string | null>(null);

  const filteredAvisos = avisos.filter((aviso) =>
    aviso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aviso.conteudo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPrioridadeConfig = (prioridade: string) => {
    const configs = {
      baixa: { 
        icon: Info, 
        variant: "secondary" as const,
        label: "Baixa Prioridade",
        colorClass: "text-muted-foreground"
      },
      normal: { 
        icon: Bell, 
        variant: "default" as const,
        label: "Normal",
        colorClass: "text-primary"
      },
      alta: { 
        icon: AlertCircle, 
        variant: "default" as const,
        label: "Alta Prioridade",
        colorClass: "text-orange-500"
      },
      urgente: { 
        icon: AlertTriangle, 
        variant: "destructive" as const,
        label: "Urgente",
        colorClass: "text-destructive"
      },
    };
    return configs[prioridade as keyof typeof configs] || configs.normal;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const avisosFixados = filteredAvisos.filter(a => a.fixado);
  const avisosNormais = filteredAvisos.filter(a => !a.fixado);

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Avisos e Comunicados</h1>
              <p className="text-muted-foreground mt-1">Mantenha-se atualizado com as informações importantes</p>
            </div>
          </div>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowForm(true)} size="lg" className="shadow-md">
            <Plus className="mr-2 h-5 w-5" />
            Novo Aviso
          </Button>
        )}
      </div>

      {/* Search Section */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou conteúdo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Avisos Section */}
      <div className="space-y-6">
        {filteredAvisos.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-muted-foreground">Nenhum aviso encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">Tente ajustar sua busca</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Avisos Fixados */}
            {avisosFixados.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Pin className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Avisos Fixados</h2>
                </div>
                <div className="space-y-4">
                  {avisosFixados.map((aviso) => {
                    const prioridadeConfig = getPrioridadeConfig(aviso.prioridade);
                    const PrioridadeIcon = prioridadeConfig.icon;
                    
                    return (
                      <Card key={aviso.id} className="shadow-md border-primary/50 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-all">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <Pin className="h-4 w-4 text-primary flex-shrink-0" />
                                <Badge variant={prioridadeConfig.variant} className="gap-1.5 px-3 py-1">
                                  <PrioridadeIcon className="h-3.5 w-3.5" />
                                  {prioridadeConfig.label}
                                </Badge>
                                {aviso.turmas && (
                                  <Badge variant="outline" className="gap-1.5 px-3 py-1">
                                    <Users className="h-3.5 w-3.5" />
                                    {aviso.turmas.nome}
                                  </Badge>
                                )}
                              </div>
                              <CardTitle className="text-2xl leading-tight">{aviso.titulo}</CardTitle>
                            </div>
                            {isAdmin && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => setAvisoToDelete(aviso.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-base leading-relaxed whitespace-pre-wrap">{aviso.conteudo}</p>
                          <Separator />
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(aviso.data_publicacao), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                            {aviso.data_expiracao && (
                              <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                                <AlertCircle className="h-4 w-4" />
                                Expira em: {format(new Date(aviso.data_expiracao), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Avisos Normais */}
            {avisosNormais.length > 0 && (
              <div className="space-y-4">
                {avisosFixados.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">Avisos Recentes</h2>
                  </div>
                )}
                <div className="space-y-4">
                  {avisosNormais.map((aviso) => {
                    const prioridadeConfig = getPrioridadeConfig(aviso.prioridade);
                    const PrioridadeIcon = prioridadeConfig.icon;
                    
                    return (
                      <Card key={aviso.id} className="shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={prioridadeConfig.variant} className="gap-1.5 px-3 py-1">
                                  <PrioridadeIcon className="h-3.5 w-3.5" />
                                  {prioridadeConfig.label}
                                </Badge>
                                {aviso.turmas && (
                                  <Badge variant="outline" className="gap-1.5 px-3 py-1">
                                    <Users className="h-3.5 w-3.5" />
                                    {aviso.turmas.nome}
                                  </Badge>
                                )}
                              </div>
                              <CardTitle className="text-xl leading-tight">{aviso.titulo}</CardTitle>
                            </div>
                            {isAdmin && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => setAvisoToDelete(aviso.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-base leading-relaxed whitespace-pre-wrap">{aviso.conteudo}</p>
                          <Separator />
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(aviso.data_publicacao), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                            {aviso.data_expiracao && (
                              <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                                <AlertCircle className="h-4 w-4" />
                                Expira em: {format(new Date(aviso.data_expiracao), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AvisoForm open={showForm} onOpenChange={setShowForm} />

      <AlertDialog open={!!avisoToDelete} onOpenChange={() => setAvisoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este aviso? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (avisoToDelete) {
                  deleteAviso(avisoToDelete);
                  setAvisoToDelete(null);
                }
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
