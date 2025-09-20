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
      const { data, error } = await supabase
        .from('turmas')
        .select(`
          *,
          professores (nome)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
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
      const { data, error } = await supabase
        .from('turmas')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

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
      const { error } = await supabase
        .from('turmas')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

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
    fetchTurmas();
  }, [user]);

  return {
    turmas,
    loading,
    createTurma,
    updateTurma,
    deleteTurma,
    refetch: fetchTurmas,
  };
}