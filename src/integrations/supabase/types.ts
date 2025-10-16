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
