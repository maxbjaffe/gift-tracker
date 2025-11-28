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
      calendar_events: {
        Row: {
          all_day: boolean | null
          category: string | null
          color: string | null
          created_at: string | null
          description: string | null
          end_time: string | null
          external_id: string | null
          id: string
          is_cancelled: boolean | null
          location: string | null
          metadata: Json | null
          recurrence_rule: string | null
          source_id: string | null
          source_type: string
          start_time: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          all_day?: boolean | null
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          external_id?: string | null
          id?: string
          is_cancelled?: boolean | null
          location?: string | null
          metadata?: Json | null
          recurrence_rule?: string | null
          source_id?: string | null
          source_type: string
          start_time: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          all_day?: boolean | null
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          external_id?: string | null
          id?: string
          is_cancelled?: boolean | null
          location?: string | null
          metadata?: Json | null
          recurrence_rule?: string | null
          source_id?: string | null
          source_type?: string
          start_time?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_subscriptions: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          ical_url: string
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          name: string
          sync_error: string | null
          sync_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          ical_url: string
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          name: string
          sync_error?: string | null
          sync_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          ical_url?: string
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          name?: string
          sync_error?: string | null
          sync_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          recipient_id: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          recipient_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          recipient_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_completions: {
        Row: {
          child_id: string
          completed_at: string
          completion_date: string
          created_at: string
          id: string
          item_id: string
          user_id: string
        }
        Insert: {
          child_id: string
          completed_at?: string
          completion_date?: string
          created_at?: string
          id?: string
          item_id: string
          user_id: string
        }
        Update: {
          child_id?: string
          completed_at?: string
          completion_date?: string
          created_at?: string
          id?: string
          item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_completions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_completions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          child_id: string
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
          user_id: string
          weekdays_only: boolean
        }
        Insert: {
          child_id: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          user_id: string
          weekdays_only?: boolean
        }
        Update: {
          child_id?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          user_id?: string
          weekdays_only?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      child_teachers: {
        Row: {
          child_id: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          school_year: string | null
          subject: string | null
          teacher_id: string
        }
        Insert: {
          child_id: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          school_year?: string | null
          subject?: string | null
          teacher_id: string
        }
        Update: {
          child_id?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          school_year?: string | null
          subject?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_teachers_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_teachers_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          activities: Json | null
          age: number | null
          avatar_background: string | null
          avatar_color: string | null
          avatar_data: string | null
          avatar_type: string | null
          created_at: string | null
          grade: string | null
          id: string
          interests: string[] | null
          name: string
          notes: string | null
          school: string | null
          teacher: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activities?: Json | null
          age?: number | null
          avatar_background?: string | null
          avatar_color?: string | null
          avatar_data?: string | null
          avatar_type?: string | null
          created_at?: string | null
          grade?: string | null
          id?: string
          interests?: string[] | null
          name: string
          notes?: string | null
          school?: string | null
          teacher?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activities?: Json | null
          age?: number | null
          avatar_background?: string | null
          avatar_color?: string | null
          avatar_data?: string | null
          avatar_type?: string | null
          created_at?: string | null
          grade?: string | null
          id?: string
          interests?: string[] | null
          name?: string
          notes?: string | null
          school?: string | null
          teacher?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      commitment_stats: {
        Row: {
          child_id: string
          chores_count: number | null
          completed_late: number | null
          completed_on_time: number | null
          homework_count: number | null
          id: string
          improvement_trend: string | null
          missed: number | null
          month: string
          other_count: number | null
          reliability_score: number | null
          total_commitments: number | null
          updated_at: string | null
        }
        Insert: {
          child_id: string
          chores_count?: number | null
          completed_late?: number | null
          completed_on_time?: number | null
          homework_count?: number | null
          id?: string
          improvement_trend?: string | null
          missed?: number | null
          month: string
          other_count?: number | null
          reliability_score?: number | null
          total_commitments?: number | null
          updated_at?: string | null
        }
        Update: {
          child_id?: string
          chores_count?: number | null
          completed_late?: number | null
          completed_on_time?: number | null
          homework_count?: number | null
          id?: string
          improvement_trend?: string | null
          missed?: number | null
          month?: string
          other_count?: number | null
          reliability_score?: number | null
          total_commitments?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commitment_stats_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      commitments: {
        Row: {
          category: string | null
          child_id: string
          commitment_text: string
          committed_by: string
          completed_at: string | null
          completed_on_time: boolean | null
          created_at: string | null
          due_date: string
          extension_reason: string | null
          extension_requested_at: string | null
          id: string
          notes: string | null
          related_consequence_id: string | null
          reminded_at: string | null
          requested_by: string | null
          status: string | null
          verified_by: string | null
        }
        Insert: {
          category?: string | null
          child_id: string
          commitment_text: string
          committed_by: string
          completed_at?: string | null
          completed_on_time?: boolean | null
          created_at?: string | null
          due_date: string
          extension_reason?: string | null
          extension_requested_at?: string | null
          id?: string
          notes?: string | null
          related_consequence_id?: string | null
          reminded_at?: string | null
          requested_by?: string | null
          status?: string | null
          verified_by?: string | null
        }
        Update: {
          category?: string | null
          child_id?: string
          commitment_text?: string
          committed_by?: string
          completed_at?: string | null
          completed_on_time?: boolean | null
          created_at?: string | null
          due_date?: string
          extension_reason?: string | null
          extension_requested_at?: string | null
          id?: string
          notes?: string | null
          related_consequence_id?: string | null
          reminded_at?: string | null
          requested_by?: string | null
          status?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commitments_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commitments_committed_by_fkey"
            columns: ["committed_by"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commitments_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commitments_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_commitments_related_consequence"
            columns: ["related_consequence_id"]
            isOneToOne: false
            referencedRelation: "consequences"
            referencedColumns: ["id"]
          },
        ]
      }
      consequences: {
        Row: {
          child_id: string
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string | null
          created_by: string
          duration_days: number | null
          expires_at: string | null
          id: string
          lifted_at: string | null
          lifted_by: string | null
          notes: string | null
          reason: string
          related_commitment_id: string | null
          restriction_item: string
          restriction_type: string
          severity: string | null
          status: string | null
        }
        Insert: {
          child_id: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          created_by: string
          duration_days?: number | null
          expires_at?: string | null
          id?: string
          lifted_at?: string | null
          lifted_by?: string | null
          notes?: string | null
          reason: string
          related_commitment_id?: string | null
          restriction_item: string
          restriction_type: string
          severity?: string | null
          status?: string | null
        }
        Update: {
          child_id?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          created_by?: string
          duration_days?: number | null
          expires_at?: string | null
          id?: string
          lifted_at?: string | null
          lifted_by?: string | null
          notes?: string | null
          reason?: string
          related_commitment_id?: string | null
          restriction_item?: string
          restriction_type?: string
          severity?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consequences_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consequences_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consequences_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consequences_lifted_by_fkey"
            columns: ["lifted_by"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_consequences_related_commitment"
            columns: ["related_commitment_id"]
            isOneToOne: false
            referencedRelation: "commitments"
            referencedColumns: ["id"]
          },
        ]
      }
      doodle_drawings: {
        Row: {
          created_at: string
          id: string
          image_data: string
          thumbnail_data: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_data: string
          thumbnail_data?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_data?: string
          thumbnail_data?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doodle_drawings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      email_accounts: {
        Row: {
          created_at: string | null
          display_name: string | null
          email_address: string
          fetch_since_date: string | null
          id: string
          imap_host: string
          imap_password_encrypted: string
          imap_port: number
          imap_username: string
          is_active: boolean | null
          last_sync_at: string | null
          last_sync_error: string | null
          last_sync_status: string | null
          provider: string
          sync_frequency_minutes: number | null
          updated_at: string | null
          use_ssl: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email_address: string
          fetch_since_date?: string | null
          id?: string
          imap_host: string
          imap_password_encrypted: string
          imap_port?: number
          imap_username: string
          is_active?: boolean | null
          last_sync_at?: string | null
          last_sync_error?: string | null
          last_sync_status?: string | null
          provider: string
          sync_frequency_minutes?: number | null
          updated_at?: string | null
          use_ssl?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email_address?: string
          fetch_since_date?: string | null
          id?: string
          imap_host?: string
          imap_password_encrypted?: string
          imap_port?: number
          imap_username?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          last_sync_error?: string | null
          last_sync_status?: string | null
          provider?: string
          sync_frequency_minutes?: number | null
          updated_at?: string | null
          use_ssl?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      email_actions: {
        Row: {
          action_text: string
          action_type: string
          completed_at: string | null
          created_at: string | null
          due_date: string | null
          email_id: string
          id: string
          is_completed: boolean | null
          notes: string | null
          priority: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_text: string
          action_type: string
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          email_id: string
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          priority?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_text?: string
          action_type?: string
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          email_id?: string
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          priority?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_actions_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "school_emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      email_attachments: {
        Row: {
          content_id: string | null
          content_type: string
          created_at: string | null
          email_id: string
          filename: string
          id: string
          inline_data: string | null
          is_inline: boolean | null
          size_bytes: number
          storage_url: string | null
        }
        Insert: {
          content_id?: string | null
          content_type: string
          created_at?: string | null
          email_id: string
          filename: string
          id?: string
          inline_data?: string | null
          is_inline?: boolean | null
          size_bytes: number
          storage_url?: string | null
        }
        Update: {
          content_id?: string | null
          content_type?: string
          created_at?: string | null
          email_id?: string
          filename?: string
          id?: string
          inline_data?: string | null
          is_inline?: boolean | null
          size_bytes?: number
          storage_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_attachments_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "school_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      email_child_relevance: {
        Row: {
          ai_confidence: number | null
          ai_reasoning: string | null
          child_id: string
          created_at: string | null
          email_id: string
          extracted_child_name: string | null
          id: string
          is_rejected: boolean | null
          is_verified: boolean | null
          relevance_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_confidence?: number | null
          ai_reasoning?: string | null
          child_id: string
          created_at?: string | null
          email_id: string
          extracted_child_name?: string | null
          id?: string
          is_rejected?: boolean | null
          is_verified?: boolean | null
          relevance_type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_confidence?: number | null
          ai_reasoning?: string | null
          child_id?: string
          created_at?: string | null
          email_id?: string
          extracted_child_name?: string | null
          id?: string
          is_rejected?: boolean | null
          is_verified?: boolean | null
          relevance_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_child_relevance_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_child_relevance_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "school_emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_child_relevance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      email_classification_feedback: {
        Row: {
          ai_value: string | null
          created_at: string | null
          email_from: string | null
          email_id: string
          email_subject: string | null
          feedback_text: string | null
          field_name: string
          id: string
          user_id: string
          user_value: string
        }
        Insert: {
          ai_value?: string | null
          created_at?: string | null
          email_from?: string | null
          email_id: string
          email_subject?: string | null
          feedback_text?: string | null
          field_name: string
          id?: string
          user_id: string
          user_value: string
        }
        Update: {
          ai_value?: string | null
          created_at?: string | null
          email_from?: string | null
          email_id?: string
          email_subject?: string | null
          feedback_text?: string | null
          field_name?: string
          id?: string
          user_id?: string
          user_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_classification_feedback_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "school_emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_classification_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      email_event_associations: {
        Row: {
          ai_confidence: number | null
          ai_reasoning: string | null
          association_type: string
          created_at: string | null
          email_id: string
          event_id: string
          id: string
          is_rejected: boolean | null
          is_verified: boolean | null
          updated_at: string | null
          user_feedback: string | null
          user_id: string
        }
        Insert: {
          ai_confidence?: number | null
          ai_reasoning?: string | null
          association_type: string
          created_at?: string | null
          email_id: string
          event_id: string
          id?: string
          is_rejected?: boolean | null
          is_verified?: boolean | null
          updated_at?: string | null
          user_feedback?: string | null
          user_id: string
        }
        Update: {
          ai_confidence?: number | null
          ai_reasoning?: string | null
          association_type?: string
          created_at?: string | null
          email_id?: string
          event_id?: string
          id?: string
          is_rejected?: boolean | null
          is_verified?: boolean | null
          updated_at?: string | null
          user_feedback?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_event_associations_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "school_emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_event_associations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      email_filters: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string | null
          description: string | null
          email_account_id: string | null
          id: string
          is_active: boolean | null
          name: string
          priority: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string | null
          description?: string | null
          email_account_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          priority?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string | null
          description?: string | null
          email_account_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_filters_email_account_id_fkey"
            columns: ["email_account_id"]
            isOneToOne: false
            referencedRelation: "email_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_filters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      family_info_conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages: Json
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_info_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      family_info_documents: {
        Row: {
          created_at: string
          error_message: string | null
          extracted_data: Json | null
          extracted_text: string | null
          family_info_id: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          processed_at: string | null
          processing_status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          extracted_data?: Json | null
          extracted_text?: string | null
          family_info_id?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          processed_at?: string | null
          processing_status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          extracted_data?: Json | null
          extracted_text?: string | null
          family_info_id?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          processed_at?: string | null
          processing_status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_info_documents_family_info_id_fkey"
            columns: ["family_info_id"]
            isOneToOne: false
            referencedRelation: "family_information"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_info_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      family_info_members: {
        Row: {
          created_at: string | null
          family_info_id: string
          family_member_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          family_info_id: string
          family_member_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          family_info_id?: string
          family_member_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_info_members_family_info_id_fkey"
            columns: ["family_info_id"]
            isOneToOne: false
            referencedRelation: "family_information"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_info_members_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      family_information: {
        Row: {
          created_at: string
          description: string | null
          details: string | null
          file_metadata: Json | null
          file_urls: string[] | null
          id: string
          important_dates: Json | null
          related_contacts: Json | null
          search_vector: unknown
          security_level: string | null
          status: string | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          details?: string | null
          file_metadata?: Json | null
          file_urls?: string[] | null
          id?: string
          important_dates?: Json | null
          related_contacts?: Json | null
          search_vector?: unknown
          security_level?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          details?: string | null
          file_metadata?: Json | null
          file_urls?: string[] | null
          id?: string
          important_dates?: Json | null
          related_contacts?: Json | null
          search_vector?: unknown
          security_level?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_information_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          id: string
          is_primary: boolean | null
          name: string
          notes: string | null
          relationship: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          notes?: string | null
          relationship?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          notes?: string | null
          relationship?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_recipients: {
        Row: {
          claim_expires_at: string | null
          claim_notes: string | null
          claimed_at: string | null
          claimed_by_email: string | null
          claimed_by_name: string | null
          created_at: string | null
          gift_id: string
          id: string
          notes: string | null
          occasion: string | null
          occasion_date: string | null
          purchased_date: string | null
          recipient_id: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          claim_expires_at?: string | null
          claim_notes?: string | null
          claimed_at?: string | null
          claimed_by_email?: string | null
          claimed_by_name?: string | null
          created_at?: string | null
          gift_id: string
          id?: string
          notes?: string | null
          occasion?: string | null
          occasion_date?: string | null
          purchased_date?: string | null
          recipient_id: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          claim_expires_at?: string | null
          claim_notes?: string | null
          claimed_at?: string | null
          claimed_by_email?: string | null
          claimed_by_name?: string | null
          created_at?: string | null
          gift_id?: string
          id?: string
          notes?: string | null
          occasion?: string | null
          occasion_date?: string | null
          purchased_date?: string | null
          recipient_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_recipients_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "gifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_recipients_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "recipients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_recipients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      gifts: {
        Row: {
          brand: string | null
          category: string | null
          created_at: string | null
          current_price: number | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          notes: string | null
          occasion: string | null
          occasion_date: string | null
          original_price: number | null
          price_history: Json | null
          price_last_checked: string | null
          priority: string | null
          purchase_date: string | null
          source: string | null
          source_metadata: Json | null
          status: string
          store: string | null
          updated_at: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string | null
          current_price?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          notes?: string | null
          occasion?: string | null
          occasion_date?: string | null
          original_price?: number | null
          price_history?: Json | null
          price_last_checked?: string | null
          priority?: string | null
          purchase_date?: string | null
          source?: string | null
          source_metadata?: Json | null
          status?: string
          store?: string | null
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string | null
          current_price?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          notes?: string | null
          occasion?: string | null
          occasion_date?: string | null
          original_price?: number | null
          price_history?: Json | null
          price_last_checked?: string | null
          priority?: string | null
          purchase_date?: string | null
          source?: string | null
          source_metadata?: Json | null
          status?: string
          store?: string | null
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gifts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_summaries: {
        Row: {
          actions_count: number | null
          by_category: Json | null
          child_id: string | null
          created_at: string | null
          events_count: number | null
          generated_at: string | null
          id: string
          key_highlights: string[] | null
          last_regenerated_at: string | null
          month: number
          regenerated_count: number | null
          summary_html: string | null
          summary_text: string
          total_emails: number | null
          upcoming_deadlines: Json | null
          updated_at: string | null
          urgent_count: number | null
          user_id: string
          year: number
        }
        Insert: {
          actions_count?: number | null
          by_category?: Json | null
          child_id?: string | null
          created_at?: string | null
          events_count?: number | null
          generated_at?: string | null
          id?: string
          key_highlights?: string[] | null
          last_regenerated_at?: string | null
          month: number
          regenerated_count?: number | null
          summary_html?: string | null
          summary_text: string
          total_emails?: number | null
          upcoming_deadlines?: Json | null
          updated_at?: string | null
          urgent_count?: number | null
          user_id: string
          year: number
        }
        Update: {
          actions_count?: number | null
          by_category?: Json | null
          child_id?: string | null
          created_at?: string | null
          events_count?: number | null
          generated_at?: string | null
          id?: string
          key_highlights?: string[] | null
          last_regenerated_at?: string | null
          month?: number
          regenerated_count?: number | null
          summary_html?: string | null
          summary_text?: string
          total_emails?: number | null
          upcoming_deadlines?: Json | null
          updated_at?: string | null
          urgent_count?: number | null
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_summaries_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      occasion_reminders: {
        Row: {
          created_at: string | null
          id: string
          occasion_date: string
          occasion_name: string
          recipient_id: string | null
          reminder_type: string
          sent_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          occasion_date: string
          occasion_name: string
          recipient_id?: string | null
          reminder_type: string
          sent_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          occasion_date?: string
          occasion_name?: string
          recipient_id?: string | null
          reminder_type?: string
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "occasion_reminders_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_notifications: {
        Row: {
          child_name: string | null
          created_at: string | null
          id: string
          message_text: string
          notification_category: string | null
          partner_name: string | null
          partner_phone: string
          reference_id: string
          reference_type: string
          responded_at: string | null
          response_text: string | null
          sent_at: string | null
          status: string | null
          type: string
        }
        Insert: {
          child_name?: string | null
          created_at?: string | null
          id?: string
          message_text: string
          notification_category?: string | null
          partner_name?: string | null
          partner_phone: string
          reference_id: string
          reference_type: string
          responded_at?: string | null
          response_text?: string | null
          sent_at?: string | null
          status?: string | null
          type: string
        }
        Update: {
          child_name?: string | null
          created_at?: string | null
          id?: string
          message_text?: string
          notification_category?: string | null
          partner_name?: string | null
          partner_phone?: string
          reference_id?: string
          reference_type?: string
          responded_at?: string | null
          response_text?: string | null
          sent_at?: string | null
          status?: string | null
          type?: string
        }
        Relationships: []
      }
      partner_settings: {
        Row: {
          created_at: string | null
          id: string
          notify_commitments: boolean | null
          notify_consequences: boolean | null
          notify_reminders: boolean | null
          partner_name: string | null
          partner_phone: string
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          require_both_parents: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notify_commitments?: boolean | null
          notify_consequences?: boolean | null
          notify_reminders?: boolean | null
          partner_name?: string | null
          partner_phone: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          require_both_parents?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notify_commitments?: boolean | null
          notify_consequences?: boolean | null
          notify_reminders?: boolean | null
          partner_name?: string | null
          partner_phone?: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          require_both_parents?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      personality_quiz_responses: {
        Row: {
          created_at: string | null
          id: string
          personality_description: string | null
          personality_type: string
          quiz_data: Json
          recipient_id: string | null
          score_breakdown: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          personality_description?: string | null
          personality_type: string
          quiz_data: Json
          recipient_id?: string | null
          score_breakdown?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          personality_description?: string | null
          personality_type?: string
          quiz_data?: Json
          recipient_id?: string | null
          score_breakdown?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personality_quiz_responses_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "recipients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personality_quiz_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      personality_surveys: {
        Row: {
          applied: boolean | null
          created_at: string | null
          id: string
          profile_suggestions: Json | null
          recipient_id: string
          responses: Json
          survey_version: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          applied?: boolean | null
          created_at?: string | null
          id?: string
          profile_suggestions?: Json | null
          recipient_id: string
          responses: Json
          survey_version?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          applied?: boolean | null
          created_at?: string | null
          id?: string
          profile_suggestions?: Json | null
          recipient_id?: string
          responses?: Json
          survey_version?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personality_surveys_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "recipients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personality_surveys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          kiosk_token: string | null
          name: string | null
          phone_number: string | null
          sms_onboarded: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          kiosk_token?: string | null
          name?: string | null
          phone_number?: string | null
          sms_onboarded?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          kiosk_token?: string | null
          name?: string | null
          phone_number?: string | null
          sms_onboarded?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      recipient_budgets: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          max_budget: number
          name: string
          notes: string | null
          occasion_type: string | null
          recipient_id: string
          start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          max_budget?: number
          name: string
          notes?: string | null
          occasion_type?: string | null
          recipient_id: string
          start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          max_budget?: number
          name?: string
          notes?: string | null
          occasion_type?: string | null
          recipient_id?: string
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipient_budgets_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "recipients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipient_budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      recipients: {
        Row: {
          age_range: string | null
          avatar_background: string | null
          avatar_data: string | null
          avatar_type: string | null
          avatar_url: string | null
          birthday: string | null
          clothing_sizes: Json | null
          created_at: string | null
          favorite_brands: string[] | null
          favorite_colors: string[] | null
          favorite_stores: string[] | null
          gender: string | null
          gift_donts: string[] | null
          gift_dos: string[] | null
          gift_preferences: string | null
          hobbies: string[] | null
          id: string
          interests: string[] | null
          items_already_owned: string[] | null
          max_budget: number | null
          max_purchased_budget: number | null
          name: string
          notes: string | null
          past_gifts_received: Json | null
          personality_description: string | null
          personality_type: string | null
          relationship: string | null
          restrictions: string[] | null
          share_enabled: boolean | null
          share_expires_at: string | null
          share_privacy: string | null
          share_token: string | null
          share_view_count: number | null
          updated_at: string | null
          user_id: string | null
          wishlist_items: Json | null
        }
        Insert: {
          age_range?: string | null
          avatar_background?: string | null
          avatar_data?: string | null
          avatar_type?: string | null
          avatar_url?: string | null
          birthday?: string | null
          clothing_sizes?: Json | null
          created_at?: string | null
          favorite_brands?: string[] | null
          favorite_colors?: string[] | null
          favorite_stores?: string[] | null
          gender?: string | null
          gift_donts?: string[] | null
          gift_dos?: string[] | null
          gift_preferences?: string | null
          hobbies?: string[] | null
          id?: string
          interests?: string[] | null
          items_already_owned?: string[] | null
          max_budget?: number | null
          max_purchased_budget?: number | null
          name: string
          notes?: string | null
          past_gifts_received?: Json | null
          personality_description?: string | null
          personality_type?: string | null
          relationship?: string | null
          restrictions?: string[] | null
          share_enabled?: boolean | null
          share_expires_at?: string | null
          share_privacy?: string | null
          share_token?: string | null
          share_view_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          wishlist_items?: Json | null
        }
        Update: {
          age_range?: string | null
          avatar_background?: string | null
          avatar_data?: string | null
          avatar_type?: string | null
          avatar_url?: string | null
          birthday?: string | null
          clothing_sizes?: Json | null
          created_at?: string | null
          favorite_brands?: string[] | null
          favorite_colors?: string[] | null
          favorite_stores?: string[] | null
          gender?: string | null
          gift_donts?: string[] | null
          gift_dos?: string[] | null
          gift_preferences?: string | null
          hobbies?: string[] | null
          id?: string
          interests?: string[] | null
          items_already_owned?: string[] | null
          max_budget?: number | null
          max_purchased_budget?: number | null
          name?: string
          notes?: string | null
          past_gifts_received?: Json | null
          personality_description?: string | null
          personality_type?: string | null
          relationship?: string | null
          restrictions?: string[] | null
          share_enabled?: boolean | null
          share_expires_at?: string | null
          share_privacy?: string | null
          share_token?: string | null
          share_view_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          wishlist_items?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "recipients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_feedback: {
        Row: {
          created_at: string | null
          feedback_type: string
          id: string
          occasion: string | null
          recipient_age_range: string | null
          recipient_id: string
          recipient_interests: string | null
          recipient_relationship: string | null
          recommendation_brand: string | null
          recommendation_category: string | null
          recommendation_description: string | null
          recommendation_name: string
          recommendation_price: number | null
          recommendation_store: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feedback_type: string
          id?: string
          occasion?: string | null
          recipient_age_range?: string | null
          recipient_id: string
          recipient_interests?: string | null
          recipient_relationship?: string | null
          recommendation_brand?: string | null
          recommendation_category?: string | null
          recommendation_description?: string | null
          recommendation_name: string
          recommendation_price?: number | null
          recommendation_store?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          feedback_type?: string
          id?: string
          occasion?: string | null
          recipient_age_range?: string | null
          recipient_id?: string
          recipient_interests?: string | null
          recipient_relationship?: string | null
          recommendation_brand?: string | null
          recommendation_category?: string | null
          recommendation_description?: string | null
          recommendation_name?: string
          recommendation_price?: number | null
          recommendation_store?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_feedback_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      school_emails: {
        Row: {
          ai_action_required: boolean | null
          ai_category: string | null
          ai_confidence_score: number | null
          ai_priority: string | null
          ai_processed_at: string | null
          ai_summary: string | null
          bcc_addresses: string[] | null
          body_html: string | null
          body_text: string | null
          cc_addresses: string[] | null
          created_at: string | null
          email_account_id: string
          fetched_at: string | null
          from_address: string
          from_name: string | null
          id: string
          in_reply_to: string | null
          is_archived: boolean | null
          is_read: boolean | null
          is_starred: boolean | null
          manual_category: string | null
          manual_priority: string | null
          message_id: string
          received_at: string
          snippet: string | null
          subject: string
          thread_id: string | null
          to_addresses: string[]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_action_required?: boolean | null
          ai_category?: string | null
          ai_confidence_score?: number | null
          ai_priority?: string | null
          ai_processed_at?: string | null
          ai_summary?: string | null
          bcc_addresses?: string[] | null
          body_html?: string | null
          body_text?: string | null
          cc_addresses?: string[] | null
          created_at?: string | null
          email_account_id: string
          fetched_at?: string | null
          from_address: string
          from_name?: string | null
          id?: string
          in_reply_to?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          is_starred?: boolean | null
          manual_category?: string | null
          manual_priority?: string | null
          message_id: string
          received_at: string
          snippet?: string | null
          subject: string
          thread_id?: string | null
          to_addresses: string[]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_action_required?: boolean | null
          ai_category?: string | null
          ai_confidence_score?: number | null
          ai_priority?: string | null
          ai_processed_at?: string | null
          ai_summary?: string | null
          bcc_addresses?: string[] | null
          body_html?: string | null
          body_text?: string | null
          cc_addresses?: string[] | null
          created_at?: string | null
          email_account_id?: string
          fetched_at?: string | null
          from_address?: string
          from_name?: string | null
          id?: string
          in_reply_to?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          is_starred?: boolean | null
          manual_category?: string | null
          manual_priority?: string | null
          message_id?: string
          received_at?: string
          snippet?: string | null
          subject?: string
          thread_id?: string | null
          to_addresses?: string[]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_emails_email_account_id_fkey"
            columns: ["email_account_id"]
            isOneToOne: false
            referencedRelation: "email_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_emails_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      share_views: {
        Row: {
          country_code: string | null
          created_at: string | null
          id: string
          recipient_id: string
          referrer: string | null
          user_agent: string | null
          viewed_at: string | null
          visitor_fingerprint: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string | null
          id?: string
          recipient_id: string
          referrer?: string | null
          user_agent?: string | null
          viewed_at?: string | null
          visitor_fingerprint?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string | null
          id?: string
          recipient_id?: string
          referrer?: string | null
          user_agent?: string | null
          viewed_at?: string | null
          visitor_fingerprint?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "share_views_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_context: {
        Row: {
          context_data: Json | null
          created_at: string | null
          expires_at: string | null
          id: string
          last_intent: string | null
          last_message: string | null
          pending_clarification: string | null
          phone_number: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          context_data?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          last_intent?: string | null
          last_message?: string | null
          pending_clarification?: string | null
          phone_number: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          context_data?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          last_intent?: string | null
          last_message?: string | null
          pending_clarification?: string | null
          phone_number?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_context_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_messages: {
        Row: {
          created_at: string | null
          created_gift_id: string | null
          error_message: string | null
          id: string
          message_body: string
          parsed_data: Json | null
          phone_number: string
          processing_status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_gift_id?: string | null
          error_message?: string | null
          id?: string
          message_body: string
          parsed_data?: Json | null
          phone_number: string
          processing_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_gift_id?: string | null
          error_message?: string | null
          id?: string
          message_body?: string
          parsed_data?: Json | null
          phone_number?: string
          processing_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_messages_created_gift_id_fkey"
            columns: ["created_gift_id"]
            isOneToOne: false
            referencedRelation: "gifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          school: string | null
          subject: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          school?: string | null
          subject?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          school?: string | null
          subject?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      trending_gifts: {
        Row: {
          add_count: number | null
          avg_price: number | null
          created_at: string | null
          gift_brand: string | null
          gift_category: string | null
          gift_name: string
          gift_store: string | null
          id: string
          last_added_at: string | null
          normalized_name: string
          popular_for_relationships: string[] | null
          popular_occasions: string[] | null
          popular_with_age_ranges: string[] | null
          purchase_count: number | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          add_count?: number | null
          avg_price?: number | null
          created_at?: string | null
          gift_brand?: string | null
          gift_category?: string | null
          gift_name: string
          gift_store?: string | null
          id?: string
          last_added_at?: string | null
          normalized_name: string
          popular_for_relationships?: string[] | null
          popular_occasions?: string[] | null
          popular_with_age_ranges?: string[] | null
          purchase_count?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          add_count?: number | null
          avg_price?: number | null
          created_at?: string | null
          gift_brand?: string | null
          gift_category?: string | null
          gift_name?: string
          gift_store?: string | null
          id?: string
          last_added_at?: string | null
          normalized_name?: string
          popular_for_relationships?: string[] | null
          popular_occasions?: string[] | null
          popular_with_age_ranges?: string[] | null
          purchase_count?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_admin: boolean | null
          last_login: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          is_admin?: boolean | null
          last_login?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_admin?: boolean | null
          last_login?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_cache: {
        Row: {
          alerts: Json | null
          cached_at: string | null
          condition: string | null
          condition_code: string | null
          condition_icon: string | null
          created_at: string | null
          current_temp: number | null
          expires_at: string | null
          feels_like: number | null
          forecast_data: Json | null
          humidity: number | null
          id: string
          location: string
          updated_at: string | null
          user_id: string
          wind_direction: string | null
          wind_speed: number | null
        }
        Insert: {
          alerts?: Json | null
          cached_at?: string | null
          condition?: string | null
          condition_code?: string | null
          condition_icon?: string | null
          created_at?: string | null
          current_temp?: number | null
          expires_at?: string | null
          feels_like?: number | null
          forecast_data?: Json | null
          humidity?: number | null
          id?: string
          location: string
          updated_at?: string | null
          user_id: string
          wind_direction?: string | null
          wind_speed?: number | null
        }
        Update: {
          alerts?: Json | null
          cached_at?: string | null
          condition?: string | null
          condition_code?: string | null
          condition_icon?: string | null
          created_at?: string | null
          current_temp?: number | null
          expires_at?: string | null
          feels_like?: number | null
          forecast_data?: Json | null
          humidity?: number | null
          id?: string
          location?: string
          updated_at?: string | null
          user_id?: string
          wind_direction?: string | null
          wind_speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_cache_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_users_overview: {
        Row: {
          conversation_count: number | null
          email: string | null
          gift_count: number | null
          id: string | null
          is_admin: boolean | null
          last_login: string | null
          recipient_count: number | null
          signup_date: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_delete_user: { Args: { target_user_id: string }; Returns: Json }
      bulk_update_gift_recipient_status: {
        Args: {
          assignment_ids: string[]
          new_status: string
          requesting_user_id: string
        }
        Returns: {
          error_message: string
          success: boolean
          updated_count: number
        }[]
      }
      calculate_reliability_score: {
        Args: { p_child_id: string; p_month: string }
        Returns: number
      }
      claim_gift_item: {
        Args: {
          p_claim_duration_days?: number
          p_claim_notes?: string
          p_claimed_by_email?: string
          p_claimed_by_name: string
          p_gift_recipient_id: string
        }
        Returns: Json
      }
      cleanup_old_calendar_events: { Args: never; Returns: number }
      enable_sharing_for_recipient: {
        Args: {
          p_expires_in_days?: number
          p_privacy?: string
          p_recipient_id: string
        }
        Returns: Json
      }
      expire_consequences: { Args: never; Returns: undefined }
      expire_old_claims: { Args: never; Returns: number }
      generate_kiosk_token: { Args: never; Returns: string }
      get_dismissed_recommendations: {
        Args: { p_recipient_id: string }
        Returns: {
          dismissed_at: string
          recommendation_name: string
        }[]
      }
      get_gift_status_for_recipient: {
        Args: { p_gift_id: string; p_recipient_id: string }
        Returns: string
      }
      get_successful_gifts_for_similar_recipients: {
        Args: {
          p_age_range: string
          p_interests: string
          p_limit?: number
          p_relationship: string
        }
        Returns: {
          current_price: number
          gift_brand: string
          gift_category: string
          gift_description: string
          gift_name: string
          gift_store: string
          success_count: number
        }[]
      }
      get_trending_gifts_for_profile: {
        Args: {
          p_age_range?: string
          p_limit?: number
          p_occasion?: string
          p_relationship?: string
        }
        Returns: {
          add_count: number
          avg_price: number
          gift_brand: string
          gift_category: string
          gift_name: string
          gift_store: string
          purchase_count: number
          relevance_score: number
        }[]
      }
      get_upcoming_events: {
        Args: { p_days?: number; p_user_id: string }
        Returns: {
          all_day: boolean
          category: string
          color: string
          end_time: string
          id: string
          source_type: string
          start_time: string
          title: string
        }[]
      }
      mark_missed_commitments: { Args: never; Returns: undefined }
      track_share_view: {
        Args: {
          p_recipient_id: string
          p_referrer?: string
          p_user_agent?: string
          p_visitor_fingerprint?: string
        }
        Returns: boolean
      }
      unclaim_gift_item: {
        Args: { p_claimer_email: string; p_gift_recipient_id: string }
        Returns: Json
      }
      update_trending_gifts: { Args: never; Returns: undefined }
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

// Type helpers for commonly used tables
export type Gift = Database['public']['Tables']['gifts']['Row']
export type GiftInsert = Database['public']['Tables']['gifts']['Insert']
export type GiftUpdate = Database['public']['Tables']['gifts']['Update']

export type Recipient = Database['public']['Tables']['recipients']['Row']
export type RecipientInsert = Database['public']['Tables']['recipients']['Insert']
export type RecipientUpdate = Database['public']['Tables']['recipients']['Update']

export type RecipientBudget = Database['public']['Tables']['recipient_budgets']['Row']
export type RecipientBudgetInsert = Database['public']['Tables']['recipient_budgets']['Insert']
export type RecipientBudgetUpdate = Database['public']['Tables']['recipient_budgets']['Update']

// Extended types with relations
export type GiftWithRecipients = Gift & {
  recipients?: Recipient[]
}

export type RecipientWithGifts = Recipient & {
  gifts?: Gift[]
}
