-- Remover Maite da tabela de alunos, pois ela é administradora
DELETE FROM public.alunos 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'maite.tete2012@gmail.com'
);

-- Garantir que ela tem apenas o role de admin
DELETE FROM public.user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'maite.tete2012@gmail.com')
  AND role != 'admin';

-- Garantir que ela tem o role de admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'maite.tete2012@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;