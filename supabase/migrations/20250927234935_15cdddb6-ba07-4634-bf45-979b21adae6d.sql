-- Insert professor role for the current user (Rycherd Fernandes Dionizio)
INSERT INTO public.user_roles (user_id, role, assigned_at) 
VALUES ('aa09b361-4f02-401d-b98d-2da0a35b7f06', 'professor', now())
ON CONFLICT (user_id, role) DO NOTHING;