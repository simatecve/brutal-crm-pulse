export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clientes: {
        Row: {
          created_at: string
          direccion: string | null
          email: string | null
          empresa: string | null
          estado: string | null
          id: string
          nombre: string
          telefono: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          direccion?: string | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          id?: string
          nombre: string
          telefono?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          direccion?: string | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          id?: string
          nombre?: string
          telefono?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      comentarios_tareas: {
        Row: {
          comentario: string
          created_at: string
          id: string
          tarea_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comentario: string
          created_at?: string
          id?: string
          tarea_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comentario?: string
          created_at?: string
          id?: string
          tarea_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_tareas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracion_sistema: {
        Row: {
          copyright: string
          created_at: string
          id: string
          nombre_sistema: string
          updated_at: string
          version: string
        }
        Insert: {
          copyright?: string
          created_at?: string
          id?: string
          nombre_sistema?: string
          updated_at?: string
          version?: string
        }
        Update: {
          copyright?: string
          created_at?: string
          id?: string
          nombre_sistema?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      propuestas: {
        Row: {
          cliente_id: string | null
          created_at: string
          descripcion: string | null
          estado: string | null
          fecha_envio: string | null
          fecha_vencimiento: string | null
          id: string
          monto: number | null
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          descripcion?: string | null
          estado?: string | null
          fecha_envio?: string | null
          fecha_vencimiento?: string | null
          id?: string
          monto?: number | null
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          descripcion?: string | null
          estado?: string | null
          fecha_envio?: string | null
          fecha_vencimiento?: string | null
          id?: string
          monto?: number | null
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "propuestas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      proyectos: {
        Row: {
          cliente_id: string | null
          created_at: string
          descripcion: string | null
          estado: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          nombre: string
          presupuesto: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          descripcion?: string | null
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre: string
          presupuesto?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          descripcion?: string | null
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre?: string
          presupuesto?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proyectos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      sesiones_tiempo: {
        Row: {
          created_at: string
          estado: string | null
          fin: string | null
          id: string
          inicio: string
          tarea_id: string | null
          tiempo_transcurrido: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          estado?: string | null
          fin?: string | null
          id?: string
          inicio?: string
          tarea_id?: string | null
          tiempo_transcurrido?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          estado?: string | null
          fin?: string | null
          id?: string
          inicio?: string
          tarea_id?: string | null
          tiempo_transcurrido?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sesiones_tiempo_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
        ]
      }
      sugerencias: {
        Row: {
          categoria: string
          created_at: string
          descripcion: string
          estado: string
          id: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          categoria?: string
          created_at?: string
          descripcion: string
          estado?: string
          id?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          categoria?: string
          created_at?: string
          descripcion?: string
          estado?: string
          id?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tareas: {
        Row: {
          created_at: string
          descripcion: string | null
          estado: string | null
          fecha_vencimiento: string | null
          id: string
          prioridad: string | null
          proyecto_id: string | null
          tiempo_estimado: number | null
          tiempo_registrado: number | null
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          estado?: string | null
          fecha_vencimiento?: string | null
          id?: string
          prioridad?: string | null
          proyecto_id?: string | null
          tiempo_estimado?: number | null
          tiempo_registrado?: number | null
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          estado?: string | null
          fecha_vencimiento?: string | null
          id?: string
          prioridad?: string | null
          proyecto_id?: string | null
          tiempo_estimado?: number | null
          tiempo_registrado?: number | null
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tareas_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          created_at: string
          descripcion: string | null
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          proyecto_id: string | null
          tarea_id: string | null
          tiempo_minutos: number
          user_id: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          proyecto_id?: string | null
          tarea_id?: string | null
          tiempo_minutos: number
          user_id: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          proyecto_id?: string | null
          tarea_id?: string | null
          tiempo_minutos?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
