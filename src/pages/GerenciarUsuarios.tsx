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
  const { users, loading, actionLoading, deleteUser, activateUser, createUser } = useManageUsers();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userToToggle, setUserToToggle] = useState<{ id: string; action: 'activate' | 'deactivate'; name: string } | null>(null);

  const handleToggleUserStatus = async () => {
    if (userToToggle) {
      if (userToToggle.action === 'activate') {
        await activateUser(userToToggle.id, 'user');
      } else {
        await deleteUser(userToToggle.id);
      }
      setUserToToggle(null);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">
            Visualize, crie e exclua usuários do sistema
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          disabled={actionLoading !== null}
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
          <div className="overflow-x-auto">
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
                        {isUserActive(user.user_role) ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={actionLoading === user.id}
                                onClick={() => setUserToToggle({ 
                                  id: user.id, 
                                  action: 'deactivate', 
                                  name: user.full_name 
                                })}
                              >
                                {actionLoading === user.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <UserX className="h-4 w-4" />
                                )}
                                {actionLoading !== user.id && "Desativar"}
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
                                <AlertDialogCancel onClick={() => setUserToToggle(null)}>
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleToggleUserStatus}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Desativar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Select 
                            onValueChange={async (newRole) => {
                              if (newRole !== 'inactive') {
                                await activateUser(user.id, newRole);
                              }
                            }}
                          >
                            <SelectTrigger className="w-auto">
                              <SelectValue placeholder="Ativar como..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Usuário</SelectItem>
                              <SelectItem value="professor">Professor</SelectItem>
                              <SelectItem value="aluno">Aluno</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

      {userToToggle && (
        <AlertDialog open={!!userToToggle} onOpenChange={() => setUserToToggle(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {userToToggle.action === 'activate' ? 'Ativar Usuário' : 'Desativar Usuário'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {userToToggle.action === 'activate' 
                  ? `Tem certeza que deseja ativar o usuário ${userToToggle.name}?`
                  : `Tem certeza que deseja desativar o usuário ${userToToggle.name}? O usuário não conseguirá mais fazer login.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserToToggle(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleToggleUserStatus}
                className={userToToggle.action === 'deactivate' 
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
                }
              >
                {userToToggle.action === 'activate' ? 'Ativar' : 'Desativar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}