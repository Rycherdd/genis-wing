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

  const { data: checkins, isLoading } = useQuery({
    queryKey: ["checkins", aulaId],
    queryFn: async () => {
      let query = supabase
        .from("checkins")
        .select(`
          *,
          alunos!checkins_aluno_id_fkey(nome, email),
          aulas_agendadas!checkins_aula_id_fkey(titulo, data, horario_inicio)
        `)
        .order("checkin_at", { ascending: false });

      if (aulaId) {
        query = query.eq("aula_id", aulaId);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Erro ao buscar check-ins:", error);
        throw error;
      }
      console.log("Check-ins carregados:", data);
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
