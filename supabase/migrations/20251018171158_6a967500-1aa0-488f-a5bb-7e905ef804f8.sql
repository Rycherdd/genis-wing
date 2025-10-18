-- Tabela de conteúdos complementares
CREATE TABLE public.conteudos_complementares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('video', 'texto', 'pdf', 'link', 'slides')),
  conteudo TEXT NOT NULL, -- URL ou texto do conteúdo
  turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE,
  modulo TEXT,
  tags TEXT[],
  duracao_estimada INTEGER, -- em minutos
  pontos_estudo INTEGER DEFAULT 20,
  pontos_revisao INTEGER DEFAULT 10,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de progresso de estudo dos alunos
CREATE TABLE public.progresso_conteudos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  conteudo_id UUID NOT NULL REFERENCES public.conteudos_complementares(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'nao_iniciado' CHECK (status IN ('nao_iniciado', 'em_progresso', 'concluido', 'revisado')),
  tempo_estudo INTEGER DEFAULT 0, -- em minutos
  vezes_revisado INTEGER DEFAULT 0,
  primeira_visualizacao TIMESTAMPTZ,
  ultima_visualizacao TIMESTAMPTZ,
  concluido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, conteudo_id)
);

-- Tabela de avaliações/provas
CREATE TABLE public.avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  conteudo_id UUID REFERENCES public.conteudos_complementares(id) ON DELETE SET NULL,
  turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE,
  questoes JSONB NOT NULL, -- [{pergunta, opcoes[], resposta_correta, pontos}]
  pontos_totais INTEGER NOT NULL,
  tempo_limite INTEGER, -- em minutos, NULL = sem limite
  tentativas_permitidas INTEGER DEFAULT 1,
  nota_minima NUMERIC(5,2) DEFAULT 60.00,
  ativa BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de tentativas de avaliações
CREATE TABLE public.tentativas_avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id UUID NOT NULL REFERENCES public.avaliacoes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  respostas JSONB NOT NULL, -- [{questao_id, resposta_escolhida}]
  nota NUMERIC(5,2) NOT NULL,
  pontos_ganhos INTEGER DEFAULT 0,
  tempo_gasto INTEGER, -- em minutos
  aprovado BOOLEAN NOT NULL,
  iniciado_em TIMESTAMPTZ DEFAULT NOW(),
  finalizado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.conteudos_complementares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_conteudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tentativas_avaliacoes ENABLE ROW LEVEL SECURITY;

-- Políticas para conteudos_complementares
CREATE POLICY "Professores e admins podem gerenciar conteúdos"
  ON public.conteudos_complementares FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'professor'::app_role));

CREATE POLICY "Alunos podem ver conteúdos de suas turmas"
  ON public.conteudos_complementares FOR SELECT
  USING (
    has_role(auth.uid(), 'aluno'::app_role) AND
    (turma_id IS NULL OR turma_id IN (
      SELECT m.turma_id
      FROM public.matriculas m
      JOIN public.alunos a ON a.id = m.aluno_id
      WHERE a.user_id = auth.uid() AND m.status = 'ativa'
    ))
  );

-- Políticas para progresso_conteudos
CREATE POLICY "Usuários podem ver seu próprio progresso"
  ON public.progresso_conteudos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio progresso"
  ON public.progresso_conteudos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Professores podem ver progresso de seus alunos"
  ON public.progresso_conteudos FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'professor'::app_role));

-- Políticas para avaliacoes
CREATE POLICY "Professores e admins podem gerenciar avaliações"
  ON public.avaliacoes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'professor'::app_role));

CREATE POLICY "Alunos podem ver avaliações ativas de suas turmas"
  ON public.avaliacoes FOR SELECT
  USING (
    ativa = true AND
    has_role(auth.uid(), 'aluno'::app_role) AND
    turma_id IN (
      SELECT m.turma_id
      FROM public.matriculas m
      JOIN public.alunos a ON a.id = m.aluno_id
      WHERE a.user_id = auth.uid() AND m.status = 'ativa'
    )
  );

-- Políticas para tentativas_avaliacoes
CREATE POLICY "Usuários podem ver suas próprias tentativas"
  ON public.tentativas_avaliacoes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias tentativas"
  ON public.tentativas_avaliacoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Professores podem ver todas tentativas"
  ON public.tentativas_avaliacoes FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'professor'::app_role));

