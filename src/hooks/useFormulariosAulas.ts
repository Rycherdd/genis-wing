import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Pergunta {
  id: string;
  texto: string;
  tipo: 'texto' | 'multipla_escolha' | 'nota';
  opcoes?: string[];
  obrigatoria: boolean;
}

export interface Formulario {
  id: string;
  aula_id: string;
  titulo: string;
  descricao: string | null;
  perguntas: Pergunta[];
  ativo: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Resposta {
  id: string;
  formulario_id: string;
  aluno_id: string;
  respostas: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function useFormulariosAulas(aulaId?: string) {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFormularios = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('formularios_aulas')
        .select('*')
        .order('created_at', { ascending: false });

      if (aulaId) {
        query = query.eq('aula_id', aulaId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFormularios((data || []).map(item => ({
        ...item,
        perguntas: item.perguntas as unknown as Pergunta[]
      })) as Formulario[]);
    } catch (error) {
      console.error('Erro ao buscar formulários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os formulários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createFormulario = async (formulario: Omit<Formulario, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('formularios_aulas')
        .insert({
          aula_id: formulario.aula_id,
          titulo: formulario.titulo,
          descricao: formulario.descricao,
          perguntas: formulario.perguntas as any,
          ativo: formulario.ativo,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const formattedData = {
        ...data,
        perguntas: data.perguntas as unknown as Pergunta[]
      } as Formulario;

      setFormularios(prev => [formattedData, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Formulário criado com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar formulário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o formulário.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateFormulario = async (id: string, updates: Partial<Formulario>) => {
    if (!user) return;

    try {
      const updateData: any = {};
      if (updates.titulo !== undefined) updateData.titulo = updates.titulo;
      if (updates.descricao !== undefined) updateData.descricao = updates.descricao;
      if (updates.ativo !== undefined) updateData.ativo = updates.ativo;
      if (updates.perguntas !== undefined) updateData.perguntas = updates.perguntas as any;

      const { data, error } = await supabase
        .from('formularios_aulas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const formattedData = {
        ...data,
        perguntas: data.perguntas as unknown as Pergunta[]
      } as Formulario;

      setFormularios(prev => 
        prev.map(form => form.id === id ? formattedData : form)
      );
      toast({
        title: "Sucesso",
        description: "Formulário atualizado com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar formulário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o formulário.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteFormulario = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('formularios_aulas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFormularios(prev => prev.filter(form => form.id !== id));
      toast({
        title: "Sucesso",
        description: "Formulário removido com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao deletar formulário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o formulário.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchFormularios();
    }
  }, [user?.id, aulaId]);

  return {
    formularios,
    loading,
    createFormulario,
    updateFormulario,
    deleteFormulario,
    refetch: fetchFormularios,
  };
}