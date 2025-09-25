import { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfessores } from "@/hooks/useProfessores";
import { ProfessorForm } from "@/components/forms/ProfessorForm";
import { ConviteForm } from "@/components/forms/ConviteForm";

export default function Professores() {
  const [searchTerm, setSearchTerm] = useState("");
  const [professorFormOpen, setProfessorFormOpen] = useState(false);
  const [showConviteForm, setShowConviteForm] = useState(false);
  const { professores, loading, deleteProfessor } = useProfessores();

  const filteredProfessores = professores.filter(professor =>
    professor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (professor.especializacao && professor.especializacao.some((specialty: string) => 
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge className="bg-accent text-accent-foreground">Ativo</Badge>;
      case "inativo":
        return <Badge variant="secondary">Inativo</Badge>;
      case "pendente":
        return <Badge variant="outline">Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Professores</h1>
          <p className="text-muted-foreground">
            Gerencie todos os professores da plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-gradient-primary shadow-medium"
            onClick={() => setProfessorFormOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Professor
          </Button>
          <Button variant="outline" onClick={() => setShowConviteForm(true)}>
            <Mail className="mr-2 h-4 w-4" />
            Convidar Professor
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou especialidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">
                {professores.filter(p => p.status === 'ativo').length}
              </p>
              <p className="text-sm text-muted-foreground">Total Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {professores.filter(p => 
                  new Date(p.created_at).getMonth() === new Date().getMonth()
                ).length}
              </p>
              <p className="text-sm text-muted-foreground">Novos este Mês</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground">
                {professores.filter(p => p.status === 'pendente').length}
              </p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{professores.length}</p>
              <p className="text-sm text-muted-foreground">Total Professores</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professors Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProfessores.map((professor) => (
          <Card key={professor.id} className="bg-gradient-card shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {professor.nome.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{professor.nome}</CardTitle>
                    {getStatusBadge(professor.status)}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
                    <DropdownMenuItem>Editar</DropdownMenuItem>
                    <DropdownMenuItem>Ver Agenda</DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => deleteProfessor(professor.id)}
                    >
                      Desativar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {professor.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {professor.telefone || "Não informado"}
                </div>
              </div>

              {/* Specialties */}
              <div>
                <p className="text-sm font-medium mb-2">Especialidades:</p>
                <div className="flex flex-wrap gap-1">
                  {professor.especializacao?.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  )) || <p className="text-xs text-muted-foreground">Nenhuma especialização</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProfessores.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {professores.length === 0 
              ? "Nenhum professor cadastrado. Clique em 'Novo Professor' para começar."
              : "Nenhum professor encontrado com os critérios de busca."
            }
          </p>
        </div>
      )}

      {/* Professor Form */}
      <ProfessorForm open={professorFormOpen} onOpenChange={setProfessorFormOpen} />
      <ConviteForm 
        open={showConviteForm} 
        onOpenChange={setShowConviteForm} 
        defaultRole="professor"
      />
    </div>
  );
}