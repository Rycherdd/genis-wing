import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useManageUsers } from "@/hooks/useManageUsers";
import { CriarUsuarioForm } from "@/components/forms/CriarUsuarioForm";
import { Loader2, UserX, UserCheck, UserPlus, Users, Shield, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GerenciarUsuarios() {
  const { users, loading, actionLoading, deleteUser, updateUserRole, createUser } = useManageUsers();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<{ id: string; name: string } | null>(null);

  const handleDeactivateUser = async () => {
    if (userToDeactivate) {
      await deleteUser(userToDeactivate.id);
      setUserToDeactivate(null);
    }
  };

  const handleCreateUser = async (userData: {
    email: string;
    password: string;
    fullName: string;
    userRole: string;
  }) => {
    await createUser(userData);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-destructive text-destructive-foreground';
      case 'professor':
        return 'bg-primary text-primary-foreground';
      case 'aluno':
        return 'bg-accent text-accent-foreground';
      case 'inactive':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-3 w-3" />;
      case 'inactive':
        return <UserX className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const isUserActive = (role: string) => role !== 'inactive';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando usuários...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Visualize, crie e exclua usuários do sistema
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          disabled={actionLoading !== null}
          className="w-full sm:w-auto"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Criar Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Total de {users.length} usuários cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`${getRoleColor(user.user_role)} flex items-center gap-1 w-fit`}
                        >
                          {getRoleIcon(user.user_role)}
                          {user.user_role === 'inactive' ? 'Inativo' : user.user_role}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Select 
                          value={user.user_role || 'inactive'}
                          onValueChange={async (newRole) => {
                            if (newRole !== user.user_role) {
                              await updateUserRole(user.id, newRole);
                            }
                          }}
                          disabled={actionLoading === user.id}
                        >
                          <SelectTrigger className="w-[140px]">
                            {actionLoading === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <SelectValue placeholder="Selecionar..." />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aluno">Aluno</SelectItem>
                            <SelectItem value="professor">Professor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {isUserActive(user.user_role) && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={actionLoading === user.id}
                                onClick={() => setUserToDeactivate({ 
                                  id: user.id, 
                                  name: user.full_name 
                                })}
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Desativar Usuário</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja desativar o usuário <strong>{user.full_name}</strong>?
                                  O usuário não conseguirá mais fazer login.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setUserToDeactivate(null)}>
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDeactivateUser}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Desativar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
                Nenhum usuário encontrado
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Comece criando um novo usuário.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <CriarUsuarioForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSubmit={handleCreateUser}
        loading={actionLoading === 'creating'}
      />

    </div>
  );
}