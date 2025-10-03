import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Calcular a data de amanhã
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    console.log("Buscando aulas para:", tomorrowStr);

    // Buscar aulas agendadas para amanhã
    const { data: aulas, error: aulasError } = await supabase
      .from("aulas_agendadas")
      .select(`
        *,
        professores (nome),
        turmas (nome)
      `)
      .eq("data", tomorrowStr)
      .eq("status", "agendada");

    if (aulasError) {
      console.error("Erro ao buscar aulas:", aulasError);
      throw new Error("Erro ao buscar aulas");
    }

    console.log(`Encontradas ${aulas?.length || 0} aulas para amanhã`);

    if (!aulas || aulas.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "Nenhuma aula para amanhã" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Para cada aula, buscar alunos e enviar lembretes
    let totalEmailsSent = 0;

    for (const aula of aulas) {
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
        continue;
      }

      const emailPromises = matriculas?.map(async (matricula: any) => {
        const aluno = matricula.alunos;
        if (!aluno?.email) return;

        const dataFormatada = new Date(aula.data).toLocaleDateString("pt-BR");

        return await resend.emails.send({
          from: "Sistema Escolar <onboarding@resend.dev>",
          to: [aluno.email],
          subject: `Lembrete: Aula Amanhã - ${aula.titulo}`,
          html: `
            <h1>Olá, ${aluno.nome}!</h1>
            <p>Este é um lembrete de que você tem aula amanhã:</p>
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h2 style="margin-top: 0; color: #856404;">${aula.titulo}</h2>
              <p><strong>Turma:</strong> ${aula.turmas?.nome || "N/A"}</p>
              <p><strong>Professor:</strong> ${aula.professores?.nome || "N/A"}</p>
              <p><strong>Data:</strong> ${dataFormatada}</p>
              <p><strong>Horário:</strong> ${aula.horario_inicio} - ${aula.horario_fim}</p>
              ${aula.local ? `<p><strong>Local:</strong> ${aula.local}</p>` : ""}
              ${aula.descricao ? `<p><strong>Descrição:</strong> ${aula.descricao}</p>` : ""}
            </div>
            <p style="color: #856404;">⏰ Não se esqueça! A aula é amanhã.</p>
            <p>Até lá,<br>Equipe Escolar</p>
          `,
        });
      });

      await Promise.all(emailPromises || []);
      totalEmailsSent += matriculas?.length || 0;
      console.log(`Lembretes enviados para ${matriculas?.length || 0} alunos da aula ${aula.titulo}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        aulasProcessadas: aulas.length,
        emailsEnviados: totalEmailsSent 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Erro ao enviar lembretes:", error);
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
