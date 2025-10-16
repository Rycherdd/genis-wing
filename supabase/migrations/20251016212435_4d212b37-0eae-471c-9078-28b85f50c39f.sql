-- Tabela de formulários de avaliação de aulas
CREATE TABLE public.formularios_aulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id UUID NOT NULL REFERENCES public.aulas_agendadas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  perguntas JSONB NOT NULL DEFAULT '[]'::jsonb,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de respostas dos formulários
CREATE TABLE public.respostas_formularios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formulario_id UUID NOT NULL REFERENCES public.formularios_aulas(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  respostas JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(formulario_id, aluno_id)
);

-- Índices para performance
CREATE INDEX idx_formularios_aulas_aula_id ON public.formularios_aulas(aula_id);
CREATE INDEX idx_formularios_aulas_ativo ON public.formularios_aulas(ativo);
CREATE INDEX idx_respostas_formularios_formulario_id ON public.respostas_formularios(formulario_id);
CREATE INDEX idx_respostas_formularios_aluno_id ON public.respostas_formularios(aluno_id);

-- Habilitar RLS
ALTER TABLE public.formularios_aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respostas_formularios ENABLE ROW LEVEL SECURITY;

-- Políticas para formularios_aulas
CREATE POLICY "Admins e professores podem gerenciar formulários"
ON public.formularios_aulas FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'professor'::app_role)
);

CREATE POLICY "Alunos podem ver formulários ativos de suas aulas"
ON public.formularios_aulas FOR SELECT
USING (
  has_role(auth.uid(), 'aluno'::app_role)
  AND ativo = true
  AND EXISTS (
    SELECT 1
    FROM public.aulas_agendadas aa
    JOIN public.matriculas m ON m.turma_id = aa.turma_id
    JOIN public.alunos a ON a.id = m.aluno_id
    WHERE aa.id = formularios_aulas.aula_id
    AND a.user_id = auth.uid()
    AND m.status = 'ativa'
  )
);

-- Políticas para respostas_formularios
CREATE POLICY "Admins e professores podem ver todas as respostas"
ON public.respostas_formularios FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'professor'::app_role)
);

CREATE POLICY "Alunos podem criar suas próprias respostas"
ON public.respostas_formularios FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'aluno'::app_role)
  AND aluno_id IN (
    SELECT id FROM public.alunos WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Alunos podem ver suas próprias respostas"
ON public.respostas_formularios FOR SELECT
USING (
  has_role(auth.uid(), 'aluno'::app_role)
  AND aluno_id IN (
    SELECT id FROM public.alunos WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Alunos podem atualizar suas próprias respostas"
ON public.respostas_formularios FOR UPDATE
USING (
  has_role(auth.uid(), 'aluno'::app_role)
  AND aluno_id IN (
    SELECT id FROM public.alunos WHERE user_id = auth.uid()
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_formularios_aulas_updated_at
BEFORE UPDATE ON public.formularios_aulas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_respostas_formularios_updated_at
BEFORE UPDATE ON public.respostas_formularios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();