-- Fix critical security issues: Block public access to sensitive tables
-- These tables contain PII (emails, phones) and sensitive business data

-- Force RLS on alunos table (contains student emails and phone numbers)
ALTER TABLE public.alunos FORCE ROW LEVEL SECURITY;

-- Force RLS on aulas_agendadas table (contains class schedules and locations)
ALTER TABLE public.aulas_agendadas FORCE ROW LEVEL SECURITY;

-- Force RLS on turmas table (contains business intelligence)
ALTER TABLE public.turmas FORCE ROW LEVEL SECURITY;

-- Force RLS on professores table (contains professor contact info)
ALTER TABLE public.professores FORCE ROW LEVEL SECURITY;

-- Force RLS on matriculas table (contains student enrollment data)
ALTER TABLE public.matriculas FORCE ROW LEVEL SECURITY;