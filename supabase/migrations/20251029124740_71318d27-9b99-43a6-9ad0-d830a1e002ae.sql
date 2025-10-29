-- Corrige a função update_invite_on_user_signup para lidar melhor com erros
CREATE OR REPLACE FUNCTION public.update_invite_on_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  -- Log para debug
  IF v_convite_record.id IS NOT NULL THEN
    RAISE NOTICE 'Found invite with role: %', v_convite_record.role;
  ELSE
    RAISE NOTICE 'No pending invite found for email: %', NEW.email;
    -- Se não há convite, não fazer nada e retornar
    RETURN NEW;
  END IF;

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
        -- Não bloquear o signup se falhar
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
          -- Não bloquear o signup se falhar
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
          -- Não bloquear o signup se falhar
      END;
    END IF;
    
    -- Atualizar status do convite APENAS SE as operações anteriores funcionaram
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
$$;