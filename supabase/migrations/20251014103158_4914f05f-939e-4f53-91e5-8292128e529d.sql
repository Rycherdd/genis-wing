-- Habilitar replica identity full para todas as tabelas
ALTER TABLE public.alunos REPLICA IDENTITY FULL;
ALTER TABLE public.aulas REPLICA IDENTITY FULL;
ALTER TABLE public.aulas_agendadas REPLICA IDENTITY FULL;
ALTER TABLE public.avisos REPLICA IDENTITY FULL;
ALTER TABLE public.avisos_lidos REPLICA IDENTITY FULL;
ALTER TABLE public.convites REPLICA IDENTITY FULL;
ALTER TABLE public.matriculas REPLICA IDENTITY FULL;
ALTER TABLE public.modulos REPLICA IDENTITY FULL;
ALTER TABLE public.presenca REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.tags REPLICA IDENTITY FULL;
ALTER TABLE public.turmas REPLICA IDENTITY FULL;
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;

-- Adicionar tabelas faltantes à publicação realtime (ignorando as que já existem)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.aulas;
  EXCEPTION WHEN others THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.aulas_agendadas;
  EXCEPTION WHEN others THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.avisos;
  EXCEPTION WHEN others THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.avisos_lidos;
  EXCEPTION WHEN others THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.convites;
  EXCEPTION WHEN others THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.matriculas;
  EXCEPTION WHEN others THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.modulos;
  EXCEPTION WHEN others THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.presenca;
  EXCEPTION WHEN others THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  EXCEPTION WHEN others THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tags;
  EXCEPTION WHEN others THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.turmas;
  EXCEPTION WHEN others THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
  EXCEPTION WHEN others THEN
    NULL;
  END;
END $$;