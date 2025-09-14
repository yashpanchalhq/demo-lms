import { createClient, SupabaseClient } from '@supabase/supabase-js' 

const globalForSupabase = globalThis as unknown as {
  supabase: SupabaseClient<Database> | undefined
}

export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (globalForSupabase.supabase) {
    return globalForSupabase.supabase;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase env vars missing: ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
  }

  globalForSupabase.supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
  return globalForSupabase.supabase
}

// Keep the Database type definition here
export type Database = {
  public: {
    Tables: {
      Course: {
        Row: {
          id: string
          userId: string
          title: string
          description: string | null
          imageUrl: string | null
          price: number | null
          isPublished: boolean
          categoryId: string | null
          createdAt: string
          upgradeAt: string
        }
        Insert: {
          id?: string
          userId: string
          title: string
          description?: string | null
          imageUrl?: string | null
          price?: number | null
          isPublished?: boolean
          categoryId?: string | null
          createdAt?: string
          upgradeAt?: string
        }
        Update: {
          id?: string
          userId?: string
          title?: string
          description?: string | null
          imageUrl?: string | null
          price?: number | null
          isPublished?: boolean
          categoryId?: string | null
          createdAt?: string
          upgradeAt?: string
        }
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
      }
      Attachment: {
        Row: {
          id: string
          name: string
          url: string
          courseId: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          url: string
          courseId?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          url?: string
          courseId?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      Chapter: {
        Row: {
          id: string
          title: string
          description: string
          videoUrl: string | null
          position: number
          isPublished: boolean
          isFree: boolean
          courseId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          videoUrl?: string | null
          position: number
          isPublished?: boolean
          isFree?: boolean
          courseId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          videoUrl?: string | null
          position?: number
          isPublished?: boolean
          isFree?: boolean
          courseId?: string
          createdAt?: string
          updatedAt?: string
        }
      }
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          created_at?: string;
        };
      };
      MuxData: {
        Row: {
          id: string
          assetId: string
          playbackId: string | null
          chapterId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          assetId: string
          playbackId?: string | null
          chapterId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          assetId?: string
          playbackId?: string | null
          chapterId?: string
          createdAt?: string
          updatedAt?: string
        }
      }
      quizzes: {
        Row: {
          id: string;
          title: string;
          description: string;
          course_id: string;
          passing_percent: number;
          attempts_allowed: number;
          duration_sec: number;
          is_active: boolean;
          available_from: string | null;
          available_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          course_id: string;
          passing_percent?: number;
          attempts_allowed?: number;
          duration_sec?: number;
          is_active?: boolean;
          available_from?: string | null;
          available_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          course_id?: string;
          passing_percent?: number;
          attempts_allowed?: number;
          duration_sec?: number;
          is_active?: boolean;
          available_from?: string | null;
          available_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      quiz_questions: {
        Row: {
          id: string;
          quiz_id: string;
          ordering: number;
          type: string;
          question: string;
          choices: string[]; // Assuming JSONB array of strings
          points: number;
          correct: string; // Assuming correct answer is a string
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          ordering: number;
          type: string;
          question: string;
          choices: string[];
          points: number;
          correct: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          ordering?: number;
          type?: string;
          question?: string;
          choices?: string[];
          points?: number;
          correct?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      quiz_attempts: {
        Row: {
          id: string;
          quiz_id: string;
          user_id: string;
          score: number;
          finished_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          user_id: string;
          score?: number;
          finished_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          user_id?: string;
          score?: number;
          finished_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      UserProgress: {
        Row: {
          id: string
          userId: string
          chapterId: string
          isCompleted: boolean
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          userId: string
          chapterId: string
          isCompleted?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          userId?: string
          chapterId?: string
          isCompleted?: boolean
          createdAt?: string
          updatedAt?: string
        }
      }
      User: {
        Row: {
          id: string
          clerkId: string
          email: string
          role: 'ADMIN' | 'TEACHER'
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          clerkId: string
          email: string
          role?: 'ADMIN' | 'TEACHER'
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          clerkId?: string
          email?: string
          role?: 'ADMIN' | 'TEACHER'
          createdAt?: string
          updatedAt?: string
        }
      },
      Module: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string
          content_type: 'video' | 'document' | 'quiz'
          content_url: string | null
          order_index: number
          is_required: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description: string
          content_type: 'video' | 'document' | 'quiz'
          content_url?: string | null
          order_index: number
          is_required?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string
          content_type?: 'video' | 'document' | 'quiz'
          content_url?: string | null
          order_index?: number
          is_required?: boolean
          updated_at?: string
        }
      }
    }
  }
}
