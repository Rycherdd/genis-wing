-- Criar tabela de avisos
CREATE TABLE public.avisos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  user_id UUID NOT NULL,
  data_publicacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_expiracao TIMESTAMP WITH TIME ZONE,
  prioridade TEXT NOT NULL DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
  fixado BOOLEAN NOT NULL DEFAULT false,
  turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY;

-- Admin pode fazer tudo
CREATE POLICY "Admins can manage avisos"
ON public.avisos
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Professores podem criar e ver avisos
CREATE POLICY "Professores can create avisos"
ON public.avisos
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'professor'::app_role));

CREATE POLICY "Professores can view avisos"
ON public.avisos
FOR SELECT
USING (has_role(auth.uid(), 'professor'::app_role));

-- Alunos podem ver avisos (todos ou da sua turma)
CREATE POLICY "Alunos can view avisos"
ON public.avisos
FOR SELECT
USING (
  has_role(auth.uid(), 'aluno'::app_role) AND (
    -- Avisos gerais (sem turma específica)
    turma_id IS NULL 
    OR
    -- Avisos da turma do aluno
    turma_id IN (
      SELECT m.turma_id 
      FROM public.matriculas m
      JOIN public.alunos a ON m.aluno_id = a.id
      WHERE a.user_id = auth.uid() AND m.status = 'ativa'
    )
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_avisos_updated_at
BEFORE UPDATE ON public.avisos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();