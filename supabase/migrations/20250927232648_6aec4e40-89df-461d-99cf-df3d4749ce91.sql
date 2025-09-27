-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'professor', 'aluno');

-- Create user_roles table for proper role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies for existing tables to respect roles

-- Turmas: Only professors and admins can manage, alunos can only view their enrolled turmas
DROP POLICY IF EXISTS "Users can view their own turmas" ON public.turmas;
DROP POLICY IF EXISTS "Users can create their own turmas" ON public.turmas;
DROP POLICY IF EXISTS "Users can update their own turmas" ON public.turmas;
DROP POLICY IF EXISTS "Users can delete their own turmas" ON public.turmas;

CREATE POLICY "Professors and admins can manage turmas" 
ON public.turmas 
FOR ALL 
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'professor')
);

CREATE POLICY "Alunos can view turmas they are enrolled in" 
ON public.turmas 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'aluno') AND 
  EXISTS (
    SELECT 1 FROM public.matriculas 
    WHERE matriculas.turma_id = turmas.id 
    AND matriculas.aluno_id IN (
      SELECT id FROM public.alunos WHERE user_id = auth.uid()
    )
  )
);

-- Aulas_agendadas: Only professors can manage, alunos can view their scheduled classes
DROP POLICY IF EXISTS "Users can view their own aulas_agendadas" ON public.aulas_agendadas;
DROP POLICY IF EXISTS "Users can create their own aulas_agendadas" ON public.aulas_agendadas;
DROP POLICY IF EXISTS "Users can update their own aulas_agendadas" ON public.aulas_agendadas;
DROP POLICY IF EXISTS "Users can delete their own aulas_agendadas" ON public.aulas_agendadas;

CREATE POLICY "Professors and admins can manage aulas_agendadas" 
ON public.aulas_agendadas 
FOR ALL 
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'professor')
);

CREATE POLICY "Alunos can view their scheduled classes" 
ON public.aulas_agendadas 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'aluno') AND 
  EXISTS (
    SELECT 1 FROM public.matriculas 
    WHERE matriculas.turma_id = aulas_agendadas.turma_id 
    AND matriculas.aluno_id IN (
      SELECT id FROM public.alunos WHERE user_id = auth.uid()
    )
  )
);

-- Presenca: Only professors can manage, alunos can view their own attendance
DROP POLICY IF EXISTS "Users can view their own presenca" ON public.presenca;
DROP POLICY IF EXISTS "Users can create their own presenca" ON public.presenca;
DROP POLICY IF EXISTS "Users can update their own presenca" ON public.presenca;
DROP POLICY IF EXISTS "Users can delete their own presenca" ON public.presenca;

CREATE POLICY "Professors and admins can manage presenca" 
ON public.presenca 
FOR ALL 
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'professor')
);

CREATE POLICY "Alunos can view their own presenca" 
ON public.presenca 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'aluno') AND 
  aluno_id IN (
    SELECT id FROM public.alunos WHERE user_id = auth.uid()
  )
);

-- Matriculas: Only professors and admins can manage
DROP POLICY IF EXISTS "Users can view their own matriculas" ON public.matriculas;
DROP POLICY IF EXISTS "Users can create their own matriculas" ON public.matriculas;
DROP POLICY IF EXISTS "Users can update their own matriculas" ON public.matriculas;
DROP POLICY IF EXISTS "Users can delete their own matriculas" ON public.matriculas;

CREATE POLICY "Professors and admins can manage matriculas" 
ON public.matriculas 
FOR ALL 
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'professor')
);

-- Professores: Only admins can manage
DROP POLICY IF EXISTS "Users can view their own professores" ON public.professores;
DROP POLICY IF EXISTS "Users can create their own professores" ON public.professores;
DROP POLICY IF EXISTS "Users can update their own professores" ON public.professores;
DROP POLICY IF EXISTS "Users can delete their own professores" ON public.professores;

CREATE POLICY "Admins can manage professores" 
ON public.professores 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Professors can view their own profile" 
ON public.professores 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'professor') AND 
  user_id = auth.uid()
);

-- Alunos: Professors and admins can manage
DROP POLICY IF EXISTS "Users can view their own alunos" ON public.alunos;
DROP POLICY IF EXISTS "Users can create their own alunos" ON public.alunos;
DROP POLICY IF EXISTS "Users can update their own alunos" ON public.alunos;
DROP POLICY IF EXISTS "Users can delete their own alunos" ON public.alunos;

CREATE POLICY "Professors and admins can manage alunos" 
ON public.alunos 
FOR ALL 
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'professor')
);

CREATE POLICY "Alunos can view their own profile" 
ON public.alunos 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'aluno') AND 
  user_id = auth.uid()
);

-- Convites: Only admins can manage
DROP POLICY IF EXISTS "Users can view their own convites" ON public.convites;
DROP POLICY IF EXISTS "Users can create convites" ON public.convites;
DROP POLICY IF EXISTS "Users can update their own convites" ON public.convites;
DROP POLICY IF EXISTS "Users can delete their own convites" ON public.convites;

CREATE POLICY "Only admins can manage convites" 
ON public.convites 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Update profiles table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Remove user_role from profiles table as it will be managed by user_roles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS user_role;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid());

-- Update the handle_new_user function to not set roles (roles will be set separately)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;