import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Questao {
  id: string;
  pergunta: string;
  opcoes: string[];
  resposta_correta: number;
  pontos: number;
}

export interface Avaliacao {
  id: string;
  titulo: string;
  descricao: string | null;
  conteudo_id: string | null;
  turma_id: string | null;
  questoes: Questao[];
  pontos_totais: number;
  tempo_limite: number | null;
  tentativas_permitidas: number;
  nota_minima: number;
  ativa: boolean;
}

export interface TentativaAvaliacao {
  id: string;
  avaliacao_id: string;
  nota: number;
  pontos_ganhos: number;
  tempo_gasto: number | null;
  aprovado: boolean;
  finalizado_em: string | null;
}

export function useAvaliacoes(turmaId?: string, apenasAtivas: boolean = true) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [tentativas, setTentativas] = useState<Map<string, TentativaAvaliacao[]>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchAvaliacoes = async () => {
    if (!user) return;

    try {
      setLoading(true);

      let query = supabase
        .from('avaliacoes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (apenasAtivas) {
        query = query.eq('ativa', true);
      }

      if (turmaId) {
        query = query.eq('turma_id', turmaId);
      }

      const { data: avaliacoesData, error: avaliacoesError } = await query;

      if (avaliacoesError) throw avaliacoesError;

      setAvaliacoes((avaliacoesData as unknown as Avaliacao[]) || []);

      // Buscar tentativas do usuário
      const { data: tentativasData, error: tentativasError } = await supabase
        .from('tentativas_avaliacoes')
        .select('*')
        .eq('user_id', user.id);

      if (tentativasError) throw tentativasError;

      const tentativasMap = new Map<string, TentativaAvaliacao[]>();
      tentativasData?.forEach((tentativa) => {
        const existing = tentativasMap.get(tentativa.avaliacao_id) || [];
        tentativasMap.set(tentativa.avaliacao_id, [...existing, tentativa]);
      });
      setTentativas(tentativasMap);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as avaliações.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const submeterAvaliacao = async (
    avaliacaoId: string,
    respostas: { questao_id: string; resposta_escolhida: number }[],
    tempoGasto: number
  ) => {
    try {
      // Buscar avaliação para calcular nota
      const avaliacao = avaliacoes.find((a) => a.id === avaliacaoId);
      if (!avaliacao) throw new Error('Avaliação não encontrada');

      // Calcular nota
      let pontosCorretos = 0;
      respostas.forEach((resposta) => {
        const questao = avaliacao.questoes.find((q) => q.id === resposta.questao_id);
        if (questao && questao.resposta_correta === resposta.resposta_escolhida) {
          pontosCorretos += questao.pontos;
        }
      });

      const nota = (pontosCorretos / avaliacao.pontos_totais) * 100;
      const aprovado = nota >= avaliacao.nota_minima;

      // Inserir tentativa
      const { error } = await supabase.from('tentativas_avaliacoes').insert({
        avaliacao_id: avaliacaoId,
        user_id: user!.id,
        respostas,
        nota,
        tempo_gasto: tempoGasto,
        aprovado,
        finalizado_em: new Date().toISOString(),
      });

      if (error) throw error;

      await fetchAvaliacoes();

      toast({
        title: aprovado ? '🎉 Parabéns!' : 'Não foi dessa vez',
        description: aprovado
          ? `Você foi aprovado com ${nota.toFixed(1)}%!`
          : `Sua nota foi ${nota.toFixed(1)}%. Tente novamente!`,
        variant: aprovado ? 'default' : 'destructive',
      });

      return { nota, aprovado };
    } catch (error) {
      console.error('Erro ao submeter avaliação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível submeter a avaliação.',
        variant: 'destructive',
      });
      return null;
    }
  };

  useEffect(() => {
    fetchAvaliacoes();
  }, [user, turmaId, apenasAtivas]);

  return {
    avaliacoes,
    tentativas,
    loading,
    submeterAvaliacao,
    refetch: fetchAvaliacoes,
  };
}
