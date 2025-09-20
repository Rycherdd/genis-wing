import { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, Mail, Phone, MapPin } from "lucide-react";
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

interface Professor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  status: "ativo" | "inativo" | "pendente";
  totalClasses: number;
  rating: number;
  location: string;
  avatar?: string;
}

const mockProfessors: Professor[] = [
  {
    id: "1",
    name: "Ana Silva Santos",
    email: "ana.silva@email.com",
    phone: "(11) 99999-9999",
    specialties: ["Comunicação Empresarial", "Oratória"],
    status: "ativo",
    totalClasses: 45,
    rating: 4.8,
    location: "São Paulo, SP",
  },
  {
    id: "2", 
    name: "Carlos Roberto Lima",
    email: "carlos.lima@email.com",
    phone: "(11) 88888-8888",
    specialties: ["Técnicas de Apresentação", "Public Speaking"],
    status: "ativo",
    totalClasses: 32,
    rating: 4.6,
    location: "Rio de Janeiro, RJ",
  },
  {
    id: "3",
    name: "Mariana Costa Oliveira",
    email: "mariana.costa@email.com", 
    phone: "(11) 77777-7777",
    specialties: ["Comunicação Digital", "Media Training"],
    status: "pendente",
    totalClasses: 0,
    rating: 0,
    location: "Belo Horizonte, MG",
  },
];

export default function Professores() {
  const [searchTerm, setSearchTerm] = useState("");
  const [professors] = useState<Professor[]>(mockProfessors);

  const filteredProfessors = professors.filter(professor =>
    professor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professor.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getStatusBadge = (status: Professor['status']) => {
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
        <Button className="bg-gradient-primary shadow-medium">
          <Plus className="mr-2 h-4 w-4" />
          Novo Professor
        </Button>
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
              <p className="text-2xl font-bold text-accent">127</p>
              <p className="text-sm text-muted-foreground">Total Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">8</p>
              <p className="text-sm text-muted-foreground">Novos este Mês</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground">15</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">4.7</p>
              <p className="text-sm text-muted-foreground">Avaliação Média</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professors Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProfessors.map((professor) => (
          <Card key={professor.id} className="bg-gradient-card shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={professor.avatar} />
                    <AvatarFallback>
                      {professor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{professor.name}</CardTitle>
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
                    <DropdownMenuItem className="text-destructive">
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
                  {professor.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {professor.location}
                </div>
              </div>

              {/* Specialties */}
              <div>
                <p className="text-sm font-medium mb-2">Especialidades:</p>
                <div className="flex flex-wrap gap-1">
                  {professor.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-between text-sm">
                <div>
                  <p className="font-medium">{professor.totalClasses}</p>
                  <p className="text-muted-foreground">Aulas</p>
                </div>
                <div>
                  <p className="font-medium">
                    {professor.rating > 0 ? professor.rating.toFixed(1) : "N/A"}
                  </p>
                  <p className="text-muted-foreground">Avaliação</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}