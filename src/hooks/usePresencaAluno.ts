import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Presenca = Database['public']['Tables']['presenca']['Row'];
type Aula = Database['public']['Tables']['aulas']['Row'];
type Aluno = Database['public']['Tables']['alunos']['Row'];

interface PresencaWithDetails extends Presenca {
  aulas: Aula & {
    turmas: { nome: string; };
  };
}

export function usePresencaAluno() {
  const [presencas, setPresencas] = useState<PresencaWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPresencasAluno = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // First get the aluno record for the current user
      const { data: aluno, error: alunoError } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (alunoError) {
        if (alunoError.code !== 'PGRST116') { // Not found error
          throw alunoError;
        }
        setPresencas([]);
        return;
      }

      // Then get the attendance records for this student
      const { data, error } = await supabase
        .from('presenca')
        .select(`
          *,
          aulas (
            *,
            turmas (nome)
          )
        `)
        .eq('aluno_id', aluno.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPresencas(data || []);
    } catch (error) {
      console.error('Erro ao buscar presenças:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas presenças.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPresencasByStatus = (presente: boolean) => {
    return presencas.filter(p => p.presente === presente);
  };

  const getAulasFaltadas = async () => {
    if (!user) return [];
    
    try {
      // Get student record
      const { data: aluno, error: alunoError } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (alunoError) return [];

      // Get all enrolled classes for this student through matriculas
      const { data: matriculas } = await supabase
        .from('matriculas')
        .select('turma_id')
        .eq('aluno_id', aluno.id);

      if (!matriculas || matriculas.length === 0) return [];

      const turmaIds = matriculas.map(m => m.turma_id);

      // Get all past classes for these turmas
      const today = new Date().toISOString().split('T')[0];
      const { data: aulasPassadas } = await supabase
        .from('aulas')
        .select(`
          *,
          turmas (nome)
        `)
        .in('turma_id', turmaIds)
        .lt('data', today)
        .order('data', { ascending: false });

      if (!aulasPassadas) return [];

      // Get attendance records for these classes
      const aulaIds = aulasPassadas.map(a => a.id);
      const { data: presencasRegistradas } = await supabase
        .from('presenca')
        .select('aula_id, presente')
        .eq('aluno_id', aluno.id)
        .in('aula_id', aulaIds);

      // Find classes where student was absent or had no attendance record
      const aulasFaltadas = aulasPassadas.filter(aula => {
        const presencaRecord = presencasRegistradas?.find(p => p.aula_id === aula.id);
        return !presencaRecord || presencaRecord.presente === false;
      });

      return aulasFaltadas;
    } catch (error) {
      console.error('Erro ao buscar aulas faltadas:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchPresencasAluno();
  }, [user]);

  return {
    presencas,
    loading,
    getPresencasByStatus,
    getAulasFaltadas,
    refetch: fetchPresencasAluno,
  };
}