import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ConteudoComplementar {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: 'video' | 'texto' | 'pdf' | 'link' | 'slides';
  conteudo: string;
  turma_id: string | null;
  modulo: string | null;
  tags: string[] | null;
  duracao_estimada: number | null;
  pontos_estudo: number;
  pontos_revisao: number;
  created_at: string;
}

export interface ProgressoConteudo {
  id: string;
  conteudo_id: string;
  status: 'nao_iniciado' | 'em_progresso' | 'concluido' | 'revisado';
  tempo_estudo: number;
  vezes_revisado: number;
  primeira_visualizacao: string | null;
  ultima_visualizacao: string | null;
  concluido_em: string | null;
}

export function useConteudos(turmaId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conteudos, setConteudos] = useState<ConteudoComplementar[]>([]);
  const [progressos, setProgressos] = useState<Map<string, ProgressoConteudo>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchConteudos = async () => {
    if (!user) return;

    try {
      setLoading(true);

      let query = supabase
        .from('conteudos_complementares')
        .select('*')
        .order('created_at', { ascending: false });

      if (turmaId) {
        query = query.eq('turma_id', turmaId);
      }

      const { data: conteudosData, error: conteudosError } = await query;

      if (conteudosError) throw conteudosError;

      setConteudos(conteudosData as ConteudoComplementar[] || []);

      // Buscar progresso do usuário
      const { data: progressosData, error: progressosError } = await supabase
        .from('progresso_conteudos')
        .select('*')
        .eq('user_id', user.id);

      if (progressosError) throw progressosError;

      const progressosMap = new Map(
        progressosData?.map((p) => [p.conteudo_id, p as ProgressoConteudo]) || []
      );
      setProgressos(progressosMap);
    } catch (error) {
      console.error('Erro ao buscar conteúdos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os conteúdos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const marcarComoEstudado = async (conteudoId: string, concluir: boolean = false) => {
    try {
      const { error } = await supabase.rpc('marcar_conteudo_estudado', {
        p_conteudo_id: conteudoId,
        p_tempo_minutos: 5, // Você pode ajustar isso com um timer real
        p_concluir: concluir,
      });

      if (error) throw error;

      await fetchConteudos();

      toast({
        title: 'Sucesso!',
        description: concluir
          ? 'Conteúdo marcado como concluído! +20 pontos 🎉'
          : 'Progresso salvo!',
      });
    } catch (error) {
      console.error('Erro ao marcar progresso:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o progresso.',
        variant: 'destructive',
      });
    }
  };

  const marcarRevisao = async (conteudoId: string) => {
    try {
      const { error } = await supabase.rpc('marcar_revisao', {
        p_conteudo_id: conteudoId,
      });

      if (error) throw error;

      await fetchConteudos();

      toast({
        title: 'Revisão registrada!',
        description: '+10 pontos pela revisão! 📚',
      });
    } catch (error) {
      console.error('Erro ao marcar revisão:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a revisão.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchConteudos();
  }, [user, turmaId]);

  return {
    conteudos,
    progressos,
    loading,
    marcarComoEstudado,
    marcarRevisao,
    refetch: fetchConteudos,
  };
}
