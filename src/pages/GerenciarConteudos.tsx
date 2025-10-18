import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Video, FileText, Link2, Trophy, Trash2, Edit } from "lucide-react";
import { useConteudos } from "@/hooks/useConteudos";
import { useAvaliacoes } from "@/hooks/useAvaliacoes";
import { ConteudoForm } from "@/components/conteudos/ConteudoForm";
import { AvaliacaoForm } from "@/components/conteudos/AvaliacaoForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function GerenciarConteudos() {
  const { conteudos, loading, refetch } = useConteudos();
  const { avaliacoes, loading: loadingAvaliacoes, refetch: refetchAvaliacoes } = useAvaliacoes();
  const [showConteudoForm, setShowConteudoForm] = useState(false);
  const [showAvaliacaoForm, setShowAvaliacaoForm] = useState(false);
  const { toast } = useToast();

  const handleDeleteConteudo = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este conteúdo?")) return;

    try {
      const { error } = await supabase
        .from("conteudos_complementares")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Conteúdo excluído com sucesso.",
      });

      refetch();
    } catch (error) {
      console.error("Erro ao excluir conteúdo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o conteúdo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAvaliacao = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta avaliação?")) return;

    try {
      const { error } = await supabase.from("avaliacoes").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Avaliação excluída com sucesso.",
      });

      refetchAvaliacoes();
    } catch (error) {
      console.error("Erro ao excluir avaliação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a avaliação.",
        variant: "destructive",
      });
    }
  };

  const getIconByTipo = (tipo: string) => {
    switch (tipo) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "link":
        return <Link2 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Gerenciar Conteúdos
        </h1>
        <p className="text-muted-foreground mt-2">
          Crie e gerencie conteúdos complementares e avaliações para os alunos
        </p>
      </div>

      <Tabs defaultValue="conteudos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="conteudos">Conteúdos Complementares</TabsTrigger>
          <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
        </TabsList>

        {/* Conteúdos */}
        <TabsContent value="conteudos" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Total de conteúdos: {conteudos.length}
            </p>
            <Button onClick={() => setShowConteudoForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Conteúdo
            </Button>
          </div>

          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Carregando...</p>
              </CardContent>
            </Card>
          ) : conteudos.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhum conteúdo criado ainda. Clique em "Novo Conteúdo" para começar.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {conteudos.map((conteudo) => (
                <Card key={conteudo.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getIconByTipo(conteudo.tipo)}
                        <CardTitle className="text-base">{conteudo.titulo}</CardTitle>
                      </div>
                      <Badge variant="outline">{conteudo.tipo}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {conteudo.descricao && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {conteudo.descricao}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{conteudo.duracao_estimada}min</span>
                      <span>
                        <Trophy className="h-3 w-3 inline mr-1" />
                        {conteudo.pontos_estudo} pts
                      </span>
                    </div>

                    {conteudo.modulo && (
                      <Badge variant="secondary" className="text-xs">
                        {conteudo.modulo}
                      </Badge>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteConteudo(conteudo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Avaliações */}
        <TabsContent value="avaliacoes" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Total de avaliações: {avaliacoes.length}
            </p>
            <Button onClick={() => setShowAvaliacaoForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Avaliação
            </Button>
          </div>

          {loadingAvaliacoes ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Carregando...</p>
              </CardContent>
            </Card>
          ) : avaliacoes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhuma avaliação criada ainda. Clique em "Nova Avaliação" para começar.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {avaliacoes.map((avaliacao) => (
                <Card key={avaliacao.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-accent" />
                        {avaliacao.titulo}
                      </CardTitle>
                      <Badge variant={avaliacao.ativa ? "default" : "secondary"}>
                        {avaliacao.ativa ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {avaliacao.descricao && (
                      <p className="text-sm text-muted-foreground">{avaliacao.descricao}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Questões: </span>
                        <span className="font-medium">{avaliacao.questoes.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pontos: </span>
                        <span className="font-medium">{avaliacao.pontos_totais}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Nota mínima: </span>
                        <span className="font-medium">{avaliacao.nota_minima}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tentativas: </span>
                        <span className="font-medium">{avaliacao.tentativas_permitidas}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteAvaliacao(avaliacao.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ConteudoForm
        open={showConteudoForm}
        onOpenChange={setShowConteudoForm}
        onSuccess={refetch}
      />
      <AvaliacaoForm
        open={showAvaliacaoForm}
        onOpenChange={setShowAvaliacaoForm}
        onSuccess={refetchAvaliacoes}
      />
    </div>
  );
}
