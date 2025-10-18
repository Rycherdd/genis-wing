import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const systemPrompt = `Você é um assistente educacional especializado em ajudar professores, alunos e administradores com o sistema de gerenciamento educacional.

SOBRE O SISTEMA:
- Sistema para gestão de turmas, aulas, conteúdos complementares e avaliações
- Suporta 3 tipos de usuários: Administradores, Professores e Alunos
- Possui gamificação com pontos, níveis, badges e leaderboard
- Permite criação de conteúdos complementares (vídeos, exercícios, links, PDFs)
- Sistema de avaliações com questões de múltipla escolha
- Controle de presença e progresso dos alunos

FUNCIONALIDADES PRINCIPAIS:
1. Administradores:
   - Gerenciar usuários (criar professores e alunos via convites)
   - Criar e gerenciar turmas
   - Agendar aulas
   - Criar avisos
   - Visualizar estatísticas gerais

2. Professores:
   - Gerenciar turmas e alunos
   - Agendar aulas
   - Registrar presença
   - Criar formulários de aula
   - Criar conteúdos complementares
   - Criar avaliações
   - Visualizar progresso dos alunos

3. Alunos:
   - Visualizar suas turmas e aulas
   - Acessar conteúdos complementares
   - Fazer avaliações
   - Responder formulários
   - Ver seu progresso e gamificação
   - Competir no leaderboard

GAMIFICAÇÃO:
- Pontos ganhos por: presença (10pts), formulários (15pts), conteúdos concluídos (20pts), avaliações
- Sistema de níveis com XP
- Badges por conquistas (presença, formulários, horas de estudo, streak)
- Leaderboard competitivo

Sua função é ajudar os usuários a entender como usar o sistema, responder dúvidas sobre funcionalidades, dar dicas e explicar processos. Seja claro, objetivo e amigável.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione fundos ao seu workspace Lovable AI." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao conectar com o assistente de IA" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
