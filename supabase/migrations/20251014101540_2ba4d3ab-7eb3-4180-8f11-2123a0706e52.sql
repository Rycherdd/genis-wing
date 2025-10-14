-- Criar tabela para rastrear avisos lidos
CREATE TABLE IF NOT EXISTS public.avisos_lidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  aviso_id UUID NOT NULL REFERENCES public.avisos(id) ON DELETE CASCADE,
  lido_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, aviso_id)
);

-- Habilitar RLS
ALTER TABLE public.avisos_lidos ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver seus próprios avisos lidos
CREATE POLICY "Users can view their own read notices"
ON public.avisos_lidos
FOR SELECT
USING (auth.uid() = user_id);

-- Política: usuários podem marcar avisos como lidos
CREATE POLICY "Users can mark notices as read"
ON public.avisos_lidos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: usuários podem deletar suas próprias marcações
CREATE POLICY "Users can delete their own read marks"
ON public.avisos_lidos
FOR DELETE
USING (auth.uid() = user_id);

-- Criar índice para melhor performance
CREATE INDEX idx_avisos_lidos_user_id ON public.avisos_lidos(user_id);
CREATE INDEX idx_avisos_lidos_aviso_id ON public.avisos_lidos(aviso_id);