-- Função para marcar conteúdo como estudado/concluído
CREATE OR REPLACE FUNCTION public.marcar_conteudo_estudado(
  p_conteudo_id UUID,
  p_tempo_minutos INTEGER DEFAULT 0,
  p_concluir BOOLEAN DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_pontos INTEGER;
  v_status_atual TEXT;
  v_conteudo RECORD;
BEGIN
  -- Buscar informações do conteúdo
  SELECT * INTO v_conteudo
  FROM public.conteudos_complementares
  WHERE id = p_conteudo_id;

  -- Inserir ou atualizar progresso
  INSERT INTO public.progresso_conteudos (
    user_id,
    conteudo_id,
    status,
    tempo_estudo,
    primeira_visualizacao,
    ultima_visualizacao,
    concluido_em
  )
  VALUES (
    v_user_id,
    p_conteudo_id,
    CASE WHEN p_concluir THEN 'concluido' ELSE 'em_progresso' END,
    p_tempo_minutos,
    NOW(),
    NOW(),
    CASE WHEN p_concluir THEN NOW() ELSE NULL END
  )
  ON CONFLICT (user_id, conteudo_id)
  DO UPDATE SET
    status = CASE 
      WHEN p_concluir AND progresso_conteudos.status != 'concluido' THEN 'concluido'
      WHEN NOT p_concluir AND progresso_conteudos.status = 'nao_iniciado' THEN 'em_progresso'
      ELSE progresso_conteudos.status
    END,
    tempo_estudo = progresso_conteudos.tempo_estudo + p_tempo_minutos,
    ultima_visualizacao = NOW(),
    concluido_em = CASE 
      WHEN p_concluir AND progresso_conteudos.concluido_em IS NULL THEN NOW()
      ELSE progresso_conteudos.concluido_em
    END,
    updated_at = NOW()
  RETURNING status INTO v_status_atual;

  -- Adicionar pontos se concluiu pela primeira vez
  IF p_concluir AND v_status_atual = 'concluido' THEN
    SELECT status INTO v_status_atual
    FROM public.progresso_conteudos
    WHERE user_id = v_user_id AND conteudo_id = p_conteudo_id;
    
    IF v_status_atual = 'concluido' THEN
      v_pontos := COALESCE(v_conteudo.pontos_estudo, 20);
      PERFORM public.adicionar_pontos(
        v_user_id,
        v_pontos,
        'Conteúdo concluído: ' || v_conteudo.titulo,
        'bonus',
        p_conteudo_id
      );
    END IF;
  END IF;
END;
$$;

-- Função para marcar revisão
CREATE OR REPLACE FUNCTION public.marcar_revisao(p_conteudo_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_pontos INTEGER;
  v_conteudo RECORD;
BEGIN
  -- Buscar informações do conteúdo
  SELECT * INTO v_conteudo
  FROM public.conteudos_complementares
  WHERE id = p_conteudo_id;

  -- Atualizar progresso
  UPDATE public.progresso_conteudos
  SET
    status = 'revisado',
    vezes_revisado = vezes_revisado + 1,
    ultima_visualizacao = NOW(),
    updated_at = NOW()
  WHERE user_id = v_user_id AND conteudo_id = p_conteudo_id;

  -- Adicionar pontos pela revisão
  v_pontos := COALESCE(v_conteudo.pontos_revisao, 10);
  PERFORM public.adicionar_pontos(
    v_user_id,
    v_pontos,
    'Revisão de conteúdo: ' || v_conteudo.titulo,
    'bonus',
    p_conteudo_id
  );
END;
$$;

-- Função para registrar tentativa de avaliação e dar pontos
CREATE OR REPLACE FUNCTION public.processar_avaliacao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_avaliacao RECORD;
  v_pontos_base INTEGER;
  v_pontos_bonus INTEGER;
BEGIN
  -- Buscar informações da avaliação
  SELECT * INTO v_avaliacao
  FROM public.avaliacoes
  WHERE id = NEW.avaliacao_id;

  -- Se passou, adicionar pontos
  IF NEW.aprovado THEN
    v_pontos_base := v_avaliacao.pontos_totais;
    
    -- Bônus por nota alta (>90%)
    v_pontos_bonus := CASE 
      WHEN NEW.nota >= 90 THEN ROUND(v_pontos_base * 0.5)
      WHEN NEW.nota >= 80 THEN ROUND(v_pontos_base * 0.25)
      ELSE 0
    END;

    NEW.pontos_ganhos := v_pontos_base + v_pontos_bonus;

    -- Adicionar pontos
    PERFORM public.adicionar_pontos(
      NEW.user_id,
      NEW.pontos_ganhos,
      'Avaliação aprovada: ' || v_avaliacao.titulo || ' (' || NEW.nota || '%)',
      'bonus',
      NEW.avaliacao_id
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_processar_avaliacao
BEFORE INSERT ON public.tentativas_avaliacoes
FOR EACH ROW
EXECUTE FUNCTION public.processar_avaliacao();

-- Triggers para updated_at
CREATE TRIGGER update_conteudos_complementares_updated_at
BEFORE UPDATE ON public.conteudos_complementares
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progresso_conteudos_updated_at
BEFORE UPDATE ON public.progresso_conteudos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_avaliacoes_updated_at
BEFORE UPDATE ON public.avaliacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();