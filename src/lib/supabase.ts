import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

console.log('[Supabase] URL chargée :', supabaseUrl ?? '⚠️ UNDEFINED — vérifie .env.local')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
