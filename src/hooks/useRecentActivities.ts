import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type RecentActivity = {
  id: string;
  professor: string;
  action: string;
  turma: string;
  time: string;
  type: 'turma' | 'aula' | 'aviso' | 'presence';
  timestamp: Date;
};

export function useRecentActivities() {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchActivities = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const allActivities: RecentActivity[] = [];

      // Buscar últimas turmas criadas
      const { data: turmas, error: turmasError } = await supabase
        .from('turmas')
        .select(`
          id,
          nome,
          created_at,
          professores (nome)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!turmasError && turmas) {
        turmas.forEach(turma => {
          allActivities.push({
            id: `turma-${turma.id}`,
            professor: turma.professores?.nome || 'Sistema',
            action: 'Criou nova turma',
            turma: turma.nome,
            time: formatDistanceToNow(new Date(turma.created_at), { 
              addSuffix: true, 
              locale: ptBR 
            }),
            type: 'turma',
            timestamp: new Date(turma.created_at)
          });
        });
      }

      // Buscar últimas aulas agendadas
      const { data: aulas, error: aulasError } = await supabase
        .from('aulas_agendadas')
        .select(`
          id,
          titulo,
          created_at,
          professores (nome),
          turmas (nome)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!aulasError && aulas) {
        aulas.forEach(aula => {
          allActivities.push({
            id: `aula-${aula.id}`,
            professor: aula.professores?.nome || 'Professor',
            action: 'Agendou aula',
            turma: aula.turmas?.nome || aula.titulo,
            time: formatDistanceToNow(new Date(aula.created_at), { 
              addSuffix: true, 
              locale: ptBR 
            }),
            type: 'aula',
            timestamp: new Date(aula.created_at)
          });
        });
      }

      // Buscar últimos avisos criados
      const { data: avisos, error: avisosError } = await supabase
        .from('avisos')
        .select(`
          id,
          titulo,
          created_at,
          turmas (nome)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!avisosError && avisos) {
        avisos.forEach(aviso => {
          allActivities.push({
            id: `aviso-${aviso.id}`,
            professor: 'Sistema',
            action: 'Publicou aviso',
            turma: aviso.turmas?.nome || aviso.titulo,
            time: formatDistanceToNow(new Date(aviso.created_at), { 
              addSuffix: true, 
              locale: ptBR 
            }),
            type: 'aviso',
            timestamp: new Date(aviso.created_at)
          });
        });
      }

      // Buscar últimas presenças registradas
      const { data: presencas, error: presencasError } = await supabase
        .from('presenca')
        .select(`
          id,
          created_at,
          alunos (nome),
          aulas_agendadas (
            titulo,
            turmas (nome)
          )
        `)
        .eq('presente', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!presencasError && presencas) {
        presencas.forEach(presenca => {
          const aula = presenca.aulas_agendadas as any;
          allActivities.push({
            id: `presenca-${presenca.id}`,
            professor: presenca.alunos?.nome || 'Aluno',
            action: 'Registrou presença',
            turma: aula?.turmas?.nome || aula?.titulo || 'Aula',
            time: formatDistanceToNow(new Date(presenca.created_at), { 
              addSuffix: true, 
              locale: ptBR 
            }),
            type: 'presence',
            timestamp: new Date(presenca.created_at)
          });
        });
      }

      // Ordenar todas as atividades por data (mais recentes primeiro)
      const sortedActivities = allActivities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 6); // Pegar apenas as 6 mais recentes

      setActivities(sortedActivities);
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [user]);

  return {
    activities,
    loading,
    refetch: fetchActivities
  };
}
