-- Criar uma matrícula de teste para o aluno existente
INSERT INTO matriculas (aluno_id, turma_id, user_id, status)
SELECT 
  a.id as aluno_id,
  t.id as turma_id,
  a.user_id,
  'ativa'
FROM alunos a
CROSS JOIN turmas t
WHERE a.user_id = '07f8b559-32fd-40f2-a505-ba26d4dca040'
LIMIT 1;