-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Agendar envio diário de lembretes de aulas
-- Executa todos os dias às 18:00 (horário do servidor)
SELECT cron.schedule(
  'send-daily-aula-reminders',
  '0 18 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://kgkjrxwoojykdebtgutf.supabase.co/functions/v1/send-aula-reminder',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtna2pyeHdvb2p5a2RlYnRndXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzY2OTcsImV4cCI6MjA3Mzk1MjY5N30.MJRmYLNO7Cwfg_rhLza1ukwS-h5jLSKYTaYZ7VSfF-g"}'::jsonb,
      body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);