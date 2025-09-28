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
      
      // Buscar todos os usuários com role 'aluno' primeiro
      const { data: usuariosAlunos, error: errorUsuarios } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          user_roles!inner (
            role
          )
        `)
        .eq('user_roles.role', 'aluno');

      if (errorUsuarios) throw errorUsuarios;

      // Buscar alunos da tabela alunos
      const { data: alunosCadastrados, error: errorAlunos } = await supabase
        .from('alunos')
        .select('*');

      if (errorAlunos) throw errorAlunos;

      const alunosUnificados: AlunoUnificado[] = [];

      // Processar usuários com role aluno
      if (usuariosAlunos) {
        for (const usuario of usuariosAlunos) {
          // Verificar se já existe na tabela alunos
          const alunoExistente = alunosCadastrados?.find(aluno => aluno.user_id === usuario.user_id);
          
          if (alunoExistente) {
            // Se existe na tabela alunos, usar esses dados
            alunosUnificados.push({
              id: alunoExistente.id,
              nome: alunoExistente.nome,
              email: alunoExistente.email,
              telefone: alunoExistente.telefone,
              tipo: 'cadastrado',
              user_id: alunoExistente.user_id,
            });
          } else {
            // Se não existe, criar entrada baseada no profile
            alunosUnificados.push({
              id: usuario.user_id,
              nome: usuario.full_name || 'Usuário sem nome',
              email: 'Email não disponível',
              tipo: 'convite',
              user_id: usuario.user_id,
            });
          }
        }
      }

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