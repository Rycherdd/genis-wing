-- Remover política antiga
DROP POLICY IF EXISTS "Alunos podem ver avaliações ativas de suas turmas" ON public.avaliacoes;

-- Criar nova política que permite ver avaliações gerais (turma_id NULL) ou da turma do aluno
CREATE POLICY "Alunos podem ver avaliações ativas"
ON public.avaliacoes
FOR SELECT
TO authenticated
USING (
  ativa = true
  AND has_role(auth.uid(), 'aluno'::app_role)
  AND (
    turma_id IS NULL  -- Avaliações gerais para todos
    OR turma_id IN (   -- Ou avaliações da turma do aluno
      SELECT m.turma_id
      FROM matriculas m
      JOIN alunos a ON a.id = m.aluno_id
      WHERE a.user_id = auth.uid() 
      AND m.status = 'ativa'
    )
  )
);