import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay } from 'date-fns';
import { useAlunos } from './useAlunos';

export type EventoAgenda = {
  id: string;
  titulo: string;
  data: Date;
  horario_inicio: string;
  horario_fim: string;
  tipo: 'aula' | 'turma';
  descricao?: string;
  local?: string;
  status?: string;
  turma_nome?: string;
  professor_nome?: string;
};

export function useAgenda() {
  const [eventos, setEventos] = useState<EventoAgenda[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userRole } = useAuth();
  const { alunos } = useAlunos();
  const { toast } = useToast();

  const fetchEventos = async () => {
    if (!user) return;
    
    try {
      setLoading(true);

      // Se for aluno, buscar apenas aulas das turmas matriculadas
      if (userRole === 'aluno') {
        // Encontrar o aluno atual
        const alunoAtual = alunos.find(a => a.user_id === user.id);
        if (!alunoAtual) {
          setEventos([]);
          return;
        }

        // Buscar matrículas do aluno
        const { data: matriculas, error: matriculasError } = await supabase
          .from('matriculas')
          .select('turma_id')
          .eq('aluno_id', alunoAtual.id)
          .eq('status', 'ativa');

        if (matriculasError) throw matriculasError;

        const turmaIds = matriculas?.map(m => m.turma_id) || [];
        
        if (turmaIds.length === 0) {
          setEventos([]);
          return;
        }

        // Buscar aulas das turmas matriculadas
        const { data: aulas, error: aulasError } = await supabase
          .from('aulas_agendadas')
          .select(`
            id,
            titulo,
            data,
            horario_inicio,
            horario_fim,
            descricao,
            local,
            status,
            turma_id,
            turmas!aulas_agendadas_turma_id_fkey (nome),
            professores!aulas_agendadas_professor_id_fkey (nome)
          `)
          .in('turma_id', turmaIds)
          .order('data', { ascending: true })
          .order('horario_inicio', { ascending: true });

        if (aulasError) throw aulasError;

        const eventosAulas: EventoAgenda[] = (aulas || []).map(aula => ({
          id: aula.id,
          titulo: aula.titulo,
          data: new Date(aula.data),
          horario_inicio: aula.horario_inicio,
          horario_fim: aula.horario_fim,
          tipo: 'aula' as const,
          descricao: aula.descricao || undefined,
          local: aula.local || undefined,
          status: aula.status,
          turma_nome: aula.turmas?.nome,
          professor_nome: aula.professores?.nome,
        }));

        setEventos(eventosAulas);
      } else {
        // Professor ou Admin vê todas as aulas
        const { data: aulas, error: aulasError } = await supabase
          .from('aulas_agendadas')
          .select(`
            id,
            titulo,
            data,
            horario_inicio,
            horario_fim,
            descricao,
            local,
            status,
            turmas!aulas_agendadas_turma_id_fkey (nome),
            professores!aulas_agendadas_professor_id_fkey (nome)
          `)
          .order('data', { ascending: true })
          .order('horario_inicio', { ascending: true });

        if (aulasError) throw aulasError;

        const eventosAulas: EventoAgenda[] = (aulas || []).map(aula => ({
          id: aula.id,
          titulo: aula.titulo,
          data: new Date(aula.data),
          horario_inicio: aula.horario_inicio,
          horario_fim: aula.horario_fim,
          tipo: 'aula' as const,
          descricao: aula.descricao || undefined,
          local: aula.local || undefined,
          status: aula.status,
          turma_nome: aula.turmas?.nome,
          professor_nome: aula.professores?.nome,
        }));

        setEventos(eventosAulas);
      }
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os eventos da agenda.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && userRole) {
      fetchEventos();
    }
  }, [user?.id, userRole, alunos]);

  // Datas que têm eventos
  const diasComEventos = useMemo(() => {
    return eventos.map(e => e.data);
  }, [eventos]);

  // Filtrar eventos por data
  const getEventosPorData = (data: Date) => {
    return eventos.filter(e => isSameDay(e.data, data));
  };

  return {
    eventos,
    loading,
    diasComEventos,
    getEventosPorData,
    refetch: fetchEventos,
  };
}
