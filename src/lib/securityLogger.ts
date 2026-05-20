import { supabase } from './supabase'

export type SecurityAction =
  | 'login_success'
  | 'login_failed'
  | 'login_blocked'
  | 'register_success'
  | 'ticket_scan'
  | 'ticket_purchase'
  | 'event_created'
  | 'password_changed'
  | 'session_expired'

export async function logSecurityEvent(
  action: SecurityAction,
  userId?: string | null,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from('security_logs').insert({
      user_id: userId ?? null,
      action,
      details: details ?? null,
    })
  } catch {
    // Non-blocking — a logging failure must never crash the app
  }
}
