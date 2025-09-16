import { createClient, SupabaseClient } from '@supabase/supabase-js' 
import { Database } from './database.types'

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

export type { Database } from './database.types'
