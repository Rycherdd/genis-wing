import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay } from 'date-fns';

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
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchEventos = async () => {
    if (!user) return;
    
    try {
      setLoading(true);

      // Buscar aulas agendadas
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
          turmas!turma_id (nome),
          professores!professor_id (nome)
        `)
        .order('data', { ascending: true })
        .order('horario_inicio', { ascending: true });

      if (aulasError) throw aulasError;

      // Transformar em eventos
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
    if (user) {
      fetchEventos();
    }
  }, [user?.id]);

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
