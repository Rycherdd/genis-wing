import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Resposta } from './useFormulariosAulas';

export function useRespostasFormularios(formularioId?: string) {
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [minhaResposta, setMinhaResposta] = useState<Resposta | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRespostas = async () => {
    if (!user || !formularioId) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('respostas_formularios')
        .select('*')
        .eq('formulario_id', formularioId);

      if (error) throw error;
      setRespostas((data || []) as Resposta[]);
    } catch (error) {
      console.error('Erro ao buscar respostas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMinhaResposta = async () => {
    if (!user || !formularioId) return;
    
    try {
      // Buscar o aluno_id do usuário logado
      const { data: alunoData } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!alunoData) return;

      const { data, error } = await supabase
        .from('respostas_formularios')
        .select('*')
        .eq('formulario_id', formularioId)
        .eq('aluno_id', alunoData.id)
        .maybeSingle();

      if (error) throw error;
      setMinhaResposta(data as Resposta | null);
    } catch (error) {
      console.error('Erro ao buscar minha resposta:', error);
    }
  };

  const submitResposta = async (respostas: Record<string, any>) => {
    if (!user || !formularioId) return;

    try {
      // Buscar o aluno_id do usuário logado
      const { data: alunoData } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!alunoData) {
        throw new Error('Aluno não encontrado');
      }

      const { data, error } = await supabase
        .from('respostas_formularios')
        .upsert({
          formulario_id: formularioId,
          aluno_id: alunoData.id,
          respostas,
        })
        .select()
        .single();

      if (error) throw error;

      setMinhaResposta(data as Resposta);
      
      toast({
        title: "Sucesso",
        description: "Resposta enviada com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a resposta.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user && formularioId) {
      fetchRespostas();
      fetchMinhaResposta();
    }
  }, [user?.id, formularioId]);

  return {
    respostas,
    minhaResposta,
    loading,
    submitResposta,
    refetch: () => {
      fetchRespostas();
      fetchMinhaResposta();
    },
  };
}