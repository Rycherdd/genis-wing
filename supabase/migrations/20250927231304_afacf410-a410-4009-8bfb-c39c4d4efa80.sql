-- Create table for scheduled classes (different from course content)
CREATE TABLE public.aulas_agendadas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  professor_id UUID NOT NULL,
  turma_id UUID NOT NULL,
  data DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  local TEXT,
  status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'em-andamento', 'concluida', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.aulas_agendadas ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own aulas_agendadas" 
ON public.aulas_agendadas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own aulas_agendadas" 
ON public.aulas_agendadas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own aulas_agendadas" 
ON public.aulas_agendadas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own aulas_agendadas" 
ON public.aulas_agendadas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_aulas_agendadas_updated_at
BEFORE UPDATE ON public.aulas_agendadas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();