-- Habilitar replica identity full para capturar mudanças completas
ALTER TABLE public.professores REPLICA IDENTITY FULL;

-- Adicionar a tabela à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.professores;