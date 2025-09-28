-- Verificar e adicionar constraint única para evitar matrículas duplicadas
-- Primeiro, vamos ver se já existe alguma constraint similar
DO $$
BEGIN
    -- Adicionar constraint única se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'matriculas' 
        AND constraint_name = 'matriculas_aluno_turma_unique'
    ) THEN
        ALTER TABLE public.matriculas 
        ADD CONSTRAINT matriculas_aluno_turma_unique 
        UNIQUE (aluno_id, turma_id);
    END IF;
END
$$;

-- Verificar se há registros duplicados antes de tentar inserir
-- Esta função vai limpar duplicados se existirem
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY aluno_id, turma_id ORDER BY created_at) as rn
    FROM matriculas
)
DELETE FROM matriculas 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);