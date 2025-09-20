import { useState } from "react";
import { Plus, Search, Calendar, Users, Clock, MapPin, MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTurmas } from "@/hooks/useTurmas";
import { TurmaForm } from "@/components/forms/TurmaForm";

export default function Turmas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [turmaFormOpen, setTurmaFormOpen] = useState(false);
  const { turmas, loading, deleteTurma } = useTurmas();

  const filteredTurmas = turmas.filter(turma =>
    turma.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (turma.descricao && turma.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'ativa': { variant: 'default' as const, label: 'Ativa' },
      'planejada': { variant: 'secondary' as const, label: 'Planejada' },
      'concluida': { variant: 'outline' as const, label: 'Concluída' },
      'cancelada': { variant: 'destructive' as const, label: 'Cancelada' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Não definido";
    return new Date(dateString).toLocaleDateString('pt-BR');
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
          <h1 className="text-3xl font-bold">Turmas</h1>
          <p className="text-muted-foreground">
            Gerencie todas as turmas e seus alunos
          </p>
        </div>
        <Button 
          className="bg-gradient-primary shadow-medium"
          onClick={() => setTurmaFormOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Turma
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar turmas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {turmas.filter(t => t.status === 'ativa').length}
                </p>
                <p className="text-sm text-muted-foreground">Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {turmas.filter(t => t.status === 'planejada').length}
                </p>
                <p className="text-sm text-muted-foreground">Planejadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {turmas.filter(t => t.status === 'concluida').length}
                </p>
                <p className="text-sm text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{turmas.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Turmas List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTurmas.map((turma) => (
          <Card key={turma.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">{turma.nome}</h3>
                  {getStatusBadge(turma.status)}
                  {turma.descricao && (
                    <p className="text-xs text-muted-foreground mt-1">{turma.descricao}</p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                    <DropdownMenuItem>Editar</DropdownMenuItem>
                    <DropdownMenuItem>Ver Aulas</DropdownMenuItem>
                    <DropdownMenuItem>Lista de Alunos</DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => deleteTurma(turma.id)}
                    >
                      Excluir Turma
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Professor */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {(turma as any).professores?.nome 
                      ? (turma as any).professores.nome.split(' ').map((n: string) => n[0]).join('') 
                      : 'PR'
                    }
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {(turma as any).professores?.nome || "Professor não atribuído"}
                  </p>
                  <p className="text-xs text-muted-foreground">Professor</p>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formatDate(turma.data_inicio)} - {formatDate(turma.data_fim)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Máximo: {turma.max_alunos} alunos</span>
                </div>
              </div>

              {/* Students Progress */}
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm text-muted-foreground">Vagas:</span>
                <span className="text-sm font-medium">0/{turma.max_alunos}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTurmas.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {turmas.length === 0 
              ? "Nenhuma turma cadastrada. Clique em 'Nova Turma' para começar."
              : "Nenhuma turma encontrada com os critérios de busca."
            }
          </p>
        </div>
      )}

      {/* Turma Form */}
      <TurmaForm open={turmaFormOpen} onOpenChange={setTurmaFormOpen} />
    </div>
  );
}