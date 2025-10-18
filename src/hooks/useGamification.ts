import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserGamification {
  id: string;
  user_id: string;
  pontos_totais: number;
  nivel: number;
  xp_atual: number;
  xp_proximo_nivel: number;
  streak_atual: number;
  melhor_streak: number;
  ultima_atividade: string | null;
}

export interface Badge {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  tipo: string;
  requisito: any;
  pontos_bonus: number;
  cor: string;
}

export interface UserBadge extends Badge {
  conquistado_em: string;
}

export interface PontosHistorico {
  id: string;
  pontos: number;
  motivo: string;
  tipo: string;
  created_at: string;
}

export function useGamification() {
  const { user } = useAuth();
  const [gamification, setGamification] = useState<UserGamification | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [historico, setHistorico] = useState<PontosHistorico[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGamification = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Buscar dados de gamificação do usuário
      const { data: gamData, error: gamError } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (gamError && gamError.code !== 'PGRST116') {
        console.error('Erro ao buscar gamificação:', gamError);
      } else {
        setGamification(gamData);
      }

      // Buscar badges conquistados
      const { data: userBadgesData, error: badgesError } = await supabase
        .from('user_badges')
        .select(`
          conquistado_em,
          badges (*)
        `)
        .eq('user_id', user.id)
        .order('conquistado_em', { ascending: false });

      if (badgesError) {
        console.error('Erro ao buscar badges:', badgesError);
      } else {
        const formattedBadges = userBadgesData?.map((ub: any) => ({
          ...ub.badges,
          conquistado_em: ub.conquistado_em
        })) || [];
        setBadges(formattedBadges);
      }

      // Buscar todos os badges disponíveis
      const { data: allBadgesData, error: allBadgesError } = await supabase
        .from('badges')
        .select('*')
        .order('tipo', { ascending: true });

      if (allBadgesError) {
        console.error('Erro ao buscar todos badges:', allBadgesError);
      } else {
        setAllBadges(allBadgesData || []);
      }

      // Buscar histórico de pontos
      const { data: historicoData, error: historicoError } = await supabase
        .from('pontos_historico')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (historicoError) {
        console.error('Erro ao buscar histórico:', historicoError);
      } else {
        setHistorico(historicoData || []);
      }
    } catch (error) {
      console.error('Erro na gamificação:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGamification();

    // Inscrever em mudanças em tempo real
    const channel = supabase
      .channel('gamification-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_gamification',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchGamification();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchGamification();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    gamification,
    badges,
    allBadges,
    historico,
    loading,
    refetch: fetchGamification,
  };
}
