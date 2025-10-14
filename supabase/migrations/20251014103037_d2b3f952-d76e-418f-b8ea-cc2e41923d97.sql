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

-- Adicionar todas as tabelas à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.alunos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aulas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aulas_agendadas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.avisos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.avisos_lidos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.convites;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matriculas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.modulos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.presenca;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tags;
ALTER PUBLICATION supabase_realtime ADD TABLE public.turmas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;