-- Add foreign key relationship between aulas_agendadas and turmas
ALTER TABLE public.aulas_agendadas 
ADD CONSTRAINT fk_aulas_agendadas_turma 
FOREIGN KEY (turma_id) REFERENCES public.turmas(id) ON DELETE CASCADE;

-- Add foreign key relationship between aulas_agendadas and professores  
ALTER TABLE public.aulas_agendadas 
ADD CONSTRAINT fk_aulas_agendadas_professor 
FOREIGN KEY (professor_id) REFERENCES public.professores(id) ON DELETE CASCADE;