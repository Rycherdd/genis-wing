import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Convite = Database['public']['Tables']['convites']['Row'];

export function useConvites() {
  const [convites, setConvites] = useState<Convite[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchConvites = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('convites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConvites(data || []);
    } catch (error) {
      console.error('Erro ao buscar convites:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os convites.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async (email: string, role: 'aluno' | 'professor', invitedByName: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('send-invite', {
        body: {
          email,
          role,
          invitedByName,
        },
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Convite enviado para ${email}!`,
      });

      // Refresh the invites list
      await fetchConvites();
      
      return data;
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o convite.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteConvite = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('convites')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setConvites(prev => prev.filter(convite => convite.id !== id));
      toast({
        title: "Sucesso",
        description: "Convite removido com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao deletar convite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o convite.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const resendInvite = async (convite: Convite) => {
    return await sendInvite(convite.email, convite.role as 'aluno' | 'professor', convite.invited_by_name || 'Sistema');
  };

  useEffect(() => {
    fetchConvites();
  }, [user]);

  return {
    convites,
    loading,
    sendInvite,
    deleteConvite,
    resendInvite,
    refetch: fetchConvites,
  };
}