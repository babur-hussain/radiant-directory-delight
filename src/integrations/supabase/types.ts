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
          features: string | null
          full_description: string | null
          id: string
          is_active: boolean | null
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
          features?: string | null
          full_description?: string | null
          id: string
          is_active?: boolean | null
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
          features?: string | null
          full_description?: string | null
          id?: string
          is_active?: boolean | null
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
          billing_cycle: string | null
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
          billing_cycle?: string | null
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
          billing_cycle?: string | null
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
          is_influencer: boolean | null
          last_login: string | null
          last_name: string | null
          name: string | null
          niche: string | null
          owner_name: string | null
          phone: string | null
          photo_url: string | null
          referral_count: number | null
          referral_earnings: number | null
          referral_id: string | null
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
          is_influencer?: boolean | null
          last_login?: string | null
          last_name?: string | null
          name?: string | null
          niche?: string | null
          owner_name?: string | null
          phone?: string | null
          photo_url?: string | null
          referral_count?: number | null
          referral_earnings?: number | null
          referral_id?: string | null
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
          is_influencer?: boolean | null
          last_login?: string | null
          last_name?: string | null
          name?: string | null
          niche?: string | null
          owner_name?: string | null
          phone?: string | null
          photo_url?: string | null
          referral_count?: number | null
          referral_earnings?: number | null
          referral_id?: string | null
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
      video_submissions: {
        Row: {
          business_name: string | null
          contact_number: string | null
          created_at: string
          description: string
          email: string
          id: string
          name: string
          status: string
          title: string
          user_id: string | null
          video_type: string
          video_url: string
        }
        Insert: {
          business_name?: string | null
          contact_number?: string | null
          created_at?: string
          description: string
          email: string
          id?: string
          name: string
          status?: string
          title: string
          user_id?: string | null
          video_type: string
          video_url: string
        }
        Update: {
          business_name?: string | null
          contact_number?: string | null
          created_at?: string
          description?: string
          email?: string
          id?: string
          name?: string
          status?: string
          title?: string
          user_id?: string | null
          video_type?: string
          video_url?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string
          description: string
          id: string
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string | null
          video_type: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
          video_type: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
          video_type?: string
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      record_referral: {
        Args: { referrer_id: string; earning_amount: number }
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
