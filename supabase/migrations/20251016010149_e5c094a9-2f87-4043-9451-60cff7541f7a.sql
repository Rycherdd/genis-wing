-- Permitir que alunos façam download de arquivos das aulas
CREATE POLICY "Alunos podem baixar materiais de suas aulas"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'aula-pdfs' 
  AND EXISTS (
    SELECT 1
    FROM public.aulas_agendadas aa
    JOIN public.matriculas m ON m.turma_id = aa.turma_id
    JOIN public.alunos a ON a.id = m.aluno_id
    WHERE a.user_id = auth.uid()
    AND aa.pdf_url LIKE '%' || storage.objects.name || '%'
    AND m.status = 'ativa'
  )
);

-- Permitir que professores e admins façam upload e gerenciem arquivos
CREATE POLICY "Professores e admins podem gerenciar arquivos"
ON storage.objects FOR ALL
USING (
  bucket_id = 'aula-pdfs' 
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'professor'::public.app_role)
  )
);