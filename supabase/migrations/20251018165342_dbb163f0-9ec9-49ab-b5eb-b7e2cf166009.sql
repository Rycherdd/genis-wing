-- Tabela de badges disponíveis
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  icone TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('presenca', 'formularios', 'horas', 'streak', 'nivel')),
  requisito JSONB NOT NULL, -- {tipo: 'presenca_perfeita', valor: 100} ou {tipo: 'formularios', valor: 10}
  pontos_bonus INTEGER DEFAULT 0,
  cor TEXT DEFAULT '#FFD700',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de conquistas dos usuários
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  conquistado_em TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Tabela de pontos e XP dos usuários
CREATE TABLE public.user_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  pontos_totais INTEGER DEFAULT 0,
  nivel INTEGER DEFAULT 1,
  xp_atual INTEGER DEFAULT 0,
  xp_proximo_nivel INTEGER DEFAULT 100,
  streak_atual INTEGER DEFAULT 0,
  melhor_streak INTEGER DEFAULT 0,
  ultima_atividade DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de histórico de pontos
CREATE TABLE public.pontos_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pontos INTEGER NOT NULL,
  motivo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('presenca', 'formulario', 'badge', 'streak', 'bonus')),
  referencia_id UUID, -- ID da presença, formulário, etc
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pontos_historico ENABLE ROW LEVEL SECURITY;

-- Políticas para badges (todos podem ver)
CREATE POLICY "Anyone can view badges"
  ON public.badges FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage badges"
  ON public.badges FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas para user_badges
CREATE POLICY "Users can view their own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view others badges"
  ON public.user_badges FOR SELECT
  USING (true);

CREATE POLICY "System can insert badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (true);

-- Políticas para user_gamification
CREATE POLICY "Users can view their own gamification"
  ON public.user_gamification FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view others gamification"
  ON public.user_gamification FOR SELECT
  USING (true);

CREATE POLICY "System can manage gamification"
  ON public.user_gamification FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas para pontos_historico
CREATE POLICY "Users can view their own points history"
  ON public.pontos_historico FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all points history"
  ON public.pontos_historico FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'professor'::app_role));

CREATE POLICY "System can insert points"
  ON public.pontos_historico FOR INSERT
  WITH CHECK (true);

