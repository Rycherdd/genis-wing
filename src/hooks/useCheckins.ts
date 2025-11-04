import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Checkin {
  id: string;
  aula_id: string;
  aluno_id: string;
  user_id: string;
  checkin_at: string;
  observacao?: string;
  created_at: string;
  updated_at: string;
  alunos?: {
    nome: string;
    email: string;
  };
  aulas_agendadas?: {
    titulo: string;
    data: string;
    horario_inicio: string;
  };
}

export function useCheckins(aulaId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: checkins, isLoading, error: queryError } = useQuery({
    queryKey: ["checkins", aulaId],
    queryFn: async () => {
      console.log("🔍 Buscando check-ins...", { aulaId });
      
      // Verificar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      console.log("👤 Usuário atual:", user?.email);
      
      // Verificar role do usuário
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id || "")
        .single();
      console.log("🎭 Role do usuário:", roleData?.role);
      
      let query = supabase
        .from("checkins")
        .select(`
          *,
          alunos(nome, email),
          aulas_agendadas(titulo, data, horario_inicio)
        `)
        .order("checkin_at", { ascending: false });

      if (aulaId) {
        query = query.eq("aula_id", aulaId);
      }

      const { data, error } = await query;
      if (error) {
        console.error("❌ Erro ao buscar check-ins:", error);
        toast({
          title: "Erro ao carregar check-ins",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      console.log("✅ Check-ins carregados:", data?.length || 0, data);
      
      // Verificar se os dados de alunos estão vindo
      if (data && data.length > 0) {
        console.log("📋 Primeiro check-in completo:", JSON.stringify(data[0], null, 2));
        console.log("👤 Dados do aluno no primeiro check-in:", data[0].alunos);
      }
      
      return data as Checkin[];
    },
  });

  const fazerCheckin = useMutation({
    mutationFn: async ({ aulaId, alunoId, observacao }: { 
      aulaId: string; 
      alunoId: string;
      observacao?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("checkins").insert({
        aula_id: aulaId,
        aluno_id: alunoId,
        user_id: user.id,
        observacao,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkins"] });
      toast({
        title: "Check-in realizado!",
        description: "Você foi registrado na aula com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao fazer check-in",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  const removerCheckin = useMutation({
    mutationFn: async (checkinId: string) => {
      const { error } = await supabase
        .from("checkins")
        .delete()
        .eq("id", checkinId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkins"] });
      toast({
        title: "Check-in removido",
        description: "O check-in foi removido com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover check-in",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    checkins,
    isLoading,
    fazerCheckin: fazerCheckin.mutate,
    removerCheckin: removerCheckin.mutate,
    isFazendoCheckin: fazerCheckin.isPending,
  };
}
