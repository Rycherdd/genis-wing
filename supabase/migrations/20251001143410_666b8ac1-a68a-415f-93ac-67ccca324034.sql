-- Atualizar função para criar role do usuário quando ele aceita o convite
CREATE OR REPLACE FUNCTION public.update_invite_on_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite_role text;
BEGIN
  -- Buscar o role do convite pendente
  SELECT role INTO v_invite_role
  FROM public.convites
  WHERE email = NEW.email
    AND status = 'pendente'
  LIMIT 1;

  -- Se existe um convite pendente, atualizar o status e criar a role
  IF v_invite_role IS NOT NULL THEN
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
    VALUES (NEW.id, v_invite_role::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;