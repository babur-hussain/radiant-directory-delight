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
      addresses: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          id: string
          state: string | null
          street: string | null
          updated_at: string | null
          user_id: string | null
          zip_code: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          state?: string | null
          street?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          state?: string | null
          street?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          category: string | null
          created_at: string | null
          description: string | null
          email: string | null
          featured: boolean | null
          hours: Json | null
          id: number
          image: string | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          rating: number | null
          reviews: number | null
          tags: string[] | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          featured?: boolean | null
          hours?: Json | null
          id?: number
          image?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          rating?: number | null
          reviews?: number | null
          tags?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          featured?: boolean | null
          hours?: Json | null
          id?: number
          image?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          rating?: number | null
          reviews?: number | null
          tags?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      subscription_packages: {
        Row: {
          advance_payment_months: number | null
          billing_cycle: string | null
          created_at: string | null
          dashboard_sections: string[] | null
          duration_months: number | null
          features: string[] | null
          full_description: string | null
          id: string
          monthly_price: number | null
          payment_type: string | null
          popular: boolean | null
          price: number
          setup_fee: number | null
          short_description: string | null
          terms_and_conditions: string | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          advance_payment_months?: number | null
          billing_cycle?: string | null
          created_at?: string | null
          dashboard_sections?: string[] | null
          duration_months?: number | null
          features?: string[] | null
          full_description?: string | null
          id: string
          monthly_price?: number | null
          payment_type?: string | null
          popular?: boolean | null
          price: number
          setup_fee?: number | null
          short_description?: string | null
          terms_and_conditions?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          advance_payment_months?: number | null
          billing_cycle?: string | null
          created_at?: string | null
          dashboard_sections?: string[] | null
          duration_months?: number | null
          features?: string[] | null
          full_description?: string | null
          id?: string
          monthly_price?: number | null
          payment_type?: string | null
          popular?: boolean | null
          price?: number
          setup_fee?: number | null
          short_description?: string | null
          terms_and_conditions?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          actual_start_date: string | null
          advance_payment_months: number | null
          amount: number
          assigned_at: string | null
          assigned_by: string | null
          cancel_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          end_date: string
          id: string
          invoice_ids: string[] | null
          is_pausable: boolean | null
          is_paused: boolean | null
          is_user_cancellable: boolean | null
          package_id: string | null
          package_name: string | null
          payment_method: string | null
          payment_type: string | null
          signup_fee: number | null
          start_date: string
          status: string | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actual_start_date?: string | null
          advance_payment_months?: number | null
          amount: number
          assigned_at?: string | null
          assigned_by?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          end_date: string
          id: string
          invoice_ids?: string[] | null
          is_pausable?: boolean | null
          is_paused?: boolean | null
          is_user_cancellable?: boolean | null
          package_id?: string | null
          package_name?: string | null
          payment_method?: string | null
          payment_type?: string | null
          signup_fee?: number | null
          start_date: string
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actual_start_date?: string | null
          advance_payment_months?: number | null
          amount?: number
          assigned_at?: string | null
          assigned_by?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          invoice_ids?: string[] | null
          is_pausable?: boolean | null
          is_paused?: boolean | null
          is_user_cancellable?: boolean | null
          package_id?: string | null
          package_name?: string | null
          payment_method?: string | null
          payment_type?: string | null
          signup_fee?: number | null
          start_date?: string
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "subscription_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          bio: string | null
          business_category: string | null
          business_name: string | null
          city: string | null
          country: string | null
          created_at: string | null
          custom_dashboard_sections: string[] | null
          email: string
          employee_code: string | null
          facebook_handle: string | null
          first_name: string | null
          followers_count: string | null
          gst_number: string | null
          id: string
          instagram_handle: string | null
          is_admin: boolean | null
          last_login: string | null
          last_name: string | null
          name: string | null
          niche: string | null
          owner_name: string | null
          phone: string | null
          photo_url: string | null
          role: string | null
          subscription: string | null
          subscription_id: string | null
          subscription_package: string | null
          subscription_status: string | null
          username: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          bio?: string | null
          business_category?: string | null
          business_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          custom_dashboard_sections?: string[] | null
          email: string
          employee_code?: string | null
          facebook_handle?: string | null
          first_name?: string | null
          followers_count?: string | null
          gst_number?: string | null
          id: string
          instagram_handle?: string | null
          is_admin?: boolean | null
          last_login?: string | null
          last_name?: string | null
          name?: string | null
          niche?: string | null
          owner_name?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: string | null
          subscription?: string | null
          subscription_id?: string | null
          subscription_package?: string | null
          subscription_status?: string | null
          username?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          bio?: string | null
          business_category?: string | null
          business_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          custom_dashboard_sections?: string[] | null
          email?: string
          employee_code?: string | null
          facebook_handle?: string | null
          first_name?: string | null
          followers_count?: string | null
          gst_number?: string | null
          id?: string
          instagram_handle?: string | null
          is_admin?: boolean | null
          last_login?: string | null
          last_name?: string | null
          name?: string | null
          niche?: string | null
          owner_name?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: string | null
          subscription?: string | null
          subscription_id?: string | null
          subscription_package?: string | null
          subscription_status?: string | null
          username?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
