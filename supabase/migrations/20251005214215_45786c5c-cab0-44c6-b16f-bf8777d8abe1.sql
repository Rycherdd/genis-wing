-- Add pdf_url column to aulas_agendadas table
ALTER TABLE aulas_agendadas
ADD COLUMN pdf_url text;

-- Create storage bucket for aula PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('aula-pdfs', 'aula-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Allow admins and professors to upload PDFs
CREATE POLICY "Admins and professors can upload aula PDFs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'aula-pdfs' AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'professor'::app_role))
);

-- Allow admins and professors to update PDFs
CREATE POLICY "Admins and professors can update aula PDFs"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'aula-pdfs' AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'professor'::app_role))
);

-- Allow admins and professors to delete PDFs
CREATE POLICY "Admins and professors can delete aula PDFs"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'aula-pdfs' AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'professor'::app_role))
);

-- Allow students to view PDFs from their enrolled classes
CREATE POLICY "Students can view PDFs from their classes"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'aula-pdfs' AND
  (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'professor'::app_role) OR
    (
      has_role(auth.uid(), 'aluno'::app_role) AND
      EXISTS (
        SELECT 1
        FROM aulas_agendadas aa
        JOIN matriculas m ON m.turma_id = aa.turma_id
        JOIN alunos a ON a.id = m.aluno_id
        WHERE 
          a.user_id = auth.uid() AND
          aa.id::text = (storage.foldername(name))[1] AND
          m.status = 'ativa'
      )
    )
  )
);