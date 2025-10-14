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

      // Buscar avisos já lidos pelo usuário
      const { data: avisosLidos, error: lidosError } = await supabase
        .from('avisos_lidos')
        .select('aviso_id')
        .eq('user_id', user.id);

      if (lidosError) throw lidosError;

      const idsLidos = new Set(avisosLidos?.map(al => al.aviso_id) || []);

      // Filtrar apenas avisos não lidos
      const avisosNaoLidos = (avisos || []).filter(aviso => !idsLidos.has(aviso.id));

      const mappedNotifications: Notification[] = avisosNaoLidos.map(aviso => ({
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

  const markAsRead = async (avisoId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('avisos_lidos')
        .insert({
          user_id: user.id,
          aviso_id: avisoId,
        });

      if (error) {
        console.error('Erro ao marcar como lido:', error);
        throw error;
      }

      // Remover da lista local imediatamente
      setNotifications(prev => prev.filter(n => n.id !== avisoId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;

    try {
      const inserts = notifications.map(notification => ({
        user_id: user.id,
        aviso_id: notification.id,
      }));

      const { error } = await supabase
        .from('avisos_lidos')
        .insert(inserts);

      if (error) {
        console.error('Erro ao marcar todas como lidas:', error);
        throw error;
      }

      // Limpar lista local imediatamente
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
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
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
