-- Enable RLS on remaining tables that don't have it yet
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for educational content tables

-- Aulas: Only professors and admins can manage
CREATE POLICY "Professors and admins can manage aulas" 
ON public.aulas 
FOR ALL 
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'professor')
);

-- Modulos: Only professors and admins can manage
CREATE POLICY "Professors and admins can manage modulos" 
ON public.modulos 
FOR ALL 
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'professor')
);

-- Tags: Only professors and admins can manage
CREATE POLICY "Professors and admins can manage tags" 
ON public.tags 
FOR ALL 
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'professor')
);