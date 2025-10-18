import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConteudos } from "@/hooks/useConteudos";
import { useAvaliacoes } from "@/hooks/useAvaliacoes";
import { BookOpen, Clock, CheckCircle, RefreshCw, Play, FileText, Video, Link2, FileSpreadsheet, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ConteudosComplementares() {
  const { conteudos, progressos, loading, marcarComoEstudado, marcarRevisao } = useConteudos();
  const { avaliacoes, tentativas } = useAvaliacoes();
  const [conteudoSelecionado, setConteudoSelecionado] = useState<string | null>(null);

  const getIconByTipo = (tipo: string) => {
    switch (tipo) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'pdf': return <FileText className="h-5 w-5" />;
      case 'link': return <Link2 className="h-5 w-5" />;
      case 'slides': return <FileSpreadsheet className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (conteudoId: string) => {
    const progresso = progressos.get(conteudoId);
    if (!progresso) return <Badge variant="outline">Não iniciado</Badge>;
    
    switch (progresso.status) {
      case 'concluido':
        return <Badge className="bg-green-500">✓ Concluído</Badge>;
      case 'revisado':
        return <Badge className="bg-blue-500">🔄 Revisado {progresso.vezes_revisado}x</Badge>;
      case 'em_progresso':
        return <Badge variant="secondary">Em progresso</Badge>;
      default:
        return <Badge variant="outline">Não iniciado</Badge>;
    }
  };

  const conteudoAtual = conteudos.find(c => c.id === conteudoSelecionado);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Conteúdos Complementares
        </h1>
        <p className="text-muted-foreground mt-2">
          Estude, revise e ganhe pontos expandindo seus conhecimentos!
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold mt-1">{conteudos.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Concluídos</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {Array.from(progressos.values()).filter(p => p.status === 'concluido' || p.status === 'revisado').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Revisões</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {Array.from(progressos.values()).reduce((sum, p) => sum + p.vezes_revisado, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-accent" />
              <span className="text-sm text-muted-foreground">Avaliações</span>
            </div>
            <p className="text-2xl font-bold mt-1">{avaliacoes.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="conteudos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="conteudos">Conteúdos</TabsTrigger>
          <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
        </TabsList>

        <TabsContent value="conteudos" className="space-y-4">
          {conteudos.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum conteúdo disponível ainda.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {conteudos.map((conteudo) => {
                const progresso = progressos.get(conteudo.id);
                return (
                  <Card key={conteudo.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getIconByTipo(conteudo.tipo)}
                          <CardTitle className="text-lg">{conteudo.titulo}</CardTitle>
                        </div>
                        {getStatusBadge(conteudo.id)}
                      </div>
                      {conteudo.descricao && (
                        <CardDescription className="line-clamp-2">{conteudo.descricao}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {conteudo.duracao_estimada && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {conteudo.duracao_estimada} min
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4" />
                            {conteudo.pontos_estudo} pts
                          </div>
                        </div>

                        {progresso && (
                          <div className="text-sm">
                            <div className="flex justify-between mb-1">
                              <span className="text-muted-foreground">Tempo de estudo</span>
                              <span className="font-medium">{progresso.tempo_estudo} min</span>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setConteudoSelecionado(conteudo.id)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            {progresso ? 'Continuar' : 'Iniciar'}
                          </Button>
                          {progresso && progresso.status === 'concluido' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => marcarRevisao(conteudo.id)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="avaliacoes" className="space-y-4">
          {avaliacoes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhuma avaliação disponível ainda.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {avaliacoes.map((avaliacao) => {
                const minhasTentativas = tentativas.get(avaliacao.id) || [];
                const melhorNota = minhasTentativas.length > 0 
                  ? Math.max(...minhasTentativas.map(t => t.nota))
                  : null;
                const aprovado = minhasTentativas.some(t => t.aprovado);

                return (
                  <Card key={avaliacao.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-accent" />
                          {avaliacao.titulo}
                        </CardTitle>
                        {aprovado && <Badge className="bg-green-500">✓ Aprovado</Badge>}
                      </div>
                      {avaliacao.descricao && (
                        <CardDescription>{avaliacao.descricao}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Questões:</span>
                            <p className="font-medium">{avaliacao.questoes.length}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Pontos:</span>
                            <p className="font-medium">{avaliacao.pontos_totais}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Nota mínima:</span>
                            <p className="font-medium">{avaliacao.nota_minima}%</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tentativas:</span>
                            <p className="font-medium">
                              {minhasTentativas.length}/{avaliacao.tentativas_permitidas}
                            </p>
                          </div>
                        </div>

                        {melhorNota !== null && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Melhor nota</span>
                              <span className="font-bold">{melhorNota.toFixed(1)}%</span>
                            </div>
                            <Progress value={melhorNota} />
                          </div>
                        )}

                        <Button 
                          className="w-full"
                          disabled={minhasTentativas.length >= avaliacao.tentativas_permitidas}
                        >
                          {minhasTentativas.length >= avaliacao.tentativas_permitidas
                            ? 'Tentativas esgotadas'
                            : 'Fazer Avaliação'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de visualização de conteúdo */}
      <Dialog open={!!conteudoSelecionado} onOpenChange={() => setConteudoSelecionado(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          {conteudoAtual && (
            <>
              <DialogHeader>
                <DialogTitle>{conteudoAtual.titulo}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {conteudoAtual.descricao && (
                  <p className="text-muted-foreground">{conteudoAtual.descricao}</p>
                )}

                {/* Aqui você pode renderizar o conteúdo baseado no tipo */}
                <div className="border rounded-lg p-4 bg-muted/50">
                  {conteudoAtual.tipo === 'video' && (
                    <div className="aspect-video bg-black rounded flex items-center justify-center">
                      <p className="text-white">Player de vídeo: {conteudoAtual.conteudo}</p>
                    </div>
                  )}
                  {conteudoAtual.tipo === 'link' && (
                    <a href={conteudoAtual.conteudo} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      Abrir link externo
                    </a>
                  )}
                  {conteudoAtual.tipo === 'texto' && (
                    <div className="prose max-w-none">
                      <p>{conteudoAtual.conteudo}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      marcarComoEstudado(conteudoAtual.id, true);
                      setConteudoSelecionado(null);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como Concluído
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setConteudoSelecionado(null)}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
