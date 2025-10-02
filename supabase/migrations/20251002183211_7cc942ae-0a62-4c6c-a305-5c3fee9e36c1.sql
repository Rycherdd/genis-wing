-- Secure the alunos table with explicit authentication requirements

-- Ensure RLS is enabled and forced (defense in depth)
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos FORCE ROW LEVEL SECURITY;

-- Drop existing policies to recreate with explicit authentication requirements
DROP POLICY IF EXISTS "Professors and admins can manage alunos" ON public.alunos;
DROP POLICY IF EXISTS "Alunos can view their own profile" ON public.alunos;

-- Only authenticated admins and professors can manage student data
CREATE POLICY "Admins and professors can manage students"
ON public.alunos
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'professor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'professor'::app_role)
);

-- Only authenticated students can view their own profile data
CREATE POLICY "Students can view own profile"
ON public.alunos
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'aluno'::app_role) AND 
  user_id = auth.uid()
);