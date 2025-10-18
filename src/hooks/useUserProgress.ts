import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProgress {
  id: string;
  user_id: string;
  turma_id: string;
  aulas_assistidas: number;
  taxa_presenca: number;
  formularios_respondidos: number;
  horas_aprendizado: number;
  ultima_atividade: string;
  turma_nome?: string;
}

export interface ProgressSummary {
  total_presencas: number;
  total_formularios: number;
  total_horas: number;
  media_presenca: number;
  turmas_ativas: number;
}

export function useUserProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [summary, setSummary] = useState<ProgressSummary>({
    total_presencas: 0,
    total_formularios: 0,
    total_horas: 0,
    media_presenca: 0,
    turmas_ativas: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('user_progress')
        .select(`
          *,
          turmas!user_progress_turma_id_fkey (nome)
        `)
        .eq('user_id', user.id)
        .order('ultima_atividade', { ascending: false });

      if (error) throw error;

      const progressData = data?.map((p) => ({
        ...p,
        turma_nome: (p.turmas as any)?.nome,
      })) || [];

      setProgress(progressData);

      // Calcular resumo
      if (progressData.length > 0) {
        const totalPresencas = progressData.reduce(
          (sum, p) => sum + p.aulas_assistidas,
          0
        );
        const totalFormularios = progressData.reduce(
          (sum, p) => sum + p.formularios_respondidos,
          0
        );
        const totalHoras = progressData.reduce(
          (sum, p) => sum + parseFloat(p.horas_aprendizado.toString()),
          0
        );
        const mediaPresenca =
          progressData.reduce(
            (sum, p) => sum + parseFloat(p.taxa_presenca.toString()),
            0
          ) / progressData.length;

        setSummary({
          total_presencas: totalPresencas,
          total_formularios: totalFormularios,
          total_horas: totalHoras,
          media_presenca: mediaPresenca,
          turmas_ativas: progressData.length,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [user]);

  return {
    progress,
    summary,
    loading,
    refetch: fetchProgress,
  };
}
