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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      deliveries: {
        Row: {
          agreed_price: number
          created_at: string
          delivered_at: string | null
          delivery_otp: string | null
          delivery_photo_url: string | null
          id: string
          journey_id: string
          parcel_id: string
          pickup_at: string | null
          pickup_otp: string | null
          pickup_photo_url: string | null
          recipient_name: string | null
          recipient_phone: string | null
          sender_id: string
          sender_rating: number | null
          status: string | null
          traveler_id: string
          traveler_rating: number | null
          updated_at: string
        }
        Insert: {
          agreed_price: number
          created_at?: string
          delivered_at?: string | null
          delivery_otp?: string | null
          delivery_photo_url?: string | null
          id?: string
          journey_id: string
          parcel_id: string
          pickup_at?: string | null
          pickup_otp?: string | null
          pickup_photo_url?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          sender_id: string
          sender_rating?: number | null
          status?: string | null
          traveler_id: string
          traveler_rating?: number | null
          updated_at?: string
        }
        Update: {
          agreed_price?: number
          created_at?: string
          delivered_at?: string | null
          delivery_otp?: string | null
          delivery_photo_url?: string | null
          id?: string
          journey_id?: string
          parcel_id?: string
          pickup_at?: string | null
          pickup_otp?: string | null
          pickup_photo_url?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          sender_id?: string
          sender_rating?: number | null
          status?: string | null
          traveler_id?: string
          traveler_rating?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "deliveries_traveler_id_fkey"
            columns: ["traveler_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      delivery_tracking: {
        Row: {
          accuracy: number | null
          delivery_id: string
          heading: number | null
          id: string
          latitude: number
          longitude: number
          recorded_at: string
          speed: number | null
        }
        Insert: {
          accuracy?: number | null
          delivery_id: string
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          recorded_at?: string
          speed?: number | null
        }
        Update: {
          accuracy?: number | null
          delivery_id?: string
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          recorded_at?: string
          speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_tracking_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      journeys: {
        Row: {
          accepted_parcel_types: string[] | null
          arrival_date: string
          arrival_time: string
          available_capacity: number
          created_at: string
          current_lat: number | null
          current_lng: number | null
          departure_date: string
          departure_time: string
          destination_city: string
          destination_location: string
          id: string
          max_parcel_weight: number | null
          notes: string | null
          pnr_number: string | null
          price_per_kg: number
          source_city: string
          source_location: string
          status: string | null
          total_capacity: number
          transport_mode: string
          updated_at: string
          user_id: string
          vehicle_number: string | null
        }
        Insert: {
          accepted_parcel_types?: string[] | null
          arrival_date: string
          arrival_time: string
          available_capacity: number
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          departure_date: string
          departure_time: string
          destination_city: string
          destination_location: string
          id?: string
          max_parcel_weight?: number | null
          notes?: string | null
          pnr_number?: string | null
          price_per_kg: number
          source_city: string
          source_location: string
          status?: string | null
          total_capacity: number
          transport_mode: string
          updated_at?: string
          user_id: string
          vehicle_number?: string | null
        }
        Update: {
          accepted_parcel_types?: string[] | null
          arrival_date?: string
          arrival_time?: string
          available_capacity?: number
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          departure_date?: string
          departure_time?: string
          destination_city?: string
          destination_location?: string
          id?: string
          max_parcel_weight?: number | null
          notes?: string | null
          pnr_number?: string | null
          price_per_kg?: number
          source_city?: string
          source_location?: string
          status?: string | null
          total_capacity?: number
          transport_mode?: string
          updated_at?: string
          user_id?: string
          vehicle_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journeys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          delivery_id: string
          id: string
          is_read: boolean | null
          message_type: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          delivery_id: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          delivery_id?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      parcels: {
        Row: {
          budget: number | null
          category: string | null
          created_at: string
          description: string | null
          dimensions: string | null
          drop_city: string
          drop_contact: string
          drop_location: string
          id: string
          pickup_city: string
          pickup_contact: string
          pickup_location: string
          preferred_modes: string[] | null
          status: string | null
          title: string
          updated_at: string
          urgency: string | null
          urgent_delivery: boolean | null
          user_id: string
          weight: number
        }
        Insert: {
          budget?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          drop_city: string
          drop_contact: string
          drop_location: string
          id?: string
          pickup_city: string
          pickup_contact: string
          pickup_location: string
          preferred_modes?: string[] | null
          status?: string | null
          title: string
          updated_at?: string
          urgency?: string | null
          urgent_delivery?: boolean | null
          user_id: string
          weight: number
        }
        Update: {
          budget?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          drop_city?: string
          drop_contact?: string
          drop_location?: string
          id?: string
          pickup_city?: string
          pickup_contact?: string
          pickup_location?: string
          preferred_modes?: string[] | null
          status?: string | null
          title?: string
          updated_at?: string
          urgency?: string | null
          urgent_delivery?: boolean | null
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "parcels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          successful_deliveries: number | null
          total_deliveries: number | null
          trust_score: number | null
          updated_at: string
          user_id: string
          verification_status: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          successful_deliveries?: number | null
          total_deliveries?: number | null
          trust_score?: number | null
          updated_at?: string
          user_id: string
          verification_status?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          successful_deliveries?: number | null
          total_deliveries?: number | null
          trust_score?: number | null
          updated_at?: string
          user_id?: string
          verification_status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_traveler_display_name: {
        Args: { traveler_user_id: string }
        Returns: string
      }
      get_traveler_trust_score: {
        Args: { traveler_user_id: string }
        Returns: number
      }
      get_traveler_verification_status: {
        Args: { traveler_user_id: string }
        Returns: string
      }
      is_delivery_participant: {
        Args: { delivery_id: string }
        Returns: boolean
      }
      is_journey_owner: { Args: { journey_id: string }; Returns: boolean }
      is_parcel_owner: { Args: { parcel_id: string }; Returns: boolean }
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
