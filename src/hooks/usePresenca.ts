import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Presenca = Database['public']['Tables']['presenca']['Row'];
type PresencaInsert = Database['public']['Tables']['presenca']['Insert'];

export function usePresenca() {
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPresencas = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('presenca')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPresencas(data || []);
    } catch (error) {
      console.error('Erro ao buscar presenças:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as presenças.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPresencasByAula = async (aulaId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('presenca')
        .select(`
          *,
          alunos (nome, email)
        `)
        .eq('aula_id', aulaId)
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar presenças da aula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as presenças da aula.",
        variant: "destructive",
      });
      return [];
    }
  };

  const marcarPresenca = async (aulaId: string, alunoId: string, presente: boolean, observacoes?: string) => {
    if (!user) return;

    try {
      // Check if presence already exists
      const { data: existingPresenca } = await supabase
        .from('presenca')
        .select('id')
        .eq('aula_id', aulaId)
        .eq('aluno_id', alunoId)
        .eq('user_id', user.id)
        .single();

      if (existingPresenca) {
        // Update existing presence
        const { data, error } = await supabase
          .from('presenca')
          .update({
            presente,
            observacoes: observacoes || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingPresenca.id)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Presença atualizada com sucesso!",
        });
        return data;
      } else {
        // Create new presence record
        const { data, error } = await supabase
          .from('presenca')
          .insert({
            aula_id: aulaId,
            aluno_id: alunoId,
            presente,
            observacoes: observacoes || null,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        setPresencas(prev => [...prev, data]);
        toast({
          title: "Sucesso",
          description: "Presença registrada com sucesso!",
        });
        return data;
      }
    } catch (error) {
      console.error('Erro ao marcar presença:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a presença.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const marcarPresencaLote = async (presencas: { aulaId: string; alunoId: string; presente: boolean; observacoes?: string }[]) => {
    if (!user) return;

    try {
      const promises = presencas.map(({ aulaId, alunoId, presente, observacoes }) =>
        marcarPresenca(aulaId, alunoId, presente, observacoes)
      );

      await Promise.all(promises);
      
      toast({
        title: "Sucesso",
        description: `${presencas.length} presenças registradas com sucesso!`,
      });
    } catch (error) {
      console.error('Erro ao marcar presenças em lote:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar algumas presenças.",
        variant: "destructive",
      });
    }
  };

  const deletePresenca = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('presenca')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setPresencas(prev => prev.filter(presenca => presenca.id !== id));
      toast({
        title: "Sucesso",
        description: "Presença removida com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao deletar presença:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a presença.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPresencas();
  }, [user]);

  return {
    presencas,
    loading,
    marcarPresenca,
    marcarPresencaLote,
    getPresencasByAula,
    deletePresenca,
    refetch: fetchPresencas,
  };
}