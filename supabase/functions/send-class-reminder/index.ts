import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  aulaId: string;
  hoursBeforeClass: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { aulaId, hoursBeforeClass }: ReminderRequest = await req.json();

    console.log(`Enviando lembretes para aula ${aulaId}, ${hoursBeforeClass}h antes`);

    // Buscar informações da aula
    const { data: aula, error: aulaError } = await supabase
      .from("aulas_agendadas")
      .select(`
        *,
        turmas!aulas_agendadas_turma_id_fkey (nome),
        professores!aulas_agendadas_professor_id_fkey (nome)
      `)
      .eq("id", aulaId)
      .single();

    if (aulaError || !aula) {
      throw new Error("Aula não encontrada");
    }

    // Buscar alunos matriculados na turma
    const { data: matriculas, error: matriculasError } = await supabase
      .from("matriculas")
      .select(`
        alunos!matriculas_aluno_id_fkey (
          email,
          nome
        )
      `)
      .eq("turma_id", aula.turma_id)
      .eq("status", "ativa");

    if (matriculasError || !matriculas) {
      throw new Error("Erro ao buscar alunos");
    }

    const dataAula = new Date(aula.data);
    const dataFormatada = dataAula.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Enviar e-mail para cada aluno
    const emailPromises = matriculas.map(async (matricula: any) => {
      const aluno = matricula.alunos;
      
      if (!aluno?.email) return null;

      try {
        const emailResult = await resend.emails.send({
          from: "iCompany <onboarding@resend.dev>",
          to: [aluno.email],
          subject: `Lembrete: Aula em ${hoursBeforeClass}h - ${aula.titulo}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                  .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                  .info-item { margin: 10px 0; }
                  .label { font-weight: bold; color: #667eea; }
                  .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                  .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🔔 Lembrete de Aula</h1>
                  </div>
                  <div class="content">
                    <p>Olá, ${aluno.nome}!</p>
                    <p>Este é um lembrete de que você tem uma aula em <strong>${hoursBeforeClass} horas</strong>.</p>
                    
                    <div class="info-box">
                      <div class="info-item">
                        <span class="label">📚 Aula:</span> ${aula.titulo}
                      </div>
                      <div class="info-item">
                        <span class="label">👨‍🏫 Professor:</span> ${(aula.professores as any)?.nome || "Não definido"}
                      </div>
                      <div class="info-item">
                        <span class="label">🎓 Turma:</span> ${(aula.turmas as any)?.nome || "Não definida"}
                      </div>
                      <div class="info-item">
                        <span class="label">📅 Data:</span> ${dataFormatada}
                      </div>
                      <div class="info-item">
                        <span class="label">⏰ Horário:</span> ${aula.horario_inicio} - ${aula.horario_fim}
                      </div>
                      ${aula.local ? `<div class="info-item"><span class="label">📍 Local:</span> ${aula.local}</div>` : ""}
                      ${aula.descricao ? `<div class="info-item"><span class="label">📝 Descrição:</span> ${aula.descricao}</div>` : ""}
                    </div>

                    <p><strong>💡 Dica:</strong> Prepare seus materiais e chegue com alguns minutos de antecedência!</p>
                    
                    <p style="margin-top: 30px;">Nos vemos em breve!</p>
                    <p>Equipe iCompany</p>
                  </div>
                  <div class="footer">
                    <p>Este é um e-mail automático. Por favor, não responda.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });

        console.log(`E-mail enviado para ${aluno.email}:`, emailResult);
        return emailResult;
      } catch (error) {
        console.error(`Erro ao enviar e-mail para ${aluno.email}:`, error);
        return null;
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter((r) => r !== null).length;

    console.log(`${successCount} e-mails enviados com sucesso de ${matriculas.length} total`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${successCount} lembretes enviados`,
        total: matriculas.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Erro na função:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
