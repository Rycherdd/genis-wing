-- Fix RLS policies for alunos table to ensure admins and professors can view students

-- Drop existing policy and recreate with correct syntax
DROP POLICY IF EXISTS "Admins and professors can manage students" ON public.alunos;

-- Create separate policies for better clarity and security
CREATE POLICY "Admins and professors can view all students"
ON public.alunos
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'professor'::app_role)
);

CREATE POLICY "Admins and professors can insert students"
ON public.alunos
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'professor'::app_role)
);

CREATE POLICY "Admins and professors can update students"
ON public.alunos
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'professor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'professor'::app_role)
);

CREATE POLICY "Admins and professors can delete students"
ON public.alunos
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'professor'::app_role)
);