-- Corrigir a política RLS para alunos na tabela turmas
-- Remover política atual
DROP POLICY IF EXISTS "Alunos can view enrolled turmas" ON turmas;

-- Criar política correta que permite alunos verem turmas onde estão matriculados
CREATE POLICY "Alunos can view enrolled turmas" 
ON turmas 
FOR SELECT 
TO authenticated
USING (
  -- Admins e professores veem todas as turmas
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'professor'::app_role) OR
  -- Alunos veem apenas turmas onde estão matriculados
  (
    has_role(auth.uid(), 'aluno'::app_role) AND 
    EXISTS (
      SELECT 1
      FROM matriculas m
      JOIN alunos a ON m.aluno_id = a.id
      WHERE m.turma_id = turmas.id 
      AND a.user_id = auth.uid()
    )
  )
);