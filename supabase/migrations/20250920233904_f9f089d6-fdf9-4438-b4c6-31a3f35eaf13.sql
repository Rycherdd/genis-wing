-- Criar tabela de professores
CREATE TABLE public.professores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  especializacao TEXT[],
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'pendente')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de turmas
CREATE TABLE public.turmas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  professor_id UUID REFERENCES public.professores(id) ON DELETE SET NULL,
  max_alunos INTEGER NOT NULL DEFAULT 20,
  data_inicio DATE,
  data_fim DATE,
  status TEXT NOT NULL DEFAULT 'planejada' CHECK (status IN ('ativa', 'planejada', 'concluida', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de aulas
CREATE TABLE public.aulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES public.professores(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  local TEXT,
  status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'em-andamento', 'concluida', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de alunos
CREATE TABLE public.alunos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de matriculas (relacionamento entre alunos e turmas)
CREATE TABLE public.matriculas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  data_matricula DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'cancelada', 'concluida')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(aluno_id, turma_id)
);

-- Criar tabela de presenca
CREATE TABLE public.presenca (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  aula_id UUID NOT NULL REFERENCES public.aulas(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  presente BOOLEAN NOT NULL DEFAULT false,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(aula_id, aluno_id)
);

-- Habilitar Row Level Security
ALTER TABLE public.professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presenca ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para professores
CREATE POLICY "Users can view their own professores" 
ON public.professores 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own professores" 
ON public.professores 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own professores" 
ON public.professores 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own professores" 
ON public.professores 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar políticas RLS para turmas
CREATE POLICY "Users can view their own turmas" 
ON public.turmas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own turmas" 
ON public.turmas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own turmas" 
ON public.turmas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own turmas" 
ON public.turmas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar políticas RLS para aulas
CREATE POLICY "Users can view their own aulas" 
ON public.aulas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own aulas" 
ON public.aulas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own aulas" 
ON public.aulas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own aulas" 
ON public.aulas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar políticas RLS para alunos
CREATE POLICY "Users can view their own alunos" 
ON public.alunos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alunos" 
ON public.alunos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alunos" 
ON public.alunos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alunos" 
ON public.alunos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar políticas RLS para matriculas
CREATE POLICY "Users can view their own matriculas" 
ON public.matriculas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own matriculas" 
ON public.matriculas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matriculas" 
ON public.matriculas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own matriculas" 
ON public.matriculas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar políticas RLS para presenca
CREATE POLICY "Users can view their own presenca" 
ON public.presenca 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own presenca" 
ON public.presenca 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presenca" 
ON public.presenca 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presenca" 
ON public.presenca 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar triggers para updated_at
CREATE TRIGGER update_professores_updated_at
BEFORE UPDATE ON public.professores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_turmas_updated_at
BEFORE UPDATE ON public.turmas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aulas_updated_at
BEFORE UPDATE ON public.aulas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alunos_updated_at
BEFORE UPDATE ON public.alunos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_presenca_updated_at
BEFORE UPDATE ON public.presenca
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX idx_professores_user_id ON public.professores(user_id);
CREATE INDEX idx_professores_email ON public.professores(email);
CREATE INDEX idx_turmas_user_id ON public.turmas(user_id);
CREATE INDEX idx_turmas_professor_id ON public.turmas(professor_id);
CREATE INDEX idx_aulas_user_id ON public.aulas(user_id);
CREATE INDEX idx_aulas_turma_id ON public.aulas(turma_id);
CREATE INDEX idx_aulas_professor_id ON public.aulas(professor_id);
CREATE INDEX idx_aulas_data ON public.aulas(data);
CREATE INDEX idx_alunos_user_id ON public.alunos(user_id);
CREATE INDEX idx_matriculas_user_id ON public.matriculas(user_id);
CREATE INDEX idx_matriculas_aluno_id ON public.matriculas(aluno_id);
CREATE INDEX idx_matriculas_turma_id ON public.matriculas(turma_id);
CREATE INDEX idx_presenca_user_id ON public.presenca(user_id);
CREATE INDEX idx_presenca_aula_id ON public.presenca(aula_id);
CREATE INDEX idx_presenca_aluno_id ON public.presenca(aluno_id);