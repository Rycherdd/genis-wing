import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  aulaId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { aulaId }: NotificationRequest = await req.json();

    // Buscar informações da aula
    const { data: aula, error: aulaError } = await supabase
      .from("aulas_agendadas")
      .select(`
        *,
        professores (nome),
        turmas (nome)
      `)
      .eq("id", aulaId)
      .single();

    if (aulaError || !aula) {
      console.error("Erro ao buscar aula:", aulaError);
      throw new Error("Aula não encontrada");
    }

    // Buscar alunos matriculados na turma
    const { data: matriculas, error: matriculasError } = await supabase
      .from("matriculas")
      .select(`
        aluno_id,
        alunos (
          nome,
          email
        )
      `)
      .eq("turma_id", aula.turma_id)
      .eq("status", "ativa");

    if (matriculasError) {
      console.error("Erro ao buscar matrículas:", matriculasError);
      throw new Error("Erro ao buscar alunos");
    }

    // Enviar email para cada aluno
    const emailPromises = matriculas?.map(async (matricula: any) => {
      const aluno = matricula.alunos;
      if (!aluno?.email) return;

      const dataFormatada = new Date(aula.data).toLocaleDateString("pt-BR");
      
      return await resend.emails.send({
        from: "Sistema Escolar <onboarding@resend.dev>",
        to: [aluno.email],
        subject: `Nova Aula Agendada: ${aula.titulo}`,
        html: `
          <h1>Olá, ${aluno.nome}!</h1>
          <p>Uma nova aula foi agendada para você:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">${aula.titulo}</h2>
            <p><strong>Turma:</strong> ${aula.turmas?.nome || "N/A"}</p>
            <p><strong>Professor:</strong> ${aula.professores?.nome || "N/A"}</p>
            <p><strong>Data:</strong> ${dataFormatada}</p>
            <p><strong>Horário:</strong> ${aula.horario_inicio} - ${aula.horario_fim}</p>
            ${aula.local ? `<p><strong>Local:</strong> ${aula.local}</p>` : ""}
            ${aula.descricao ? `<p><strong>Descrição:</strong> ${aula.descricao}</p>` : ""}
          </div>
          <p>Não se esqueça de comparecer!</p>
          <p>Até breve,<br>Equipe Escolar</p>
        `,
      });
    });

    await Promise.all(emailPromises || []);

    console.log(`Emails enviados para ${matriculas?.length || 0} alunos`);

    return new Response(
      JSON.stringify({ success: true, alunosNotificados: matriculas?.length || 0 }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Erro ao enviar notificações:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
