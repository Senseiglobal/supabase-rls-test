// Notification utility for email + in-app notifications
import { createClient } from '@supabase/supabase-js';

export async function sendInAppNotification(userId: string, message: string) {
  // TODO: Use Supabase Realtime to send notification
}

export async function sendEmailNotification(email: string, subject: string, body: string) {
  // TODO: Use Vercel Edge Function or third-party email API
}
