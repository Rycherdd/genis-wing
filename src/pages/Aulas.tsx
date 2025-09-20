import { useState } from "react";
import { Search, Plus, Calendar, Clock, Users, MapPin, MoreVertical, Edit, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Aula {
  id: string;
  titulo: string;
  professor: {
    nome: string;
    avatar?: string;
  };
  turma: string;
  data: string;
  horario: string;
  duracao: number; // em minutos
  local: string;
  presentes: number;
  totalAlunos: number;
  status: "agendada" | "em-andamento" | "concluida" | "cancelada";
}

const mockAulas: Aula[] = [
  {
    id: "1",
    titulo: "Técnicas de Oratória",
    professor: { nome: "Ana Silva" },
    turma: "Comunicação Avançada",
    data: "2024-03-20",
    horario: "14:00",
    duracao: 120,
    local: "Sala A1",
    presentes: 18,
    totalAlunos: 20,
    status: "concluida"
  },
  {
    id: "2", 
    titulo: "Apresentação em Público",
    professor: { nome: "Carlos Santos" },
    turma: "Oratória Básica",
    data: "2024-03-21",
    horario: "09:00",
    duracao: 90,
    local: "Auditório",
    presentes: 0,
    totalAlunos: 15,
    status: "agendada"
  }
];

export default function Aulas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [aulas] = useState<Aula[]>(mockAulas);

  const filteredAulas = aulas.filter(aula =>
    aula.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aula.professor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aula.turma.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: Aula['status']) => {
    const statusConfig = {
      'agendada': { variant: 'secondary' as const, label: 'Agendada' },
      'em-andamento': { variant: 'default' as const, label: 'Em Andamento' },
      'concluida': { variant: 'outline' as const, label: 'Concluída' },
      'cancelada': { variant: 'destructive' as const, label: 'Cancelada' }
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPresenceColor = (presentes: number, total: number) => {
    const percentage = (presentes / total) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Aulas</h1>
          <p className="text-muted-foreground">
            Gerencie as aulas e controle a presença dos alunos
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Aula
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar aulas..."
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
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-muted-foreground">Aulas Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-muted-foreground">Esta Semana</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">85%</p>
                <p className="text-sm text-muted-foreground">Presença Média</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">Salas Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aulas List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAulas.map((aula) => (
          <Card key={aula.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{aula.titulo}</h3>
                  {getStatusBadge(aula.status)}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      Controlar Presença
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Cancelar Aula
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Professor */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {aula.professor.nome.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{aula.professor.nome}</p>
                  <p className="text-xs text-muted-foreground">{aula.turma}</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(aula.data)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{aula.horario} ({aula.duracao}min)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{aula.local}</span>
                </div>
              </div>

              {/* Presence */}
              {aula.status === "concluida" && (
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-sm text-muted-foreground">Presença:</span>
                  <span className={`text-sm font-medium ${getPresenceColor(aula.presentes, aula.totalAlunos)}`}>
                    {aula.presentes}/{aula.totalAlunos} alunos
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAulas.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhuma aula encontrada.</p>
        </div>
      )}
    </div>
  );
}