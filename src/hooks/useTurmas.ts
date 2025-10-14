import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Turma = Database['public']['Tables']['turmas']['Row'];

export function useTurmas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTurmas = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Verificar se é admin ou professor - eles devem ver todas as turmas
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      let query = supabase
        .from('turmas')
        .select(`
          *,
          professores (nome)
        `);

      // Apenas professores (não admins) filtram por user_id, pois são donos das turmas
      // Alunos dependem apenas das políticas RLS para ver turmas onde estão matriculados
      if (userRole?.role === 'professor') {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      console.log('Turmas carregadas:', data?.length || 0);
      setTurmas(data || []);
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as turmas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTurma = async (turma: Omit<Turma, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('turmas')
        .insert({
          ...turma,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setTurmas(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Turma criada com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar turma:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a turma.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTurma = async (id: string, updates: Partial<Turma>) => {
    if (!user) return;

    try {
      // Verificar se é admin
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      let query = supabase
        .from('turmas')
        .update(updates)
        .eq('id', id);

      // Se não é admin, filtrar por user_id
      if (userRole?.role !== 'admin') {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query.select().single();

      if (error) throw error;

      setTurmas(prev => 
        prev.map(turma => turma.id === id ? { ...turma, ...data } : turma)
      );
      toast({
        title: "Sucesso",
        description: "Turma atualizada com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar turma:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a turma.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTurma = async (id: string) => {
    if (!user) return;

    try {
      // Verificar se é admin
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      let query = supabase
        .from('turmas')
        .delete()
        .eq('id', id);

      // Se não é admin, filtrar por user_id
      if (userRole?.role !== 'admin') {
        query = query.eq('user_id', user.id);
      }

      const { error } = await query;

      if (error) throw error;

      setTurmas(prev => prev.filter(turma => turma.id !== id));
      toast({
        title: "Sucesso",
        description: "Turma removida com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao deletar turma:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a turma.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchTurmas();
      
      // Configurar realtime para atualizações instantâneas
      const channel = supabase
        .channel('turmas-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'turmas'
          },
          () => {
            fetchTurmas();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  return {
    turmas,
    loading,
    createTurma,
    updateTurma,
    deleteTurma,
    refetch: fetchTurmas,
  };
}