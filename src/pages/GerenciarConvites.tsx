import { useState } from "react";
import { Search, Plus, Mail, Clock, Check, X, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useConvites } from "@/hooks/useConvites";
import { ConviteForm } from "@/components/forms/ConviteForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export default function GerenciarConvites() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showConviteForm, setShowConviteForm] = useState(false);
  const { convites, loading, deleteConvite, resendInvite } = useConvites();

  const filteredConvites = convites.filter(convite =>
    convite.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    convite.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    convite.invited_by_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'aceito':
        return <Badge variant="default" className="text-green-600 bg-green-50 border-green-600"><Check className="h-3 w-3 mr-1" />Aceito</Badge>;
      case 'expirado':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Expirado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'aluno':
        return <Badge variant="secondary" className="text-blue-600 bg-blue-50">Aluno</Badge>;
      case 'professor':
        return <Badge variant="secondary" className="text-purple-600 bg-purple-50">Professor</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const handleResendInvite = async (convite: any) => {
    try {
      await resendInvite(convite);
    } catch (error) {
      console.error('Error resending invite:', error);
    }
  };

  const handleDeleteConvite = async (id: string) => {
    try {
      await deleteConvite(id);
    } catch (error) {
      console.error('Error deleting invite:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Convites</h1>
          <p className="text-muted-foreground">
            Gerencie os convites enviados para alunos e professores
          </p>
        </div>
        <Button onClick={() => setShowConviteForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Convite
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{convites.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{convites.filter(c => c.status === 'pendente').length}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{convites.filter(c => c.status === 'aceito').length}</p>
                <p className="text-sm text-muted-foreground">Aceitos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{convites.filter(c => c.status === 'expirado').length}</p>
                <p className="text-sm text-muted-foreground">Expirados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar convites..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Convites List */}
      {filteredConvites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {convites.length === 0 
                ? "Nenhum convite enviado ainda."
                : "Nenhum convite encontrado com os termos de busca."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredConvites.map((convite) => (
            <Card key={convite.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">{convite.email}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Convidado por {convite.invited_by_name || 'Sistema'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(convite.role)}
                    {getStatusBadge(convite.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <p>Enviado em: {format(new Date(convite.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                    <p>Expira em: {format(new Date(convite.expires_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                    {convite.accepted_at && (
                      <p>Aceito em: {format(new Date(convite.accepted_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {convite.status === 'pendente' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResendInvite(convite)}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Reenviar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteConvite(convite.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConviteForm 
        open={showConviteForm} 
        onOpenChange={setShowConviteForm} 
      />
    </div>
  );
}