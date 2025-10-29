
-- Remover registro incorreto da Maite da tabela alunos
-- Ela deve ser apenas admin, não aluno
DELETE FROM public.alunos 
WHERE user_id = 'c63a887b-b424-4a0b-be90-11eeae2a1034';

-- Garantir que ela tem apenas a role admin
DELETE FROM public.user_roles 
WHERE user_id = 'c63a887b-b424-4a0b-be90-11eeae2a1034' 
AND role != 'admin';
