import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Matricula = Database['public']['Tables']['matriculas']['Row'];

export function useMatriculas() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMatriculas = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matriculas')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setMatriculas(data || []);
    } catch (error) {
      console.error('Erro ao buscar matrículas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as matrículas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createMatricula = async (aluno_id: string, turma_id: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('matriculas')
        .insert({
          aluno_id,
          turma_id,
          user_id: user.id,
          status: 'ativa',
        })
        .select()
        .single();

      if (error) throw error;

      setMatriculas(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Aluno matriculado com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar matrícula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível matricular o aluno.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteMatricula = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('matriculas')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setMatriculas(prev => prev.filter(matricula => matricula.id !== id));
      toast({
        title: "Sucesso",
        description: "Matrícula removida com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao deletar matrícula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a matrícula.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getMatriculasByTurma = (turma_id: string) => {
    return matriculas.filter(matricula => matricula.turma_id === turma_id);
  };

  useEffect(() => {
    fetchMatriculas();
  }, [user]);

  return {
    matriculas,
    loading,
    createMatricula,
    deleteMatricula,
    getMatriculasByTurma,
    refetch: fetchMatriculas,
  };
}