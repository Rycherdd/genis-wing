
-- Corrigir cálculo de taxa de presença para considerar aulas concluídas sem registro
CREATE OR REPLACE FUNCTION public.update_user_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_aluno_user_id uuid;
  v_turma_id uuid;
  v_presencas_count integer := 0;
  v_total_aulas integer := 0;
  v_taxa_presenca numeric := 0;
  v_horas_totais numeric := 0;
  v_formularios_count integer := 0;
BEGIN
  -- Buscar user_id e turma_id do aluno
  SELECT 
    a.user_id,
    m.turma_id
  INTO v_aluno_user_id, v_turma_id
  FROM public.alunos a
  JOIN public.matriculas m ON m.aluno_id = a.id
  WHERE a.id = NEW.aluno_id
  LIMIT 1;

  IF v_aluno_user_id IS NULL THEN
    RAISE EXCEPTION 'Aluno não encontrado ou sem matrícula';
  END IF;

  -- Contar presenças registradas
  SELECT COUNT(*)
  INTO v_presencas_count
  FROM public.presenca p
  WHERE p.aluno_id = NEW.aluno_id
    AND p.presente = true;

  -- Contar TODAS as aulas concluídas da turma (com ou sem registro de presença)
  SELECT COUNT(DISTINCT aa.id)
  INTO v_total_aulas
  FROM public.aulas_agendadas aa
  WHERE aa.turma_id = v_turma_id
    AND (aa.status = 'concluida' OR aa.data < CURRENT_DATE);

  -- Calcular taxa de presença baseada nas aulas concluídas
  IF v_total_aulas > 0 THEN
    v_taxa_presenca := (v_presencas_count::numeric / v_total_aulas::numeric) * 100;
  ELSE
    v_taxa_presenca := 0;
  END IF;

  -- Calcular horas de aprendizado (soma da duração das aulas com presença)
  SELECT COALESCE(
    SUM(
      EXTRACT(EPOCH FROM (aa.horario_fim::time - aa.horario_inicio::time)) / 3600
    ), 
    0
  )
  INTO v_horas_totais
  FROM public.presenca p
  JOIN public.aulas_agendadas aa ON aa.id = p.aula_id
  WHERE p.aluno_id = NEW.aluno_id
    AND p.presente = true;

  -- Contar formulários respondidos
  SELECT COUNT(DISTINCT rf.formulario_id)
  INTO v_formularios_count
  FROM public.respostas_formularios rf
  WHERE rf.aluno_id = NEW.aluno_id;

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
    v_presencas_count,
    v_taxa_presenca,
    v_formularios_count,
    v_horas_totais,
    now()
  )
  ON CONFLICT (user_id, turma_id)
  DO UPDATE SET
    aulas_assistidas = EXCLUDED.aulas_assistidas,
    taxa_presenca = EXCLUDED.taxa_presenca,
    formularios_respondidos = EXCLUDED.formularios_respondidos,
    horas_aprendizado = EXCLUDED.horas_aprendizado,
    ultima_atividade = EXCLUDED.ultima_atividade,
    updated_at = now();

  RETURN NEW;
END;
$$;
