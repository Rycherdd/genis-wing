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
      
      // Verificar se é admin ou professor - eles devem ver todas as matrículas
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      let data = [];
      
      if (userRole?.role === 'admin' || userRole?.role === 'professor') {
        // Admin e professor veem todas as matrículas
        const { data: allMatriculas, error } = await supabase
          .from('matriculas')
          .select('*');
        
        if (error) throw error;
        data = allMatriculas || [];
        console.log('Matrículas (admin/professor):', data);
      } else {
        // Para alunos, buscar matrículas baseadas no aluno_id
        const { data: aluno, error: alunoError } = await supabase
          .from('alunos')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (alunoError && alunoError.code !== 'PGRST116') {
          throw alunoError;
        }

        if (aluno) {
          const { data: matriculasData, error } = await supabase
            .from('matriculas')
            .select('*')
            .eq('aluno_id', aluno.id);

          if (error) throw error;
          data = matriculasData || [];
        }
        console.log('Matrículas (aluno):', data);
      }

      setMatriculas(data);
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
    if (!user) {
      console.log('createMatricula: Usuário não encontrado');
      return;
    }

    console.log('createMatricula: Iniciando criação', { aluno_id, turma_id, user_id: user.id });

    try {
      // Verificar se a matrícula já existe para evitar duplicação
      const { data: existingMatricula } = await supabase
        .from('matriculas')
        .select('id')
        .eq('aluno_id', aluno_id)
        .eq('turma_id', turma_id)
        .maybeSingle();

      if (existingMatricula) {
        console.log('createMatricula: Matrícula já existe');
        toast({
          title: "Aviso",
          description: "Este aluno já está matriculado nesta turma.",
          variant: "destructive",
        });
        return;
      }

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

      if (error) {
        console.error('createMatricula: Erro do Supabase', error);
        throw error;
      }

      console.log('createMatricula: Matrícula criada com sucesso', data);
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