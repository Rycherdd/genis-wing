import { useState } from "react";
import { Search, Clock, MapPin, User, Calendar, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAulas } from "@/hooks/useAulas";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AulasAluno() {
  const [searchTerm, setSearchTerm] = useState("");
  const { aulas, loading } = useAulas();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const filteredAulas = aulas.filter(aula =>
    aula.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aula.local?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aula.professores?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aula.turmas?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const today = new Date();
  const todayAulas = filteredAulas.filter(aula => 
    isSameDay(parseISO(aula.data), today)
  );

  const upcomingAulas = filteredAulas.filter(aula => 
    parseISO(aula.data) > today
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'bg-primary text-primary-foreground';
      case 'em_andamento':
        return 'bg-accent text-accent-foreground';
      case 'concluida':
        return 'bg-secondary text-secondary-foreground';
      case 'cancelada':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'Agendada';
      case 'em_andamento':
        return 'Em Andamento';
      case 'concluida':
        return 'Concluída';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const handleDownloadPdf = async (pdfUrl: string, titulo: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('aula-pdfs')
        .download(pdfUrl);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${titulo}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Minhas Aulas</h1>
        <p className="text-muted-foreground">
          Acompanhe suas aulas e horários
        </p>
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

      {/* Today's Classes */}
      {todayAulas.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Aulas de Hoje
          </h2>
          <div className="grid gap-4">
            {todayAulas.map((aula) => (
              <Card key={aula.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{aula.titulo}</CardTitle>
                      <CardDescription>{aula.descricao}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(aula.status)}>
                      {getStatusText(aula.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {aula.professores?.nome || 'Professor não informado'}
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Turma: {aula.turmas?.nome || 'Turma não informada'}
                    </span>
                    {aula.pdf_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPdf(aula.pdf_url!, aula.titulo)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Material da Aula
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Classes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Próximas Aulas</h2>
        {upcomingAulas.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  {filteredAulas.length === 0 && searchTerm
                    ? "Nenhuma aula encontrada com os termos de busca."
                    : "Não há aulas agendadas no momento."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {upcomingAulas.map((aula) => (
              <Card key={aula.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{aula.titulo}</CardTitle>
                      <CardDescription>{aula.descricao}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(aula.status)}>
                      {getStatusText(aula.status)}
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
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {aula.professores?.nome || 'Professor não informado'}
                    </div>
                    {aula.local && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {aula.local}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Turma: {aula.turmas?.nome || 'Turma não informada'}
                    </span>
                    {aula.pdf_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPdf(aula.pdf_url!, aula.titulo)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Material da Aula
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}