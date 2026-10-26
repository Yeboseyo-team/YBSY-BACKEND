// ⚠ 자동 생성 파일: 스키마를 바꾸면 다시 생성하세요. (2026-10-26 서울 프로젝트 기준)
//   supabase gen types typescript --project-id hxnaobwybllgdcvnwimo > src/types/database.ts
// 아래쪽 "편의 타입"은 손으로 추가한 부분이라 재생성 후 다시 붙여 주세요.

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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ai_usage: {
        Row: {
          count: number
          day: string
          user_id: string
        }
        Insert: {
          count?: number
          day: string
          user_id: string
        }
        Update: {
          count?: number
          day?: string
          user_id?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          apply_end: string
          apply_start: string
          default_study_hours: number
          exam_date: string
          id: string
          name: string
          owner_id: string | null
          prep_weeks: number
          round: string
          source_url: string | null
        }
        Insert: {
          apply_end: string
          apply_start: string
          default_study_hours?: number
          exam_date: string
          id?: string
          name: string
          owner_id?: string | null
          prep_weeks: number
          round: string
          source_url?: string | null
        }
        Update: {
          apply_end?: string
          apply_start?: string
          default_study_hours?: number
          exam_date?: string
          id?: string
          name?: string
          owner_id?: string | null
          prep_weeks?: number
          round?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      plan_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      plans: {
        Row: {
          category_id: string | null
          created_at: string
          credits: number | null
          end_date: string | null
          end_week: number
          hours_per_week: number
          id: string
          load_level: string
          priority: string
          start_date: string | null
          start_week: number
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          credits?: number | null
          end_date?: string | null
          end_week: number
          hours_per_week: number
          id?: string
          load_level?: string
          priority?: string
          start_date?: string | null
          start_week: number
          title: string
          type: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          credits?: number | null
          end_date?: string | null
          end_week?: number
          hours_per_week?: number
          id?: string
          load_level?: string
          priority?: string
          start_date?: string | null
          start_week?: number
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plans_category_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "plan_categories"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          available_hours: number | null
          created_at: string
          daily_hours: number[] | null
          display_name: string | null
          final_week: number
          midterm_week: number
          privacy_agreed_at: string | null
          semester_start: string | null
          study_style: string
          updated_at: string
          user_id: string
        }
        Insert: {
          available_hours?: number | null
          created_at?: string
          daily_hours?: number[] | null
          display_name?: string | null
          final_week?: number
          midterm_week?: number
          privacy_agreed_at?: string | null
          semester_start?: string | null
          study_style?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          available_hours?: number | null
          created_at?: string
          daily_hours?: number[] | null
          display_name?: string | null
          final_week?: number
          midterm_week?: number
          privacy_agreed_at?: string | null
          semester_start?: string | null
          study_style?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_logs: {
        Row: {
          certificate_id: string | null
          created_at: string
          date: string
          hours: number
          id: string
          plan_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          certificate_id?: string | null
          created_at?: string
          date: string
          hours: number
          id?: string
          plan_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          certificate_id?: string | null
          created_at?: string
          date?: string
          hours?: number
          id?: string
          plan_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_certificates: {
        Row: {
          certificate_id: string
          notified_at: string | null
          prep_weeks: number
          study_hours: number
          user_id: string
        }
        Insert: {
          certificate_id: string
          notified_at?: string | null
          prep_weeks: number
          study_hours?: number
          user_id?: string
        }
        Update: {
          certificate_id?: string
          notified_at?: string | null
          prep_weeks?: number
          study_hours?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_certificates_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "certificates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_ai_quota: { Args: never; Returns: number }
      hook_google_only_signup: { Args: { event: Json }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ── 편의 타입 (손으로 추가) ─────────────────────────
export type Profile = Tables<"profiles">
export type Plan = Tables<"plans">
export type Certificate = Tables<"certificates">
export type UserCertificate = Tables<"user_certificates">
export type PlanCategory = Tables<"plan_categories">
export type StudyLogRow = Tables<"study_logs">
/** plans.type, plans.load_level 은 DB에서 text + check 라서 생성 타입이 string 입니다. 화면에서는 아래 타입으로 좁혀 쓰세요. */
/** custom = 사용자가 만든 유형(plan_categories). 10/24 QA */
export type PlanType = "class" | "activity" | "project" | "custom"
export type PlanLoadLevel = "low" | "normal" | "high" | "custom"
/** 계획 우선순위 (10/24 QA). 폭풍 주에는 low 부터 줄이라고 안내 */
export type PlanPriority = "high" | "normal" | "low"
