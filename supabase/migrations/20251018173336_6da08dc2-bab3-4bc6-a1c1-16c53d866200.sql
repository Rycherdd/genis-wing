-- Adicionar campo avaliacao_id aos conteúdos complementares
ALTER TABLE public.conteudos_complementares
ADD COLUMN avaliacao_id UUID REFERENCES public.avaliacoes(id) ON DELETE SET NULL;

-- Adicionar campo conteudo_id nas avaliações para referência reversa (se ainda não existir)
-- Este campo já existe, então não precisa criar

-- Atualizar a função marcar_conteudo_estudado para verificar avaliação
CREATE OR REPLACE FUNCTION public.marcar_conteudo_estudado(
  p_conteudo_id uuid, 
  p_tempo_minutos integer DEFAULT 0, 
  p_concluir boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_pontos INTEGER;
  v_status_atual TEXT;
  v_conteudo RECORD;
  v_avaliacao_id UUID;
  v_aprovado BOOLEAN;
BEGIN
  -- Buscar informações do conteúdo
  SELECT * INTO v_conteudo
  FROM public.conteudos_complementares
  WHERE id = p_conteudo_id;

  -- Se está tentando concluir, verificar se há avaliação vinculada
  IF p_concluir THEN
    -- Verificar se tem avaliação vinculada
    IF v_conteudo.avaliacao_id IS NOT NULL THEN
      -- Verificar se o usuário passou na avaliação
      SELECT EXISTS(
        SELECT 1 
        FROM public.tentativas_avaliacoes 
        WHERE user_id = v_user_id 
        AND avaliacao_id = v_conteudo.avaliacao_id 
        AND aprovado = true
      ) INTO v_aprovado;
      
      -- Se não passou, não pode concluir
      IF NOT v_aprovado THEN
        RAISE EXCEPTION 'Você precisa passar na avaliação antes de concluir este conteúdo';
      END IF;
    END IF;
  END IF;

  -- Inserir ou atualizar progresso
  INSERT INTO public.progresso_conteudos (
    user_id,
    conteudo_id,
    status,
    tempo_estudo,
    primeira_visualizacao,
    ultima_visualizacao,
    concluido_em
  )
  VALUES (
    v_user_id,
    p_conteudo_id,
    CASE WHEN p_concluir THEN 'concluido' ELSE 'em_progresso' END,
    p_tempo_minutos,
    NOW(),
    NOW(),
    CASE WHEN p_concluir THEN NOW() ELSE NULL END
  )
  ON CONFLICT (user_id, conteudo_id)
  DO UPDATE SET
    status = CASE 
      WHEN p_concluir AND progresso_conteudos.status != 'concluido' THEN 'concluido'
      WHEN NOT p_concluir AND progresso_conteudos.status = 'nao_iniciado' THEN 'em_progresso'
      ELSE progresso_conteudos.status
    END,
    tempo_estudo = progresso_conteudos.tempo_estudo + p_tempo_minutos,
    ultima_visualizacao = NOW(),
    concluido_em = CASE 
      WHEN p_concluir AND progresso_conteudos.concluido_em IS NULL THEN NOW()
      ELSE progresso_conteudos.concluido_em
    END,
    updated_at = NOW()
  RETURNING status INTO v_status_atual;

  -- Adicionar pontos se concluiu pela primeira vez
  IF p_concluir AND v_status_atual = 'concluido' THEN
    SELECT status INTO v_status_atual
    FROM public.progresso_conteudos
    WHERE user_id = v_user_id AND conteudo_id = p_conteudo_id;
    
    IF v_status_atual = 'concluido' THEN
      v_pontos := COALESCE(v_conteudo.pontos_estudo, 20);
      PERFORM public.adicionar_pontos(
        v_user_id,
        v_pontos,
        'Conteúdo concluído: ' || v_conteudo.titulo,
        'bonus',
        p_conteudo_id
      );
    END IF;
  END IF;
END;
$function$;