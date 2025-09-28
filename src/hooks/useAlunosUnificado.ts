import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface AlunoUnificado {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  tipo: 'cadastrado' | 'convite';
  user_id?: string;
}

export function useAlunosUnificado() {
  const [alunos, setAlunos] = useState<AlunoUnificado[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAlunos = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Buscar alunos da tabela alunos com ordenação
      const { data: alunosCadastrados, error: errorAlunos } = await supabase
        .from('alunos')
        .select('*')
        .order('nome');

      if (errorAlunos) {
        console.error('Erro ao buscar alunos:', errorAlunos);
        throw errorAlunos;
      }

      // Converter para formato unificado
      const alunosUnificados: AlunoUnificado[] = (alunosCadastrados || []).map(aluno => ({
        id: aluno.id,
        nome: aluno.nome,
        email: aluno.email,
        telefone: aluno.telefone || undefined,
        tipo: 'cadastrado' as const,
        user_id: aluno.user_id,
      }));

      console.log('Alunos carregados:', alunosUnificados);
      setAlunos(alunosUnificados);
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

  useEffect(() => {
    fetchAlunos();
  }, [user]);

  return {
    alunos,
    loading,
    refetch: fetchAlunos,
  };
}