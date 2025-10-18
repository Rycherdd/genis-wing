-- Adicionar foreign keys para aulas_agendadas se não existirem
DO $$ 
BEGIN
  -- Verificar e adicionar FK para professores
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'aulas_agendadas_professor_id_fkey'
  ) THEN
    ALTER TABLE public.aulas_agendadas
    ADD CONSTRAINT aulas_agendadas_professor_id_fkey
    FOREIGN KEY (professor_id) REFERENCES public.professores(id)
    ON DELETE SET NULL;
  END IF;

  -- Verificar e adicionar FK para turmas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'aulas_agendadas_turma_id_fkey'
  ) THEN
    ALTER TABLE public.aulas_agendadas
    ADD CONSTRAINT aulas_agendadas_turma_id_fkey
    FOREIGN KEY (turma_id) REFERENCES public.turmas(id)
    ON DELETE CASCADE;
  END IF;
END $$;