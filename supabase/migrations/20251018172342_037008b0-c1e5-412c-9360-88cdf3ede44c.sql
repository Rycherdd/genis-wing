-- Adicionar tipo "exercicio_video" aos conteúdos complementares
ALTER TABLE public.conteudos_complementares 
DROP CONSTRAINT IF EXISTS conteudos_complementares_tipo_check;

ALTER TABLE public.conteudos_complementares
ADD CONSTRAINT conteudos_complementares_tipo_check 
CHECK (tipo IN ('video', 'pdf', 'link', 'texto', 'slides', 'exercicio_video'));