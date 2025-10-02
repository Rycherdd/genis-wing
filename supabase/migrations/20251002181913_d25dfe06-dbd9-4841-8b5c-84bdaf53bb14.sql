-- Atualizar função para criar registro na tabela alunos quando convite de aluno é aceito
CREATE OR REPLACE FUNCTION public.update_invite_on_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_invite_role text;
  v_convite_record RECORD;
BEGIN
  -- Buscar o convite pendente com todos os dados
  SELECT * INTO v_convite_record
  FROM public.convites
  WHERE email = NEW.email
    AND status = 'pendente'
  LIMIT 1;

  -- Se existe um convite pendente, processar
  IF v_convite_record.role IS NOT NULL THEN
    -- Atualizar status do convite
    UPDATE public.convites
    SET 
      status = 'aceito',
      accepted_at = now()
    WHERE 
      email = NEW.email
      AND status = 'pendente';
    
    -- Criar a role do usuário na tabela user_roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, v_convite_record.role::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Se o role é 'aluno', criar registro na tabela alunos
    IF v_convite_record.role = 'aluno' THEN
      INSERT INTO public.alunos (user_id, nome, email, telefone)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'phone'
      )
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    -- Se o role é 'professor', criar registro na tabela professores
    IF v_convite_record.role = 'professor' THEN
      INSERT INTO public.professores (user_id, nome, email, telefone)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'phone'
      )
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;