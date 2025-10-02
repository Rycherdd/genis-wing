-- Inserir a aluna Maite na tabela alunos
-- Primeiro, vamos buscar o user_id dela através do email
DO $$
DECLARE
  v_user_id uuid;
  v_full_name text;
  v_phone text;
BEGIN
  -- Buscar o user_id e metadados do usuário com o email da Maite
  SELECT id, 
         raw_user_meta_data->>'full_name',
         raw_user_meta_data->>'phone'
  INTO v_user_id, v_full_name, v_phone
  FROM auth.users
  WHERE email = 'maite.tete2012@gmail.com'
  LIMIT 1;
  
  -- Se o usuário existe e ainda não está na tabela alunos, inserir
  IF v_user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.alunos WHERE user_id = v_user_id
  ) THEN
    INSERT INTO public.alunos (user_id, nome, email, telefone)
    VALUES (
      v_user_id,
      COALESCE(v_full_name, split_part('maite.tete2012@gmail.com', '@', 1)),
      'maite.tete2012@gmail.com',
      v_phone
    );
  END IF;
END $$;