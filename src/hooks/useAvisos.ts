import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type AvisoRow = Database['public']['Tables']['avisos']['Row'];
type AvisoInsert = Database['public']['Tables']['avisos']['Insert'];

type Aviso = AvisoRow & {
  turmas?: { nome: string } | null;
};

export function useAvisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAvisos = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('avisos')
        .select(`
          *,
          turmas (nome)
        `)
        .order('fixado', { ascending: false })
        .order('data_publicacao', { ascending: false });

      if (error) throw error;
      
      setAvisos((data || []) as Aviso[]);
    } catch (error) {
      console.error('Erro ao buscar avisos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os avisos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAviso = async (aviso: Omit<AvisoInsert, 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('avisos')
        .insert({
          ...aviso,
          user_id: user.id,
        })
        .select(`
          *,
          turmas (nome)
        `)
        .single();

      if (error) throw error;

      setAvisos(prev => [data as Aviso, ...prev]);
      toast({
        title: "Sucesso",
        description: "Aviso publicado com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar aviso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível publicar o aviso.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAviso = async (id: string, updates: Partial<AvisoRow>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('avisos')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          turmas (nome)
        `)
        .single();

      if (error) throw error;

      setAvisos(prev => 
        prev.map(aviso => aviso.id === id ? data as Aviso : aviso)
      );
      toast({
        title: "Sucesso",
        description: "Aviso atualizado com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar aviso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o aviso.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAviso = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('avisos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAvisos(prev => prev.filter(aviso => aviso.id !== id));
      toast({
        title: "Sucesso",
        description: "Aviso removido com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao deletar aviso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o aviso.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchAvisos();
      
      // Configurar realtime para atualizações instantâneas
      const channel = supabase
        .channel('avisos-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'avisos'
          },
          () => {
            fetchAvisos();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    avisos,
    loading,
    createAviso,
    updateAviso,
    deleteAviso,
    refetch: fetchAvisos,
  };
}
