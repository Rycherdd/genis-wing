import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Aluno = Database['public']['Tables']['alunos']['Row'];

export function useAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAlunos = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Buscar todos os alunos (sem filtrar por user_id) para admins e professores
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      console.log('Alunos carregados:', data);
      setAlunos(data || []);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alunos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAluno = async (aluno: Omit<Aluno, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('alunos')
        .insert({
          ...aluno,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setAlunos(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Aluno criado com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar aluno:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o aluno.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAluno = async (id: string, updates: Partial<Aluno>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('alunos')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setAlunos(prev => 
        prev.map(aluno => aluno.id === id ? { ...aluno, ...data } : aluno)
      );
      toast({
        title: "Sucesso",
        description: "Aluno atualizado com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o aluno.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAluno = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('alunos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setAlunos(prev => prev.filter(aluno => aluno.id !== id));
      toast({
        title: "Sucesso",
        description: "Aluno removido com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao deletar aluno:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o aluno.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchAlunos();
    }
  }, [user?.id]);

  return {
    alunos,
    loading,
    createAluno,
    updateAluno,
    deleteAluno,
    refetch: fetchAlunos,
  };
}