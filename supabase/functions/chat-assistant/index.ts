import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const tools = [
  {
    type: "function",
    function: {
      name: "buscar_proximas_aulas",
      description: "Busca as próximas aulas agendadas do usuário ou de uma turma específica",
      parameters: {
        type: "object",
        properties: {
          turma_id: {
            type: "string",
            description: "ID da turma (opcional)"
          },
          limit: {
            type: "number",
            description: "Número máximo de aulas a retornar",
            default: 5
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "buscar_turmas",
      description: "Busca informações sobre turmas",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            description: "Status da turma (planejada, em_andamento, concluida)"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "buscar_avisos",
      description: "Busca avisos recentes",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Número máximo de avisos",
            default: 5
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "buscar_progresso",
      description: "Busca o progresso do usuário",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  }
];

async function executarFuncao(functionName: string, args: any, supabase: any, userId: string) {
  console.log(`Executando função: ${functionName} com args:`, args);
  
  switch (functionName) {
    case "buscar_proximas_aulas": {
      const limit = args.limit || 5;
      let query = supabase
        .from('aulas_agendadas')
        .select('*, turmas(nome), professores(nome)')
        .gte('data', new Date().toISOString().split('T')[0])
        .order('data', { ascending: true })
        .order('horario_inicio', { ascending: true })
        .limit(limit);
      
      if (args.turma_id) {
        query = query.eq('turma_id', args.turma_id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
    
    case "buscar_turmas": {
      let query = supabase
        .from('turmas')
        .select('*, professores(nome)');
      
      if (args.status) {
        query = query.eq('status', args.status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
    
    case "buscar_avisos": {
      const limit = args.limit || 5;
      const { data, error } = await supabase
        .from('avisos')
        .select('*')
        .order('data_publicacao', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    }
    
    case "buscar_progresso": {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*, turmas(nome)')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    }
    
    default:
      throw new Error(`Função desconhecida: ${functionName}`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const authHeader = req.headers.get('Authorization');
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Criar cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader! } } }
    );

    // Obter usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

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

    let conversationMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Loop para lidar com tool calls
    while (true) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: conversationMessages,
          tools: tools,
          tool_choice: "auto",
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
        const errorText = await response.text();
        console.error("OpenAI error:", response.status, errorText);
        return new Response(
          JSON.stringify({ error: "Erro ao conectar com o assistente de IA" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message;

      // Se não há tool calls, retornar a resposta
      if (!assistantMessage.tool_calls) {
        const content = assistantMessage.content;
        
        // Criar stream simulado para manter compatibilidade com o frontend
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            const lines = [
              `data: ${JSON.stringify({ choices: [{ delta: { role: 'assistant', content: '' } }] })}\n\n`,
              `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`,
              'data: [DONE]\n\n'
            ];
            
            for (const line of lines) {
              controller.enqueue(encoder.encode(line));
            }
            controller.close();
          }
        });

        return new Response(stream, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }

      // Adicionar mensagem do assistente com tool calls
      conversationMessages.push(assistantMessage);

      // Executar todas as tool calls
      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        try {
          const result = await executarFuncao(functionName, functionArgs, supabase, userId);
          
          conversationMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        } catch (error) {
          console.error(`Erro ao executar ${functionName}:`, error);
          conversationMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: error.message }),
          });
        }
      }
    }

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
