import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

export const config = {
  runtime: 'nodejs',};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { email, role = 'viewer', userId } = await req.json();

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Generate secure invite token
    const inviteToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const { data, error } = await supabase
      .from('team_members')
      .insert({
        team_owner_id: userId,
        email,
        role,
        invite_token: inviteToken,
        invite_expires_at: expiresAt.toISOString(),
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    const inviteUrl = `${process.env.VERCEL_URL}/team/accept?token=${inviteToken}`;

    return new Response(
      JSON.stringify({ inviteUrl, expiresAt }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
