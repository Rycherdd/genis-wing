import { useState } from "react";
import { Plus, Search, Calendar, Users, Clock, MapPin, MoreHorizontal, Loader2 } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { useTurmas } from "@/hooks/useTurmas";

export default function Turmas() {
  const [searchTerm, setSearchTerm] = useState("");
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

  const getStatusBadge = (status: Turma['status']) => {
    switch (status) {
      case "ativa":
        return <Badge className="bg-accent text-accent-foreground">Ativa</Badge>;
      case "concluída":
        return <Badge className="bg-primary text-primary-foreground">Concluída</Badge>;
      case "planejada":
        return <Badge variant="outline">Planejada</Badge>;
      case "cancelada":
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-accent";
    if (progress >= 50) return "bg-primary"; 
    return "bg-muted-foreground";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Turmas</h1>
          <p className="text-muted-foreground">
            Gerencie todas as turmas e cronogramas
          </p>
        </div>
        <Button className="bg-gradient-primary shadow-medium">
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">45</p>
              <p className="text-sm text-muted-foreground">Turmas Ativas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">12</p>
              <p className="text-sm text-muted-foreground">Planejadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground">128</p>
              <p className="text-sm text-muted-foreground">Concluídas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">456</p>
              <p className="text-sm text-muted-foreground">Total Alunos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Turmas List */}
      <div className="space-y-4">
        {filteredTurmas.map((turma) => (
          <Card key={turma.id} className="bg-gradient-card shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{turma.name}</CardTitle>
                      {getStatusBadge(turma.status)}
                    </div>
                    <p className="text-muted-foreground">{turma.course}</p>
                    <p className="text-sm text-muted-foreground">Cliente: {turma.client}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={turma.professor.avatar} />
                      <AvatarFallback>
                        {turma.professor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{turma.professor.name}</p>
                      <p className="text-sm text-muted-foreground">Professor</p>
                    </div>
                  </div>
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
                    <DropdownMenuItem>Ver Agenda</DropdownMenuItem>
                    <DropdownMenuItem>Lista de Alunos</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Cancelar Turma
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Info Grid */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Período</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(turma.startDate).toLocaleDateString()} - {new Date(turma.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Horário</p>
                    <p className="text-xs text-muted-foreground">{turma.schedule}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Local</p>
                    <p className="text-xs text-muted-foreground">{turma.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Alunos</p>
                    <p className="text-xs text-muted-foreground">
                      {turma.students}/{turma.maxStudents} matriculados
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              {turma.status === "ativa" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso do Curso</span>
                    <span>{turma.progress}%</span>
                  </div>
                  <Progress value={turma.progress} className="h-2" />
                </div>
              )}

              {/* Occupancy */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ocupação</span>
                  <span>{Math.round((turma.students / turma.maxStudents) * 100)}%</span>
                </div>
                <Progress 
                  value={(turma.students / turma.maxStudents) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}