
-- Primeiro, vamos criar os registros de alunos que faltam
-- para usuários que já aceitaram convites mas não foram criados

-- Inserir João
INSERT INTO public.alunos (user_id, nome, email, telefone)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  au.email,
  au.raw_user_meta_data->>'phone'
FROM auth.users au
WHERE au.email = 'joao.rovere@agenciabrio.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.alunos WHERE user_id = au.id
  );

-- Inserir Maite
INSERT INTO public.alunos (user_id, nome, email, telefone)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  au.email,
  au.raw_user_meta_data->>'phone'
FROM auth.users au
WHERE au.email = 'maite.tete2012@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.alunos WHERE user_id = au.id
  );

-- Recriar o trigger para garantir que funcione corretamente no futuro
DROP TRIGGER IF EXISTS on_auth_user_created_invite ON auth.users;

-- Recriar a função com melhorias de log
CREATE OR REPLACE FUNCTION public.update_invite_on_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_invite_role text;
  v_convite_record RECORD;
BEGIN
  -- Log para debug
  RAISE NOTICE 'Processing signup for email: %', NEW.email;
  
  -- Buscar o convite pendente com todos os dados
  SELECT * INTO v_convite_record
  FROM public.convites
  WHERE email = NEW.email
    AND status = 'pendente'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Se não há convite pendente, não fazer nada
  IF v_convite_record.id IS NULL THEN
    RAISE NOTICE 'No pending invite found for email: %', NEW.email;
    RETURN NEW;
  END IF;

  RAISE NOTICE 'Found invite with role: %', v_convite_record.role;

  -- Se existe um convite pendente, processar
  IF v_convite_record.role IS NOT NULL THEN
    BEGIN
      -- Criar a role do usuário na tabela user_roles
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, v_convite_record.role::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
      
      RAISE NOTICE 'Created user_role for user: % with role: %', NEW.id, v_convite_record.role;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Error creating user_role: %', SQLERRM;
    END;
    
    -- Se o role é 'aluno', criar registro na tabela alunos
    IF v_convite_record.role = 'aluno' THEN
      BEGIN
        INSERT INTO public.alunos (user_id, nome, email, telefone)
        VALUES (
          NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
          NEW.email,
          NEW.raw_user_meta_data->>'phone'
        )
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE 'Created aluno record for user: %', NEW.id;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE WARNING 'Error creating aluno: %', SQLERRM;
      END;
    END IF;
    
    -- Se o role é 'professor', criar registro na tabela professores
    IF v_convite_record.role = 'professor' THEN
      BEGIN
        INSERT INTO public.professores (user_id, nome, email, telefone)
        VALUES (
          NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
          NEW.email,
          NEW.raw_user_meta_data->>'phone'
        )
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE 'Created professor record for user: %', NEW.id;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE WARNING 'Error creating professor: %', SQLERRM;
      END;
    END IF;
    
    -- Atualizar status do convite
    BEGIN
      UPDATE public.convites
      SET 
        status = 'aceito',
        accepted_at = now()
      WHERE 
        email = NEW.email
        AND status = 'pendente';
        
      RAISE NOTICE 'Updated invite status to aceito for email: %', NEW.email;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Error updating invite status: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log o erro mas não bloqueie o signup
    RAISE WARNING 'Error in update_invite_on_user_signup: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created_invite
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invite_on_user_signup();
