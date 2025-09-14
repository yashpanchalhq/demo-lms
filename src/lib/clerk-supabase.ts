'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@clerk/nextjs'


export function useClerkSupabaseClient() {
  const { getToken } = useAuth()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // This function can be called before making Supabase requests
  const getSupabaseClient = async () => {
    // Get the Clerk session token
    const token = await getToken({ template: 'supabase' })
    
    // If we have a token, set it in the Supabase client
    if (token) {
      supabase.auth.setSession({
        access_token: token,
        refresh_token: '',
      })
    }
    
    return supabase
  }
  
  return { getSupabaseClient }
}