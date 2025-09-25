-- Create convites table for managing invitations
CREATE TABLE public.convites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('aluno', 'professor')),
  user_id UUID NOT NULL, -- quien envía el convite
  invited_by_name TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceito', 'expirado')),
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email, role)
);

-- Enable RLS
ALTER TABLE public.convites ENABLE ROW LEVEL SECURITY;

-- Create policies for convites
CREATE POLICY "Users can create convites" 
ON public.convites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own convites" 
ON public.convites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own convites" 
ON public.convites 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own convites" 
ON public.convites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_convites_updated_at
BEFORE UPDATE ON public.convites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add role column to profiles table to track user types
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_role TEXT DEFAULT 'user' CHECK (user_role IN ('admin', 'professor', 'aluno', 'user'));