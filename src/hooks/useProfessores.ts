import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Professor = Database['public']['Tables']['professores']['Row'];

export function useProfessores() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfessores = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Buscar todos os professores, não apenas do usuário atual
      const { data, error } = await supabase
        .from('professores')
        .select('*')
        .order('nome');

      if (error) throw error;
      setProfessores(data || []);
    } catch (error) {
      console.error('Erro ao buscar professores:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os professores.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfessor = async (professor: Omit<Professor, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('professores')
        .insert({
          ...professor,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setProfessores(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Professor criado com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar professor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o professor.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProfessor = async (id: string, updates: Partial<Professor>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('professores')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfessores(prev => 
        prev.map(prof => prof.id === id ? { ...prof, ...data } : prof)
      );
      toast({
        title: "Sucesso",
        description: "Professor atualizado com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar professor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o professor.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProfessor = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('professores')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setProfessores(prev => prev.filter(prof => prof.id !== id));
      toast({
        title: "Sucesso",
        description: "Professor removido com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao deletar professor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o professor.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchProfessores();
  }, [user]);

  return {
    professores,
    loading,
    createProfessor,
    updateProfessor,
    deleteProfessor,
    refetch: fetchProfessores,
  };
}