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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
      accounts: {
        Row: {
          auth_user_id: string | null
          created_at: string
          deactivated_at: string | null
          display_name: string
          id: string
          normalized_email: string
          phone: string | null
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          deactivated_at?: string | null
          display_name: string
          id?: string
          normalized_email: string
          phone?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          deactivated_at?: string | null
          display_name?: string
          id?: string
          normalized_email?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Relationships: []
      }
      assessment_dimensions: {
        Row: {
          code: Database["public"]["Enums"]["dimension_code"]
          created_at: string
          display_name: string
          group_code: Database["public"]["Enums"]["dimension_group"]
          id: string
          sort_order: number
        }
        Insert: {
          code: Database["public"]["Enums"]["dimension_code"]
          created_at?: string
          display_name: string
          group_code: Database["public"]["Enums"]["dimension_group"]
          id: string
          sort_order: number
        }
        Update: {
          code?: Database["public"]["Enums"]["dimension_code"]
          created_at?: string
          display_name?: string
          group_code?: Database["public"]["Enums"]["dimension_group"]
          id?: string
          sort_order?: number
        }
        Relationships: []
      }
      attendance: {
        Row: {
          centre_id: string
          class_module_id: string
          class_session_id: string
          created_at: string
          enrolment_id: string
          id: string
          recorded_by_membership_id: string | null
          recorded_by_role:
            | Database["public"]["Enums"]["centre_membership_role"]
            | null
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          centre_id: string
          class_module_id: string
          class_session_id: string
          created_at?: string
          enrolment_id: string
          id?: string
          recorded_by_membership_id?: string | null
          recorded_by_role?:
            | Database["public"]["Enums"]["centre_membership_role"]
            | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          centre_id?: string
          class_module_id?: string
          class_session_id?: string
          created_at?: string
          enrolment_id?: string
          id?: string
          recorded_by_membership_id?: string | null
          recorded_by_role?:
            | Database["public"]["Enums"]["centre_membership_role"]
            | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_enrolment_fk"
            columns: ["enrolment_id", "class_module_id", "student_id"]
            isOneToOne: false
            referencedRelation: "enrolments"
            referencedColumns: ["id", "class_module_id", "student_id"]
          },
          {
            foreignKeyName: "attendance_recorded_by_fk"
            columns: [
              "recorded_by_membership_id",
              "centre_id",
              "recorded_by_role",
            ]
            isOneToOne: false
            referencedRelation: "centre_memberships"
            referencedColumns: ["id", "centre_id", "role"]
          },
          {
            foreignKeyName: "attendance_session_centre_fk"
            columns: ["class_session_id", "centre_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id", "centre_id"]
          },
          {
            foreignKeyName: "attendance_session_module_fk"
            columns: ["class_session_id", "class_module_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id", "class_module_id"]
          },
        ]
      }
      audit_chain_heads: {
        Row: {
          centre_id: string
          last_hash: string
          last_seq: number
          updated_at: string
        }
        Insert: {
          centre_id: string
          last_hash: string
          last_seq: number
          updated_at?: string
        }
        Update: {
          centre_id?: string
          last_hash?: string
          last_seq?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_chain_heads_centre_fk"
            columns: ["centre_id"]
            isOneToOne: true
            referencedRelation: "centres"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_event_targets: {
        Row: {
          centre_id: string
          event_id: string
          id: string
          ordinal: number
          target_id: string | null
          target_label: string
          target_type: string
        }
        Insert: {
          centre_id: string
          event_id: string
          id?: string
          ordinal: number
          target_id?: string | null
          target_label: string
          target_type: string
        }
        Update: {
          centre_id?: string
          event_id?: string
          id?: string
          ordinal?: number
          target_id?: string | null
          target_label?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_event_targets_event_fk"
            columns: ["event_id", "centre_id"]
            isOneToOne: false
            referencedRelation: "audit_events"
            referencedColumns: ["id", "centre_id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          actor_account_id: string | null
          actor_membership_id: string | null
          actor_role:
            | Database["public"]["Enums"]["centre_membership_role"]
            | null
          canonical_version: number
          centre_id: string
          entry_hash: string
          id: string
          occurred_at: string
          payload: Json
          payload_canonical: string
          prev_hash: string
          seq_no: number
          state_domain: string | null
          state_from: string | null
          state_to: string | null
          target_id: string | null
          target_label: string
          target_type: string
        }
        Insert: {
          action: string
          actor_account_id?: string | null
          actor_membership_id?: string | null
          actor_role?:
            | Database["public"]["Enums"]["centre_membership_role"]
            | null
          canonical_version: number
          centre_id: string
          entry_hash: string
          id?: string
          occurred_at: string
          payload: Json
          payload_canonical: string
          prev_hash: string
          seq_no: number
          state_domain?: string | null
          state_from?: string | null
          state_to?: string | null
          target_id?: string | null
          target_label: string
          target_type: string
        }
        Update: {
          action?: string
          actor_account_id?: string | null
          actor_membership_id?: string | null
          actor_role?:
            | Database["public"]["Enums"]["centre_membership_role"]
            | null
          canonical_version?: number
          centre_id?: string
          entry_hash?: string
          id?: string
          occurred_at?: string
          payload?: Json
          payload_canonical?: string
          prev_hash?: string
          seq_no?: number
          state_domain?: string | null
          state_from?: string | null
          state_to?: string | null
          target_id?: string | null
          target_label?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_account_fk"
            columns: ["actor_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_events_actor_membership_fk"
            columns: ["actor_membership_id", "centre_id", "actor_role"]
            isOneToOne: false
            referencedRelation: "centre_memberships"
            referencedColumns: ["id", "centre_id", "role"]
          },
          {
            foreignKeyName: "audit_events_centre_fk"
            columns: ["centre_id"]
            isOneToOne: false
            referencedRelation: "centres"
            referencedColumns: ["id"]
          },
        ]
      }
      centre_memberships: {
        Row: {
          account_id: string
          activated_at: string | null
          centre_id: string
          created_at: string
          deactivated_at: string | null
          id: string
          role: Database["public"]["Enums"]["centre_membership_role"]
          status: Database["public"]["Enums"]["centre_membership_status"]
          updated_at: string
        }
        Insert: {
          account_id: string
          activated_at?: string | null
          centre_id: string
          created_at?: string
          deactivated_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["centre_membership_role"]
          status?: Database["public"]["Enums"]["centre_membership_status"]
          updated_at?: string
        }
        Update: {
          account_id?: string
          activated_at?: string | null
          centre_id?: string
          created_at?: string
          deactivated_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["centre_membership_role"]
          status?: Database["public"]["Enums"]["centre_membership_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "centre_memberships_account_fk"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centre_memberships_centre_fk"
            columns: ["centre_id"]
            isOneToOne: false
            referencedRelation: "centres"
            referencedColumns: ["id"]
          },
        ]
      }
      centres: {
        Row: {
          code: string
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          display_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      class_grades: {
        Row: {
          centre_id: string
          code: Database["public"]["Enums"]["class_grade_code"]
          created_at: string
          display_name: string
          id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          centre_id: string
          code: Database["public"]["Enums"]["class_grade_code"]
          created_at?: string
          display_name: string
          id: string
          sort_order: number
          updated_at?: string
        }
        Update: {
          centre_id?: string
          code?: Database["public"]["Enums"]["class_grade_code"]
          created_at?: string
          display_name?: string
          id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_grades_centre_fk"
            columns: ["centre_id"]
            isOneToOne: false
            referencedRelation: "centres"
            referencedColumns: ["id"]
          },
        ]
      }
      class_modules: {
        Row: {
          centre_id: string
          class_grade_id: string
          created_at: string
          deactivated_at: string | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          centre_id: string
          class_grade_id: string
          created_at?: string
          deactivated_at?: string | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          centre_id?: string
          class_grade_id?: string
          created_at?: string
          deactivated_at?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_modules_grade_fk"
            columns: ["class_grade_id", "centre_id"]
            isOneToOne: false
            referencedRelation: "class_grades"
            referencedColumns: ["id", "centre_id"]
          },
        ]
      }
      class_session_assignments: {
        Row: {
          assigned_at: string
          centre_id: string
          class_session_id: string
          created_at: string
          id: string
          is_active: boolean
          trainer_membership_id: string
          trainer_role: Database["public"]["Enums"]["centre_membership_role"]
          unassigned_at: string | null
        }
        Insert: {
          assigned_at?: string
          centre_id: string
          class_session_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          trainer_membership_id: string
          trainer_role?: Database["public"]["Enums"]["centre_membership_role"]
          unassigned_at?: string | null
        }
        Update: {
          assigned_at?: string
          centre_id?: string
          class_session_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          trainer_membership_id?: string
          trainer_role?: Database["public"]["Enums"]["centre_membership_role"]
          unassigned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_session_assignments_session_fk"
            columns: ["class_session_id", "centre_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id", "centre_id"]
          },
          {
            foreignKeyName: "class_session_assignments_trainer_fk"
            columns: ["trainer_membership_id", "centre_id", "trainer_role"]
            isOneToOne: false
            referencedRelation: "centre_memberships"
            referencedColumns: ["id", "centre_id", "role"]
          },
        ]
      }
      class_session_materials: {
        Row: {
          byte_size: number
          centre_id: string
          class_session_id: string
          created_at: string
          display_name: string
          id: string
          media_type: string
          storage_object_path: string
          uploaded_by_account_id: string
          uploaded_by_membership_id: string
        }
        Insert: {
          byte_size: number
          centre_id: string
          class_session_id: string
          created_at?: string
          display_name: string
          id?: string
          media_type: string
          storage_object_path: string
          uploaded_by_account_id: string
          uploaded_by_membership_id: string
        }
        Update: {
          byte_size?: number
          centre_id?: string
          class_session_id?: string
          created_at?: string
          display_name?: string
          id?: string
          media_type?: string
          storage_object_path?: string
          uploaded_by_account_id?: string
          uploaded_by_membership_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_session_materials_account_fk"
            columns: ["uploaded_by_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_session_materials_membership_fk"
            columns: ["uploaded_by_membership_id", "centre_id"]
            isOneToOne: false
            referencedRelation: "centre_memberships"
            referencedColumns: ["id", "centre_id"]
          },
          {
            foreignKeyName: "class_session_materials_session_fk"
            columns: ["class_session_id", "centre_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id", "centre_id"]
          },
        ]
      }
      class_sessions: {
        Row: {
          centre_id: string
          class_module_id: string
          created_at: string
          ends_at: string | null
          id: string
          lesson_number: number | null
          lesson_title: string | null
          room: string | null
          session_date: string
          starts_at: string | null
          term_id: string | null
          updated_at: string
        }
        Insert: {
          centre_id: string
          class_module_id: string
          created_at?: string
          ends_at?: string | null
          id?: string
          lesson_number?: number | null
          lesson_title?: string | null
          room?: string | null
          session_date: string
          starts_at?: string | null
          term_id?: string | null
          updated_at?: string
        }
        Update: {
          centre_id?: string
          class_module_id?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          lesson_number?: number | null
          lesson_title?: string | null
          room?: string | null
          session_date?: string
          starts_at?: string | null
          term_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_sessions_module_fk"
            columns: ["class_module_id", "centre_id"]
            isOneToOne: false
            referencedRelation: "class_modules"
            referencedColumns: ["id", "centre_id"]
          },
          {
            foreignKeyName: "class_sessions_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      enrolments: {
        Row: {
          centre_id: string
          class_module_id: string
          created_at: string
          enrolled_at: string
          id: string
          is_active: boolean
          student_id: string
          withdrawn_at: string | null
        }
        Insert: {
          centre_id: string
          class_module_id: string
          created_at?: string
          enrolled_at?: string
          id?: string
          is_active?: boolean
          student_id: string
          withdrawn_at?: string | null
        }
        Update: {
          centre_id?: string
          class_module_id?: string
          created_at?: string
          enrolled_at?: string
          id?: string
          is_active?: boolean
          student_id?: string
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrolments_module_fk"
            columns: ["class_module_id", "centre_id"]
            isOneToOne: false
            referencedRelation: "class_modules"
            referencedColumns: ["id", "centre_id"]
          },
          {
            foreignKeyName: "enrolments_student_fk"
            columns: ["student_id", "centre_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id", "centre_id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          centre_id: string
          created_at: string
          email_normalized: string
          expired_at: string | null
          expires_at: string
          id: string
          invited_by_membership_id: string
          invited_by_role: Database["public"]["Enums"]["centre_membership_role"]
          membership_id: string
          revoked_at: string | null
          status: Database["public"]["Enums"]["invitation_status"]
          superseded_by_invitation_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          centre_id: string
          created_at?: string
          email_normalized: string
          expired_at?: string | null
          expires_at: string
          id?: string
          invited_by_membership_id: string
          invited_by_role?: Database["public"]["Enums"]["centre_membership_role"]
          membership_id: string
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          superseded_by_invitation_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          centre_id?: string
          created_at?: string
          email_normalized?: string
          expired_at?: string | null
          expires_at?: string
          id?: string
          invited_by_membership_id?: string
          invited_by_role?: Database["public"]["Enums"]["centre_membership_role"]
          membership_id?: string
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          superseded_by_invitation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fk"
            columns: [
              "invited_by_membership_id",
              "centre_id",
              "invited_by_role",
            ]
            isOneToOne: false
            referencedRelation: "centre_memberships"
            referencedColumns: ["id", "centre_id", "role"]
          },
          {
            foreignKeyName: "invitations_membership_fk"
            columns: ["membership_id", "centre_id"]
            isOneToOne: false
            referencedRelation: "centre_memberships"
            referencedColumns: ["id", "centre_id"]
          },
          {
            foreignKeyName: "invitations_superseded_by_fk"
            columns: ["superseded_by_invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      observation_ratings: {
        Row: {
          created_at: string
          dimension_code: Database["public"]["Enums"]["dimension_code"]
          id: string
          observation_id: string
          rating: Database["public"]["Enums"]["competency_rating"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          dimension_code: Database["public"]["Enums"]["dimension_code"]
          id?: string
          observation_id: string
          rating: Database["public"]["Enums"]["competency_rating"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          dimension_code?: Database["public"]["Enums"]["dimension_code"]
          id?: string
          observation_id?: string
          rating?: Database["public"]["Enums"]["competency_rating"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "observation_ratings_dimension_fk"
            columns: ["dimension_code"]
            isOneToOne: false
            referencedRelation: "assessment_dimensions"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "observation_ratings_observation_fk"
            columns: ["observation_id"]
            isOneToOne: false
            referencedRelation: "observations"
            referencedColumns: ["id"]
          },
        ]
      }
      observations: {
        Row: {
          centre_id: string
          class_module_id: string
          class_session_id: string
          created_at: string
          enrolment_id: string
          focus_chips: string[]
          follow_up_notes: string | null
          id: string
          lock_version: number
          observation_notes: string | null
          strength_chips: string[]
          student_id: string
          term_evidence_notes: string | null
          trainer_membership_id: string
          trainer_role: Database["public"]["Enums"]["centre_membership_role"]
          updated_at: string
        }
        Insert: {
          centre_id: string
          class_module_id: string
          class_session_id: string
          created_at?: string
          enrolment_id: string
          focus_chips?: string[]
          follow_up_notes?: string | null
          id?: string
          lock_version?: number
          observation_notes?: string | null
          strength_chips?: string[]
          student_id: string
          term_evidence_notes?: string | null
          trainer_membership_id: string
          trainer_role?: Database["public"]["Enums"]["centre_membership_role"]
          updated_at?: string
        }
        Update: {
          centre_id?: string
          class_module_id?: string
          class_session_id?: string
          created_at?: string
          enrolment_id?: string
          focus_chips?: string[]
          follow_up_notes?: string | null
          id?: string
          lock_version?: number
          observation_notes?: string | null
          strength_chips?: string[]
          student_id?: string
          term_evidence_notes?: string | null
          trainer_membership_id?: string
          trainer_role?: Database["public"]["Enums"]["centre_membership_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "observations_enrolment_fk"
            columns: ["enrolment_id", "class_module_id", "student_id"]
            isOneToOne: false
            referencedRelation: "enrolments"
            referencedColumns: ["id", "class_module_id", "student_id"]
          },
          {
            foreignKeyName: "observations_session_centre_fk"
            columns: ["class_session_id", "centre_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id", "centre_id"]
          },
          {
            foreignKeyName: "observations_session_module_fk"
            columns: ["class_session_id", "class_module_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id", "class_module_id"]
          },
          {
            foreignKeyName: "observations_trainer_fk"
            columns: ["trainer_membership_id", "centre_id", "trainer_role"]
            isOneToOne: false
            referencedRelation: "centre_memberships"
            referencedColumns: ["id", "centre_id", "role"]
          },
        ]
      }
      parent_profiles: {
        Row: {
          centre_id: string
          created_at: string
          membership_id: string
          membership_role: Database["public"]["Enums"]["centre_membership_role"]
          updated_at: string
        }
        Insert: {
          centre_id: string
          created_at?: string
          membership_id: string
          membership_role?: Database["public"]["Enums"]["centre_membership_role"]
          updated_at?: string
        }
        Update: {
          centre_id?: string
          created_at?: string
          membership_id?: string
          membership_role?: Database["public"]["Enums"]["centre_membership_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_profiles_membership_fk"
            columns: ["membership_id", "centre_id", "membership_role"]
            isOneToOne: false
            referencedRelation: "centre_memberships"
            referencedColumns: ["id", "centre_id", "role"]
          },
        ]
      }
      parent_student_links: {
        Row: {
          centre_id: string
          created_at: string
          id: string
          is_active: boolean
          linked_at: string
          parent_membership_id: string
          parent_role: Database["public"]["Enums"]["centre_membership_role"]
          student_id: string
          unlinked_at: string | null
        }
        Insert: {
          centre_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          linked_at?: string
          parent_membership_id: string
          parent_role?: Database["public"]["Enums"]["centre_membership_role"]
          student_id: string
          unlinked_at?: string | null
        }
        Update: {
          centre_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          linked_at?: string
          parent_membership_id?: string
          parent_role?: Database["public"]["Enums"]["centre_membership_role"]
          student_id?: string
          unlinked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_student_links_parent_fk"
            columns: ["parent_membership_id", "centre_id", "parent_role"]
            isOneToOne: false
            referencedRelation: "centre_memberships"
            referencedColumns: ["id", "centre_id", "role"]
          },
          {
            foreignKeyName: "parent_student_links_student_fk"
            columns: ["student_id", "centre_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id", "centre_id"]
          },
        ]
      }
      report_correction_requests: {
        Row: {
          centre_id: string
          dimension_code: Database["public"]["Enums"]["dimension_code"] | null
          id: string
          issue_scope: Database["public"]["Enums"]["correction_issue_scope"]
          reason: string
          report_id: string
          report_version_id: string
          requested_at: string
          requested_by_membership_id: string
          requester_role: Database["public"]["Enums"]["centre_membership_role"]
          resolved_at: string | null
          resolved_by_membership_id: string | null
          resolver_role:
            | Database["public"]["Enums"]["centre_membership_role"]
            | null
          resolving_version_id: string | null
          status: Database["public"]["Enums"]["correction_request_status"]
        }
        Insert: {
          centre_id: string
          dimension_code?: Database["public"]["Enums"]["dimension_code"] | null
          id?: string
          issue_scope: Database["public"]["Enums"]["correction_issue_scope"]
          reason: string
          report_id: string
          report_version_id: string
          requested_at?: string
          requested_by_membership_id: string
          requester_role: Database["public"]["Enums"]["centre_membership_role"]
          resolved_at?: string | null
          resolved_by_membership_id?: string | null
          resolver_role?:
            | Database["public"]["Enums"]["centre_membership_role"]
            | null
          resolving_version_id?: string | null
          status?: Database["public"]["Enums"]["correction_request_status"]
        }
        Update: {
          centre_id?: string
          dimension_code?: Database["public"]["Enums"]["dimension_code"] | null
          id?: string
          issue_scope?: Database["public"]["Enums"]["correction_issue_scope"]
          reason?: string
          report_id?: string
          report_version_id?: string
          requested_at?: string
          requested_by_membership_id?: string
          requester_role?: Database["public"]["Enums"]["centre_membership_role"]
          resolved_at?: string | null
          resolved_by_membership_id?: string | null
          resolver_role?:
            | Database["public"]["Enums"]["centre_membership_role"]
            | null
          resolving_version_id?: string | null
          status?: Database["public"]["Enums"]["correction_request_status"]
        }
        Relationships: [
          {
            foreignKeyName: "report_correction_requests_dimension_fk"
            columns: ["dimension_code"]
            isOneToOne: false
            referencedRelation: "assessment_dimensions"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "report_correction_requests_report_fk"
            columns: ["report_id", "centre_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id", "centre_id"]
          },
          {
            foreignKeyName: "report_correction_requests_requester_fk"
            columns: [
              "requested_by_membership_id",
              "centre_id",
              "requester_role",
            ]
            isOneToOne: false
            referencedRelation: "centre_memberships"
            referencedColumns: ["id", "centre_id", "role"]
          },
          {
            foreignKeyName: "report_correction_requests_resolver_fk"
            columns: ["resolved_by_membership_id", "centre_id", "resolver_role"]
            isOneToOne: false
            referencedRelation: "centre_memberships"
            referencedColumns: ["id", "centre_id", "role"]
          },
          {
            foreignKeyName: "report_correction_requests_resolving_version_fk"
            columns: ["resolving_version_id", "report_id"]
            isOneToOne: false
            referencedRelation: "report_versions"
            referencedColumns: ["id", "report_id"]
          },
          {
            foreignKeyName: "report_correction_requests_version_fk"
            columns: ["report_version_id", "report_id"]
            isOneToOne: false
            referencedRelation: "report_versions"
            referencedColumns: ["id", "report_id"]
          },
        ]
      }
      report_evidence: {
        Row: {
          byte_size: number
          centre_id: string
          created_at: string
          id: string
          media_type: string
          report_id: string
          storage_object_path: string
          uploaded_by_account_id: string
          uploaded_by_membership_id: string
        }
        Insert: {
          byte_size: number
          centre_id: string
          created_at?: string
          id?: string
          media_type: string
          report_id: string
          storage_object_path: string
          uploaded_by_account_id: string
          uploaded_by_membership_id: string
        }
        Update: {
          byte_size?: number
          centre_id?: string
          created_at?: string
          id?: string
          media_type?: string
          report_id?: string
          storage_object_path?: string
          uploaded_by_account_id?: string
          uploaded_by_membership_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_evidence_account_fk"
            columns: ["uploaded_by_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_evidence_membership_fk"
            columns: ["uploaded_by_membership_id"]
            isOneToOne: false
            referencedRelation: "centre_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_evidence_report_fk"
            columns: ["report_id", "centre_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id", "centre_id"]
          },
        ]
      }
      report_source_map: {
        Row: {
          created_at: string
          id: string
          output_section: string
          report_version_id: string
          source_dimension_code: Database["public"]["Enums"]["dimension_code"]
        }
        Insert: {
          created_at?: string
          id?: string
          output_section: string
          report_version_id: string
          source_dimension_code: Database["public"]["Enums"]["dimension_code"]
        }
        Update: {
          created_at?: string
          id?: string
          output_section?: string
          report_version_id?: string
          source_dimension_code?: Database["public"]["Enums"]["dimension_code"]
        }
        Relationships: [
          {
            foreignKeyName: "report_source_map_version_fk"
            columns: ["report_version_id"]
            isOneToOne: false
            referencedRelation: "report_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      report_version_approvals: {
        Row: {
          approved_at: string
          approved_by_membership_id: string
          approver_role: Database["public"]["Enums"]["centre_membership_role"]
          centre_id: string
          checklist_ai_draft_reviewed: boolean
          checklist_evidence_confirmed: boolean
          checklist_privacy_checked: boolean
          report_id: string
          report_version_id: string
        }
        Insert: {
          approved_at?: string
          approved_by_membership_id: string
          approver_role: Database["public"]["Enums"]["centre_membership_role"]
          centre_id: string
          checklist_ai_draft_reviewed: boolean
          checklist_evidence_confirmed: boolean
          checklist_privacy_checked: boolean
          report_id: string
          report_version_id: string
        }
        Update: {
          approved_at?: string
          approved_by_membership_id?: string
          approver_role?: Database["public"]["Enums"]["centre_membership_role"]
          centre_id?: string
          checklist_ai_draft_reviewed?: boolean
          checklist_evidence_confirmed?: boolean
          checklist_privacy_checked?: boolean
          report_id?: string
          report_version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_version_approvals_approver_fk"
            columns: ["approved_by_membership_id", "centre_id", "approver_role"]
            isOneToOne: false
            referencedRelation: "centre_memberships"
            referencedColumns: ["id", "centre_id", "role"]
          },
          {
            foreignKeyName: "report_version_approvals_version_centre_fk"
            columns: ["report_version_id", "centre_id"]
            isOneToOne: false
            referencedRelation: "report_versions"
            referencedColumns: ["id", "centre_id"]
          },
          {
            foreignKeyName: "report_version_approvals_version_fk"
            columns: ["report_version_id", "report_id"]
            isOneToOne: false
            referencedRelation: "report_versions"
            referencedColumns: ["id", "report_id"]
          },
        ]
      }
      report_version_checklist_progress: {
        Row: {
          ai_draft_reviewed: boolean
          created_at: string
          evidence_confirmed: boolean
          privacy_checked: boolean
          report_id: string
          report_version_id: string
          updated_at: string
        }
        Insert: {
          ai_draft_reviewed?: boolean
          created_at?: string
          evidence_confirmed?: boolean
          privacy_checked?: boolean
          report_id: string
          report_version_id: string
          updated_at?: string
        }
        Update: {
          ai_draft_reviewed?: boolean
          created_at?: string
          evidence_confirmed?: boolean
          privacy_checked?: boolean
          report_id?: string
          report_version_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_version_checklist_progress_version_fk"
            columns: ["report_version_id", "report_id"]
            isOneToOne: true
            referencedRelation: "report_versions"
            referencedColumns: ["id", "report_id"]
          },
        ]
      }
      report_version_ratings: {
        Row: {
          created_at: string
          dimension_code: Database["public"]["Enums"]["dimension_code"]
          id: string
          rating: Database["public"]["Enums"]["competency_rating"]
          report_id: string
          report_version_id: string
        }
        Insert: {
          created_at?: string
          dimension_code: Database["public"]["Enums"]["dimension_code"]
          id?: string
          rating: Database["public"]["Enums"]["competency_rating"]
          report_id: string
          report_version_id: string
        }
        Update: {
          created_at?: string
          dimension_code?: Database["public"]["Enums"]["dimension_code"]
          id?: string
          rating?: Database["public"]["Enums"]["competency_rating"]
          report_id?: string
          report_version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_version_ratings_dimension_fk"
            columns: ["dimension_code"]
            isOneToOne: false
            referencedRelation: "assessment_dimensions"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "report_version_ratings_version_fk"
            columns: ["report_version_id", "report_id"]
            isOneToOne: false
            referencedRelation: "report_versions"
            referencedColumns: ["id", "report_id"]
          },
        ]
      }
      report_versions: {
        Row: {
          areas_for_development: string | null
          authored_by_membership_id: string | null
          authored_by_role:
            | Database["public"]["Enums"]["centre_membership_role"]
            | null
          centre_id: string
          content_hash: string
          content_hash_version: number
          created_at: string
          derived_from_version_id: string | null
          id: string
          overview: string | null
          remarks: string | null
          report_id: string
          revision_number: number
          strengths: string | null
          submitted_at: string | null
          submitted_by_membership_id: string | null
          submitted_by_role:
            | Database["public"]["Enums"]["centre_membership_role"]
            | null
          trainer_approved_source_version_id: string | null
          updated_at: string
        }
        Insert: {
          areas_for_development?: string | null
          authored_by_membership_id?: string | null
          authored_by_role?:
            | Database["public"]["Enums"]["centre_membership_role"]
            | null
          centre_id: string
          content_hash: string
          content_hash_version: number
          created_at?: string
          derived_from_version_id?: string | null
          id?: string
          overview?: string | null
          remarks?: string | null
          report_id: string
          revision_number: number
          strengths?: string | null
          submitted_at?: string | null
          submitted_by_membership_id?: string | null
          submitted_by_role?:
            | Database["public"]["Enums"]["centre_membership_role"]
            | null
          trainer_approved_source_version_id?: string | null
          updated_at?: string
        }
        Update: {
          areas_for_development?: string | null
          authored_by_membership_id?: string | null
          authored_by_role?:
            | Database["public"]["Enums"]["centre_membership_role"]
            | null
          centre_id?: string
          content_hash?: string
          content_hash_version?: number
          created_at?: string
          derived_from_version_id?: string | null
          id?: string
          overview?: string | null
          remarks?: string | null
          report_id?: string
          revision_number?: number
          strengths?: string | null
          submitted_at?: string | null
          submitted_by_membership_id?: string | null
          submitted_by_role?:
            | Database["public"]["Enums"]["centre_membership_role"]
            | null
          trainer_approved_source_version_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_versions_authored_by_fk"
            columns: [
              "authored_by_membership_id",
              "centre_id",
              "authored_by_role",
            ]
            isOneToOne: false
            referencedRelation: "centre_memberships"
            referencedColumns: ["id", "centre_id", "role"]
          },
          {
            foreignKeyName: "report_versions_derived_from_fk"
            columns: ["derived_from_version_id", "report_id"]
            isOneToOne: false
            referencedRelation: "report_versions"
            referencedColumns: ["id", "report_id"]
          },
          {
            foreignKeyName: "report_versions_report_fk"
            columns: ["report_id", "centre_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id", "centre_id"]
          },
          {
            foreignKeyName: "report_versions_submitted_by_fk"
            columns: [
              "submitted_by_membership_id",
              "centre_id",
              "submitted_by_role",
            ]
            isOneToOne: false
            referencedRelation: "centre_memberships"
            referencedColumns: ["id", "centre_id", "role"]
          },
          {
            foreignKeyName: "report_versions_trainer_approved_source_fk"
            columns: ["trainer_approved_source_version_id", "report_id"]
            isOneToOne: false
            referencedRelation: "report_versions"
            referencedColumns: ["id", "report_id"]
          },
        ]
      }
      reports: {
        Row: {
          centre_id: string
          class_module_id: string
          class_session_id: string
          created_at: string
          current_cycle_version_id: string | null
          enrolment_id: string
          id: string
          latest_submitted_version_id: string | null
          lock_version: number
          observation_id: string | null
          status: Database["public"]["Enums"]["report_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          centre_id: string
          class_module_id: string
          class_session_id: string
          created_at?: string
          current_cycle_version_id?: string | null
          enrolment_id: string
          id?: string
          latest_submitted_version_id?: string | null
          lock_version?: number
          observation_id?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          centre_id?: string
          class_module_id?: string
          class_session_id?: string
          created_at?: string
          current_cycle_version_id?: string | null
          enrolment_id?: string
          id?: string
          latest_submitted_version_id?: string | null
          lock_version?: number
          observation_id?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_current_cycle_version_fk"
            columns: ["current_cycle_version_id", "id"]
            isOneToOne: false
            referencedRelation: "report_versions"
            referencedColumns: ["id", "report_id"]
          },
          {
            foreignKeyName: "reports_enrolment_fk"
            columns: ["enrolment_id", "class_module_id", "student_id"]
            isOneToOne: false
            referencedRelation: "enrolments"
            referencedColumns: ["id", "class_module_id", "student_id"]
          },
          {
            foreignKeyName: "reports_latest_submitted_version_fk"
            columns: ["latest_submitted_version_id", "id"]
            isOneToOne: false
            referencedRelation: "report_versions"
            referencedColumns: ["id", "report_id"]
          },
          {
            foreignKeyName: "reports_observation_fk"
            columns: ["observation_id", "class_session_id", "student_id"]
            isOneToOne: false
            referencedRelation: "observations"
            referencedColumns: ["id", "class_session_id", "student_id"]
          },
          {
            foreignKeyName: "reports_session_centre_fk"
            columns: ["class_session_id", "centre_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id", "centre_id"]
          },
          {
            foreignKeyName: "reports_session_module_fk"
            columns: ["class_session_id", "class_module_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id", "class_module_id"]
          },
        ]
      }
      students: {
        Row: {
          centre_id: string
          created_at: string
          date_of_birth: string | null
          deactivated_at: string | null
          full_name: string
          guardian_contact: string | null
          guardian_name: string | null
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          centre_id: string
          created_at?: string
          date_of_birth?: string | null
          deactivated_at?: string | null
          full_name: string
          guardian_contact?: string | null
          guardian_name?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          centre_id?: string
          created_at?: string
          date_of_birth?: string | null
          deactivated_at?: string | null
          full_name?: string
          guardian_contact?: string | null
          guardian_name?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_centre_fk"
            columns: ["centre_id"]
            isOneToOne: false
            referencedRelation: "centres"
            referencedColumns: ["id"]
          },
        ]
      }
      terms: {
        Row: {
          centre_id: string
          created_at: string
          ends_on: string
          id: string
          is_active: boolean
          label: string
          starts_on: string
          updated_at: string
        }
        Insert: {
          centre_id: string
          created_at?: string
          ends_on: string
          id?: string
          is_active?: boolean
          label: string
          starts_on: string
          updated_at?: string
        }
        Update: {
          centre_id?: string
          created_at?: string
          ends_on?: string
          id?: string
          is_active?: boolean
          label?: string
          starts_on?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "terms_centre_id_fkey"
            columns: ["centre_id"]
            isOneToOne: false
            referencedRelation: "centres"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_profiles: {
        Row: {
          centre_id: string
          created_at: string
          membership_id: string
          membership_role: Database["public"]["Enums"]["centre_membership_role"]
          updated_at: string
        }
        Insert: {
          centre_id: string
          created_at?: string
          membership_id: string
          membership_role?: Database["public"]["Enums"]["centre_membership_role"]
          updated_at?: string
        }
        Update: {
          centre_id?: string
          created_at?: string
          membership_id?: string
          membership_role?: Database["public"]["Enums"]["centre_membership_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_profiles_membership_fk"
            columns: ["membership_id", "centre_id", "membership_role"]
            isOneToOne: false
            referencedRelation: "centre_memberships"
            referencedColumns: ["id", "centre_id", "role"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_assign_session_trainer: {
        Args: { p_class_session_id: string; p_trainer_membership_id: string }
        Returns: Record<string, unknown>
      }
      admin_create_class_module: {
        Args: { p_class_grade_id: string; p_title: string }
        Returns: Record<string, unknown>
      }
      admin_create_class_session: {
        Args: {
          p_class_module_id: string
          p_ends_at: string
          p_room: string
          p_session_date: string
          p_starts_at: string
          p_term_id: string
        }
        Returns: Record<string, unknown>
      }
      admin_create_parent: {
        Args: {
          p_display_name: string
          p_email: string
          p_phone: string
          p_student_ids: string[]
        }
        Returns: Record<string, unknown>
      }
      admin_create_student: {
        Args: {
          p_class_module_ids: string[]
          p_date_of_birth: string
          p_first_name: string
          p_guardian_contact: string
          p_guardian_name: string
          p_last_name: string
        }
        Returns: Record<string, unknown>
      }
      admin_create_trainer: {
        Args: { p_display_name: string; p_email: string; p_phone: string }
        Returns: Record<string, unknown>
      }
      admin_update_class_module: {
        Args: {
          p_class_grade_id: string
          p_class_module_id: string
          p_title: string
        }
        Returns: Record<string, unknown>
      }
      admin_update_class_session: {
        Args: {
          p_class_session_id: string
          p_ends_at: string
          p_room: string
          p_session_date: string
          p_starts_at: string
          p_term_id: string
        }
        Returns: Record<string, unknown>
      }
      admin_update_student: {
        Args: {
          p_class_module_ids: string[]
          p_date_of_birth: string
          p_first_name: string
          p_guardian_contact: string
          p_guardian_name: string
          p_last_name: string
          p_student_id: string
        }
        Returns: Record<string, unknown>
      }
      admin_withdraw_student: {
        Args: { p_student_id: string }
        Returns: Record<string, unknown>
      }
      app_current_account_id: { Args: never; Returns: string }
      app_has_active_membership: {
        Args: {
          p_centre_id: string
          p_role: Database["public"]["Enums"]["centre_membership_role"]
        }
        Returns: boolean
      }
      app_is_own_active_membership: {
        Args: {
          p_membership_id: string
          p_role: Database["public"]["Enums"]["centre_membership_role"]
        }
        Returns: boolean
      }
      app_is_own_membership: {
        Args: { p_membership_id: string }
        Returns: boolean
      }
      app_management_may_attach_material: {
        Args: { p_object_name: string }
        Returns: boolean
      }
      app_parent_reaches_student: {
        Args: { p_student_id: string }
        Returns: boolean
      }
      app_trainer_may_attach_evidence: {
        Args: { p_object_name: string }
        Returns: boolean
      }
      app_trainer_reaches_module: {
        Args: { p_module_id: string }
        Returns: boolean
      }
      app_trainer_reaches_session: {
        Args: { p_session_id: string }
        Returns: boolean
      }
      assessment_get_trainer_observation: {
        Args: { p_class_session_id: string; p_student_id: string }
        Returns: {
          dimension_count: number
          focus_chips: string[]
          follow_up_notes: string
          is_complete: boolean
          lock_version: number
          observation_exists: boolean
          observation_id: string
          observation_notes: string
          ratings: Json
          strength_chips: string[]
          term_evidence_notes: string
        }[]
      }
      assessment_save_complete_and_open_report: {
        Args: {
          p_class_session_id: string
          p_expected_lock_version: number
          p_expected_observation_id: string
          p_focus_chips: string[]
          p_follow_up_notes: string
          p_observation_notes: string
          p_ratings: Json
          p_strength_chips: string[]
          p_student_id: string
          p_term_evidence_notes: string
        }
        Returns: Record<string, unknown>
      }
      assessment_save_follow_up_notes: {
        Args: { p_follow_up_notes: string; p_report_id: string }
        Returns: {
          follow_up_notes: string
        }[]
      }
      assessment_save_observation: {
        Args: {
          p_class_session_id: string
          p_expected_lock_version: number
          p_expected_observation_id: string
          p_focus_chips: string[]
          p_follow_up_notes: string
          p_observation_notes: string
          p_ratings: Json
          p_strength_chips: string[]
          p_student_id: string
          p_term_evidence_notes: string
        }
        Returns: Record<string, unknown>
      }
      attendance_set_status: {
        Args: {
          p_class_session_id: string
          p_expected_status: Database["public"]["Enums"]["attendance_status"]
          p_new_status: Database["public"]["Enums"]["attendance_status"]
          p_student_id: string
        }
        Returns: Record<string, unknown>
      }
      audit_action_registry: { Args: never; Returns: string[] }
      audit_append_event: {
        Args: {
          p_action: string
          p_actor_account_id: string
          p_actor_membership_id: string
          p_actor_role: Database["public"]["Enums"]["centre_membership_role"]
          p_centre_id: string
          p_payload: Json
          p_related_targets: Json
          p_state_domain: string
          p_state_from: string
          p_state_to: string
          p_target_id: string
          p_target_label: string
          p_target_type: string
        }
        Returns: Record<string, unknown>
      }
      audit_canonical_json: { Args: { p_value: Json }; Returns: string }
      audit_verify_chain: {
        Args: { p_centre_id?: string; p_from_seq?: number; p_to_seq?: number }
        Returns: {
          anchor_hash: string
          anchor_seq: number
          centre_id: string
          events_checked: number
          failed_check: string
          first_failed_seq: number
          head_checked: boolean
          mode: string
          ok: boolean
        }[]
      }
      class_session_staff_identity: {
        Args: { p_session_id: string }
        Returns: {
          class_session_id: string
          trainer_display_name: string
          trainer_membership_id: string
        }[]
      }
      competency_score: {
        Args: { p_rating: Database["public"]["Enums"]["competency_rating"] }
        Returns: number
      }
      evidence_attach_confirm: {
        Args: { p_evidence_id: string; p_report_id: string }
        Returns: Record<string, unknown>
      }
      evidence_list_for_report: {
        Args: { p_class_session_id: string; p_student_id: string }
        Returns: {
          byte_size: number
          created_at: string
          id: string
          media_type: string
        }[]
      }
      evidence_record_access: {
        Args: { p_evidence_id: string }
        Returns: Record<string, unknown>
      }
      evidence_remove: {
        Args: { p_evidence_id: string }
        Returns: Record<string, unknown>
      }
      material_attach_confirm: {
        Args: {
          p_class_session_id: string
          p_display_name: string
          p_material_id: string
        }
        Returns: boolean
      }
      material_list_for_session: {
        Args: { p_class_session_id: string }
        Returns: {
          o_byte_size: number
          o_created_at: string
          o_display_name: string
          o_material_id: string
          o_media_type: string
        }[]
      }
      material_remove: {
        Args: { p_material_id: string }
        Returns: Record<string, unknown>
      }
      material_signed_path: {
        Args: { p_material_id: string }
        Returns: Record<string, unknown>
      }
      parent_get_child_trainer: {
        Args: { p_student_id: string }
        Returns: {
          trainer_display_name: string
        }[]
      }
      report_cancel_draft: {
        Args: { p_expected_lock_version: number; p_report_id: string }
        Returns: Record<string, unknown>
      }
      report_centre_dashboard_summary: {
        Args: never
        Returns: Record<string, unknown>
      }
      report_class_health_summary: {
        Args: { p_class_module_id: string }
        Returns: {
          evidence_missing: number
          main_follow_up_area: string
          pending_reports: number
          submitted_reports: number
          total_reports: number
        }[]
      }
      report_class_improved_dimension: {
        Args: { p_class_module_id: string }
        Returns: {
          improved_dimension: Database["public"]["Enums"]["dimension_code"]
          sessions_considered: number
        }[]
      }
      report_content_hash_v1: {
        Args: {
          p_next_focus: string
          p_practice_suggestion: string
          p_ratings: Database["public"]["Enums"]["competency_rating"][]
          p_session_takeaway: string
          p_todays_strength: string
        }
        Returns: string
      }
      report_content_hash_v2: {
        Args: {
          p_areas_for_development: string
          p_overview: string
          p_ratings: Database["public"]["Enums"]["competency_rating"][]
          p_remarks: string
          p_strengths: string
        }
        Returns: string
      }
      report_create: {
        Args: {
          p_class_session_id: string
          p_observation_id: string
          p_student_id: string
        }
        Returns: Record<string, unknown>
      }
      report_get_canonical: {
        Args: { p_class_session_id: string; p_student_id: string }
        Returns: {
          areas_for_development: string
          overview: string
          remarks: string
          strengths: string
          submitted_at: string
        }[]
      }
      report_get_canonical_context: {
        Args: { p_class_session_id: string; p_student_id: string }
        Returns: {
          class_grade_label: string
          class_module_title: string
          lesson_number: number
          lesson_title: string
          session_date: string
          student_display_name: string
          trainer_display_name: string
        }[]
      }
      report_get_management_ratings: {
        Args: { p_class_session_id: string; p_student_id: string }
        Returns: {
          dimension_code: Database["public"]["Enums"]["dimension_code"]
          display_name: string
          rating: Database["public"]["Enums"]["competency_rating"]
          sort_order: number
        }[]
      }
      report_get_management_review: {
        Args: { p_class_session_id: string; p_student_id: string }
        Returns: {
          areas_for_development: string
          current_version_id: string
          lock_version: number
          open_correction_issue_scope: Database["public"]["Enums"]["correction_issue_scope"]
          open_correction_status: Database["public"]["Enums"]["correction_request_status"]
          overview: string
          remarks: string
          report_id: string
          status: Database["public"]["Enums"]["report_status"]
          strengths: string
          submitted_at: string
          wording_hash: string
        }[]
      }
      report_get_source_map: {
        Args: { p_report_id: string }
        Returns: {
          output_section: string
          report_version_id: string
          source_dimension_code: Database["public"]["Enums"]["dimension_code"]
        }[]
      }
      report_get_working: {
        Args: { p_class_session_id: string; p_student_id: string }
        Returns: {
          ai_draft_reviewed: boolean
          areas_for_development: string
          content_hash: string
          current_version_id: string
          evidence_confirmed: boolean
          latest_submitted_version_id: string
          lock_version: number
          open_correction_dimension_code: Database["public"]["Enums"]["dimension_code"]
          open_correction_issue_scope: Database["public"]["Enums"]["correction_issue_scope"]
          open_correction_reason: string
          open_correction_request_id: string
          overview: string
          privacy_checked: boolean
          ratings: Json
          remarks: string
          report_id: string
          revision_number: number
          status: Database["public"]["Enums"]["report_status"]
          strengths: string
          submitted_at: string
        }[]
      }
      report_list_management_class_status: {
        Args: { p_class_module_id: string }
        Returns: {
          class_session_id: string
          evidence_count: number
          lesson_number: number
          lesson_title: string
          report_id: string
          report_state: Database["public"]["Enums"]["report_status"]
          session_date: string
          student_display_name: string
          student_id: string
        }[]
      }
      report_list_management_corrections: {
        Args: never
        Returns: {
          class_session_id: string
          correction_reason: string
          correction_request_id: string
          correction_status: Database["public"]["Enums"]["correction_request_status"]
          issue_scope: Database["public"]["Enums"]["correction_issue_scope"]
          report_id: string
          report_status: Database["public"]["Enums"]["report_status"]
          returned_at: string
          session_date: string
          student_display_name: string
          student_id: string
          tracking_updated_at: string
          trainer_correction_submitted: boolean
        }[]
      }
      report_list_management_submitted: {
        Args: never
        Returns: {
          class_session_id: string
          report_id: string
          report_status: Database["public"]["Enums"]["report_status"]
          session_date: string
          student_display_name: string
          student_id: string
          submitted_at: string
        }[]
      }
      report_list_trainer_reports: {
        Args: never
        Returns: {
          class_label: string
          class_session_id: string
          report_id: string
          report_state: Database["public"]["Enums"]["report_status"]
          session_date: string
          student_id: string
          student_name: string
          updated_at: string
        }[]
      }
      report_list_trainer_students: {
        Args: never
        Returns: {
          class_label: string
          class_module_id: string
          last_assessed: string
          student_id: string
          student_name: string
        }[]
      }
      report_management_approve_and_submit: {
        Args: {
          p_expected_lock_version: number
          p_expected_version_id: string
          p_expected_wording_hash: string
          p_report_id: string
        }
        Returns: Record<string, unknown>
      }
      report_management_edit_wording: {
        Args: {
          p_areas_for_development: string
          p_expected_lock_version: number
          p_expected_version_id: string
          p_expected_wording_hash: string
          p_overview: string
          p_remarks: string
          p_report_id: string
          p_strengths: string
        }
        Returns: Record<string, unknown>
      }
      report_management_return_to_trainer: {
        Args: {
          p_dimension_code: Database["public"]["Enums"]["dimension_code"]
          p_expected_lock_version: number
          p_expected_version_id: string
          p_issue_scope: Database["public"]["Enums"]["correction_issue_scope"]
          p_reason: string
          p_report_id: string
        }
        Returns: Record<string, unknown>
      }
      report_management_student_reports: {
        Args: { p_student_id: string }
        Returns: {
          class_label: string
          class_session_id: string
          lesson_title: string
          report_id: string
          report_state: Database["public"]["Enums"]["report_status"]
          session_date: string
          submitted_at: string
          term_label: string
        }[]
      }
      report_management_student_trend: {
        Args: { p_student_id: string }
        Returns: {
          class_session_id: string
          lesson_title: string
          session_date: string
          session_score: number
        }[]
      }
      report_mark_observation_saved: {
        Args: { p_expected_lock_version: number; p_report_id: string }
        Returns: Record<string, unknown>
      }
      report_reopen_submitted: {
        Args: { p_expected_lock_version: number; p_report_id: string }
        Returns: Record<string, unknown>
      }
      report_request_draft: {
        Args: { p_expected_lock_version: number; p_report_id: string }
        Returns: Record<string, unknown>
      }
      report_resolve_context: {
        Args: { p_report_id: string }
        Returns: {
          class_session_id: string
          student_id: string
        }[]
      }
      report_save_edit: {
        Args: {
          p_areas_for_development: string
          p_expected_lock_version: number
          p_expected_status: Database["public"]["Enums"]["report_status"]
          p_expected_version_id: string
          p_overview: string
          p_reaffirm_correction_request_id?: string
          p_remarks: string
          p_report_id: string
          p_strengths: string
        }
        Returns: Record<string, unknown>
      }
      report_store_draft: {
        Args: {
          p_areas_for_development: string
          p_expected_lock_version: number
          p_observation_lock_version: number
          p_overview: string
          p_remarks: string
          p_report_id: string
          p_strengths: string
        }
        Returns: Record<string, unknown>
      }
      report_store_source_map: {
        Args: { p_entries: Json; p_report_version_id: string }
        Returns: number
      }
      report_trainer_approve: {
        Args: {
          p_expected_content_hash: string
          p_expected_lock_version: number
          p_expected_status: Database["public"]["Enums"]["report_status"]
          p_expected_version_id: string
          p_report_id: string
        }
        Returns: Record<string, unknown>
      }
      report_update_checklist: {
        Args: {
          p_ai_draft_reviewed: boolean
          p_evidence_confirmed: boolean
          p_expected_lock_version: number
          p_expected_version_id: string
          p_privacy_checked: boolean
          p_report_id: string
        }
        Returns: Record<string, unknown>
      }
      report_wording_hash_v1: {
        Args: {
          p_next_focus: string
          p_practice_suggestion: string
          p_session_takeaway: string
          p_todays_strength: string
        }
        Returns: string
      }
      report_wording_hash_v2: {
        Args: {
          p_areas_for_development: string
          p_overview: string
          p_remarks: string
          p_strengths: string
        }
        Returns: string
      }
    }
    Enums: {
      account_status: "active" | "deactivated"
      attendance_status: "present" | "absent"
      centre_membership_role: "management" | "trainer" | "parent"
      centre_membership_status: "pending" | "active" | "deactivated"
      class_grade_code: "beginner" | "intermediate" | "advanced"
      competency_rating: "beginning" | "developing" | "mastering" | "mastered"
      correction_issue_scope: "rating" | "observation" | "assessment_fact"
      correction_request_status: "open" | "resolved"
      dimension_code:
        | "body"
        | "emotion"
        | "speech"
        | "tonality"
        | "eye_contact"
        | "vocal_projection"
        | "emotional_expression"
        | "sentence_flow"
        | "audience_awareness"
      dimension_group: "competency" | "speech_linguistics"
      invitation_status: "pending" | "accepted" | "expired" | "revoked"
      report_status:
        | "incomplete"
        | "observation_saved"
        | "drafting"
        | "draft_ready"
        | "needs_edit"
        | "trainer_approved"
        | "approved"
        | "submitted"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_status: ["active", "deactivated"],
      attendance_status: ["present", "absent"],
      centre_membership_role: ["management", "trainer", "parent"],
      centre_membership_status: ["pending", "active", "deactivated"],
      class_grade_code: ["beginner", "intermediate", "advanced"],
      competency_rating: ["beginning", "developing", "mastering", "mastered"],
      correction_issue_scope: ["rating", "observation", "assessment_fact"],
      correction_request_status: ["open", "resolved"],
      dimension_code: [
        "body",
        "emotion",
        "speech",
        "tonality",
        "eye_contact",
        "vocal_projection",
        "emotional_expression",
        "sentence_flow",
        "audience_awareness",
      ],
      dimension_group: ["competency", "speech_linguistics"],
      invitation_status: ["pending", "accepted", "expired", "revoked"],
      report_status: [
        "incomplete",
        "observation_saved",
        "drafting",
        "draft_ready",
        "needs_edit",
        "trainer_approved",
        "approved",
        "submitted",
      ],
    },
  },
} as const

