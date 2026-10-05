export type Database = {
  public: {
    Tables: {
      pendientes: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          priority: 'low' | 'medium' | 'high'
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string
          priority?: 'low' | 'medium' | 'high'
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string
          priority?: 'low' | 'medium' | 'high'
          is_completed?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
