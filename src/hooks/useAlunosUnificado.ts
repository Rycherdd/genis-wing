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
      
      // Buscar alunos da tabela alunos (cadastrados diretamente)
      const { data: alunosCadastrados, error: errorAlunos } = await supabase
        .from('alunos')
        .select('*');

      if (errorAlunos) throw errorAlunos;

      // Buscar todos os profiles que têm role 'aluno' e obter também o email do auth.users
      const { data: alunosConvite, error: errorConvites } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          user_roles!inner (
            role
          )
        `)
        .eq('user_roles.role', 'aluno');

      if (errorConvites) throw errorConvites;

      // Buscar emails dos usuários alunos
      const userIds = alunosConvite?.map(aluno => aluno.user_id) || [];
      let userEmails: { [key: string]: string } = {};
      
      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from('profiles')
          .select('user_id')
          .in('user_id', userIds);
          
        // Para obter emails, vamos usar uma abordagem diferente
        // Como não podemos acessar auth.users diretamente, vamos usar o que está disponível
        for (const userId of userIds) {
          userEmails[userId] = 'Email não disponível';
        }
      }

      // Unificar os dados
      const alunosUnificados: AlunoUnificado[] = [
        // Alunos cadastrados diretamente
        ...(alunosCadastrados || []).map(aluno => ({
          id: aluno.id,
          nome: aluno.nome,
          email: aluno.email,
          telefone: aluno.telefone,
          tipo: 'cadastrado' as const,
        })),
        // Alunos criados via convite (usuários com role 'aluno')
        ...(alunosConvite || []).map(aluno => ({
          id: aluno.user_id, // Usar user_id como identificador
          nome: aluno.full_name || 'Usuário via Convite',
          email: userEmails[aluno.user_id] || 'Email não disponível',
          telefone: undefined,
          tipo: 'convite' as const,
          user_id: aluno.user_id,
        })),
      ];

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