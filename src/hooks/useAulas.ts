import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Aula = Database['public']['Tables']['aulas']['Row'];

export function useAulas() {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAulas = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('aulas')
        .select(`
          *,
          professores (nome),
          turmas (nome)
        `)
        .eq('user_id', user.id)
        .order('data', { ascending: false });

      if (error) throw error;
      setAulas(data || []);
    } catch (error) {
      console.error('Erro ao buscar aulas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as aulas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAula = async (aula: Omit<Aula, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('aulas')
        .insert({
          ...aula,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setAulas(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Aula criada com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar aula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a aula.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAula = async (id: string, updates: Partial<Aula>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('aulas')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setAulas(prev => 
        prev.map(aula => aula.id === id ? { ...aula, ...data } : aula)
      );
      toast({
        title: "Sucesso",
        description: "Aula atualizada com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar aula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a aula.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAula = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('aulas')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setAulas(prev => prev.filter(aula => aula.id !== id));
      toast({
        title: "Sucesso",
        description: "Aula removida com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao deletar aula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a aula.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchAulas();
  }, [user]);

  return {
    aulas,
    loading,
    createAula,
    updateAula,
    deleteAula,
    refetch: fetchAulas,
  };
}