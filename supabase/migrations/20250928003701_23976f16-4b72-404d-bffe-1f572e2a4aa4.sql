-- Criar entrada de professor para usuários que têm o role professor mas não estão na tabela
INSERT INTO professores (user_id, nome, email, telefone, especializacao, status)
SELECT 
  p.user_id,
  p.full_name,
  au.email,
  au.phone,
  ARRAY[]::text[],
  'ativo'
FROM profiles p
JOIN user_roles ur ON p.user_id = ur.user_id
JOIN auth.users au ON p.user_id = au.id
WHERE ur.role = 'professor'
  AND NOT EXISTS (
    SELECT 1 FROM professores pr WHERE pr.user_id = p.user_id
  );