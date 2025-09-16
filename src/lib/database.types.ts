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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ActivityLog: {
        Row: {
          action: string
          createdAt: string
          details: Json | null
          id: string
          userId: string
        }
        Insert: {
          action: string
          createdAt?: string
          details?: Json | null
          id?: string
          userId: string
        }
        Update: {
          action?: string
          createdAt?: string
          details?: Json | null
          id?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "ActivityLog_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      AdminAudit: {
        Row: {
          action: string
          adminId: string
          createdAt: string
          id: string
          meta: Json | null
        }
        Insert: {
          action: string
          adminId: string
          createdAt?: string
          id?: string
          meta?: Json | null
        }
        Update: {
          action?: string
          adminId?: string
          createdAt?: string
          id?: string
          meta?: Json | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          attachment_url: string | null
          body: string
          course_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          teacher_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          attachment_url?: string | null
          body: string
          course_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          teacher_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          attachment_url?: string | null
          body?: string
          course_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          teacher_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      Attachment: {
        Row: {
          courseId: string | null
          createdAt: string
          id: string
          name: string
          updatedAt: string
          url: string
        }
        Insert: {
          courseId?: string | null
          createdAt?: string
          id?: string
          name: string
          updatedAt?: string
          url: string
        }
        Update: {
          courseId?: string | null
          createdAt?: string
          id?: string
          name?: string
          updatedAt?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "Attachment_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
        ]
      }
      Category: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      Certificate: {
        Row: {
          certificateUrl: string | null
          courseId: string
          id: string
          issuedAt: string
          issuedby: string | null
          status: string | null
          userId: string
        }
        Insert: {
          certificateUrl?: string | null
          courseId: string
          id?: string
          issuedAt?: string
          issuedby?: string | null
          status?: string | null
          userId: string
        }
        Update: {
          certificateUrl?: string | null
          courseId?: string
          id?: string
          issuedAt?: string
          issuedby?: string | null
          status?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Certificate_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Certificate_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          course_id: string | null
          created_at: string | null
          file_url: string | null
          id: string
          issued_at: string | null
          issued_by: string | null
          user_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          user_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      Chapter: {
        Row: {
          courseId: string
          createdAt: string
          description: string | null
          id: string
          isFree: boolean
          isPublished: boolean
          position: number
          title: string
          updatedAt: string
          videoUrl: string | null
        }
        Insert: {
          courseId: string
          createdAt?: string
          description?: string | null
          id?: string
          isFree?: boolean
          isPublished?: boolean
          position: number
          title: string
          updatedAt?: string
          videoUrl?: string | null
        }
        Update: {
          courseId?: string
          createdAt?: string
          description?: string | null
          id?: string
          isFree?: boolean
          isPublished?: boolean
          position?: number
          title?: string
          updatedAt?: string
          videoUrl?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Chapter_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
        ]
      }
      Course: {
        Row: {
          categoryId: string | null
          createdAt: string
          description: string | null
          id: string
          imageUrl: string | null
          isPublished: boolean
          price: number | null
          title: string
          updatedAt: string
          userId: string
        }
        Insert: {
          categoryId?: string | null
          createdAt?: string
          description?: string | null
          id?: string
          imageUrl?: string | null
          isPublished?: boolean
          price?: number | null
          title: string
          updatedAt?: string
          userId: string
        }
        Update: {
          categoryId?: string | null
          createdAt?: string
          description?: string | null
          id?: string
          imageUrl?: string | null
          isPublished?: boolean
          price?: number | null
          title?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Course_categoryId_fkey"
            columns: ["categoryId"]
            isOneToOne: false
            referencedRelation: "Category"
            referencedColumns: ["id"]
          },
        ]
      }
      course_course_backup: {
        Row: {
          categoryId: string | null
          createdAt: string | null
          description: string | null
          id: string | null
          imageUrl: string | null
          isPublished: boolean | null
          price: number | null
          title: string | null
          updatedAt: string | null
          userId: string | null
        }
        Insert: {
          categoryId?: string | null
          createdAt?: string | null
          description?: string | null
          id?: string | null
          imageUrl?: string | null
          isPublished?: boolean | null
          price?: number | null
          title?: string | null
          updatedAt?: string | null
          userId?: string | null
        }
        Update: {
          categoryId?: string | null
          createdAt?: string | null
          description?: string | null
          id?: string | null
          imageUrl?: string | null
          isPublished?: boolean | null
          price?: number | null
          title?: string | null
          updatedAt?: string | null
          userId?: string | null
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          course_id: string
          enrolled_at: string | null
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string | null
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string | null
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_course_enrollments_course_id"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          categoryId: string | null
          created_at: string | null
          description: string | null
          id: string
          imageUrl: string | null
          isPublished: boolean | null
          title: string
          updated_at: string | null
          userId: string | null
        }
        Insert: {
          categoryId?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          imageUrl?: string | null
          isPublished?: boolean | null
          title: string
          updated_at?: string | null
          userId?: string | null
        }
        Update: {
          categoryId?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          imageUrl?: string | null
          isPublished?: boolean | null
          title?: string
          updated_at?: string | null
          userId?: string | null
        }
        Relationships: []
      }
      courses_backup: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          title?: string | null
        }
        Relationships: []
      }
      Enrollment: {
        Row: {
          courseId: string
          createdAt: string
          id: string
          status: string
          updatedAt: string
          userId: string
        }
        Insert: {
          courseId: string
          createdAt?: string
          id?: string
          status?: string
          updatedAt?: string
          userId: string
        }
        Update: {
          courseId?: string
          createdAt?: string
          id?: string
          status?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Enrollment_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Enrollment_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: string | null
          created_at: string | null
          enrolled_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          enrolled_at?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          enrolled_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_enrollments_course_id_to_course_table"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
        ]
      }
      Module: {
        Row: {
          content_type: Database["public"]["Enums"]["content_type"]
          content_url: string | null
          course_id: string
          created_at: string
          description: string
          id: string
          is_required: boolean
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          content_type: Database["public"]["Enums"]["content_type"]
          content_url?: string | null
          course_id: string
          created_at?: string
          description: string
          id?: string
          is_required?: boolean
          order_index: number
          title: string
          updated_at?: string
        }
        Update: {
          content_type?: Database["public"]["Enums"]["content_type"]
          content_url?: string | null
          course_id?: string
          created_at?: string
          description?: string
          id?: string
          is_required?: boolean
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Module_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
        ]
      }
      MuxData: {
        Row: {
          assetId: string
          chapterId: string
          createdAt: string
          id: string
          playbackId: string | null
          updatedAt: string
        }
        Insert: {
          assetId: string
          chapterId: string
          createdAt?: string
          id?: string
          playbackId?: string | null
          updatedAt?: string
        }
        Update: {
          assetId?: string
          chapterId?: string
          createdAt?: string
          id?: string
          playbackId?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "MuxData_chapterId_fkey"
            columns: ["chapterId"]
            isOneToOne: true
            referencedRelation: "Chapter"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          answers: Json
          correct_count: number
          created_at: string | null
          finished_at: string | null
          id: string
          quiz_id: string | null
          score: number
          started_at: string | null
          time_taken_sec: number | null
          total_questions: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answers: Json
          correct_count: number
          created_at?: string | null
          finished_at?: string | null
          id?: string
          quiz_id?: string | null
          score: number
          started_at?: string | null
          time_taken_sec?: number | null
          total_questions: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answers?: Json
          correct_count?: number
          created_at?: string | null
          finished_at?: string | null
          id?: string
          quiz_id?: string | null
          score?: number
          started_at?: string | null
          time_taken_sec?: number | null
          total_questions?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          choices: Json
          correct: string
          id: string
          ordering: number | null
          points: number | null
          question: string
          quiz_id: string | null
          type: string | null
        }
        Insert: {
          choices: Json
          correct: string
          id?: string
          ordering?: number | null
          points?: number | null
          question: string
          quiz_id?: string | null
          type?: string | null
        }
        Update: {
          choices?: Json
          correct?: string
          id?: string
          ordering?: number | null
          points?: number | null
          question?: string
          quiz_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          attempts_allowed: number | null
          available_from: string | null
          available_to: string | null
          course_id: string
          created_at: string | null
          description: string | null
          duration_sec: number | null
          id: string
          is_active: boolean | null
          passing_percent: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          attempts_allowed?: number | null
          available_from?: string | null
          available_to?: string | null
          course_id: string
          created_at?: string | null
          description?: string | null
          duration_sec?: number | null
          id?: string
          is_active?: boolean | null
          passing_percent?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          attempts_allowed?: number | null
          available_from?: string | null
          available_to?: string | null
          course_id?: string
          created_at?: string | null
          description?: string | null
          duration_sec?: number | null
          id?: string
          is_active?: boolean | null
          passing_percent?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      Settings: {
        Row: {
          config: Json
          createdAt: string
          id: string
          updatedAt: string
        }
        Insert: {
          config?: Json
          createdAt?: string
          id?: string
          updatedAt?: string
        }
        Update: {
          config?: Json
          createdAt?: string
          id?: string
          updatedAt?: string
        }
        Relationships: []
      }
      SupportTicket: {
        Row: {
          adminId: string
          attachments: Json | null
          category: string
          createdAt: string
          description: string | null
          id: string
          severity: string
          status: string
          title: string
          updatedAt: string
        }
        Insert: {
          adminId: string
          attachments?: Json | null
          category: string
          createdAt?: string
          description?: string | null
          id?: string
          severity: string
          status?: string
          title: string
          updatedAt?: string
        }
        Update: {
          adminId?: string
          attachments?: Json | null
          category?: string
          createdAt?: string
          description?: string | null
          id?: string
          severity?: string
          status?: string
          title?: string
          updatedAt?: string
        }
        Relationships: []
      }
      teacher_schedules: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          location: string | null
          mode: string | null
          start_time: string
          teacher_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          mode?: string | null
          start_time: string
          teacher_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          mode?: string | null
          start_time?: string
          teacher_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_schedules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          clerkId: string
          createdAt: string
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updatedAt: string
        }
        Insert: {
          clerkId: string
          createdAt?: string
          email: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updatedAt?: string
        }
        Update: {
          clerkId?: string
          createdAt?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updatedAt?: string
        }
        Relationships: []
      }
      UserProgress: {
        Row: {
          chapterId: string
          createdAt: string
          id: string
          isCompleted: boolean
          updatedAt: string
          userId: string
        }
        Insert: {
          chapterId: string
          createdAt?: string
          id?: string
          isCompleted?: boolean
          updatedAt?: string
          userId: string
        }
        Update: {
          chapterId?: string
          createdAt?: string
          id?: string
          isCompleted?: boolean
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "UserProgress_chapterId_fkey"
            columns: ["chapterId"]
            isOneToOne: false
            referencedRelation: "Chapter"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_views: {
        Row: {
          id: string;
          announcement_id: string;
          user_id: string;
          viewed_at: string | null;
        }
        Insert: {
          id?: string;
          announcement_id: string;
          user_id: string;
          viewed_at?: string | null;
        }
        Update: {
          id?: string;
          announcement_id?: string;
          user_id?: string;
          viewed_at?: string | null;
        }
        Relationships: [
          {
            foreignKeyName: "fk_announcement";
            columns: ["announcement_id"];
            isOneToOne: false;
            referencedRelation: "announcements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_user";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "User";
            referencedColumns: ["clerkId"];
          }
        ];
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      content_type: "video" | "document" | "quiz"
      user_role: "ADMIN" | "TEACHER"
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
    Enums: {
      content_type: ["video", "document", "quiz"],
      user_role: ["ADMIN", "TEACHER"],
    },
  },
} as const
