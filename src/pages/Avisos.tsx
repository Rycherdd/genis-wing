import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAvisos } from "@/hooks/useAvisos";
import { useAuth } from "@/contexts/AuthContext";
import { AvisoForm, AvisoFormData } from "@/components/forms/AvisoForm";
import { Bell, Pin, Search, MoreVertical, Edit, Trash2, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Avisos() {
  const { avisos, loading, createAviso, updateAviso, deleteAviso } = useAvisos();
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAviso, setEditingAviso] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredAvisos = avisos.filter((aviso) =>
    aviso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aviso.conteudo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateOrUpdate = async (data: AvisoFormData) => {
    if (editingAviso) {
      await updateAviso(editingAviso.id, data);
      setEditingAviso(null);
    } else {
      await createAviso(data);
    }
  };

  const handleEdit = (aviso: any) => {
    setEditingAviso(aviso);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteAviso(deletingId);
      setDeletingId(null);
    }
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      baixa: "secondary",
      normal: "default",
      alta: "outline",
      urgente: "destructive",
    };
    return (
      <Badge variant={variants[prioridade] || "default"}>
        {prioridade.charAt(0).toUpperCase() + prioridade.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Avisos
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? "Gerencie os avisos do sistema" : "Fique por dentro das novidades"}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => { setEditingAviso(null); setShowForm(true); }}>
            <Bell className="h-4 w-4 mr-2" />
            Novo Aviso
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar avisos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredAvisos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "Nenhum aviso encontrado" : "Nenhum aviso publicado"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAvisos.map((aviso) => (
            <Card key={aviso.id} className={aviso.fixado ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {aviso.fixado && <Pin className="h-4 w-4 text-primary" />}
                      <CardTitle className="text-xl">{aviso.titulo}</CardTitle>
                    </div>
                    <CardDescription className="flex items-center gap-2 flex-wrap">
                      <span>{formatDate(aviso.data_publicacao)}</span>
                      {getPrioridadeBadge(aviso.prioridade)}
                      {aviso.turmas && (
                        <Badge variant="outline">{aviso.turmas.nome}</Badge>
                      )}
                      {aviso.data_expiracao && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expira em {formatDate(aviso.data_expiracao)}
                        </Badge>
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
                        <DropdownMenuItem onClick={() => handleEdit(aviso)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingId(aviso.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
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
          ))}
        </div>
      )}

      {isAdmin && (
        <AvisoForm
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) setEditingAviso(null);
          }}
          onSubmit={handleCreateOrUpdate}
          initialData={editingAviso}
        />
      )}

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este aviso? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