-- Função para adicionar pontos
CREATE OR REPLACE FUNCTION public.adicionar_pontos(
  p_user_id UUID,
  p_pontos INTEGER,
  p_motivo TEXT,
  p_tipo TEXT,
  p_referencia_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pontos_totais INTEGER;
  v_nivel_atual INTEGER;
  v_xp_atual INTEGER;
  v_xp_proximo INTEGER;
  v_novo_nivel INTEGER;
BEGIN
  -- Inserir no histórico
  INSERT INTO public.pontos_historico (user_id, pontos, motivo, tipo, referencia_id)
  VALUES (p_user_id, p_pontos, p_motivo, p_tipo, p_referencia_id);

  -- Atualizar ou criar registro de gamificação
  INSERT INTO public.user_gamification (user_id, pontos_totais, xp_atual)
  VALUES (p_user_id, p_pontos, p_pontos)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    pontos_totais = user_gamification.pontos_totais + p_pontos,
    xp_atual = user_gamification.xp_atual + p_pontos,
    updated_at = NOW();

  -- Verificar se subiu de nível
  SELECT xp_atual, nivel, xp_proximo_nivel INTO v_xp_atual, v_nivel_atual, v_xp_proximo
  FROM public.user_gamification
  WHERE user_id = p_user_id;

  WHILE v_xp_atual >= v_xp_proximo LOOP
    v_novo_nivel := v_nivel_atual + 1;
    v_xp_atual := v_xp_atual - v_xp_proximo;
    v_xp_proximo := v_xp_proximo + (v_novo_nivel * 50); -- Aumenta 50 XP por nível
    v_nivel_atual := v_novo_nivel;
  END LOOP;

  -- Atualizar nível se mudou
  IF v_nivel_atual > (SELECT nivel FROM public.user_gamification WHERE user_id = p_user_id) THEN
    UPDATE public.user_gamification
    SET 
      nivel = v_nivel_atual,
      xp_atual = v_xp_atual,
      xp_proximo_nivel = v_xp_proximo,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
END;
$$;

-- Função para atualizar streak
CREATE OR REPLACE FUNCTION public.atualizar_streak(p_user_id UUID, p_data DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ultima_atividade DATE;
  v_streak_atual INTEGER;
  v_melhor_streak INTEGER;
BEGIN
  SELECT ultima_atividade, streak_atual, melhor_streak 
  INTO v_ultima_atividade, v_streak_atual, v_melhor_streak
  FROM public.user_gamification
  WHERE user_id = p_user_id;

  -- Se não tem registro, criar
  IF v_ultima_atividade IS NULL THEN
    INSERT INTO public.user_gamification (user_id, streak_atual, melhor_streak, ultima_atividade)
    VALUES (p_user_id, 1, 1, p_data)
    ON CONFLICT (user_id) 
    DO UPDATE SET
      streak_atual = 1,
      melhor_streak = GREATEST(user_gamification.melhor_streak, 1),
      ultima_atividade = p_data;
    
    -- Adicionar pontos pelo primeiro dia
    PERFORM public.adicionar_pontos(p_user_id, 5, 'Primeira atividade', 'streak', NULL);
    RETURN;
  END IF;

  -- Se é dia consecutivo
  IF p_data = v_ultima_atividade + INTERVAL '1 day' THEN
    v_streak_atual := v_streak_atual + 1;
    v_melhor_streak := GREATEST(v_streak_atual, v_melhor_streak);
    
    UPDATE public.user_gamification
    SET 
      streak_atual = v_streak_atual,
      melhor_streak = v_melhor_streak,
      ultima_atividade = p_data,
      updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Adicionar pontos por manter streak (5 pontos base + bônus a cada 7 dias)
    PERFORM public.adicionar_pontos(
      p_user_id, 
      5 + (CASE WHEN v_streak_atual % 7 = 0 THEN 20 ELSE 0 END),
      'Streak de ' || v_streak_atual || ' dias',
      'streak',
      NULL
    );
  
  -- Se quebrou o streak (mais de 1 dia)
  ELSIF p_data > v_ultima_atividade + INTERVAL '1 day' THEN
    UPDATE public.user_gamification
    SET 
      streak_atual = 1,
      ultima_atividade = p_data,
      updated_at = NOW()
    WHERE user_id = p_user_id;
    
    PERFORM public.adicionar_pontos(p_user_id, 5, 'Nova atividade', 'streak', NULL);
  END IF;
END;
$$;

-- Trigger para adicionar pontos ao marcar presença
CREATE OR REPLACE FUNCTION public.pontos_presenca()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_data DATE;
BEGIN
  -- Se está marcando como presente
  IF NEW.presente = true THEN
    -- Obter user_id do aluno
    SELECT user_id INTO v_user_id
    FROM public.alunos
    WHERE id = NEW.aluno_id;

    -- Obter data da aula
    SELECT data INTO v_data
    FROM public.aulas_agendadas
    WHERE id = NEW.aula_id;

    -- Adicionar pontos pela presença
    PERFORM public.adicionar_pontos(v_user_id, 10, 'Presença em aula', 'presenca', NEW.id);
    
    -- Atualizar streak
    PERFORM public.atualizar_streak(v_user_id, v_data);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_pontos_presenca
AFTER INSERT OR UPDATE ON public.presenca
FOR EACH ROW
EXECUTE FUNCTION public.pontos_presenca();

-- Trigger para adicionar pontos ao responder formulário
CREATE OR REPLACE FUNCTION public.pontos_formulario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Obter user_id do aluno
  SELECT user_id INTO v_user_id
  FROM public.alunos
  WHERE id = NEW.aluno_id;

  -- Adicionar pontos pela resposta
  PERFORM public.adicionar_pontos(v_user_id, 15, 'Formulário respondido', 'formulario', NEW.id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_pontos_formulario
AFTER INSERT ON public.respostas_formularios
FOR EACH ROW
EXECUTE FUNCTION public.pontos_formulario();

-- Inserir badges padrão
INSERT INTO public.badges (nome, descricao, icone, tipo, requisito, pontos_bonus, cor) VALUES
('Presente Perfeito', '100% de presença em uma turma', 'Trophy', 'presenca', '{"tipo": "taxa_presenca", "valor": 100}', 100, '#FFD700'),
('Estudioso Bronze', 'Completou 5 formulários', 'BookOpen', 'formularios', '{"tipo": "formularios", "valor": 5}', 50, '#CD7F32'),
('Estudioso Prata', 'Completou 15 formulários', 'BookOpen', 'formularios', '{"tipo": "formularios", "valor": 15}', 100, '#C0C0C0'),
('Estudioso Ouro', 'Completou 30 formulários', 'BookOpen', 'formularios', '{"tipo": "formularios", "valor": 30}', 200, '#FFD700'),
('Maratonista Bronze', '10 horas de estudo', 'Clock', 'horas', '{"tipo": "horas", "valor": 10}', 50, '#CD7F32'),
('Maratonista Prata', '50 horas de estudo', 'Clock', 'horas', '{"tipo": "horas", "valor": 50}', 150, '#C0C0C0'),
('Maratonista Ouro', '100 horas de estudo', 'Clock', 'horas', '{"tipo": "horas", "valor": 100}', 300, '#FFD700'),
('Engajado', '7 dias consecutivos', 'Flame', 'streak', '{"tipo": "streak", "valor": 7}', 75, '#FF4500'),
('Super Engajado', '30 dias consecutivos', 'Flame', 'streak', '{"tipo": "streak", "valor": 30}', 250, '#FF0000'),
('Iniciante', 'Alcançou nível 5', 'Star', 'nivel', '{"tipo": "nivel", "valor": 5}', 50, '#87CEEB'),
('Intermediário', 'Alcançou nível 10', 'Star', 'nivel', '{"tipo": "nivel", "valor": 10}', 100, '#4169E1'),
('Avançado', 'Alcançou nível 20', 'Star', 'nivel', '{"tipo": "nivel", "valor": 20}', 200, '#0000CD');

-- Função para verificar e conceder badges
CREATE OR REPLACE FUNCTION public.verificar_badges(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge RECORD;
  v_valor_atual NUMERIC;
  v_ja_tem BOOLEAN;
BEGIN
  FOR v_badge IN SELECT * FROM public.badges LOOP
    -- Verificar se já tem o badge
    SELECT EXISTS(
      SELECT 1 FROM public.user_badges 
      WHERE user_id = p_user_id AND badge_id = v_badge.id
    ) INTO v_ja_tem;

    IF v_ja_tem THEN
      CONTINUE;
    END IF;

    -- Verificar requisito baseado no tipo
    CASE (v_badge.requisito->>'tipo')
      WHEN 'taxa_presenca' THEN
        SELECT MAX(taxa_presenca) INTO v_valor_atual
        FROM public.user_progress
        WHERE user_id = p_user_id;

      WHEN 'formularios' THEN
        SELECT SUM(formularios_respondidos) INTO v_valor_atual
        FROM public.user_progress
        WHERE user_id = p_user_id;

      WHEN 'horas' THEN
        SELECT SUM(horas_aprendizado) INTO v_valor_atual
        FROM public.user_progress
        WHERE user_id = p_user_id;

      WHEN 'streak' THEN
        SELECT streak_atual INTO v_valor_atual
        FROM public.user_gamification
        WHERE user_id = p_user_id;

      WHEN 'nivel' THEN
        SELECT nivel INTO v_valor_atual
        FROM public.user_gamification
        WHERE user_id = p_user_id;
    END CASE;

    -- Se cumpriu o requisito, conceder badge
    IF v_valor_atual >= (v_badge.requisito->>'valor')::NUMERIC THEN
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.id);

      -- Adicionar pontos bônus
      IF v_badge.pontos_bonus > 0 THEN
        PERFORM public.adicionar_pontos(
          p_user_id,
          v_badge.pontos_bonus,
          'Badge conquistado: ' || v_badge.nome,
          'badge',
          v_badge.id
        );
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Trigger para verificar badges após atualizar progresso
CREATE OR REPLACE FUNCTION public.verificar_badges_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.verificar_badges(NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_verificar_badges_progress
AFTER INSERT OR UPDATE ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION public.verificar_badges_trigger();

CREATE TRIGGER trigger_verificar_badges_gamification
AFTER INSERT OR UPDATE ON public.user_gamification
FOR EACH ROW
EXECUTE FUNCTION public.verificar_badges_trigger();

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_gamification_updated_at
BEFORE UPDATE ON public.user_gamification
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_badges_updated_at
BEFORE UPDATE ON public.badges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();