-- Criar função para atualizar status do convite quando usuário é criado
CREATE OR REPLACE FUNCTION public.update_invite_on_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualizar convites pendentes para o email do novo usuário
  UPDATE public.convites
  SET 
    status = 'aceito',
    accepted_at = now()
  WHERE 
    email = NEW.email
    AND status = 'pendente';
  
  RETURN NEW;
END;
$$;

-- Criar trigger que dispara quando usuário é criado
DROP TRIGGER IF EXISTS on_user_signup_update_invite ON auth.users;
CREATE TRIGGER on_user_signup_update_invite
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invite_on_user_signup();