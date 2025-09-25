import { useState, useEffect } from "react";
import { Search, Calendar, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { usePresencaAluno } from "@/hooks/usePresencaAluno";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MinhasPresencas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [aulasFaltadas, setAulasFaltadas] = useState<any[]>([]);
  const { presencas, loading, getPresencasByStatus, getAulasFaltadas } = usePresencaAluno();

  useEffect(() => {
    const loadAulasFaltadas = async () => {
      const faltas = await getAulasFaltadas();
      setAulasFaltadas(faltas);
    };
    
    if (!loading) {
      loadAulasFaltadas();
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const presentes = getPresencasByStatus(true);
  const faltas = getPresencasByStatus(false);

  const filteredPresentes = presentes.filter(presenca =>
    presenca.aulas?.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    presenca.aulas?.turmas?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    presenca.observacoes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFaltas = faltas.filter(presenca =>
    presenca.aulas?.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    presenca.aulas?.turmas?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    presenca.observacoes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAulasFaltadas = aulasFaltadas.filter(aula =>
    aula.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aula.turmas?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderPresencaCard = (presenca: any, isPresente: boolean) => (
    <Card key={presenca.id} className={`border-l-4 ${isPresente ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {isPresente ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {presenca.aulas?.titulo}
            </CardTitle>
            <CardDescription>Turma: {presenca.aulas?.turmas?.nome}</CardDescription>
          </div>
          <Badge variant={isPresente ? "default" : "destructive"}>
            {isPresente ? "Presente" : "Falta"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(parseISO(presenca.aulas?.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {presenca.aulas?.horario_inicio} - {presenca.aulas?.horario_fim}
          </div>
          {presenca.aulas?.local && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {presenca.aulas?.local}
            </div>
          )}
        </div>
        {presenca.observacoes && (
          <div className="bg-muted/50 rounded-lg p-3 mt-3">
            <p className="text-sm"><strong>Observações:</strong> {presenca.observacoes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderAulaFaltadaCard = (aula: any) => (
    <Card key={aula.id} className="border-l-4 border-l-orange-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              {aula.titulo}
            </CardTitle>
            <CardDescription>Turma: {aula.turmas?.nome}</CardDescription>
          </div>
          <Badge variant="outline" className="border-orange-500 text-orange-600">
            Ausência
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(parseISO(aula.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {aula.horario_inicio} - {aula.horario_fim}
          </div>
          {aula.local && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {aula.local}
            </div>
          )}
        </div>
        {aula.descricao && (
          <p className="text-sm text-muted-foreground mt-2">{aula.descricao}</p>
        )}
      </CardContent>
    </Card>
  );

  const totalAulas = presentes.length + faltas.length + aulasFaltadas.length;
  const percentualPresenca = totalAulas > 0 ? Math.round((presentes.length / totalAulas) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Minhas Presenças</h1>
        <p className="text-muted-foreground">
          Acompanhe seu histórico de presença e faltas nas aulas
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{presentes.length}</p>
                <p className="text-sm text-muted-foreground">Presenças</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{faltas.length}</p>
                <p className="text-sm text-muted-foreground">Faltas Registradas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{aulasFaltadas.length}</p>
                <p className="text-sm text-muted-foreground">Ausências</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-primary">{percentualPresenca}%</p>
                <p className="text-sm text-muted-foreground">Presença</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar aulas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="presentes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="presentes">
            Presenças ({filteredPresentes.length})
          </TabsTrigger>
          <TabsTrigger value="faltas">
            Faltas ({filteredFaltas.length})
          </TabsTrigger>
          <TabsTrigger value="ausencias">
            Ausências ({filteredAulasFaltadas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="presentes" className="space-y-4">
          {filteredPresentes.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">
                    {presentes.length === 0 
                      ? "Nenhuma presença registrada ainda."
                      : "Nenhuma presença encontrada com os termos de busca."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPresentes.map((presenca) => renderPresencaCard(presenca, true))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="faltas" className="space-y-4">
          {filteredFaltas.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">
                    {faltas.length === 0 
                      ? "Nenhuma falta registrada! Parabéns!"
                      : "Nenhuma falta encontrada com os termos de busca."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredFaltas.map((presenca) => renderPresencaCard(presenca, false))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ausencias" className="space-y-4">
          {filteredAulasFaltadas.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">
                    {aulasFaltadas.length === 0 
                      ? "Nenhuma ausência encontrada."
                      : "Nenhuma ausência encontrada com os termos de busca."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAulasFaltadas.map((aula) => renderAulaFaltadaCard(aula))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}