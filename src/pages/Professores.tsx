import { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProfessores } from "@/hooks/useProfessores";
import { ProfessorForm } from "@/components/forms/ProfessorForm";
import { ConviteForm } from "@/components/forms/ConviteForm";

export default function Professores() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [professorFormOpen, setProfessorFormOpen] = useState(false);
  const [showConviteForm, setShowConviteForm] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState<any>(null);
  const [editingProfessor, setEditingProfessor] = useState<any>(null);
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const { professores, loading, updateProfessor } = useProfessores();

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

  const getNivelMentoriaLabel = (nivel: string | null) => {
    if (!nivel) return null;
    const labels: Record<string, string> = {
      aprendiz: "Mentor Aprendiz",
      semeador: "Mentor Semeador",
      criador: "Mentor Criador",
      mestre: "Mentor Mestre",
      lider_empresario: "Mentor Líder ou Empresário",
      guardiao_socio: "Mentor Guardião e Sócio Estratégico"
    };
    return labels[nivel] || nivel;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Professores</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie todos os professores da plataforma
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            className="bg-gradient-primary shadow-medium w-full sm:w-auto"
            onClick={() => setProfessorFormOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Professor
          </Button>
          <Button variant="outline" onClick={() => setShowConviteForm(true)} className="w-full sm:w-auto">
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
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
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
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProfessores.map((professor) => (
          <Card key={professor.id} className="bg-gradient-card shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback>
                      {professor.nome.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base md:text-lg truncate">{professor.nome}</CardTitle>
                    {getStatusBadge(professor.status)}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setSelectedProfessor(professor);
                      setViewProfileOpen(true);
                    }}>
                      Ver Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setEditingProfessor(professor);
                      setProfessorFormOpen(true);
                    }}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/agenda')}>
                      Ver Agenda
                    </DropdownMenuItem>
                    {professor.status === 'ativo' ? (
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => updateProfessor(professor.id, { status: 'inativo' })}
                      >
                        Desativar
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem 
                        className="text-accent"
                        onClick={() => updateProfessor(professor.id, { status: 'ativo' })}
                      >
                        Ativar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground break-all">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{professor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{professor.telefone || "Não informado"}</span>
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

              {/* Nível de Mentoria */}
              {professor.nivel_mentoria && (
                <div>
                  <p className="text-sm font-medium mb-2">Nível de Mentoria:</p>
                  <Badge variant="outline" className="text-xs">
                    {getNivelMentoriaLabel(professor.nivel_mentoria)}
                  </Badge>
                </div>
              )}
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
      <ProfessorForm 
        open={professorFormOpen} 
        onOpenChange={(open) => {
          setProfessorFormOpen(open);
          if (!open) setEditingProfessor(null);
        }}
        professor={editingProfessor}
      />
      <ConviteForm 
        open={showConviteForm} 
        onOpenChange={setShowConviteForm} 
        defaultRole="professor"
      />

      {/* View Profile Dialog */}
      <Dialog open={viewProfileOpen} onOpenChange={setViewProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Perfil do Professor</DialogTitle>
          </DialogHeader>
          {selectedProfessor && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {selectedProfessor.nome.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedProfessor.nome}</h3>
                  {getStatusBadge(selectedProfessor.status)}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{selectedProfessor.email}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                  <p className="text-sm">{selectedProfessor.telefone || "Não informado"}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Especialidades</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedProfessor.especializacao?.map((specialty: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    )) || <p className="text-sm text-muted-foreground">Nenhuma especialização</p>}
                  </div>
                </div>

                {selectedProfessor.nivel_mentoria && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nível de Mentoria</p>
                    <Badge variant="outline">
                      {getNivelMentoriaLabel(selectedProfessor.nivel_mentoria)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}