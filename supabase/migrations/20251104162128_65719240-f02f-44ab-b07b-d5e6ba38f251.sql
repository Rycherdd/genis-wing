
-- Criar função para recalcular progresso de todos os alunos
CREATE OR REPLACE FUNCTION public.recalcular_todos_progressos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  presenca_rec RECORD;
BEGIN
  -- Para cada registro de presença, simular um update para triggerar a função
  FOR presenca_rec IN 
    SELECT DISTINCT ON (aluno_id) * 
    FROM public.presenca 
    ORDER BY aluno_id, created_at DESC
  LOOP
    -- Simular trigger manualmente
    DECLARE
      v_aluno_user_id UUID;
      v_turma_id UUID;
      v_presencas_count INTEGER := 0;
      v_total_aulas INTEGER := 0;
      v_taxa_presenca NUMERIC := 0;
      v_horas_totais NUMERIC := 0;
      v_formularios_count INTEGER := 0;
    BEGIN
      -- Buscar user_id e turma_id do aluno
      SELECT 
        a.user_id,
        m.turma_id
      INTO v_aluno_user_id, v_turma_id
      FROM public.alunos a
      JOIN public.matriculas m ON m.aluno_id = a.id
      WHERE a.id = presenca_rec.aluno_id
      LIMIT 1;

      IF v_aluno_user_id IS NOT NULL THEN
        -- Contar presenças registradas
        SELECT COUNT(*)
        INTO v_presencas_count
        FROM public.presenca p
        WHERE p.aluno_id = presenca_rec.aluno_id
          AND p.presente = true;

        -- Contar TODAS as aulas concluídas da turma
        SELECT COUNT(DISTINCT aa.id)
        INTO v_total_aulas
        FROM public.aulas_agendadas aa
        WHERE aa.turma_id = v_turma_id
          AND (aa.status = 'concluida' OR aa.data < CURRENT_DATE);

        -- Calcular taxa de presença
        IF v_total_aulas > 0 THEN
          v_taxa_presenca := (v_presencas_count::numeric / v_total_aulas::numeric) * 100;
        ELSE
          v_taxa_presenca := 0;
        END IF;

        -- Calcular horas de aprendizado
        SELECT COALESCE(
          SUM(
            EXTRACT(EPOCH FROM (aa.horario_fim::time - aa.horario_inicio::time)) / 3600
          ), 
          0
        )
        INTO v_horas_totais
        FROM public.presenca p
        JOIN public.aulas_agendadas aa ON aa.id = p.aula_id
        WHERE p.aluno_id = presenca_rec.aluno_id
          AND p.presente = true;

        -- Contar formulários respondidos
        SELECT COUNT(DISTINCT rf.formulario_id)
        INTO v_formularios_count
        FROM public.respostas_formularios rf
        WHERE rf.aluno_id = presenca_rec.aluno_id;

        -- Atualizar user_progress
        UPDATE public.user_progress
        SET
          aulas_assistidas = v_presencas_count,
          taxa_presenca = v_taxa_presenca,
          formularios_respondidos = v_formularios_count,
          horas_aprendizado = v_horas_totais,
          ultima_atividade = NOW(),
          updated_at = NOW()
        WHERE user_id = v_aluno_user_id
          AND turma_id = v_turma_id;
      END IF;
    END;
  END LOOP;
END;
$$;

-- Executar a função para recalcular todos os progressos
SELECT public.recalcular_todos_progressos();
