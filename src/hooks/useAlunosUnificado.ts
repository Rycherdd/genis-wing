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
        .select('*')
        .eq('user_id', user.id);

      if (errorAlunos) throw errorAlunos;

      // Buscar convites aceitos criados por este usuário
      const { data: convitesAceitos, error: errorConvites } = await supabase
        .from('convites')
        .select('email, status')
        .eq('user_id', user.id)
        .eq('status', 'aceito');

      if (errorConvites) throw errorConvites;

      // Buscar todos os profiles com user_role = 'aluno'
      // Como não podemos fazer join com auth.users devido às limitações de RLS,
      // vamos mostrar todos os profiles de aluno como uma solução temporária
      let alunosConvite: any[] = [];
      const { data: allProfiles, error: errorProfiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_role', 'aluno');

      if (!errorProfiles && allProfiles) {
        alunosConvite = allProfiles;
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
        // Alunos criados via convite
        ...(alunosConvite || []).map(aluno => ({
          id: aluno.user_id, // Usar user_id como identificador
          nome: aluno.full_name || 'Usuário via Convite',
          email: 'Email não disponível', // Não podemos acessar o email diretamente
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