-- Fix critical security issue: Allow students to access lesson content
-- Students enrolled in any turma should be able to view lesson content

-- Add SELECT policy for students to view aulas (lesson content)
CREATE POLICY "Students can view lesson content"
ON public.aulas
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'aluno'::app_role) AND
  EXISTS (
    SELECT 1
    FROM public.matriculas m
    JOIN public.alunos a ON m.aluno_id = a.id
    WHERE a.user_id = auth.uid()
    AND m.status = 'ativa'
  )
);

-- Add SELECT policy for students to view modulos (modules)
CREATE POLICY "Students can view modules"
ON public.modulos
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'aluno'::app_role) AND
  EXISTS (
    SELECT 1
    FROM public.matriculas m
    JOIN public.alunos a ON m.aluno_id = a.id
    WHERE a.user_id = auth.uid()
    AND m.status = 'ativa'
  )
);