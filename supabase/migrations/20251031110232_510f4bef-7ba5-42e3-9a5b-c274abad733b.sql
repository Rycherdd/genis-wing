-- Criar tabela de check-ins
CREATE TABLE IF NOT EXISTS public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id UUID NOT NULL REFERENCES public.aulas_agendadas(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  checkin_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(aula_id, aluno_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_checkins_aula_id ON public.checkins(aula_id);
CREATE INDEX IF NOT EXISTS idx_checkins_aluno_id ON public.checkins(aluno_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON public.checkins(user_id);

-- Habilitar RLS
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- Política: Alunos podem criar seus próprios check-ins
CREATE POLICY "Alunos podem criar check-ins"
ON public.checkins
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'aluno'::app_role) AND
  user_id = auth.uid() AND
  aluno_id IN (SELECT id FROM public.alunos WHERE user_id = auth.uid())
);

-- Política: Alunos podem ver seus próprios check-ins
CREATE POLICY "Alunos podem ver seus check-ins"
ON public.checkins
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'aluno'::app_role) AND
  user_id = auth.uid()
);

-- Política: Professores e admins podem ver todos os check-ins
CREATE POLICY "Professores e admins podem ver check-ins"
ON public.checkins
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'professor'::app_role)
);

-- Política: Professores e admins podem deletar check-ins
CREATE POLICY "Professores e admins podem deletar check-ins"
ON public.checkins
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'professor'::app_role)
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_checkins_updated_at
BEFORE UPDATE ON public.checkins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();