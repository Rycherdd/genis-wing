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
import { Plus, Search, MoreVertical, Pin, Trash2, Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

  const getPrioridadeBadge = (prioridade: string) => {
    const variants = {
      baixa: "secondary",
      normal: "default",
      alta: "default",
      urgente: "destructive",
    };
    return <Badge variant={variants[prioridade as keyof typeof variants] as any}>{prioridade.toUpperCase()}</Badge>;
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Avisos e Comunicados</h1>
          <p className="text-muted-foreground">Confira as últimas notícias e informações importantes</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Aviso
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar avisos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {filteredAvisos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">Nenhum aviso encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredAvisos.map((aviso) => (
            <Card key={aviso.id} className={aviso.fixado ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {aviso.fixado && <Pin className="h-4 w-4 text-primary" />}
                      {getPrioridadeBadge(aviso.prioridade)}
                      {aviso.turmas && (
                        <Badge variant="outline" className="gap-1">
                          <Users className="h-3 w-3" />
                          {aviso.turmas.nome}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{aviso.titulo}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(aviso.data_publicacao), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                      {aviso.data_expiracao && (
                        <span className="text-xs">
                          Expira em: {format(new Date(aviso.data_expiracao), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
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
              <CardContent>
                <p className="whitespace-pre-wrap">{aviso.conteudo}</p>
              </CardContent>
            </Card>
          ))
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
