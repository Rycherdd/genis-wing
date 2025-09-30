-- Remover colunas do GitHub e Twitter
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS github_url,
DROP COLUMN IF EXISTS twitter_url;

-- Adicionar coluna do Instagram
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS instagram_url TEXT;