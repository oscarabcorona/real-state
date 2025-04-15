export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      appointment_rules: {
        Row: {
          created_at: string | null
          days_in_advance: number
          duration_minutes: number
          end_time: string
          excluded_days: number[] | null
          id: string
          min_notice_hours: number
          property_id: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days_in_advance?: number
          duration_minutes?: number
          end_time?: string
          excluded_days?: number[] | null
          id?: string
          min_notice_hours?: number
          property_id?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days_in_advance?: number
          duration_minutes?: number
          end_time?: string
          excluded_days?: number[] | null
          id?: string
          min_notice_hours?: number
          property_id?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_rules_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string | null
          documents_verified: boolean | null
          email: string
          id: string
          lessor_notes: string | null
          message: string | null
          name: string
          notification_preferences: Json | null
          phone: string
          preferred_date: string
          preferred_time: string
          property_id: string
          report_id: string | null
          report_summary: Json | null
          status: string | null
          tenant_notes: string | null
          tenant_user_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          documents_verified?: boolean | null
          email: string
          id?: string
          lessor_notes?: string | null
          message?: string | null
          name: string
          notification_preferences?: Json | null
          phone: string
          preferred_date: string
          preferred_time: string
          property_id: string
          report_id?: string | null
          report_summary?: Json | null
          status?: string | null
          tenant_notes?: string | null
          tenant_user_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          documents_verified?: boolean | null
          email?: string
          id?: string
          lessor_notes?: string | null
          message?: string | null
          name?: string
          notification_preferences?: Json | null
          phone?: string
          preferred_date?: string
          preferred_time?: string
          property_id?: string
          report_id?: string | null
          report_summary?: Json | null
          status?: string | null
          tenant_notes?: string | null
          tenant_user_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_tasks: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          property_id: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          property_id: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          property_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_tasks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_requests: {
        Row: {
          budget: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          move_in_date: string | null
          name: string
          phone: string | null
          property_count: string | null
          property_type: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          budget?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          move_in_date?: string | null
          name: string
          phone?: string | null
          property_count?: string | null
          property_type?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          budget?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          move_in_date?: string | null
          name?: string
          phone?: string | null
          property_count?: string | null
          property_type?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      document_assignments: {
        Row: {
          assigned_at: string | null
          created_at: string | null
          document_id: string | null
          id: string
          notes: string | null
          property_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_assignments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_assignments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      document_requirements: {
        Row: {
          country: string
          created_at: string | null
          description: string
          document_type: string
          id: string
          is_required: boolean | null
          updated_at: string | null
        }
        Insert: {
          country: string
          created_at?: string | null
          description: string
          document_type: string
          id?: string
          is_required?: boolean | null
          updated_at?: string | null
        }
        Update: {
          country?: string
          created_at?: string | null
          description?: string
          document_type?: string
          id?: string
          is_required?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          country: string | null
          created_at: string | null
          file_path: string
          id: string
          ocr_completed_at: string | null
          ocr_error: string | null
          ocr_results: Json | null
          ocr_status: string | null
          property_id: string | null
          report_data: Json | null
          score: number | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
          verification_date: string | null
          verified: boolean | null
          verified_by: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          file_path: string
          id?: string
          ocr_completed_at?: string | null
          ocr_error?: string | null
          ocr_results?: Json | null
          ocr_status?: string | null
          property_id?: string | null
          report_data?: Json | null
          score?: number | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
          verification_date?: string | null
          verified?: boolean | null
          verified_by?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          file_path?: string
          id?: string
          ocr_completed_at?: string | null
          ocr_error?: string | null
          ocr_results?: Json | null
          ocr_status?: string | null
          property_id?: string | null
          report_data?: Json | null
          score?: number | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
          verification_date?: string | null
          verified?: boolean | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          invoice_file_path: string | null
          invoice_number: string | null
          notes: string | null
          payment_details: Json | null
          payment_method: string
          property_id: string
          receipt_file_path: string | null
          status: string
          updated_at: string | null
          user_id: string
          verification_method: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_file_path?: string | null
          invoice_number?: string | null
          notes?: string | null
          payment_details?: Json | null
          payment_method: string
          property_id: string
          receipt_file_path?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          verification_method?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_file_path?: string | null
          invoice_number?: string | null
          notes?: string | null
          payment_details?: Json | null
          payment_method?: string
          property_id?: string
          receipt_file_path?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          verification_method?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          amenities: string[] | null
          available_date: string | null
          bathrooms: number | null
          bedrooms: number | null
          city: string
          compliance_status: string | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          lease_terms: string | null
          measurement_system:
            | Database["public"]["Enums"]["measurement_system"]
            | null
          name: string
          pet_policy: string | null
          price: number | null
          property_type: string | null
          published: boolean | null
          region: Database["public"]["Enums"]["property_region"] | null
          square_feet: number | null
          square_meters: number | null
          state: string
          syndication: Json | null
          updated_at: string | null
          user_id: string
          workspace_id: string
          zip_code: string
        }
        Insert: {
          address: string
          amenities?: string[] | null
          available_date?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city: string
          compliance_status?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          lease_terms?: string | null
          measurement_system?:
            | Database["public"]["Enums"]["measurement_system"]
            | null
          name: string
          pet_policy?: string | null
          price?: number | null
          property_type?: string | null
          published?: boolean | null
          region?: Database["public"]["Enums"]["property_region"] | null
          square_feet?: number | null
          square_meters?: number | null
          state: string
          syndication?: Json | null
          updated_at?: string | null
          user_id: string
          workspace_id: string
          zip_code: string
        }
        Update: {
          address?: string
          amenities?: string[] | null
          available_date?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string
          compliance_status?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          lease_terms?: string | null
          measurement_system?:
            | Database["public"]["Enums"]["measurement_system"]
            | null
          name?: string
          pet_policy?: string | null
          price?: number | null
          property_type?: string | null
          published?: boolean | null
          region?: Database["public"]["Enums"]["property_region"] | null
          square_feet?: number | null
          square_meters?: number | null
          state?: string
          syndication?: Json | null
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      property_invites: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          expires_at: string
          id: string
          invite_token: string
          invite_type: Database["public"]["Enums"]["invite_type"]
          message: string | null
          property_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          expires_at?: string
          id?: string
          invite_token?: string
          invite_type: Database["public"]["Enums"]["invite_type"]
          message?: string | null
          property_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          invite_token?: string
          invite_type?: Database["public"]["Enums"]["invite_type"]
          message?: string | null
          property_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_invites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_leases: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          property_id: string
          start_date: string
          status: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          property_id: string
          start_date?: string
          status?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          property_id?: string
          start_date?: string
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_property_access: {
        Row: {
          property_id: string
          tenant_user_id: string
        }
        Insert: {
          property_id: string
          tenant_user_id: string
        }
        Update: {
          property_id?: string
          tenant_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_property_access_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          state: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          state?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          state?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_workspaces: {
        Row: {
          created_at: string | null
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          role: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_workspaces_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          company_name: string | null
          created_at: string | null
          date_of_birth: string | null
          display_name: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          preferred_workspace_id: string | null
          role: string
          settings: Json | null
          state: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          display_name?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_workspace_id?: string | null
          role: string
          settings?: Json | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          display_name?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_workspace_id?: string | null
          role?: string
          settings?: Json | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_preferred_workspace_id_fkey"
            columns: ["preferred_workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          allowed_regions:
            | Database["public"]["Enums"]["property_region"][]
            | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          is_default: boolean | null
          max_properties: number | null
          name: string
          owner_id: string
          region: string | null
          settings: Json | null
          tier: Database["public"]["Enums"]["workspace_tier"]
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          allowed_regions?:
            | Database["public"]["Enums"]["property_region"][]
            | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          max_properties?: number | null
          name: string
          owner_id: string
          region?: string | null
          settings?: Json | null
          tier?: Database["public"]["Enums"]["workspace_tier"]
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          allowed_regions?:
            | Database["public"]["Enums"]["property_region"][]
            | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          max_properties?: number | null
          name?: string
          owner_id?: string
          region?: string | null
          settings?: Json | null
          tier?: Database["public"]["Enums"]["workspace_tier"]
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_tenant_score: {
        Args: {
          credit_score: number
          income: number
          rent_amount: number
          has_criminal_record: boolean
          has_eviction_history: boolean
        }
        Returns: number
      }
      check_appointment_conflicts: {
        Args: {
          p_property_id: string
          p_date: string
          p_time: string
          p_duration_minutes?: number
          p_exclude_appointment_id?: string
        }
        Returns: boolean
      }
      convert_property_measurement: {
        Args: {
          p_property_id: string
          p_target_system: Database["public"]["Enums"]["measurement_system"]
        }
        Returns: undefined
      }
      convert_sqft_to_sqm: {
        Args: {
          sqft: number
        }
        Returns: number
      }
      convert_sqm_to_sqft: {
        Args: {
          sqm: number
        }
        Returns: number
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_pdf_content: {
        Args: {
          payment_id: string
          doc_type: string
        }
        Returns: string
      }
      get_available_workspace_tiers: {
        Args: {
          p_workspace_id: string
        }
        Returns: {
          available_tier: Database["public"]["Enums"]["workspace_tier"]
        }[]
      }
      get_default_workspace: {
        Args: {
          p_user_id: string
        }
        Returns: string
      }
      get_default_workspace_with_tier: {
        Args: {
          p_user_id: string
        }
        Returns: {
          workspace_id: string
          workspace_tier: Database["public"]["Enums"]["workspace_tier"]
          property_count: number
          max_properties: number
        }[]
      }
      get_properties_with_tenants: {
        Args: {
          p_user_id: string
        }
        Returns: {
          property_id: string
          property_name: string
          tenant_count: number
          user_role: string
        }[]
      }
      has_active_tenant: {
        Args: {
          p_property_id: string
        }
        Returns: boolean
      }
      update_document_assignment_status: {
        Args: {
          p_assignment_id: string
          p_status: string
          p_notes?: string
        }
        Returns: undefined
      }
      update_workspace_tier_limits: {
        Args: {
          p_workspace_id: string
          p_tier: Database["public"]["Enums"]["workspace_tier"]
        }
        Returns: undefined
      }
      upgrade_workspace_tier: {
        Args: {
          p_workspace_id: string
          p_new_tier: Database["public"]["Enums"]["workspace_tier"]
          p_allowed_regions?: Database["public"]["Enums"]["property_region"][]
        }
        Returns: undefined
      }
      validate_ocr_result: {
        Args: {
          p_ocr_results: Json
          p_document_type: string
        }
        Returns: boolean
      }
      verify_payment: {
        Args: {
          payment_id: string
          verifier_id: string
          verification_type?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      invite_type: "tenant" | "lawyer" | "contractor" | "agent"
      measurement_system: "imperial" | "metric"
      notification_type:
        | "appointment_scheduled"
        | "appointment_confirmed"
        | "appointment_cancelled"
        | "appointment_rescheduled"
        | "document_verified"
        | "document_rejected"
        | "payment_received"
        | "payment_due"
        | "report_ready"
      property_region:
        | "USA"
        | "CANADA"
        | "MEXICO"
        | "BELIZE"
        | "GUATEMALA"
        | "HONDURAS"
        | "EL_SALVADOR"
        | "NICARAGUA"
        | "COSTA_RICA"
        | "PANAMA"
        | "ANTIGUA_AND_BARBUDA"
        | "BAHAMAS"
        | "BARBADOS"
        | "CUBA"
        | "DOMINICA"
        | "DOMINICAN_REPUBLIC"
        | "GRENADA"
        | "HAITI"
        | "JAMAICA"
        | "SAINT_KITTS_AND_NEVIS"
        | "SAINT_LUCIA"
        | "SAINT_VINCENT_AND_GRENADINES"
        | "TRINIDAD_AND_TOBAGO"
        | "COLOMBIA"
        | "VENEZUELA"
        | "GUYANA"
        | "SURINAME"
        | "FRENCH_GUIANA"
        | "ECUADOR"
        | "PERU"
        | "BRAZIL"
        | "BOLIVIA"
        | "PARAGUAY"
        | "URUGUAY"
        | "ARGENTINA"
        | "CHILE"
      workspace_tier: "free" | "starter" | "pro" | "international"
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

