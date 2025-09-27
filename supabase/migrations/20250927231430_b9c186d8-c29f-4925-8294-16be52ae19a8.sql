-- Add foreign key relationship between presenca and aulas_agendadas
ALTER TABLE public.presenca 
ADD CONSTRAINT fk_presenca_aula_agendada 
FOREIGN KEY (aula_id) REFERENCES public.aulas_agendadas(id) ON DELETE CASCADE;