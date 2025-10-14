import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type Notification = {
  id: string;
  titulo: string;
  conteudo: string;
  data_publicacao: string;
  prioridade: string;
  turma_nome?: string;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);

      // Buscar avisos recentes (últimos 7 dias) que ainda não expiraram
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: avisos, error } = await supabase
        .from('avisos')
        .select(`
          id,
          titulo,
          conteudo,
          data_publicacao,
          prioridade,
          turmas (nome)
        `)
        .gte('data_publicacao', sevenDaysAgo.toISOString())
        .or(`data_expiracao.is.null,data_expiracao.gte.${new Date().toISOString()}`)
        .order('data_publicacao', { ascending: false })
        .limit(10);

      if (error) throw error;

      const mappedNotifications: Notification[] = (avisos || []).map(aviso => ({
        id: aviso.id,
        titulo: aviso.titulo,
        conteudo: aviso.conteudo,
        data_publicacao: aviso.data_publicacao,
        prioridade: aviso.prioridade,
        turma_nome: (aviso.turmas as any)?.nome,
      }));

      setNotifications(mappedNotifications);
      setUnreadCount(mappedNotifications.length);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user?.id]);

  return {
    notifications,
    unreadCount,
    loading,
    refetch: fetchNotifications,
  };
}
