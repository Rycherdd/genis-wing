-- Corrigir as políticas RLS para permitir que alunos vejam suas próprias matrículas
-- Primeiro, remover a política atual para alunos na tabela matriculas
DROP POLICY IF EXISTS "Alunos can view their matriculas" ON matriculas;

-- Criar nova política para permitir que alunos vejam suas próprias matrículas
CREATE POLICY "Alunos can view their own matriculas" 
ON matriculas 
FOR SELECT 
TO authenticated
USING (
  has_role(auth.uid(), 'aluno'::app_role) AND 
  aluno_id IN (
    SELECT id FROM alunos WHERE user_id = auth.uid()
  )
);

-- Verificar se a política de turmas para alunos está correta
-- Remover política atual se existir
DROP POLICY IF EXISTS "Alunos can view turmas they are enrolled in" ON turmas;

-- Recriar política melhorada para alunos verem suas turmas
CREATE POLICY "Alunos can view enrolled turmas" 
ON turmas 
FOR SELECT 
TO authenticated
USING (
  has_role(auth.uid(), 'aluno'::app_role) AND 
  id IN (
    SELECT m.turma_id 
    FROM matriculas m 
    JOIN alunos a ON m.aluno_id = a.id 
    WHERE a.user_id = auth.uid()
  )
);