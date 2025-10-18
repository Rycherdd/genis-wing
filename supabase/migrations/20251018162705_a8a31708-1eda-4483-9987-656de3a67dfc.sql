-- Criar tabela para rastrear progresso do usuário
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  aulas_assistidas INTEGER DEFAULT 0,
  taxa_presenca DECIMAL(5,2) DEFAULT 0.00,
  formularios_respondidos INTEGER DEFAULT 0,
  horas_aprendizado DECIMAL(6,2) DEFAULT 0.00,
  ultima_atividade TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, turma_id)
);

-- Habilitar RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own progress"
  ON public.user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and professors can view all progress"
  ON public.user_progress
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'professor'::app_role)
  );

CREATE POLICY "System can update progress"
  ON public.user_progress
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Função para atualizar user_progress automaticamente
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
  v_horas DECIMAL;
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

  SELECT COALESCE(SUM(aa.horario_fim::time - aa.horario_inicio::time), INTERVAL '0') INTO v_horas
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
    EXTRACT(EPOCH FROM v_horas) / 3600,
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

-- Trigger para atualizar progresso quando presença é registrada
CREATE TRIGGER update_progress_on_presenca
AFTER INSERT OR UPDATE ON public.presenca
FOR EACH ROW
EXECUTE FUNCTION public.update_user_progress();

-- Função para atualizar progresso ao responder formulário
CREATE OR REPLACE FUNCTION public.update_progress_on_formulario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_aluno_user_id UUID;
  v_turma_id UUID;
BEGIN
  -- Obter user_id do aluno
  SELECT user_id INTO v_aluno_user_id
  FROM public.alunos
  WHERE id = NEW.aluno_id;

  -- Obter turma_id através da aula
  SELECT aa.turma_id INTO v_turma_id
  FROM public.formularios_aulas fa
  JOIN public.aulas_agendadas aa ON aa.id = fa.aula_id
  WHERE fa.id = NEW.formulario_id;

  -- Atualizar contador de formulários
  UPDATE public.user_progress
  SET 
    formularios_respondidos = formularios_respondidos + 1,
    ultima_atividade = now(),
    updated_at = now()
  WHERE user_id = v_aluno_user_id
    AND turma_id = v_turma_id;

  RETURN NEW;
END;
$$;

-- Trigger para atualizar progresso quando formulário é respondido
CREATE TRIGGER update_progress_on_formulario_resposta
AFTER INSERT ON public.respostas_formularios
FOR EACH ROW
EXECUTE FUNCTION public.update_progress_on_formulario();

-- Índices para performance
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_turma_id ON public.user_progress(turma_id);
CREATE INDEX idx_user_progress_ultima_atividade ON public.user_progress(ultima_atividade DESC);