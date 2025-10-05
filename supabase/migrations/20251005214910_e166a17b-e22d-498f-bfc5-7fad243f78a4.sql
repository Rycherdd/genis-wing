-- Drop existing SELECT policies on alunos table to recreate with stronger auth checks
DROP POLICY IF EXISTS "Admins and professors can view all students" ON alunos;
DROP POLICY IF EXISTS "Students can view own profile" ON alunos;

-- Create more secure SELECT policies that explicitly check for authentication
CREATE POLICY "Authenticated admins and professors can view all students"
ON alunos
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'professor'::app_role))
);

CREATE POLICY "Authenticated students can view own profile"
ON alunos
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  has_role(auth.uid(), 'aluno'::app_role) AND
  user_id = auth.uid()
);

-- Also strengthen the other policies to explicitly require authentication
DROP POLICY IF EXISTS "Admins and professors can insert students" ON alunos;
DROP POLICY IF EXISTS "Admins and professors can update students" ON alunos;
DROP POLICY IF EXISTS "Admins and professors can delete students" ON alunos;

CREATE POLICY "Authenticated admins and professors can insert students"
ON alunos
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'professor'::app_role))
);

CREATE POLICY "Authenticated admins and professors can update students"
ON alunos
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'professor'::app_role))
)
WITH CHECK (
  auth.uid() IS NOT NULL AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'professor'::app_role))
);

CREATE POLICY "Authenticated admins and professors can delete students"
ON alunos
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'professor'::app_role))
);