import { useState } from "react";
import { Search, Plus, Mail, Phone, MoreVertical, Edit, Trash2, Users, GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAlunos } from "@/hooks/useAlunos";
import { useAuth } from "@/contexts/AuthContext";
import { useMatriculas } from "@/hooks/useMatriculas";
import { useTurmas } from "@/hooks/useTurmas";
import { AlunoForm } from "@/components/forms/AlunoForm";
import { ConviteForm } from "@/components/forms/ConviteForm";

export default function Alunos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAlunoForm, setShowAlunoForm] = useState(false);
  const [showConviteForm, setShowConviteForm] = useState(false);
  const { alunos, loading, deleteAluno } = useAlunos();
  const { matriculas } = useMatriculas();
  const { turmas } = useTurmas();
  const { isAdmin } = useAuth();

  // Função para buscar as turmas de um aluno específico
  const getAlunoTurmas = (alunoId: string) => {
    const alunoMatriculas = matriculas.filter(m => m.aluno_id === alunoId);
    return turmas.filter(turma => alunoMatriculas.some(m => m.turma_id === turma.id));
  };

  const filteredAlunos = alunos.filter(aluno =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl md:text-3xl font-bold">Alunos</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {isAdmin ? "Gerencie todos os alunos cadastrados" : "Visualize todos os alunos cadastrados"}
          </p>
        </div>
        {isAdmin && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button onClick={() => setShowAlunoForm(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Novo Aluno
            </Button>
            <Button variant="outline" onClick={() => setShowConviteForm(true)} className="w-full sm:w-auto">
              <Mail className="mr-2 h-4 w-4" />
              Convidar Aluno
            </Button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar alunos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{alunos.length}</p>
                <p className="text-sm text-muted-foreground">Total de Alunos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {alunos.filter(aluno => getAlunoTurmas(aluno.id).length > 0).length}
                </p>
                <p className="text-sm text-muted-foreground">Matriculados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {alunos.filter(aluno => getAlunoTurmas(aluno.id).length === 0).length}
                </p>
                <p className="text-sm text-muted-foreground">Disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alunos List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAlunos.map((aluno) => (
          <Card key={aluno.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {aluno.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{aluno.nome}</h3>
                    <p className="text-sm text-muted-foreground">Aluno</p>
                  </div>
                </div>
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Ver Turmas
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => deleteAluno(aluno.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{aluno.email}</span>
                </div>
                {aluno.telefone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{aluno.telefone}</span>
                  </div>
                )}
              </div>

              {/* Turmas */}
              <div className="space-y-2 pt-3 border-t mt-4">
                <span className="text-sm font-medium">Turmas:</span>
                {(() => {
                  const alunoTurmas = getAlunoTurmas(aluno.id);
                  return alunoTurmas.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {alunoTurmas.map((turma) => (
                        <span
                          key={turma.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                        >
                          {turma.nome}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Não matriculado em nenhuma turma</p>
                  );
                })()}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-3 border-t mt-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className="text-sm font-medium text-green-600">Ativo</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAlunos.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum aluno encontrado.</p>
        </div>
      )}

      {isAdmin && (
        <>
          <AlunoForm open={showAlunoForm} onOpenChange={setShowAlunoForm} />
          <ConviteForm 
            open={showConviteForm} 
            onOpenChange={setShowConviteForm} 
            defaultRole="aluno"
          />
        </>
      )}
    </div>
  );
}