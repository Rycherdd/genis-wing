import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  user_id: string;
  nome: string;
  pontos_totais: number;
  nivel: number;
  streak_atual: number;
  posicao: number;
}

export function useLeaderboard(turmaId?: string, periodo: 'semanal' | 'mensal' | 'geral' = 'geral') {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      // Se filtrar por turma, buscar IDs dos alunos primeiro
      let alunoIds: string[] | undefined;
      if (turmaId) {
        const { data: matriculasData } = await supabase
          .from('matriculas')
          .select('aluno_id')
          .eq('turma_id', turmaId)
          .eq('status', 'ativa');
        
        alunoIds = matriculasData?.map(m => m.aluno_id) || [];
      }

      let query = supabase
        .from('user_gamification')
        .select(`
          user_id,
          pontos_totais,
          nivel,
          streak_atual
        `)
        .order('pontos_totais', { ascending: false })
        .limit(50);

      // Aplicar filtro de turma se necessário
      if (alunoIds && alunoIds.length > 0) {
        // Buscar user_ids dos alunos
        const { data: alunosData } = await supabase
          .from('alunos')
          .select('user_id')
          .in('id', alunoIds);
        
        const userIds = alunosData?.map(a => a.user_id) || [];
        if (userIds.length > 0) {
          query = query.in('user_id', userIds);
        }
      }

      // Filtrar por período
      if (periodo === 'semanal') {
        const umaSemanaAtras = new Date();
        umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
        query = query.gte('updated_at', umaSemanaAtras.toISOString());
      } else if (periodo === 'mensal') {
        const umMesAtras = new Date();
        umMesAtras.setMonth(umMesAtras.getMonth() - 1);
        query = query.gte('updated_at', umMesAtras.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar leaderboard:', error);
        return;
      }

      // Buscar nomes dos alunos separadamente
      const userIds = data?.map(d => d.user_id) || [];
      const { data: alunosData } = await supabase
        .from('alunos')
        .select('user_id, nome')
        .in('user_id', userIds);

      const alunosMap = new Map(alunosData?.map(a => [a.user_id, a.nome]) || []);

      const formattedData: LeaderboardEntry[] = data?.map((entry: any, index: number) => ({
        user_id: entry.user_id,
        nome: alunosMap.get(entry.user_id) || 'Usuário',
        pontos_totais: entry.pontos_totais,
        nivel: entry.nivel,
        streak_atual: entry.streak_atual,
        posicao: index + 1,
      })) || [];

      setLeaderboard(formattedData);
    } catch (error) {
      console.error('Erro ao buscar leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [turmaId, periodo]);

  return {
    leaderboard,
    loading,
    refetch: fetchLeaderboard,
  };
}
