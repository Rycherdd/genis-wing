-- Corrigir tipo da variável de horas
CREATE OR REPLACE FUNCTION public.update_user_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_aluno_user_id UUID;
  v_turma_id UUID;
  v_total_aulas INTEGER;
  v_total_presencas INTEGER;
  v_total_formularios INTEGER;
  v_horas_decimal NUMERIC;
BEGIN
  -- Obter user_id do aluno
  SELECT user_id INTO v_aluno_user_id
  FROM public.alunos
  WHERE id = NEW.aluno_id;

  -- Obter turma_id da aula
  SELECT turma_id INTO v_turma_id
  FROM public.aulas_agendadas
  WHERE id = NEW.aula_id;

  -- Calcular métricas
  SELECT COUNT(*) INTO v_total_aulas
  FROM public.aulas_agendadas aa
  JOIN public.matriculas m ON m.turma_id = aa.turma_id
  WHERE m.aluno_id = NEW.aluno_id
    AND m.turma_id = v_turma_id
    AND aa.data <= CURRENT_DATE;

  SELECT COUNT(*) INTO v_total_presencas
  FROM public.presenca
  WHERE aluno_id = NEW.aluno_id
    AND presente = true;

  SELECT COUNT(*) INTO v_total_formularios
  FROM public.respostas_formularios rf
  WHERE rf.aluno_id = NEW.aluno_id;

  -- Calcular horas de aprendizado
  SELECT COALESCE(
    SUM(
      EXTRACT(EPOCH FROM (aa.horario_fim::time - aa.horario_inicio::time)) / 3600
    ),
    0
  ) INTO v_horas_decimal
  FROM public.presenca p
  JOIN public.aulas_agendadas aa ON aa.id = p.aula_id
  WHERE p.aluno_id = NEW.aluno_id
    AND p.presente = true;

  -- Inserir ou atualizar user_progress
  INSERT INTO public.user_progress (
    user_id,
    turma_id,
    aulas_assistidas,
    taxa_presenca,
    formularios_respondidos,
    horas_aprendizado,
    ultima_atividade
  )
  VALUES (
    v_aluno_user_id,
    v_turma_id,
    v_total_presencas,
    CASE WHEN v_total_aulas > 0 
      THEN (v_total_presencas::DECIMAL / v_total_aulas * 100)
      ELSE 0 
    END,
    v_total_formularios,
    v_horas_decimal,
    now()
  )
  ON CONFLICT (user_id, turma_id)
  DO UPDATE SET
    aulas_assistidas = EXCLUDED.aulas_assistidas,
    taxa_presenca = EXCLUDED.taxa_presenca,
    formularios_respondidos = EXCLUDED.formularios_respondidos,
    horas_aprendizado = EXCLUDED.horas_aprendizado,
    ultima_atividade = now(),
    updated_at = now();

  RETURN NEW;
END;
$$;