export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alunos: {
        Row: {
          created_at: string
          email: string
          id: string
          nome: string
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      aulas: {
        Row: {
          arquivoPath: string | null
          atualizadoEm: string | null
          conceitoCentral: string | null
          conteudo: string | null
          criadoEm: string | null
          descricao: string | null
          duracaoMinutos: number | null
          id: string
          moduloId: string
          numero: number
          objetivo: string | null
          ordem: number
          search_vector: unknown | null
          titulo: string
        }
        Insert: {
          arquivoPath?: string | null
          atualizadoEm?: string | null
          conceitoCentral?: string | null
          conteudo?: string | null
          criadoEm?: string | null
          descricao?: string | null
          duracaoMinutos?: number | null
          id?: string
          moduloId: string
          numero: number
          objetivo?: string | null
          ordem: number
          search_vector?: unknown | null
          titulo: string
        }
        Update: {
          arquivoPath?: string | null
          atualizadoEm?: string | null
          conceitoCentral?: string | null
          conteudo?: string | null
          criadoEm?: string | null
          descricao?: string | null
          duracaoMinutos?: number | null
          id?: string
          moduloId?: string
          numero?: number
          objetivo?: string | null
          ordem?: number
          search_vector?: unknown | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "aulas_moduloId_fkey"
            columns: ["moduloId"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      aulas_agendadas: {
        Row: {
          created_at: string
          data: string
          descricao: string | null
          horario_fim: string
          horario_inicio: string
          id: string
          local: string | null
          pdf_url: string | null
          professor_id: string
          status: string
          titulo: string
          turma_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: string
          descricao?: string | null
          horario_fim: string
          horario_inicio: string
          id?: string
          local?: string | null
          pdf_url?: string | null
          professor_id: string
          status?: string
          titulo: string
          turma_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          descricao?: string | null
          horario_fim?: string
          horario_inicio?: string
          id?: string
          local?: string | null
          pdf_url?: string | null
          professor_id?: string
          status?: string
          titulo?: string
          turma_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aulas_agendadas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aulas_agendadas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aulas_agendadas_professor"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aulas_agendadas_turma"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          ativa: boolean | null
          conteudo_id: string | null
          created_at: string | null
          created_by: string
          descricao: string | null
          id: string
          nota_minima: number | null
          pontos_totais: number
          questoes: Json
          tempo_limite: number | null
          tentativas_permitidas: number | null
          titulo: string
          turma_id: string | null
          updated_at: string | null
        }
        Insert: {
          ativa?: boolean | null
          conteudo_id?: string | null
          created_at?: string | null
          created_by: string
          descricao?: string | null
          id?: string
          nota_minima?: number | null
          pontos_totais: number
          questoes: Json
          tempo_limite?: number | null
          tentativas_permitidas?: number | null
          titulo: string
          turma_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ativa?: boolean | null
          conteudo_id?: string | null
          created_at?: string | null
          created_by?: string
          descricao?: string | null
          id?: string
          nota_minima?: number | null
          pontos_totais?: number
          questoes?: Json
          tempo_limite?: number | null
          tentativas_permitidas?: number | null
          titulo?: string
          turma_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_conteudo_id_fkey"
            columns: ["conteudo_id"]
            isOneToOne: false
            referencedRelation: "conteudos_complementares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      avisos: {
        Row: {
          conteudo: string
          created_at: string
          data_expiracao: string | null
          data_publicacao: string
          fixado: boolean
          id: string
          prioridade: string
          titulo: string
          turma_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          data_expiracao?: string | null
          data_publicacao?: string
          fixado?: boolean
          id?: string
          prioridade?: string
          titulo: string
          turma_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          data_expiracao?: string | null
          data_publicacao?: string
          fixado?: boolean
          id?: string
          prioridade?: string
          titulo?: string
          turma_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avisos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      avisos_lidos: {
        Row: {
          aviso_id: string
          created_at: string
          id: string
          lido_em: string
          user_id: string
        }
        Insert: {
          aviso_id: string
          created_at?: string
          id?: string
          lido_em?: string
          user_id: string
        }
        Update: {
          aviso_id?: string
          created_at?: string
          id?: string
          lido_em?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avisos_lidos_aviso_id_fkey"
            columns: ["aviso_id"]
            isOneToOne: false
            referencedRelation: "avisos"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          cor: string | null
          created_at: string | null
          descricao: string
          icone: string
          id: string
          nome: string
          pontos_bonus: number | null
          requisito: Json
          tipo: string
        }
        Insert: {
          cor?: string | null
          created_at?: string | null
          descricao: string
          icone: string
          id?: string
          nome: string
          pontos_bonus?: number | null
          requisito: Json
          tipo: string
        }
        Update: {
          cor?: string | null
          created_at?: string | null
          descricao?: string
          icone?: string
          id?: string
          nome?: string
          pontos_bonus?: number | null
          requisito?: Json
          tipo?: string
        }
        Relationships: []
      }
      conteudos_complementares: {
        Row: {
          conteudo: string
          created_at: string | null
          created_by: string
          descricao: string | null
          duracao_estimada: number | null
          id: string
          modulo: string | null
          pontos_estudo: number | null
          pontos_revisao: number | null
          tags: string[] | null
          tipo: string
          titulo: string
          turma_id: string | null
          updated_at: string | null
        }
        Insert: {
          conteudo: string
          created_at?: string | null
          created_by: string
          descricao?: string | null
          duracao_estimada?: number | null
          id?: string
          modulo?: string | null
          pontos_estudo?: number | null
          pontos_revisao?: number | null
          tags?: string[] | null
          tipo: string
          titulo: string
          turma_id?: string | null
          updated_at?: string | null
        }
        Update: {
          conteudo?: string
          created_at?: string | null
          created_by?: string
          descricao?: string | null
          duracao_estimada?: number | null
          id?: string
          modulo?: string | null
          pontos_estudo?: number | null
          pontos_revisao?: number | null
          tags?: string[] | null
          tipo?: string
          titulo?: string
          turma_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conteudos_complementares_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      convites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by_name: string | null
          role: string
          status: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by_name?: string | null
          role: string
          status?: string
          token?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by_name?: string | null
          role?: string
          status?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      formularios_aulas: {
        Row: {
          ativo: boolean
          aula_id: string
          created_at: string
          created_by: string
          descricao: string | null
          id: string
          perguntas: Json
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          aula_id: string
          created_at?: string
          created_by: string
          descricao?: string | null
          id?: string
          perguntas?: Json
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          aula_id?: string
          created_at?: string
          created_by?: string
          descricao?: string | null
          id?: string
          perguntas?: Json
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "formularios_aulas_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas_agendadas"
            referencedColumns: ["id"]
          },
        ]
      }
      matriculas: {
        Row: {
          aluno_id: string
          created_at: string
          data_matricula: string
          id: string
          status: string
          turma_id: string
          user_id: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data_matricula?: string
          id?: string
          status?: string
          turma_id: string
          user_id: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data_matricula?: string
          id?: string
          status?: string
          turma_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matriculas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matriculas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      modulos: {
        Row: {
          atualizadoEm: string | null
          criadoEm: string | null
          descricao: string | null
          duracaoHoras: number | null
          id: string
          nome: string
          objetivo: string | null
          ordem: number
          titulo: string
        }
        Insert: {
          atualizadoEm?: string | null
          criadoEm?: string | null
          descricao?: string | null
          duracaoHoras?: number | null
          id?: string
          nome: string
          objetivo?: string | null
          ordem: number
          titulo: string
        }
        Update: {
          atualizadoEm?: string | null
          criadoEm?: string | null
          descricao?: string | null
          duracaoHoras?: number | null
          id?: string
          nome?: string
          objetivo?: string | null
          ordem?: number
          titulo?: string
        }
        Relationships: []
      }
      pontos_historico: {
        Row: {
          created_at: string | null
          id: string
          motivo: string
          pontos: number
          referencia_id: string | null
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          motivo: string
          pontos: number
          referencia_id?: string | null
          tipo: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          motivo?: string
          pontos?: number
          referencia_id?: string | null
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      presenca: {
        Row: {
          aluno_id: string
          aula_id: string
          created_at: string
          id: string
          observacoes: string | null
          presente: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          aluno_id: string
          aula_id: string
          created_at?: string
          id?: string
          observacoes?: string | null
          presente?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          aluno_id?: string
          aula_id?: string
          created_at?: string
          id?: string
          observacoes?: string | null
          presente?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_presenca_aula_agendada"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas_agendadas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presenca_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      professores: {
        Row: {
          created_at: string
          email: string
          especializacao: string[] | null
          id: string
          nivel_mentoria: Database["public"]["Enums"]["nivel_mentoria"] | null
          nome: string
          status: string
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          especializacao?: string[] | null
          id?: string
          nivel_mentoria?: Database["public"]["Enums"]["nivel_mentoria"] | null
          nome: string
          status?: string
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          especializacao?: string[] | null
          id?: string
          nivel_mentoria?: Database["public"]["Enums"]["nivel_mentoria"] | null
          nome?: string
          status?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      progresso_conteudos: {
        Row: {
          concluido_em: string | null
          conteudo_id: string
          created_at: string | null
          id: string
          primeira_visualizacao: string | null
          status: string
          tempo_estudo: number | null
          ultima_visualizacao: string | null
          updated_at: string | null
          user_id: string
          vezes_revisado: number | null
        }
        Insert: {
          concluido_em?: string | null
          conteudo_id: string
          created_at?: string | null
          id?: string
          primeira_visualizacao?: string | null
          status?: string
          tempo_estudo?: number | null
          ultima_visualizacao?: string | null
          updated_at?: string | null
          user_id: string
          vezes_revisado?: number | null
        }
        Update: {
          concluido_em?: string | null
          conteudo_id?: string
          created_at?: string | null
          id?: string
          primeira_visualizacao?: string | null
          status?: string
          tempo_estudo?: number | null
          ultima_visualizacao?: string | null
          updated_at?: string | null
          user_id?: string
          vezes_revisado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "progresso_conteudos_conteudo_id_fkey"
            columns: ["conteudo_id"]
            isOneToOne: false
            referencedRelation: "conteudos_complementares"
            referencedColumns: ["id"]
          },
        ]
      }
      respostas_formularios: {
        Row: {
          aluno_id: string
          created_at: string
          formulario_id: string
          id: string
          respostas: Json
          updated_at: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          formulario_id: string
          id?: string
          respostas?: Json
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          formulario_id?: string
          id?: string
          respostas?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "respostas_formularios_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_formularios_formulario_id_fkey"
            columns: ["formulario_id"]
            isOneToOne: false
            referencedRelation: "formularios_aulas"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          atualizadoEm: string | null
          cor: string | null
          criadoEm: string | null
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          atualizadoEm?: string | null
          cor?: string | null
          criadoEm?: string | null
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          atualizadoEm?: string | null
          cor?: string | null
          criadoEm?: string | null
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      tentativas_avaliacoes: {
        Row: {
          aprovado: boolean
          avaliacao_id: string
          created_at: string | null
          finalizado_em: string | null
          id: string
          iniciado_em: string | null
          nota: number
          pontos_ganhos: number | null
          respostas: Json
          tempo_gasto: number | null
          user_id: string
        }
        Insert: {
          aprovado: boolean
          avaliacao_id: string
          created_at?: string | null
          finalizado_em?: string | null
          id?: string
          iniciado_em?: string | null
          nota: number
          pontos_ganhos?: number | null
          respostas: Json
          tempo_gasto?: number | null
          user_id: string
        }
        Update: {
          aprovado?: boolean
          avaliacao_id?: string
          created_at?: string | null
          finalizado_em?: string | null
          id?: string
          iniciado_em?: string | null
          nota?: number
          pontos_ganhos?: number | null
          respostas?: Json
          tempo_gasto?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tentativas_avaliacoes_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          max_alunos: number
          nome: string
          professor_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          max_alunos?: number
          nome: string
          professor_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          max_alunos?: number
          nome?: string
          professor_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          conquistado_em: string | null
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          conquistado_em?: string | null
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          conquistado_em?: string | null
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gamification: {
        Row: {
          created_at: string | null
          id: string
          melhor_streak: number | null
          nivel: number | null
          pontos_totais: number | null
          streak_atual: number | null
          ultima_atividade: string | null
          updated_at: string | null
          user_id: string
          xp_atual: number | null
          xp_proximo_nivel: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          melhor_streak?: number | null
          nivel?: number | null
          pontos_totais?: number | null
          streak_atual?: number | null
          ultima_atividade?: string | null
          updated_at?: string | null
          user_id: string
          xp_atual?: number | null
          xp_proximo_nivel?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          melhor_streak?: number | null
          nivel?: number | null
          pontos_totais?: number | null
          streak_atual?: number | null
          ultima_atividade?: string | null
          updated_at?: string | null
          user_id?: string
          xp_atual?: number | null
          xp_proximo_nivel?: number | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          aulas_assistidas: number | null
          created_at: string | null
          formularios_respondidos: number | null
          horas_aprendizado: number | null
          id: string
          taxa_presenca: number | null
          turma_id: string
          ultima_atividade: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          aulas_assistidas?: number | null
          created_at?: string | null
          formularios_respondidos?: number | null
          horas_aprendizado?: number | null
          id?: string
          taxa_presenca?: number | null
          turma_id: string
          ultima_atividade?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          aulas_assistidas?: number | null
          created_at?: string | null
          formularios_respondidos?: number | null
          horas_aprendizado?: number | null
          id?: string
          taxa_presenca?: number | null
          turma_id?: string
          ultima_atividade?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adicionar_pontos: {
        Args: {
          p_motivo: string
          p_pontos: number
          p_referencia_id?: string
          p_tipo: string
          p_user_id: string
        }
        Returns: undefined
      }
      atualizar_streak: {
        Args: { p_data: string; p_user_id: string }
        Returns: undefined
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      marcar_conteudo_estudado: {
        Args: {
          p_concluir?: boolean
          p_conteudo_id: string
          p_tempo_minutos?: number
        }
        Returns: undefined
      }
      marcar_revisao: {
        Args: { p_conteudo_id: string }
        Returns: undefined
      }
      verificar_badges: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "professor" | "aluno"
      nivel_mentoria:
        | "aprendiz"
        | "semeador"
        | "criador"
        | "mestre"
        | "lider_empresario"
        | "guardiao_socio"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "professor", "aluno"],
      nivel_mentoria: [
        "aprendiz",
        "semeador",
        "criador",
        "mestre",
        "lider_empresario",
        "guardiao_socio",
      ],
    },
  },
} as const
