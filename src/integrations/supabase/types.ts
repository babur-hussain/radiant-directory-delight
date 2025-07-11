export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      business_applications: {
        Row: {
          business_name: string
          category: string
          contact: string
          created_at: string | null
          id: number
          location: string
        }
        Insert: {
          business_name: string
          category: string
          contact: string
          created_at?: string | null
          id?: never
          location: string
        }
        Update: {
          business_name?: string
          category?: string
          contact?: string
          created_at?: string | null
          id?: never
          location?: string
        }
        Relationships: []
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
      influencer_applications: {
        Row: {
          category: string
          created_at: string | null
          followers_count: number
          id: number
          location: string
          name: string
          phone: string
          profile_link: string
        }
        Insert: {
          category: string
          created_at?: string | null
          followers_count: number
          id?: never
          location: string
          name: string
          phone: string
          profile_link: string
        }
        Update: {
          category?: string
          created_at?: string | null
          followers_count?: number
          id?: never
          location?: string
          name?: string
          phone?: string
          profile_link?: string
        }
        Relationships: []
      }
      influencers: {
        Row: {
          bio: string | null
          category: string | null
          city: string | null
          country: string | null
          cover_image: string | null
          created_at: string | null
          email: string | null
          engagement_rate: number | null
          facebook_handle: string | null
          featured: boolean | null
          followers_count: number | null
          id: number
          instagram_handle: string | null
          linkedin_handle: string | null
          location: string | null
          name: string
          niche: string | null
          phone: string | null
          previous_brands: string[] | null
          priority: number | null
          profile_image: string | null
          rating: number | null
          reviews: number | null
          reviews_count: number | null
          state: string | null
          tags: string[] | null
          tiktok_handle: string | null
          twitter_handle: string | null
          updated_at: string | null
          website: string | null
          youtube_handle: string | null
        }
        Insert: {
          bio?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          cover_image?: string | null
          created_at?: string | null
          email?: string | null
          engagement_rate?: number | null
          facebook_handle?: string | null
          featured?: boolean | null
          followers_count?: number | null
          id?: number
          instagram_handle?: string | null
          linkedin_handle?: string | null
          location?: string | null
          name: string
          niche?: string | null
          phone?: string | null
          previous_brands?: string[] | null
          priority?: number | null
          profile_image?: string | null
          rating?: number | null
          reviews?: number | null
          reviews_count?: number | null
          state?: string | null
          tags?: string[] | null
          tiktok_handle?: string | null
          twitter_handle?: string | null
          updated_at?: string | null
          website?: string | null
          youtube_handle?: string | null
        }
        Update: {
          bio?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          cover_image?: string | null
          created_at?: string | null
          email?: string | null
          engagement_rate?: number | null
          facebook_handle?: string | null
          featured?: boolean | null
          followers_count?: number | null
          id?: number
          instagram_handle?: string | null
          linkedin_handle?: string | null
          location?: string | null
          name?: string
          niche?: string | null
          phone?: string | null
          previous_brands?: string[] | null
          priority?: number | null
          profile_image?: string | null
          rating?: number | null
          reviews?: number | null
          reviews_count?: number | null
          state?: string | null
          tags?: string[] | null
          tiktok_handle?: string | null
          twitter_handle?: string | null
          updated_at?: string | null
          website?: string | null
          youtube_handle?: string | null
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
          next_billing_date: string | null
          package_id: string | null
          package_name: string | null
          payment_method: string | null
          payment_type: string | null
          razorpay_order_id: string | null
          razorpay_subscription_id: string | null
          recurring_amount: number | null
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
          next_billing_date?: string | null
          package_id?: string | null
          package_name?: string | null
          payment_method?: string | null
          payment_type?: string | null
          razorpay_order_id?: string | null
          razorpay_subscription_id?: string | null
          recurring_amount?: number | null
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
          next_billing_date?: string | null
          package_id?: string | null
          package_name?: string | null
          payment_method?: string | null
          payment_type?: string | null
          razorpay_order_id?: string | null
          razorpay_subscription_id?: string | null
          recurring_amount?: number | null
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
          last_updated: string | null
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
          subscription_assigned_at: string | null
          subscription_cancelled_at: string | null
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
          last_updated?: string | null
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
          subscription_assigned_at?: string | null
          subscription_cancelled_at?: string | null
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
          last_updated?: string | null
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
          subscription_assigned_at?: string | null
          subscription_cancelled_at?: string | null
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
    Enums: {},
  },
} as const
